# Proposal: mid-flight proposal injection for the chair-free Model Council

**Status:** v0 design proposal, opinionated, written to be argued with.
**Scope:** `src/core/services/modelCouncil.ts` and the council MCP surface.
**Author voice:** Andreessen — lead with the counterargument, explicit confidence, no padding.
**Confidence on the overall design:** moderate-high. High on the failure modes the proposal closes; moderate on the round-budget sizing and on whether (e) ablation-ratify pays for its compute.

---

## 1. Counterargument first (the "obvious" approach is wrong)

The obvious move — "when a new proposal arrives mid-deliberation, append it to the prompt and let members continue from their current position" — is the **default-bad** path. It looks like an additive UX feature; it is a silent corruption of the consensus mechanism. Concretely:

- **Members do not start "from their current position + the new proposal."** They start from a context window that contains their own prior `CANDIDATE_CONSENSUS:` lines as quasi-commitments. RLHF-trained models defend their visible prior positions. The new proposal gets *absorbed into* the prior position as supporting evidence, not integrated as a peer constraint.
- **The convergence detector breaks textually before it breaks substantively.** Chair-free convergence is declared when members emit similar `CANDIDATE_CONSENSUS:` lines. An injection disrupts that similarity *mechanically* — by adding tokens that re-converging members will phrase slightly differently. The council reports blocked while there is actually substantive agreement.
- **The round budget is sized for one starting prompt.** ≤ 4 deliberation rounds is barely enough to converge on the original prompt. Injection at round 3 leaves one round to re-converge. The council fails closed.
- **Ratification turns into smuggled re-deliberation.** Ratify is supposed to be ACCEPT/BLOCK. Members will use the ratify turn to do the integration work the round budget didn't allow, producing noisy verdicts.
- **The chair-free symmetry breaks the moment an outside voice is louder than any peer.** An injection from the human operator is structurally a soft chair, even if no member is told that.

Anyone who proposes "just append the new content to the next round's prompt" has not read the closing condition.

## 2. What this proposal changes

Five primitives, none of which exist today in `runModelCouncil`. Each is independently shippable; each has a falsifiable test.

### (a) Injection as a fresh-start event with explicit position snapshots

**What.** On injection, the deliberation loop emits a `phase_break` boundary. Before the next round runs, each member is asked, in parallel and in isolation (no peer text in context), to produce a `position_snapshot`:

```jsonc
{
  "member_id": "kimi",
  "summary_of_current_position": "...",          // 60-100 words
  "load_bearing_claims": ["...", "..."],          // 1-5 bullets
  "open_disagreements_with_peers": ["..."],       // 0-5 bullets
  "would_block_if_ratified_now": true | false
}
```

The snapshot is then concatenated with the injection content into a **fresh propose round** — round counter resets, prior deliberation text is NOT in the new propose prompt (it lives in the audit log).

**Why.** Forces explicit commitment-shedding rather than implicit anchoring. The new propose round sees: (member-authored summaries of where they were) + (the new proposal text) — symmetric for all members. No member's *raw* prior `CANDIDATE_CONSENSUS:` text leaks into anyone's next-round context, which is what causes the asymmetric anchoring described in §1.

**Code touch-points.** New `deliberationPhase` field in the in-memory loop state. `askMember(...)` gains a `phase: "snapshot" | "propose" | "deliberate" | "ratify"` parameter. New helper `requestPositionSnapshot(member, history)`.

**Test that proves it.** Same starting prompt, two runs: one where injection lands at round 0 (before deliberation), one at round 3 (deep in deliberation). Verdicts on the *combined* prompt should match within a tolerance (e.g. same ACCEPT/BLOCK decision + Jaccard ≥ 0.6 on load-bearing claims in the final consensus). Today's append-and-continue design fails this test; this design must pass it.

### (b) Round budget that extends per injection, with a hard cap

**What.** Council session carries `round_budget_remaining` and `injections_remaining`. Each injection refunds `k_per_injection = 3` rounds, capped at `k_session_max = 8` rounds total across the lifetime of the session. After `injections_remaining = 0`, further injections are rejected with `INJECTION_BUDGET_EXHAUSTED`.

**Why.** A budget that does not extend will block. A budget that extends without a cap turns deliberation into a moving target — the operator keeps injecting until they like the answer, which is consensus theatre. The cap forces the operator to commit to a finite trajectory.

**Code touch-points.** Constants in `modelCouncil.ts` (currently hard-coded `MAX_ROUNDS`). Session state gains `roundBudget`, `injectionsRemaining`, `injectionLog: InjectionEvent[]`. CLI/MCP exposes `--max-injections` and reports the live counters.

**Test.** Run a session with `k_session_max = 4`; inject 3 times. Third injection must reject with the budget error, not silently degrade.

### (c) Source-tagged injection — preserves chair-free symmetry without hiding the asymmetry

**What.** Every injection carries `injected_by` metadata (`operator` | `summon:claude` | `summon:codex` | `model_council_self`) plus a `voice_weight` field (default 1.0, equal to a member voice). The injection content is presented to members verbatim, inside a labelled block:

```
--- INJECTED PROPOSAL · source: operator · weight: 1.0 ---
<verbatim injection>
--- END INJECTION ---
```

Members are explicitly instructed: rate this proposal on merit; the source label is for auditability, not for deference.

**Why.** Hiding the injection source pretends a symmetry that does not exist; members will guess and guess wrong. Surfacing the source with an explicit "merit, not deference" instruction makes the asymmetry overt and contestable. Anti-pattern this avoids: members silently capitulating because they (correctly) infer the operator wants this proposal to land.

**Code touch-points.** New `InjectionEvent` type. `buildDeliberatePrompt(...)` learns to format an injection block. The `voice_weight` field is reserved for a later non-uniform-weight extension and ignored in v1 (must equal 1.0).

**Test.** Same injection content delivered as `injected_by: operator` vs `injected_by: summon:claude`. Final verdict distribution over N=10 trials must not differ by more than a small effect size (Cliff's δ ≤ 0.15). If sources sway verdicts, the "merit, not deference" instruction has failed and the design regresses to chair-ful.

### (d) Convergence detector re-baselined on post-injection rounds only

**What.** Convergence (the all-members-emit-the-same-`CANDIDATE_CONSENSUS:` check) is computed **only** over rounds since the most recent `phase_break`. Pre-injection text does not count toward textual similarity.

**Why.** Without this, the chair-free convergence test mechanically fails any session where the injection wording diverges from the pre-injection consensus language — which is the common case, since the injection by definition introduces new framing.

**Code touch-points.** `detectConvergence(history)` becomes `detectConvergence(history, since_phase_break_at)`. Audit log records the convergence-baseline index used.

**Test.** Replay a recorded deliberation where pre-injection consensus was X and post-injection re-converged on X' (a clean evolution). The new detector must flag convergence; the old detector (full-history) must not. Confidence: **high** that current detector fails this; the fix is mechanical.

### (e) Ablation ratify — distinguishes genuine integration from theatrical compliance

**What.** After the standard ratify phase, run a second, isolated ratify with the **injection text removed** from the candidate consensus. Each member ratifies again, in fresh context. Diff the two verdicts per member:

| Standard ratify | Ablation ratify | Interpretation |
|---|---|---|
| ACCEPT | ACCEPT | Injection was decoration; consensus would hold without it. |
| ACCEPT | BLOCK | Injection is load-bearing; consensus depends on it. **This is what you want to know.** |
| BLOCK | ACCEPT | Injection broke a consensus that would otherwise have held. **Red flag.** |
| BLOCK | BLOCK | Member never agreed; injection didn't help. |

**Why.** Without this, you cannot tell whether a member who "incorporated the new proposal" actually integrated it or merely produced compliant-looking text. The seed proposal (the one this council was deliberating on, §7–§8) demands ablation as the load-bearing causal teacher; applying it to the council itself is recursive but exactly the right move.

**Code touch-points.** New `runAblationRatify(finalConsensus, injectionsToRemove)` function. Reuses the ratify prompt template with the injection block stripped. Verdict diff written to `ablation_ratify_report` in the final result.

**Test.** Synthesize a deliberation where the consensus textually depends on the injection (e.g. injection introduces a load-bearing definition). Ablation ratify must flag at least one member with ACCEPT → BLOCK. If it never does, the ablation is a no-op and the feature is dead weight.

**Cost honesty.** (e) doubles the ratify-phase API spend. For 4 members, that's 4 extra calls per injection. At ≤ 2 injections per session, ≤ 8 extra calls — acceptable. If a session uses many injections, the cost is linear; combined with (b)'s hard cap, the worst case is bounded.

---

## 3. Code surface — minimal-change implementation

```
src/core/services/modelCouncil.ts
  + InjectionEvent type
  + DeliberationPhase enum: snapshot | propose | deliberate | ratify | ablation_ratify
  + SessionState: roundBudget, injectionsRemaining, injectionLog, phaseBreaks[]
  ~ runModelCouncil(): main loop branches on phase
  + requestPositionSnapshot(member, history)
  + buildDeliberatePrompt(): renders --- INJECTED PROPOSAL --- block when present
  ~ detectConvergence(history, sincePhaseBreakAt)
  + runAblationRatify(consensus, injections)

src/core/services/council/index.ts
  + injectProposalIntoCouncil(input): updates session.activeInjection, signals loop

src/interfaces/mcp/server.ts
  + tool inject_proposal_into_council (session_id, content, source)
```

No state-schema migration is required — `CouncilSession` gains a nullable `activeInjection` field, defaulting to `null` for back-compat.

## 4. Migration sequence (3 PRs, each independently mergeable)

1. **PR-1: phase machinery + injection event type + position snapshots (a).**
   Lands the deliberation phase enum, position-snapshot requests, and `InjectionEvent`/`phase_break` plumbing. **No new MCP tool yet; no behavior change for existing sessions.** A new session-internal API is unused but instrumented.
2. **PR-2: budget, source-tagging, re-baselined convergence (b)+(c)+(d).**
   Lands the budget counters, the source-tagged injection block in deliberate prompts, and the convergence baseline reset. Together these make injection mechanically safe even without ablation. **No MCP tool yet — the council can be tested via a private debug endpoint.**
3. **PR-3: MCP `inject_proposal_into_council` + ablation ratify (e).**
   Exposes the injection tool, wires ablation ratify, ships the verdict-diff report. **First public-facing change.** Gated behind a feature flag (`AGENTS_COUNCIL_ALLOW_INJECTION=1`) so existing automation is unaffected.

Each PR ships with the test from §2 for its primitive. PRs 1–2 are pure additions; PR 3 changes the public surface.

## 5. What this proposal does NOT solve

- **It does not prevent operator manipulation through repeated injection.** The cap (`k_session_max`, `injections_remaining`) limits the count, not the content. An operator who knows what answer they want can still bias a council with one well-chosen injection. Mitigation lives outside this design (e.g. require injections to be authored *before* deliberation starts, or by a non-operator role).
- **It does not eliminate model-specific anchoring.** Position snapshots reduce textual anchoring but do not eliminate cognitive anchoring inside the model's own latent state. The ablation ratify catches the worst case (the consensus literally depends on the injection text) but does not catch subtle drift.
- **It does not address the *value* of mid-flight injection.** The implicit assumption is that injection is sometimes useful — that the operator learns something during deliberation that should change the question. If that assumption is wrong, the right move is to forbid injection entirely and force the operator to start a new session. This proposal is conservative about that question.
- **It does not solve the `voice_weight` problem.** v1 hard-pins weight to 1.0. Non-uniform weights (e.g. an injection that should weigh less because the source is unverified) are deferred.

## 6. Open questions

1. **Round budget defaults.** Is `k_per_injection = 3, k_session_max = 8` correct, or should they be tuned per use case (interactive vs. batch)? Low confidence on the exact numbers; they should be configurable.
2. **Does ablation ratify need a third arm?** A ratify with the injection text replaced by a *paraphrase* would distinguish "the injection's content is load-bearing" from "the injection's specific wording is load-bearing." Worth doing if (e) shows too many false-load-bearing flags in practice; not worth the cost otherwise.
3. **Should position snapshots be private to the snapshotting member, or visible to peers in the next round?** Current proposal says **visible** (they're inputs to the next propose round). The alternative — keep them private and let the next propose round start from the injection alone — minimizes anchoring further but risks throwing away substantive prior agreement. Defaulting to visible; revisit after PR-1 ships and we have one real run.

## 7. One-line summary

Make injection a *fresh-start event with explicit position-shedding, a hard cap, a labelled source, a re-baselined convergence test, and an ablation ratify* — anything less is consensus theatre.

---

*Companion artifacts:* `harness/55p_ideas.md` (the harness-learning seed this council was deliberating); `harness/council_results.md` (the 5-lens summon-based council); `harness/model_council_result.json` (the 4-member Model Council run that motivated this proposal).
