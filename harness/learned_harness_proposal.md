# Learned harnesses, not hand-coded: a proposal grounded in the ArXivIQ corpus

**Source:** review of `harness/arxiviq_archive_all.md` (377 paper synopses). Top 20 were scored against the topic via weighted keyword relevance; the load-bearing 12 are cited below by paper title.
**Companion artifacts:** `harness/55p_ideas.md` (the v0 seed this builds on), `harness/midflight_injection_proposal.md` (mechanism for in-flight proposal injection into the Model Council), `harness/council_results.md` (the lens-based council on the seed).
**Voice:** Andreessen — lead with the counterargument, explicit confidence, no padding.
**Confidence on the overall design:** moderate-high. The pieces all have published precedent; the integration is novel and unproven.

---

## 0. Counterargument first

"Write a longer harness description and ship better docs" is the default-wrong path. The Outsider lens of the prior council already nailed it: documentation is *moving the human's knowledge into prompts*, not the agent learning anything. The ArXivIQ corpus contains six published precedents for the *learn-the-harness* direction; the proposal here is to compose them, not to invent a new mechanism in the void. If anything, the seed `55p_ideas.md` *under*-uses the literature: it cites only Meta-Harness, then bolts on hand-authored curriculum machinery to compensate for the parts Meta-Harness left to the open-ended loop. The corpus tells you which parts to replace and which to keep.

The single hardest objection to the whole programme — **"a self-improving harness learns its own jailbreaks as fast as it learns its capabilities"** (Contrarian lens, **Hyperagents/DGM-H** edge case) — is real and not resolvable inside this proposal. The mitigation is architectural: keep evaluator and curriculum *outside* the agent's mutable surface, in the spirit of HGM's decoupled tree search. The proposal below treats this as a hard invariant, not a tunable.

---

## 1. The applicable ideas, paper-by-paper

Twelve papers carry the load. Each entry: **paper · idea · what it solves in our context · what it does *not* solve**.

### A. Substrate and theoretical anchor

1. **Meta-Harness: End-to-End Optimization of Model Harnesses** (Lee, Nair, Zhang, Lee, Khattab, Finn — Stanford IRIS, ArXiv 2603.28052)
   *Idea.* An agentic outer loop with unrestricted filesystem access to raw execution traces, iteratively rewriting retrieval, memory, and prompt-assembly code. Beats human-engineered orchestrations on classification, coding, IMO-level math.
   *Solves.* The substrate question: *can* the harness be programmed by an outer-loop agent at all. Empirically, yes.
   *Does not solve.* Credit assignment over the candidate tree; cross-session compounding; safety against the harness rewriting its own evaluator.

2. **A Survey of Self-Evolving Agents: On Path to Artificial Super Intelligence** (Gao, Genga, Hua, Hu, ..., Wang et al., ArXiv 2507.21046)
   *Idea.* Taxonomic anchor: **what** to evolve (models · context · tools · architecture), **when** (during-task · between-task), **how** (reward-based · imitation · population-based).
   *Solves.* Forces explicit choice rather than collapsing "agent learning" into one undifferentiated verb (this was the First-Principles lens's core objection to the seed).
   *Does not solve.* Specifics; it's a survey.

### B. Credit assignment and meta-evaluation

3. **Huxley-Gödel Machine** (HGM, Wang, Piękos, ..., Schmidhuber, ArXiv 2510.21614)
   *Idea.* **Metaproductivity-Performance Mismatch** — current benchmark score is a bad predictor of an agent's improvement *potential*. Introduces **Clade-Metaproductivity (CMP)**: aggregate the performance of an agent's entire tree of descendants as the selection metric. Plus async tree-search that decouples agent creation from evaluation.
   *Solves.* The Outsider lens's killer falsifiability question — *what test would tell you the agent has learned the harness vs. retrieved a precomputed lesson?* CMP is that test: a learned harness must show *measurable future improvement potential*, not just present benchmark.
   *Does not solve.* The cost: simulating each candidate's lineage is expensive.

### C. Reflection and proposer engine

4. **GEPA: Reflective Prompt Evolution Can Outperform Reinforcement Learning** (Agrawal, Tan, Soylu, Ziems, Khare, Opsahl-Ong, ..., Stanford/Berkeley, ArXiv 2507.19457)
   *Idea.* **Reflective prompt mutation** — an LLM analyzes its own performance traces in natural language and proposes targeted improvements. **Pareto selection** keeps a diverse frontier of high-performing prompts; prevents convergence to local optima.
   *Solves.* Replaces the seed's "human writes the doctrine markdown" with a mechanical reflection operator. Replaces hand-tuned RL reward shaping. Pareto frontier eliminates the seed's risk that one early lesson ossifies into stale doctrine.
   *Does not solve.* The diversity-of-priors question — GEPA's diversity is over prompts, not over reasoning archetypes. Needs the next idea.

5. **DGM-Hyperagents** (Zhang, Zhao, Foerster, Clune, ..., ArXiv 2603.19461)
   *Idea.* A single, fully editable self-referential program that combines task-execution and meta-optimization. Open-ended evolutionary search rewrites both layers.
   *Solves.* North-star ambition: the agent owning its own improvement machinery.
   *Does not solve.* Safety. Treat this as the *upper bound* of what's possible; v1 must stop short.

### D. Role separation, context as evolving artifact

6. **Agentic Context Engineering** (ACE, Zhang, Hu, Upasani, ..., Olukotun, ArXiv 2510.04618)
   *Idea.* Treat context as an **evolving playbook**, not a static prompt. Three roles: **Generator** (runs tasks), **Reflector** (extracts lessons from traces), **Curator** (maintains the playbook with structured **delta updates** rather than monolithic rewrites — preserves detail over time).
   *Solves.* The seed gestures at four roles (task / proposer / evaluator / distiller) but never operationalizes how doctrine actually gets written or how to avoid losing detail. ACE's delta-update mechanism is the missing primitive.
   *Does not solve.* Evaluation; ACE leaves the evaluator outside.

### E. Cross-session, cross-instance compounding

7. **SkillClaw: Let Skills Evolve Collectively with Agentic Evolver** (Ma, Yang, Ji, ..., Chu, ArXiv 2604.08377)
   *Idea.* **Collective skill evolution**: aggregate execution trajectories *across multiple user instances*, run an "agentic evolver" that iteratively refines or creates skills in a shared centralized repository. Closes the loop of "every instance stumbles on identical edge cases."
   *Solves.* The seed has zero cross-instance learning. SkillClaw is the literal mechanism for the seed's `doctrine/` directory to compound across users instead of being a local-to-one-run prose corpus.
   *Does not solve.* Privacy/isolation when trajectories span tenants.

8. **Learning to Rewrite Tool Descriptions for Reliable LLM-Agent Tool Use** (Trace-Free+, Guo, Dong, Gao, Das, ArXiv 2602.20426)
   *Idea.* Tool layer of the harness is *learned*: a model rewrites human-centric API documentation into agent-optimized tool descriptions, via curriculum on trace-rich → trace-free.
   *Solves.* The piece of the harness most often hand-coded — tool descriptions — gets learned too. Targeted, low-risk integration point.
   *Does not solve.* Anything else.

### F. Curriculum auto-generation (kills the "human authored the lessons" objection)

9. **Self-Challenging Agent (SCA)** with **Code-as-Task (CaT)** (Zhou, Levine, Weston, Li, Sukhbaatar, ArXiv 2506.01716)
   *Idea.* Each generated task carries: instruction + **verification function** + example solution + failure cases, all expressed in **executable code**. Auto-filters trivial or flawed tasks. 95.8% relative success improvement on tool-use benchmarks.
   *Solves.* The Contrarian lens's sharpest objection — *"if all the curriculum, failure clusters, doctrine tests are hand-authored, the learning lives in the human's head."* CaT moves task generation into executable artifacts the harness itself can author and verify.
   *Does not solve.* Tasks that have no executable verification (open-ended writing, judgment calls).

10. **R-Zero: Self-Evolving Reasoning LLM from Zero Data** (Huang, Yu, Wang, Zhang, ..., Yu, ArXiv 2508.05004)
    *Idea.* **Challenger ⟂ Solver** co-evolution. Challenger generates problems at ~50% Solver success rate (theorized optimal learning frontier). Solver trains against them with pseudo-labels via majority vote.
    *Solves.* The curriculum-generator engine, with no human task author. ~50% difficulty calibration is principled and self-tuning.
    *Does not solve.* The pseudo-label problem in domains where majority vote is misleading (safety-sensitive judgments).

### G. Inference-time policy, dynamic depth

11. **LLMs Improving LLMs: Agentic Discovery for Test-Time Scaling** (AutoTTS, Zheng, Liu, Huang, ..., Huang, ArXiv 2605.08083)
    *Idea.* Explorer LLM autonomously synthesizes test-time scaling *algorithms* (when to branch / probe / prune / terminate), via policy search in an **offline replay environment** — i.e. against frozen traces, not live execution.
    *Solves.* The safety constraint for harness-design search: candidate harnesses get evaluated against past trace replays before they touch live execution. This is the cheap, fast, safe inner loop.
    *Does not solve.* Generalization from replay to live; offline-online gap is real.

12. **Self-Adapting Language Models (SEAL)** (Zweiger, Pari, Guo, Akyürek, Kim, Agrawal, ArXiv 2506.10943)
    *Idea.* Nested loop: inner loop SFT-updates model weights from agent-generated "self-edits"; outer RL loop trains the model to generate effective self-edits. Direct closure of First-Principles's "where are the weights?" objection.
    *Solves.* The genuine-learning question. If your stack tolerates fine-tuning, SEAL is the weights pathway the seed never named.
    *Does not solve.* Closed-API stacks (Claude/GPT-only deployments) can't run this.

---

## 2. The integrated approach

Six mechanisms wired together. Each cited to its load-bearing paper. The Self-Evolving-Agents survey's three axes (**what / when / how**) organize the layout.

### What evolves (the mutable surface)

| Layer | Mutable? | Mechanism | Citation |
|---|---|---|---|
| Tool descriptions | yes | learned rewriter | **Trace-Free+** (#8) |
| Context / playbook | yes, delta-updated | Generator / Reflector / Curator | **ACE** (#6) |
| Prompts (per-module instruction text) | yes | reflective mutation + Pareto frontier | **GEPA** (#4) |
| Agent code (retrieval, memory, orchestration) | yes, sandboxed | outer-loop coding agent w/ raw trace access | **Meta-Harness** (#1) |
| Skills library | yes, cross-instance | agentic evolver against trajectory corpus | **SkillClaw** (#7) |
| Model weights | optional | SFT on self-edits, RL on the self-edit policy | **SEAL** (#12) |
| Evaluator + curriculum verification functions | **NO** — hard invariant | code-only, immutable per epoch | **HGM** spirit (#3), **SCA/CaT** for the verification format (#9) |

### When it evolves

- **Between tasks** (epoch boundaries) for prompts, skills, agent code — to keep credit assignment clean.
- **Within tasks** (step level) for tool selection and *planning frequency* (when to think vs. act), via **CogRouter** / **Learning When to Plan** (paper #14–15, second tier; not load-bearing here but documented for completeness).
- **Per epoch** for evaluator and curriculum updates — *humans inspect and accept* before they go live. This is the non-negotiable safety boundary.

### How it evolves

1. **Curriculum auto-generation.** Challenger / Solver loop (**R-Zero**, #10) generates harness-stressing tasks at the ~50% Solver-failure frontier. Each task is **Code-as-Task** (**SCA**, #9): instruction + executable verification + example solution + failure cases. No human authors curriculum prose. The Contrarian lens's "the human writes the lessons" objection dies here.

2. **Inner loop — reflective proposing.** **Meta-Harness** (#1) outer agent reads raw traces; **GEPA**-style (#4) reflection produces a natural-language diagnosis and a targeted, single-mechanism candidate edit. Candidates land on a **Pareto frontier** scored on (a) task success, (b) cost, (c) trace quality (downstream interpretability).

3. **Outer loop — safe evaluation.** Candidates are first evaluated against the **AutoTTS** (#11) offline replay corpus — frozen traces, no live execution risk. Only frontier-safe candidates proceed to live eval. The seed's "negative controls" become offline-replay survival.

4. **Credit assignment.** Selection uses **HGM/CMP** (#3): not raw benchmark, but estimated *future descendant performance* via async lineage simulation. This is the Outsider lens's falsifiability test: a real learned harness must show downstream improvement potential, not just present score.

5. **Context distillation.** Promoted candidates' lessons enter the playbook via **ACE** (#6) delta updates: Generator runs the task, Reflector extracts the lesson, Curator inserts it as a structured delta (not a prose rewrite). The seed's `doctrine/lessons/L0001_...md` becomes a structured incremental log, not free-form markdown.

6. **Cross-instance compounding.** **SkillClaw** (#7) aggregates trajectories across users/sessions. Skills migrate to the shared repository only after lineage-level survival in step 4. This is the seed's missing primitive — the doctrine layer that *compounds across deployments*, not just runs.

### Optional: the weights pathway

If your deployment can fine-tune (open-weight or LoRA-friendly closed-weight): wire **SEAL** (#12) as the outer-outer loop. The reflective traces from step 2 become SFT examples; an RL objective measures how good the self-edits are. This is the only mechanism in the corpus that changes the *model* rather than the *harness*. The First-Principles lens flagged its absence as the seed's largest hole. If you cannot fine-tune (Claude/GPT-only stacks), accept the limit honestly: you are evolving the harness, not the agent.

---

## 3. What the seed (`55p_ideas.md`) got right; where this diverges

| Seed claim | Corpus verdict |
|---|---|
| **Raw traces are load-bearing, scalar scores are not** (seed §2) | ✓ unanimous — **Meta-Harness** (#1), **GEPA** (#4), **ACE** (#6) all gate on raw trace access. |
| **Causal contrast > score feedback** (seed §2) | ✓ — GEPA's reflective mutation is literally this. But the seed's *prose-narrative* contrastive diagnosis is best done by an LLM reflector, not hand-written. |
| **Harness map as structural contract** (seed §4) | ✓ keep — but auto-derived from agent code (not hand-curated). |
| **One-mechanism edits at proposal time** (seed §7) | ✗ wrong — GEPA's Pareto + R-Zero's frontier allow multi-mechanism candidates with mechanism-isolation enforced **at promotion** (matches the First-Principles + Contrarian + Executor lens consensus). |
| **Ablation-as-teacher** (seed §8) | ✓ but cost-bounded — AutoTTS (#11) offline-replay catches most of it cheaply. Run full ablation only on promoted candidates. |
| **Doctrine as prose** (seed §9) | ✗ wrong — replace with ACE delta updates (#6) + SCA Code-as-Task verifications (#9). Executable doctrine compounds; prose doctrine ossifies. |
| **Apprenticeship cases** (seed §10) | ✗ wrong — replace with R-Zero auto-generation (#10) + SCA CaT (#9). 30–50 hand-authored cases is the human writing the lessons. |
| **Four-role separation** (seed §11) | ✓ partial — ACE's three roles (Generator / Reflector / Curator) carry more weight than the seed's four; the seed's "Evaluator" stays separate as the hard invariant (HGM spirit). |
| **MH-o4-v0 required artifacts** (seed §13) | partial — the v0 list is too long; see §4 below. |

---

## 4. Minimal v0 — what to ship first

The Executor lens of the prior council was right: 12 substrate artifacts before any learning evidence exists is bureaucracy. **Two work units, in order:**

1. **WU-1 (1 week): GEPA-on-one-module + AutoTTS-style offline replay.**
   Pick one harness module (the retriever's dedup policy, say). Run **GEPA** (#4) reflective mutation against frozen traces (**AutoTTS** style replay, #11). Track a Pareto frontier of (recall@10, latency, trace-quality). Land *one promoted candidate* with an evidence pointer to the trace that justified it. **No** ablation runner, **no** doctrine schema, **no** four-role architecture, **no** lineage CMP yet. This proves the inner loop works.

2. **WU-2 (1 week): SCA Code-as-Task harness for the same module.**
   Author the **first** verification function in CaT format (**SCA**, #9). Run **R-Zero**-style Challenger generation (#10) at ~50% Solver failure to produce the curriculum. Now you have curriculum auto-generation, an executable evaluator, and the seed's first real doctrine entry — all without a human writing the lessons.

Everything else — HGM's CMP, ACE's delta-update Curator, SkillClaw's cross-instance evolver, SEAL's weights pathway — earns its complexity only after WU-1 and WU-2 show the inner loop produces real signal. This matches the Executor lens consensus: prove the loop on one domain before scaling the bureaucracy.

---

## 5. Honest gaps no paper resolves

- **Safety of self-rewriting orchestration.** **DGM-H** (#5) shows full self-referential editing is possible. None of the papers solve the attack-surface argument (Contrarian lens). Mitigation is architectural: evaluator and curriculum verification functions stay **outside** the agent's mutable surface, per epoch, with human acceptance.
- **Closed-API weight evolution.** **SEAL** (#12) requires fine-tuning. Stacks restricted to Claude / GPT inference cannot use it. The strongest available substitute is *retrieval-augmented context evolution* via ACE — weaker, but the only option.
- **Offline-online generalization gap.** AutoTTS evaluates against frozen traces. Promoted candidates may behave differently on live execution. The proposal mitigates by gating final promotion on a small live-eval budget, but the gap is unresolved in the literature.
- **Open-ended judgment tasks.** SCA Code-as-Task assumes executable verification. For tasks whose success requires human or LLM-judge evaluation, you need a separate judge model and you inherit its biases.
- **Cross-tenant trajectory aggregation.** SkillClaw (#7) assumes shared infrastructure. Privacy and IP isolation across deployments is unsolved.

---

## 6. One-line summary

**A learned harness is not a longer prompt; it is an outer-loop search over executable orchestration code, gated by a frozen evaluator, fed by raw traces, distilled into structured delta updates, and credit-assigned by lineage potential — every load-bearing piece has a published precedent in this corpus, and the value is in the integration.**

---

*Confidence:* moderate-high on the design (every primitive is published); moderate on the v0 sizing (paper budgets don't translate cleanly to operator weeks); low on cross-tenant aggregation and closed-API weight evolution (no precedent fits cleanly).
