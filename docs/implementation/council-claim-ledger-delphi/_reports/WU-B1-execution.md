# WU-B1 Execution Report — Zod claim/response schemas + text fallback

- **plan_id:** council-claim-ledger-delphi
- **unit:** WU-B1 (taxonomy: contract); depends_on: none
- **result:** DONE
- **gates flipped:** `gate_zod_bundled` → done, `gate_schema_fallback` → done (both map to WU-B1 alone). `gate_regression` left `planned` (maps to all 8 units).
- **worktree:** agents-council-worktrees/council-claim-ledger (branch `halo/council-claim-ledger`)
- **executed:** 2026-06-08

## Files changed (attributable to WU-B1)
- **NEW** `src/core/services/council/schemas.ts` — Zod `Claim`, `IndependentProposal`, `DeliberationResponse`, `RatificationVote` schemas; `parseStructuredOrFallback` (validate-or-fall-back-to-text helper); per-run parse-fail counter (`recordParseAttempt`/`getParseFailStats`/`resetParseFailStats`); `schemaSelfTest()`; a one-time top-level load marker (`globalThis.__AGENTS_COUNCIL_SCHEMAS_LOADED__`) for the flag-off isolation test.
- **NEW** `src/core/services/council/schemas.test.ts` — evidence (a)/(b)/(c) + a flag-on positive control + a compiled-binary-independent selftest assertion. 7 tests.
- **MODIFIED (additive)** `src/core/services/modelCouncil.ts` — three flag-gated async wrappers `parseRatificationVoteStructured` / `parseConsensusSignalStructured` / `parseCandidateConsensusStructured` and `isStructuredCouncilEnabled()`. Each returns the legacy sync parse with the flag off (without loading the schema module) and uses a guarded dynamic `import("./council/schemas")` only inside the flag-on branch. **Legacy sync parsers `parseRatificationVote` / `parseConsensusSignal` / `parseCandidateConsensus` are byte-for-byte unchanged.**
- **MODIFIED (additive)** `src/cli/index.ts` — `council selftest` command (guarded dynamic import → `schemaSelfTest()`) so a real Zod parse is reachable from the compiled binary (gate_zod_bundled).
- **MODIFIED** `docs/implementation/council-claim-ledger-delphi/status-ledger.md` — state-machine update.

## Evidence

| ID | Requirement | Result |
|---|---|---|
| (a) | valid structured payload parses to typed object | PASS — `ClaimSchema`/`RatificationVoteSchema` safeParse tests green |
| (b) | malformed payload falls to text parser AND increments parse-fail counter | PASS — invalid-JSON + schema-invalid both fall back; `getParseFailStats()` → attempted=2 failed=2 rate=1; valid path leaves counter at 0 |
| (c) | flag-off path never imports/touches schema module | PASS — guarded dynamic `import()` (no static top-level import; grep-verified 0 static imports, 4 dynamic). Subprocess test with `AGENTS_COUNCIL_STRUCTURED` unset: `__AGENTS_COUNCIL_SCHEMAS_LOADED__` stays undefined before+after a structured-wrapper call, and the legacy ACCEPT parse is byte-identical. Positive control: flag-on subprocess sets the marker to `true`. |
| (d) | gate_zod_bundled — schema parse from compiled binary | PASS — `bun build src/cli/index.ts --compile --outfile dist/council` (243 modules); `./dist/council selftest` → "SELFTEST PASS"; **re-ran with `node_modules/zod` moved away → still PASS**, proving Zod is bundled despite being a devDependency. |

### Test / check runs
- `bun run typecheck` → clean (rc=0).
- `bun test src/core/services/council/schemas.test.ts` → 7 pass / 0 fail.
- `bun test src/core/services/modelCouncil.test.ts` (regression) → 52 pass / 0 fail.
- `bun test` (full) → 70 pass / 0 fail across 6 files.
- `bun run format:check` → my 4 touched files are format-clean (verified individually via `bunx biome check` → rc=0). The single repo-wide error is in `harness/run_tier5_scheduling_council.ts`, a **pre-existing tracked file byte-identical to HEAD** (`git diff HEAD -- harness/run_tier5_scheduling_council.ts` empty). Not introduced by WU-B1 and out of WU-B1 scope; left untouched per surgical-change discipline. See FYI below.

## Invariants
- **INV-1** (no Bearer in argv): satisfied — `git diff -- src/ | grep -i bearer` empty.
- **INV-2** (legacy default; schema module reachable only under flag; flag-off restores byte-for-byte legacy and must not load the module): satisfied — guarded dynamic import; flag-off subprocess proves the module is never evaluated; legacy parser bodies unchanged.
- **INV-7** (additive into existing parsers, no fork): satisfied — wrappers added beside the existing parsers in `modelCouncil.ts`; no parallel file.
- **INV-8** (regression green; typecheck + format clean): regression + typecheck green; format clean for all WU-B1 files (pre-existing harness violation is baseline, not WU-B1).
- **PROJECT HARD RULE 1** (no LLM model-parameter change): satisfied — no model name / temperature / token-limit / sampling change.

## State-machine changes
- WU-B1: `ready` → `in_progress` → `done`.
- gate_zod_bundled: `planned` → `done`. gate_schema_fallback: `planned` → `done`. gate_regression: left `planned`.
- Newly ready (depend on WU-B1 only): **WU-B5, WU-B6**. WU-B2 stays `blocked` (also needs WU-B3, still ready/not-done). WU-B4 blocked (needs B2). WU-B8 blocked.

## FYI / open items
- **Pre-existing baseline format violation** in `harness/run_tier5_scheduling_council.ts` makes the repo-wide `bun run format:check` red independent of WU-B1. A downstream acceptance gate that runs repo-wide `format:check` will see this. Recommend fixing it under a dedicated docs/hygiene unit or before acceptance; it was deliberately NOT fixed here to keep the WU-B1 diff surgical.
- The structured wrappers are additive seams; they are **not yet called** by `runModelCouncil` (the live call-site rewiring is intentionally deferred — WU-B1 brief scopes this to the parse seam + fallback under the flag; controller/flow changes are non-goals and later units).
