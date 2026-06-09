# Status Ledger — Claim-Ledger Delphi (Wave A + Wave B)

```yaml
plan_id: council-claim-ledger-delphi
artifact_root: docs/implementation/council-claim-ledger-delphi/
generated_at: 2026-06-08T19:41:45Z
generated_by: implementation-work-units
gate_order:
  - gate_no_bearer
  - gate_zod_bundled
  - gate_schema_fallback
  - gate_planted_claim
  - gate_minority_report
  - gate_issue_map_observational
  - gate_regression
  - gate_mdoc_clean
parallel_acceptance_allowed: false
acceptance_candidate_gate: null
first_execution: WU-B1
```

## Status summary

| Unit | Taxonomy | State | depends_on |
|---|---|---|---|
| WU-A1 | runtime | done | — |
| WU-B1 | contract | done | — |
| WU-B3 | runtime | done | — |
| WU-B7 | runtime | done | — |
| WU-B2 | runtime | done | WU-B1, WU-B3 |
| WU-B4 | runtime | ready | WU-B2 |
| WU-B5 | runtime | ready | WU-B1 |
| WU-B6 | evaluator | ready | WU-B1 |
| WU-B8 | docs | blocked | WU-B1, WU-B2, WU-B3, WU-B4, WU-B5, WU-B6, WU-B7 |

Counts: done = 5, ready = 3, blocked = 1, deferred = 0 (Wave C recorded as deferred work, not decomposed into units).
WU-B3 done @ 2026-06-08 → its dependent WU-B2 now has both deps satisfied (WU-B1 done + WU-B3 done) and flips blocked → ready.
WU-B7 done @ 2026-06-08 → the prior stop is RESOLVED by the corrected write-boundary: B7 carries only INV-8 (not INV-2), so changing the flag-off default roster is in-scope, and updating the single default-roster assertion in `modelCouncil.test.ts` (L99) is the selected unit's test surface. `DEFAULT_MEMBER_IDS` changed `["claude","chatgpt"]` → `["claude","chatgpt","gemini"]` (odd, n=3, heterogeneous; all three are locally-credentialed CLI providers — claude/codex/gemini — so a default run needs no OPENROUTER/vendor key and `validateCouncilConfig` never throws). The explicit `AGENTS_COUNCIL_MEMBERS` override path is unchanged and still yields exactly the listed members (n=2 for a two-id draft). B7 has no dependents → it changes nothing about B2/B5/B6 dependency state.
WU-B2 done @ 2026-06-09 → claim-ledger ratification preconditions + Level-1 source-ID check (Addendum A.3.3) wired flag-gated under `AGENTS_COUNCIL_STRUCTURED`; its dependent WU-B4 flips blocked → ready. (Implementation was recovered after an infra stream-timeout crashed the executing agent mid-unit — the agent left a coherent, typecheck-clean implementation in `modelCouncil.ts` but no test/ledger update; recovery audited the code against INV-2/3/4/9, added the missing real-path planted-claim test, and verified — see _reports/WU-B2-execution.md.)
Ready queue (recomputed): WU-B4, WU-B5, WU-B6.

## Gates

| Gate | State | Contributing units | Evidence collected |
|---|---|---|---|
| gate_no_bearer | done | WU-A1 | modelCouncil.bearer.test.ts 3/3 pass (spawn-spy: no argv element contains Bearer/key/Authorization; auth still reaches curl via --config file); live `ps` proof OLD=LEAK / NEW=no-Bearer; _reports/WU-A1-execution.md |
| gate_zod_bundled | done | WU-B1 | dist/council selftest schema parse PASS (incl. node_modules/zod removed); _reports/WU-B1-execution.md |
| gate_schema_fallback | done | WU-B1 | schemas.test.ts (a)/(b)/(c) green; flag-off never loads schema module; _reports/WU-B1-execution.md |
| gate_planted_claim | done | WU-B2 | modelCouncil.claimLedger.test.ts 10/10 pass: a planted `repo_fact` citing an absent/empty evidence-pack id is surfaced (flag ON) as a single FACTUAL_ERROR block via the real `evaluateRatificationPreconditions` parse→eval→block path; flag OFF returns [] without importing the schema module (INV-2); pure `evaluateClaimLedgerPreconditions` covers all three checks (UNLABELED_CLAIM / ASSUMPTION_NO_VERIFICATION / SOURCE_ID_MISMATCH, INV-9). Block reuses the absolute FACTUAL_ERROR kind (INV-4) and enters only ratifications, never isConverged (INV-3). _reports/WU-B2-execution.md |
| gate_minority_report | planned | WU-B4 | — |
| gate_issue_map_observational | planned | WU-B6 | — |
| gate_regression | planned | WU-A1, WU-B1, WU-B2, WU-B3, WU-B4, WU-B5, WU-B6, WU-B7 | WU-B3 contribution: modelCouncil.evidencePack.test.ts 2/2 pass (pack prepended to round-0 proposal system message; no-pack path byte-identical to legacy, INV-2). WU-B7 contribution: DEFAULT_MEMBER_IDS → ["claude","chatgpt","gemini"] (odd n=3, heterogeneous, all locally-credentialed CLIs); modelCouncil.test.ts 53/53 pass (updated default-roster assertion to the odd>=3 panel + added explicit-override n=2 test); evidencePack 2/2 still green; typecheck clean; format:check clean for touched files (modelCouncil.ts + modelCouncil.test.ts); baseline harness/run_tier5_scheduling_council.ts red is byte-identical-to-HEAD and unrelated. WU-B2 contribution: modelCouncil.claimLedger.test.ts 10/10 pass + full service suite 78/78 pass; typecheck clean; touched files (modelCouncil.ts one-line export + new claimLedger test) format-clean. Gate stays planned until all 8 units done + acceptance. _reports/WU-B3-execution.md, _reports/WU-B7-execution.md, _reports/WU-B2-execution.md |
| gate_mdoc_clean | planned | WU-B8 | — |

## Canonical state

```yaml
# handoff WU-B2: done @ 2026-06-09 — claim-ledger ratification preconditions under
#   AGENTS_COUNCIL_STRUCTURED (INV-2): unlabeled claim / assumption-without-verification /
#   Level-1 source-ID mismatch (repo_fact citing an absent pack id) → absolute FACTUAL_ERROR
#   block via existing veto machinery (INV-4); pure deterministic eval (INV-9); blocks enter
#   only ratifications, never isConverged (INV-3). Implementation RECOVERED after an infra
#   stream-timeout crash mid-unit; recovery exported evaluateRatificationPreconditions for the
#   real-path test, added modelCouncil.claimLedger.test.ts (10/10), verified suite 78/78.
#   Unblocks WU-B4. NOTE: strict ClaimSchema (no provenance-less claim, no cheapest_verification
#   field) means UNLABELED_CLAIM is pure-core-only and ASSUMPTION_NO_VERIFICATION fires for every
#   assumption — best-effort Wave-B heuristics per the brief; see _reports/WU-B2-execution.md.
# handoff WU-B3: done @ 2026-06-08 — optional `evidencePack: {id,text,source}[]` arg on
#   runModelCouncil threaded into buildProposalMessages; pack prepended to round-0 proposal
#   system message, no-pack path byte-identical to legacy (INV-2). Unblocks WU-B2 (B1+B3 both done).
# handoff WU-B7: done @ 2026-06-08 — prior stop RESOLVED. B7 carries only INV-8 (not INV-2), so the
#   flag-off default roster IS in-scope; updating the one default-roster assertion in
#   modelCouncil.test.ts L99 is the selected unit's test surface. DEFAULT_MEMBER_IDS
#   ["claude","chatgpt"] -> ["claude","chatgpt","gemini"] (odd n=3, heterogeneous, all locally-
#   credentialed CLIs claude/codex/gemini -> no OPENROUTER/vendor key needed at config time).
#   Explicit AGENTS_COUNCIL_MEMBERS override unchanged -> still yields exactly listed members (n=2
#   draft preserved). Config-only, no protocol/router change. 53/53 modelCouncil.test.ts pass.
# handoff WU-A1: done @ 2026-06-08 — Authorization header routed via curl --config <0600 tmpfile>
#   (unlinked post-exit; body stays on stdin). No dependents → ready queue unchanged.
units:
  WU-A1: done
  WU-B1: done
  WU-B3: done
  WU-B7: done
  WU-B2: done
  WU-B4: ready
  WU-B5: ready
  WU-B6: ready
  WU-B8: blocked
gates:
  gate_no_bearer: done
  gate_zod_bundled: done
  gate_schema_fallback: done
  gate_planted_claim: done
  gate_minority_report: planned
  gate_issue_map_observational: planned
  gate_regression: planned
  gate_mdoc_clean: planned
```
