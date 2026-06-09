# WU-B4 Execution Report — Minority report as a first-class artifact

- **unit:** WU-B4
- **state:** done @ 2026-06-09
- **depends_on:** WU-B2 (done) — the claim-ledger ratification preconditions raise a synthetic absolute `FACTUAL_ERROR` block, which is itself a blocking ratification and therefore feeds the minority report.
- **gate(s):** `gate_minority_report` → **done**; contributes to `gate_regression` (stays **planned**).
- **invariants:** INV-6 (enum freeze), INV-8 (existing tests + typecheck + format clean).

## Change set

### 1. JSON result field — `MinorityReportEntry` + `ModelCouncilConsensus.minorityReport`
`src/core/services/modelCouncil.ts` (~L151–179, type block above `ModelCouncilConsensus`).

New exported type:
```ts
export type MinorityReportEntry = {
  member: string;
  blockKind?: RatificationBlockKind; // present only when the vote carried one
  absolute: boolean;                 // true for FACTUAL_ERROR / MATERIAL_DISAGREEMENT (F7)
  dissent: string;                   // verbatim ratification text
};
```
plus optional `minorityReport?: MinorityReportEntry[]` on `ModelCouncilConsensus`.

### 2. Population — `buildConsensusResult`
`src/core/services/modelCouncil.ts` (~L1900, the `blocked` return branch only).
Maps every **non-accepted** ratification to a `MinorityReportEntry` (`absolute` via the existing `isAbsoluteVeto`). Emitted **only** on the `blocked` outcome — the `ratified` and `not_attempted` branches return no `minorityReport` (field stays `undefined`).

### 3. Markdown formatter — `formatModelCouncilMarkdown`
`src/core/services/modelCouncil.ts` (~L577, immediately before the Peer Ratifications push).
Renders a `## Minority Report` section **only when** `outcome === "blocked"` and the report is non-empty. Each entry: `### <member> — <blockKind>[ (absolute veto)]` followed by the verbatim dissent.

### 4. CLI exit-code path — `solve` command
`src/cli/index.ts` (the `solve` `.action`, ~L60–82).
After printing (JSON or Markdown), sets `process.exitCode = 1` when `result.consensus.outcome === "blocked"`. Ratified / not_attempted leave the exit code at 0.
- **Decision:** used `process.exitCode = 1` rather than `process.exit(1)` so the already-issued `saveModelCouncilRun` writes and buffered stdout flush before the process exits; the run exits 1 naturally once `parseAsync` resolves.

## Evidence — `gate_minority_report`

New test file `src/core/services/modelCouncil.minorityReport.test.ts` — **7/7 pass**:

- **JSON (one absolute veto preserves dissent):** a blocked result from `[ACCEPT, BLOCK/FACTUAL_ERROR]` yields `consensus.minorityReport` of length 1 with `{member, blockKind: "FACTUAL_ERROR", absolute: true, dissent}` containing the veto text.
- **JSON negatives:** a `ratified` consensus and a `not_attempted` consensus both have `minorityReport === undefined`.
- **Markdown (same dissent in the rendered doc):** `formatModelCouncilMarkdown` of the blocked result contains `## Minority Report`, the verbatim dissent text, and the heading `### <member> — FACTUAL_ERROR (absolute veto)`. A ratified result renders **no** `## Minority Report` section.
- **CLI exit-code (real binary):** `Bun.spawn(["bun", src/cli/index.ts, "solve", ...])` against a mock OpenRouter transport — a canned ratify=`BLOCK/FACTUAL_ERROR` run **exits non-zero**; a canned ratify=`ACCEPT` run **exits 0**.

## INV-6 confirmation (enum freeze)

`ModelCouncilConsensusOutcome` (L149) is **unchanged**:
```ts
export type ModelCouncilConsensusOutcome = "ratified" | "blocked" | "not_attempted";
```
The minority report is an additional field on the consensus result, not a new outcome state. `qualified_consensus` was **not** introduced (nested-only and deferred per the brief).

## Validation

- `bun run typecheck` — clean.
- `bun test src/core/services/modelCouncil.minorityReport.test.ts` — 7/7 pass.
- `bun test src/core/services/modelCouncil.test.ts` — 53/53 pass (unchanged → INV-8).
- `bun test src/core/services/` — 85/85 pass (78 baseline + 7 new).
- `biome format` on the three touched files — clean (no fixes applied).
- `bun run format:check` — the only reds are the pre-existing baseline `harness/run_tier5_scheduling_council.ts` and `harness/model_council_result_r5.json`, both byte-identical to HEAD and untouched by this unit.

## Ledger / queue

- `WU-B4: done`; ready queue recomputed → **WU-B5, WU-B6** (WU-B8 docs stays blocked until all B-series code units land).
- `gate_minority_report: done` with the evidence note above.
- `gate_regression` stays **planned** (B4 contribution recorded in its note).
