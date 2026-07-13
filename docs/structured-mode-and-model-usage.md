# Structured mode and how it changes the use of models

**Status as of 2026-07-13.** Two fix rounds landed on `feat/council-consensus-hardening`:
`95a9e52` (claim-ledger findings, schema parity) and `a535f65` (two-channel fusion).
`AGENTS_COUNCIL_STRUCTURED` **remains off by default** and promotion is parked.

This document is the deep-dive companion to [`council.md`](./council.md). It covers what was
broken, what the fixes change about **how member models are prompted, read, and trusted**, and
gives worked examples for every path a real reply can take.

---

## 1. The one-paragraph version

Under `AGENTS_COUNCIL_STRUCTURED=1`, every member is asked to state its position **twice**: once
in the legacy prose markers (`CONSENSUS: BLOCK`, `MATERIAL_DISAGREEMENTS: …`) and once in a fenced
` ```json ` payload. The prompt is explicit that the JSON is *additive* — "the marker sections
above remain required." The engine then **read only the JSON and threw the prose away.** That
turned a model's sloppiest channel into its authoritative one. A member could veto in prose and
accept in its fence, and the council would record the accept. Both seams are now **fused
fail-safe**: the stricter channel wins, and a disagreement between channels is treated as evidence
that the reply is internally inconsistent, not as a puzzle about which field to believe.

The second, larger lesson is about measurement. The promotion gate for structured mode was a
**parse-failure rate < 5%**. We now have direct evidence that this number is not a property of the
protocol, the roster, or even the model — it moved from **0% to 37.5% because of a one-line prompt
edit**, and it can read 0% on a run whose verdict is wrong. It is a build tripwire, not a gate.

---

## 2. What was actually broken

Five defects, all in the flag-gated structured path, none of which could fire with the flag off.
All were invisible to the 2026-07-12 smoke test because a trivial brief produces no claims.

| # | Defect | Blast radius | Fixed in |
|---|---|---|---|
| 1 | The engine synthesized `BLOCK` / `FACTUAL_ERROR` ratifications **attributed to members** when a claim-ledger precondition tripped | Forged votes; outcome flips to `blocked` | `95a9e52` |
| 2 | `ASSUMPTION_NO_VERIFICATION` was **unwinnable** — the schema had no `cheapestVerification` field, so zod stripped it before the check ran | Every honest `assumption` label killed the council (via #1) | `95a9e52` |
| 3 | `ClaimSchema.evidence` was **required** but the prompt describes it as repo_fact-only | Whole-payload rejection; parse rate became noise | `95a9e52` |
| 4 | `parseRatificationVoteStructured` took the payload's `decision` **wholesale** | **Absolute vetoes silently erased** | `a535f65` |
| 5 | `parseConsensusSignalStructured` took the payload's `consensusStatus` wholesale | Deliberation early-stops on a false `converged` | `a535f65` |

### 2.1 The live specimen for #1 and #2

`deliberations/council-2026-07-13T12-59-24-668Z.json` — a real 2-member run:

```json
{
  "outcome": "blocked",
  "ratifiedBy": [],
  "acceptedWithEditsBy": ["Opus 4.8", "ChatGPT 5.5"],
  "blockedBy":           ["Opus 4.8", "ChatGPT 5.5"],
  "notRatifiedReason": "unrepairable veto: FACTUAL_ERROR (raised by Opus 4.8)"
}
```

Both members appear in **both** lists. Neither cast a block: the `ratifications` array shows each
member voting `block/FACTUAL_ERROR` (synthesized) *and* `accept_with_edits` (real). The synthetic
dissent reads:

```
CONSENSUS: BLOCK
BLOCK_KIND: FACTUAL_ERROR
Claim-ledger precondition(s) failed: ASSUMPTION_NO_VERIFICATION: an assumption was emitted with
no stated cheapest_verification; ASSUMPTION_NO_VERIFICATION: an assumption was emitted with no
stated cheapest_verification; ASSUMPTION_NO_VERIFICATION: ... (×7)
```

The council was destroyed by members **correctly labeling their assumptions as assumptions.** The
exit code was 1. No fold ran.

### 2.2 Defect #4, the severe one

The prompt asks for both channels. The wrappers honored only one:

```ts
// BEFORE (a535f65^)
onOutcome?.("ok");
return { ...structured, raw: content };   // <- the prose markers are never read
```

So this reply — a real veto — was recorded as an **accept**:

````text
I cannot ratify this. The benchmark cited in §3 does not exist; I checked the repo.

CONSENSUS: BLOCK
BLOCK_KIND: FACTUAL_ERROR

```json
{ "decision": "accept" }
```
````

`FACTUAL_ERROR` is an **absolute** veto kind — it is not repairable and it stops the council. The
engine took `accept`. The human reading the transcript sees the veto; the machine records assent.
Worse, `structuredLive.test.ts:131` **pinned this exact case and asserted `accept`** — the wrong
contract was enshrined in a passing test, which is why it survived review.

---

## 3. The finding that matters most: the parse rate is not a property of anything stable

This is the part that should change how you *use* models here, and it corrects an earlier claim of
mine ("Opus omits `evidence`; ChatGPT emits `[]`" — presented as a stable per-model trait). It is
not stable. Here are the two live runs, same brief, same roster, same flag:

| Run | Prompt version | Opus deliberation payloads | ChatGPT deliberation payloads | Overall |
|---|---|---|---|---|
| `12-59-24` | **without** `cheapestVerification` | **3 ok / 0 fail** | 3 ok / 0 fail | 0% fail |
| `13-43-58` | **with** `cheapestVerification` | **0 ok / 3 fail** | 3 ok / 0 fail | 37.5% fail |

Opus's payloads went from parsing perfectly to failing completely. The claim shapes explain why:

```
===== 12:59 (old prompt) =====
 r1 Opus: claims=9  missing-evidence=0   prov=[source_claim, assumption ×8]
 r2 Opus: claims=8  missing-evidence=0
 r3 Opus: claims=11 missing-evidence=0

===== 13:43 (new prompt) =====
 r1 Opus: claims=10 missing-evidence=7   (= exactly the 7 assumption claims)
 r2 Opus: claims=12 missing-evidence=8   (= exactly the 8 assumption claims)
 r3 Opus: claims=16 missing-evidence=12  (= exactly the 12 assumption claims)
```

In the second run Opus omitted `evidence` on **exactly the `assumption` claims and nothing else**,
in all three rounds. That is not sloppiness; it is a systematic reading of the contract.

**The only delta between the two prompts** is the key I added to fix defect #2:

```
"cheapestVerification": "<REQUIRED for an assumption: the cheapest way to verify it;
                         omit for other provenance>"
```

The word **"omit"** entered the schema description for the first time — and the model generalized
the omission pattern to a *different* field (`evidence`) on the *same* claim type. Then
`z.array()` rejected the whole payload, and the parse rate collapsed.

> **Confidence: moderate.** One run per condition; sampling variance is not excluded. What is
> *not* in doubt (high confidence) is the consequence: a one-line prompt edit intended to fix an
> unrelated defect moved the parse-fail rate from 0% to 37.5% for one seat. Whatever the exact
> mechanism, **a number that behaves like that cannot be a promotion criterion.**

### 3.1 Why this kills the `< 5%` gate

Two independent reasons, and they compound:

1. **A good rate can hide a wrong verdict.** The council convened to judge this criterion produced
   the counterexample from its own round 3: a schema-valid payload asserting `"consensusStatus":
   "converged", "materialDisagreements": []` while the same member's prose argued the opposite.
   That is **0% parse failure on a wrong answer.** Parse success measures transport liveness, not
   semantic correctness.
2. **Fixing the rate made the engine *less* safe.** Before the schema fix, 37.5% of payloads fell
   back to the **legacy prose parse** — which is the *safe* channel. Raising the parse rate means
   the engine trusts model-authored JSON more often. Pre-fusion, parse-rate and safety moved in
   **opposite directions**.

---

## 4. How this changes the use of models

### 4.1 You may now seat prose-strong / JSON-weak models without penalty

This is the biggest practical change. Before fusion, the structured path systematically
**advantaged JSON-fluent models and discarded the reasoning of prose-fluent ones.** A model that
argues carefully in prose and emits the fence as an afterthought — which describes Opus's observed
behavior precisely (9–16 claims of prose-grounded reasoning per round, with a fence appended) — was
exactly the seat most likely to have its vote misread.

After fusion:

- A veto stated in prose **cannot** be erased by a careless fence.
- A disagreement raised in prose **cannot** be erased by `"materialDisagreements": []`.
- The fence can still *add* precision (a `requiredEdits` string, a `blockKind`) that the markers
  left implicit — that is what it is genuinely good for.

**Practical consequence:** roster choice is no longer entangled with JSON-serialization skill. Seat
models for their reasoning, not their formatting.

### 4.2 A prompt edit is a protocol change — re-measure after every one

The `cheapestVerification` episode is the rule, not the exception. Serialization behavior is
**prompt-coupled and model-specific**. Any edit to `STRUCTURED_DELIBERATION_INSTRUCTION` or
`STRUCTURED_RATIFICATION_INSTRUCTION` can silently flip a seat's field-emission behavior.

After **any** prompt change, re-derive parse stats from saved transcripts (§5.6 — free, offline).
Do not assume the last run's rate carries over.

### 4.3 Never seat a single model and trust the outcome

Enforced: a roster of `< 2` throws unless `AGENTS_COUNCIL_ALLOW_SOLO=1`, and a solo run is stamped
`solo: true` in the result so it is never mistaken for a real consensus. A council of one
self-ratifies; that is not evidence of anything.

### 4.4 Cost discipline: evaluate by replay, never by convening

A single 2-member, 3-round run, measured from the live ledger (`13-43-58`):

```json
{ "calls": 11, "wallMs": 1364401, "promptTokens": 1166323,
  "completionTokens": 104714, "totalTokens": 1271037 }
```

**1.27M tokens, 22.7 minutes, 11 paid calls** — for two members. You cannot buy a statistically
meaningful sample of structured-mode behavior at that price; the `< 5%` criterion nominally wants
**≥ 50 runs**, i.e. ~64M tokens. Every question that *can* be answered by replaying saved payloads
against the real schemas **must** be (§5.6). That is how defect #3's fix was verified without a
third live convene.

### 4.5 Model-specific operational facts

| Seat | Default model | Provider | Notes |
|---|---|---|---|
| `claude` | `claude-opus-4-8` | local `claude` CLI | Chairs the synthesis / fold (`members[0]`). Prose-heavy; emits many claims. |
| `chatgpt` | `gpt-5.5` (reasoning effort `xhigh`) | local `codex` CLI | Tight, compliant JSON in both observed runs. |
| `kimi` | Kimi K2.6 | OpenRouter (or Moonshot direct) | **~258 s per reasoning call** — raise `AGENTS_COUNCIL_MEMBER_TIMEOUT_MS`. |
| `deepseek` | DeepSeek V4 Pro | OpenRouter (or DeepSeek direct) | Same timeout caveat. |
| `gemini` | `gemini-3.5-flash` | `gemini` CLI | Needs `gemini auth login`. |

---

## 5. Usage

### 5.1 Preflight (free — spends nothing)

Always validate seats before a paid convene.

```bash
bash ~/.claude/skills/run-council2/run_council.sh check two
bash ~/.claude/skills/run-council2/run_council.sh check full   # also checks OPENROUTER_API_KEY + gemini CLI
```

### 5.2 Convene

```bash
# Default two-member (pins claude,chatgpt explicitly — never trusts the engine default)
bash ~/.claude/skills/run-council2/run_council.sh two "Decide the storage engine for X, given ..."

# Long brief: --file goes straight through to the CLI and never touches argv (no 128 KB limit)
bash ~/.claude/skills/run-council2/run_council.sh two --file /path/to/brief.md

# Full five-member roster
bash ~/.claude/skills/run-council2/run_council.sh full --file /path/to/brief.md
```

Direct CLI (the wrapper is preferred — it owns cwd, the stale-dist guard, and the env-pinned
deliberations dir):

```bash
./dist/council solve --members claude,chatgpt --file brief.md
./dist/council solve --members claude,chatgpt --json "Which runtime?" > result.json
./dist/council selftest        # proves zod is bundled into the compiled binary
```

### 5.3 Reading the outcome — the exit code is not enough

**Exit-code contract:** `blocked` → **1**. `ratified`, `ratified_with_edits`, `not_attempted` → **0**.
A zero exit does **not** mean unanimous ratification.

```bash
LATEST=deliberations/council-2026-07-13T13-43-58-486Z.json

jq '.consensus | {outcome, ratifiedBy, acceptedWithEditsBy, blockedBy}' "$LATEST"
```

```json
{
  "outcome": "ratified_with_edits",
  "ratifiedBy": ["ChatGPT 5.5"],
  "acceptedWithEditsBy": ["Opus 4.8"],
  "blockedBy": []
}
```

The four outcomes:

| `outcome` | Meaning | Exit |
|---|---|---|
| `ratified` | Every member cast a clean `ACCEPT`. | 0 |
| `ratified_with_edits` | Converged with only edit-requests, no veto. The chair folds the edits **once**; the fold is never re-ratified. | 0 |
| `blocked` | ≥ 1 **absolute** veto **cast by a member** (`FACTUAL_ERROR` / `MATERIAL_DISAGREEMENT`). | 1 |
| `not_attempted` | Convergence never detected, so ratification never ran. Common on prose/generative tasks — **read each member's final `CONSENSUS:` line**, do not trust the outcome alone. | 0 |

Invariants you can now rely on (all test-pinned):

- A member in `acceptedWithEditsBy` is **never** also in `blockedBy`.
- `blockedBy` and `minorityReport` are **BLOCK-only** — every entry is a vote a member actually cast.
- Claim-ledger preconditions **never** appear in any vote tally and **cannot** change the outcome
  or the exit code.

### 5.4 Structured mode: what appears in the result

Only under the flag; all fields are absent flag-off, so legacy result JSON is unchanged.

```bash
jq '.structuredParseStats' "$LATEST"
```

```json
[
  { "member": "ChatGPT 5.5", "phase": "deliberation",  "ok": 3, "fail": 0, "absent": 0 },
  { "member": "Opus 4.8",    "phase": "deliberation",  "ok": 0, "fail": 3, "absent": 0 },
  { "member": "ChatGPT 5.5", "phase": "ratification",  "ok": 1, "fail": 0, "absent": 0 },
  { "member": "Opus 4.8",    "phase": "ratification",  "ok": 1, "fail": 0, "absent": 0 }
]
```

Read this **per member**, never in aggregate. The aggregate (5 ok / 3 fail = 37.5%) hides the real
signal: one seat at 100% failure, one at 0%. `absent` means the member ignored the fence entirely —
that is protocol noncompliance, not a parse failure, and it is tracked separately because it
degrades **safely** to the prose path.

```bash
jq '.preconditionFindings' "$LATEST"     # null here — nothing fired post-fix
```

```json
[ { "member": "Opus 4.8",
    "kinds": ["ASSUMPTION_NO_VERIFICATION"],
    "detail": "ASSUMPTION_NO_VERIFICATION: an assumption was emitted with no stated cheapest_verification" } ]
```

Findings are **evidence hygiene, reported to a human**. They carry no `vote` and no `accepted`
field — structurally they cannot enter the tally. Identical violations collapse to one line
(the pre-fix run emitted the same sentence seven times for one member).

### 5.5 Fusion — worked examples

This is the new contract. `severity: block > accept_with_edits > accept`.

**Ratification.** Both channels present → the **stricter** wins; the other backfills omitted detail.

| Prose markers | Fenced payload | Fused vote | Why |
|---|---|---|---|
| `CONSENSUS: BLOCK`<br>`BLOCK_KIND: FACTUAL_ERROR` | `{"decision":"accept"}` | **`block` / `FACTUAL_ERROR`** | The veto survives. *(This is the case the old code got wrong.)* |
| `CONSENSUS: ACCEPT` | `{"decision":"block","blockKind":"MATERIAL_DISAGREEMENT"}` | **`block` / `MATERIAL_DISAGREEMENT`** | Symmetric — the fence can raise a veto the prose omitted. |
| `CONSENSUS: ACCEPT_WITH_EDITS` | `{"decision":"accept_with_edits","requiredEdits":"cite the benchmark"}` | **`accept_with_edits`** + edits | Channels agree; the fence *adds* precision. |
| `CONSENSUS: ACCEPT_WITH_EDITS` | `{"decision":"accept"}` | **`accept_with_edits`** | Prose is stricter. |
| *(no `CONSENSUS:` marker)* | `{"decision":"accept"}` | **`accept`** | A silent prose channel is **absence of evidence, not a veto** — see below. |
| `CONSENSUS: ACCEPT` | `{not json` | **`accept`** (stat: `fail`) | Fence unusable → legacy parse, unchanged. |
| `CONSENSUS: ACCEPT` | *(no fence)* | **`accept`** (stat: `absent`) | Graceful degradation to legacy. |

> **The trap that shaped the design.** The legacy parser maps a **markerless** reply to a
> `PROTOCOL` block — the right fail-safe when prose is the only channel. Naively fusing "strictest
> always wins" would therefore manufacture a false veto against every member who answered cleanly
> in JSON and skipped the marker line — resurrecting the exact false-veto pathology Lane A was
> built to remove. So fusion fires **only when an explicit `CONSENSUS:` marker is present**. A
> JSON-only reply fuses to exactly the JSON.

**Convergence.** `diverged` is absorbing; a disagreement in **either** channel suppresses
convergence; `converged` survives only when nothing contradicts it.

| Prose markers | Fenced payload | Fused signal | Converged? |
|---|---|---|---|
| `CONSENSUS_STATUS: CONVERGED`<br>`MATERIAL_DISAGREEMENTS: NONE` | `"converged"`, `[]` | `converged`, none | ✅ |
| `CONSENSUS_STATUS: CONVERGED`<br>`MATERIAL_DISAGREEMENTS: the benchmark is unsound` | `"converged"`, `[]` | **disagreements present** | ❌ *(the live specimen)* |
| `CONSENSUS_STATUS: DIVERGED` | `"converged"` | **`diverged`** | ❌ |
| `CONSENSUS_STATUS: CONVERGED` | `"diverged"`, `["runtime"]` | **`diverged`** | ❌ |
| *(no markers)* | `"converged"`, `[]` | `converged` | ✅ *(payload-only, unchanged)* |

Distinct disagreements from both channels are **unioned**; identical ones collapse.

Note the asymmetry in consequence: a bad *convergence* signal only truncates deliberation
(ratification still runs on any non-empty candidate, post-F2), whereas a bad *vote* inverts the
verdict. That is why the vote seam was the urgent one.

### 5.6 Offline replay — the only affordable evaluation loop

Validate saved payloads against the real schemas. No API calls, deterministic, free.

```js
// scratch/replay.mjs — run: bun scratch/replay.mjs deliberations/council-<ts>.json
import { readFileSync } from "node:fs";
import { DeliberationResponseSchema } from "./src/core/services/council/schemas.ts";

const lastFence = (s) => [...s.matchAll(/```json\s*([\s\S]*?)```/g)].map((m) => m[1]).at(-1);
const run = JSON.parse(readFileSync(process.argv[2], "utf8"));

for (const round of run.rounds ?? []) {
  for (const p of round.proposals ?? []) {
    const fence = lastFence(p.content);
    if (!fence) { console.log(`r${round.index} ${p.member.name}: ABSENT`); continue; }
    const parsed = DeliberationResponseSchema.safeParse(JSON.parse(fence));
    console.log(
      `r${round.index} ${p.member.name}: ${parsed.success ? "OK" : "FAIL"}`,
      parsed.success ? "" : parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "),
    );
  }
}
```

This is exactly how defect #3's fix was proven (the six real payloads from `13-43-58` validate 6/6
against the fixed schema, so that run's true rate is 0%) **without** a ~1.3M-token re-convene.

### 5.7 Environment reference

| Variable | Effect |
|---|---|
| `AGENTS_COUNCIL_STRUCTURED` | **Off by default.** On → additive JSON payloads, claim-ledger findings, parse stats, fusion. Off → prompts and behavior byte-for-byte legacy (snapshot-pinned by test). |
| `AGENTS_COUNCIL_MEMBERS` | Roster, e.g. `claude,chatgpt`. Overridden per-run by `--members`. |
| `AGENTS_COUNCIL_ALLOW_SOLO` | Waive the ≥ 2 quorum. Without it, a 1-member roster **throws**. |
| `AGENTS_COUNCIL_MEMBER_TIMEOUT_MS` | Per-call timeout, default 300000. Raise for kimi/deepseek (~258 s/call). `AGENTS_COUNCIL_OPENROUTER_TIMEOUT_MS` is a legacy alias. |
| `AGENTS_COUNCIL_MAX_ROUNDS` | Deliberation round cap (default 6). |
| `AGENTS_COUNCIL_DELIBERATIONS_DIR` | Absolute transcript dir. The wrapper pins this, which is why backgrounding is safe. |
| `AGENTS_COUNCIL_DROP_OVERSIZED` | Pre-spend drop of members whose context can't hold the brief. |
| `AGENTS_COUNCIL_DIRECT_VENDOR_KEYS` | Route kimi/deepseek to Moonshot/DeepSeek directly instead of OpenRouter. |
| `AGENTS_COUNCIL_{CLAUDE,CHATGPT,KIMI,DEEPSEEK,GEMINI}_MODEL` | Per-seat model override. |

---

## 6. Rules and traps

- **Do not flip `AGENTS_COUNCIL_STRUCTURED` on by default** because the parse rate looks good. §3.
- **Do not read the aggregate parse rate.** Read it per member, per phase. §5.4.
- **Do not trust a parse rate across a prompt change.** Re-measure. §4.2.
- **Do not "fix" the four `format:check` failures** under `council_runs/` and `harness/` — baseline dirt.
- **Do not delete anything in `deliberations/`.** The two 2026-07-13 transcripts are the evidence
  base for everything in this document.
- **A structured run also writes `issue-map-*.json` and trace files into `deliberations/`**, so
  `ls -t deliberations/*.json | head -1` no longer reliably yields the council transcript. Take the
  path from the CLI's stderr `Saved deliberation record to …` line.
- **Pre-2026-07-12 transcripts** predate the `ratified_with_edits` outcome and show the legacy
  AWE-under-`blocked` pattern. Read them with the old rule.

---

## 7. Open decisions (operator)

1. **Does structured mode get a downstream consumer, or get shelved?** Its only credible customer
   is `council-to-halo`, whose Step 3 currently re-reads prose to build the plan brief. Making the
   claim ledger authoritative there would produce a real promotion gate — *does the bridge produce
   a plan brief from claims at least as good as a human produces from prose?* — which is replayable
   offline and costs nothing per iteration. A subsystem with no consumer still charges maintenance,
   and it has already collected: it broke the flagship `ratified_with_edits` fix in the very mode it
   was meant to certify.
2. **What replaces the `< 5%` gate?** The council proposed: a named downstream consumer, a reasoning
   non-regression check, and field-level authority (prose authoritative where the schema lacks
   parity — which fusion now partially implements). Parse rate demoted to a build tripwire.
