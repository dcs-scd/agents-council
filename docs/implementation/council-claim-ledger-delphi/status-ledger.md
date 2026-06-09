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
| WU-B4 | runtime | done | WU-B2 |
| WU-B5 | runtime | done | WU-B1 |
| WU-B6 | evaluator | done | WU-B1 |
| WU-B8 | docs | ready | WU-B1, WU-B2, WU-B3, WU-B4, WU-B5, WU-B6, WU-B7 |

Counts: done = 8, ready = 1, blocked = 0, deferred = 0 (Wave C recorded as deferred work, not decomposed into units).
WU-B3 done @ 2026-06-08 → its dependent WU-B2 now has both deps satisfied (WU-B1 done + WU-B3 done) and flips blocked → ready.
WU-B7 done @ 2026-06-08 → the prior stop is RESOLVED by the corrected write-boundary: B7 carries only INV-8 (not INV-2), so changing the flag-off default roster is in-scope, and updating the single default-roster assertion in `modelCouncil.test.ts` (L99) is the selected unit's test surface. `DEFAULT_MEMBER_IDS` changed `["claude","chatgpt"]` → `["claude","chatgpt","gemini"]` (odd, n=3, heterogeneous; all three are locally-credentialed CLI providers — claude/codex/gemini — so a default run needs no OPENROUTER/vendor key and `validateCouncilConfig` never throws). The explicit `AGENTS_COUNCIL_MEMBERS` override path is unchanged and still yields exactly the listed members (n=2 for a two-id draft). B7 has no dependents → it changes nothing about B2/B5/B6 dependency state.
WU-B2 done @ 2026-06-09 → claim-ledger ratification preconditions + Level-1 source-ID check (Addendum A.3.3) wired flag-gated under `AGENTS_COUNCIL_STRUCTURED`; its dependent WU-B4 flips blocked → ready. (Implementation was recovered after an infra stream-timeout crashed the executing agent mid-unit — the agent left a coherent, typecheck-clean implementation in `modelCouncil.ts` but no test/ledger update; recovery audited the code against INV-2/3/4/9, added the missing real-path planted-claim test, and verified — see _reports/WU-B2-execution.md.)
WU-B4 done @ 2026-06-09 → minority report as a first-class artifact. New `MinorityReportEntry` type + optional `minorityReport?: MinorityReportEntry[]` on `ModelCouncilConsensus`; `buildConsensusResult` (L~1900) populates it from the dissenting (non-accepted) ratifications **only on a `blocked` outcome** — every block, including a WU-B2 claim-ledger `FACTUAL_ERROR` precondition (which is itself a blocking ratification), surfaces as dissent. `formatModelCouncilMarkdown` (L~577) renders a `## Minority Report` section on `blocked` only. CLI `solve` (`src/cli/index.ts`) sets `process.exitCode = 1` when `outcome === "blocked"` (exit 0 on ratified/not_attempted). INV-6 verified unchanged: `ModelCouncilConsensusOutcome = "ratified" | "blocked" | "not_attempted"` (L149) — the report is an additional field, not a new enum value; `qualified_consensus` NOT introduced. INV-8 holds: `modelCouncil.test.ts` 53/53 unchanged. B4 has no dependents besides WU-B8 (docs), which stays blocked until all B-series code units done. _reports/WU-B4-execution.md.
WU-B5 + WU-B6 done @ 2026-06-09 → both write distinct artifacts from a single `isStructuredCouncilEnabled()` branch added to `saveModelCouncilRun` (one function edit, two writes; INV-2 — flag OFF emits exactly the legacy `council-{ts}.json/.md` and nothing below, no trace, no issue-map, no schema-module import). B5: `trace-{ts}.json` (`agents-council.council_trace.v1`) carries the `council_to_brief.py` consumer skeleton (`prompt`/`members{id,name,provider,model}`/`consensus{reached,ratifiedBy,blockedBy}`/`converged`/`rounds{index,changed,memberAgreement}`/`candidateConsensus`) PLUS an additive per-claim/per-member/per-round `claims[]`; **equal member weights** (`members[].weight === 1`, never by prestige). B6: `issue-map-{ts}.json` (`agents-council.issue_map.v1`) = deterministic normalized exact-match clustering (new `council/issueMap.ts`, ~140 LOC, no embeddings) into agreed (>1 distinct member) / contested (lone). Both extract schema-validated claims via the WU-B1 guarded dynamic import (`extractStructuredClaims`). Once B5+B6 done, ALL code units (A1,B1,B2,B3,B4,B5,B6,B7) are done → **WU-B8 (docs) flips blocked → ready**. Ready queue (recomputed): WU-B8.

## Gates

| Gate | State | Contributing units | Evidence collected |
|---|---|---|---|
| gate_no_bearer | done | WU-A1 | modelCouncil.bearer.test.ts 3/3 pass (spawn-spy: no argv element contains Bearer/key/Authorization; auth still reaches curl via --config file); live `ps` proof OLD=LEAK / NEW=no-Bearer; _reports/WU-A1-execution.md |
| gate_zod_bundled | done | WU-B1 | dist/council selftest schema parse PASS (incl. node_modules/zod removed); _reports/WU-B1-execution.md |
| gate_schema_fallback | done | WU-B1 | schemas.test.ts (a)/(b)/(c) green; flag-off never loads schema module; _reports/WU-B1-execution.md |
| gate_planted_claim | done | WU-B2 | modelCouncil.claimLedger.test.ts 10/10 pass: a planted `repo_fact` citing an absent/empty evidence-pack id is surfaced (flag ON) as a single FACTUAL_ERROR block via the real `evaluateRatificationPreconditions` parse→eval→block path; flag OFF returns [] without importing the schema module (INV-2); pure `evaluateClaimLedgerPreconditions` covers all three checks (UNLABELED_CLAIM / ASSUMPTION_NO_VERIFICATION / SOURCE_ID_MISMATCH, INV-9). Block reuses the absolute FACTUAL_ERROR kind (INV-4) and enters only ratifications, never isConverged (INV-3). _reports/WU-B2-execution.md |
| gate_minority_report | done | WU-B4 | modelCouncil.minorityReport.test.ts 7/7 pass. One absolute FACTUAL_ERROR veto preserves the dissent in BOTH the JSON result (`consensus.minorityReport[0]` = {member, blockKind:FACTUAL_ERROR, absolute:true, dissent}) AND the Markdown (`## Minority Report` section + `### <member> — FACTUAL_ERROR (absolute veto)` + verbatim dissent text). Ratified/not_attempted carry no minorityReport (JSON undefined; no MD section). CLI exit-code: end-to-end `Bun.spawn` of the real `council solve` against a mock OpenRouter transport — blocked outcome exits non-zero, ratified outcome exits 0. _reports/WU-B4-execution.md |
| gate_issue_map_observational | done | WU-B6 | modelCouncil.issueMap.test.ts: (a) partition fixture — a claim asserted by >1 DISTINCT member (normalized exact-match, case/whitespace/surrounding-punctuation folded) lands in `agreed`; a lone-member claim lands in `contested`; one member repeating a claim does NOT manufacture agreement (equal member weight). (b) CONTROLLER-ISOLATION (INV-3): structural isolation — attaching a forged max-agreed `issueMap` field onto the `ModelCouncilRound` passed to `isConverged` does not change its verdict (the field is structurally invisible to the controller, whose inputs are round.changed/similarityToPrevious/proposals only); value isolation — `isConverged`'s verdict is identical before vs. after a real `issue-map-{ts}.json` is written next to the council artifacts. Map is computed in `saveModelCouncilRun` AFTER the result, never threaded back into a round. INV-5: deterministic pure code, no LLM/embeddings/network. _reports/WU-B6-execution.md |
| gate_regression | planned | WU-A1, WU-B1, WU-B2, WU-B3, WU-B4, WU-B5, WU-B6, WU-B7 | WU-B3 contribution: modelCouncil.evidencePack.test.ts 2/2 pass (pack prepended to round-0 proposal system message; no-pack path byte-identical to legacy, INV-2). WU-B7 contribution: DEFAULT_MEMBER_IDS → ["claude","chatgpt","gemini"] (odd n=3, heterogeneous, all locally-credentialed CLIs); modelCouncil.test.ts 53/53 pass (updated default-roster assertion to the odd>=3 panel + added explicit-override n=2 test); evidencePack 2/2 still green; typecheck clean; format:check clean for touched files (modelCouncil.ts + modelCouncil.test.ts); baseline harness/run_tier5_scheduling_council.ts red is byte-identical-to-HEAD and unrelated. WU-B2 contribution: modelCouncil.claimLedger.test.ts 10/10 pass + full service suite 78/78 pass; typecheck clean; touched files (modelCouncil.ts one-line export + new claimLedger test) format-clean. WU-B4 contribution: modelCouncil.minorityReport.test.ts 7/7 pass; modelCouncil.test.ts 53/53 unchanged (INV-8); full service suite 85/85 pass (78 + 7 new); typecheck clean; touched files (modelCouncil.ts, src/cli/index.ts, new minorityReport test) format-clean via `biome format`; only format:check reds are the pre-existing baseline harness/run_tier5_scheduling_council.ts + harness/model_council_result_r5.json (byte-identical to HEAD, untouched, unrelated). WU-B5 contribution: modelCouncil.trace.test.ts 4/4 pass (flag-on writes trace-{ts}.json matching the council_to_brief.py top-key contract; equal member weights==1; per-claim/per-member/per-round detail present; flag-OFF writes NO trace AND NO issue-map file, legacy council-{ts}.json/.md still the only artifacts — INV-2); external `council_to_brief.py --format json` + `--format brief` parse-smoke PASS against a real generated trace. WU-B6 contribution: modelCouncil.issueMap.test.ts 6/6 pass (partition fixture + structural & value controller-isolation, see gate_issue_map_observational note). Full service suite now 95/95 (85 + 5 trace ledger note correction: 4 trace + 6 issueMap = 10 new; suite 85→95); typecheck clean; touched files (modelCouncil.ts, new council/issueMap.ts, new modelCouncil.trace.test.ts + modelCouncil.issueMap.test.ts) format-clean via `biome format` — modelCouncil.ts was reformatted (104 insertions, 0 deletions: biome collapsed only the new issue-map writeFile call). Only remaining format:check reds are the pre-existing baseline harness/run_tier5_scheduling_council.ts + harness/model_council_result_r5.json + council_runs/*.json (all byte-identical to HEAD, untouched, unrelated). Gate stays planned until acceptance. _reports/WU-B3-execution.md, _reports/WU-B7-execution.md, _reports/WU-B2-execution.md, _reports/WU-B4-execution.md, _reports/WU-B5-execution.md, _reports/WU-B6-execution.md |
| gate_mdoc_clean | planned | WU-B8 | — |

## Canonical state

```yaml
# handoff WU-B5+WU-B6: done @ 2026-06-09 — structured trace (B5) + observational issue map
#   (B6) written from ONE isStructuredCouncilEnabled() branch added to saveModelCouncilRun
#   (single function edit, two distinct artifact writes). INV-2: flag OFF -> only the legacy
#   council-{ts}.json/.md, nothing below executes (no trace, no issue-map, no schema import).
#   B5: trace-{ts}.json (agents-council.council_trace.v1) = council_to_brief.py consumer skeleton
#   (prompt/members{id,name,provider,model}/consensus{reached,ratifiedBy,blockedBy}/converged/
#   rounds{index,changed,memberAgreement}/candidateConsensus) + additive per-claim/per-member/
#   per-round claims[]; EQUAL member weights (members[].weight==1, never by prestige). External
#   council_to_brief.py --format json + brief parse-smoke PASS on a real trace. B6: issue-map-{ts}.json
#   (agents-council.issue_map.v1) = new council/issueMap.ts (~140 LOC) deterministic normalized
#   exact-match clustering -> agreed (>1 distinct member) / contested (lone); no embeddings (INV-5).
#   INV-3 controller-isolation proven two ways (structural: forged issueMap field on the round is
#   invisible to isConverged; value: isConverged verdict identical with/without a written map).
#   Both share extractStructuredClaims (WU-B1 guarded dynamic import). All code units done ->
#   WU-B8 (docs) flips blocked->ready. gate_issue_map_observational -> done. gate_regression stays
#   planned (B5+B6 contributions recorded). Suite 95/95; typecheck clean. See _reports/WU-B5-execution.md,
#   _reports/WU-B6-execution.md.
# handoff WU-B4: done @ 2026-06-09 — minority report as a first-class artifact. New
#   MinorityReportEntry type + optional minorityReport? field on ModelCouncilConsensus;
#   buildConsensusResult populates it from the non-accepted ratifications ONLY on a
#   `blocked` outcome (a WU-B2 claim-ledger FACTUAL_ERROR precondition is itself a blocking
#   ratification, so B2 blocks feed dissent here). formatModelCouncilMarkdown renders a
#   `## Minority Report` section on `blocked` only. CLI `solve` sets process.exitCode=1 on
#   `blocked` (exit 0 on ratified/not_attempted). INV-6 verified: top-level enum unchanged
#   at not_attempted|ratified|blocked — additional field, NOT a new outcome; no
#   qualified_consensus. INV-8 holds (modelCouncil.test.ts 53/53 unchanged). gate_minority_report
#   done (modelCouncil.minorityReport.test.ts 7/7: dissent in BOTH JSON+MD + CLI exit-code via
#   real-binary spawn). Unblocks nothing new (WU-B8 docs still gated on all B units). See
#   _reports/WU-B4-execution.md.
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
  WU-B4: done
  WU-B5: done
  WU-B6: done
  WU-B8: ready
gates:
  gate_no_bearer: done
  gate_zod_bundled: done
  gate_schema_fallback: done
  gate_planted_claim: done
  gate_minority_report: done
  gate_issue_map_observational: done
  gate_regression: planned
  gate_mdoc_clean: planned
```
