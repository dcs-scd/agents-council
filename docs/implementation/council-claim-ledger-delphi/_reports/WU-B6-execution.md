# WU-B6 — Observational issue-map artifact (non-controlling) — execution

- **plan_id:** council-claim-ledger-delphi
- **unit:** WU-B6 (taxonomy: evaluator) · **state:** done @ 2026-06-09
- **gate(s):** gate_issue_map_observational (→ done), gate_regression (contributing; stays `planned`)
- **depends_on:** WU-B1 (done) · **co-executed with:** WU-B5 (one `saveModelCouncilRun` edit)

## Change (Addendum A.5 default = BUILD construction)

Under `AGENTS_COUNCIL_STRUCTURED` only, `saveModelCouncilRun` now writes
`issue-map-{ts}.json` next to `council-{ts}.json/.md`: a deterministic
normalized exact-match clustering of the schema-validated claims into an
**agreed / contested** partition. Built the full construction (not the lean
cut-line), per the settled scope decision.

### New module `src/core/services/council/issueMap.ts` (~140 LOC)

- `normalizeClaimText(text)` — lowercase, collapse internal whitespace, strip
  surrounding whitespace + ASCII/Unicode punctuation. **Exact-match only — no
  embeddings, no stemming** (INV-5, non-goal: embeddings).
- `buildIssueMap(claims: IssueMapClaim[]): IssueMap` — pure, deterministic
  (no clock, no I/O, no model). Groups claims by normalized key in first-seen
  order; a cluster is **`agreed` iff > 1 DISTINCT member** asserted it, else
  **`contested`**. Equal member weight: a single member repeating a claim does
  not manufacture agreement (a member is counted once per cluster).
- Output `agents-council.issue_map.v1`: `{agreed[], contested[], stats}` where
  each cluster carries `{key, representativeText, members[], claims[]}`.

### Wiring (`src/core/services/modelCouncil.ts`)

- `saveModelCouncilRun` (~L629–L671): inside the shared
  `isStructuredCouncilEnabled()` branch, the schema-validated claims from
  `extractStructuredClaims` (WU-B5) are projected via `toIssueMapClaim` (drops
  `round` — corroboration is across **members**, regardless of round) and passed
  to `buildIssueMap` (loaded via dynamic `import("./council/issueMap")`), then
  written to `issue-map-{ts}.json`.

## Controller-isolation (INV-3) — the issue map controls NOTHING

`isConverged(round: ModelCouncilRound): boolean` is the only live convergence
controller. It reads only `round.changed`, `round.similarityToPrevious`, and
`round.proposals[].content|candidateConsensus`. The issue map is computed in
`saveModelCouncilRun` **after** the result exists and is never threaded back into
a round, so it has **no structural channel** into `isConverged` or ratification.

**Asserted two ways (`modelCouncil.issueMap.test.ts`):**

1. **Structural isolation** — attaching a forged maximally-agreed `issueMap`
   field onto the round passed to `isConverged` does not change its verdict
   (the field is structurally invisible; if the controller read it, a max-agreed
   map could flip the result — it does not).
2. **Value isolation** — `isConverged`'s verdict is identical before vs. after a
   real `issue-map-{ts}.json` is written next to the council artifacts. The
   controller's behavior is independent of the artifact's existence/content.

## Tests (`src/core/services/modelCouncil.issueMap.test.ts`, 6/6 pass)

Partition / determinism (INV-5):
- `normalizeClaimText folds case/whitespace/surrounding punctuation`.
- `a claim asserted by >1 distinct member is AGREED; a lone claim is CONTESTED`
  — the fixture with known agreed/contested claims yields the expected partition.
- `equal member weight: one member repeating a claim does NOT manufacture agreement`.

Controller isolation (INV-3) + flag-gating (INV-2):
- `structural isolation: isConverged ignores an attached issue-map field`.
- `value isolation: writing an issue-map file does not change isConverged's verdict`
  (also asserts `issue-map-*.json` IS written under the flag).
- `flag OFF: no issue-map file is written (INV-2)`.

## Validation

- `bun run typecheck` — clean.
- `bun test src/core/services/` — 95/95.
- `bun run format:check` — `council/issueMap.ts` + both test files clean;
  `modelCouncil.ts` reformatted (104 insertions, 0 deletions — biome collapsed
  only the new issue-map writeFile call); only baseline reds remain
  (`harness/*`, `council_runs/*` — byte-identical to HEAD, untouched).

## Invariants

- **INV-3** — issue map never read by `isConverged`/ratification (tested).
- **INV-5** — deterministic code, no LLM mediator, no embeddings.
- **INV-2** — flag-off writes no issue-map file.
- **INV-8** — suite green, typecheck + format clean.

Non-goals respected: not a controller; no embeddings; no dispute packets.
