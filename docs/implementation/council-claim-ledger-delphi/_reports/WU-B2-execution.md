# WU-B2 execution report — Provenance-label + Level-1 source-ID block precondition

**Status:** done (recovered + verified) @ 2026-06-09
**Gates closed:** `gate_planted_claim` → done. Contributes to `gate_regression` (stays planned until all units + acceptance).
**Unblocks:** WU-B4.

## Provenance note — recovered after an infra crash
The first executing agent (work-unit-implementer, agentId `a27a5481ae30c8b7f`) hit an
**API stream idle timeout** ~21 min in, after **21 tool_uses**. It had applied a coherent,
typecheck-clean B2 implementation to `modelCouncil.ts` but died before writing the test or
updating the ledger. Because A1/B3/B7 are uncommitted in the same file, a `git checkout`
revert was not safe. Recovery (this session, inline) **audited the orphaned implementation
against every invariant, added the missing real-path test, and verified** rather than
blind-reverting or blind-retrying.

## Implementation (audited, authored by the crashed agent; unchanged except one export)
- `runModelCouncil` (modelCouncil.ts ~L358-374): under `AGENTS_COUNCIL_STRUCTURED` only,
  calls `evaluateRatificationPreconditions(deliberations, input.evidencePack)` and **prepends**
  any returned blocks to `ratifications`. Gated on `hasCandidate`. Flag-off → not invoked
  (and the applier itself returns `[]` before importing the schema).
- `evaluateClaimLedgerPreconditions(claims, evidencePackIds)` (~L1593, **pure**, INV-9): the
  three deterministic checks —
  1. `UNLABELED_CLAIM` — claim with no provenance label;
  2. `ASSUMPTION_NO_VERIFICATION` — `assumption` with no stated cheapest_verification;
  3. `SOURCE_ID_MISMATCH` — **Level-1 source-ID (Addendum A.3.3)**: a `repo_fact` citing an id
     absent from (or empty against) the supplied evidence pack.
- `evaluateRatificationPreconditions(proposals, evidencePack)` (~L1664): flag-gated applier —
  returns `[]` flag-off **without importing the schema** (INV-2); flag-on, parses each
  proposal's structured payload via the WU-B1 guarded dynamic `import()`, runs the pure check,
  and synthesizes one `preconditionBlockRatification` per tripped member.
- `preconditionBlockRatification` (~L1640): emits a `ModelCouncilRatification` carrying the
  **existing absolute `FACTUAL_ERROR` `BLOCK_KIND`** (INV-4 — raises a block via the existing
  enum; weakens no veto's absoluteness).

**Only source change made during recovery:** `evaluateRatificationPreconditions`
`async function` → `export async function` (so the test exercises the real applier path rather
than a reimplementation — avoids the masking-test antipattern).

## Invariants verified
- **INV-2:** applier returns `[]` flag-off before the dynamic import; integration is inside the
  `AGENTS_COUNCIL_STRUCTURED` branch. Test `flag OFF: the same planted proposal raises no block`
  passes; flag-off ratification path is byte-for-byte legacy.
- **INV-3:** blocks enter only the `ratifications` array (L372); `isConverged` is never passed
  them. Confirmed by reading the integration site and the controller.
- **INV-4:** reuses `FACTUAL_ERROR`; no new veto kind; no veto absoluteness changed.
- **INV-9:** `evaluateClaimLedgerPreconditions` is pure — no model call, no eval/sandbox, no
  network.

## Evidence — `src/core/services/modelCouncil.claimLedger.test.ts` (10/10 pass)
- **Pure core (6 tests):** repo_fact absent-id → SOURCE_ID_MISMATCH; repo_fact present-id → none;
  repo_fact no-id → SOURCE_ID_MISMATCH; assumption → ASSUMPTION_NO_VERIFICATION; unlabeled →
  UNLABELED_CLAIM; clean set → none.
- **Real applier path (4 tests):** flag ON planted repo_fact (absent + empty id) → **one
  FACTUAL_ERROR block** naming SOURCE_ID_MISMATCH, attributed to the member; flag ON clean
  repo_fact → no block; **flag OFF planted proposal → []** (INV-2); flag ON legacy-text proposal
  → skipped (non-structured payloads can't trip).
- Full service suite **78/78**; `bun run typecheck` clean; `bunx biome format` on the two
  touched files clean. Only red is the pre-existing baseline `harness/run_tier5_scheduling_council.ts`
  (byte-identical to HEAD, unrelated).

## FYIs / contract seams (best-effort Wave-B heuristics, per the brief — NOT fixed here)
1. **`UNLABELED_CLAIM` is unreachable through the applier.** `ClaimSchema` (WU-B1) requires
   `provenance` (a frozen enum), so a literally unlabeled claim makes the whole structured parse
   fail → falls back to legacy → no block. The check fires only when the pure function is called
   with loosely-typed claims (asserted directly). End-to-end "unverifiable repo claim" coverage
   uses a `repo_fact` with absent/empty evidence — the real Level-1 deliverable.
2. **`ASSUMPTION_NO_VERIFICATION` fires for every `assumption`.** `ClaimSchema` has **no**
   `cheapest_verification` field, so a schema-valid assumption can never "state" one. This is a
   B1↔B2 contract gap: the schema comment says assumptions "must state cheapest verification
   downstream (WU-B2)", but no field carries it. Net behavior — conservative (all assumptions
   block). Fixing means adding a field to the frozen B1 schema; deferred (out of WU-B2 scope).

Both seams are acceptable under the unit's brief ("best-effort in Wave B, heuristic until
parse-rate validated") but should be revisited if/when the Wave-C entry gate is built.
