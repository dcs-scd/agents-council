# analogical-arxiv-scout-v6 — Improved Flattened Skill Bundle

Generated: 2026-05-28

This bundle is a strengthened successor to `analogical-arxiv-scout-v5`. It preserves the v5 architecture but adds operational enforcement: source ledgers, reproducible search logs, scoring rubrics, novelty calibration, variable-level transfer maps, anti-evidence handling, and concrete stop conditions.

## Contents

- SKILL.md
- agents/openai.yaml
- references/search-protocol.md
- references/source-ledger.md
- references/scoring-rubric.md
- references/discovery-operators.md
- references/kill-tests.md
- references/output-schemas.md

---

## SKILL.md

```markdown
---
name: analogical-arxiv-scout-v6
description: Evidence-coupled arXiv analogical discovery engine for finding structurally transferable mechanisms, reviewing papers independently, generating novel falsifiable proposals, and rejecting weak analogies through explicit source ledgers, variable maps, scoring, anti-evidence, and minimal falsifiers. Use when the user wants rigorous cross-domain paper scouting, analogy-based invention, limitation lifting, new abstractions, new evaluation axes, or high-novelty research proposals from arXiv and adjacent primary sources.
---

# Analogical ArXiv Scout v6

v6 is a disciplined invention-and-verification engine, not a related-work finder.

It turns a target problem into typed limitations and transfer slots; searches arXiv by mechanism, abstraction, and anti-evidence; reviews selected papers on their own terms; maps source mechanisms into target variables; generates candidate inventions; kills weak analogies; and emits reproducible research artifacts.

## Core Upgrade Over v5

v5 specified phases. v6 makes every phase leave a checkable artifact.

No analogy may be promoted unless it has:

1. a source-claim ledger;
2. a variable-level mechanism map;
3. a target insertion point;
4. a novelty contrast against known baselines;
5. a resource and oracle audit;
6. at least one hostile counterexample;
7. a cheap falsifier;
8. a clear decision: promote, repair, demote, or kill.

## Definitions

Use these labels strictly:

```text
paper_claim: what the paper actually shows, proves, measures, or argues.
transfer_claim: what might carry from the source paper to the target.
invention_claim: the new proposed abstraction, protocol, metric, theorem template, or experiment.
mechanism: causal, optimization, algorithmic, statistical, control, protocol, or physical structure that can be mapped variable-by-variable.
analogy: a hypothesis generator, never evidence by itself.
anti_evidence: paper, theorem, experiment, benchmark, or counterexample that limits the desired transfer.
forbidden_oracle: information/action the source assumes but the target cannot obtain at acceptable cost.
minimal_falsifier: cheapest test likely to kill the proposed transfer if it is wrong.
```

## Non-Negotiables

- Source-ground every paper claim using arXiv pages/PDFs and official code/project pages where available.
- Record claim locations precisely enough that a reader can audit them.
- Review each selected paper on its own terms before applying it to the target.
- Separate `paper_claim`, `transfer_claim`, and `invention_claim`.
- Prefer mechanisms, variables, assumptions, and invariants over keywords and titles.
- Include anti-evidence and papers that could weaken the desired analogy.
- Reject seductive analogies that fail the kill tests.
- Preserve ancestor baselines; do not let novelty hide omitted simple alternatives.
- End with experiments that can falsify the proposed transfers.

## Execution Modes

Choose the lightest mode that can satisfy the user. If the user asks for “best,” “highest rigor,” “extreme novelty,” “field-forming,” “raise the proposal,” or “is this the best you can do,” use `constitutional`.

| Mode | Use when | Minimum evidence budget | Output |
|---|---|---:|---|
| `scout` | user wants papers or directions | 8–15 candidates; 3–6 selected | curated papers, source ledger, transfer matrix |
| `review` | user wants paper reviews | 4–8 selected papers | independent review cards, limitations, target-use section |
| `invent` | user wants new ideas | 10–25 candidates; 5–10 selected; 5+ concepts | concept frames, kill tests, promoted proposal |
| `constitutional` | user wants maximum rigor/novelty | 20–50 candidates; 8–15 selected; 2+ anti-sources; 6+ concepts | full discovery packet, scoring, ledgers, operator delta, governance |

If time or context budget is constrained, state the reduced budget and preserve the ledgers; do not silently degrade into keyword search.

## Phase 0: Setup and Evidence Boundary

Infer missing fields when reasonable. Ask a clarifying question only if the target itself is unusably ambiguous.

```text
target_artifact:
target_domain:
user_goal:
mode:
source_scope:
search_budget:
review_budget:
evidence_boundary:
  primary_sources:
  secondary_sources:
  excluded_sources:
  required_currentness:
uncertainty:
assumptions_made:
```

Rules:

- Use current web/arXiv metadata when paper recency, current code, or latest versions matter.
- For local artifacts, read only what is necessary, but cite the relevant sections.
- If source access is incomplete, label the affected claims as `unsupported` or `not checked`.

## Phase 1: Target X-Ray

Create a typed decomposition before searching.

```text
target_xray:
  thesis:
  current_best_story:
  success_condition:
  current_architecture_or_model:
  known_baselines_or_ancestors:
  hidden_assumptions:
  limitations:
  failure_modes:
  invariants:
  forbidden_oracles:
  scarce_resources:
    time:
    energy:
    samples:
    state_information:
    communication:
    synchronization:
    computation:
    trust:
    verification_budget:
  authority_model:
  evaluation_gaps:
  target_metrics:
  transfer_slots:
    model:
    metric:
    controller:
    sensor:
    simulator:
    theorem:
    certificate:
    dataset:
    protocol:
    hardware:
    governance:
```

Do not search until transfer slots and failure modes are explicit.

## Phase 2: Abstraction Map

Translate concrete limitations into abstract problem forms. Extend the defaults with target-specific abstractions.

```text
abstraction_map:
  static_state -> partial_observability / stale_state / hidden_oracle
  linear_physics -> nonlinear_response / thresholding / saturation
  one_shot_decision -> temporal_policy / finite_storage / queueing
  local_metric -> lifted_state_space / hidden_path / representation_gap
  free_coordination -> communication_cost / synchronization_cost / contention
  trusted_reports -> adversarial_telemetry / Byzantine_calibration
  simulator_success -> bridge_model / hardware_calibration / digital_twin
  learned_policy -> proposal_authority_split / certificate_gate
  single_metric_success -> Pareto frontier / lexicographic gate / constrained optimization
  empirical_win -> mechanism certificate / stress cube / causal ablation
  hand-coded_harness -> learned_harness_policy / tool-use MDP / proposal-authority split
```

For each abstraction, list:

```text
source_fields_that_matured_this_abstraction:
likely_query_terms:
expected_transfer_type:
known_failure_risks:
```

## Phase 3: Reproducible Search Plan

Build query families by distance and purpose.

```text
near_queries: same domain + same limitation
adjacent_queries: same mechanism + different substrate
far_queries: same abstraction + distant field
anti_queries: papers that refute, bound, or complicate the desired analogy
evaluation_queries: testbeds, benchmarks, falsifiers, ablations, impossibility results
```

Use the search protocol in `references/search-protocol.md`.

For `invent` and `constitutional` modes, include at least:

- 2 near query families;
- 2 adjacent query families;
- 2 far query families;
- 1 anti-evidence query family;
- 1 evaluation/falsification query family.

Record every important query in a query ledger. Search is not complete until either the budget is exhausted or two consecutive query families produce no new mechanisms.

## Phase 4: Candidate Paper Triage

For each candidate, create a scored paper record.

```text
paper_record:
  paper_id:
  title:
  authors:
  year:
  arxiv_url:
  version_checked:
  code_or_project_url:
  paper_type:
  source_field:
  core_mechanism:
  evidence_basis:
  old_assumption_attacked:
  target_limitation_hit:
  transfer_slot:
  analogy_distance: near | adjacent | far | anti
  likely_breakage:
  forbidden_oracle_risk:
  metric_mismatch_risk:
  scale_risk:
  triage_score:
  priority: keep | maybe | reject
  reason:
```

Reject or demote if:

- no mechanism transfers;
- the target already has the same idea with no improvement;
- the paper assumes a forbidden oracle/action;
- metric mismatch cannot be repaired;
- evidence is too weak for the intended use;
- the transfer cannot be falsified cheaply;
- the result is a vocabulary match rather than a mechanism match.

## Phase 5: Source-Claim Ledger

For every selected paper, extract claims before writing target applications.

```text
source_claim:
  claim_id:
  paper_id:
  claim_text:
  claim_type: theorem | experiment | algorithm | dataset | benchmark | system | ablation | negative_result | conjecture
  location:
  evidence_strength: high | medium | low
  scope_conditions:
  assumptions:
  what_is_not_claimed:
  usable_for_transfer: yes | no | uncertain
```

No transfer claim may rely on a paper unless it points to one or more `claim_id`s.

## Phase 6: Independent Paper Review

For each selected paper:

```markdown
## <Title>

Authors:
Paper:
Code/project:
Version/date checked:
Model/system:

TL;DR
WHAT was done?
WHY it matters?

Review
<Mechanism, method, evidence, contribution, and scope on the paper's own terms. Do not mention the target here unless the paper itself does.>

Evidence Quality
<Theorem, benchmark, ablation, dataset, testbed, code availability, reproduction risk.>

Limitations
<Paper limitations, assumptions, missing baselines, scale constraints, oracle assumptions.>

Source Claims Used
- claim_id:
- claim_id:

Transfer Analysis
Paper claim:
Transfer claim:
Target insertion point:
Variable mapping:
Required adaptation:
Analogy type:
Falsifier:
Failure risk:
Decision:
```

Keep target commentary out of `Review`; target enters only in `Transfer Analysis`.

## Phase 7: Variable-Level Mechanism Mapping

Before invention, map source variables to target variables.

```text
mechanism_map:
  source_paper:
  source_mechanism:
  source_variable -> target_variable:
  preserved_invariants:
  broken_invariants:
  variables_with_no_target_counterpart:
  target_variables_missing_in_source:
  oracle_gap:
  resource_gap:
  metric_gap:
  scale_gap:
  repair_needed:
  transfer_status: clean | repairable | speculative | kill
```

Kill if the mapping is mostly names, not variables and mechanisms.

## Phase 8: Generate Invention Candidates

Use `references/discovery-operators.md`. Generate at least five ideas in `invent` or `constitutional` mode; at least one must come from a far-domain mechanism and at least one must be an anti-evidence-driven repair.

Each idea must be typed:

```text
concept_frame:
  name:
  novelty_level: N0 | N1 | N2 | N3 | N4 | N5
  source_papers:
  source_claim_ids:
  source_mechanism:
  target_limitation:
  core_abstraction:
  protocol:
    actors:
    information_available:
    allowed_actions:
    forbidden_actions:
    success_condition:
  resource_vector:
    time:
    energy:
    samples:
    state_information:
    communication:
    synchronization:
    computation:
    trust:
    verification_budget:
  examples:
  nonexamples:
  boundary_cases:
  relation_to_known_target_components:
  novelty_contrast:
  positive_theorem_template:
  negative_or_boundary_template:
  minimal_experiment:
  falsifier:
  expected_failure_mode:
```

Novelty ladder:

```text
N0: relabeling or metaphor only. Kill.
N1: direct adoption of known method. Useful but not novel.
N2: adaptation of known mechanism to target constraints.
N3: new composition of two mechanisms in the target substrate.
N4: new primitive, certificate, metric, simulator axis, or theorem template.
N5: field-forming abstraction that reorganizes the target problem and generates a research program.
```

Promote N3+ ideas unless the user explicitly wants practical low-novelty recommendations.

## Phase 9: Kill, Repair, Promote

Run `references/kill-tests.md`.

For each serious idea:

```text
verification_record:
  candidate:
  definition_gate:
  distinction_gate:
  source_support_gate:
  claim_trace_gate:
  variable_mapping_gate:
  mechanism_transfer_gate:
  invariant_gate:
  resource_gate:
  metric_gate:
  oracle_gate:
  scale_gate:
  counterexample_gate:
  anti_evidence_gate:
  falsifier_gate:
  MDL_gate:
  ancestor_baseline_gate:
  adversarial_gate:
  decision: promote | repair | demote | kill
  reason:
```

Promote at most one primary idea unless the user asks for a portfolio. Include repaired runner-up ideas when useful.

## Phase 10: Promoted Research Artifact

The promoted artifact must be concrete enough to test.

```markdown
## Promoted Research Artifact: <Name>

One-sentence thesis:
Novelty level:
Why this is new:
Why this is plausible:
Why this may fail:

Definition:
Protocol:
Source support:
Variable map:
Theorem template:
Boundary claim:
Minimal experiment:
Expected result:
Kill condition:
Implementation sketch:
Baselines to preserve:
Next agenda:
```

## Phase 11: Constitutional Record

In `constitutional` mode, emit:

```text
operator_policy_delta:
  operators_fired:
  order:
  which_helped:
  which_failed:
  unexpected_mechanisms:
  next_run_policy:

governance_record:
  self_certification_check:
  anti_goodhart_check:
  novelty_overclaim_check:
  source_fidelity_check:
  anti_evidence_check:
  ancestor_baseline_check:
  rejected_analogies:
  open_violations:
  process_changes:
```

This prevents the process from mistaking elaborate procedure for truth.

## Output Structure

Write a reusable artifact when possible.

```markdown
# <Target> — Analogical ArXiv Discovery

## Executive Verdict
## Target X-Ray
## Abstraction Map
## Search Plan and Query Ledger
## Candidate Triage and Scoring
## Source-Claim Ledger
## Selected Paper Reviews
## Mechanism Maps
## Transfer Matrix
## Invention Candidates
## Verification Record
## Promoted Research Artifact
## Killed / Repaired Analogies
## Operator Policy Delta
## Governance Record
## Next Experiments
## Appendix: Rejected Papers and Why
```

For smaller modes, omit only sections that are genuinely irrelevant. Never omit source grounding, transfer analysis, mechanism mapping, or falsifiers.

## Quality Bar

The output is good only if:

- the user sees papers they would not find by obvious keywords;
- selected papers contribute transferable mechanisms, not merely vocabulary;
- source claims are auditable;
- variable mappings expose what does and does not transfer;
- weak analogies are visibly rejected;
- anti-evidence is considered;
- at least one proposal is novel, named, bounded, and falsifiable;
- ancestor baselines are preserved;
- the next experiment can kill the idea cheaply;
- the final artifact distinguishes what is true in the paper from what is speculative in the transfer.
```

---

## agents/openai.yaml

```yaml
interface:
  display_name: "Analogical ArXiv Scout v6"
  short_description: "Evidence-coupled arXiv analogy discovery"
  default_prompt: >-
    Run an evidence-coupled arXiv analogical discovery process for this target: decompose the target into transfer slots, search by mechanism and anti-evidence, review papers independently, build source-claim ledgers and variable maps, generate novel falsifiable concepts, kill weak analogies, and emit a promoted research artifact with next experiments.
```

---

## references/search-protocol.md

```markdown
# Search Protocol v6

## Purpose

Search is not keyword matching. It is mechanism discovery under a reproducible budget.

## Query Families

For each target limitation, build:

```text
near_query: same domain + same limitation
adjacent_query: same mechanism + different substrate
far_query: same abstraction + distant field
anti_query: refutation, impossibility, negative result, nonlinearity, brittleness, lower bound
evaluation_query: benchmark, testbed, ablation, hardware, replication, simulator gap
```

## Query Ledger

Record:

```text
query_id:
query_text:
query_family:
limitation_or_slot:
date_run:
source:
top_results_seen:
candidates_kept:
candidates_rejected:
new_mechanisms_found:
notes:
```

## Constitutional Quotas

Minimum target before triage:

```text
near candidates: 5+
adjacent candidates: 5+
far candidates: 5+
anti/evaluation candidates: 3+
selected papers: 8-15
anti-sources selected: 2+
```

## Saturation Rule

Stop search when either:

- budget is exhausted; or
- two consecutive query families add no new mechanisms; or
- the current candidates cover every high-priority transfer slot with at least one supporting and one hostile/limiting source.

## Rejection Ledger

Do not silently discard papers. Record at least the important rejects:

```text
paper:
reason_rejected:
which_kill_test_triggered:
possible_future_use:
```
```

---

## references/source-ledger.md

```markdown
# Source Ledger v6

## Source Record

```text
source_id:
title:
authors:
year:
arxiv_url:
pdf_url:
version_checked:
code_or_project_url:
source_type: arxiv | journal | conference | official_code | benchmark | dataset | project_page
access_date:
```

## Claim Ledger

```text
claim_id:
source_id:
claim_text:
claim_type: theorem | experiment | algorithm | dataset | benchmark | system | ablation | negative_result | conjecture
location:
evidence_strength: high | medium | low
assumptions:
scope_conditions:
limitations:
not_claimed:
usable_for_transfer: yes | no | uncertain
```

## Claim Discipline

- Do not use a source without a source record.
- Do not use a paper claim without a claim record.
- Do not write a transfer claim without naming the source claim IDs it depends on.
- Do not treat abstracts as sufficient evidence when the paper body contradicts, weakens, or limits the claim.
- Prefer theorem, ablation, hardware, and reproducible benchmark claims over broad rhetorical claims.
```

---

## references/scoring-rubric.md

```markdown
# Scoring Rubric v6

## Candidate Paper Triage Score

Score each candidate 0-5 on each dimension:

```text
mechanism_clarity: Is there a transferable mechanism rather than a vague topic match?
target_gap_fit: Does it hit a real limitation or transfer slot?
evidence_quality: Is the claim supported by theorem, ablation, benchmark, code, hardware, or careful experiment?
analogy_productivity: Does it generate new target designs or tests?
falsifiability: Can the transfer be killed cheaply?
novelty_distance: Is the paper outside obvious keyword neighborhoods while still structurally relevant?
implementation_affordance: Can the idea be prototyped without impossible dependencies?
```

Weighted score:

```text
triage_score =
  0.22 * mechanism_clarity +
  0.18 * target_gap_fit +
  0.18 * evidence_quality +
  0.14 * analogy_productivity +
  0.12 * falsifiability +
  0.10 * novelty_distance +
  0.06 * implementation_affordance
```

Apply risk penalties:

```text
-0.5 hidden_oracle_medium
-1.0 hidden_oracle_high
-0.5 metric_mismatch_medium
-1.0 metric_mismatch_high
-0.5 scale_risk_medium
-1.0 scale_risk_high
-0.5 weak_reproducibility
-1.0 no_mechanism_map
```

## Decision Thresholds

```text
keep: score >= 3.7 and no fatal gate failure
maybe: 2.8 <= score < 3.7 or repairable risk
reject: score < 2.8 or fatal oracle/metric/mechanism failure
```

## Concept Promotion Score

Score inventions 0-5:

```text
definition_precision:
source_support:
mechanism_transfer:
target_value:
novelty_level:
falsifiability:
resource_realism:
baseline_fairness:
```

Promote only if `falsifiability >= 3`, `mechanism_transfer >= 3`, and no fatal kill test fires.
```

---

## references/discovery-operators.md

```markdown
# Discovery Operators v6

Use operators to generate search directions and invention candidates. Operators are tools, not proof.

| Operator | Precondition | Search prompt fragments | Invention product |
|---|---|---|---|
| State-lift | Hidden feasibility or stale state | "time-expanded", "belief state", "latent state", "lifted graph" | new state dimension |
| Resource-bound | Missing cost | "energy causality", "communication cost", "synchronization cost", "verification cost" | resource vector/cost model |
| Nonlinearize | Linear response assumption | "nonlinear model", "threshold", "saturation", "rectifier" | nonlinear substrate model |
| Temporalize | One-shot decision | "finite horizon", "queueing", "receding horizon", "dynamic programming" | temporal policy |
| Distributionalize | Average or worst-case hides risk | "conformal", "distributional", "quantile", "calibration" | uncertainty object |
| Adversarialize | Reports/agents can be hostile | "Byzantine", "jamming", "poisoning", "robust" | attack/evaluation overlay |
| Protocolize | Informal process | "protocol", "mechanism design", "control loop" | actors/actions/info model |
| Certify | Validity needed | "certificate", "proof carrying", "runtime verification", "coverage" | certificate artifact |
| Bridge-to-physical | Simulator gap | "hardware in the loop", "digital twin", "measurement", "testbed" | calibration bridge |
| Invert | Nuisance may be useful | "interference exploitation", "dual use", "energy-information tradeoff" | nuisance-as-resource primitive |
| Compose | Two mechanisms interact | "hybrid", "cooperative", "joint optimization" | staged/composite protocol |
| Split-authority | Learned method may be unsafe | "shielding", "safe RL", "certified controller" | proposer/verifier split |
| Omission-regret | Baselines may be hidden | "ablation", "benchmark leakage", "selection bias" | omission test |
| Boundary-search | Applicability unknown | "phase transition", "lower bound", "impossibility", "threshold" | boundary theorem/test |
| Structure-map | Mature source domain exists | "POMDP", "MDL", "causal", "queueing", "coding theory" | imported theorem/method |
| Morphologize | Many axes but few explored | "design space", "taxonomy", "morphological analysis" | unmined design cell |
| Causalize | Correlation may be mistaken | "causal identification", "intervention", "SCM" | causal test |
| Compress | Too many cases | "minimum description", "invariant", "taxonomy" | compact abstraction |
| Dualize | Objective/constraint roles may invert | "duality", "Lagrangian", "shadow price" | dual metric or certificate |
| Relax-then-certify | Exact solution too hard | "convex relaxation", "rounding", "certificate" | tractable proposal + validity gate |
| Mechanism-distill | Paper too complex to transfer whole | "distillation", "ablation", "minimal mechanism" | stripped mechanism primitive |
| Counterexample-generate | Proposal too smooth | "failure case", "stress test", "counterexample" | hostile scenario |
| Representation-transport | Source representation may carry | "embedding", "representation learning", "latent space", "transport" | transferred state representation |
| Value-of-information | Missing info may be worth acquiring | "active sensing", "VOI", "Bayesian experimental design" | sensing/acquisition policy |
| Harness-learn | Hand-coded agent scaffold may be suboptimal | "tool use", "meta-RL", "workflow induction", "program synthesis" | learned harness policy |

## Operator Trace

For constitutional mode, log:

```text
operator:
precondition:
query_family:
papers_found:
idea_generated:
source_claim_ids:
gate_helped:
gate_failed:
outcome:
credit:
```

## Operator Compositions

High-yield combinations:

- `Nonlinearize + Certify`: measured nonlinear model becomes runtime certificate.
- `State-lift + Temporalize`: static graph becomes time/resource graph.
- `Distributionalize + Certify`: uncertainty estimate becomes coverage-bearing artifact.
- `Adversarialize + Governance`: trust model becomes attack-aware evaluation.
- `Bridge-to-physical + Omission-regret`: hardware trace decides whether simulated winner is real.
- `Split-authority + Learning`: model proposes, certificate disposes.
- `Invert + Resource-bound`: nuisance becomes resource only after its costs are explicit.
- `Relax-then-certify + Boundary-search`: cheap proposal is accepted only inside proven/empirical safe regions.
- `Harness-learn + Split-authority`: learned agent scaffold proposes tool/workflow actions; external certificate governs execution.

## Novelty Pressure

After first-pass ideas, force at least one:

- far-domain analogy;
- inverse of an obvious design choice;
- anti-evidence-driven repair;
- idea that makes evaluation harder but more honest;
- idea that creates a new primitive or certificate;
- idea that could falsify the target's current best story;
- theorem template or impossibility boundary.
```

---

## references/kill-tests.md

```markdown
# Kill Tests v6

Use these tests before promoting any analogical transfer or novel proposal.

## 1. Source Fidelity

```text
Does the paper actually claim this?
Where is the claim located?
Is it supported by theorem, experiment, ablation, benchmark, hardware, or code?
What does the paper explicitly not show?
```

Kill if the proposal depends on a claim the paper does not support.

## 2. Claim Trace

```text
Can every transfer claim cite source_claim IDs?
Are any claims imported from memory, vibe, title, or abstract only?
```

Kill or demote if claim trace is absent.

## 3. Mechanism Transfer

```text
What causal/optimization/control/statistical/protocol structure transfers?
What variables correspond across domains?
Which variables have no counterpart?
```

Kill if the mapping is vocabulary-level only.

## 4. Hidden Oracle

```text
Does the source assume information the target lacks?
Can the target estimate it at acceptable cost?
Does estimation change the original mechanism?
```

Repair with observation/certification layer. Kill if the oracle is essential and unavailable.

## 5. Invariant Violation

```text
Does the idea violate safety, authority, privacy, resource, hardware, protocol, or governance invariants?
```

Repair by splitting proposal generation from authority. Kill if leakage remains.

## 6. Metric Mismatch

```text
Source improves what metric?
Target cares about what metric?
Could improvement hurt target success?
```

Repair by adding target-aligned metrics. Kill if conflict is core.

## 7. Scale Break

```text
Does source work only at tiny scale, centralized scale, ideal topology, or clean data?
What changes at target scale?
```

Repair by adding scale boundary tests.

## 8. Evaluation Monoculture

```text
Did the paper test one simulator, topology, dataset, model, or regime?
Does the target need broader validation?
```

Repair with scenario axes, ablations, real traces, or hardware checks.

## 9. Anti-Evidence

```text
What paper or argument would make this transfer fail?
Was anti-evidence searched, or only confirming evidence?
```

Demote if no anti-evidence was sought in invent/constitutional mode.

## 10. Adversarial Break

```text
Could stale, malicious, selected, or strategically generated evidence make it look good?
Could an adversary exploit the new protocol/metric/certificate?
```

Repair with adversarial overlays and trust certificates.

## 11. MDL / Compression

```text
Does the idea simplify explanation or just add machinery?
What does it explain or enable that current architecture cannot?
```

Kill or demote if complexity rises without explanatory or operational gain.

## 12. Ancestor Baseline / Omission-Regret

```text
Does the new method win only because old safe baselines were omitted?
Are simpler/lower-tier/ancestor candidates preserved?
```

Repair by forcing baseline coverage.

## 13. Minimal Falsifier

Every promoted idea needs:

```text
minimal_falsifier:
  setup:
  predicted_observation:
  kill_condition:
  cheapest_data_needed:
```

No falsifier, no promotion.

## Promotion Rule

Promote only if:

- source fidelity passes;
- claim trace passes;
- mechanism transfer passes;
- hidden oracle is absent or explicitly handled;
- invariants pass;
- metric mismatch is resolved;
- anti-evidence was considered;
- at least one hostile counterexample was considered;
- minimal falsifier exists;
- the proposal explains or enables something the target currently cannot.
```

---

## references/output-schemas.md

```markdown
# Output Schemas v6

## Query Ledger

```markdown
| Query ID | Family | Query | Slot/Limitation | Results Seen | Kept | Rejected | New Mechanism | Notes |
|---|---|---|---|---:|---:|---:|---|---|
```

## Candidate Triage

```markdown
| Paper | Distance | Mechanism | Evidence | Slot Hit | Main Risk | Score | Decision | Reason |
|---|---|---|---|---|---|---:|---|---|
```

## Source-Claim Ledger

```markdown
| Claim ID | Source | Claim Type | Claim | Evidence Strength | Scope | Assumptions | Not Claimed | Usable? |
|---|---|---|---|---|---|---|---|---|
```

## Transfer Matrix

```markdown
| Paper | Source Claim IDs | Source Mechanism | Target Limitation | Transfer Slot | Analogy Type | Strength | Main Risk | Falsifier |
|---|---|---|---|---|---|---:|---|---|
```

## Variable Mechanism Map

```markdown
| Source Variable/Component | Target Variable/Component | Preserved? | Gap/Risk | Repair |
|---|---|---|---|---|
```

## Paper Review Card

```markdown
## <Title>

Authors:
Paper:
Code/project:
Version/date checked:
Model/System:

TL;DR
WHAT was done?
WHY it matters?

Review

Evidence Quality

Limitations

Source Claims Used

Transfer Analysis
Paper claim:
Transfer claim:
Target insertion point:
Variable mapping:
Required adaptation:
Analogy type:
Falsifier:
Failure risk:
Decision:
```

## Concept Frame

```markdown
### <Concept Name>

Novelty level:
Source papers:
Source claim IDs:
Target limitation:
Core abstraction:

Protocol:
- Actors:
- Information available:
- Allowed actions:
- Forbidden actions:
- Success condition:

Resource vector:
- Time:
- Energy:
- Samples:
- State information:
- Communication:
- Synchronization:
- Compute:
- Trust:
- Verification:

Examples:
Nonexamples:
Boundary cases:
Relation to existing target components:
Novelty contrast:
Positive theorem template:
Negative/boundary template:
Minimal experiment:
Falsifier:
Expected failure mode:
```

## Verification Record

```markdown
| Candidate | Definition | Distinction | Source Support | Claim Trace | Variable Map | Transfer | Invariants | Resources | Metrics | Oracle | Counterexample | Anti-Evidence | Falsifier | MDL | Baselines | Decision |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
```

## Promoted Research Artifact

```markdown
## Promoted Research Artifact: <Name>

One-sentence thesis:
Novelty level:
Why this is new:
Why this is plausible:
Why this may fail:

Definition:
Protocol:
Source support:
Variable map:
Theorem template:
Boundary claim:
Experiment:
Expected result:
Kill condition:
Implementation sketch:
Baselines to preserve:
Next agenda:
```

## Governance Record

```markdown
## Governance Record

Self-certification check:
Anti-Goodhart check:
Novelty overclaim check:
Source fidelity check:
Anti-evidence check:
Ancestor baseline check:
Rejected analogies:
Open violations:
Process changes:
```
```
