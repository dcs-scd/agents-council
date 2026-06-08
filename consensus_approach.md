**Most efficient approach: use a structured, mediator-led Delphi protocol with claim-level disagreement compression.** Do **not** let all agents free-chat until they “feel” aligned. That is expensive, noisy, and vulnerable to false consensus.

Confidence: **high**.

The core design should be:

> **Independent first pass → mediator compresses disagreements → targeted rebuttal only on disputed claims → verifier/judge applies predeclared decision rule → stop after bounded rounds.**

This gives you the useful part of multi-agent deliberation—diverse initial hypotheses and adversarial checking—without paying for quadratic all-to-all debate.

---

## Why not ordinary multi-agent debate?

Naive multi-agent debate is often oversold. Early work showed that multiple LLM instances proposing and debating answers can improve mathematical, strategic, and factual reasoning, but later evaluations found that current multi-agent debate systems do **not** consistently outperform cheaper strategies such as single-agent chain-of-thought or self-consistency, especially once token cost and latency are counted. ([arXiv][1]) ([Cloudfront][2])

Worse, debate can actively degrade answers: agents may shift from correct to incorrect answers after seeing peer reasoning, favor agreement over correction, and amplify errors across rounds. ([arXiv][3])

So the goal is **not** “maximize deliberation.” The goal is **maximize independent error discovery per token**.

---

## The protocol I would use

### 1. Force independent commitments first

Each agent must answer before seeing anyone else’s answer.

Require a compact structured output:

```json
{
  "position": "...",
  "confidence": 0.0,
  "key_claims": ["claim 1", "claim 2"],
  "evidence": ["evidence item 1", "evidence item 2"],
  "assumptions": ["assumption 1"],
  "strongest_objection_to_self": "...",
  "decision_relevant_uncertainties": ["uncertainty 1"]
}
```

This prevents anchoring and information cascades. It also lets you compare agents at the claim level instead of the prose level.

Use this for all agents in parallel.

Cost: **O(n)** calls.

---

### 2. Use a mediator to build an issue map

A separate mediator/judge should not “decide” yet. It should compress the outputs into:

```json
{
  "agreed_claims": [],
  "contested_claims": [
    {
      "claim": "...",
      "supporting_agents": [],
      "opposing_agents": [],
      "evidence_for": [],
      "evidence_against": [],
      "severity": "low|medium|high",
      "resolvable_by": "calculation|source_check|experiment|judgment"
    }
  ],
  "candidate_decisions": [],
  "missing_information": []
}
```

This is the critical efficiency move. You do not send full transcripts back to all agents. You send only the claims that matter.

The classical Delphi method has the same useful structure: anonymous independent judgments, summarized feedback, revision, and termination after consensus or a preset number of rounds. RAND describes Delphi as repeated anonymous rounds with feedback showing how each panelist compares with the group, followed by revision; the process stops when consensus is reached or when the round limit is hit. ([RAND Corporation][4])

---

### 3. Run one targeted rebuttal round

Send each agent only:

```text
Here are the disputed claims relevant to your answer.
For each one:
1. keep your position,
2. revise your position,
3. identify a test/check that would resolve it,
4. or mark it as irreducibly judgmental.
Do not restate uncontested material.
```

Require:

```json
{
  "revised_position": "...",
  "changed_mind_on": [],
  "unchanged_claims": [],
  "new_evidence": [],
  "unresolved_blockers": [],
  "confidence_after_revision": 0.0
}
```

Most of the value comes from this round. More rounds often produce rhetorical convergence rather than truth improvement. A recent failure-mode study found that longer debate can degrade performance in some settings, so a bounded protocol is safer than open-ended discussion. ([arXiv][3])

Default: **one rebuttal round**.
Maximum: **two rebuttal rounds**.
After that, stop deliberating and either test, adjudicate, or preserve the minority report.

---

### 4. Use external verification before voting whenever possible

Consensus is weak evidence. Tests are stronger.

For each contested claim, classify it:

| Claim type               | Best resolver                                                    |
| ------------------------ | ---------------------------------------------------------------- |
| Mathematical             | formal derivation, symbolic check, proof assistant, calculator   |
| Code                     | unit tests, benchmarks, static analysis                          |
| Factual                  | retrieval from primary sources                                   |
| Forecast                 | base rates, prediction market, model ensemble, scenario analysis |
| Design proposal          | rubric scoring + adversarial review                              |
| Normative/value judgment | explicit preference weighting, not “truth consensus”             |

For factual or technical questions, do **not** let the agents vote on things that can be checked. Make them propose checks; the system executes the checks.

---

### 5. Apply a predeclared consensus rule

Do not let the judge improvise. Use a rule.

For a **factual binary/multiple-choice question**:

```text
Accept answer A if:
- weighted support ≥ 0.75,
- no unresolved high-severity objection remains,
- at least one independent verification path supports A,
- the best competing answer has lower weighted support by margin ≥ 0.20.
Otherwise return: no consensus + top alternatives + required check.
```

For a **design/proposal question**:

```text
Accept proposal P if:
- all critical objections are resolved or explicitly mitigated,
- median agent score ≥ 8/10 on the rubric,
- interquartile range ≤ 2 points,
- no agent provides a concrete fatal counterexample.
```

For a **ranking problem**:

Use ranked ballots from agents, then aggregate by **median rank** or **Borda count**, but preserve vetoes for hard constraints. If an option violates a non-negotiable constraint, it is eliminated even if it ranks well.

For an **open-ended research/topic deliberation**:

Do not force a single conclusion. Output:

```text
Consensus core:
- claims everyone accepts

Majority position:
- best supported answer

Minority position:
- strongest dissent

Decision-critical uncertainty:
- the one check that would most change the conclusion
```

This is often superior to fake unanimity.

---

## Efficient architecture

Use this topology:

```text
          Agent 1
          Agent 2
User →    Agent 3     → Mediator → Targeted dispute packet → Agents → Judge
          Agent 4
          Agent 5
```

Avoid this topology:

```text
Agent 1 ↔ Agent 2 ↔ Agent 3 ↔ Agent 4 ↔ Agent 5
```

The second becomes expensive fast. With `n` agents and `r` rounds, all-to-all debate tends toward **O(n²r)** communication and bloated context. A mediator design is closer to **O(nr)** plus a small number of dispute-specific calls.

This also matches modern multi-agent engineering guidance: multi-agent systems are useful for context management, specialization, and parallelization, but not every complex task needs many agents; sometimes a single well-tooled agent is enough. ([LangChain Docs][5])

---

## Recommended default configuration

For most topics:

```text
3 independent proposer agents
1 critic/verifier agent
1 mediator/judge agent
1 targeted rebuttal round
1 final adjudication
```

For high-stakes technical topics:

```text
5–7 agents total
heterogeneous models/prompts
independent first pass
2 targeted rebuttal rounds max
mandatory external verification
minority report preserved
```

For cheap exploratory brainstorming:

```text
many agents allowed in round 0
only top 3–5 distinct positions survive into deliberation
```

The best use of many agents is **diversity generation**, not full deliberation. Let 20 agents generate candidate positions if cheap; then cluster them and deliberate only the 3–5 materially different positions.

---

## Agent roles that work

Use roles that create epistemic separation, not theater.

Good roles:

```text
Proposer: produces candidate answer.
Skeptic: attacks assumptions and hidden failure modes.
Verifier: checks facts, math, code, citations, constraints.
Synthesizer: merges non-conflicting claims.
Judge: applies predeclared rubric.
```

Weak roles:

```text
Optimist
Pessimist
Devil's advocate
CEO
Philosopher
Historian
```

Those can produce stylistic diversity but often not decision-quality diversity. Better to assign agents different **evidence channels**, **methods**, or **failure modes**.

Example:

```text
Agent A: empirical evidence only
Agent B: theoretical argument only
Agent C: implementation feasibility
Agent D: adversarial failure cases
Agent E: cost/benefit and deployment constraints
```

---

## The stopping rule matters

Use this:

```text
Stop when either:
1. consensus criterion is met,
2. two rounds have passed,
3. no agent changes a decision-relevant claim,
4. remaining disagreement depends on unavailable evidence,
5. further deliberation would only restate positions.
```

Do **not** continue because “some disagreement remains.” Persistent disagreement is information. Preserve it.

---

## The judge should not be a dictator

A single judge can hallucinate too. The judge should be constrained to an evidence table:

```json
{
  "final_decision": "...",
  "supporting_claims": [],
  "rejected_claims": [
    {
      "claim": "...",
      "reason_rejected": "...",
      "evidence": "..."
    }
  ],
  "unresolved_objections": [],
  "minority_report": "...",
  "confidence": 0.0,
  "what_would_change_this_answer": "..."
}
```

The judge should decide from the issue map, not from raw agent charisma.

---

## Use weighted voting only if you have calibration data

Do not weight agents by model prestige or elo vibes. Weight by historical performance on similar tasks.

A simple weighting scheme:

```text
agent_weight = 0.5 * accuracy_on_similar_tasks
             + 0.3 * calibration_score
             + 0.2 * domain_relevance
```

Then aggregate:

```text
weighted_support(option) =
    sum(agent_weight_i * support_i(option)) / sum(agent_weight_i)
```

If you lack calibration data, use equal weights but require explicit evidence and unresolved-objection tracking.

Self-consistency is a strong cheap baseline: sample multiple reasoning paths independently and choose the most consistent answer. The original self-consistency paper reports substantial gains on arithmetic and commonsense reasoning benchmarks by sampling diverse reasoning paths and marginalizing over answers. ([arXiv][6])

So your comparison should be:

```text
single strong model
vs. self-consistency
vs. structured Delphi agents
vs. full debate
```

If structured Delphi does not beat self-consistency on your task distribution, kill it.

---

## For adversarial or unreliable agents

If the agents can be malicious, compromised, or tool-corrupted, ordinary consensus is the wrong abstraction. You need fault-tolerant quorum logic, audit logs, and independent verification. Practical Byzantine Fault Tolerance was designed for systems where faulty nodes may behave arbitrarily, though LLM-agent deliberation has correlated failure modes that PBFT-style quorums do not solve by themselves. ([USENIX][7])

For AI agents, the practical version is:

```text
- isolate initial reasoning,
- require signed/immutable first answers,
- prevent agents from editing prior commitments,
- use independent evidence retrieval,
- require quorum + no fatal verifier objection,
- log every decision and dissent.
```

A 5-agent majority is not robust if all five share the same model family, training biases, prompt contamination, or retrieved context.

---

## Minimal implementation skeleton

```python
def deliberate(topic, agents, mediator, judge, max_rounds=2):
    # Round 0: independent commitments
    first_pass = parallel([
        agent.answer_independently(topic, schema="position_claims_evidence")
        for agent in agents
    ])

    issue_map = mediator.build_issue_map(topic, first_pass)

    for _ in range(max_rounds):
        if consensus_reached(issue_map):
            break

        dispute_packet = mediator.make_dispute_packet(issue_map)

        revisions = parallel([
            agent.respond_to_disputes(dispute_packet, schema="revisions_only")
            for agent in agents
        ])

        issue_map = mediator.update_issue_map(issue_map, revisions)

    verification_results = run_available_checks(issue_map)

    return judge.apply_decision_rule(
        topic=topic,
        issue_map=issue_map,
        verification=verification_results,
        rule="weighted_support_no_fatal_objection"
    )
```

---

## Bottom line

The most efficient consensus protocol is:

```text
Blind independent answers
→ claim-level issue map
→ one targeted rebuttal round
→ external verification where possible
→ predeclared consensus rule
→ final answer with minority report if needed
```

Do not optimize for agreement. Optimize for **decision quality per token**. In your HALO-X / learned-harness context, log every deliberation trace and learn the routing, stopping, and weighting rules from held-out task performance—not from how quickly agents converge.

[1]: https://arxiv.org/abs/2305.14325 "[2305.14325] Improving Factuality and Reasoning in Language Models through Multiagent Debate"
[2]: https://d2jud02ci9yv69.cloudfront.net/2025-04-28-mad-159/blog/mad/ "Multi-LLM-Agents Debate - Performance, Efficiency, and Scaling Challenges | ICLR Blogposts 2025"
[3]: https://arxiv.org/html/2509.05396v1 "Talk Isn’t Always Cheap: Understanding Failure Modes in Multi-Agent Debate"
[4]: https://www.rand.org/pubs/commentary/2023/10/generating-evidence-using-the-delphi-method.html "Generating Evidence Using the Delphi Method | RAND"
[5]: https://docs.langchain.com/oss/python/langchain/multi-agent "Multi-agent - Docs by LangChain"
[6]: https://arxiv.org/abs/2203.11171 "[2203.11171] Self-Consistency Improves Chain of Thought Reasoning in Language Models"
[7]: https://www.usenix.org/conference/osdi-99/practical-byzantine-fault-tolerance "Practical Byzantine Fault Tolerance | USENIX"
