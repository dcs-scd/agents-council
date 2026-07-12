# Council CLI (v2 Session-Targeted MCP)

## Overview

`agents-council` ships a local CLI named `council` with dual-mode behavior:
- desktop mode by default (`council` with no command),
- MCP stdio mode via `council mcp`.

The MCP adapter only forwards requests; business logic lives in the core service.

## Install

Local development:

```bash
bun install
```

Global install (if published):

```bash
npm install -g agents-council
```

## Build

```bash
bun run build
```

This produces a local binary at `dist/council`.

Build stable Electrobun desktop artifacts for the current host:

```bash
bun run desktop:build:stable
```

This produces an `artifacts/` folder with files prefixed `stable-<platform>-<arch>-...`.

## Packaging model

- Root package: `agents-council` (single user-facing npm package).
- Optional platform packages:
  - `agents-council-linux-x64`
  - `agents-council-linux-arm64`
  - `agents-council-darwin-x64`
  - `agents-council-darwin-arm64`
  - `agents-council-windows-x64`

Each optional package contains:

- `council` / `council.exe` CLI binary for terminal usage.
- `desktop-artifacts/*` Electrobun installer/update artifacts for that platform.

Install-sanity in release CI validates published package behavior for:

- `council --version`
- `council --help`
- `council mcp` startup on stdio

## Run

Desktop-default launch:

```bash
./dist/council
```

Explicit MCP mode:

```bash
./dist/council mcp
```

Optional default agent name:

```bash
./dist/council mcp --agent-name agent-a
```

`council chat` remains available as a compatibility alias and launches desktop mode:

```bash
./dist/council chat
```

Help and version flags are also supported without starting the server:

```bash
./dist/council --help
./dist/council --version
```

### One-shot model council (`council solve`)

`council solve` runs the multi-agent model council once and prints the peer-ratified
consensus. The prompt comes from **either** the argv prompt **or** `--file` (exactly
one — supplying both, or neither, is an error):

```bash
./dist/council solve "Decide the best architecture for ..."   # inline prompt
./dist/council solve --file /path/to/brief.md                 # prompt from a file
```

- `--file <path>` reads the prompt from a file, bypassing the ~128 KB argv limit
  (so large briefs run without a separate driver).
- `--members <a,b,c>` sets the roster for this run and **overrides**
  `AGENTS_COUNCIL_MEMBERS`; it uses the same validation as the env path.
- `--json` prints the full structured result instead of the markdown answer.

On start, `solve` prints one banner line to **stderr** — the resolved roster, the
engine version, the max deliberation rounds, and the deliberations directory actually
resolved — before the run begins:

```
council solve: roster=claude,chatgpt,gemini version=0.4.0 maxRounds=6 deliberations=/…/deliberations
```

Exit code: a `blocked` outcome exits non-zero; `ratified` / `not_attempted` exit 0.
Deliberation transcripts are written to the resolved deliberations dir (see
`AGENTS_COUNCIL_DELIBERATIONS_DIR` below).

### Desktop UI

The MCP tools are meant for AI agent clients (Claude/Codex/Gemini/etc). The desktop UI is the human-facing
interface for participating in the same local council session.

The previous Bun.serve-backed web chat startup path is no longer the primary runtime path for UI launch.

The UI contract follows the Council Hall redesign:

- `CouncilSidebar`: session chronicle, active session selection, spawn action, archive section
- `CouncilHall`: session header, voice stream, composer, and summon entry
- `Summon modal`: agent selection and optional model overrides

Selections for summon agent/model persist between runs.

For implementation guidance, use:

- `docs/ui-spec.md` as the canonical UI specification
- `docs/ui-implementation-progress.md` as the parity tracker

## Writing a good `council solve` prompt

Council answer quality is bottlenecked by the prompt's **scope** and the **context you embed** — not by the members' sandbox reach. Members run read-only, **network disabled**, cwd'd into this repo, and they routinely decline to crawl. "Give it more file access" does **not** fix an under-scoped prompt; only the author can pull the two levers below. (The system prompt now also makes members challenge the scope they were handed — but they can only reason over context you gave them.)

Before launching `council solve`, check:

1. **Scope to the layer where the answer lives.** Describe the subject by research *intent* and *data scale*, not by current runtime hot-paths. A question framed around hot-paths pre-decides a "no fit" verdict when the real fit is in an offline/analytics/learned-harness layer the framing never named.
2. **Do not pre-pin a dominant variable.** If you foreground one gate (hardware, cost, scale, feasibility) as decisive, members treat everything else as a rounding error and skip investigation. Present such gates as inputs to weigh per sub-case, and ask the council to test whether the gate actually decides the outcome.
3. **Pre-fetch and embed external facts.** Members cannot reach the network. Any URL, blog post, PyPI version, or upstream source the verdict depends on must be pasted into the prompt verbatim (use `ctx_fetch_and_index` then embed). Mark second-hand facts as unverified so members flag them.
4. **Load intent, not just bytes.** The high-value fit usually lives in *what you are trying to build*, which a repo crawl cannot surface. State the research program, the downstream decision, and the alternative framings explicitly.

A worked post-mortem of these failure modes lives in the user memory note `feedback_council_prompt_scoping_dominates`.

## Tools (v2)

The MCP server exposes six tools:

- `start_council` (starts a new session and records the council request)
- `join_council` (joins a specific session via `session_id` and returns request + responses)
- `get_current_session_data` (returns data for a specific `session_id`, optionally from a cursor)
- `close_council` (closes a specific `session_id` with a conclusion)
- `send_response` (adds a response to a specific `session_id`)
- `summon_agent` (summons a Claude or Codex agent into the active council)

`summon_agent` inputs:
- `agent` (required, enum)
- `model` (optional override)

If `agent` is omitted by the caller, the last used agent is selected when available; otherwise the
alphabetical default is used. When `model` is omitted, the saved settings are used.

Codex model defaults come from `~/.codex/config.toml` (`model = "..."`) unless you override the model in the summon call.

`start_council` expects `request` and returns a new `session_id`. In v2, starting a council does **not**
reset prior sessions; multiple sessions are retained and can be targeted explicitly.

`join_council` requires `session_id` and `agent_name` unless the server was started with `--agent-name/-n`.
The server may append a suffix (`#1`, `#2`, ...) if the name is already in use in that session; reuse the
returned `agent_name` on subsequent calls.

`get_current_session_data`, `send_response`, and `close_council` require `session_id`.

When `--agent-name/-n` is set, tool inputs omit `agent_name` and the server reuses the default for all calls.
Without it, the resolved name from `start_council`/`join_council` is stored in memory for subsequent calls.

## Migration notes (implicit -> session-targeted)

From v2 onward, callers must provide `session_id` when operating on an existing session:

- `join_council`: now requires `session_id`
- `get_current_session_data`: now requires `session_id`
- `send_response`: now requires `session_id`
- `close_council`: now requires `session_id`

Migration flow:

1. Call `start_council` and store returned `session_id`.
2. Pass that `session_id` in all subsequent join/get/send/close calls for that conversation.
3. Update error handling to expect explicit target errors:
   - missing `session_id`
   - `Session not found.`
   - `Council session is closed.` / `Council session is already closed.`

## Initialization instructions

On initialization, the server returns an `instructions` string that summarizes how to use the tools:
- If you need feedback from other AI agents, start a council with `start_council`.
- If you are requested to join the council, call `join_council` with `session_id`, read the request, and `send_response` with the same `session_id` as soon as possible.
- Use `get_current_session_data` with `session_id` to poll for new responses; pass the cursor returned to fetch only newer messages.
- Use `close_council` with `session_id` to end that session with a conclusion.

## Response format

Use `--format` (or `-f`) with `markdown|json` on `council mcp` (default: `markdown`). Markdown responses are
plain text for agents:

- `start_council`:
  - `Your request is received. Return anon for replies, and look again in a few seconds.`
  - `Your assigned name is: <agent_name>`
- `join_council`:
  - `Welcome to this council session <agent_name>.`
  - `Session: <session_id>`
  - `We are gathered to weigh a matter set forth by <author_name>.`
  - `Request:`
  - `<request>`
  - `---`
  - `What say you, and with haste?`
- `get_current_session_data` (active session):
  - `Session: <session_id>`
  - `The council was convened by <created_by>.`
  - `Request: <request>`
  - `---`
  - `Messages (from <cursor or "start">):`
  - (blank line)
  - Response blocks:
    - `<author>`
    - `Response: <content>`
    - separated by `---`
  - `No further replies are heard for now. Return anon for more.`
  - `To hear only new replies, use the cursor: <cursor>`
- `get_current_session_data` (closed session):
  - `Session: <session_id>`
  - `The council was convened by <created_by>.`
  - `Request: <request>`
  - `---`
  - `The council is ended, spoken by <name>.`
  - `Conclusion: <conclusion>`
- `close_council`:
  - `The council is ended, and the matter is sealed.`
  - `Session: <session_id>`
- `send_response`:
  - `Your reply is set down.`
  - `Your assigned name is: <agent_name>`
  - `Session: <session_id>`

## Compatibility

This project does not maintain backwards compatibility. Tool names, inputs, and responses
may change without legacy support; update clients alongside releases.

## Validation

Manual MCP Inspector matrix (stdio + shared state):

```bash
# terminal A (create session A)
npx -y @modelcontextprotocol/inspector --cli ./dist/council mcp --agent-name agent-a --method tools/call \
  --tool-name start_council --tool-arg request="Need feedback from the council." \
  --transport stdio
```

```bash
# terminal A (create session B)
npx -y @modelcontextprotocol/inspector --cli ./dist/council mcp --agent-name agent-a --method tools/call \
  --tool-name start_council --tool-arg request="Need second council thread." \
  --transport stdio
```

Capture `session_id` values from both start responses and use them below.

```bash
# terminal B (join explicit target A)
npx -y @modelcontextprotocol/inspector --cli ./dist/council mcp --agent-name agent-b --method tools/call \
  --tool-name join_council --tool-arg session_id=<session_a_id> --transport stdio
```

```bash
# terminal B (poll session A boundary)
npx -y @modelcontextprotocol/inspector --cli ./dist/council mcp --agent-name agent-b --method tools/call \
  --tool-name get_current_session_data --tool-arg session_id=<session_a_id> --tool-arg cursor=<response_id> \
  --transport stdio
```

```bash
# terminal C (send to session B)
npx -y @modelcontextprotocol/inspector --cli ./dist/council mcp --agent-name agent-b --method tools/call \
  --tool-name send_response --tool-arg session_id=<session_b_id> --tool-arg content="Looks good." --transport stdio
```

```bash
# terminal A (close session A)
npx -y @modelcontextprotocol/inspector --cli ./dist/council mcp --agent-name agent-a --method tools/call \
  --tool-name close_council --tool-arg session_id=<session_a_id> --tool-arg conclusion="Consensus reached." --transport stdio
```

```bash
# terminal B (read closed session A)
npx -y @modelcontextprotocol/inspector --cli ./dist/council mcp --agent-name agent-b --method tools/call \
  --tool-name get_current_session_data --tool-arg session_id=<session_a_id> --transport stdio
```

```bash
# terminal B (closed-session mutation rejection)
npx -y @modelcontextprotocol/inspector --cli ./dist/council mcp --agent-name agent-b --method tools/call \
  --tool-name send_response --tool-arg session_id=<session_a_id> --tool-arg content="Late reply" \
  --transport stdio
```

```bash
# terminal B (missing session_id validation)
npx -y @modelcontextprotocol/inspector --cli ./dist/council mcp --agent-name agent-b --method tools/call \
  --tool-name get_current_session_data \
  --transport stdio
```

```bash
# terminal B (invalid session_id validation)
npx -y @modelcontextprotocol/inspector --cli ./dist/council mcp --agent-name agent-b --method tools/call \
  --tool-name join_council --tool-arg session_id=missing-session \
  --transport stdio
```

If you want to validate the lockfile behavior, run the terminal B/C commands in parallel and
confirm `~/.agents-council/state.json` stays valid JSON and `state.json.lock` is cleaned up.

MCP Inspector UI smoke test:

```bash
npx -y @modelcontextprotocol/inspector --transport stdio -- ./dist/council mcp
```

1. Open the UI URL printed by the Inspector.
2. Connect (stdio), click "List Tools", then run `start_council` with any inputs (include `agent_name` unless you started the server with `--agent-name/-n`).

## Architecture

Core vs MCP adapter split:

- `src/core/services/council`: domain logic and types
- `src/core/state`: persistence (lockfile + atomic writes)
- `src/interfaces/mcp`: DTOs, mappings, and MCP tool wiring

The MCP layer only translates DTOs and forwards calls to the core service.

## State

State is stored at:

```
~/.agents-council/state.json
```

Summon settings are stored alongside state at:

```
~/.agents-council/config.json
```

The config persists the last used agent plus model selections.

Override with:

```
AGENTS_COUNCIL_STATE_PATH=/path/to/state.json
```

The config path uses the same directory as the resolved state path.

Council deliberation transcripts (`council solve`) default to the project-local
`deliberations/` folder. Override the location with:

```
AGENTS_COUNCIL_DELIBERATIONS_DIR=/path/to/deliberations
```

Pinning this to an absolute path makes the transcript land there regardless of the
process cwd — the recommended setting for backgrounded runs (a detached run whose cwd
differs would otherwise fail to write the cwd-relative default).

Summon prerequisites:

- Claude: install Claude Code and run `claude` once to authenticate.
- Codex: run `codex login` once (recommended; authentication is handled by the Codex SDK/CLI); optionally set a default model in `~/.codex/config.toml`. If your Codex setup uses API keys, it will still work.

Codex CLI path (optional):

- Set the Codex CLI path in the Settings UI to use a custom executable.
- Or set `CODEX_PATH` to override the bundled Codex CLI path.

Enable summon debug logging (writes `summon-debug.log` in the current working directory):

```
AGENTS_COUNCIL_SUMMON_DEBUG=1
```

## Structured deliberation subsystem (Claim-Ledger Delphi)

The model council ships an optional **structured deliberation path** layered onto the
existing text-based council in `src/core/services/modelCouncil.ts`. It adds typed claims,
provenance checks, dissent and trace artifacts, and an observational issue map — without
changing the live convergence controller. Everything below is **additive and opt-in**; with
the flag off the council behaves exactly as it did before.

### Opt-in flag — `AGENTS_COUNCIL_STRUCTURED`

- **Default: OFF.** When `AGENTS_COUNCIL_STRUCTURED` is unset (or not truthy), the council
  runs the legacy text-parse path. The flag-off path is **byte-for-byte legacy**: it never
  imports the Zod schema module, writes no new artifacts, and produces the same prompts,
  parses, and outputs as before. This is a single implementation — there is no parallel
  `delphiCouncil.ts` fork; the structured logic is flag-gated branches inside
  `runModelCouncil` / `saveModelCouncilRun`.
- **Set the flag to enable** the typed schemas, the provenance/source-ID preconditions, the
  trace file, and the issue-map file.

### Typed claim schema and text fallback

Under the flag, member proposals and ratifications are validated against Zod schemas defined
in `src/core/services/council/schemas.ts`:

- `Claim { id, text, provenance, evidence: string[], severity? }`, plus `IndependentProposal`,
  `DeliberationResponse`, and `RatificationVote`.
- `provenance` is a **frozen enum**: `repo_fact | source_claim | assumption`.
- JSON mode is requested where the provider supports it. **On a Zod parse failure the council
  falls back to the existing text parsers** and increments a per-run parse-fail counter
  (surfaced via `getParseFailStats()`), so an unparseable structured payload degrades to legacy
  behavior rather than failing the run.

Zod is bundled into the compiled `dist/council` binary even though it is a `devDependency`
(verified by parsing from the compiled binary with `node_modules/zod` removed).

### Provenance / Level-1 source-ID block precondition

When structured, before ratification the council runs **pure, deterministic** claim-ledger
preconditions (no LLM, no sandbox, no network). A tripped check raises a single absolute
`FACTUAL_ERROR` block via the existing veto machinery — it does **not** introduce a new veto
kind and does **not** weaken any veto's absoluteness. The checks:

1. **`SOURCE_ID_MISMATCH` (Level-1 source-ID, the real Wave-B deliverable):** a `repo_fact`
   claim whose cited evidence-pack id is **absent from (or empty against) the supplied evidence
   pack** is blocked. This is the deterministic source-ID precondition described in Addendum
   A.3.3.
2. **`UNLABELED_CLAIM`:** a factual claim with no provenance label.
3. **`ASSUMPTION_NO_VERIFICATION`:** an `assumption` with no stated cheapest verification.

Blocks enter only the `ratifications` array; they are **never** fed to the convergence
controller (`isConverged`).

**Wave-B heuristic boundaries (FYI — to revisit at the Wave-C entry gate):**

- `UNLABELED_CLAIM` is effectively unreachable through the live applier, because `ClaimSchema`
  requires `provenance`; a literally unlabeled claim makes the structured parse fail and falls
  back to legacy. The check fires only when the pure function is invoked with loosely-typed
  claims. End-to-end "unverifiable repo claim" coverage is therefore carried by the
  `SOURCE_ID_MISMATCH` check (a `repo_fact` with absent/empty evidence).
- `ASSUMPTION_NO_VERIFICATION` currently fires for **every** `assumption`, because `ClaimSchema`
  carries no `cheapest_verification` field for an assumption to populate. Net behavior is
  conservative (all assumptions block). Closing this B1↔B2 contract gap means adding a field to
  the frozen schema and is deferred.

### Evidence-pack input

`runModelCouncil` accepts an optional `evidencePack: { id, text, source }[]` argument. When
supplied, the pack is **prepended to the round-0 proposal system messages** so members can cite
entries by `[id]`; the `SOURCE_ID_MISMATCH` check above validates `repo_fact` citations against
these ids. This is **plumbing only** — evidence-pack generation is out of scope. When no pack is
supplied the proposal prompts are **byte-identical to legacy**.

### Odd-roster default

The flag-off default roster is now an **odd, heterogeneous** panel:
`DEFAULT_MEMBER_IDS = ["claude", "chatgpt", "gemini"]` (n=3, three distinct providers —
Anthropic / OpenAI-codex / Google — all locally-credentialed CLI providers, so a default run
needs no OpenRouter or vendor API key and config validation never throws). This is a
**config-only** change with no protocol, router, or convergence-code change.

The explicit `AGENTS_COUNCIL_MEMBERS` override is unchanged: it is a comma-separated list of
member ids that resolves to **exactly** those members. A two-id override (e.g.
`AGENTS_COUNCIL_MEMBERS="claude,chatgpt"`) yields the cheap **n=2 draft** roster; the odd≥3
default applies only when the override is unset.

### Minority-report artifact

The consensus result carries an optional `minorityReport[]` of `MinorityReportEntry`
(`{ member, blockKind, absolute, dissent }`), populated from the non-accepted ratifications
**only on a `blocked` outcome** (including a claim-ledger `FACTUAL_ERROR` precondition block,
which is itself a blocking ratification). `formatModelCouncilMarkdown` renders a
`## Minority Report` section on `blocked` only; `ratified` and `not_attempted` carry no report
and render no section. The `council solve` CLI sets a **non-zero exit code** on a `blocked`
outcome (exit 0 on `ratified` / `not_attempted`).

### Structured trace artifact

Under the flag, `saveModelCouncilRun` writes a `trace-{ts}.json` file
(`agents-council.council_trace.v1`) alongside the existing `council-{ts}.json/.md`. Its
top-level shape mirrors the external consumer contract in
`~/.claude/halo_x_tools/council_to_brief.py` (`prompt`, `members{id,name,provider,model}`,
`consensus{reached,ratifiedBy,blockedBy}`, `converged`, `rounds{index,changed,memberAgreement}`,
`candidateConsensus`), plus an additive per-claim / per-member / per-round `claims[]`. **Member
weights are equal** — every member carries `weight === 1`; the trace never weights by prestige.
A real generated trace parses cleanly through `council_to_brief.py` in both `--format json` and
`--format brief`.

### Observational issue map (controls nothing)

Under the flag, `saveModelCouncilRun` also writes an `issue-map-{ts}.json` file
(`agents-council.issue_map.v1`), built by `src/core/services/council/issueMap.ts`. It is a
**deterministic, normalized exact-match** clustering of the schema-validated claims into an
**agreed** (asserted by >1 distinct member) / **contested** (lone member) partition — no
embeddings, no LLM mediator. The issue map is an **instrument**, not a controller: it is
computed after the result exists, is **never** read by `isConverged` or ratification, and
changes nothing about the council's outcome (controller-isolation proven structurally and by
value). The only live convergence controller remains the F3 self-reported `CONSENSUS_STATUS`
(with draft-overlap fallback).

### Top-level outcome enum is frozen

The top-level consensus outcome enum stays **frozen** at
`not_attempted | ratified | blocked`. The minority report is an **additional field**, not a new
outcome. `qualified_consensus` is **deferred and nested-only** — it is not added to the
top-level enum.

### New environment variables

| Variable | Effect |
|---|---|
| `AGENTS_COUNCIL_STRUCTURED` | Opt-in (default OFF) for the entire structured path above: typed schemas, provenance/source-ID preconditions, `trace-{ts}.json`, and `issue-map-{ts}.json`. Flag-off is byte-for-byte legacy. |
| `AGENTS_COUNCIL_MEMBERS` | Comma-separated member-id list that overrides the odd≥3 default roster, resolving to exactly those members (e.g. a two-id list yields the cheap n=2 draft). |
| `AGENTS_COUNCIL_MEMBER_TIMEOUT_MS` | Per-member call timeout (ms, default `300000`, floor `50`) governing **every** provider path — the SDK/CLI members (Claude/Codex/Gemini) that previously had none, and the curl-based HTTP members. On timeout the member is dropped (see degradation below). |
| `AGENTS_COUNCIL_OPENROUTER_TIMEOUT_MS` | Legacy alias for the member timeout, still honored. Precedence: `AGENTS_COUNCIL_MEMBER_TIMEOUT_MS` > `AGENTS_COUNCIL_OPENROUTER_TIMEOUT_MS` > default. |
| `AGENTS_COUNCIL_DROP_OVERSIZED` | When `1`/`true`, a member whose round-0 brief is estimated over its context budget is dropped **pre-spend** (recorded as a drop) instead of only warned about. Advisory-only by default. |
| `AGENTS_COUNCIL_CONTEXT_TOKENS_<ID>` | Per-member context budget (tokens) for the brief-size precheck, where `<ID>` is the uppercased member id (e.g. `AGENTS_COUNCIL_CONTEXT_TOKENS_KIMI`). Falls back to a deliberately conservative built-in default per member. |
| `AGENTS_COUNCIL_PERF_LOG` | When set, emits a per-call `PERF …` line to stderr. Subsumed by the always-recorded cost/latency ledger (below); the flag still controls the stderr echo. |

### Graduation gate (Wave C)

The structured path is currently **advisory** — it adds artifacts and preconditions but does
not control convergence. It graduates from advisory to **controlling** (issue-map-as-controller,
claim-ledger convergence, a Level-2 source-check verifier) only after clearing the Wave-C entry
gate, which requires **both**:

1. a structured-output **parse-fail rate < 5% over ≥ 50 sample runs**, and
2. the structured council **beats self-consistency** on the benchmark distribution.

On failure, the issue map is downgraded to audit-only, the F3 self-report and the provenance
label gate are kept, and graduation stops. Wave C is recorded as deferred work in
`docs/implementation/council-claim-ledger-delphi/work-units.md` and is **not** part of the
shipped Wave A+B build.

## Resilience and run economics

`runModelCouncil` is hardened against the failure modes that historically lost a
whole run's completed work (a member timing out, hitting a content policy, or the
provider CLI exiting non-zero). These behaviors are always on and independent of
`AGENTS_COUNCIL_STRUCTURED`.

### Per-member timeouts (every provider)

Every member call is bounded by `AGENTS_COUNCIL_MEMBER_TIMEOUT_MS` (default 300s,
legacy alias `AGENTS_COUNCIL_OPENROUTER_TIMEOUT_MS`). The HTTP members keep timing
out through the curl shim's `--max-time`; the SDK/CLI members — which previously had
**no** timeout — are wrapped in an `AbortController`/`Promise.race` guard that
cancels the in-flight SDK call (Claude `abortController`, Codex `signal`) or kills
the subprocess (Gemini CLI), so a timed-out call can never keep the process alive.
A timeout error names the member, provider, and elapsed budget.

### Member-drop degradation with survivor quorum

Each phase runs over the surviving roster with `Promise.allSettled`. When a member
fails terminally (after the provider's own retries/timeout):

- **≥2 survivors** — the member is dropped for the rest of the run and the council
  continues. The result carries `degraded: true` and a `droppedMembers[]` of
  `{ id, phase, round, reason }`. Ratification unanimity is computed over survivors
  only, and if the chair (`members[0]`) drops, chair duties fall to the next
  survivor.
- **<2 survivors** — the run fails (with the enriched failure record below).

The saved Markdown shows a **Dropped Members** table with the phase and reason.

### Never lose completed work

- The failure record (`council-failed-{ts}.json/.md`) persists every completed
  proposal, deliberation round, and partial ratification available at failure time,
  not just `{prompt, error, members}`.
- As the run progresses, each completed member call (and each drop) is appended as
  one JSON line to `deliberations/council-{ts}.partial.jsonl` — crash/kill
  insurance. The file is removed on successful completion; on failure it is left in
  place and `saveModelCouncilFailure` reconstructs the completed work from the newest
  such checkpoint (then consumes it).

### Cost/latency ledger

Every successful provider call records a `ledger[]` row
(`{ member, provider, phase, round, wallMs, promptChars, responseChars, usage }`,
usage tokens where the API reports them, else null) plus aggregate `ledgerTotals`
on the result JSON, and a short totals table in the saved Markdown. Pure
observation — no control flow reads the ledger. `AGENTS_COUNCIL_PERF_LOG` still
echoes the per-call `PERF …` line to stderr.

### Brief-size precheck (advisory)

Before round 0, each member's proposal brief is estimated (chars/4) against a
per-member context budget (`AGENTS_COUNCIL_CONTEXT_TOKENS_<ID>`, else a conservative
built-in default). An over-budget estimate emits a loud stderr warning naming the
member; it drops the seat pre-spend only under `AGENTS_COUNCIL_DROP_OVERSIZED=1`
(recorded via the degradation machinery). It never hard-fails the run on an
estimate alone.

## SDK Requirement

The MCP adapter uses the TypeScript SDK v1.x (`@modelcontextprotocol/sdk`).
