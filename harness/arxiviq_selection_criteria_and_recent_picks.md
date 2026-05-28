# ArXivIQ Selection Criteria and Recent Picks

Generated: 2026-05-28

Source interpreted as: arXiv, especially recent `cs.AI`, `cs.LG`, `cs.CL`, `cs.SE`, `cs.RO`, `cs.CV`, and adjacent AI-infrastructure categories. This matches the downloaded ArXivIQ corpus: the reviewed papers are overwhelmingly arXiv papers, selected for AI/ML relevance rather than for a single narrow subject class.

## Inferred Selection Criteria

ArXivIQ does not appear to select papers by raw popularity alone. The corpus suggests a stronger editorial filter:

1. **Bottleneck-first papers**
   - The paper names a real failure mode in current AI systems: long-context reasoning, memory, routing, evaluation leakage, RL instability, benchmark brittleness, compute cost, safety oversight, or agent reliability.
   - Strong signal: the review can be framed as `The <X> Bottleneck`, `The <Y> Fallacy`, or `The <Z> Resolution Loss`.

2. **Mechanism or reframe**
   - The paper is not just "we tried another model."
   - It introduces a mechanism, reduction, benchmark, training loop, architecture, routing rule, theorem, or measurement lens that changes how the problem is understood.

3. **Strategic relevance**
   - The paper connects to a live frontier theme: agents, test-time compute, reasoning models, long context, sparse/MoE routing, model compression, post-training, safety, scalable oversight, AI-for-science, or hardware/efficiency.
   - It should matter to researchers or builders beyond the exact benchmark.

4. **Evidence hook**
   - The paper has reviewable evidence: strong headline metrics, ablations, a new benchmark, a theorem, failure analysis, architecture diagrams, or scaling curves.
   - Pure position papers can qualify only if the conceptual framework is unusually useful.

5. **Intuitive explanation potential**
   - Good candidates support an intuitive diagram or "core mechanism" explanation.
   - ArXivIQ-style reviews often succeed because the paper can be translated into a compact mental model.

6. **Non-obvious tradeoff**
   - The best papers expose a tradeoff: memory vs reasoning, compression vs fidelity, conservatism vs utility, exploration vs exploitation, routing coherence vs expert freedom, latency vs accuracy, safety vs expressivity.

7. **Concrete artifact**
   - Strong preference for papers with a named system, benchmark, dataset, framework, model, or algorithm.
   - Code/model release helps but is not required.

8. **Sufficient depth**
   - Avoid papers that are only narrow application wrappers, thin surveys, marginal prompt studies, or incremental benchmark runs unless they reveal a broader failure mode.

## Recent arXiv Papers I Would Select

### 1. LiveBrowseComp: Are Search Agents Searching, or Just Verifying What They Already Know?

- arXiv: https://arxiv.org/abs/2605.28721
- Date: submitted 2026-05-27.
- Why it fits: clean bottleneck and strong reframe. It argues that search-agent benchmarks may reward intrinsic model knowledge rather than evidence-driven search. The new benchmark uses recent facts to break that leakage channel.
- ArXivIQ angle: `The Intrinsic Knowledge Dependence Bottleneck`.
- Visual hook: static BrowseComp vs live/recent-fact BrowseComp pipeline showing closed-book leakage collapse.
- Selection strength: **very high**.

### 2. CORE: Contrastive Reflection Enables Rapid Improvements in Reasoning

- arXiv: https://arxiv.org/abs/2605.28742
- Date: submitted 2026-05-27.
- Why it fits: directly in ArXivIQ territory: reasoning improvement, verifiable rewards, non-parametric self-improvement, compact learned insights. It has a clear mechanism: contrast successful vs unsuccessful reasoning traces, then distill the difference into reusable natural-language strategies.
- ArXivIQ angle: `The Sample Efficiency Bottleneck in Self-Improving Reasoners`.
- Visual hook: failed trace + successful trace -> contrastive insight memory -> improved future rollout.
- Selection strength: **very high**.

### 3. Calibrating Conservatism for Scalable Oversight

- arXiv: https://arxiv.org/abs/2605.28807
- Date: listed on 2026-05-28 recent arXiv.
- Why it fits: high-strategic relevance. It frames scalable oversight as calibrated conservatism with finite-time guarantees, not just heuristic monitoring. The abstract claims tests on a modified SWE-bench and MACHIAVELLI with target violation rates matching theory.
- ArXivIQ angle: `The Oversight Calibration Bottleneck`.
- Visual hook: utility-seeking agent, auxiliary concern signals, conformal calibration layer, conservative action filter.
- Selection strength: **very high**.

### 4. AutoScientists: Self-Organizing Agent Teams for Long-Running Scientific Experimentation

- arXiv: https://arxiv.org/abs/2605.28655
- Date: listed on 2026-05-28 recent arXiv.
- Why it fits: agentic AI-for-science with strong benchmark hooks. The paper claims decentralized teams, shared experimental state, critique before compute use, and results across BioML-Bench, GPT training optimization, and ProteinGym.
- ArXivIQ angle: `The Single-Trajectory Bottleneck in AI Research Agents`.
- Visual hook: hypothesis teams self-organize around a shared experimental state, preserving successes and failures.
- Selection strength: **very high**.

### 5. Continual Model Routing in Evolving Model Hubs

- arXiv: https://arxiv.org/abs/2605.28577
- Date: listed on 2026-05-28 recent arXiv.
- Why it fits: very reviewable mechanism and benchmark. It formalizes model hubs as a continual routing problem, introduces CMRBench with over 2,000 candidate models, and proposes CARvE for routing through hub expansion.
- ArXivIQ angle: `The Static Router Bottleneck in Model Hubs`.
- Visual hook: growing model hub -> stale router collapse -> checkpoint-anchored continual router.
- Selection strength: **high**.

### 6. Thinking as Compression: Your Reasoning Model is Secretly a Context Compressor

- arXiv: https://arxiv.org/abs/2605.28713
- Date: listed on 2026-05-28 recent arXiv.
- Why it fits: exactly matches the corpus taste for reframes. It treats reasoning traces as compressed context and reports large gains over compression baselines at 4x and 8x compression.
- ArXivIQ angle: `The Compression-Reasoning Duality`.
- Visual hook: long context -> thinking trace as task-relevant compressed state -> downstream answer.
- Selection strength: **high**.

### 7. LACUNA: Safe Agents as Recursive Program Holes

- arXiv: https://arxiv.org/abs/2605.28617
- Date: listed on 2026-05-28 recent arXiv.
- Why it fits: agent safety plus programming-language mechanism. It closes the split between agent runtime and model-written code using typed `agent[T](task)` holes that are checked before execution.
- ArXivIQ angle: `The Runtime-Action Split in Code-Writing Agents`.
- Visual hook: typed program hole -> generated action code -> type/effect check -> atomic accept/reject.
- Selection strength: **high**.

### 8. Dense2MoE: Pushing the Pareto Frontier of On-Device LLMs via Unified Pruning and Upcycling

- arXiv: https://arxiv.org/abs/2605.26496
- Date: submitted 2026-05-26.
- Why it fits: architecture/efficiency paper with a clean systems bottleneck. It unifies pruning and dense-to-MoE upcycling, guided by Roofline theory, to improve the latency-accuracy Pareto frontier for on-device LLMs.
- ArXivIQ angle: `The Memory-Wall Bottleneck in On-Device MoE`.
- Visual hook: dense layers -> prune bandwidth-heavy attention -> upcycle MLPs into routed experts.
- Selection strength: **high**.

## Near Misses / Watchlist

- **Tree of Thoughts as a Classical Heuristic Search Problem** — good theoretical reframing; likely reviewable if it has actionable design patterns rather than just taxonomy.
- **A Matter of TASTE: Improving Coverage and Difficulty of Agent Benchmarks** — strong benchmark angle; needs abstract/full text inspection.
- **Do Agents Know What They Can't Do? Evaluating Feasibility Awareness in Tool-Using Agents** — attractive agent-evaluation question; select if evidence is strong.
- **Risk-Controlled Lean-as-Judge for Natural-Language Mathematical Reasoning** — likely fits the oversight/evaluation theme; needs closer read.
- **DenoiseRL: Bootstrapping Reasoning Models to Recover from Noisy Prefixes** — plausible reasoning-RL mechanism; needs evidence check.

## My Top 3 For Immediate Review

1. **LiveBrowseComp** — strongest benchmark failure-mode paper; likely high-impact for agent evaluation.
2. **CORE** — strong self-improvement mechanism with clear contrastive-intuition diagram.
3. **Calibrating Conservatism for Scalable Oversight** — strategically important safety/control paper with statistical guarantees.

