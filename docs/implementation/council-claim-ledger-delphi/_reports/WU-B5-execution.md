# WU-B5 — Structured trace logging (no learner) — execution

- **plan_id:** council-claim-ledger-delphi
- **unit:** WU-B5 (taxonomy: runtime) · **state:** done @ 2026-06-09
- **gate(s):** gate_regression (contributing; stays `planned`)
- **depends_on:** WU-B1 (done) · **co-executed with:** WU-B6 (one `saveModelCouncilRun` edit)

## Change

Under `AGENTS_COUNCIL_STRUCTURED` only, `saveModelCouncilRun`
(`src/core/services/modelCouncil.ts`) now writes a structured trace file
`trace-{ts}.json` alongside the existing `council-{ts}.json/.md`.

### Symbols + line ranges (`src/core/services/modelCouncil.ts`)

- `saveModelCouncilRun` (~L629–L671): after the two legacy writes, a single
  `if (isStructuredCouncilEnabled())` branch (shared with WU-B6) extracts
  schema-validated claims and writes `trace-{ts}.json`.
- `extractStructuredClaims(result)` (new, ~L700): parses every round's proposals
  via the WU-B1 guarded dynamic `import("./council/schemas")`
  (`parseStructuredOrFallback` + `DeliberationResponseSchema`); a member that
  emitted legacy text (no `claims`) contributes nothing (best-effort Wave B,
  never throws). Returns `StructuredClaim[]` `{round, member, claimId, text,
  provenance, evidence}` in (round, member, claim) input order.
- `buildStructuredTrace(result, claims)` (new, ~L735): assembles the trace object.

### Trace schema (`agents-council.council_trace.v1`)

Top-level mirrors the **consumer contract** in
`~/.claude/halo_x_tools/council_to_brief.py`
(`extract_skeleton_json`, `_REQUIRED_TOP_KEYS = prompt, members, consensus,
converged, rounds`; `_REQUIRED_CONSENSUS_KEYS = reached, ratifiedBy, blockedBy`):

- `prompt` (string)
- `members: (ModelCouncilMember & {weight:1})[]` — the parser projects
  `{id,name,provider,model}`; `result.members` is the full member objects so all
  four are present. **`weight === 1` for every member — equal member weights,
  never by prestige (WU-B5 invariant).**
- `rounds: {index, changed, memberAgreement}[]` — exactly the fields
  `council_to_brief._round_trajectory` reads.
- `consensus: ModelCouncilConsensus` — carries `reached/ratifiedBy/blockedBy`
  (+ outcome/notRatifiedReason), matching `_REQUIRED_CONSENSUS_KEYS`.
- `converged` (bool), `candidateConsensus` (the parser's `finalConsensus` source).
- **`claims: StructuredClaim[]`** — additive per-claim/per-member/per-round detail
  (the B5 deliverable proper); ignored by the parser, consumed by audit tooling.

### Grounding against `council_to_brief.py`

Read the parser in full. The existing `council-{ts}.json` already *is* the
serialized `ModelCouncilResult`, which the parser consumes; the trace reuses the
same skeleton field shape so the external consumer parses a trace file
identically. **Evidence:** a real generated trace was fed through
`council_to_brief.py --format json` (PASS: `schema=council-verdict-skeleton/v1`,
members=2, ratifiedBy recovered, converged=true, rounds=1) **and**
`--format brief` (PASS: brief renders). This is the consumer parse-smoke the
brief required.

## Flag-gating (INV-2)

Flag OFF: the trace write lives entirely inside the `isStructuredCouncilEnabled()`
branch; with the flag off `saveModelCouncilRun` returns after the two legacy
writes only — **no `trace-*.json`, no `issue-map-*.json`, no schema-module
import**. Test `flag OFF: writes NO trace file` asserts byte-for-byte: only
`council-*.json` + `council-*.md` exist.

## Tests (`src/core/services/modelCouncil.trace.test.ts`, 4/4 pass)

1. `flag ON: writes trace-{ts}.json matching the council_to_brief.py contract` —
   asserts all required top keys + consensus keys + `members{id,name,provider,model}`
   + `rounds{index,changed,memberAgreement}`.
2. `flag ON: equal member weights — every member carries weight 1` — `[1,1]`.
3. `flag ON: per-claim / per-member / per-round detail is present` — 3 claims
   (2 claude + 1 codex), each with round/member/claimId/text/provenance/evidence.
4. `flag OFF: writes NO trace file (INV-2)` — no trace, no issue-map; legacy
   council-{ts}.json/.md still present.

Output is redirected to a temp dir via `AGENTS_COUNCIL_DELIBERATIONS_DIR`.

## Validation

- `bun run typecheck` — clean.
- `bun test src/core/services/` — 95/95 (was 85; +4 trace +6 issueMap).
- `bun run format:check` — touched files clean; only baseline reds remain
  (`harness/run_tier5_scheduling_council.ts`, `harness/model_council_result_r5.json`,
  `council_runs/*.json` — byte-identical to HEAD, untouched).

## Invariants

- **INV-2** — flag-off writes exactly the legacy artifacts (tested).
- **INV-8** — suite green, typecheck + format clean.
- Member weighting, the `council-{ts}.json/.md` schema, and the legacy flag-off
  output are unchanged (non-goals respected; no learner/weighting).
