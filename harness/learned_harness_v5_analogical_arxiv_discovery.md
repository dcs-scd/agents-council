# Agents' harnesses should be learned, not hand-coded — Analogical ArXiv Discovery

Run date: 2026-05-28  
Mode: `constitutional`  
Skill: `analogical-arxiv-scout-v5`  
Local prior: `agents-council/harness/learned_harness_proposal.md`

## Target X-Ray

### Target claim

Agent harnesses should become learned systems: outer-loop agents should optimize the orchestration layer from traces, not rely on longer human-written prompts, static manuals, or hand-coded curriculum.

### Strongest counterargument

Unqualified "learn the harness" is unsafe and underspecified. A harness controls context, tools, permissions, state, recovery, and evaluation. If the same mutable agent learns those surfaces and also controls the evaluator, it can learn jailbreaks, overfit benchmarks, poison tool manuals, or optimize trace artifacts instead of task performance. The right thesis is narrower: learn proposal surfaces, freeze authority surfaces per epoch, and require each learned update to carry evidence.

### Transfer slots

| Slot | Current hand-coded thing | Needed learned replacement | Authority boundary |
|---|---|---|---|
| Harness code | Retrieval, memory, retry, context assembly | Trace-driven code deltas | Frozen tests, replay corpus, permissions |
| Context/playbook | Static instructions and lessons | Delta-updated evolving playbook | Curator rules, provenance, rollback |
| Tool manuals | Human developer docs | Agent-optimized tool descriptions | Poisoning scan, behavioral probes |
| Curriculum | Human-authored examples | Generated executable tasks | Frozen verifier and task filters |
| Test-time policy | Hand-picked search/depth heuristics | Discovered allocation/search algorithms | Offline replay before live use |
| Credit assignment | Single benchmark score | Descendant-performance / metaproductivity | Lineage simulation and ablation |
| Trace interpretation | Scalar pass/fail | Environment-response learning | Observation prediction and calibration checks |

### Non-negotiable invariant

Evaluator authority and curriculum verification functions must stay outside the mutable surface for a full epoch. Learning may propose changes to them, but adoption requires a separate review gate.

## Abstraction Map

Actors:

- Task agent: solves user tasks.
- Harness proposer: edits prompts, context assembly, retrieval, tool descriptions, retry/search policy, and sometimes code.
- Reflector: converts raw traces into causal diagnoses.
- Curator: writes structured deltas into the playbook or skill store.
- Challenger: generates new tasks near the failure frontier.
- Verifier: checks executable task success; not mutable by the proposer in the same epoch.
- Adversary: injects misleading tool metadata, selected traces, benchmark-specific hacks, or replay overfit.

Information available:

- Full raw execution traces, tool calls, files, logs, stdout/stderr, outcome labels, cost/latency, permissions, and prior candidate diffs.

Allowed actions:

- Propose one or more harness deltas.
- Run offline replay.
- Generate executable tasks.
- Rewrite tool descriptions only inside a sandboxed candidate registry.
- Update context/playbook through structured deltas.

Forbidden actions:

- Mutate evaluator logic and use it for same-epoch promotion.
- Promote a learned manual without poisoning checks.
- Treat a scalar score as sufficient evidence.
- Merge curriculum and solver roles without independent filtering.
- Delete trace provenance.

Success condition:

- A learned harness update improves live task performance or cost-adjusted performance, survives offline replay, preserves or improves trace interpretability, passes adversarial metadata checks, and remains rollbackable.

Resource constraints:

- Time: run most search in frozen replay before live eval.
- Samples: trace budget is precious; use counterfactual replay and frontier sampling.
- Compute: use Pareto selection instead of exhaustive search.
- Trust: learned artifacts are untrusted until certified.
- Verification: executable checkers dominate LLM-judge summaries.

## Search Plan

Queries executed:

- Known-seed ID verification for Meta-Harness, ACE, Trace-Free+, AutoTTS, Hyperagents, Huxley-Godel Machine, GEPA, SkillClaw, SCA, R-Zero, SEAL, Toolformer.
- Recent arXiv search for harness trace optimization, self-improving agents, learned tool descriptions, automated curriculum, test-time scaling discovery, and learned optimizers.
- Current-date retrieval of arXiv abstract pages for selected sources.

Selection policy:

- Prefer papers that contribute a mechanism, not a slogan.
- Include at least one measurement substrate, one proposer mechanism, one curriculum mechanism, one governance/safety warning, and one far-domain analogy.
- Demote papers that only say "self-improvement" without a clear evaluator, trace, or transfer primitive.

## Candidate Triage

| Paper | Role | Decision | Reason |
|---|---:|---|---|
| [Meta-Harness](https://arxiv.org/abs/2603.28052) | Core substrate | Promote | Directly optimizes harness code using source, scores, and execution traces. |
| [Harness-Bench](https://arxiv.org/abs/2605.27922) | Measurement substrate | Promote | Makes harness variation itself measurable across context, tools, state, constraints, permissions, tracing, and recovery. |
| [AutoTTS](https://arxiv.org/abs/2605.08083) | Safe search loop | Promote | Replaces hand-crafted inference heuristics with discovered strategies in a constructed environment. |
| [ACE](https://arxiv.org/abs/2510.04618) | Context evolution | Promote | Treats context as an evolving playbook and addresses context collapse. |
| [Trace-Free+](https://arxiv.org/abs/2602.20426) | Tool-manual learning | Promote | Learns tool descriptions, a concrete harness layer usually hand-written. |
| [MCP poisoning benchmark](https://arxiv.org/abs/2605.24069) | Governance gate | Promote | Shows learned or static tool manuals are a semantic attack surface. |
| [Self-Challenging Language Model Agents](https://arxiv.org/abs/2506.01716) | Executable curriculum | Promote | Generates Code-as-Task tasks with verification functions and failure cases. |
| [R-Zero](https://arxiv.org/abs/2508.05004) | Frontier curriculum | Promote | Challenger/Solver co-evolution attacks dependence on human-curated labels. |
| [Huxley-Godel Machine](https://arxiv.org/abs/2510.21614) | Credit assignment | Promote | CMP separates present benchmark performance from descendant improvement potential. |
| [ECHO](https://arxiv.org/abs/2605.24517) | Trace semantics | Promote | Treats terminal streams as supervision for environment-response prediction. |
| [SEAL co-evolution](https://arxiv.org/abs/2605.24426) | Agent-environment loop | Repair | Valuable co-evolution frame, but evaluator mutation must be authority-split. |
| [Hyperagents](https://arxiv.org/abs/2603.19461) | Upper-bound self-editing | Repair | Shows editable meta-level mechanisms; unsafe if copied without authority split. |
| [Toolformer](https://arxiv.org/abs/2302.04761) | Tool-use ancestor | Demote | Useful precedent for self-supervised tool use, but not enough harness learning. |
| [SIA](https://arxiv.org/abs/2605.27276) | Integrated harness/weight updates | Watch | Very relevant recent synthesis; not needed as a load-bearing primitive until full text review. |
| [FitText](https://arxiv.org/abs/2605.02411) | Dynamic tool retrieval | Watch | Useful supplement for tool ecology, secondary to Trace-Free+ plus poisoning checks. |

## Selected Paper Reviews

### Meta-Harness: End-to-End Optimization of Model Harnesses

Paper: [arXiv:2603.28052](https://arxiv.org/abs/2603.28052)  
Authors: Yoonho Lee, Roshen Nair, Qizheng Zhang, Kangwook Lee, Omar Khattab, Chelsea Finn

Review:

Meta-Harness is the direct anchor. It reframes performance as a property of the code that decides what to store, retrieve, and present, not merely a property of model weights. Its critical move is letting an outer-loop proposer inspect source code, scores, and execution traces for all prior candidates through a filesystem. That matters because ordinary text optimizers compress away the causal evidence needed to improve orchestration.

Transfer analysis:

Use Meta-Harness as the proposer substrate, but do not copy its authority model blindly. The learned-harness target needs a stricter promotion certificate: one-mechanism diff, replay evidence, factor-isolated benchmark result, poisoning scan if the delta touches tools, and rollback.

Falsifier:

If a Meta-Harness-style proposer cannot produce a single harness diff that beats a simple human baseline on one module under frozen replay and a held-out live set, the "learned harness" thesis is premature.

### Harness-Bench: Measuring Harness Effects across Models in Realistic Agent Workflows

Paper: [arXiv:2605.27922](https://arxiv.org/abs/2605.27922)  
Authors: Yilun Yao et al.

Review:

Harness-Bench is the missing measurement primitive. It explicitly treats the harness as the layer that manages context, tools, state, constraints, permissions, tracing, and recovery. That prevents a common category error: comparing whole agent systems and then pretending the base model, prompt, tool registry, and recovery policy were separable.

Transfer analysis:

Before learning harnesses, build a harness-effect map. The first experiment should vary only one harness factor at a time on realistic workflows. Without this, the outer loop will find improvements but not know whether they came from retrieval, permissions, retries, or trace formatting.

Falsifier:

If harness factor effects are small relative to model variance on the chosen workflow, start with model/task selection instead of harness learning.

### LLMs Improving LLMs: Agentic Discovery for Test-Time Scaling

Paper: [arXiv:2605.08083](https://arxiv.org/abs/2605.08083)  
Authors: Tong Zheng et al.

Review:

AutoTTS is important because it shifts human work from designing individual test-time heuristics to designing an environment where strategies can be discovered automatically. This is the right analogy for harness learning: the human should design the search environment, not every harness rule.

Transfer analysis:

Build an offline replay environment for harness deltas. Candidate changes must first be scored against frozen traces where action choices, tool outputs, and failures are replayable. Live execution becomes the final confirmation, not the search substrate.

Falsifier:

If replay winners do not transfer to live workflows, the replay environment is missing causal state; add scenario axes or abandon replay for that module.

### Agentic Context Engineering

Paper: [arXiv:2510.04618](https://arxiv.org/abs/2510.04618)  
Authors: Qizheng Zhang et al.

Review:

ACE attacks a very specific failure mode: iterative context rewriting drops details and collapses into short, generic summaries. Its Generator/Reflector/Curator pattern is a practical mechanism for accumulating strategies without letting every run rewrite the whole doctrine.

Transfer analysis:

Replace free-form `doctrine/*.md` growth with ACE-style delta updates. Learned context should be appendable, attributable, reversible, and tied to trace evidence. The Curator is not a prose summarizer; it is a provenance-preserving state maintainer.

Falsifier:

If delta updates do not preserve old rare-but-important lessons under repeated updates, ACE-style curation is insufficient for harness memory.

### Learning to Rewrite Tool Descriptions for Reliable LLM-Agent Tool Use

Paper: [arXiv:2602.20426](https://arxiv.org/abs/2602.20426)  
Authors: Ruocheng Guo, Kaiwen Dong, Xiang Gao, Kamalika Das

Review:

Trace-Free+ identifies a narrow but high-value surface: tool descriptions are usually written for humans, tolerate ambiguity, and fail agents as tool catalogs scale. Learning tool descriptions is more tractable than learning the entire harness and gives a low-risk entry point.

Transfer analysis:

Start with learned tool descriptions only after adding an adversarial metadata gate. Learned manuals should be evaluated for task success, selection precision, argument correctness, token cost, and poisoning susceptibility.

Falsifier:

If rewritten manuals improve success but increase susceptibility to semantic injection, reject the delta.

### When the Manual Lies: MCP Poisoning Attacks for LLM Agents

Paper: [arXiv:2605.24069](https://arxiv.org/abs/2605.24069)

Review:

This paper is not a harness-learning method; it is a necessary constitutional constraint. Tool descriptions are not passive documentation. They are part of the agent's cognitive planning layer and can carry malicious instructions through metadata.

Transfer analysis:

Every learned tool-description update must include a poisoning audit. The target system should assume manuals are executable cognitive inputs, not inert docs.

Falsifier:

If the audit cannot distinguish task-relevant guidance from hidden instruction injection, tool-description learning stays sandbox-only.

### Self-Challenging Language Model Agents

Paper: [arXiv:2506.01716](https://arxiv.org/abs/2506.01716)

Review:

SCA supplies the cleanest answer to "is the human still writing the lessons?" The challenger generates tasks after interacting with tools; tasks are Code-as-Task artifacts with instructions, verification functions, solutions, and failure cases.

Transfer analysis:

Use SCA to generate harness-stressing tasks, not just task-agent training data. A harness delta should survive new tasks generated to expose its specific failure modes.

Falsifier:

If generated tasks are mostly trivial, invalid, or verifier-gamed, the curriculum loop has not replaced human authorship.

### R-Zero: Self-Evolving Reasoning LLM from Zero Data

Paper: [arXiv:2508.05004](https://arxiv.org/abs/2508.05004)

Review:

R-Zero matters because it formalizes a Challenger/Solver dynamic that reduces dependence on human-curated tasks and labels. Its central transferable mechanism is not "zero data" as rhetoric; it is frontier maintenance through adversarially useful task generation.

Transfer analysis:

Use an R-Zero-like challenger to maintain tasks near the harness's failure frontier. For harness learning, the desired difficulty point is not only 50% task success; it is 50% success under current harness with failure modes attributable to a candidate harness factor.

Falsifier:

If challenger tasks stop moving with harness competence, the curriculum is static and will overfit.

### Huxley-Godel Machine

Paper: [arXiv:2510.21614](https://arxiv.org/abs/2510.21614)

Review:

HGM's value is the metaproductivity-performance distinction. A candidate that scores high today may have poor descendant potential; another candidate may create a better search lineage. Harness learning needs this because good orchestration is path-dependent.

Transfer analysis:

Score harness deltas by descendant performance potential after a small lineage rollout, not only by immediate benchmark gain. This also catches brittle hacks that spike one benchmark and reduce future learnability.

Falsifier:

If CMP-style lineage estimates are too noisy at small budgets, defer them until enough deltas exist and use simpler held-out replay gates first.

### ECHO: Terminal Agents Learn World Models for Free

Paper: [arXiv:2605.24517](https://arxiv.org/abs/2605.24517)

Review:

ECHO turns terminal observations into supervision. For CLI agents, stdout, stderr, files, logs, and traces encode the environment's response to actions. Sparse rewards throw that away.

Transfer analysis:

A learned harness should not only improve final pass/fail. It should improve the agent's predictive grip on the environment. Add an observation-prediction auxiliary metric: after a candidate harness delta, can the agent better predict likely tool outputs, error classes, or state changes?

Falsifier:

If a harness delta improves benchmark score while degrading environment-response calibration, treat it as a brittle policy hack.

### SEAL: Synergistic Co-Evolution of Agents and Learning Environments

Paper: [arXiv:2605.24426](https://arxiv.org/abs/2605.24426)

Review:

SEAL identifies agent-environment misalignment: the agent's frontier changes while the training environment remains static. That is exactly the curriculum problem for learned harnesses.

Transfer analysis:

Repair before transfer. Let the system propose environment/curriculum updates, but do not let those updates become same-epoch authority. The verifier must be frozen during candidate selection.

Falsifier:

If environment updates make success easier without improving held-out workflows, the co-evolution loop is corrupt.

### Hyperagents

Paper: [arXiv:2603.19461](https://arxiv.org/abs/2603.19461)

Review:

Hyperagents show the upper bound: the meta-level modification procedure itself can become editable. This is powerful and dangerous. It removes a fixed human bottleneck, but it also erodes the separation that makes evaluation credible.

Transfer analysis:

Use Hyperagents as a warning, not a v0 design. The target can eventually allow meta-procedure edits, but only under proof-carrying deltas and external authority.

Falsifier:

If meta-procedure edits can affect their own evaluator before promotion, the analogy is killed for production harnesses.

## Transfer Matrix

| Source mechanism | Target transfer | Type | Required adaptation | Kill condition |
|---|---|---|---|---|
| Meta-Harness trace/code proposer | Outer-loop learned harness deltas | Direct application | Add promotion certificates and immutable authority | Deltas exploit evaluator or rely on opaque score-only feedback |
| Harness-Bench factor isolation | Harness-effect measurement map | Direct application | Add local modules and factorial ablations | Harness factors cannot be separated enough to guide search |
| AutoTTS environment discovery | Offline replay harness search | Analogous use | Convert execution traces into replayable state/action/evidence corpus | Replay winners fail live transfer |
| ACE delta curation | Structured harness playbook memory | Direct application | Store trace-bound deltas, not prose summaries | Context collapse or provenance loss |
| Trace-Free+ rewrite model | Learned tool manuals | Direct application | Add adversarial poisoning and retrieval probes | Better success comes with weaker security |
| MCP poisoning | Learned-manual governance gate | Direct application | Add semantic injection tests to every manual delta | Gate cannot detect hidden instructions |
| SCA Code-as-Task | Generated harness stress tests | Direct application | Freeze verifier; use failure cases for harness factors | Generated verifiers are invalid or gameable |
| R-Zero Challenger/Solver | Moving curriculum frontier | Analogous use | Target harness-factor attribution, not only task difficulty | Challenger stops tracking frontier |
| HGM CMP | Lineage-level credit assignment | Analogous use | Estimate descendant potential of harness deltas | Too noisy at v0 budget |
| ECHO observation prediction | Trace semantic metric | Analogous use | Add environment-response prediction/calibration | Score gains degrade environment model |
| SEAL co-evolution | Adaptive environment proposals | Repair | Split proposal from authority | Same-epoch evaluator mutation |
| Hyperagents editable meta-procedure | Advanced self-editing | Repair | Require external review and proof-carrying deltas | Self-edit controls its own promotion |

## Invention Candidates

### 1. Proof-Carrying Harness Deltas

Definition:

A harness update is promotable only if it carries a certificate: source traces, one-mechanism diff, offline replay result, Harness-Bench factor isolation, executable verifier coverage, adversarial metadata scan when relevant, cost/latency delta, and rollback path.

Operators fired:

- `Split-authority + Learning`
- `Adversarialize + Governance`
- `Distributionalize + Certify`

Why it matters:

It converts "the harness learned something" into a reviewable artifact. This is the central repair to naive self-improving harnesses.

Minimal experiment:

Pick one retriever/dedup module. Generate three candidate deltas via GEPA/Meta-Harness style reflection. Promote only deltas with a complete certificate and held-out replay gain.

Kill condition:

Certificate overhead exceeds the value of the learned update on small modules, or certificates fail to catch obvious evaluator hacks.

### 2. Harness-Bench Factor Map Before Learning

Definition:

A local diagnostic matrix that varies context policy, retrieval policy, tool registry, permissions, tracing, and recovery independently before any learning loop is trusted.

Operators fired:

- `State-lift + Temporalize`
- `Omission-regret`

Why it matters:

The earlier proposal jumps too quickly to learning. Without a factor map, the system cannot know which harness surface deserves search.

Minimal experiment:

Run 6-10 workflows under controlled harness variants and estimate effect sizes for each factor.

Kill condition:

No factor shows meaningful effect or factors interact so strongly that one-module learning is misleading.

### 3. Poison-Resistant Learned Tool Manuals

Definition:

A Trace-Free+-style learned tool-description pipeline wrapped by MCP poisoning tests, retrieval perturbation, and dangerous-instruction scanning.

Operators fired:

- `Adversarialize + Governance`
- `Split-authority + Learning`

Why it matters:

Tool descriptions are the easiest harness layer to learn and the easiest place to hide instructions. Both facts are load-bearing.

Minimal experiment:

Rewrite descriptions for one small tool family. Measure tool selection, argument accuracy, token cost, and attack success under poisoned metadata.

Kill condition:

Attack success rises materially even when ordinary task success improves.

### 4. Environment-Model-Aware Harness Search

Definition:

Use ECHO-style observation prediction as an auxiliary metric: good harnesses should improve the agent's ability to predict environment responses, not just final score.

Operators fired:

- `Nonlinearize + Certify`
- `State-lift + Temporalize`

Why it matters:

It penalizes brittle harnesses that hide useful trace detail or teach agents to ignore environment feedback.

Minimal experiment:

For CLI tasks, hold out command-output/error prediction examples. Compare calibration before and after harness deltas.

Kill condition:

Observation prediction is uncorrelated with live task robustness.

### 5. Frontier-Coupled Harness Curriculum

Definition:

An R-Zero/SCA hybrid where generated tasks target the current harness's weak factor at roughly the failure frontier, with Code-as-Task verification frozen per epoch.

Operators fired:

- `State-lift + Temporalize`
- `Split-authority + Learning`

Why it matters:

It kills the "human wrote the lessons" objection without giving the learner authority over the checker.

Minimal experiment:

Generate ten harness-stressing tasks for one module. Filter by verifier validity and target ~50% current-harness failure. Use them as the next replay slice.

Kill condition:

Generated tasks are invalid, redundant, or improve only synthetic task performance.

### 6. Metaproductive Harness Lineages

Definition:

Score harness updates by expected descendant search quality, not only immediate score. A delta that makes traces clearer may outrank a delta with a larger one-shot benchmark gain.

Operators fired:

- `Distributionalize + Certify`
- `Omission-regret`

Why it matters:

Harnesses are learning infrastructure. A good update should make future updates easier.

Minimal experiment:

Run a shallow two-generation search from top immediate-gain deltas and top trace-quality deltas. Compare descendant frontier quality.

Kill condition:

Lineage estimates are too noisy to rank deltas at available budget.

## Verification Record

| Claim type | Claim | Evidence source | Confidence |
|---|---|---|---:|
| `paper_claim` | Meta-Harness optimizes harness code using source, scores, and traces. | [2603.28052](https://arxiv.org/abs/2603.28052) | High |
| `paper_claim` | Harness-Bench frames context, tools, state, constraints, permissions, tracing, and recovery as harness factors. | [2605.27922](https://arxiv.org/abs/2605.27922) | High |
| `paper_claim` | AutoTTS targets automatic discovery of test-time scaling strategies rather than hand-crafted heuristics. | [2605.08083](https://arxiv.org/abs/2605.08083) | High |
| `paper_claim` | ACE treats context as evolving playbooks with generation, reflection, and curation. | [2510.04618](https://arxiv.org/abs/2510.04618) | High |
| `paper_claim` | Trace-Free+ learns to rewrite tool descriptions for more reliable tool use. | [2602.20426](https://arxiv.org/abs/2602.20426) | High |
| `paper_claim` | MCP poisoning attacks hide instructions in tool metadata/descriptions. | [2605.24069](https://arxiv.org/abs/2605.24069) | High |
| `paper_claim` | SCA uses Code-as-Task with instructions, verification functions, solutions, and failure cases. | [2506.01716](https://arxiv.org/abs/2506.01716) | High |
| `paper_claim` | R-Zero reduces reliance on human-curated tasks and labels through autonomous Challenger/Solver dynamics. | [2508.05004](https://arxiv.org/abs/2508.05004) | Moderate-high |
| `paper_claim` | HGM distinguishes benchmark performance from self-improvement potential via CMP. | [2510.21614](https://arxiv.org/abs/2510.21614) | High |
| `paper_claim` | ECHO uses terminal observation streams as supervision. | [2605.24517](https://arxiv.org/abs/2605.24517) | High |
| `transfer_claim` | Harness learning should be certificate-gated. | Synthesis across Meta-Harness, Harness-Bench, AutoTTS, MCP poisoning | Moderate |
| `invention_claim` | Proof-Carrying Harness Deltas are the right integration primitive. | New synthesis | Moderate |

## Promoted Research Artifact

### Proof-Carrying Harness Deltas

Definition:

A Proof-Carrying Harness Delta (PCHD) is a learned update to an agent harness whose promotion depends on an attached evidence certificate, not on trust in the proposer.

Protocol:

1. Choose one mutable harness surface.
2. Generate candidate deltas from raw traces.
3. Require a one-mechanism diff or explicitly labeled multi-mechanism diff.
4. Run frozen offline replay.
5. Run Harness-Bench-style factor isolation.
6. Run executable verifier tasks, including generated frontier tasks.
7. Run adversarial metadata checks if the delta touches tools, manuals, retrieval, or context.
8. Record cost, latency, trace-quality, and environment-response calibration.
9. Promote only if held-out live eval confirms replay gain.
10. Store rollback and provenance.

Nonexamples:

- "The agent rewrote its prompt and score improved."
- "The manual was rewritten by an LLM and looked clearer."
- "The curriculum generated harder tasks and the solver trained on them."
- "A self-editing agent modified its own evaluator and passed."

Minimal falsifier:

Run PCHD on one harness module for two weeks. If no delta survives certificate gates while a human can produce a comparable improvement in one day, PCHD is too heavy for v0.

## Killed / Repaired Analogies

| Analogy | Decision | Why |
|---|---|---|
| "Hyperagents imply the whole harness, including evaluator, should self-edit." | Kill | Violates authority split; useful as upper-bound research only. |
| "Toolformer proves agents can learn all harness tool behavior." | Kill | Tool-use self-supervision is narrower than harness optimization and lacks governance. |
| "AutoTTS means offline replay is enough." | Repair | Replay is a search gate, not final authority; live holdout remains necessary. |
| "SEAL means curriculum and policy should co-evolve freely." | Repair | Co-evolution is useful only with frozen verifier authority per epoch. |
| "ACE delta updates can replace executable tests." | Kill | Context memory is not verification. |
| "Harness-Bench can replace learning." | Kill | It measures factors; it does not generate improvements. |
| "GEPA-style reflection is enough for learning." | Repair | Reflection proposes; certificates dispose. |

## Operator Policy Delta

Operators fired:

- `Split-authority + Learning`: recurring core operator; all useful learning surfaces require external promotion authority.
- `Adversarialize + Governance`: added because learned manuals and context deltas are attack surfaces.
- `State-lift + Temporalize`: harness must be treated as a time-varying state machine, not a static prompt.
- `Distributionalize + Certify`: candidate quality is a distribution over replay/live/cost/security/trace metrics.
- `Omission-regret`: missing measurement substrate would make the previous proposal overconfident.

Policy update:

For learned-agent-harness topics, v5 should treat a measurement substrate as mandatory. A proposal that starts with a proposer loop before defining factor isolation and authority boundaries should be demoted.

## Governance Record

Risk:

- Learned harnesses can learn benchmark exploits faster than capabilities.
- Tool-description learning can create or preserve semantic injection paths.
- Curriculum generation can become verifier gaming.
- Context deltas can erase rare safety lessons.
- Meta-level self-editing can collapse the distinction between learner and judge.

Mitigations:

- Freeze evaluator and verifier per epoch.
- Treat learned docs as untrusted executable cognitive inputs.
- Store provenance for every learned delta.
- Use offline replay before live execution.
- Require held-out live confirmation.
- Keep rollback cheap.
- Separate proposer, curator, verifier, and promotion authority.

Residual uncertainty:

- Moderate on PCHD as the right integration primitive.
- High confidence that naive hand-coded harness docs are the wrong long-term direction.
- High confidence that unconstrained self-editing of evaluator/curriculum is unsafe.
- Unknown whether small-budget lineage/CMP estimates are stable enough for v0.

## What v5 Adds, Demotes, or Corrects vs `learned_harness_proposal.md`

Adds:

- Harness-Bench as the missing measurement substrate.
- PCHD as the promotion primitive.
- MCP poisoning as a mandatory learned-manual gate.
- ECHO-style environment-response calibration as a trace-quality metric.
- Explicit distinction between search substrate, measurement substrate, and authority substrate.

Demotes:

- HGM/CMP from v0 requirement to post-v0 once enough lineage data exists.
- Hyperagents from design precedent to unsafe upper-bound analogy.
- Toolformer-style tool-use learning to historical ancestor, not load-bearing mechanism.

Corrects:

- The previous v0 starts with GEPA plus AutoTTS replay. That is close but under-instrumented. First add a minimal harness-factor map, otherwise the GEPA loop may optimize the wrong surface.
- "Doctrine as ACE deltas" is still right, but ACE deltas must be secondary to executable verification and certificate gates.
- "Evaluator and curriculum verification outside mutable surface" remains the central invariant; v5 strengthens it into a proof-carrying promotion rule.

## Next Experiments

1. Build a local Harness-Bench mini-map for one module: vary retrieval, context assembly, retry policy, trace formatting, and permissions one at a time.
2. Run GEPA/Meta-Harness-style proposer on the highest-effect module and produce at most five candidate deltas.
3. Implement a PCHD certificate schema: trace pointers, diff summary, replay result, verifier coverage, security scan, cost/latency, rollback.
4. Add AutoTTS-style offline replay for frozen traces before live eval.
5. Add one SCA Code-as-Task verifier for the same module; keep verifier immutable for the epoch.
6. Run a Trace-Free+ style learned rewrite for one tool family, but gate it with MCP poisoning tests.
7. Add an ECHO-inspired observation-prediction check for CLI/tool-output tasks.
8. Only after 10+ accepted/rejected deltas exist, test HGM/CMP-style lineage scoring.

