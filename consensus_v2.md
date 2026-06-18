Confidence: **high**.

The two uploaded proposals are not really competitors at the same level. The **Claim-Ledger Delphi proposal** is the better **implementation plan** for the current `agents-council` repo. The **deep-research optimization report** is the better **research/contextual justification** and benchmark framing. Use Proposal 1 as the controlling design; import selected evaluation and verification emphasis from Proposal 2.

I’ll call them:

| Name here                                         | Uploaded file                                                            | Core identity                                                                                                                                    |
| ------------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Proposal 1: Claim-Ledger Delphi**               | `consensus_approach_council4_repo_grounded_proposal_with_gpt_edits...md` | Repo-grounded implementation proposal with provenance labels, deterministic claim ledger, staged rollout, and explicit P0/P1/P2 plan.            |
| **Proposal 2: Deep-research optimization report** | `deep-research-report (1).md`                                            | Research-grounded optimization report: structured Delphi, mediator/verifier layer, selective verification, broader literature, benchmark suite.  |

## Bottom-line verdict

**Proposal 1 is stronger for implementation. Proposal 2 is stronger for explanatory framing.**

Proposal 1 wins because it is more precise about the actual failure mode of the previous council run: unsupported project-specific claims entering the candidate without explicit provenance. It makes the labeled claim, not the prose candidate, the unit of deliberation; it adds a deterministic ratification precondition; and it explicitly maps changes into the current runner without forking the system. 

Proposal 2 correctly identifies the broad protocol target: independent structured first pass, issue-map compression, targeted rebuttal, selective verification, and ratification with minority objections preserved. But it is less disciplined about repo-grounding, less strict about provenance labels, and somewhat too aggressive in marking issue-map mediation, verification, and repair as immediate P0 work. 

## The real difference

The key distinction is this:

> **Proposal 2 says: add a structured Delphi mediator/verifier layer.**
> **Proposal 1 says: make a deterministic, provenance-labeled claim ledger the control object and gate ratification on it.**

That difference matters. A mediator layer can become another LLM bottleneck unless tightly constrained. Proposal 1 explicitly rejects an LLM judge/mediator as the decision authority and says the issue map should be code-built from schema-validated claims. That is the safer and more repo-compatible interpretation of Delphi. 

## Side-by-side comparison

| Dimension                            | Proposal 1: Claim-Ledger Delphi                                                                                   | Proposal 2: Deep-research report                                                                  | Winner                                   |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| **Repo grounding**                   | Strict: every implementation-specific claim is labeled `repo_fact`, `source_claim`, or `assumption`.              | Repo-aware, but less strict about provenance discipline.                                          | **Proposal 1**                           |
| **Central invariant**                | No unlabeled factual claim enters ratified consensus; assumptions require cheapest-verification steps.            | Structured claims/assumptions are recommended, but not as hard an invariant.                      | **Proposal 1**                           |
| **Middle-layer design**              | Deterministic code-built issue map; no LLM mediator with decision authority.                                      | “Mediator-built issue map”; mediator is constrained, but ambiguity remains about implementation.  | **Proposal 1**                           |
| **Convergence rule**                 | Replace Jaccard/text overlap with claim-ledger convergence: zero open high-severity contested claims.             | Demote lexical similarity and use issue-map stability. Similar idea, less formal.                 | **Proposal 1**                           |
| **Rollout discipline**               | v0 ops fixes → v1 observational structured parsing → v2 protocol switch → v3 verification.                        | Short/medium/long roadmap, but P0 is too broad.                                                   | **Proposal 1**                           |
| **Security/ops**                     | Very concrete: bearer header in curl argv, direct-provider retry parity, run-integrity events.                    | Also identifies bearer-header risk and retries, but less implementation-specific.                 | **Proposal 1**                           |
| **Verification strategy**            | Conservative: source-check first; verify only high-severity, decision-changing claims.                            | Stronger emphasis on selective verification before ratification.                                  | **Tie / slight Proposal 2 for emphasis** |
| **Evaluation design**                | Strong repo-specific gates: planted false repo claims, parse failure rate, no `Bearer` in argv, Jaccard ablation. | Stronger broad benchmark suite: MMLU, GSM8K, GPQA, HotpotQA, FEVER, StrategyQA, MuSR, TruthfulQA. | **Tie: combine them**                    |
| **Treatment of weighted voting**     | Equal weights until calibration data exists; trace logging first.                                                 | Same conclusion, more literature support.                                                         | Tie                                      |
| **Handling n=2 default**             | Correctly says n=2 cost savings are negligible and deadlock risk is real.                                         | Correctly recommends adaptive 3-member standard mode for harder tasks.                            | **Tie / slight Proposal 1 for honesty**  |
| **Compatibility risk**               | Explicitly says do not fork `delphiCouncil.ts`; preserve current CLI/artifacts; feature-flag changes.             | Also recommends incremental fit, but less exact.                                                  | **Proposal 1**                           |
| **Overall implementation readiness** | High.                                                                                                             | Moderate.                                                                                         | **Proposal 1**                           |
| **Overall research justification**   | Good.                                                                                                             | Better.                                                                                           | **Proposal 2**                           |

## Where Proposal 1 is better

### 1. It fixes the actual observed failure

Proposal 1 directly targets the previous blocked run: ChatGPT 5.5 required project-specific claims to be marked as assumptions unless verified from repo evidence. Proposal 1 turns that into the main invariant: every factual claim must carry a provenance label, and every assumption must include a cheapest-verification step. 

Proposal 2 notices the same prior failure, but it frames the fix more broadly as earlier evidence/assumption checking. That is correct, but weaker. The hard `repo_fact` / `source_claim` / `assumption` discipline in Proposal 1 is the more robust fix. 

### 2. It is more careful about the mediator problem

Proposal 2 repeatedly uses “mediator” language. It says the mediator should compress disagreement and not decide, which is directionally right. But in an LLM-agent system, “mediator” tends to become a hidden judge unless the implementation prevents it. 

Proposal 1 is sharper: build the issue map deterministically in code, from schema-validated outputs, and allow any LLM clustering only as a non-deciding, challengeable artifact. That is the right engineering interpretation. 

### 3. It is more honest about n=2 economics

Proposal 2 says issue-map mediator and targeted rebuttal are the largest cut in wasted tokens. That is true for larger rosters, but for the current default two-member council the cost savings are not the main reason to do it. Proposal 1 explicitly says the O(n²r) → O(nr) efficiency argument is negligible at n=2, and that the issue map is justified by correctness, auditability, and stopping quality. That is a better inference from the actual system. 

### 4. It has a better rollout plan

Proposal 1’s rollout is the safer one:

```text
v0: fix curl bearer-header argv + retry parity
v1: structured parsing and issue-map artifact in observational mode
v2: switch convergence/ratification to claim ledger
v3: add selective verification executors
```

That is the right order. It avoids letting a fragile structured-output parser control consensus before parse reliability is measured. 

Proposal 2’s roadmap is good, but it pushes too much into “short-term” / P0: structured first pass, issue-map mediator, targeted rebuttal, selective verification, claim-level repair, transport hardening. That is too much simultaneous protocol change. 

## Where Proposal 2 is better

### 1. It gives the stronger research narrative

Proposal 2 does a better job explaining why the target is **decision quality per token under bounded latency**, not raw consensus speed. It also better synthesizes why multi-agent debate can fail: anchoring, overconfidence, error propagation, and failure to beat self-consistency. 

Proposal 1 includes the self-consistency kill-switch, but Proposal 2 makes the motivation clearer and more defensible. 

### 2. It has a broader benchmark plan

Proposal 1’s evaluation plan is better for repo regression. Proposal 2’s benchmark portfolio is better for external validity. It includes the right spread: MMLU, GSM8K, GPQA, HotpotQA, FEVER, StrategyQA, MuSR, TruthfulQA, plus calibration metrics and synthetic simulations. 

The best evaluation plan is the union: Proposal 1’s repo-specific planted-claim gates plus Proposal 2’s broader benchmark families.

### 3. It emphasizes verification earlier

Proposal 1 sensibly defers verification to v3 and starts with source-check against an evidence pack. Proposal 2 is stronger on the principle that selective verification should happen before final ratification, not merely at the end. 

The merged answer should be: do not build a broad verifier immediately, but do implement **evidence-pack source-checks** earlier than full tool execution. That gives you most of the grounding benefit without sandbox/tool sprawl.

## Main conflicts and how to resolve them

### Conflict 1: Mediator-built issue map vs deterministic issue map

**Proposal 2:** Add a mediator-built issue map.
**Proposal 1:** Build the issue map deterministically in code; no LLM mediator as authority.

**Resolution:** Adopt Proposal 1. A mediator may help summarize, but it must not be the source of truth. The control object should be a deterministic claim ledger assembled from structured member outputs. LLM assistance, if used, should be advisory and challengeable.  

### Conflict 2: What is P0?

**Proposal 2 P0:** Structured first pass, issue-map mediator, selective verification, claim-level repair, transport hardening.
**Proposal 1 P0:** Security fix, retry parity, provenance-label gate, structured schemas with fallback; issue-map only after observational validation.

**Resolution:** Adopt Proposal 1’s staging. Proposal 2’s P0 is conceptually right but too broad operationally. The first shipping pass should not change the semantic controller except for the provenance gate. 

### Conflict 3: Verification timing

**Proposal 2:** Selective verification before ratification is a central immediate move.
**Proposal 1:** Verification is P1/P3-ish, source-check first, broader executors deferred.

**Resolution:** Split verification into two levels:

```text
Level 1: evidence-pack/source-ID verification — early
Level 2: code/math/tool execution — later
```

This preserves Proposal 2’s insight while respecting Proposal 1’s rollout discipline.

### Conflict 4: Outcome semantics

**Proposal 1:** Considers `qualified_consensus` as a new outcome state.
**Proposal 2:** Warns not to break top-level JSON enums before downstream consumers are audited.

**Resolution:** Keep current top-level statuses initially: `not_attempted`, `ratified`, `blocked`. Add `qualified_consensus` as a nested semantic field or protocol extension only after artifact readers are checked. Proposal 1 already treats it as non-essential/moderate-confidence; Proposal 2 is right to be conservative here.  

## Recommended merged plan

Use this merged priority order:

### P0 — ship first

```text
1. Remove bearer headers from curl argv.
2. Add direct-provider retry parity.
3. Add provenance labels to factual claims.
4. Add deterministic ratification precondition:
   - no unlabeled factual claim;
   - no assumption without cheapest-verification step.
5. Add structured JSON schemas with robust text fallback.
```

This is mostly Proposal 1, with Proposal 2’s urgency on transport hardening retained.  

### P1 — observational structured mode

```text
1. Add evidence-pack input.
2. Parse claims into an issue-map artifact.
3. Persist issue-map / minority-objection / transport-event fields.
4. Keep current Jaccard convergence as the active controller during measurement.
5. Measure parse success, misclustering, tokens, and false-consensus cases.
```

This avoids prematurely trusting claim parsing. Proposal 1 is right that the issue map should be audit-only until reliability is measured. 

### P2 — switch protocol control

```text
1. Replace lexical convergence with claim-ledger convergence.
2. Use targeted dispute packets instead of full peer prose.
3. Make repair claim-level rather than prose-level.
4. Preserve minority reports as first-class artifacts.
5. Add source-check verification on high-severity contested claims.
```

This is the core Claim-Ledger Delphi transition, with Proposal 2’s selective-verification principle.  

### P3 — broader optimization

```text
1. Add task-type router.
2. Add adaptive 3-member default for harder design/research tasks.
3. Build calibration logs, but do not enable weighted voting yet.
4. Benchmark against single strong model and self-consistency.
5. Consider broader verification executors only after evidence-pack source-checks prove useful.
```

Proposal 2’s broader benchmark suite belongs here. Proposal 1’s kill-switch remains mandatory: if structured council does not beat self-consistency on a task family, disable it for that family.  

## Final ranking

**Best implementation authority:** Proposal 1.
**Best research justification:** Proposal 2.
**Best final design:** Proposal 1 + three imports from Proposal 2:

1. Stronger articulation of the goal: **decision quality per token under bounded latency**, not agreement speed.
2. Broader benchmark suite and calibration metrics.
3. Stronger emphasis on selective verification before ratification, implemented first as evidence-pack/source-check verification.

The decisive point: **do not implement Proposal 2 as a generic mediator-led council.** Implement Proposal 1’s deterministic **Claim-Ledger Delphi** and use Proposal 2 to justify, benchmark, and stress-test it.
