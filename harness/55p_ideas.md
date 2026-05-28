The answer is: **you do not get agents to “learn their harness” by giving them a longer harness description.** You get it by building a **harness-learning curriculum plus a trace-to-delta loop** where the agent repeatedly experiences harness-caused failure, diagnoses the harness mechanism, proposes a narrow harness change, sees the result, and then has the stable lesson distilled into reusable harness doctrine.

Meta-Harness gives the outer substrate: raw traces, prior code, scores, and candidate history in a filesystem. Your v3 proposal correctly hardens that substrate with sandboxed immutability, split visibility, negative controls, trace-quality checks, and red/yellow/green safety zoning. But the missing piece is **pedagogy and credit assignment**: how to make the proposer learn which harness mechanisms matter, not merely mutate code until something scores higher. 

## 1. There are three different kinds of “learning the harness”

Do not collapse these.

### A. Harness-use learning

The task agent learns how to use the harness it has been given.

Examples:

```text
Use the environment snapshot before probing randomly.
Use the retriever before asking the model to guess.
Use the branch ledger before claiming progress.
Use monitor output instead of rerunning expensive commands.
Use acceptance gates as constraints, not as afterthoughts.
```

This is mostly prompt/skill/curriculum learning.

### B. Harness-design learning

A proposer agent learns how to improve the harness itself.

Examples:

```text
Add environment bootstrapping.
Change context packing.
Change memory retrieval.
Change trace schema.
Change work-unit decomposition.
Change completion confirmation logic.
Change rollback policy.
```

This is the Meta-Harness layer: code-space search over harness variants.

### C. Harness-doctrine learning

The system distills stable discoveries into reusable rules, templates, tests, and skills.

Examples:

```text
“Prefer additive environment snapshot over completion-flow edits.”
“Never optimize acceptance thresholds directly.”
“If repeated regressions share one prompt edit, isolate the confound.”
“Trace summaries are navigation aids only; raw traces remain source of truth.”
```

This is how the organization learns, not just one run.

The paper demonstrates B: the proposer reads prior code, scores, and execution traces from the filesystem, then proposes new harness code; the loop stores new code, reasoning traces, and scores back into the filesystem. The diagram on page 2 is exactly this candidate/evidence/frontier feedback loop.  Your v3 design adds the governance needed to make this safe enough for your systems. 

---

# 2. The core mechanism: harness learning requires causal contrast, not just score feedback

A scalar score says:

```text
candidate_A = 0.74
candidate_B = 0.69
```

That does not teach the agent the harness.

A harness-learning trace says:

```text
candidate_A changed completion flow and prompt cleanup.
It regressed on tasks where cleanup removed required state.
candidate_B kept prompt fixed and only added marker stripping.
It regressed less.
candidate_C avoided completion flow entirely and added environment bootstrap.
It improved because it saved early exploration turns without touching fragile logic.
```

That is what teaches the proposer.

The paper’s TerminalBench narrative is the clean example. The proposer first tried plausible structural fixes mixed with prompt edits; those regressed. It then inferred the prompt cleanup was a confound, isolated structural fixes, observed that completion-flow edits remained fragile, and eventually pivoted to a purely additive environment bootstrap. That bootstrap gathered `pwd`, `/app` listing, installed languages, package managers, and memory before the first LLM turn, then injected it into the initial prompt. 

That is the pattern you want:

```text
failure → contrastive diagnosis → isolated mechanism test → safer harness delta → promotion → distilled doctrine
```

The agent is not “learning” because it remembers a summary. It is learning because the substrate gives it enough raw evidence to perform **causal contrast**.

---

# 3. Build a Harness Learning Loop, not just a Meta-Harness loop

Your v3 proposal already defines the substrate:

```text
candidates/
runs/
frontier/
immutable/
negative_controls/
trace_quality_checks/
split_visibility.yaml
```

That is necessary. But to get agents to learn their harness, add a **Harness Learning Loop** on top.

## The loop

```text
1. Expose harness map.
2. Run harness-specific curriculum tasks.
3. Capture raw traces and harness decision points.
4. Cluster failures by harness mechanism.
5. Force proposer to state a falsifiable harness hypothesis.
6. Require one-mechanism candidate edits.
7. Run ablations and negative controls.
8. Promote only frontier-safe candidates.
9. Distill stable lessons into skills/tests/templates.
10. Re-evaluate old frontier candidates after doctrine changes.
```

The key is step 4–6. Without explicit mechanism hypotheses and one-mechanism edits, agents do not learn the harness; they perform noisy code search.

---

# 4. Give the agent a harness map

The agent cannot learn a harness it cannot see structurally.

Every domain should have a `harness_map.json` or `HARNESS_CARD.md` that describes:

```json
{
  "harness_name": "hybrid_retriever",
  "components": {
    "query_parser": "normalizes user query",
    "lexical_retriever": "BM25/LEANN candidate source",
    "codegraph_retriever": "symbol/file graph source",
    "merge_policy": "combines candidates",
    "dedup_policy": "removes near-duplicates",
    "reranker": "orders final candidates",
    "context_budgeter": "allocates context tokens",
    "trace_logger": "records retrieval decisions",
    "evaluator": "computes recall/MRR/latency"
  },
  "mutable_components": [
    "merge_policy",
    "dedup_policy",
    "reranker",
    "context_budgeter"
  ],
  "immutable_components": [
    "indexes",
    "query_set",
    "ground_truth",
    "eval_script",
    "metric_accounting"
  ],
  "known_failure_modes": [
    "empty result",
    "right file wrong symbol",
    "symbol found but ranked below cutoff",
    "graph hop introduces noise",
    "dedup removes correct candidate",
    "reranker overweights lexical match"
  ]
}
```

For HALO-X, the harness map should name:

```text
planner
work-unit decomposer
executor
acceptance checker
context packer
monitor
rollback policy
trace schema
hydra integration
```

For NetLogo→CUDA, it should name:

```text
YAML expander
semantic parser
code generator
CUDA kernel template
metric reducer
seed manager
semantic-equivalence oracle
benchmark runner
```

Without this map, the proposer has to infer the harness architecture from source every time. That wastes tokens and makes learning unstable.

---

# 5. Create harness-specific curriculum tasks

Agents learn harnesses when the evaluation set contains failures where **only a harness-level change can help**.

That means you need deliberate curriculum tasks. Not ordinary benchmark tasks. Harness-diagnostic tasks.

## For the hybrid retriever

Create tasks where each failure isolates a retrieval-harness mechanism:

```text
right file appears only through symbol graph, not lexical match
lexical retriever finds many decoys with same token
dedup removes the correct near-duplicate
graph expansion floods the context with neighbors
query refers to behavior, not symbol name
target file is obvious but target symbol is not
correct result is ranked 11–20, just below cutoff
```

The proposer should learn:

```text
when to trust lexical retrieval
when to trust CodeGraph
when to expand graph hops
when to suppress graph noise
when to allocate context to diversity
when to allocate context to depth
```

## For HALO-X skills

Create tasks where each failure isolates an implementation-harness mechanism:

```text
agent completes visible tests but fails hidden architecture invariant
agent edits evaluator to pass
agent loses parent metric during decomposition
agent enters 40-tool-call rabbit hole
agent suppresses stderr and claims success
agent forgets to update MDOC
agent performs broad rewrite instead of targeted patch
agent passes acceptance but hydra finds HIGH/CRIT residual
```

The proposer should learn:

```text
how to decompose without goal drift
how to preserve architecture
how to budget tools
how to use hydra findings
how to avoid false completion
how to create useful traces
```

## For NetLogo→CUDA

Create tasks where each failure isolates a compiler-harness mechanism:

```text
activation order changes result
seed mapping changes stochastic trajectory
metric reducer changes aggregate
GPU batching breaks replicate independence
agent state update becomes synchronous when NetLogo was asynchronous
performance improves only because semantics changed
```

The proposer should learn:

```text
semantic equivalence precedes speed
metric kernels are not free to reinterpret metrics
randomness is part of semantics
GPU layout choices must survive small seeded comparisons
```

This is the missing “teaching set.” Without it, agents optimize benchmark score but do not learn the harness.

---

# 6. Add a harness introspection API

Give agents tools that let them inspect the harness at the right abstraction level.

Not just:

```bash
cat source.py
grep error logs/*
```

Add:

```bash
mh harness map
mh harness explain <component>
mh harness decision-trace <run> <task>
mh harness compare-decisions <run_a> <run_b>
mh harness failure-modes --cluster
mh harness ablate <candidate> --component <name>
mh harness blame <run> <task>
mh harness invariant-report <run>
```

The key tool is `decision-trace`.

For a retriever candidate, the decision trace should show:

```json
{
  "query": "where is candidate validation performed?",
  "lexical_candidates": [...],
  "graph_candidates": [...],
  "merge_policy_output": [...],
  "dedup_removed": [...],
  "reranker_scores": [...],
  "final_context": [...],
  "ground_truth_hit": false,
  "miss_reason": "correct file was retrieved by graph but removed by dedup"
}
```

For HALO-X, the decision trace should show:

```json
{
  "task": "multi-file refactor",
  "parent_metric": "hidden pass + architecture preservation",
  "plan": "...",
  "work_units": [...],
  "tool_calls": [...],
  "acceptance_claim": "done",
  "hidden_failure": "architecture invariant broken",
  "false_completion": true,
  "miss_reason": "acceptance skill checked tests but not invariant oracle"
}
```

This is how the agent learns. It sees where the harness made the wrong decision.

---

# 7. Require one-mechanism edits

If a candidate changes five things, the agent does not learn which mechanism mattered.

Every candidate should declare:

```json
{
  "mechanism_family": "context_budgeting",
  "single_primary_change": "allocate 30% of budget to graph-diverse candidates",
  "expected_effect": "increase target-symbol recall on behavioral queries",
  "expected_cost": "slightly higher p95 latency",
  "non_changes": [
    "does not change evaluator",
    "does not change indexes",
    "does not change query set",
    "does not change reranker prompt"
  ]
}
```

The v3 proposal already points in this direction with mechanism tagging, lineage crowding, branch ledger, and one-mechanism candidate discipline.  Make it mandatory.

A good candidate is:

```text
“Change only the dedup policy so graph candidates are not removed when lexical candidates share the same file but different symbol.”
```

A bad candidate is:

```text
“Improve retrieval by changing merge, dedup, reranking, prompt, and budget.”
```

The second may score higher, but it teaches less. Use broad bundles only after isolated mechanisms are understood.

---

# 8. Use ablation as the learning teacher

Agents learn harnesses from **counterfactuals**.

For every promising candidate, automatically run minimal ablations:

```text
candidate_full
candidate_without_component_A
candidate_without_component_B
candidate_with_old_prompt
candidate_with_old_dedup
candidate_with_old_budget
```

The paper’s TerminalBench example effectively did this informally: the proposer noticed prompt edits were confounding structural fixes, then isolated the structural changes.  You should make that automatic.

For HALO-X:

```text
candidate_full
same skill without new acceptance text
same skill without new context packing
same skill without new monitor rule
same skill without rollback change
```

For retriever:

```text
candidate_full
old merge + new dedup
new merge + old dedup
old reranker + new budgeter
new reranker + old budgeter
```

Then the run report should say:

```text
The improvement came from dedup, not reranking.
The latency regression came from graph-hop expansion.
The false-completion reduction came from acceptance invariant check, not planner wording.
```

That is harness learning.

---

# 9. Distill stable lessons into “harness doctrine”

If every run starts from scratch, the agents never really learn. They rediscover.

You need a `doctrine/` layer:

```text
doctrine/
  lessons/
    L0001_environment_bootstrap.md
    L0002_raw_traces_not_summaries.md
    L0003_acceptance_false_completion.md
    L0004_dedup_can_delete_correct_symbol.md
  reusable_patterns/
    environment_snapshot.py
    contrastive_retrieval.py
    branch_ledger_acceptance.yaml
  anti_patterns/
    cleanup_prompt_deletes_state.md
    threshold_tuning_as_metric_gaming.md
  doctrine_tests/
    test_environment_bootstrap_saves_turns.py
    test_acceptance_checks_invariants.py
```

Each lesson must have evidence pointers:

```yaml
lesson_id: L0004
claim: "Dedup by file path alone can remove the correct symbol-level retrieval."
evidence:
  positive_runs:
    - runs/run_00142/traces/query_017.jsonl
    - runs/run_00151/metrics.json
  ablations:
    - runs/run_00152_ablate_dedup/
  failure_cluster:
    - runs/failure_clusters/symbol_removed_by_dedup.json
status: promoted
scope: hybrid_retriever
do_not_generalize_to:
  - tasks without symbol-level ground truth
```

Doctrines should not be vague prose. They should be evidence-backed, scoped, and testable.

---

# 10. Build “harness apprenticeships” for agents

You can train agents in-context by giving them curated harness-learning cases.

A harness apprenticeship case should contain:

```text
1. Baseline harness behavior.
2. Raw trace excerpt.
3. Failure diagnosis.
4. Candidate change.
5. Ablation result.
6. Final doctrine.
7. What not to infer.
```

Example:

```text
Case: Environment bootstrap

Failure:
  Agent spends first 3 turns discovering files/tools.

Bad fix:
  Rewrite completion prompt to encourage faster action.
  Result: regression due to premature completion.

Good fix:
  Add read-only environment snapshot before first turn.
  Result: fewer exploration turns, lower regression risk.

Doctrine:
  Prefer additive information bootstrap over fragile control-flow edits
  when early exploration waste is the failure mode.
```

This is much better than telling the agent:

```text
“Use the harness well.”
```

Agents learn from concrete before/after episodes.

Given your “gold examples” workflow, create **harness gold examples**. Start with 30–50 cases across:

```text
retrieval
context packing
tool use
acceptance
trace logging
rollback
monitoring
semantic equivalence
negative controls
goal drift
```

---

# 11. Separate roles: the task agent should not be the only learner

Use four roles.

## 1. Task agent

Runs under the harness. Solves tasks.

```text
Goal: perform the task.
Mutable: none or minimal.
Learns: how to use current harness affordances.
```

## 2. Proposer agent

Reads traces and proposes harness changes.

```text
Goal: improve harness.
Mutable: candidate harness only.
Learns: harness mechanisms from prior evidence.
```

## 3. Evaluator agent/process

Scores candidates, enforces invariants, runs negative controls.

```text
Goal: protect truth.
Mutable: nothing in candidate loop.
Learns: not during search; evaluator is fixed per epoch.
```

## 4. Distiller agent

Turns stable findings into doctrine, tests, and skill updates.

```text
Goal: institutionalize learning.
Mutable: doctrine and future skills, after promotion.
Learns: cross-run lessons.
```

The dangerous mistake is using one agent to propose, evaluate, judge, and update doctrine. That collapses learning into self-justification.

---

# 12. The actual algorithm

A concrete version:

```python
def harness_learning_epoch(domain):
    freeze_evaluator_epoch(domain)

    run_baselines(domain)

    for iteration in range(N):
        evidence = expose_search_feedback(domain)

        diagnosis = proposer.diagnose(
            harness_map=domain.harness_map,
            frontier=domain.frontier,
            traces=evidence.raw_traces,
            failure_clusters=evidence.failure_clusters,
            doctrine=domain.current_doctrine,
        )

        assert diagnosis.cites_raw_artifacts()
        assert diagnosis.identifies_one_mechanism()

        candidate = proposer.write_candidate(
            mechanism=diagnosis.mechanism,
            allowed_mutables=domain.mutable_components,
            forbidden=domain.immutable_components,
        )

        validate_interface(candidate)
        verify_sandbox(candidate)
        run_negative_control_detectors(candidate)

        search_result = evaluate_on_search_feedback(candidate)
        trace_quality = compute_trace_quality(candidate)
        branch_state = update_branch_ledger(candidate, search_result)

        if candidate_survives_stage_3(candidate):
            selection_score = evaluate_selection_val(candidate, aggregate_only=True)
            update_frontier(candidate, search_result, selection_score, trace_quality)

    finalists = select_pareto_frontier(domain)

    for candidate in finalists:
        run_hidden_test_once(candidate)
        run_required_hydra_if_yellow(candidate)
        run_ablations(candidate)

    promoted = promote_candidates(finalists)

    lessons = distill_doctrine(promoted, ablations=True)
    add_doctrine_tests(lessons)

    start_new_epoch_if_evaluator_or_doctrine_changes()
```

The agent learns the harness because each iteration forces it to connect:

```text
raw trace → failure mechanism → single harness change → ablation → doctrine
```

---

# 13. What to implement in MH-o4-v0

Do not implement everything at once. Add the minimal features that make harness learning real.

## Required for v0

```text
harness_map.json
decision_trace.jsonl
failure_cluster.json
candidate_hypothesis.json
single_mechanism_change declaration
ablation runner for promoted candidates
doctrine/lessons/
doctrine_tests/
split visibility audit
negative-control CI
raw trace store
Pareto frontier
```

## Defer until v1/v2

```text
complex branch-value scheduling
automatic mechanism-family classifier
full doctrine distiller
multi-domain transfer tests
LLM-based trace-quality judge
large-scale hydra integration
```

The first version should prove that the proposer can learn one harness domain deeply.

---

# 14. What this looks like for your first target: hybrid retriever

## Agent learning objective

```text
Learn when retrieval failures are caused by lexical matching, graph expansion,
dedup, reranking, or context budgeting.
```

## Instrumentation

For every query, log:

```json
{
  "query_id": "q017",
  "query_text": "...",
  "target_file_family": "...",
  "target_symbol_family": "...",
  "lexical_candidates": [],
  "graph_candidates": [],
  "merge_output": [],
  "dedup_removed": [],
  "reranker_scores": [],
  "final_top_k": [],
  "ground_truth_hits": {
    "file_at_5": false,
    "symbol_at_10": false
  },
  "miss_reason": "correct graph candidate removed by dedup"
}
```

## Curriculum clusters

```text
lexical miss
graph noise
dedup damage
rerank inversion
budget starvation
family leakage
empty retrieval
```

## Candidate hypothesis example

```json
{
  "mechanism": "dedup_damage",
  "hypothesis": "File-level dedup removes correct symbol-level graph hits when lexical results share the same file.",
  "change": "Dedup by (file, symbol_span) instead of file only for graph candidates.",
  "expected_gain": "target-symbol recall@10 improves on symbol-family queries",
  "expected_cost": "slightly more context tokens",
  "evidence": [
    "runs/run_004/traces/q017.jsonl",
    "runs/run_006/failure_clusters/dedup_damage.json"
  ]
}
```

That is an agent learning its harness.

---

# 15. What this looks like for HALO-X

## Agent learning objective

```text
Learn how planning, work-unit decomposition, execution, acceptance,
monitoring, and rollback interact under hidden evaluator constraints.
```

## Instrumentation

For every task:

```json
{
  "task_id": "T023",
  "parent_metric": "hidden_pass + architecture_preservation",
  "plan_summary": "...",
  "work_units": [],
  "tool_calls": [],
  "files_changed": [],
  "acceptance_claim": "done",
  "visible_tests": "pass",
  "hidden_tests": "fail",
  "hydra_findings": ["HIGH: architecture invariant broken"],
  "false_completion": true,
  "failure_mechanism": "acceptance_did_not_check_architecture"
}
```

## Curriculum clusters

```text
goal drift
false completion
architecture erosion
hidden invariant miss
tool rabbit hole
test weakening
trace suppression
rollback failure
```

## Candidate hypothesis example

```json
{
  "mechanism": "false_completion",
  "hypothesis": "The acceptance skill treats visible test pass as sufficient and does not check architecture-preservation invariants.",
  "change": "Add acceptance rule requiring invariant oracle citation before done.",
  "expected_gain": "lower false_completion_rate",
  "expected_cost": "slightly more tool calls",
  "evidence": [
    "runs/run_021/traces/T023.jsonl",
    "runs/run_022/hydra_findings.json"
  ]
}
```

This is where the branch ledger becomes a teacher, not just a guardrail.

---

# 16. The strongest answer in one sentence

Agents learn their harness when the system forces them to repeatedly answer this question with evidence:

> **“Which harness decision caused this failure, what minimal harness change tests that diagnosis, and what ablation proves the change—not some confound—caused the improvement?”**

Everything else is infrastructure.

The v3 substrate gives you the safe filesystem and evaluation boundary.  The paper gives evidence that full raw traces are the load-bearing signal, not scalar scores or summaries.  The missing layer is the harness-learning pedagogy: harness maps, diagnostic curricula, decision traces, one-mechanism edits, ablations, and doctrine distillation.

That is how you get agents to learn their harness.
