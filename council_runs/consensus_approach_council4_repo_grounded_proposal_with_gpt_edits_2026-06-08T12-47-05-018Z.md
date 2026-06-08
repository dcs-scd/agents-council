# Council Proposal With ChatGPT Final Edits Applied

Generated: 2026-06-08

Source run: /home/dstefanescu/other_systems/o4/agents-council/council_runs/council-2026-06-08T12-47-05-018Z.json

Base artifact: repaired candidate from the repo-grounded four-member council. This file applies ChatGPT 5.5's final ACCEPT_WITH_EDITS provenance/precision changes; it is not a new council ratification.

---

# Consensus Improvement Proposal: Claim-Ledger Delphi for agents-council

**Scope note on labels.** Every implementation-specific claim is tagged `repo_fact` (grounded in the current-system brief), `source_claim` (grounded in the conceptual/deep-research docs, unverified in repo), or `assumption` (plausible, unverified). Where the brief and source docs conflict, the conflict is named and resolved inline.

---

## Executive recommendation

**Make the labeled claim — not the prose draft — the unit of deliberation, and gate stopping and ratification on a claim-ledger invariant rather than on text similarity.** The central change has two enforceable halves, shippable independently:

- **P0 (fixes the *observed* failure, short implementation pass — `assumption`; exact effort unestimated):** require every factual claim to carry a provenance label (`repo_fact`/`source_claim`/`assumption`) with evidence, and add a deterministic ratification precondition — *no factual claim enters ratified consensus unlabeled, and no `assumption` enters without a stated cheapest-verification step.* This rides entirely on the existing typed-veto ratification machinery (`repo_fact`).
- **P1 (fixes the *latent* failure, structural):** build a deterministic, code-constructed issue map of agreed vs. contested claims from schema-validated member outputs; deliberate only over contested claims via targeted dispute packets; replace token-set Jaccard convergence (`repo_fact`) with "zero open high-severity contested claims."

**Why this dominates.** It is the single change that simultaneously (a) prevents recurrence of the prior `blocked` run, whose proximate trigger was ChatGPT 5.5's `ACCEPT_WITH_EDITS` demanding that two project-specific claims be marked assumptions unless verified (`repo_fact`); (b) replaces a convergence signal that measures prose agreement, not decision agreement (`repo_fact` that Jaccard/pairwise overlap is used; `source_claim` that lexical convergence is the wrong target); (c) preserves the system's two best existing invariants — peer-derived candidate nomination with no judge-dictator, and typed ratification with absolute vetoes (`repo_fact`); and (d) produces the auditable claim ledger downstream consumers need — *without* adding an LLM mediator that could hallucinate.

**Honest rationale boundary.** At the current default roster of two members (Opus 4.8 + GPT-5.5, `repo_fact`), the O(n²r)→O(nr) token-savings argument the source docs emphasize (`source_claim`) is negligible. The issue map is justified here by **correctness, auditability, and a meaningful stopping signal**, not cost. Cost savings are negligible at n=2; the material threshold is empirical. The sources establish O(n²r) vs O(nr) communication pressure and recommend hierarchy/gossip for roughly 10+ agents, but they do not justify a fixed small-team threshold. We therefore do not build for scale this system does not have. Confidence: high that the efficiency rationale does not transfer at n=2; moderate that the correctness rationale holds pending the mandated ablation.

**Mandatory kill-switch.** Multi-agent deliberation must justify its existence. The evaluation plan requires beating a single strong model and self-consistency (`source_claim`: self-consistency is a strong cheap baseline). If structured council does not beat self-consistency on the target task distribution, the deliberation apparatus is not justified for that task class — deprecate it there regardless of elegance.

---

## Current implementation diagnosis

### Strengths (preserve — several are better than the source docs' defaults)

- `repo_fact`: **No-dictator candidate nomination.** `buildCandidateConsensus` nominates from peer drafts rather than appointing a judge. This satisfies the deep-research warning that a single judge can hallucinate (`source_claim`). The conceptual doc recommends a mediator/issue-map stage; implementing that compression as an LLM mediator is *worse* than the repo's deterministic instinct — do not regress to it.
- `repo_fact`: **Typed ratification with absolute vetoes.** Votes are `ACCEPT`/`ACCEPT_WITH_EDITS`/`BLOCK`; `BLOCK` carries a typed `BLOCK_KIND`; `FACTUAL_ERROR` and `MATERIAL_DISAGREEMENT` are absolute vetoes. More disciplined for this council's design/open-ended task class than a bare numeric support threshold. (Note for fidelity: the conceptual doc's categorical rule is itself not bare — it requires weighted support ≥ 0.75 *and* no unresolved high-severity objection *and* at least one independent verification path *and* margin ≥ 0.20 over the best competitor — but it targets categorical questions, not design synthesis, which is why typed-veto ratification is the better fit here.)
- `repo_fact`: **Blind, parallel round-0.** Initial proposals are generated in parallel before peer exposure — satisfies "force independent commitments first."
- `repo_fact`: **Bounded rounds + bounded repair fold** of `REQUIRED_EDITS`, with `shouldAttemptRepair` correctly refusing repair when an absolute veto exists.
- `repo_fact`: **Persisted JSON/Markdown artifacts** and configurable roster via `AGENTS_COUNCIL_MEMBERS`.

### Failure modes

- `repo_fact`: **Convergence by lexical similarity** (token-set Jaccard / pairwise draft overlap in `isConverged`). Semantically blind and gameable: members can converge in prose while a material disagreement persists (false consensus), or diverge in prose while agreeing in substance (false continuation). Highest-priority latent defect. Confidence: high it is weak; moderate it causes real false-consensus absent measurement.
- `repo_fact` (cause) + `source_claim` (fix): **No provenance/verification gate.** Ratification asks members to self-check, but self-check by the same model families does not catch *correlated* hallucination. The prior run blocked for exactly this reason.
- `repo_fact`: **Security — bearer header in curl argv.** `fetchTextWithTimeout` shells out to `curl` (a Bun 1.3.11 `fetch()` hang workaround) passing `Authorization: Bearer …` through command arguments, visible in `ps`/`/proc`.
- `repo_fact`: **Retry asymmetry.** OpenRouter retries 3×; direct Moonshot/DeepSeek share the fetch helper but lack the same explicit retry loop in the derived summary. A transient blip silently drops a member, shrinking effective quorum.
- `repo_fact` + `source_claim`: **n=2 default is deadlock-prone.** With absolute vetoes and two members, any single `BLOCK` ends `blocked` with no majority to break ties.
- `assumption`: **Residual anchoring** in deliberation rounds, where members see a single synthesized candidate. Partial, not fatal (round-0 is blind, `repo_fact`); the fix is sending the compressed issue map instead of full candidate prose. Cheapest verification: inspect what `buildDeliberationMessages` transmits.

### Missing invariants

1. No factual claim enters ratified consensus without a provenance label (and a verification path for `assumption`s). *Absence caused the prior block.*
2. Convergence requires zero open high-severity contested claims, not lexical overlap.
3. Effective quorum is preserved — a transport-dropped member must not silently change the outcome.
4. Round-0 commitments are persisted as immutable per-member artifacts for audit (`repo_fact`: proposals are stored; `assumption`: not pinned as immutable commitments).
5. Persistent disagreement is preserved as a first-class minority artifact, never smoothed into fake unanimity (`source_claim`).

### Conflict resolution between sources

- **Conceptual doc recommends a mediator/issue-map stage; deep-research warns a single judge hallucinates; the repo already avoids a dictator.** Resolved in favor of the repo's instinct: **build the issue map deterministically in code** from schema-validated outputs, rather than implementing the mediator as an LLM. This captures the conceptual doc's compression/audit benefit while honoring the deep-research caution. Confidence: high.
- **Conceptual doc: weight only with calibration data; deep-research: weighted aggregation is the default for small honest groups.** No calibration or agent-performance store is identified in the current-system brief (`assumption`; cheapest verification: inspect code/artifacts for any calibration or agent-performance store). Resolved: **equal weights now**; start logging traces; revisit only when held-out accuracy exists. Confidence: high.

---

## P0 / P1 / P2 improvement list

### P0-1 — Remove bearer header from curl argv
- **Label:** `repo_fact` (risk); `assumption` (fix mechanism).
- **Rationale:** Bearer tokens in argv are readable by any local process; on shared/compromised hosts this is direct exposure of the active provider bearer token(s) visible in live process listings (`ps`/`/proc`).
- **Expected benefit:** Closes a concrete secret-leak vector; no behavior change.
- **Sketch:** Pass auth via a curl config read from stdin (`curl -K -` with `header = "Authorization: Bearer …"`) or a 0600 temp file (`-H @file`) deleted immediately after spawn; preserve the existing timeout resolver. Better long-term: feature-detect the Bun version; if the `fetch()` hang no longer reproduces, drop the curl shell-out entirely and eliminate the bug class.
- **Risk/tradeoff:** Config-via-stdin/file behavior must be confirmed for the installed curl and Bun `spawn`. Token remains transiently in process memory (acceptable).
- **Validation:** Unit test asserting spawned argv contains no `Bearer`; live `ps`/`/proc` inspection during a call; preserve the existing OpenRouter timeout test.
- **Blocked by missing evidence:** No.

### P0-2 — Provenance-label invariant + ratification gate
- **Label:** `repo_fact` (ratification schema and prior-block cause); `source_claim` (label taxonomy).
- **Rationale:** The prior run blocked because factual/repo claims were unlabeled and unverified; no invariant prevents an unlabeled factual claim from entering consensus.
- **Expected benefit:** Prevents recurrence of the exact observed failure; makes consensus auditable; low added LLM call count (`assumption`; verify by measuring token/call overhead in the evaluation gate).
- **Sketch:** Extend proposal/deliberation/ratification schemas so each factual claim carries `label ∈ {repo_fact, source_claim, assumption}`, `evidence`, and (for `assumption`) `cheapest_verification`. Add a deterministic precondition in front of `parseRatificationVote`: an unlabeled factual claim, or an `assumption` lacking a verification step, is a `PROTOCOL` block precondition. Reuse existing `BLOCK_KIND`; keep `FACTUAL_ERROR` absolute. Members may upgrade an `assumption` to `source_claim`/`repo_fact` during deliberation when evidence is supplied.
- **Risk/tradeoff:** Label-gaming — members mark everything `assumption` to pass. Mitigate by requiring `repo_fact` claims to cite an evidence-pack ID (P1-1) and retaining the `FACTUAL_ERROR` veto.
- **Validation:** Planted-false-claim test (inject an unlabeled false repo claim; assert the gate flags/blocks it); regression on existing ratification tests.
- **Blocked by missing evidence:** Partially — full `repo_fact` enforcement is stronger with the evidence pack (P1-1); the label requirement itself is not blocked.

### P0-3 — Direct-provider retry parity
- **Label:** `repo_fact`.
- **Rationale:** Direct Moonshot/DeepSeek lack OpenRouter's 3× retry; a transient failure silently drops a member, shrinking quorum and possibly flipping an outcome.
- **Expected benefit:** Reliability; preserves effective quorum; surfaces dropouts as run-integrity events.
- **Sketch:** Factor the OpenRouter retry/backoff into the shared `askDirectChatProvider`/`fetchTextWithTimeout` path; classify retryable status codes; cap attempts; log each attempt; treat an unrecoverable member dropout as a loud run-integrity event rather than ratifying with a silently shrunk council.
- **Risk/tradeoff:** Retrying non-idempotent failures wastes tokens; cap and gate on status class.
- **Validation:** Mocked timeout/5xx tests for OpenRouter, Moonshot, DeepSeek; fault injection.
- **Blocked by missing evidence:** No.

### P0-4 — Structured JSON schemas for proposals/deliberation/ratification (with text fallback)
- **Label:** `source_claim` (structured-output discipline); `assumption` (validator dependency availability).
- **Rationale:** The issue map (P1-2) and claim-ledger convergence (P1-3) require machine-parseable claims; the label gate (P0-2) is far stronger on structured claims than on prose. Structured output also reduces round-0 prose anchoring.
- **Expected benefit:** Foundational enabler for all P1 structural work; deterministic claim extraction; stronger tests.
- **Sketch:** Define narrow TypeScript schemas (use Zod if already a dependency — `assumption`, cheapest verification is `package.json` inspection; otherwise a lightweight native validator):
  - `IndependentProposal { position, confidence, key_claims: Claim[], evidence[], assumptions[], strongest_objection_to_self, decision_relevant_uncertainties[] }`
  - `Claim { id, text, provenance: "repo_fact"|"source_claim"|"assumption", evidence[], severity?: "low"|"medium"|"high" }`
  - `DeliberationResponse { consensus_status, material_disagreements[], changed_mind_on[], unchanged_claims[], new_evidence[], unresolved_blockers[], confidence_after_revision, candidate_consensus }`
  - `RatificationVote { verdict, block_kind?, required_edits?, claim_objections? }`
  Request JSON mode where the provider supports it; on parse failure, fall back to the existing text parsing and log the parse-fail rate. Do not let structured mode drive any decision until the v1 parse rate clears the gate.
- **Risk/tradeoff:** Models may ignore JSON mode or emit malformed JSON; fallback preserves availability but reintroduces the unstructured path. Parse-fail rate must be <5% before convergence/ratification depend on it.
- **Validation:** Mocked-provider unit tests; observational parse-success metric over ≥50 sample runs.
- **Blocked by missing evidence:** Validator dependency choice is blocked until `package.json` is inspected; native validation is always possible.

### P1-1 — Evidence pack / grounding stage
- **Label:** `source_claim` (docs); `repo_fact` (prior-failure cause).
- **Rationale:** The prior run lacked this repo-grounded current-system brief → correlated hallucination. This rerun's manual brief *is* the proof of concept; productionize it.
- **Expected benefit:** Cuts correlated factual error at the source; binds `repo_fact` labels to verifiable IDs.
- **Sketch:** Add an optional `evidencePack: {id, text, source}[]` input to `runModelCouncil`; prepend to proposal system messages; require `repo_fact` claims to reference a pack ID. Pack *generation* tooling is out of scope; the runner only accepts and enforces the contract.
- **Risk/tradeoff:** A stale/wrong pack poisons all members (single point of failure) — version the pack (e.g., commit hash) and make it itself verifiable.
- **Validation:** Ablation with/without pack on a repo-QA set; measure planted-error detection and hallucination rate.
- **Blocked by missing evidence:** No for the input plumbing.

### P1-2 — Deterministic claim-level issue map + dispute packets
- **Label:** `source_claim` (conceptual doc); `assumption` (net benefit at this n).
- **Rationale:** Deliberation currently sends full peer drafts and regenerates full candidate prose each round (`repo_fact`) — prose-level, not claim-level. A code-built issue map yields claim-level resolution and an audit artifact.
- **Expected benefit:** Claim-level resolution, auditable ledger, modest token savings at this scale (honest about magnitude — see executive rationale).
- **Sketch:** Parse schema-validated claims (P0-4); build `IssueMap` (`agreed_claims`, `contested_claims` with supporters/opposers/evidence/severity/resolver_type/label, `candidate_decisions`, `missing_information`) **in code, no LLM mediator**. Cluster by normalized exact match in v1; **upgrade path is embedding similarity, not an LLM judge**, gated on measured misclustering >10%. An LLM may assist clustering *only* as a non-deciding step whose output is a challengeable artifact in the rebuttal round. Send each member only its relevant contested claims (the dispute packet); members emit revisions-only; update the map in code; assemble the candidate from agreed+resolved claims plus a minority report — still peer-derived. On parse failure, fall back to the current draft flow.
- **Risk/tradeoff:** Malformed schemas; exact-match misses paraphrases. Mitigate with schema-validated retries, a free-text rationale field per claim, and the embedding upgrade path.
- **Validation:** Ablation issue-map vs. full-draft on tokens, rounds, accuracy, false-consensus; manual audit of 20 issue maps for misclustering.
- **Blocked by missing evidence:** No, but higher effort — gate behind the observational rollout (v1 below).

### P1-3 — Claim-ledger convergence + stopping (demote Jaccard to telemetry)
- **Label:** `repo_fact` (current uses Jaccard); `source_claim` (better stopping rules).
- **Rationale:** Lexical similarity is a weak, gameable proxy; false consensus and false continuation both occur.
- **Expected benefit:** Semantically meaningful, measurable stopping condition.
- **Sketch:** Converge when (no open contested claim with severity ≥ high) **OR** (no member changed a decision-relevant claim this round) **OR** (all remaining contested claims have `resolver_type ∈ {judgment, unavailable_evidence}` → emit minority report / `qualified_consensus`). Keep Jaccard only as secondary telemetry/tie-break.
- **Risk/tradeoff:** Depends on claim parsing (P0-4/P1-2); fall back to current detector on parse failure.
- **Validation:** Planted-disagreement set; measure false-consensus and false-continuation rates; tasks where drafts become textually similar but preserve factual conflict must yield `blocked`/minority report, not `ratified`.
- **Blocked by missing evidence:** Depends on P1-2.

### P1-4 — Task-type router
- **Label:** `source_claim`; `assumption` (implementation gap).
- **Rationale:** Categorical, ranked, probabilistic, design, and repo-grounded tasks need different aggregation rules; one rule cannot fit all output types. This resolves whether to use algorithmic aggregation or peer-derived candidate.
- **Expected benefit:** Correct aggregation per output type; avoids forcing prose tasks through categorical voting.
- **Sketch:** Classify the prompt into `design_proposal` | `factual` | `code_review` | `ranking` | `probability` | `open_research`. For categorical/ranking/probability, apply algorithmic aggregation (equal-weight vote; Borda/Condorcet for small option sets; log opinion pool with floor clipping). For design/open-ended (this council's dominant class), keep the peer-derived candidate plus the claim-ledger ratification gate. Expose the chosen route in the artifact; allow config override (`AGENTS_COUNCIL_TASK_TYPE`).
- **Risk/tradeoff:** Routing mistakes; keep override and log the route.
- **Validation:** Fixture prompts assert chosen route and rule.
- **Blocked by missing evidence:** No.

### P1-5 — Targeted verification hook (only where it changes a decision)
- **Label:** `source_claim`.
- **Rationale:** Self-check by the same models misses correlated, checkable errors. Verify only contested, decision-relevant, checkable claims (the constraint "use external verification only where it changes decisions").
- **Expected benefit:** Catches checkable hallucinations the whole panel shares.
- **Sketch:** Type the interface as `VerificationRequest {claimId, kind, command?, source?, expected?}` → `VerificationResult`. Classify by `resolver_type`; for `{code, calculation, source_check}` that are contested AND severity ≥ high, run an executor — start with the cheapest, **source_check against the evidence pack** (string/ID match, no code execution). Feed verdicts into the ledger. Leverage existing MCP/summon infrastructure (`repo_fact`) with a separate `mcp__verify__` prefix; allowlisted and read-only by default; timeout with fallback to "unverified" so a tool failure never deadlocks.
- **Risk/tradeoff:** Executor scope creep; tool latency. Defer code/test execution until a sandbox exists.
- **Validation:** Planted checkable-error detection rate; tokens spent on verification vs. decisions actually changed.
- **Blocked by missing evidence:** Executors beyond source-check are blocked (`assumption` about available tooling). Cheapest verification: inspect the summon MCP tool inventory.

### P1-6 — Minority report as required artifact
- **Label:** `source_claim`; `repo_fact` (ratification votes already record blocks).
- **Rationale:** Persistent disagreement is information, not noise; fake unanimity is harmful.
- **Expected benefit:** Downstream consumers see unresolved blockers and the cheapest check that would change the decision.
- **Sketch:** Extend `ConsensusResult` and Markdown with `minorityReport: {agent_id, position, claim_ids, block_kind, severity, required_check}[]`. When `buildConsensusResult` returns `blocked` *or* `qualified_consensus`, the minority report is a primary artifact alongside the candidate. CLI exit code non-zero on `blocked` to signal harnesses.
- **Risk/tradeoff:** Final answers feel less decisive — preferable to false unanimity.
- **Validation:** Test that one absolute veto preserves dissent in both JSON and Markdown.
- **Blocked by missing evidence:** No.

### P2-1 — Roster/quorum defaults
- **Label:** `repo_fact` (default n=2); `source_claim` (3 proposers + critic).
- **Rationale:** n=2 with absolute vetoes deadlocks; no majority to break ties. Anthropic+OpenAI family diversity is good for de-correlation.
- **Sketch:** Default to odd n ≥ 3 heterogeneous for decision tasks; keep n=2 for cheap drafts. Pure config via `AGENTS_COUNCIL_MEMBERS` — no code change.
- **Risk/tradeoff:** Cost rises linearly; more same-family members ≠ better.
- **Validation:** Accuracy-vs-n ablation {2,3,5}; cost tracking.
- **Blocked by missing evidence:** No.

### P2-2 — Trace logging for future calibration (do not build the learner)
- **Label:** `source_claim` (DAgger/learned routing); `assumption` (downstream consumption).
- **Rationale:** Weighted voting and learned stopping need data that does not exist. Start collecting; resist building the learner.
- **Sketch:** Persist per-claim, per-member, per-round structured traces + outcome + ground-truth (when available). Reuse existing JSON persistence; add `issue-map-{ts}.json`. Keep equal weights until N≥30 labeled samples per agent exist; never weight by prestige.
- **Risk/tradeoff:** Minimal storage; premature weighting amplifies prestige bias.
- **Validation:** Schema-completeness check; later offline Brier/log-loss feasibility.
- **Blocked by missing evidence:** HALO/downstream consumption is `assumption` (the brief marks `deliberations/*.json → council_to_brief.py → HALO-X` unverified). Cheapest verification: read `council_to_brief.py`'s input contract.

### P2-3 — BFT finalization (explicitly deferred)
- **Label:** `source_claim`.
- **Rationale:** Semantic deliberation is not Byzantine consensus. The current fault model is honest operator-run models.
- **Blocked by missing evidence:** Yes — adversarial requirement not established. Do not build.

---

## Consensus protocol spec (predeclared rules)

*Labeling note (per required edit): each rule is tagged for whether it describes current repo behavior (`repo_fact`), is grounded in the source docs (`source_claim`), or is proposed-but-unverified behavior not present in the current repo (`assumption`).*

- **Independence:** Round-0 proposals generated in parallel and blind; no member sees a peer before submitting (`repo_fact`). Each member's round-0 commitment persisted *immutably* (`assumption` — brief states proposals are stored, not that they are pinned immutable). Structured schema — `position`, `confidence`, `key_claims[]`, `evidence[]`, `assumptions[]`, `strongest_objection_to_self`, `decision_relevant_uncertainties[]` — the field list is `source_claim` (from the conceptual doc) and its adoption is `assumption` (proposed, not in repo).
- **Issue-map construction:** Deterministic, code-built from schema-validated claims with **no LLM mediator holding decision authority** (`assumption` — proposed). Every factual claim carries a provenance label and evidence (`source_claim` for the taxonomy; `assumption` for enforcement). The map is a persisted, challengeable artifact (`assumption` — proposed). Clustering: normalized exact match in v1; embedding upgrade gated on measured misclustering >10% (`assumption` — proposed).
- **Rebuttal:** ≤2 targeted rounds (default 1, hard cap 2), configurable via `AGENTS_COUNCIL_MAX_REBUTTAL_ROUNDS` (`assumption` — proposed; the repo's current control is `AGENTS_COUNCIL_MAX_ROUNDS`, `repo_fact`). Each member receives only the contested claims relevant to it plus agreed `candidate_decisions`; revisions-only schema (`changed_mind_on`, `unchanged_claims`, `new_evidence`, `unresolved_blockers`, `confidence_after_revision`); restating uncontested material disallowed (`source_claim` for the schema/discipline; `assumption` for implementation).
- **Verification:** Classify each claim by `resolver_type`; run a check only for contested, decision-relevant, checkable claims (severity ≥ high); verdicts enter the ledger as evidence; verified claims move to `agreed` or gain `verification_failed`. No verification on claims that cannot change a decision (`source_claim` for the principle; `assumption` for the hook implementation).
- **Voting / aggregation:** Equal weights for now (`assumption`: no calibration or agent-performance store is identified in the current-system brief; cheapest verification is to inspect code/artifacts for any calibration or agent-performance store). Route by task type (P1-4, `assumption` — proposed): categorical → weighted-equal vote, accept if support ≥ 0.75 and no unresolved high-severity objection and ≥1 verification path confirms; ranking → Borda/Condorcet for small option sets; probability → log opinion pool with floor clipping; design/open-ended → peer-derived candidate + consensus-core/majority/minority/decision-critical-uncertainty structure (aggregation rules `source_claim`; routing `assumption`).
- **Ratification:** Keep `ACCEPT`/`ACCEPT_WITH_EDITS`/`BLOCK` with typed `BLOCK_KIND`; `FACTUAL_ERROR` and `MATERIAL_DISAGREEMENT` remain absolute vetoes; `ratified` only if all ratifiers `ACCEPT` (all `repo_fact`). Members ratify the exact candidate (`repo_fact`) **plus the issue map plus verification results** (`assumption` — proposed). Add preconditions (all `assumption` — proposed): (i) no unlabeled factual claim; (ii) no `assumption` lacking a verification step; (iii) no open severity-≥-high contested claim.
- **Stopping:** Max rounds (`repo_fact`). Stop also when open high-severity contested claims = 0, OR no member changed a decision-relevant claim, OR all remaining contested claims are `judgment`/`unavailable_evidence` (→ minority report), OR repair has failed once (all `assumption`/`source_claim` — proposed). Persistent disagreement is preserved, never forced into unanimity (`source_claim`). Do not continue merely because "some disagreement remains."
- **Outcome states:** Keep `not_attempted`/`ratified`/`blocked` (`repo_fact`). **Proposed extension** (`assumption` — `buildConsensusResult` currently returns only the three): add `qualified_consensus` for the case where the resolvable core is agreed but residual `judgment`/`unavailable_evidence` claims remain — emitted with the minority report rather than a hard `blocked`. This distinguishes "blocked by veto/error" from "agreed core + preserved dissent." Reserve `blocked` for absolute vetoes and unresolved high-severity contested claims.
- **Repair:** Keep the bounded synthesis fold of `REQUIRED_EDITS`; no repair when an absolute veto exists (keep current `shouldAttemptRepair`) (`repo_fact`). Repair edits must map to claim IDs; re-ratify changed claims once; cap at one repair round (`assumption` — proposed).
- **Escalation:** On n=2 deadlock or an unresolved high-severity contested claim, escalate by adding one heterogeneous member or a tool-equipped verifier; if still unresolved, return `no_consensus`/`blocked`/`qualified_consensus` + minority report + *the one check that would most change the conclusion* (`assumption`/`source_claim` — proposed).

---

## System architecture changes (mapped to the current runner)

Current stages (`repo_fact`): normalize → `buildDefaultMembers` → `validateCouncilConfig` → parallel proposals (`buildProposalMessages`) → rounds[`buildDeliberationMessages` → `buildCandidateConsensus` → `isConverged`] → ratification (`buildRatificationMessages`/`parseRatificationVote`) → repair → `saveModelCouncilRun`.

**Implement additively, behind a feature flag — do not fork a parallel `delphiCouncil.ts`** (that duplicates provider routing/persistence/config and will drift). New pure-function modules wired into the existing `runModelCouncil` (all new files/flags/vars below are `assumption` — proposed, not present in the current repo):

- `src/core/services/council/schemas.ts` (`assumption`) — types + JSON-schema validators (`IndependentProposal`, `Claim`, `DeliberationResponse`, `RatificationVote`); JSON-mode request with text-parse fallback (P0-4).
- `src/core/services/council/issueMap.ts` (`assumption`) — `buildIssueMap`, `makeDisputePacket`, `normalizeClaim`, claim-convergence helpers. Pure, no LLM calls.
- **Evidence-pack injection** before proposals (P1-1, `assumption`): new optional input to `runModelCouncil`.
- **Claim-ledger convergence** in `isConverged` (P1-3, `assumption`); Jaccard retained as telemetry.
- **Verification hook** between map-update and ratification (P1-5, `assumption`); source-check executor first; `mcp__verify__` prefix.
- **Ratification gate extension** (P0-2, `assumption`): deterministic label/contested-claim preconditions in front of `parseRatificationVote`.
- **Task-type router** (P1-4, `assumption`) selecting schemas and aggregation.

**Config (all `assumption` — proposed):** `AGENTS_COUNCIL_STRUCTURED` (gate the new path; legacy default until validated), `AGENTS_COUNCIL_MAX_REBUTTAL_ROUNDS` (default 1), `AGENTS_COUNCIL_ENABLE_VERIFICATION`, protocol-version stamp in artifacts. CLI: preserve current `council solve` (`repo_fact`); optionally expose the new protocol via `council solve --method delphi` (`assumption`) until it becomes default.

**Persisted artifacts:** keep `council-{ts}.json/.md` (`repo_fact`); add `issue-map-{ts}.json` (`assumption`) (labeled claim ledger + immutable round-0 commitments + dispute packets + revisions + verification results + minority report + chosen route). **Interfaces (all `assumption` — proposed):** `ClaimSchema {id, text, kind, provenance, evidence[], severity, resolver_type, supporters[], opposers[], rationale}`; `IssueMap`; `DisputePacket`; `VerificationRequest`/`VerificationResult`. All additive; none remove peer-derived nomination or typed-veto ratification. Keep interfaces narrow and serializable until schemas stabilize.

---

## Evaluation plan

- **Benchmark tasks:** (1) held-out repo-QA set with planted false claims, including a reproduction of the prior blocked prompt *with* an evidence pack (target: it now ratifies); (2) factual verification (FEVER/HotpotQA, `source_claim`) for the verification gate; (3) multi-step math (GSM8K) and code (HumanEval) for claim decomposition; (4) the council's own design-deliberation tasks scored by blinded rubric.
- **Baselines (mandatory honesty gate):** single strong model; **self-consistency** (`source_claim`); current council protocol; claim-ledger Delphi without verification; with verification. If structured council does not beat self-consistency on the task distribution, the machinery is not justified there — deprecate.
- **Metrics:** accuracy; **planted-error / unsupported-repo-claim detection rate** (key new metric); false-consensus rate; false-continuation rate; absolute-veto precision; tokens-per-resolved-claim; rounds-to-converge; wall-clock; provider-failure/retry counts; repair success rate; minority-report usefulness; credential-exposure regression; structured-output parse-success rate.
- **Ablations:** Jaccard vs. claim-ledger convergence; with/without evidence pack; with/without verification; issue-map vs. full-draft deliberation; deterministic exact-match vs. embedding clustering; n ∈ {2,3,5}; structured vs. free-text proposals; task-type router vs. single rule.
- **Regression gates:** existing `modelCouncil.test.ts` (`repo_fact`: roster, routing, timeout, prompt protocol, candidate builder, repair, ratification gate, absolute veto, signal parsing, early stop) stays green; `bun run typecheck` clean; no `Bearer` in child argv; JSON parse-failure rate <5% (else legacy path engages); token cost not above legacy for identical prompts unless accuracy improves; ratified/blocked distribution within ±10% on a held-out set unless ground truth shows new blocks are correct.
- **Failure taxonomy:** false consensus; false continuation; hallucinated/unsupported claim survives ratification; synthesis distortion; n=2 deadlock; transport drop shrinking quorum; label-gaming; parse failure; misclustering; verifier false positive/negative; credential exposure; artifact contamination/missing provenance.

---

## Rollout plan

- **v0 (ship first):** P0-1 (curl argv) + P0-3 (retry parity). Pure ops, zero protocol change, zero decision-quality risk.
- **v1 (observational):** P0-2 (label invariant, *best-effort* — `assumption`, since deterministic enforcement of the label gate before structured-parse reliability is validated in P0-4 is necessarily heuristic rather than an invariant) + P0-4 (structured schemas with fallback) + P1-1 (evidence pack) + P1-2 **observational only** — parse claims and persist `issue-map.json`, keep Jaccard as the decision-maker. Validates parse reliability (>95% target) without changing outcomes. Behind `AGENTS_COUNCIL_STRUCTURED`.
- **v2 (protocol switch):** switch convergence + ratification gate to the claim ledger (P1-3, P0-2 enforced) + P1-6 minority report; enable targeted dispute-packet rebuttal as default deliberation; flip structured to default once parse rate and token cost pass gates.
- **v3 (verification):** P1-5 verification executors where they change decisions (source-check first); P1-4 router full rollout.
- **Config, anytime:** P2-1 default roster (odd n ≥ 3 for decision tasks); P2-2 trace logging on.
- **Migration:** keep current CLI behavior; stamp protocol version in artifacts; append issue-map/minority-report sections to Markdown; per-run output directories for evaluation isolation.
- **Do NOT build yet:** weighted voting (`assumption`: no calibration or agent-performance store is identified in the current-system brief — but start logging, P2-2); BFT/PBFT/HotStuff (honest group); argument graphs/Dung semantics (over-engineered at n=2–5); hierarchical/gossip topology (n far too small); embedding clustering (until misclustering >10% measured); a learned router/DAgger learner (no logged traces yet); HALO-X integration claims (unverified — gather repo evidence first).

---

## Security / operations notes

- `repo_fact`: **Bearer-in-argv via curl** is the live secret-leak risk (P0-1). Interim fix: header via curl config from stdin/0600 temp file so it never enters argv. Root-cause fix: re-test the Bun `fetch()` hang and remove the curl shell-out if resolved.
- `repo_fact`: provider keys (`MOONSHOT_API_KEY`, `DEEPSEEK_API_KEY`, `OPENROUTER_API_KEY`) are required and read from environment variables (per `validateCouncilConfig`); the source-identified live leak is specifically the argv exposure of the active bearer header, not the env storage.
- `repo_fact`: retry asymmetry (P0-3) is an availability/integrity issue — treat a member dropout as a run-integrity event: log it and fail loudly rather than ratify with a silently shrunk council.
- `assumption`: artifact directories can mix runs if harnesses are careless; keep per-run output dirs. Cheapest verification: inspect save paths and rerun-harness isolation.
- `assumption`: persisted prompts/responses may contain sensitive data; add a redaction pass and verify provider keys never reach artifacts. `repo_fact`: the `mcp__council__` prefix is good isolation; verification tools should use a distinct `mcp__verify__` prefix. Sanitize user-influenced `key_claims` (length limits, strip markup) before clustering.

---

## Open questions and rejected alternatives

**Open questions (with cheapest verification):**
1. Is the `deliberations/*.json → council_to_brief.py → HALO-X` pipeline real? `assumption` — the brief marks it unverified. Verify: read `council_to_brief.py`'s input contract.
2. Does the Bun `fetch()` hang still reproduce on the current version? Verify: one long-reasoning request through `fetch` with a timeout.
3. Is a JSON-schema validator (Zod) already a dependency? Verify: inspect `package.json`.
4. Does claim parsing hit acceptable reliability on these models? Resolved by the v1 observational rollout.
5. What is the current Jaccard false-positive rate and the all-to-all token baseline? Verify: log analysis on existing `council_runs/`.
6. Is there an existing embedding library in the repo (determines clustering upgrade path)? Verify: inspect dependencies.

**Rejected alternatives:**
- **LLM mediator/judge to build the issue map** — single-point hallucination; contradicts the deep-research caution it would cite; rejected 4–0 in the latest round. Build the map deterministically; upgrade via embeddings, not a judge. Reconsider only after empirical evidence shows current member count or topology makes deterministic issue-map construction a bottleneck; the sources establish O(n²r) vs O(nr) scaling pressure and hierarchy/gossip for roughly 10+ agents, not a fixed small-team threshold.
- **Forking a parallel `delphiCouncil.ts`** — duplicates provider routing/persistence/config and drifts; wire additive modules behind a flag instead.
- **Replacing the peer-derived candidate with hard algorithmic aggregation for all tasks** — wrong for the open-ended/design class this council dominates; routed (P1-4) so algorithmic rules apply only to categorical/ranking/probability.
- **Weighted voting now** — no calibration or agent-performance store is identified in the current-system brief (`assumption`); both docs warn against uncalibrated prestige weighting. Revisit after P2-2 logging yields held-out accuracy.
- **BFT/PBFT/HotStuff** — wrong fault model; honest operator-run group.
- **More than 2 rebuttal rounds** — source literature shows diminishing returns and debate-induced degradation; bounded protocol preferred.
- **Argument graphs / Dung semantics; many-agent diversity + clustering; hierarchical/gossip** — unjustified at n=2–5.
- **Single-agent self-consistency as a replacement** — steelmanned as cheapest; rejected as default because the system has invested in epistemic separation across model families and typed ratification, but retained as the mandatory baseline that the council must beat or be deprecated for that task class.

**What would change the recommendation:** if v1 shows claim parsing is unreliable (malformed schemas or misclustering >~10%), downgrade the issue map (P1-2/P1-3) to an audit-only artifact and keep an improved-but-lexical convergence signal — the P0 label gate then carries the proposal alone. If the structured council fails to beat self-consistency on the benchmark, the deliberation apparatus is not justified for that task class regardless of protocol elegance. If the default council size is demonstrated to exceed ~10 agents regularly, hierarchical topologies and embedding clustering become justified.

**Confidence summary:** P0-1/P0-3 and the rejections — high. P0-2 fixes the observed failure — high. P0-4 structured schemas as enabler — high (with text fallback). Task-type router and minority-report artifact — high. `qualified_consensus` outcome as a useful but non-essential extension — moderate. Issue-map *net* benefit at this small n — moderate (needs the ablation). The framing correction that efficiency arguments do not transfer at n=2 — high. Deterministic-over-mediator resolution — high.

**Minority objections preserved:** None unresolved. Latest peer precision edits are incorporated; no unresolved minority dissent remains in the final peer positions.
