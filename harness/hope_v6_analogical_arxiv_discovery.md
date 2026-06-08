# HOPE / IP-HOPE - v6 Analogical ArXiv Discovery

Date: 2026-05-28  
Skill used: `/home/dstefanescu/.codex/skills/analogical-arxiv-scout-v6`  
Mode: `constitutional`  
Target: find arXiv papers with mechanisms applicable by direct transfer or analogy to lifting HOPE/IP-HOPE limitations, then compare against previous attempts.

## Executive Verdict

v6 changes the answer. The strongest direction is not "add more RL routing papers" and not "make Tier 8 more ambitious." The strongest direction is to make every route, schedule, observation, tactical deviation, and RF-cooperative action carry its own auditable evidence object.

Promoted artifact: **Evidence-Carrying Route Kernel (ECRK)**.

ECRK is a smaller, more implementation-ready successor to v5's **Proof-Carrying Freshness-Energy Routes (PC-FER)**. PC-FER was directionally right but too broad. ECRK is the cross-tier primitive that PC-FER should compile into:

- candidate provenance;
- ancestor-baseline coverage;
- state freshness and trust evidence;
- nonlinear harvester and channel/twin profile;
- queue, battery, airtime, and synchronization budget;
- goal/freshness/risk objective;
- proof-carrying pre/postconditions;
- shield contract;
- realization trace;
- seeded falsifier hooks.

This lets HOPE/IP-HOPE absorb the best papers without violating its core safety invariant: learned systems may propose, rank, or bias candidates, but they must not authorize execution without certificates, shields, and ancestor-baseline preservation.

## Target X-Ray

### Baseline limitations

The HOPE review identified:

| ID | Limitation | Abstract form |
|---|---|---|
| L1 | Static or known interference / energy state | hidden oracle, stale state, partial observability |
| L2 | No mobility, bursty jammers, time-varying channels, adaptive adversaries | nonstationary and adversarial environment |
| L3 | No finite-battery, queues, duty cycling, traffic scheduling, or long-horizon energy policy | constrained temporal control |
| L4 | Stylized simulation and narrow baselines | evaluation monoculture |
| L5 | No hardware measurements or nonlinear RF harvesting curves | physics/model mismatch |
| L6 | No MAC contention, synchronization cost, or control-plane airtime | coordination cost omitted |
| L7 | State acquisition and distribution cost not modeled | observation/control coupling |

The inspected IP-HOPE tiers already address these architecturally:

- Tier 2.9: certified protocol families, forecast bundles, stale CQI, realized traces.
- Tiers 4.0-4.4: lifted TERG search, projection, certificates, invalidation, ledgers.
- Tiers 4.3-4.6: belief bundles, observation menus, value of information, fail-closed actions.
- Tiers 5.0-5.5: multi-flow scheduling, conflict, fairness, local evidence probes.
- Tiers 6.0-6.5: bounded node and cluster tactical envelopes.
- Tier 7.0: federated / degraded multi-gateway continuity.
- Tier 8.0: RF-cooperative hypergraph and whole-stack policy.

Remaining weak points after the tier assessment:

1. hardware/nonlinear RF proof is still thin;
2. real MAC behavior remains partly abstract;
3. adaptive adversaries are mostly stress overlays;
4. mobility/topology churn is not a measured first-class field condition;
5. stack complexity can hide selection bias unless ancestor baselines are preserved.

### Transfer slots

| Slot | Needed mechanism |
|---|---|
| model | nonlinear harvester, channel twin, stochastic/partial-observation state |
| metric | freshness, goal utility, tail risk, violation probability, omission regret |
| controller | bounded observation, tactical envelopes, learned candidate proposal |
| certificate | proof-carrying pre/postconditions, conformal risk, shield contracts |
| simulator | HIL-calibrated digital twin, physical interference scheduling replay |
| protocol | state-report trust, control-plane airtime, explicit M2M/intention traffic |
| hardware | measured harvester curves, RF-action power/sensitivity/saturation profiles |
| governance | ancestor coverage, anti-Goodhart checks, seeded falsifiers |

## Abstraction Map

| HOPE/IP-HOPE gap | Abstract form | v6 transfer operator |
|---|---|---|
| Known interference map | hidden oracle / stale state | distributionalize + certify |
| Linear RF energy | nonlinear response / threshold / saturation | nonlinearize + hardware-gate |
| Latency-only route quality | freshness / correctness / goal utility | temporalize + goal-align |
| Route choice as one decision | finite battery / queues / RMAB scheduling | resource-bound + decompose |
| TERG and RouteFold learned priors | learned proposal vs execution authority | split-authority |
| Multi-flow conflicts | physical SINR, not only graph conflict | physicalize contention |
| Observation as free state | communication-for-control action | observation-control coupling |
| Digital-twin optimism | simulator-to-hardware residual | bridge-to-physical |
| New tiers beating old tiers | hidden baseline omission | omission-regret |

## Search Plan and Query Ledger

| Query ID | Family | Query | Slot/Limitation | Results Seen | Kept | Rejected | New Mechanism | Notes |
|---|---|---|---|---:|---:|---:|---|---|
| Q1 | near | `energy harvesting age of incorrect information Whittle index sensor scheduling` | L3/L7 | 5 | 3 | 2 | RMAB / Whittle scheduling for freshness and incorrectness | Found 2026 WIQL-UCB and PCL-indexability papers. |
| Q2 | near | `physical interference model link scheduling wireless multihop` | L6 | 3 | 2 | 1 | SINR-constrained scheduling | Retains prior physical-interference papers as direct MAC realism anchors. |
| Q3 | near | `wireless nonlinear energy harvester hardware measurements arxiv` | L5 | 5 | 3 | 2 | limited sensitivity, saturation, profile registry | Confirms nonlinear EH is anti-evidence against linear HOPE weights. |
| Q4 | adjacent | `conformal risk control distribution shift wireless uncertainty` | L1/L2/L7 | 8 | 4 | 4 | risk certificates, tail-risk conformal training, anytime control | v6 adds OCE/tail-risk training beyond v5 CRC. |
| Q5 | adjacent | `wireless graph diffusion resource allocation constrained ergodic` | L3/L4/L7 | 6 | 3 | 3 | learned conditional proposal distribution over allocations | New 2026 diffusion policy is useful only as candidate generator. |
| Q6 | adjacent | `digital twin wireless ray tracing hardware energy measurements` | L4/L5 | 4 | 2 | 2 | calibration residual, twin/hardware co-model | v6 upgrades MART-6G with RIoT DT because it includes energy/power measurements. |
| Q7 | far | `runtime assurance shield synthesis LTL modulo theories learning systems` | certificates / authority | 5 | 3 | 2 | richer shields over temporal/data constraints | v6 adds LTL-modulo-theories shield as repair to propositional shields. |
| Q8 | far | `wireless communication empowers online scheduling partial observability` | L2/L6/L7 | 4 | 1 | 3 | communication as schedulable intention traffic | Strong analogy for treating observation/control messages as first-class traffic. |
| Q9 | anti | `Whittle index indexability random arrivals unreliable channels` | L3 | 4 | 1 | 3 | indexability condition as kill test | Prevents treating Whittle scores as universal schedule authority. |
| Q10 | anti | `shield synthesis richer logics propositional limitation` | certificates | 4 | 1 | 3 | shield expressivity gap | Prevents v5's shield analogy from becoming too simple. |

Budget note: this run used a bounded constitutional pass. It selected 14 papers/mechanisms and 5 anti-evidence constraints. Full-PDF line audits were not performed for every candidate; source claims below are grounded to arXiv abstract/metadata pages and prior local review artifacts unless explicitly noted.

## Candidate Triage and Scoring

Scores use v6 rubric: mechanism clarity, target fit, evidence quality, analogy productivity, falsifiability, novelty distance, implementation affordance, minus oracle/metric/scale penalties.

| Paper | Distance | Mechanism | Evidence | Slot Hit | Main Risk | Score | Decision | Reason |
|---|---|---|---|---|---|---:|---|---|
| [Sensitive and Nonlinear Far Field RF Energy Harvesting](https://arxiv.org/abs/1707.07041) | near | nonlinear harvester transfer curve with limited sensitivity/saturation | measured-data modeling, statistics | L5 | device-specific measurement burden | 4.6 | keep | Directly attacks linear EH assumption. |
| [RF-based Energy Harvesting: Nonlinear Models, Applications and Challenges](https://arxiv.org/abs/2405.04976) | near | taxonomy of nonlinear RF EH models | survey | L5 | survey, not primitive | 3.4 | repair/background | Use as checklist, not as source of one mechanism. |
| [Waveform Optimization for WPT with Nonlinear EH](https://arxiv.org/abs/1506.08879) | near | waveform changes harvested DC under nonlinear EH | optimization/simulation | L5/Tier 8 | assumes controlled WPT action | 3.8 | keep-narrow | Good for Tier 8 RF-action profile, not ordinary HOPE routing. |
| [Adaptive Scheduling: RL Whittle Index for WSNs](https://arxiv.org/abs/2601.01179) | adjacent | WIQL-UCB RMAB scheduling over AoII with tiny runtime/memory | experiments | L3/L7 | learned index may overfit dynamics | 4.1 | keep | Strong fit for resource-constrained evidence scheduling. |
| [AoI cost minimization with no buffers, random arrivals, unreliable channels](https://arxiv.org/abs/2601.13130) | adjacent/anti | PCL-indexability and closed-form Whittle index under conditions | theory | L3/L6 | abstract queue assumptions | 3.9 | keep as anti-gate | Provides a condition check before Whittle-like policies are trusted. |
| [Graph Signal Diffusion Models for Wireless Resource Allocation](https://arxiv.org/abs/2604.05175) | adjacent | diffusion model samples near-expert resource allocations on channel graphs | simulation, under review | L3/L4/L7 | assumes known channel-state graph/expert data | 4.0 | keep-repair | Excellent candidate generator; not execution authority. |
| [Learning Decentralized Wireless Resource Allocations with GNNs](https://arxiv.org/abs/2107.01489) | near | delayed/asynchronous local graph aggregation and primal-dual learning | simulation/theory property | L2/L7 | simulation-only, local info assumptions | 4.0 | keep-narrow | Useful for RouteFold-style priors and local reports. |
| [Graph Neural Networks in Large Scale Wireless Communication Networks](https://arxiv.org/abs/2510.00896) | adjacent | transferability over sparse random geometric graphs | theory/simulation | L4/L7 | power allocation only | 3.7 | keep-narrow | Adds scale test for learned route/resource priors. |
| [Conformal Risk Control](https://arxiv.org/abs/2208.02814) | far | finite-sample expected monotone-loss control | theorem/examples | L1/L7 | expected risk not tail/system risk | 4.3 | keep | Converts uncertainty into risk-budget certificate. |
| [Conformal Risk Training](https://arxiv.org/abs/2510.08748) | far/anti | OCE/tail-risk conformal control, training through risk control | theorem/experiments | L1/L2/L7 | not wireless, model-training cost | 4.0 | keep-repair | Repairs v5 by moving beyond post-hoc expected risk only. |
| [Certifiably Byzantine-Robust Federated Conformal Prediction](https://arxiv.org/abs/2406.01960) | far | robust conformal calibration under malicious client statistics | theorem/experiments | L2/L7 | federated ML substrate mismatch | 4.1 | keep | Strong analogy for malicious/stale route-state reports. |
| [Proof-Carrying Plans](https://arxiv.org/abs/2008.04165) | far | resource logic verifies planner outputs with proof terms | soundness + Agda formalization | certificates | proof engineering overhead | 4.5 | keep | Best certificate analogy for route/schedule plans. |
| [Shield Synthesis](https://arxiv.org/abs/1501.02573) | far | runtime shield corrects unsafe outputs minimally | synthesis/experiments | certificates | Boolean/reactive abstraction | 4.1 | keep | Core proposal-authority split. |
| [Shield Synthesis for LTL Modulo Theories](https://arxiv.org/abs/2406.04184) | far/anti | shields for richer temporal/data theories | synthesis/evaluation | certificates | formal-model burden | 4.2 | keep | Repairs old shield analogy for data-rich HOPE certificates. |
| [RIoT Digital Twin](https://arxiv.org/abs/2511.09303) | adjacent | NS-3 DT with RF/optical, EH/consumption, real-time energy/power measurements | system/simulation | L4/L5 | not HOPE topology | 4.0 | keep | Stronger than generic digital twin because power measurements enter the twin. |
| [MART-6G](https://arxiv.org/abs/2502.14290) | adjacent | adaptive ray-tracing channel twin | platform/case studies | L4/L5 | channel twin not harvester twin | 3.8 | keep-narrow | Good channel model, incomplete energy model. |
| [Goal-Oriented Communication, Estimation, and Control](https://arxiv.org/abs/2312.16061) | adjacent | schedule by violation probability and goal-related information usefulness | CMDP/simulation | L3/L7 | WNCS abstraction | 4.2 | keep | Better metric for Tier 4.6 and Tier 5 than entropy/AoI alone. |
| [Goal-Oriented Wireless Resource Allocation](https://arxiv.org/abs/2311.02911) | adjacent | information utility gain decomposed for resource allocation | algorithm/examples | L3/L6/L7 | CPS goals must be specified | 3.9 | keep | Useful for schedule objective decomposition. |
| [Physical-interference Link Scheduling](https://arxiv.org/abs/0910.5215) | near | SINR-aware centralized/distributed scheduling | approximation theorem | L6 | old model assumptions | 4.2 | keep | Direct answer to graph-conflict simplification. |
| [Localized Link Scheduling under Physical Interference](https://arxiv.org/abs/1301.4738) | near | localized throughput-guaranteed scheduling under physical interference | theorem/simulation | L6 | not energy-harvesting | 4.0 | keep | Good local certificate approximation for Tier 5/6.5. |
| [Wireless communication empowers online scheduling of partially-observable T-MRS](https://arxiv.org/abs/2603.23967) | far | intention/sensor data become M2M traffic for partial-observation scheduling | simulation | L2/L6/L7 | factory robots not WSN | 3.8 | keep-analogy | Important observation: coordination traffic is domain-specific, not ordinary traffic. |
| [Wireless-Powered Cooperative Communications via Hybrid Relay](https://arxiv.org/abs/1408.4841) | near | relay transfers energy and forwards information | optimization/simulation | L3/L5/Tier 8 | idealized relay/WPT assumptions | 3.8 | keep-gated | Concrete RF cooperative action primitive. |
| [Energy Harvesting Aware Multi-hop Routing via MARL](https://arxiv.org/abs/2203.11313) | near | MARL routing under EH dynamics | simulation | L2/L3 | learned policy authority risk | 3.2 | repair | Keep only as proposal generator or baseline. |
| Source-Specific Routing | far | source-dependent route dimension | protocol | Tier 7 | weak HOPE mechanism map | 2.6 | demote | Mostly metaphor; prior attempts overvalued it. |

## Source-Claim Ledger

| Claim ID | Source | Claim Type | Claim | Evidence Strength | Scope | Assumptions | Not Claimed | Usable? |
|---|---|---|---|---|---|---|---|---|
| SC-01 | [Alevizos/Bletsas 2017](https://arxiv.org/abs/1707.07041) | physical model | RF harvested power should be modeled as nonlinear, nondecreasing, limited by sensitivity and saturation; linear models can deviate in low-power regimes. | high | far-field RF EH/SWIPT | measured datapoints available | does not solve routing | yes |
| SC-02 | [Clerckx et al. 2015](https://arxiv.org/abs/1506.08879) | optimization | waveform design under nonlinear harvester modeling can change harvested DC power relative to standard waveforms. | medium | WPT/SWIPT waveform control | transmitter waveform control exists | not a generic routing result | yes, Tier 8 only |
| SC-03 | [Jonah/Yoo/Sthapit 2026](https://arxiv.org/abs/2601.01179) | algorithm/experiment | WIQL-UCB schedules WSN sensors for AoII/RMAB settings with low memory and sub-millisecond per-decision runtime in reported experiments. | medium | simulated WSN/RMAB settings | state abstraction and reward are valid | no HOPE route certificate | yes |
| SC-04 | [Nino-Mora 2026](https://arxiv.org/abs/2601.13130) | theorem | Whittle-index use for AoI scheduling depends on indexability conditions; the paper gives PCL-based sufficient conditions and closed-form indices for a broader no-buffer/unreliable-channel model. | high | mathematical AoI model | model matches schedule process | not a learned policy guarantee | yes as anti-gate |
| SC-05 | [Uslu et al. 2026](https://arxiv.org/abs/2604.05175) | algorithm/experiment | A graph-signal diffusion policy can amortize a primal-dual expert by sampling resource allocations on channel-state graphs; time-sharing gives near-optimal utility and near-feasible minimum rates in a power-control case study. | medium | wireless resource allocation, under review | channel graph and expert samples exist | not route/schedule authorization | yes, proposal only |
| SC-06 | [Wang/Eisen/Ribeiro 2021](https://arxiv.org/abs/2107.01489) | algorithm | Agg-GNN processes delayed/asynchronous locally aggregated graph state and supports decentralized constrained wireless resource allocation. | medium | wireless allocation simulation | local multi-hop state is available | not a safety proof | yes, proposal only |
| SC-07 | [Conformal Risk Control 2022](https://arxiv.org/abs/2208.02814) | theorem/algorithm | CRC controls expected monotone loss with distribution-free finite-sample guarantees and extensions to distribution shift/adversarial risk. | high | calibration setting | monotone loss and calibration set | not per-route deterministic safety | yes |
| SC-08 | [Conformal Risk Training 2025](https://arxiv.org/abs/2510.08748) | theorem/experiment | OCE conformal risk training extends CRC toward tail risks such as CVaR and differentiates through risk control to improve average-case performance. | medium | ML risk control | training/finetuning possible | not wireless-specific | yes as repair |
| SC-09 | [Rob-FCP 2024](https://arxiv.org/abs/2406.01960) | theorem/experiment | Federated conformal prediction is vulnerable to Byzantine clients; robust aggregation can recover coverage bounds near the desired level under malicious statistic reports. | high | federated calibration | malicious-client model approximates target | not route-report protocol by itself | yes |
| SC-10 | [Proof-Carrying Plans 2020](https://arxiv.org/abs/2008.04165) | theorem/formalization | PCP logic verifies AI plans as resource-aware proof-bearing functions with pre/postconditions and an Agda soundness formalization. | high | symbolic AI planning | plan can be represented in proof logic | not RF routing logic out of box | yes |
| SC-11 | [Shield Synthesis 2015](https://arxiv.org/abs/1501.02573) | algorithm/system | A synthesized shield monitors inputs/outputs and minimally corrects unsafe outputs at runtime for critical properties. | high | reactive systems | critical properties can be specified | not rich numeric RF constraints | yes |
| SC-12 | [LTL Modulo Theories Shielding 2024](https://arxiv.org/abs/2406.04184) | algorithm/evaluation | Shielding over only propositional logics is too limited for richer systems; LTL modulo theories extends shields to temporal/data-rich constraints. | medium | formal safety shields | theories/specs are available | not automatic from arbitrary code | yes |
| SC-13 | [RIoT Digital Twin 2025](https://arxiv.org/abs/2511.09303) | system | A wireless IoT digital twin can model RF/optical communication, energy harvesting/consumption, and incorporate real-time energy/power measurements. | medium | RIoT/NS-3 framework | target hardware measurements exist | not HOPE-specific | yes |
| SC-14 | [MART-6G 2025](https://arxiv.org/abs/2502.14290) | system | Multi-task adaptive ray tracing can twin wireless channels for offline high-accuracy and online real-time DTN tasks. | medium | 6G channel twin | environment sensing/calibration available | not an energy-harvester twin | yes |
| SC-15 | [Cao et al. 2023](https://arxiv.org/abs/2312.16061) | control/algorithm | Goal-oriented WNCS scheduling can optimize violation probability and communication cost by using goal-related usefulness and context importance. | medium | networked control | plant/control objective defined | not generic packet delivery | yes |
| SC-16 | [Fan/Zhang/Ren 2009](https://arxiv.org/abs/0910.5215) | algorithm/theorem | Physical-interference link scheduling uses aggregated SINR rather than only packet-collision graph models, with centralized and distributed approximations. | high | multihop wireless scheduling | SINR model known | not EH/freshness aware | yes |
| SC-17 | [Liao et al. 2026](https://arxiv.org/abs/2603.23967) | system/experiment | Partial-observation online route scheduling can be improved by treating intention and sensor data as specialized M2M traffic coupled to scheduling. | medium | smart-factory multi-robot scheduling | intention traffic can be encoded | not WSN routing | yes by analogy |

## Selected Paper Reviews

### Sensitive and Nonlinear Far Field RF Energy Harvesting

Authors: Panos N. Alevizos, Aggelos Bletsas  
Paper: https://arxiv.org/abs/1707.07041  
Version/date checked: v3, checked 2026-05-28  
Model/System: nonlinear far-field RF harvester model

TL;DR

WHAT was done? The paper models harvested RF power as a nonlinear, nondecreasing transfer function with limited sensitivity and saturation, then uses finite measured datapoints to approximate harvested-power statistics under fading.

WHY it matters? HOPE's sign-aware interference idea collapses if "extra interference" is below harvester sensitivity or in a saturated regime. The useful-energy side of interference is not scalar and linear.

Evidence Quality

Strong for the modeling correction. It uses measured harvester behavior and gives a practical piecewise-linear modeling route.

Limitations

It does not solve routing, scheduling, mobility, or state acquisition. It also raises measurement burden.

Transfer Analysis

Paper claim: SC-01.  
Transfer claim: every HOPE/IP-HOPE route or RF action needs a `harvester_profile_id`, sensitivity threshold, saturation model, and calibration residual.  
Target insertion point: Tier 4.5 hardware profile registry; Tier 8 RF-action certificates; ECRK physics block.  
Variable mapping: input RF power -> route-local received interference/energy; output DC -> usable energy increment; sensitivity/saturation -> candidate validity interval.  
Required adaptation: replay winner maps under profile families and measured HIL traces.  
Analogy type: direct application.  
Falsifier: measured nonlinear profiles do not change any route/schedule/RF-action winner map.  
Decision: keep.

### Adaptive Scheduling: A Reinforcement Learning Whittle Index Approach for Wireless Sensor Networks

Authors: Sokipriala Jonah, Seong Ki Yoo, Saurav Sthapit  
Paper: https://arxiv.org/abs/2601.01179  
Version/date checked: v2, checked 2026-05-28  
Model/System: WIQL-UCB scheduler for RMAB/AoII WSN scheduling

TL;DR

WHAT was done? The paper proposes a Whittle-index Q-learning scheduler with UCB exploration for RMAB sensor scheduling, including an Age of Incorrect Information application and low-memory, low-latency reported decisions.

WHY it matters? It attacks a real HOPE gap: not every fresh update matters, and not every sensor should transmit just because it can. The scheduler prioritizes evidence value under constrained resources.

Evidence Quality

Medium. It is experimental and simulation-oriented, but the memory/runtime numbers make it unusually relevant to constrained nodes.

Limitations

It is not a route-authority system and does not prove safety of a HOPE route. AoII state definitions must match the target process.

Transfer Analysis

Paper claim: SC-03.  
Transfer claim: Tier 5.5 evidence probes and Tier 4.6 observation actions should be ranked by expected incorrectness reduction per energy/airtime unit, not only by entropy or freshness.  
Target insertion point: observation scheduler, probe token allocator, schedule certificate objective.  
Variable mapping: sensor arm -> node/link/report source; AoII -> stale/incorrect route-state harm; budgeted activations -> probe slots/control airtime.  
Required adaptation: output becomes an ECRK proposal field, not authorization.  
Analogy type: analogous use.  
Falsifier: AoII-ranked probes do not reduce incorrect route decisions versus current staleness inflation under equal airtime.  
Decision: keep.

### Age of Information Cost Minimization with No Buffers, Random Arrivals and Unreliable Channels

Authors: Jose Nino-Mora  
Paper: https://arxiv.org/abs/2601.13130  
Version/date checked: v1, checked 2026-05-28  
Model/System: PCL-indexability analysis for AoI scheduling

TL;DR

WHAT was done? The paper establishes sufficient indexability conditions and closed-form Whittle indices for a no-buffer AoI model with random arrivals, unreliable channels, and nondecreasing age costs.

WHY it matters? It is anti-evidence against careless Whittle-index borrowing. Whittle policies are powerful only when indexability conditions survive the target model.

Evidence Quality

High for the mathematical warning. The exact HOPE model will differ, but the kill test transfers cleanly.

Limitations

It does not include RF energy harvesting, route certificates, or multi-hop interference-powered routing.

Transfer Analysis

Paper claim: SC-04.  
Transfer claim: any Tier 5/5.5 Whittle-like evidence scheduler must either prove indexability for the target abstraction or be explicitly demoted to a heuristic proposal.  
Target insertion point: ECRK `proposal_trace` and `authorization_proofs`.  
Analogy type: anti-evidence-driven repair.  
Falsifier: a Whittle-like policy is authorized without indexability or replay evidence and passes seeded counterexamples only by luck.  
Decision: keep as anti-gate.

### Graph Signal Diffusion Models for Wireless Resource Allocation

Authors: Yigit Berkay Uslu, Samar Hadou, Shirin Saeedi Bidokhti, Alejandro Ribeiro  
Paper: https://arxiv.org/abs/2604.05175  
Version/date checked: v1, checked 2026-05-28  
Model/System: diffusion policy over graph signals for wireless allocation

TL;DR

WHAT was done? The paper trains a diffusion model to match expert conditional distributions over resource allocations on channel-state graphs, amortizing primal-dual optimization by sampling near-expert allocations.

WHY it matters? RouteFold-style learned priors should not output one brittle best route. A distribution over plausible resource allocations is more useful because it can preserve diversity, expose uncertainty, and feed certificate-based selection.

Evidence Quality

Medium. It is new and under review, with a power-control case study rather than HOPE routing. Mechanism is still valuable.

Limitations

It assumes access to channel-state graphs and expert allocations. Without certificate gates it becomes another learned-authority risk.

Transfer Analysis

Paper claim: SC-05.  
Transfer claim: Tier 4.7/5 can learn a distribution over route/schedule candidates, then let ECRK certificates, shields, and ancestor coverage choose what can execute.  
Target insertion point: RouteFold candidate sampler, Tier 5 schedule sampler, Tier 8 RF-action proposal generator.  
Variable mapping: channel-state graph -> HOPE state graph/TERG; allocation vector -> route/schedule/RF-action vector; expert samples -> certified lower-tier or oracle replay winners.  
Required adaptation: sampler must emit diversity and uncertainty metadata, not just top-1 candidates.  
Analogy type: analogous use.  
Falsifier: generated candidates do not increase certified winner quality or diversity over current RouteFold while preserving ancestor coverage.  
Decision: keep-repair.

### Conformal Risk Training

Authors: Christopher Yeh, Nicolas Christianson, Adam Wierman, Yisong Yue  
Paper: https://arxiv.org/abs/2510.08748  
Version/date checked: v1, checked 2026-05-28  
Model/System: end-to-end conformal OCE/tail-risk control

TL;DR

WHAT was done? The paper extends conformal risk control toward optimized certainty-equivalent risks, including tail risks such as CVaR, and differentiates through risk control during training.

WHY it matters? v5 over-weighted post-hoc conformal risk as if expected risk were enough. HOPE failure is often tail-dominated: rare stale-state or harvester-model errors can dominate system safety.

Evidence Quality

Medium to high. The paper is accepted to NeurIPS 2025, but not wireless-specific.

Limitations

It assumes a trainable model and calibration/training setup. It does not supply route-level formal safety.

Transfer Analysis

Paper claim: SC-08.  
Transfer claim: Tier 2.9 and 4.6 forecast bundles should carry both expected-risk and tail-risk fields when the failure mode is catastrophic or bursty.  
Target insertion point: ECRK `risk_certificate`; forecast-bundle calibrators; tactical envelope risk budgets.  
Variable mapping: monotone loss/OCE risk -> route violation loss, energy-shortfall loss, stale-state loss; conformal training -> calibrator tuning on replay traces.  
Required adaptation: tail-risk certificate remains a gate input, not a proof of safety.  
Analogy type: analogous use.  
Falsifier: tail-risk fields do not improve seeded rare-regime violations over current expected-risk/staleness inflation.  
Decision: keep-repair.

### Certifiably Byzantine-Robust Federated Conformal Prediction

Authors: Mintong Kang, Zhen Lin, Jimeng Sun, Cao Xiao, Bo Li  
Paper: https://arxiv.org/abs/2406.01960  
Version/date checked: v1, checked 2026-05-28  
Model/System: robust federated conformal prediction

TL;DR

WHAT was done? The paper shows federated conformal calibration is vulnerable to malicious clients and proposes robust FCP with coverage bounds under Byzantine statistic reports.

WHY it matters? IP-HOPE state reports are a calibration surface. A few compromised or stale nodes can make route-state confidence look valid when it is not.

Evidence Quality

High for the federated-calibration claim: theorem plus empirical attacks/defense.

Limitations

It is an ML calibration paper, not a network routing protocol. Byzantine model must be mapped carefully.

Transfer Analysis

Paper claim: SC-09.  
Transfer claim: Tier 7 federated gateway calibration and Tier 5.5 local evidence ingestion should treat report aggregation as adversarial, not merely noisy.  
Target insertion point: ECRK `state_claims` and `trust_evidence`; Tier 7 context exchange.  
Variable mapping: client statistic -> node/gateway report; malicious client count -> compromised/stale reporters; coverage bound -> route-state trust interval.  
Required adaptation: include malicious-report estimator and report-provenance audit.  
Analogy type: analogous use.  
Falsifier: robust aggregation does not reduce false-safe route certificates under injected malicious report traces.  
Decision: keep.

### Proof-Carrying Plans

Authors: Alasdair Hill, Ekaterina Komendantskaya, Ronald P. A. Petrick  
Paper: https://arxiv.org/abs/2008.04165  
Version/date checked: v2, checked 2026-05-28  
Model/System: resource logic for proof-carrying plans

TL;DR

WHAT was done? The paper introduces a proof-carrying logic for verifying AI plans with resource-aware pre/postconditions and an Agda soundness formalization.

WHY it matters? HOPE/IP-HOPE already wants candidates, projections, schedules, and tactical envelopes. The missing abstraction is a common proof object that travels with each candidate across tiers.

Evidence Quality

High for formal mechanism. Translation to RF routing is nontrivial.

Limitations

Proof engineering cost is real. Rich continuous RF dynamics must be abstracted into decidable obligations.

Transfer Analysis

Paper claim: SC-10.  
Transfer claim: ECRK should carry proof obligations over energy, airtime, queue, staleness, and authority pre/postconditions.  
Target insertion point: Tier 4.4 projection certificates, Tier 5 schedule certificates, Tier 6 tactical envelopes, Tier 8 RF-action gates.  
Variable mapping: plan state -> network state digest; resource precondition -> battery/airtime/sync precondition; postcondition -> freshness/delivery/safety guarantee.  
Required adaptation: define a small HOPE resource logic, not a full RF theorem prover.  
Analogy type: analogous use.  
Falsifier: seeded invalid route/schedule candidates pass ECRK proof checks.  
Decision: keep.

### Shield Synthesis for LTL Modulo Theories

Authors: Andoni Rodriguez, Guy Amir, Davide Corsi, Cesar Sanchez, Guy Katz  
Paper: https://arxiv.org/abs/2406.04184  
Version/date checked: v2, checked 2026-05-28  
Model/System: shields for temporal specifications with richer theories

TL;DR

WHAT was done? The paper extends shielding beyond propositional temporal logic to LTL modulo theories, addressing richer temporal/data constraints.

WHY it matters? v5's shield transfer was good but too weak. HOPE/IP-HOPE constraints are numeric and data-bearing: battery, RF power, synchronization, trust, route authority, and schedule slots.

Evidence Quality

Medium to high. Formal synthesis plus evaluation, but target translation is substantial.

Limitations

The shield can only enforce properties that are formally specified and observable at runtime.

Transfer Analysis

Paper claim: SC-12.  
Transfer claim: ECRK should bind candidates to shield contracts over temporal and numeric constraints; learned outputs and tactical deviations are filtered by the shield.  
Target insertion point: Tier 6/6.5 tactical envelopes; Tier 8 whole-stack policy.  
Variable mapping: ML action -> route/tactical/RF-action proposal; unsafe behavior -> authority, energy, airtime, RF, or trust violation; shield correction -> block, downgrade, repair, or fail closed.  
Required adaptation: specify a small theory vocabulary for HOPE rather than arbitrary formulas.  
Analogy type: analogous use.  
Falsifier: shield blocks too many valid candidates or allows seeded unsafe actions.  
Decision: keep.

### RIoT Digital Twin

Authors: Alaa Awad Abdellatif et al.  
Paper: https://arxiv.org/abs/2511.09303  
Version/date checked: v1, checked 2026-05-28  
Model/System: NS-3 digital twin with RF/optical communication, EH/consumption, hardware power measurements

TL;DR

WHAT was done? The paper builds a digital twin for reconfigurable IoT with RF and optical wireless subsystems, energy harvesting/consumption mechanisms, and real-time energy/power measurements from target hardware.

WHY it matters? It is closer to what HOPE needs than a pure channel twin: it couples communication behavior to energy measurements.

Evidence Quality

Medium. It is a system paper and still not HOPE-specific, but the measurement-coupled twin is the transferable mechanism.

Limitations

The twin can still be wrong. A DT is not hardware proof unless residuals are measured and used as gates.

Transfer Analysis

Paper claim: SC-13.  
Transfer claim: Tier 4.5/8 should require twin/hardware residuals inside ECRK before RF-active or nonlinear-harvester-sensitive candidates are promoted.  
Target insertion point: HIL calibration pipeline, hardware profile registry, RF-action certificate.  
Variable mapping: hardware power measurement -> harvester/consumption profile; DT subsystem -> channel/energy route model; runtime analysis -> candidate replay gate.  
Required adaptation: add residual thresholds and winner-flip analysis.  
Analogy type: analogous use.  
Falsifier: DT-calibrated candidates do not better predict HIL outcomes than current simulator profiles.  
Decision: keep.

### Goal-Oriented Communication, Estimation, and Control

Authors: Jie Cao, Ernest Kurniawan, Amnart Boonkajay, Nikolaos Pappas, Sumei Sun, Petar Popovski  
Paper: https://arxiv.org/abs/2312.16061  
Version/date checked: checked 2026-05-28  
Model/System: CMDP for goal-oriented WNCS scheduling

TL;DR

WHAT was done? The paper schedules communication and control actions by minimizing plant-state violation probability under cost constraints, using goal-related information usefulness.

WHY it matters? IP-HOPE should not optimize telemetry freshness in the abstract. It should optimize the expected reduction of route/schedule violations.

Evidence Quality

Medium. Strong conceptual fit, simulation-based domain evidence.

Limitations

The target objective must be specified. Without a HOPE violation model, "goal-oriented" becomes hand-waving.

Transfer Analysis

Paper claim: SC-15.  
Transfer claim: Tier 4.6 observation value and Tier 5 schedule value should be measured as violation-reduction per cost, not only entropy, AoI, or latency.  
Target insertion point: ECRK `objective_claims`; observation and schedule certificates.  
Variable mapping: plant violation -> route/schedule violation; control cost -> airtime/energy/sync; information usefulness -> expected certificate improvement.  
Required adaptation: define violation classes: energy shortfall, stale-state unsafe route, missed freshness deadline, MAC conflict.  
Analogy type: analogous use.  
Falsifier: violation-reduction VOI does not outperform entropy/AoI VOI on seeded route-state errors.  
Decision: keep.

### Approximation Algorithms for Link Scheduling with Physical Interference Model

Authors: Shuai Fan, Lin Zhang, Yong Ren  
Paper: https://arxiv.org/abs/0910.5215  
Version/date checked: checked 2026-05-28  
Model/System: centralized/distributed SINR-aware link scheduling

TL;DR

WHAT was done? The paper schedules multihop wireless links under physical SINR interference rather than a simple collision graph, giving approximation algorithms.

WHY it matters? Tier 5 conflict graphs are a necessary abstraction but not sufficient. HOPE's interference is both harmful and useful; therefore schedule feasibility must be physical, not only graph-theoretic.

Evidence Quality

High for the direct scheduling abstraction. Old paper, but mechanism remains central.

Limitations

It is not an EH/freshness/RF-harvester paper and does not model full MAC protocol behavior.

Transfer Analysis

Paper claim: SC-16.  
Transfer claim: ECRK schedule certificates should include a physical-SINR feasibility replay, not just conflict-graph compatibility.  
Target insertion point: Tier 5 schedule certificate, Tier 6.5 cluster micro-coordination.  
Variable mapping: link set -> scheduled route segments; SINR threshold -> decode/harvest feasibility boundary; distributed approximation -> cluster-local gate.  
Required adaptation: add energy-harvesting side effects and control-plane airtime.  
Analogy type: direct application.  
Falsifier: graph-feasible schedules fail SINR replay at material rates while physical replay catches them.  
Decision: keep.

### Wireless Communication Empowers Online Scheduling of Partially-Observable Transportation Multi-Robot Systems

Authors: Yaxin Liao et al.  
Paper: https://arxiv.org/abs/2603.23967  
Version/date checked: v1, checked 2026-05-28  
Model/System: communication-enabled online scheduling under partial observability

TL;DR

WHAT was done? The paper couples wireless M2M traffic with online route scheduling, treating AGV intention and sensor data as traffic that changes what can be scheduled under partial observability.

WHY it matters? This is a strong far analogy for HOPE: control traffic is not background overhead. It is an action that changes the feasible route/schedule space.

Evidence Quality

Medium. It is a different substrate, but the communication/scheduling coupling is clean.

Limitations

Factory AGV collision-free routing is not RF energy harvesting. The transfer is structural, not direct.

Transfer Analysis

Paper claim: SC-17.  
Transfer claim: Tier 4.6/5/6.5 should treat route intentions, probes, cancellation messages, and cluster coordination as schedulable control traffic with its own value and cost.  
Target insertion point: ECRK `resource_claims`; Tier 5 schedule cube; Tier 6.5 cluster envelope.  
Variable mapping: AGV intention traffic -> node/gateway route-intent/control reports; collision-free schedule -> RF/MAC-conflict-safe schedule; partial observation -> stale interference/energy map.  
Required adaptation: define HOPE-specific M2M/control classes and reservation rules.  
Analogy type: analogous use.  
Falsifier: explicit control-traffic scheduling does not change realized collisions, stale decisions, or route invalidations.  
Decision: keep.

## Mechanism Maps

### Map A: Nonlinear Physics Gate

| Source Variable/Component | Target Variable/Component | Preserved? | Gap/Risk | Repair |
|---|---|---|---|---|
| input RF power | received interference/energy at node | yes | measurement noise | profile confidence interval |
| harvester sensitivity | minimum useful interference | yes | per-device variation | `harvester_profile_id` |
| saturation | upper useful-energy bound | yes | waveform dependence | RF-action class field |
| piecewise curve | route weight conversion | yes | HIL missing | hardware residual gate |
| SWIPT scenario | HOPE routing/Tier 8 RF action | partial | not all interference is controlled WPT | separate passive vs active RF actions |

Status: clean for Tier 4.5 profiles; repairable for Tier 8 waveform actions.

### Map B: Learned Candidate Distribution, Not Learned Authority

| Source Variable/Component | Target Variable/Component | Preserved? | Gap/Risk | Repair |
|---|---|---|---|---|
| channel-state graph | TERG / route-state graph | partial | HOPE state includes energy, trust, queues | typed graph schema |
| expert allocation samples | certified lower-tier/replay winners | partial | expert may be biased | ancestor coverage and diversity target |
| diffusion/GNN policy | candidate generator | yes | hidden oracle if full graph unavailable | local-state masks |
| sampled allocation vector | route/schedule/RF-action candidate | yes | unsafe top-1 temptation | ECRK proof and shield gates |
| time-sharing | schedule mixture / fallback set | partial | synchronization cost | schedule feasibility replay |

Status: repairable. Promote only as proposal layer.

### Map C: Risk and Trust Certificates

| Source Variable/Component | Target Variable/Component | Preserved? | Gap/Risk | Repair |
|---|---|---|---|---|
| nonconformity score | route-state forecast error | yes | exchangeability breaks under shift | adaptive/online calibration |
| monotone loss | route/schedule violation loss | yes | expected risk hides tails | OCE/CVaR field |
| Byzantine client | malicious/stale node/gateway report | yes | attack model differs | report provenance and malicious-report estimator |
| coverage bound | confidence/risk certificate | partial | not deterministic safety | shield/proof gate after risk gate |
| calibration set | replay/HIL trace set | yes | selective missing reports | missingness/adversarial audit |

Status: clean as risk evidence; not a full safety proof.

### Map D: Proof and Shield Authority

| Source Variable/Component | Target Variable/Component | Preserved? | Gap/Risk | Repair |
|---|---|---|---|---|
| plan | route/schedule/observation/RF-action candidate | yes | continuous RF variables | finite obligation vocabulary |
| precondition | battery, state, trust, airtime, sync precondition | yes | stale evidence | timestamp/provenance fields |
| postcondition | delivery/freshness/safety claim | yes | probabilistic outcomes | risk-qualified postconditions |
| proof term | ECRK proof block | yes | proof overhead | small logic, incremental checks |
| shield | runtime fail-closed / repair filter | yes | observability of violation | monitorable predicates only |

Status: clean as architecture; implementation requires small HOPE resource logic.

### Map E: Communication as Scheduling Action

| Source Variable/Component | Target Variable/Component | Preserved? | Gap/Risk | Repair |
|---|---|---|---|---|
| intention traffic | route-intent/probe/cancel/report traffic | yes | security/trust | signed report provenance |
| sensor data traffic | state-acquisition/control-plane traffic | yes | competes with data and RF energy | airtime/energy budget |
| route scheduling under partial observation | HOPE route/schedule under stale state | yes | domain mismatch | use as evaluation axis |
| M2M link design | HOPE control-plane design | partial | different PHY/MAC | define control traffic classes |

Status: strong far analogy for L6/L7.

## Transfer Matrix

| Paper | Source Claim IDs | Source Mechanism | Target Limitation | Transfer Slot | Analogy Type | Strength | Main Risk | Falsifier |
|---|---|---|---|---|---|---:|---|---|
| Alevizos/Bletsas 2017 | SC-01 | nonlinear EH curve | L5 | hardware/model | direct | 5 | measurement burden | nonlinear profiles do not change winners |
| Clerckx et al. 2015 | SC-02 | waveform/EH coupling | L5/Tier 8 | RF-action | analogous/direct | 4 | controlled WPT assumption | waveform field gives no benefit under HIL |
| Jonah et al. 2026 | SC-03 | AoII/RMAB evidence scheduling | L3/L7 | controller/metric | analogous | 4 | learned index overfit | equal-airtime probes do not improve correctness |
| Nino-Mora 2026 | SC-04 | indexability condition | L3 | theorem/governance | anti | 4 | abstract model | Whittle authorization occurs without condition evidence |
| Uslu et al. 2026 | SC-05 | diffusion proposal distribution | L3/L4/L7 | learned proposal | analogous | 4 | hidden channel oracle | candidate diversity/quality not improved under certificates |
| Wang et al. 2021 | SC-06 | delayed local graph aggregation | L2/L7 | learned prior | analogous | 4 | simulation-only | local-state masks destroy performance |
| CRC 2022 | SC-07 | risk certificate | L1/L7 | certificate | analogous | 4 | expected risk only | seeded rare failures pass |
| CRT 2025 | SC-08 | tail-risk conformal training | L1/L2/L7 | certificate/model | analogous | 4 | trainable-calibrator assumption | tail field does not reduce rare violations |
| Rob-FCP 2024 | SC-09 | Byzantine-robust calibration | L2/L7 | trust | analogous | 4 | federated ML mismatch | malicious reports still pass route certificates |
| PCP 2020 | SC-10 | proof-carrying plan | certificates | certificate | analogous | 5 | proof overhead | seeded invalid routes pass proof |
| LTL-MT Shielding 2024 | SC-12 | rich runtime shield | certificates | runtime guard | analogous | 4 | spec burden | shield blocks valid routes or permits unsafe ones |
| RIoT DT 2025 | SC-13 | measurement-coupled twin | L4/L5 | simulator/hardware | analogous | 4 | twin overfit | twin residuals fail to predict HIL |
| Goal-Oriented WNCS 2023 | SC-15 | violation-reduction scheduling | L3/L7 | metric/controller | analogous | 4 | target objective missing | no improvement over entropy/AoI VOI |
| Physical Link Scheduling 2009 | SC-16 | SINR schedule feasibility | L6 | protocol/simulator | direct | 4 | incomplete MAC | graph-feasible schedules fail SINR replay |
| Liao et al. 2026 | SC-17 | intention traffic as route-scheduling input | L6/L7 | protocol | far analogy | 4 | robot-domain mismatch | explicit control-traffic scheduling has no realized effect |

## Invention Candidates

### 1. Evidence-Carrying Route Kernel

Novelty level: N4  
Decision: promote

Core abstraction: every executable or near-executable candidate in IP-HOPE carries a compact kernel of evidence, obligations, and runtime guards. The kernel is the unit that moves across tiers, not raw route scores.

Source papers: SC-01, SC-03, SC-04, SC-05, SC-08, SC-09, SC-10, SC-12, SC-13, SC-15, SC-16.

Protocol:

- Actors: gateway, node, cluster leader, federated gateway, route/schedule generator, verifier, runtime shield, HIL/twin evaluator.
- Information available: candidate route/schedule/RF action, state reports, forecasts, profiles, ancestor candidates, trace history.
- Allowed actions: propose, rank, prove, certify, install, block, repair, fail closed, realize trace.
- Forbidden actions: learned execution authority, hidden baseline removal, uncertified RF-active help, untracked report aggregation.
- Success condition: any installed candidate has auditable evidence sufficient for its tier and can be killed by seeded invalid states.

Kernel fields:

```text
candidate_id
candidate_type: route | schedule | observation | tactical | cluster | federated | rf_action
ancestor_coverage:
  lower_tier_candidates_seen
  omitted_candidates
  omission_reason
state_claims:
  report_sources
  timestamps
  staleness
  uncertainty
  trust_certificate
physics_claims:
  channel_model
  harvester_profile_id
  sensitivity_threshold
  saturation_region
  twin_residual
resource_claims:
  battery
  queue
  airtime
  synchronization
  control_traffic
objective_claims:
  latency
  freshness
  age_of_incorrect_information
  violation_probability
  tail_risk
proposal_trace:
  generator
  expert_or_training_source
  local_state_mask
  diversity_score
authorization_proofs:
  preconditions
  postconditions
  indexability_or_heuristic_status
  conformal_risk
  shield_contract
negative_evidence:
  anti_sources
  hostile_regime_results
  seeded_failure_results
realization_trace:
  install_time
  invalidations
  observed_energy
  observed_airtime
  observed_freshness
  observed_violations
```

Novelty contrast: v5's PC-FER was a broad route/schedule concept. ECRK is a typed kernel that can be inserted into existing Tier 2.9, 4.4, 5, 6, 7, and 8 ledgers without requiring a new monolithic route architecture.

Minimal experiment: implement ECRK for Tier 2.9 + Tier 4.4 + Tier 5 only. Seed invalid candidates: stale state, linear EH failure, omitted Tier 2.9 baseline, graph-feasible but SINR-infeasible schedule, malicious report. ECRK passes only if every seeded bad candidate is blocked or demoted and valid ancestors remain visible.

Kill condition: proof/check overhead exceeds control budget, or seeded invalid candidates still pass, or ancestor coverage makes no difference to selected winners.

### 2. Tail-Risk Forecast Bundles

Novelty level: N3  
Decision: repair into ECRK

Core idea: extend Tier 2.9 / 4.6 forecast bundles from staleness inflation and expected risk to tail-risk fields. Use conformal OCE/CVaR-style controls as evidence, not safety proof.

Why not promote alone: it only handles state uncertainty. It does not cover hardware, MAC, proof, or ancestor omission.

### 3. Certificate-Bounded Learned Candidate Sampler

Novelty level: N3  
Decision: repair into ECRK

Core idea: RouteFold should become a distributional candidate sampler. Graph diffusion/GNN policies generate diverse route/schedule/RF-action candidates; ECRK certificates and shields decide what may execute.

Why not promote alone: without ECRK, it repeats the classic learned-authority error.

### 4. Hardware Residual Winner-Flip Gate

Novelty level: N3  
Decision: repair into ECRK

Core idea: Tier 4.5 and Tier 8 must report whether nonlinear harvester profiles or HIL residuals flip winners relative to linear/simulator-only assumptions.

Why not promote alone: it is a necessary physical gate, not a complete cross-tier primitive.

### 5. Goal-Oriented Observation and Schedule Value

Novelty level: N3  
Decision: repair into ECRK

Core idea: observation and schedule value should be expected violation reduction per energy/airtime/sync cost, not just entropy, freshness, or latency.

Why not promote alone: it requires route violation classes and proof gates to avoid becoming another heuristic objective.

### 6. Control-Traffic as First-Class Traffic

Novelty level: N3  
Decision: repair into ECRK

Core idea: probes, route-intent messages, cancellations, cluster reports, and gateway handoffs must be scheduled as traffic with explicit value and cost.

Why not promote alone: it is an evaluation/protocol axis; ECRK supplies the object that records it.

## Verification Record

| Candidate | Definition | Distinction | Source Support | Claim Trace | Variable Map | Transfer | Invariants | Resources | Metrics | Oracle | Counterexample | Anti-Evidence | Falsifier | MDL | Baselines | Decision |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| ECRK | pass | pass | pass | pass | pass | pass | pass | repairable | pass | repairable | pass | pass | pass | pass | pass | promote |
| Tail-risk forecast bundles | pass | medium | pass | pass | pass | pass | pass | pass | pass | pass | pass | pass | pass | medium | pass | repair |
| Learned candidate sampler | pass | pass | pass | pass | pass | repairable | pass if non-authority | medium | medium | high | pass | pass | pass | pass | pass | repair |
| Hardware residual gate | pass | medium | pass | pass | pass | pass | pass | medium | pass | pass | pass | pass | pass | pass | pass | repair |
| Goal-oriented value | pass | pass | pass | pass | pass | repairable | pass | pass | pass | medium | pass | pass | pass | pass | pass | repair |
| Control-traffic first class | pass | pass | medium | pass | pass | repairable | pass | pass | pass | medium | pass | pass | pass | pass | pass | repair |
| MARL route authority | fail | fail | medium | weak | weak | fail | fail | medium | medium | high | fail | pass | fail | fail | fail | kill |
| Digital twin as proof | fail | medium | medium | pass | partial | fail | fail | medium | pass | high | pass | pass | pass | fail | pass | kill/repair as residual gate |

## Promoted Research Artifact: Evidence-Carrying Route Kernel

One-sentence thesis: HOPE/IP-HOPE should make the evidence object, not the route score or learned policy, the cross-tier primitive.

Novelty level: N4.

Why this is new: earlier attempts picked papers and proposed tier changes, but the changes remained distributed across tiers. ECRK consolidates the transferable mechanisms into one small object that every tier can emit, consume, verify, replay, and falsify.

Why this is plausible: the source mechanisms already exist independently: proof-carrying plans, runtime shields, conformal risk, nonlinear EH profiles, physical-interference scheduling, goal-oriented scheduling, and learned proposal distributions.

Why this may fail: the kernel could become too heavy for control-plane latency, too formal for practical RF dynamics, or too broad to implement consistently.

### Definition

An ECRK is a typed, bounded evidence object attached to any candidate that may affect route selection, schedule installation, observation spending, tactical deviation, gateway handoff, or RF-active cooperation.

### Protocol

1. Generator emits candidate plus proposal trace.
2. Ancestor coverage service records lower-tier eligible candidates and omissions.
3. State-risk service adds conformal/tail-risk/trust fields.
4. Physics service adds channel/harvester/twin/HIL profile fields.
5. Resource service adds queue, battery, airtime, sync, and control traffic budgets.
6. Proof service checks small resource-logic pre/postconditions.
7. Shield service attaches runtime block/repair/fail-closed contract.
8. Installer can execute only candidates whose ECRK gates match tier authority.
9. Realization service appends observed outcomes and invalidations.

### Theorem Template

If every installed candidate has an ECRK satisfying:

- ancestor coverage,
- monitorable preconditions,
- bounded risk certificate,
- physical feasibility replay,
- shield contract,
- realization trace binding,

then no learned candidate generator or higher tier can silently suppress a safe lower-tier candidate or execute outside its certified resource/authority envelope without leaving an auditable violation.

This is not a performance theorem. It is an evidence integrity and safety-boundary theorem.

### Boundary Claim

ECRK does not prove the RF channel model is true. It proves only that the route/schedule/RF-action was authorized under explicit state, physics, resource, and risk evidence, and that the evidence can be replayed or falsified.

### Minimal Experiment

Scope: Tier 2.9 + Tier 4.4 + Tier 5.

Cases:

1. stale forecast makes a route look safe;
2. linear EH model makes a route look energy-positive but nonlinear profile kills it;
3. graph-conflict schedule is feasible but SINR replay fails;
4. learned sampler proposes a high-score candidate that omits Tier 2.9 fallback;
5. malicious local report narrows a conformal interval;
6. valid lower-tier route is preserved but demoted for explicit cost.

Expected result:

- bad candidates are blocked, repaired, or demoted with reasons;
- valid ancestors remain visible;
- learned sampler improves candidate diversity without gaining authority;
- overhead remains inside a preset control-plane budget.

Kill condition:

- any seeded invalid candidate installs successfully;
- ECRK overhead exceeds accepted control budget;
- ancestor coverage does not detect omitted lower-tier candidates;
- nonlinear/HIL and physical-SINR gates never change any decision across stress cases.

### Implementation Sketch

Start with a Markdown/JSON schema and replay validator, not a theorem prover.

```json
{
  "candidate_id": "tier5:scenario42:schedule17",
  "candidate_type": "schedule",
  "ancestor_coverage": {"seen": ["tier29:fallback3"], "omitted": [], "reason": "none"},
  "state_claims": {"staleness_ms": 80, "trust": "robust_fcp_ok", "tail_risk": 0.04},
  "physics_claims": {"harvester_profile_id": "profile_A", "sinr_replay": "pass"},
  "resource_claims": {"airtime_ms": 9.5, "sync_margin_ms": 2.1, "battery_min_j": 0.18},
  "objective_claims": {"aoi_gain": 0.31, "violation_reduction": 0.12},
  "proposal_trace": {"generator": "routefold_shadow", "authority": "none"},
  "authorization_proofs": {"preconditions": "pass", "postconditions": "pass", "shield": "pass"},
  "negative_evidence": {"seeded_failures": ["linear_eh_low_power"], "status": "survived"},
  "realization_trace": null
}
```

Baselines to preserve:

- Tier 2.9 family selector with current staleness inflation;
- Tier 4.4 existing projection/execution certificates;
- Tier 5 graph-conflict schedule certificates;
- no-learned-prior route selection;
- linear EH simulation.

Next agenda:

1. implement ECRK schema and replay validator;
2. connect only Tier 2.9, Tier 4.4, and Tier 5 first;
3. add nonlinear harvester winner-flip replay;
4. add physical-SINR replay;
5. add adversarial report injection;
6. only then connect RouteFold/diffusion proposal generators.

## Killed / Repaired Analogies

| Analogy | Decision | Why |
|---|---|---|
| MARL or GNN as route authority | kill | Violates proposal-authority split; source papers do not provide HOPE safety proof. |
| Diffusion model samples installed directly | kill | Useful distributional proposal, but hidden-oracle and safety risks are fatal without ECRK. |
| Conformal coverage as deterministic safety | kill/repair | Coverage/risk certificates are evidence, not proof; combine with proof and shield gates. |
| Digital twin as hardware validation | kill/repair | Twin must become residual/winner-flip gate; it cannot replace HIL. |
| Whittle index as universal schedule rule | kill/repair | Indexability or replay evidence is required. |
| Source-specific routing as Tier 7 basis | demote | Mostly vocabulary-level analogy; weak mechanism transfer to HOPE. |
| Broad survey papers as primary evidence | demote | Useful checklists, weak source claims for concrete tier changes. |
| Linear EH retained as default for Tier 8 RF actions | kill | Nonlinear EH papers are direct anti-evidence. |

## Comparison With Previous Attempts

### Previous broad paper list

File: `agents-council/harness/arxiv_papers_for_lifting_ip_hope_limitations.md`  
Shape: 30 arXiv URLs grouped by limitation.

What it got right:

- Found the important neighborhoods: nonlinear EH, AoI/EH scheduling, physical interference, conformal uncertainty, POMDPs, GNN wireless allocation, RF cooperation, digital twins, federation.
- Already recognized that MARL/GNN papers should not become unbounded authority.

What v6 changes:

- Demotes survey/background papers unless they supply a mechanism.
- Adds 2026 papers on AoII/WIQL, AoI indexability, graph diffusion allocation, and partial-observation scheduling.
- Adds anti-evidence: indexability conditions, shield expressivity limits, tail-risk limits of simple CRC, twin/HIL residual checks.
- Turns the list into an executable design primitive: ECRK.

### Previous independent reviews

File: `agents-council/harness/arxiv_lift_papers_reviews.md`  
Shape: paper reviews independent of HOPE plus application sections.

What it got right:

- Kept papers understandable on their own terms.
- Avoided making every review HOPE-first.

What v6 changes:

- Adds claim IDs and transfer matrices so the target-use sections are auditable.
- Forces variable-level maps and minimal falsifiers.
- Makes "paper claim" and "transfer claim" separate. This matters because many prior applications were plausible but not falsifiable.

### Previous tier-change proposal

File: `agents-council/harness/ip_hope_tier_changes_from_arxiv_analogies.md`  
Shape: explicit tier-by-tier proposed changes from Tier 2.9 through Tier 8.

What it got right:

- Very useful implementation orientation.
- Explicitly labeled direct application vs analogous use.
- Already proposed PC-FER, adaptive conformal risk bundles, proposal-authority split, hardware/twin adjudication, and omission-regret reports.

What v6 changes:

- PC-FER is too large as a first implementation artifact. ECRK is the smaller kernel that can be attached to existing route/schedule/certificate ledgers.
- Tier changes should be routed through a shared ECRK schema rather than repeated custom fields per tier.
- Learned-prior papers are demoted from "routing idea" to "candidate distribution source."
- Whittle/AoII ideas are moved into observation/probe/schedule scoring, not whole-route authority.

### v5 constitutional discovery

File: `agents-council/harness/hope_v5_analogical_arxiv_discovery.md`  
Promoted artifact: Proof-Carrying Freshness-Energy Routes.

What v5 got right:

- The central insight was correct: proof-carrying route/schedule artifacts are the right family.
- It identified the right enforcement triad: proof-carrying plans, conformal risk, and shield synthesis.
- It preserved ancestor baselines and killed learned-policy authority.

What v6 changes:

- v6 makes the artifact less poetic and more implementable: ECRK is a typed object with fields, gates, and replay tests.
- v6 adds newer papers that sharpen the components:
  - [Graph Signal Diffusion Models for Wireless Resource Allocation](https://arxiv.org/abs/2604.05175) for distributional candidate generation;
  - [Adaptive Scheduling: WIQL-UCB](https://arxiv.org/abs/2601.01179) for low-resource AoII scheduling;
  - [AoI PCL-indexability](https://arxiv.org/abs/2601.13130) as Whittle anti-evidence;
  - [Conformal Risk Training](https://arxiv.org/abs/2510.08748) for tail-risk repair;
  - [Shield Synthesis for LTL Modulo Theories](https://arxiv.org/abs/2406.04184) for richer shields;
  - [RIoT Digital Twin](https://arxiv.org/abs/2511.09303) for energy/power measurement-coupled twins;
  - [Wireless communication empowers online scheduling](https://arxiv.org/abs/2603.23967) for control traffic as scheduling action.
- v6 changes the primary question from "which paper idea should each tier use?" to "what cross-tier evidence object lets the system safely absorb many paper ideas?"

Bottom line: v5 found the right family; v6 finds the implementable kernel.

## Operator Policy Delta

Operators fired:

- nonlinearize;
- temporalize;
- distributionalize;
- split-authority;
- certify;
- physicalize;
- bridge-to-physical;
- adversarialize;
- omission-regret;
- anti-evidence repair.

Which helped most:

1. split-authority: prevented RL/GNN/diffusion papers from becoming unsafe execution authority;
2. certify: unified proof-carrying plans, shields, conformal risk, and tier certificates;
3. physicalize: forced SINR and nonlinear EH gates;
4. omission-regret: kept lower-tier baselines visible;
5. anti-evidence repair: turned Whittle indexability, tail risk, shield expressivity, and twin residuals into gates.

Which failed or was weak:

- far-domain partial-observation scheduling was useful but not strong enough to drive the main artifact alone;
- broad survey papers added coverage but not invention;
- pure route-learning papers remained too authority-risky.

Next-run policy:

- search first for anti-evidence against the promoted artifact;
- prefer papers with explicit condition checks, residuals, or failure modes;
- add non-arXiv primary standards/hardware docs only if the next task becomes implementation.

## Governance Record

Self-certification check: pass with caveat. The run created a concrete artifact and falsifiers, not just a bibliography. Caveat: most source claims are abstract/page-level, not full-PDF audited.

Anti-Goodhart check: pass. ECRK explicitly protects against improving v6 metrics by omitting lower-tier candidates or hiding invalid candidates.

Novelty overclaim check: pass. ECRK is not claimed as a new theorem of RF routing; it is a new cross-tier evidence object assembled from existing mechanisms.

Source fidelity check: pass with caveat. Claims are tied to arXiv pages and previous local review artifacts; full proofs/results should be checked before implementation.

Anti-evidence check: pass. Included nonlinear EH against linear models, PCL-indexability against Whittle overuse, shield expressivity limits, tail-risk conformal repair, and twin residual skepticism.

Ancestor baseline check: pass. Ancestor coverage is a required ECRK field.

Rejected analogies:

- learned route authority;
- digital twin as proof;
- generic conformal coverage as safety;
- broad surveys as primary mechanism;
- source-specific routing as main Tier 7 mechanism.

Open violations:

- No full-PDF line-by-line audit for all selected papers.
- No local code implementation of ECRK yet.
- No quantitative overhead estimate for kernel validation.

Process changes:

- Future HOPE arXiv scouting should report both a paper list and the shared evidence object the list implies.
- New paper candidates should be accepted only if they change an ECRK field, gate, falsifier, or baseline.

## Next Experiments

| Experiment | Tiers | Paper mechanisms | Success | Kill condition |
|---|---|---|---|---|
| ECRK schema + replay validator | 2.9, 4.4, 5 | PCP, shields, CRC, physical scheduling | seeded bad candidates blocked; ancestors preserved | invalid candidate installs |
| Nonlinear EH winner-flip replay | 4.5, 8 | Alevizos/Bletsas; Clerckx; RIoT DT | route/RF-action winner maps expose linear-model sensitivity | no decision changes and no residual insight |
| Physical SINR schedule replay | 5, 6.5 | Fan/Zhang/Ren; localized scheduling | graph-feasible but SINR-infeasible schedules detected | replay catches nothing under stress |
| AoII / violation-reduction observation scheduler | 4.6, 5.5 | WIQL-UCB; goal-oriented WNCS | fewer incorrect route decisions under equal airtime | no improvement over staleness inflation |
| Robust report calibration | 5.5, 7 | Rob-FCP; CRC/CRT | malicious/stale reports widen or invalidate trust fields | attack traces still produce false-safe certificates |
| Learned candidate distribution in shadow mode | 4.7, 5, 8 | graph diffusion; Agg-GNN | better candidate diversity/quality with no authority leak | sampler suppresses ancestors or fails local-state masks |
| Control-traffic schedule accounting | 5, 6.5, 7 | partial-observation M2M scheduling | route-intent/probe/cancel traffic improves realized stability | explicit accounting changes no invalidation/collision metric |

## Appendix: Rejected or Demoted Papers and Why

| Paper/Family | Decision | Reason |
|---|---|---|
| Broad RF-EH surveys | background | Good taxonomy, weak source of one transferable mechanism. |
| Generic GNN wireless surveys | background | Useful evaluation checklist, but not enough for ECRK fields without specific mechanism papers. |
| Source-Specific Routing | demote | Route-dimension metaphor, weak variable map to HOPE evidence/certification. |
| MARL EH routing papers | repair | Useful baselines/proposal generators; unsafe as authority. |
| Simple adaptive conformal prediction only | repair | Long-run coverage is insufficient for rare HOPE safety failures; pair with tail-risk and shields. |
| Pure digital twin papers without hardware measurements | demote | Twin without residual gating risks simulator overconfidence. |

