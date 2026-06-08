# IP_HOPE_TIER_PROPOSALS.md vs v6 ArXiv Tier Changes

Date: 2026-05-28

Compared files:

- Older proposal: `/home/dstefanescu/other_systems/o4/novelty/versions/arxiv-analogy-search/vmaster_full_stack/IP_HOPE_TIER_PROPOSALS.md`
- v6 proposal: `/home/dstefanescu/other_systems/o4/agents-council/harness/ip_hope_tier_changes_from_v6_arxiv_discovery.md`

## Executive Judgment

The older `IP_HOPE_TIER_PROPOSALS.md` is a sharper **feature-transplant roadmap**. It names concrete deficiencies in the existing IP-HOPE tiers and proposes targeted paper-derived fixes: spatial regime GNNs, forecast-conditional FamilySelector, arbitrary-fading outage margins, POMDP belief updates, Pareto/Ising scheduling, and queue/battery reservation.

The v6 file is a stronger **evidence-governance roadmap**. It is less interested in importing a paper mechanism directly and more interested in preventing unsafe or unauditable imports. Its central contribution is the **Evidence-Carrying Route Kernel (ECRK)**: every route, schedule, observation, tactical deviation, federated handoff, and RF action carries provenance, risk, physical feasibility, ancestor coverage, proof obligations, shield contracts, and realization traces.

Best synthesis:

- Use the older file for **concrete candidate mechanisms worth testing**.
- Use the v6 file for **the authority boundary, evidence object, falsifiers, and implementation discipline**.
- Do not implement the older file directly without v6 gates. Several of its "direct application" labels are too permissive and would let learned systems or analytic formulas replace certification/HIL evidence too easily.

## Structural Comparison

| Dimension | Older proposal | v6 proposal | Assessment |
|---|---|---|---|
| Tier coverage | 16 tiers, 2.9 through 8 | 16 tiers, 2.9 through 8.0 | Both complete. |
| Source set | 10 arXiv IDs from `hope_run`, 9 promoted + 1 held | 19 linked arXiv papers | v6 has broader and more auditable source coverage. |
| Source links | No URLs in file | 19 arXiv URLs | v6 is easier to audit. |
| Proposal style | Numbered concrete transplants per tier | Tables with direct/analogous labels and validation gates | Older is more operationally specific per gap; v6 is more systematic. |
| Central abstraction | None; tier-specific upgrades | ECRK | v6 has a unifying implementation primitive. |
| Direct/analogous discipline | Uses labels, but several "direct" labels are overstated | Defines label rule explicitly | v6 is stricter and more defensible. |
| Safety model | Mentions risks/tradeoffs, but weak authority boundary | Proposal-authority split, shields, ECRK, falsifiers | v6 is much safer. |
| Anti-evidence | Limited, mostly "honest disclosures" | Whittle indexability, shield expressivity, tail risk, HIL residual, physical replay | v6 is stronger. |
| Highest-leverage ranking | Yes, ranked 1-7 | Yes, implementation order + falsifiers | Older ranking is clearer on immediate gap closure; v6 ranking is safer. |

## Main Difference

The older file asks:

> Which paper mechanism can we transplant into each tier to close a visible gap?

The v6 file asks:

> What evidence object and gates make any such transplant auditable, falsifiable, and safe across tiers?

That difference matters. The older file can generate faster ideas. The v6 file is less likely to generate a system that looks better in simulation because it silently changed authority, omitted ancestors, or trusted the wrong state reports.

## Where the Older Proposal Is Stronger

The older file has several concrete, high-value ideas that v6 should not ignore.

| Older proposal | Tier | Why it is valuable | v6 treatment needed |
|---|---|---|---|
| Spatial regime classifier via GNN | 2.9 | Adds a missing spatial/clustered geometry axis to the regime spectrum. | Keep as learned proposal/regime feature, but classify as **Analogous use**, not direct authority. Must carry ECRK influence and OOD/tail-risk fields. |
| Forecast-conditional FamilySelector | 2.9 | Directly targets the WU-11 Mode-A structural-zero problem: if selector is forecast-independent, channel-information value is structurally zero. | Keep. Add ECRK-lite proof/risk/ancestor record and physical/nonlinear replay fields. |
| Arbitrary-fading shape parameter in PIPE | 3 | Restores analytical fading structure that a pure quantile model can hide. | Keep as a model-enrichment candidate, but do not let analytic outage replace conformal/HIL evidence. |
| POMDP belief update | 4.3 | Matches Tier 4.3's belief-aware purpose closely. | Keep. Combine with robust report aggregation and tail-risk observation triggers. |
| Pareto-frontier / Ising replacement for weighted-sum scheduling | 5.0 | Attacks a real weakness: multi-objective scheduling should not collapse too early to a scalar. | Keep as an optional candidate generator or solver track; require physical-SINR replay, ECRK schedule certificate, and baseline preservation. |
| Joint queue/battery reservation | 5.0 | Directly addresses finite battery + scheduling coupling. | Keep. Integrate into v6 resource claims. |

The older file is especially good at identifying **local implementation gaps** in the current stack. v6 is better at deciding which of those ideas are allowed to execute.

## Where v6 Is Stronger

The v6 file fixes weaknesses in the older proposal.

| v6 improvement | Why it matters |
|---|---|
| ECRK | The older file spreads evidence fields across tiers. ECRK gives one cross-tier object that can be checked, replayed, inherited, and invalidated. |
| Proposal-authority split | The older file often treats GNN/DRL outputs as direct replacements. v6 correctly treats learned models as proposal sources only. |
| Nonlinear RF harvester gate | The older file uses SWIPT/outage papers but does not center sensitivity/saturation nonlinear EH. v6 directly addresses the physical RF harvesting failure mode. |
| Physical-SINR schedule replay | The older file talks about routing/scheduling optimization but lacks a strong physical-interference feasibility gate. v6 adds it. |
| Robust malicious/stale report handling | The older file has trust continuity but no strong adversarial calibration mechanism. v6 adds Byzantine-robust conformal calibration. |
| Tail-risk conformal certificates | The older file leans toward closed-form analytic margins. v6 treats risk evidence as calibrated and tail-sensitive. |
| Runtime shields | The older file lacks a strong runtime enforcement layer. v6 adds shield synthesis and LTL modulo theories shielding. |
| Minimal falsifiers | v6 makes every major proposal killable by cheap tests. Older proposal has risks but weaker falsifier structure. |

## Critical Disagreements

### 1. The older file over-labels several ideas as "Direct application"

Examples:

- GNN routing policy -> Tier 2.9 spatial regime classifier.
- GNN route policy -> Tier 4 band-selection policy.
- GNN edge-prediction -> Tier 6.5 cluster membership.
- DRL anti-jamming action selection -> Tier 4.6 probe scorer.
- Underlay throughput cap -> Tier 7 gateway trust prior.

These are useful transfers, but they are not direct applications under the older file's own definition. They repurpose mechanisms into different authority surfaces. v6 is stricter: these should be **Analogous use** and gated as proposals or evidence, not execution authority.

### 2. The older file is too willing to replace empirical/HIL evidence with analytic formulas

The most problematic case is Tier 4.5:

> "Closed-form variance bounds replace HIL empirical budgeting."

That is backwards for deployment. Analytic bounds can supplement HIL, but they should not replace hardware evidence in a system whose core limitation is nonlinear RF hardware realism. v6's position is stronger: use nonlinear harvester profiles, HIL winner-flip reports, twin residuals, and measured residual gates.

### 3. The older file uses learned models as if they can become tier mechanisms directly

The older file proposes direct GNN/DRL replacements in several tiers. That is risky. In IP-HOPE, learned models should not authorize routes, schedules, clusters, probes, or RF actions. They should propose, rank, or compress candidate sets. ECRK, proofs, shields, ancestor coverage, and physical replay decide execution.

### 4. The older file's "L4 is completely uncovered" claim is too strong

The older file says clustered interferer geometry / L4 is "the only completely-uncovered HOPE limitation." That is directionally useful but overstated. The prior tier assessment found L4 is addressed methodologically in several tiers through evaluation breadth, hidden-path benchmarks, candidate/realized traces, and schedule cubes. The more precise claim is:

> Spatially clustered interferer geometry is still under-modeled as a first-class regime axis.

That narrower claim is strong and should be kept.

### 5. v6 underplays a few concrete old mechanisms

v6 is safer, but it can be too governance-heavy. It should import the older file's best concrete mechanisms into the ECRK framework:

- spatial regime axis;
- forecast-conditional selector;
- fading-shape parameter;
- POMDP belief update;
- Pareto/Ising multi-objective scheduling;
- joint queue/battery reservation.

## Tier-by-Tier Comparison

| Tier | Older file emphasis | v6 emphasis | Best synthesis |
|---|---|---|---|
| 2.9 | Spatial GNN regime classifier, forecast-conditional selector, analytic CDM outage margin, harvest moment bounds. | ECRK-lite, tail-risk forecast bundle, nonlinear EH profile, physical replay, ancestor coverage. | Keep forecast-conditional selector and spatial regime axis, but require ECRK-lite, nonlinear profile, physical replay, and tail-risk fields. |
| 3 | Quantile forecaster gains fading shape, hierarchical outage, POMDP belief state. | RouteToken ECRK, tail-calibrated prediction, Byzantine/stale report trust, control traffic, physical precheck. | Add fading-shape output only as an evidence channel; combine with robust trust and ECRK RouteToken fields. |
| 4.0 | TERG slot allocation exploits jammer windows; GNN route+band selection. | Profile-indexed TERG weights, SINR pruning, ECRK provenance, learned expansion only, winner-flip replay. | Use jammer-window and band-policy ideas as candidate generators; execution requires nonlinear/SINR/ECRK gates. |
| 4.1 | Vector RouteFold weights via Ising projection. | RouteFold as distributional candidate source, delayed/asynchronous graph features, ECRK influence ledger, shielded prior. | Keep vector/Pareto RouteFold representation, but treat RouteFold as proposal distribution with influence audit. |
| 4.2 | Pareto-IVP audit by multi-objective slices. | ECRK for execution structures, resource obligations, physical replay, goal-oriented continuations, nonlinear energy vector. | Use Pareto-IVP as audit metric inside ECRK realization and negative-evidence reports. |
| 4.3 | Direct POMDP belief update and LSTM latent belief ablation. | Risk certificate, robust report aggregation, violation-reduction observation value, AoII correction, fail-closed shield. | Keep explicit POMDP belief update; treat LSTM latent as shadow ablation only. Add robust/tail-risk/shield gates. |
| 4.4 | Runtime cert gains closed-form outage upper bound. | First full ECRK schema, runtime shield, seeded-failure ledger, risk plugin, ancestor mandatory, physics hooks. | Use analytic outage as one ECRK risk/proof field, not as certificate replacement. Tier 4.4 should own ECRK. |
| 4.5 | Parametric variance bounds for HIL budgeting; optional IRS pairing from held candidate. | Nonlinear profile registry, HIL winner-flip, measurement-coupled DT, channel residual, waveform/action field. | Reject "replace HIL." Use analytic bounds as prior evidence; HIL/twin residual and nonlinear winner-flip are mandatory. |
| 4.6 | DRL Q-value probe scoring; POMDP VoI. | Observation ECRK, violation-reduction VOI, AoII/RMAB ranking, indexability status, control-traffic reservation, tail-risk trigger. | Keep POMDP VoI; demote DRL Q-value to proposal scorer. Require ECRK, indexability label, and control-traffic accounting. |
| 4.7 | GNN route embedding as prior. | Distributional sampler, delayed/asynchronous inputs, topology transfer test, ECRK influence ledger, shielded prior, OOD demotion. | Keep GNN prior but only as distributional sampler. Add ECRK influence and ancestor suppression audit. |
| 5.0 | Pareto/Ising replaces weighted-sum; joint queue/battery reservation. | ECRK schedule certificate, physical-SINR replay, nonlinear energy feasibility, AoII/freshness, Whittle indexability, goal utility, control traffic. | Strongest combination: Pareto/Ising or other Pareto solver produces candidates; v6 gates them through SINR, nonlinear EH, ECRK, and control traffic. |
| 5.5 | Safe-exploration epsilon schedule; underlay throughput cap as explore reward ceiling. | Probe ECRK, AoII probe selection, indexability label, robust aggregation, risk certificate, airtime reservation. | Keep safe-exploration schedule only if it becomes a bounded proposal policy. Use AoII, trust, and airtime gates. |
| 6.0 | GSC selection inside tactical envelope; closed-form CI for envelope width. | Tactical-envelope ECRK, runtime tactical shield, tail-risk budget, learned local proposal only, control traffic, local physical feasibility. | Use GSC/analytic CI as envelope evidence, not envelope authority. ECRK and shield are mandatory. |
| 6.5 | GNN cluster assignment. | Cluster ECRK, localized physical scheduling, cluster intent traffic, robust trust, learned sampler, AoII micro-probes. | Keep GNN cluster assignment as candidate proposal; localized physical scheduling and cluster ECRK decide. |
| 7.0 | Multi-POMDP belief merge; underlay throughput cap as trust prior. | Federated ECRK context exchange, Byzantine calibration, degraded tail-risk gate, handoff traffic, twin residual, source-specific demotion. | Keep belief merge. Treat throughput cap as weak evidence, not trust prior by itself. Robust calibration is more important. |
| 8.0 | Safety as hard-constraint Pareto dimension. | RF-action ECRK, nonlinear RF-action profile, waveform/action class, hybrid relay primitive, whole-stack shield, HIL/twin residual, learned proposals only, physical multi-effect replay. | Keep hard-constraint Pareto framing, but Tier 8 should be last and require RF-action ECRK plus nonlinear/HIL/SINR/shield gates. |

## Paper-Set Comparison

### Older file's paper set

The older file uses these IDs:

- `2512.08351v1` anti-jamming DRL;
- `2511.20241v1` POMDP DTN routing;
- `2510.11109v1` GNN multicast routing;
- `2503.07924v1` multi-objective Ising routing;
- `2311.09932v1` GSC energy harvesting;
- `2206.06767v2` SWIPT arbitrary fading;
- `2603.19214v1` NOMA hierarchical outage;
- `2203.11313v1` EH-aware multi-hop MARL routing;
- `1703.02742v1` underlay multi-hop throughput;
- `2210.16521v1` IRS-assisted RF-powered IoT, held candidate.

This set is closer to **wireless-routing mechanism transplant**.

### v6 paper set

v6 uses 19 linked papers, including:

- nonlinear RF EH and nonlinear WPT waveform papers;
- AoII/RMAB and Whittle indexability papers;
- graph diffusion and Agg-GNN wireless allocation papers;
- conformal risk and tail-risk conformal training;
- Byzantine-robust federated conformal prediction;
- proof-carrying plans;
- shield synthesis and LTL modulo theories shielding;
- RIoT and MART-6G digital twin papers;
- goal-oriented WNCS;
- physical-interference scheduling;
- wireless-powered hybrid relays.

This set is closer to **evidence, safety, physical realism, and governance**.

## Keep / Modify / Drop

### Keep from older file

- Forecast-conditional FamilySelector.
- Spatial regime axis, but not direct learned authority.
- Fading-shape enrichment for quantile forecaster.
- POMDP belief update for Tier 4.3.
- Pareto-frontier scheduling, with or without Ising.
- Joint queue/battery reservation.
- Pareto-IVP audit idea.

### Modify from older file

- Re-label several "direct" GNN/DRL imports as analogous proposal mechanisms.
- Replace "closed-form analytic bound replaces empirical/HIL" with "closed-form analytic bound becomes one ECRK evidence field."
- Treat GNN and DRL outputs as candidate distributions or scorers, not route/schedule/probe authority.
- Treat throughput caps as feasibility/risk fields, not trust priors by themselves.

### Drop or defer from older file

- IRS band-pairing unless IP-HOPE explicitly adds IRS hardware.
- GNN cluster assignment as direct Tier 6.5 replacement.
- DRL Q-value as direct Tier 4.6 probe-action replacement.
- HIL replacement by parametric variance bounds.

### Keep from v6

- ECRK as cross-tier implementation primitive.
- Proposal-authority split.
- Ancestor coverage / omission-regret.
- Nonlinear RF harvester profile and winner-flip gates.
- Physical-SINR replay.
- Robust report aggregation.
- Tail-risk certificates.
- Runtime shields and LTL modulo theories shield vocabulary.
- Minimal falsifiers.

## Recommended Merged Roadmap

1. **Tier 4.4: implement ECRK schema and replay validator.** This gives a place to safely absorb both proposal sets.
2. **Tier 2.9: add forecast-conditional selector plus ECRK-lite.** This combines the older file's best structural bug fix with v6 evidence discipline.
3. **Tier 5.0: add Pareto candidate generation plus physical-SINR/ECRK schedule gates.** Do not replace weighted-sum with an ungated Ising solver; make Pareto/Ising produce candidates.
4. **Tier 4.5: add nonlinear harvester registry and HIL winner-flip replay.** Do not replace HIL with analytic bounds.
5. **Tier 4.3/4.6: add POMDP/VOI/AoII observation logic with trust and tail-risk gates.**
6. **Tier 4.7/6.5: add GNN/diffusion candidate samplers only in shadow/proposal mode.**
7. **Tier 8: defer RF-cooperative actions until ECRK, HIL/nonlinear, physical replay, and shields exist.**

## Final Verdict

The older proposal is more inventive at the individual-tier mechanism level. v6 is more correct at the system-safety and evidence level.

The merged position should be:

> Take the older file's best concrete mechanisms, strip them of execution authority, and pass them through v6's ECRK/proof/shield/physical-replay/HIL gates.

That gives the highest upside without accepting the older file's main risk: treating attractive paper mechanisms as if they were already safe IP-HOPE tier components.

