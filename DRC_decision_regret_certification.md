# DRC — Decision-Regret Certification

*A counterfactual-calibrated, regret-cell conformal certifier with joint risk-budget
allocation and value-of-certification scheduling. Successor / strict superset of κ-CMA v0.*

Status: design proposal. Confidence tags inline. This is the durable artifact; the
chat response carries the executive argument.

---

## 0. One-line thesis

> κ-CMA certifies that a forecast's uncertainty stays inside a region where the routing
> **decision does not change** and physical bounds hold, with marginal conformal coverage.
> DRC instead certifies that the installed action has **bounded decision-regret** versus
> the action-under-truth, calibrates coverage under the **deployment-induced** measure
> (because routing *causes* interference), and allocates a **joint risk budget** across
> simultaneously-acting agents. It reuses κ-CMA's compiler, containment checker, verified
> adapter, fail-closed gate, and artifact sink almost verbatim.

The Valiant-style abstraction DRC promotes:

> **Certified Decision-Regret under Endogenous, Policy-Induced Shift (CDR-EPIS).**
> The certified object is regret of the installed decision; the calibration measure is the
> counterfactual measure the decision itself induces; risk is a divisible resource shared
> across coupled agents.

---

## 1. Why κ-CMA needs a successor (the four gaps)

Ordered by severity. The first two are **soundness** gaps (the certificate can be wrong);
the last two are **value** gaps (the certificate is sound but rarely useful or useful in
the wrong places).

### 1.1 Endogeneity / policy-induced shift (SOUNDNESS — highest)

Conformal coverage `Pr[Y_e ∈ widened interval] ≥ 1−δ` assumes calibration and test draws
are exchangeable. In this system that assumption is structurally false:

- Calibration evidence is "on-policy" **at calibration time**, under some behavior policy.
- Activating κ-CMA installs a **different** routing policy.
- Interference `Y_e` is **caused** by routing (it is the path-loss-weighted superposition of
  who transmits at what power). So changing routing changes the very distribution of `Y_e`
  the certificate is about.
- Therefore the test measure after activation ≠ the calibration measure. The certificate's
  probability is computed under the wrong measure.

κ-CMA is *aware* of this — it forbids off-policy transfer and relegates Adaptive Conformal
Inference to "monitoring only." But "on-policy at calibration time" is not "on-policy after
activation." Block conformal fixes serial dependence, not the **causal** shift from
activation. The guarantee is weaker than advertised in exactly the regimes where forecasts
move routing.

### 1.2 Per-route certificates do not compose under additive interference (SOUNDNESS)

The certificate is per-candidate. Interference at a node is additive across all
simultaneous transmitters in range. Two routes each individually certified at δ=0.05, each
with `U_e + qσ_e ≤ I_max`, can **jointly** violate `I_max` by superposition, and the joint
failure probability is bounded only by a union bound (~Nδ), not δ. The plan lists
"joint footprint miss rate" as a *metric* but the certificate math is per-candidate. There
is no risk-budget allocation that makes the simultaneous footprint provably safe.

### 1.3 Conservatism inversion — certifies where it matters least (VALUE)

Inner-cell containment requires the *whole* forecast box to sit inside an inner
approximation of a **decision-invariant** polytope. Consequences:

- Deep in a cell interior, the decision is robust to the forecast — any forecast (or the
  legacy bundle) picks the same route. The forecast is not really "influencing" routing.
- Near a decision boundary — where the forecast genuinely determines the route — the box
  straddles a facet and κ-CMA **falls back**.

So κ-CMA most easily certifies the cases where certification adds the least decision value,
and falls back precisely where the forecast matters most. (The *safety* value is real even
in interiors; but the entire decision-cell apparatus is then orthogonal to the value it
delivers — see §3's factoring.)

### 1.4 On-policy block evidence starvation (VALUE / operability)

`min_effective_blocks = 200` of non-overlapping, on-policy, matching-(calibration,
cell, footprint, planner)-id blocks **per cell**, with no parent borrowing and no transfer
— against an arrangement with many cells — means most cells never reach 200 effective
blocks (the failure example shows `n_effective = 7`). The system spends most of its life in
fallback. This is the curse-of-dimensionality of the cell decomposition colliding with the
data-hunger of distribution-free conformal.

### 1.5 What κ-CMA gets right (keep all of it)

- **Fail-closed** discipline: never rescue what PAC-FS rejects, never mutate
  `ForecastBundle`, never emit shadow side effects.
- **Verified adapter** via interval arithmetic with rejected unsafe primitives.
- **Inner certificates only** for activation; outer approximations diagnostic only.
- **Immutable, antecedent-level artifacts** and a falsification-first replay harness.
- **Conservative subordination** to existing PAC-FS gates and staged rollout.

DRC keeps every one of these. It is a superset, not a rewrite.

---

## 2. v1-discovery-process scorecard for κ-CMA

Using the v1 rubric as a *checklist and kill-protocol*, not as a real metric (its
"Research Value" formula multiplies incommensurable subjective scores; the document itself
disclaims numerical precision). The kill-protocol's reduction/prior-art/vacuity tests are
the parts that bite.

| Factor | κ-CMA | Note |
|---|---|---|
| Importance | High | Certified predict-then-control is genuinely important. |
| Novelty | **Low–Moderate** | Reduces to explicit-MPC critical regions (parametric programming) + conformal coverage + interval-bound verification + block conformal. Each piece is known. |
| Generativity | Moderate | Generates an engineering agenda, not many new questions. |
| Tractability | High | Very concretely implementable. |
| Verifiability | High | Its entire purpose; fails closed. |
| Bridge power | Moderate–High | Real bridge model between forecasting and routing. |
| Crowdedness | Moderate | Conformal-for-decisions is a hot area. |
| Fragility | **High** | Guarantee fragile to exchangeability/policy shift; activation rate fragile to cell granularity. |
| Vagueness | Low | Precise. |

**Reduction-test verdict:** κ-CMA is a careful, defensible *engineering synthesis* of
known certified-prediction primitives — not a field-generating abstraction by its own
stated standard ("find a concept that changes what questions can be asked"). The
"arrangement cell where the planner decision is constant" is the **critical region of a
parametric program / explicit MPC**; the conformal layer is standard split/block conformal.
That is fine for shipping. It is not "significantly higher / novel."

---

## 3. The core reframe: factor the monolithic certificate into three provable parts

κ-CMA's single certificate tangles three different claims. DRC factors them so each is
proved independently and on its own correct measure ("name and compress / factor" — a
Valiant move):

1. **Decision certificate** — the installed action is ε-optimal (bounded regret) given the
   forecast uncertainty. *Governed by regret-cells (§4).*
2. **Safety certificate** — physical bounds (interference upper, energy lower, freshness)
   hold over the joint footprint of all simultaneous actions. *Governed by joint
   risk-budget allocation (§6).*
3. **Validity certificate** — the conformal coverage is computed under the measure that
   activation induces. *Governed by counterfactual calibration (§5).*

This factoring is itself an improvement: κ-CMA's decision-cell containment is mostly
orthogonal to the safety value it delivers, yet they are welded together. Decoupling lets
each be relaxed or strengthened independently and certifies more, more honestly.

---

## 4. Regret-cells (fixes 1.3 conservatism inversion; reuses the compiler)

### 4.1 Definition

Let `x` = true interference state, `x̂` = forecast point, `a(·)` = planner decision map,
`cost(a, x)` = realized cost of action `a` at true state `x`. Define

```
regret(x, x̂) = cost(a(x̂), x) − min_a cost(a, x)
```

Certify the forecast uncertainty box `U_x` against the **ε-regret region**

```
R_ε(x̂) = { x : regret(x, x̂) ≤ ε }
```

instead of the decision-invariant cell `C_j = { x : a(x) = a(x̂) }`.

### 4.2 Why this is the right object

- `R_ε ⊇ C_j` (regret is 0 inside `C_j`), so DRC certifies **at least as often**.
- It certifies **bounded suboptimality**, which is the actual operational guarantee anyone
  wants — not "the route is byte-identical to the route-under-truth."
- **It inverts κ-CMA's pathology.** Near a decision boundary the two competing actions have
  nearly equal cost, so crossing the boundary incurs *small* regret → `R_ε` is *large*
  there → DRC certifies easily exactly where κ-CMA fell back. Where κ-CMA was best (deep
  interior) DRC is equally good. Strict improvement in certification rate and in meaning.

### 4.3 The geometry is the same machinery, relaxed by ε  (high confidence)

For the affine-score planners on κ-CMA's own whitelist
(`score_language: affine_plus_interval_safe`): the planner minimizes affine-in-`x` scores,
so `cost(a, x)` is affine in `x` for fixed `a`, and `min_a cost(a, x)` is concave
piecewise-affine. Then

```
R_ε(x̂) = ⋂_k { x : cost(a(x̂), x) − cost(a_k, x) ≤ ε }
       = ⋂_k { x : a_kᵀ-difference · x ≤ b_k + ε }
```

is a **polytope** — exactly κ-CMA's exact critical region with **every facet bound relaxed
from `b` to `b + ε`**. Concretely, the compiler change is:

```python
# κ-CMA:  b_inner  = b - decision.compiler_tolerance
# DRC:    b_regret = b - decision.compiler_tolerance + eps_regret
```

The containment check (`interval_linear_max` per facet) is **unchanged**. The decision
margin is now interpreted as *regret slack*, in cost units, which is far more meaningful
than geometric facet slack.

For interval-verifiable nonlinear planners, the same branch-proof machinery applies to the
relaxed inequalities. For learned / nonconvex planners, regret regions are as hard as
decision cells: `κ = ∞`, fail closed — **same scope restriction as κ-CMA**, no regression.

### 4.4 ε is a tunable, auditable knob

`eps_regret` is a per-family operational tolerance (e.g., max acceptable cost suboptimality
in the planner's own units). `eps_regret → 0` recovers κ-CMA's decision-invariant cell, so
DRC v0 can ship with `eps_regret = 0` and be **bit-identical to κ-CMA**, then widen under
replay control. This gives a zero-risk migration path.

---

## 5. Counterfactual calibration (fixes 1.1 endogeneity — the deep move)

### 5.1 The available structure κ-CMA discards

κ-CMA treats `Y_e` (realized interference) as exogenous truth. It is not: interference is a
**known physical function** of the joint transmit decisions — superposition of
path-loss-weighted transmit powers. The system *knows the causal map from actions to
interference* even when the *forecast of the exogenous component* is uncertain.

That known map converts an off-policy problem into a **known-shift** problem, for which
**weighted conformal prediction** (Tibshirani et al., 2019) gives valid coverage, and for
which a **model-based counterfactual residual** is directly computable.

### 5.2 Two compatible mechanisms

1. **Weighted conformal under known policy shift.** The deployment policy is DRC's own
   routing map — known. Reweight calibration residuals by the likelihood ratio between the
   behavior policy (logged) and the target (deployment) policy over the action distribution.
   Coverage is restored under the target measure when weights are correct.

2. **Counterfactual residuals via the physics map.** Decompose `Y_e = g(a; ξ_e)` where `a`
   is the (known, candidate) joint action and `ξ_e` is the exogenous channel/external-
   interference component. Calibrate residuals of the **forecast of `ξ_e`** (exogenous,
   plausibly exchangeable) and **propagate through the known `g` under the candidate action
   `a`** to get the predictive interval for `Y_e` *under the action about to be installed*.
   This is on-policy by construction because `a` is the deployed action.

Mechanism 2 is preferred where the physics map is trustworthy: it sidesteps importance-
weight variance entirely and reuses the verified-adapter interval machinery to propagate
`ξ_e` intervals through `g`.

### 5.3 The new risk it introduces, and how to bound it (must flag)

Counterfactual calibration is only as sound as the action→interference model `g`. We have
**traded an exchangeability assumption for a physics-fidelity assumption.** Mitigations,
all reusing existing machinery:

- Bound `g`'s model error and propagate it as an interval through the verified adapter
  (interval arithmetic already exists in κ-CMA).
- Add a **conformal sensitivity / partial-identification** band (Γ-style robustness to a
  bounded unmeasured-confounding / model-error budget). The certificate then reads
  "coverage ≥ 1−δ provided model error ≤ Γ," with Γ itself auditable in the artifact.
- Keep ACI as an **active widening controller** (not κ-CMA's "monitor only"): an online
  correction term on `q` with a proven worst-case long-run coverage floor, which absorbs
  residual misspecification at the cost of wider intervals.

This is the honest version of the guarantee. It is *stronger* than κ-CMA's because it names
the shift and either corrects it or bounds the residual, rather than assuming it away.

---

## 6. Joint risk-budget allocation (fixes 1.2 composition)

Replace per-candidate δ with a **divisible joint failure budget** `δ_joint` over the set of
simultaneously-certified routes whose footprints overlap.

- **Additive-interference aggregate certificate.** For overlapping footprints, certify the
  **sum** `Σ_routes (U_e + q σ_e) ≤ I_max(e)` at each shared node `e`, using either a
  conformal region on the aggregate residual or a Bonferroni allocation `Σ_i δ_i ≤ δ_joint`
  with an explicit superposition margin. Per-route intervals being individually covered is
  *insufficient*; the aggregate is what must clear `I_max`.
- **Certification budget becomes a resource (mechanism-design layer).** Allocate `δ_i` and
  conformal evidence across competing routes to maximize total certified decision-value
  subject to `Σ δ_i ≤ δ_joint` and the superposition constraints. This opens a real
  research agenda (optimal allocation, "price of certification," fairness across nodes).
- **Distributed cost is explicit (BSP tie-in).** In a decentralized deployment, joint
  certification needs a coordination step — a synchronization barrier where overlapping
  actors reconcile budgets before install. This is precisely a BSP-style superstep; the
  communication/synchronization cost is a first-class resource in the model, not hidden.

---

## 7. Value-of-Certification scheduling (fixes 1.4 evidence starvation)

Stop trying to accumulate 200 blocks for every cell. Treat on-policy conformal evidence and
certification compute as scarce and allocate by **expected value of certification**:

```
VoC(cell) = Pr[certify | evidence] × (regret_legacy − regret_certified) × traffic_weight
```

- Concentrate evidence collection and gate compute on high-VoC regret-regions.
- Low-VoC regions stay in fallback permanently **by design** — fallback there costs little
  regret, so starvation is not a defect, it is the correct allocation.
- This is the educability "agenda mechanism" applied to evidence: rank actions
  (here: where to spend calibration) by expected payoff, exactly as AM ranked tasks.

---

## 8. Why DRC scores higher on the v1 rubric

| Factor | κ-CMA | DRC | Reason for lift |
|---|---|---|---|
| Novelty | Low–Mod | **High** | Regret-cells under conformal + *counterfactual* calibration of an *endogenous* outcome + risk-budget mechanism is not a standard combination. |
| Generativity | Mod | **High** | New questions: which task classes admit poly-evidence bounded-regret certification under endogeneity? lower bounds? optimal δ-allocation? price of certification? |
| Verifiability | High | High | Each of the three factored certificates is independently falsifiable; Γ and ε are auditable. |
| Bridge power | Mod–High | **High** | Bridges forecasting, decision theory, causal inference, conformal, and mechanism design with one protocol. |
| Fragility | High | **Lower** | Names and bounds the shift instead of assuming exchangeability; ε-relaxation removes the boundary brittleness. |
| Tractability | High | Moderate | More moving parts; mitigated by reusing κ-CMA's compiler/containment/adapter and the `eps=0`, `Γ=0` exact-κ-CMA fallback. |

The promoted hidden resource sharpens from κ-CMA's "verification budget / on-policy
evidence" to **"certified regret budget + joint risk budget + value-of-certification."**
That is the field-generating object κ-CMA gestures at but does not name.

---

## 9. What would make κ-CMA the right call instead (falsifiers)

DRC's added machinery is only justified if its target gaps are real in this deployment.
Ship κ-CMA v0 unchanged and skip DRC if replay shows:

- **Interference is exogenously dominated** (own routing contributes negligibly vs external
  sources) → endogeneity critique evaporates → exogenous-truth calibration is fine.
- **Forecasts almost always sit deep in cell interiors** → conservatism-inversion critique
  evaporates → `eps_regret = 0` loses nothing.
- **Footprints essentially never overlap / single-route-at-a-time** → composition critique
  evaporates → per-route δ is already a joint guarantee.
- **The physics map `g` cannot be trusted even with Γ-robustness** → counterfactual
  calibration is unsound and weighted conformal weights are too high-variance → fall back
  to κ-CMA's assume-exchangeable posture as the lesser evil, and rely on ACI monitoring.

Measure these four in shadow mode **before** building DRC. They are cheap to instrument and
they decide whether DRC is worth its complexity.

---

## 10. Recommended path (κ-CMA as floor, DRC layered)

Novelty is a *liability* in a safety-critical certifier; introduce it only where it closes a
named soundness or value gap. Therefore:

1. **Ship κ-CMA v0 exactly as specified** as the conservative floor and shadow harness.
   It is correct within its assumptions and its fail-closed discipline is excellent.
2. **Instrument the four falsifiers (§9) in shadow mode.** Decide empirically whether each
   DRC component is warranted.
3. **Layer DRC incrementally, each step a strict superset that defaults to κ-CMA:**
   - 3a. **Regret-cells** with `eps_regret = 0` (bit-identical), then widen ε under replay.
     One-line compiler change; reuses containment. Highest value/effort ratio.
   - 3b. **Counterfactual calibration** via the physics map with Γ-robustness; promote ACI
     from monitor to active widening controller with a coverage floor.
   - 3c. **Joint risk-budget** certificate for overlapping footprints.
   - 3d. **VoC scheduling** for evidence allocation.
4. Each step passes the **same replay falsification harness** with the same pass criteria
   (`physical_safety_violation_rate ≤ κ-CMA`, `joint_footprint_miss_rate ≤ κ-CMA`,
   availability floor, latency budget) **plus** two new ones:
   `certified_route_fraction ≥ κ-CMA` (does it certify more?) and
   `mean_decision_regret ≤ κ-CMA` (is the extra certification actually good?).

---

## 11. Bottom line

```
DRC = κ-CMA
    + regret-cells            (relax decision-invariance to bounded regret; reuses compiler)
    + counterfactual calib    (calibrate under the measure activation induces; physics map + Γ)
    + joint risk-budget       (composable safety across overlapping footprints)
    + value-of-certification  (allocate scarce evidence by decision payoff)
```

It is a **strict, fail-closed superset** of κ-CMA that fixes two soundness gaps
(endogeneity, composition) and two value gaps (conservatism inversion, evidence
starvation), promotes a sharper hidden resource (certified regret budget), and — crucially
— defaults exactly to κ-CMA when its new knobs are zeroed, so migration carries no safety
risk.

The one-line engineering rule:

> If the system cannot prove the installed action's **regret** stays bounded under the
> forecast uncertainty, **and** cannot prove **joint** footprint safety under the measure
> activation **induces**, it falls back to legacy.
