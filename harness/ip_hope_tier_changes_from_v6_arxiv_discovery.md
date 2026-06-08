# IP-HOPE Tier Change Proposals from v6 Analogical ArXiv Discovery

Date: 2026-05-28  
Inputs:
- v6 discovery artifact: `agents-council/harness/hope_v6_analogical_arxiv_discovery.md`
- tier assessment: `agents-council/harness/ip_hope_tiers_vs_hope_review_limitations.md`
- prior tier-change proposal: `agents-council/harness/ip_hope_tier_changes_from_arxiv_analogies.md`

Purpose: propose concrete changes for every IP-HOPE tier starting with Tier 2.9, using the papers discovered in the v6 run. Every proposal explicitly labels whether it is a **Direct application** or an **Analogous use** of the paper idea.

## Label Rule

- **Direct application**: the paper's mechanism is applied in substantially the same substrate, such as RF energy harvesting, wireless link scheduling, wireless resource allocation, or wireless-powered cooperation.
- **Analogous use**: the paper's mechanism is structurally transferred into IP-HOPE from a different substrate, such as proof-carrying plans, conformal risk control, shield synthesis, digital twins, or multi-robot scheduling.

No learned policy paper is treated as execution authority. Learned methods may propose, rank, compress, or sample candidates; ECRK certificates and runtime shields decide what can execute.

## v6 Source Paper Keys

| Key | Paper | Core idea used |
|---|---|---|
| P1 | Alevizos, Bletsas, [Sensitive and Nonlinear Far Field RF Energy Harvesting](https://arxiv.org/abs/1707.07041) | nonlinear RF harvester profile with sensitivity and saturation |
| P2 | Clerckx et al., [Waveform Optimization for Wireless Power Transfer with Nonlinear Energy Harvester Modeling](https://arxiv.org/abs/1506.08879) | waveform/action class matters under nonlinear EH |
| P3 | Jonah, Yoo, Sthapit, [Adaptive Scheduling: A Reinforcement Learning Whittle Index Approach for Wireless Sensor Networks](https://arxiv.org/abs/2601.01179) | low-memory AoII/RMAB scheduling |
| P4 | Nino-Mora, [Age of Information Cost Minimization with No Buffers, Random Arrivals and Unreliable Channels](https://arxiv.org/abs/2601.13130) | Whittle indexability as a condition, not an assumption |
| P5 | Uslu et al., [Graph Signal Diffusion Models for Wireless Resource Allocation](https://arxiv.org/abs/2604.05175) | distributional candidate generation over wireless channel graphs |
| P6 | Wang, Eisen, Ribeiro, [Learning Decentralized Wireless Resource Allocations with Graph Neural Networks](https://arxiv.org/abs/2107.01489) | delayed/asynchronous local graph aggregation |
| P7 | Angelopoulos et al., [Conformal Risk Control](https://arxiv.org/abs/2208.02814) | distribution-free expected monotone-loss risk control |
| P8 | Yeh et al., [Conformal Risk Training](https://arxiv.org/abs/2510.08748) | OCE/tail-risk conformal control and training |
| P9 | Kang et al., [Certifiably Byzantine-Robust Federated Conformal Prediction](https://arxiv.org/abs/2406.01960) | robust conformal calibration under malicious reports |
| P10 | Hill, Komendantskaya, Petrick, [Proof-Carrying Plans](https://arxiv.org/abs/2008.04165) | resource-aware proof-bearing plans |
| P11 | Bloem et al., [Shield Synthesis](https://arxiv.org/abs/1501.02573) | runtime shield that minimally corrects unsafe outputs |
| P12 | Rodriguez et al., [Shield Synthesis for LTL Modulo Theories](https://arxiv.org/abs/2406.04184) | shields over richer temporal and data constraints |
| P13 | Abdellatif et al., [RIoT Digital Twin](https://arxiv.org/abs/2511.09303) | digital twin with energy/power measurements |
| P14 | Yu et al., [MART-6G](https://arxiv.org/abs/2502.14290) | adaptive ray-tracing wireless channel twin |
| P15 | Cao et al., [Goal-Oriented Communication, Estimation, and Control](https://arxiv.org/abs/2312.16061) | violation-probability and goal-usefulness scheduling |
| P16 | Fan, Zhang, Ren, [Approximation Algorithms for Link Scheduling with Physical Interference Model](https://arxiv.org/abs/0910.5215) | SINR-aware physical-interference scheduling |
| P17 | Zhou et al., [Localized Link Scheduling Under Physical Interference Model](https://arxiv.org/abs/1301.4738) | localized physical-interference schedule approximation |
| P18 | Liao et al., [Wireless Communication Empowers Online Scheduling of Partially-Observable Transportation Multi-Robot Systems](https://arxiv.org/abs/2603.23967) | intention/sensor traffic as schedulable control traffic |
| P19 | Chen et al., [Wireless-Powered Cooperative Communications via a Hybrid Relay](https://arxiv.org/abs/1408.4841) | relay as both information forwarder and energy source |

## Cross-Tier v6 Change

| Change | Direct or analogous | Paper reference | Proposal |
|---|---|---|---|
| Evidence-Carrying Route Kernel (ECRK) | **Analogous use** | P10 Proof-Carrying Plans; P11/P12 shield synthesis; P7/P8 conformal risk; P1 nonlinear EH; P16 physical scheduling | Add a small evidence object to every route, schedule, observation, tactical deviation, federated handoff, and RF action. It should carry provenance, ancestor coverage, risk/trust claims, physics claims, resource claims, proof obligations, shield contract, negative evidence, and realization trace. |
| Proposal-authority split | **Analogous use** | P5 graph diffusion; P6 Agg-GNN; P11/P12 shields | Learned systems may generate candidate distributions and priors, but installation requires ECRK proof/shield gates. |
| Ancestor coverage and omission-regret | **Analogous use** | P10 proof-carrying plans; P11 shield discipline | Every higher-tier winner must record lower-tier candidates seen, excluded, and omitted, with explicit reasons. |
| Nonlinear RF model gate | **Direct application** | P1 nonlinear RF EH; P2 nonlinear WPT waveform | Any candidate that depends on harvested RF energy must cite a harvester profile and report whether nonlinear sensitivity/saturation changes the decision. |
| Physical contention gate | **Direct application** | P16/P17 physical-interference scheduling | Any multi-link schedule must be replayed under SINR-style physical interference, not only graph conflicts. |

## Tier 2.9: Certified Protocol Families, Forecast Bundles, and Real Execution

| Change | Direct or analogous | Paper reference | Proposal |
|---|---|---|---|
| ECRK-lite for every protocol-family candidate | **Analogous use** | P10 Proof-Carrying Plans; P7/P8 conformal risk | Extend each Tier 2.9 candidate output with an ECRK-lite block: forecast provenance, staleness, risk field, lower-tier/fallback coverage, and proof/check status. |
| Tail-risk forecast bundle | **Analogous use** | P8 Conformal Risk Training; P7 Conformal Risk Control | Add `expected_risk`, `tail_risk`, and `risk_loss_kind` fields to `ForecastBundle`. Use them as evidence, not as deterministic safety proof. |
| Nonlinear energy profile field | **Direct application** | P1 Sensitive and Nonlinear RF EH | Add `harvester_profile_id`, sensitivity threshold, and saturation region to any family that scores interference as harvested energy. |
| Physical replay flag for synchronized/cascaded families | **Direct application** | P16 physical-interference scheduling | Add a replay gate that marks whether a family selector winner survives SINR-style feasibility checks. |
| Ancestor coverage record | **Analogous use** | P10 Proof-Carrying Plans; P11 Shield Synthesis | Record every safe fallback family that was eligible, dominated, blocked, or omitted. Higher tiers should inherit this record. |

Validation:
- Seed stale forecasts, linear-EH false positives, and omitted safe fallback families.
- Tier 2.9 passes only if the ECRK-lite record exposes the failure or blocks installation.

## Tier 3: Multi-Flow Scheduling, Security, and Staleness-Aware Quantile Prediction

| Change | Direct or analogous | Paper reference | Proposal |
|---|---|---|---|
| RouteToken ECRK extension | **Analogous use** | P10 Proof-Carrying Plans | Extend RouteTokens with ECRK fields for multi-flow provenance, risk, resource budget, and ancestor coverage. |
| Tail-calibrated quantile prediction | **Analogous use** | P7 Conformal Risk Control; P8 Conformal Risk Training | Replace single quantile confidence with expected-risk and tail-risk calibration for stale CQI, energy shortfall, and missed-deadline losses. |
| Byzantine/stale report trust field | **Analogous use** | P9 Byzantine-Robust Federated Conformal Prediction | Treat suspicious node reports as adversarial calibration inputs, not merely noisy measurements. |
| Control-plane traffic class | **Analogous use** | P18 partial-observation scheduling with M2M intention traffic | Add explicit schedule classes for RouteToken refreshes, cancellations, forecast updates, and security handshakes. |
| Concurrent-flow physical precheck | **Direct application** | P16 physical-interference scheduling | Before accepting multi-flow schedules, replay concurrent transmissions under aggregated physical interference. |

Validation:
- Compare old quantile/staleness inflation against tail-risk calibration under bursty channel changes.
- Inject malicious or stale reports and require trust fields to widen, demote, or invalidate affected RouteTokens.

## Tier 4.0: TERG Hidden-Path Discovery

| Change | Direct or analogous | Paper reference | Proposal |
|---|---|---|---|
| Profile-indexed TERG edge weights | **Direct application** | P1 Sensitive and Nonlinear RF EH | TERG energy edges should be computed under harvester profile families, not a single linear energy conversion. |
| SINR-aware TERG pruning | **Direct application** | P16 physical-interference scheduling | Prune or tag hidden paths that are graph-feasible but physically infeasible under aggregated interference. |
| TERG candidate ECRK provenance | **Analogous use** | P10 Proof-Carrying Plans | Every hidden path should record lifted-state assumptions, projection assumptions, lower-tier ancestor coverage, and proof obligations. |
| Shadow distributional expansion | **Analogous use** | P5 graph signal diffusion; P6 Agg-GNN | Use learned samplers only to propose additional TERG expansions; never allow them to authorize discovered paths. |
| Winner-flip replay | **Analogous use** | P13 RIoT Digital Twin; P14 MART-6G | Report whether profile/twin changes flip TERG winners relative to the original simulator. |

Validation:
- Run identical hidden-path scenarios under linear EH, nonlinear EH, graph-conflict feasibility, and physical-SINR feasibility.

## Tier 4.1: Role-Based TERG, Projection, and RouteFold Priors

| Change | Direct or analogous | Paper reference | Proposal |
|---|---|---|---|
| RouteFold as candidate distribution, not route authority | **Analogous use** | P5 graph signal diffusion | RouteFold should output a candidate distribution with diversity and uncertainty metadata, not a single authoritative route skeleton. |
| Delayed/asynchronous local graph features | **Analogous use** | P6 Agg-GNN wireless allocation | Add feature masks showing which local graph-state fields are delayed, missing, or asynchronously aggregated. |
| Projection ECRK block | **Analogous use** | P10 Proof-Carrying Plans | Projection candidates should carry pre/postconditions: lifted route assumptions, concrete projection requirements, repair status, and failure modes. |
| Learned-prior suppression audit | **Analogous use** | P11 Shield Synthesis | If a learned prior suppresses or reorders lower-tier candidates, record that influence and require a shield/validator to preserve safe ancestors. |
| Tail-risk prior influence cap | **Analogous use** | P8 Conformal Risk Training | Reduce learned-prior influence when tail-risk or OOD indicators are high. |

Validation:
- RouteFold fails if it changes installed winners without an ECRK audit trail.
- Learned priors fail if they reduce ancestor coverage under matched information.

## Tier 4.2: Beyond-TERG Execution Structures and Projection Layer

| Change | Direct or analogous | Paper reference | Proposal |
|---|---|---|---|
| ECRK for route bundles, anypath, spray-lite, and coded multipath | **Analogous use** | P10 Proof-Carrying Plans | Treat each execution structure as a plan with explicit resources, preconditions, postconditions, and fallback behavior. |
| Resource obligations for multi-mode execution | **Analogous use** | P10 Proof-Carrying Plans; P18 intention traffic scheduling | Add proof obligations for airtime, synchronization, queue pressure, and control messages created by complex execution structures. |
| Physical feasibility replay for projected structures | **Direct application** | P16/P17 physical-interference scheduling | Replay projected bundles and alternates under physical interference, not only abstract conflict rules. |
| Goal-oriented selection among continuations | **Analogous use** | P15 goal-oriented WNCS | Choose continuations by expected route/schedule violation reduction per resource cost, not only latency or reachability. |
| Nonlinear energy-effect vector | **Direct application** | P1 nonlinear RF EH | Each execution action should distinguish information delivery, interference harm, harvestable energy, sensitivity miss, and saturation. |

Validation:
- Seed execution structures that are lifted-space-valid but projection-invalid, SINR-invalid, or energy-invalid under nonlinear profiles.

## Tier 4.3: Belief-Aware and Execution-Certified TERG

| Change | Direct or analogous | Paper reference | Proposal |
|---|---|---|---|
| BeliefBundle risk certificate | **Analogous use** | P7 Conformal Risk Control; P8 Conformal Risk Training | BeliefBundle should carry expected-risk and tail-risk fields for route violation, energy shortfall, and freshness loss. |
| Robust report aggregation for belief updates | **Analogous use** | P9 Byzantine-Robust Federated Conformal Prediction | Treat node/gateway belief inputs as possibly malicious or selectively stale; add robust aggregation and malicious-report estimates. |
| Observation value as violation reduction | **Analogous use** | P15 goal-oriented WNCS | Rank observation actions by expected reduction in route/schedule violation probability per energy/airtime cost. |
| AoII-aware belief correction | **Analogous use** | P3 WIQL-UCB AoII scheduling | Track not only information age but whether stale information is likely to be wrong in a decision-relevant way. |
| Fail-closed shield contract | **Analogous use** | P12 LTL Modulo Theories Shielding | Attach a shield predicate to belief-certified routes: if belief/risk/trust fields fall outside contract, fail closed or request observation. |

Validation:
- Compare entropy-only observation selection against violation-reduction and AoII-aware selection under stale/intermittent state.

## Tier 4.4: Centralized Projection Runtime, Certificates, Ledgers, and Invalidation

| Change | Direct or analogous | Paper reference | Proposal |
|---|---|---|---|
| Implement the first full ECRK schema | **Analogous use** | P10 Proof-Carrying Plans | Tier 4.4 should become the canonical ECRK ledger owner because it already handles projection certificates, execution certificates, ledgers, and invalidation. |
| Runtime shield gate | **Analogous use** | P11 Shield Synthesis; P12 LTL Modulo Theories Shielding | Add install-time and runtime shield checks that can block, repair, or fail closed when ECRK obligations are violated. |
| Negative-evidence and seeded-failure ledger | **Analogous use** | P10 Proof-Carrying Plans; P12 shielding | Store seeded bad cases that each certificate family must reject: stale state, invalid projection, omitted ancestor, linear-EH failure, SINR failure. |
| Risk-certificate plugin interface | **Analogous use** | P7/P8 conformal risk | Let forecast/risk modules attach calibrated expected-risk and tail-risk fields to ECRK. |
| Ancestor coverage as mandatory install field | **Analogous use** | P10 Proof-Carrying Plans | Refuse installation if lower-tier eligible candidates are missing from the ECRK ancestor block without explicit reasons. |
| Physics-gate hooks | **Direct application** | P1 nonlinear RF EH; P16 physical scheduling | Add empty but typed hooks for harvester-profile and SINR replay results even before Tier 4.5/Tier 5 fully populate them. |

Validation:
- Tier 4.4 is the right first implementation tier. It passes only if seeded invalid candidates cannot install.

## Tier 4.5: Scalable Lifted Search, Hardware Profiles, and HIL Calibration

| Change | Direct or analogous | Paper reference | Proposal |
|---|---|---|---|
| Nonlinear harvester profile registry | **Direct application** | P1 Sensitive and Nonlinear RF EH | Replace scalar energy-conversion assumptions with measured or literature-backed profile families: sensitivity-limited, saturation-limited, piecewise measured, and profile confidence. |
| HIL winner-flip report | **Direct application** | P1 Sensitive and Nonlinear RF EH | Report whether winner maps change under nonlinear profiles or measured HIL traces. If no winners flip, record that as evidence rather than assuming it. |
| Measurement-coupled digital twin | **Analogous use** | P13 RIoT Digital Twin | Add hardware residuals into the twin/profile gate; a twin prediction is useful only with residual and drift evidence. |
| Channel twin residual | **Analogous use** | P14 MART-6G | Use ray-tracing/channel twin residuals as evidence fields, not as proof of physical truth. |
| Waveform/action profile preview | **Direct application** | P2 nonlinear WPT waveform optimization | If a route or RF action includes controlled RF transmission, record waveform/action class because nonlinear EH can make waveform matter. |

Validation:
- Re-run search under linear EH, nonlinear literature profiles, measured HIL profiles, and channel twin residual bounds.

## Tier 4.6: Active Observation and Belief Control

| Change | Direct or analogous | Paper reference | Proposal |
|---|---|---|---|
| Observation ECRK | **Analogous use** | P10 Proof-Carrying Plans | Observation actions should carry candidate ID, cost, expected belief improvement, risk effect, trust effect, and install authority status. |
| Violation-reduction VOI | **Analogous use** | P15 goal-oriented WNCS | Replace generic value-of-information with expected reduction in route, energy, freshness, or MAC violation probability per resource cost. |
| AoII/RMAB probe ranking | **Analogous use** | P3 WIQL-UCB AoII scheduling | Use AoII-style scores for probes whose value comes from correcting wrong state, not merely refreshing old state. |
| Indexability status for indexed observation policies | **Analogous use** | P4 PCL-indexability | If a Whittle-like index ranks observations, record whether indexability is proved, empirically supported, or absent. |
| Control-traffic reservation | **Analogous use** | P18 M2M intention traffic scheduling | Treat observation, cancellation, route-intent, and probe messages as schedulable traffic with energy and airtime cost. |
| Tail-risk observation trigger | **Analogous use** | P8 Conformal Risk Training | Trigger observe/wait/fail-closed when tail-risk rises even if expected risk remains tolerable. |

Validation:
- Seed rare stale-state failures and require tail-risk or AoII triggers to observe or fail closed earlier than entropy-only VOI.

## Tier 4.7: RouteFold-HOPE Learned Route-Structure Prior

| Change | Direct or analogous | Paper reference | Proposal |
|---|---|---|---|
| Distributional candidate sampler | **Analogous use** | P5 graph signal diffusion | RouteFold should emit a candidate distribution over route/schedule skeletons with diversity, uncertainty, and local-state-mask metadata. |
| Delayed/asynchronous graph-state inputs | **Analogous use** | P6 Agg-GNN wireless allocation | RouteFold features should explicitly mark delayed and asynchronously aggregated route-state inputs. |
| Sparse topology transfer test | **Analogous use** | P6 Agg-GNN; P5 graph diffusion | Test whether RouteFold trained on one topology/regime transfers to larger sparse wireless graphs without suppressing safe lower-tier candidates. |
| ECRK influence ledger | **Analogous use** | P10 Proof-Carrying Plans | Each candidate influenced by RouteFold should record how the prior changed ranking, search expansion, or pruning. |
| Shielded prior influence | **Analogous use** | P11/P12 shield synthesis | A learned prior may not prune candidates that pass ancestor or safety gates unless a shielded rule permits it. |
| OOD/tail-risk demotion | **Analogous use** | P8 Conformal Risk Training | Reduce prior authority when OOD or tail-risk evidence is high. |

Validation:
- RouteFold fails if it improves average route score while increasing omitted safe ancestors or invalid installed winners.

## Tier 5.0: Multi-Flow Schedule, Reservation, Conflict, Fairness, and QoS

| Change | Direct or analogous | Paper reference | Proposal |
|---|---|---|---|
| ECRK schedule certificate | **Analogous use** | P10 Proof-Carrying Plans | Schedule candidates should carry resource preconditions, postconditions, ancestor schedule coverage, and realization trace fields. |
| Physical-SINR schedule replay | **Direct application** | P16/P17 physical-interference scheduling | Add a schedule gate that replays concurrent links under physical interference, not only conflict graphs. |
| Nonlinear energy feasibility in schedules | **Direct application** | P1 nonlinear RF EH | Schedule energy feasibility should use harvester profiles when transmissions are expected to recharge nodes. |
| AoII/freshness schedule objective | **Analogous use** | P3 WIQL-UCB AoII scheduling | Add objective fields for age, incorrectness, update value, and energy cost. |
| Indexability gate for Whittle-like scheduling | **Analogous use** | P4 PCL-indexability | If schedule priorities use a Whittle-like index, record indexability status or demote the index to heuristic. |
| Goal-oriented schedule utility | **Analogous use** | P15 goal-oriented WNCS | Add violation-reduction and goal-utility fields alongside fairness and QoS. |
| Control-plane traffic in schedule cube | **Analogous use** | P18 M2M intention traffic scheduling | Schedule RouteTokens, probe reports, cancellations, and cluster coordination explicitly instead of treating them as free overhead. |

Validation:
- Compare conflict-graph schedules vs physical-SINR schedules.
- Compare latency/fairness schedules vs AoII/goal-oriented schedules on critical update workloads.

## Tier 5.5: Bounded Local Probes and Evidence Reports

| Change | Direct or analogous | Paper reference | Proposal |
|---|---|---|---|
| Probe ECRK | **Analogous use** | P10 Proof-Carrying Plans | Every local probe should carry cost, authority, target uncertainty, expected violation reduction, trust status, and downstream use restrictions. |
| AoII-ranked probe selection | **Analogous use** | P3 WIQL-UCB AoII scheduling | Rank probes by expected correction of wrong state per byte/joule/slot, not just by stale timestamp. |
| Indexability or heuristic label | **Analogous use** | P4 PCL-indexability | Any indexed probe scheduler must say whether the index has model support or is only a replay-tested heuristic. |
| Robust report aggregation | **Analogous use** | P9 Byzantine-Robust Federated Conformal Prediction | Add robust aggregation and malicious/stale reporter estimates for probe report ingestion. |
| Report risk certificate | **Analogous use** | P7/P8 conformal risk | Attach expected-risk and tail-risk effects to accepted local evidence reports. |
| Probe airtime reservation | **Analogous use** | P18 M2M intention traffic scheduling | Account for probe traffic as real schedule load that can compete with data and control traffic. |

Validation:
- Inject malicious, stale, and selectively missing local reports.
- Probe layer passes only if reports change trust/risk fields rather than silently entering the route-state store.

## Tier 6.0: Gateway-Approved Node-Tactical Execution

| Change | Direct or analogous | Paper reference | Proposal |
|---|---|---|---|
| Tactical-envelope ECRK | **Analogous use** | P10 Proof-Carrying Plans | Each approved local deviation should carry preconditions, allowed actions, forbidden actions, resource limits, and postcondition obligations. |
| Runtime tactical shield | **Analogous use** | P11 Shield Synthesis; P12 LTL Modulo Theories Shielding | Add node-local shield predicates that block or repair tactical actions outside the gateway-approved envelope. |
| Tail-risk tactical budget | **Analogous use** | P8 Conformal Risk Training | Let local tactical decisions consume a bounded tail-risk budget; if exceeded, report and fail closed. |
| Learned local proposal only | **Analogous use** | P5 graph diffusion; P6 Agg-GNN | Allow learned models to suggest local alternates, but require ECRK proof/shield gates before execution. |
| Tactical control traffic accounting | **Analogous use** | P18 M2M intention traffic scheduling | Schedule cancel, refresh, deviation, and local report messages as real traffic with priority and cost. |
| Local physical feasibility guard | **Direct application** | P16/P17 physical-interference scheduling | Tactical alternates must survive local SINR feasibility where local information is sufficient. |

Validation:
- Seed a locally attractive but envelope-violating deviation; shield must block or force fail-closed.

## Tier 6.5: Cluster-Tactical Micro-Coordination

| Change | Direct or analogous | Paper reference | Proposal |
|---|---|---|---|
| Cluster ECRK aggregate | **Analogous use** | P10 Proof-Carrying Plans | Cluster-level decisions should aggregate member evidence, local authority, resource budgets, and ancestor coverage into one cluster ECRK. |
| Localized physical scheduling | **Direct application** | P17 localized physical-interference scheduling | Use localized SINR-aware approximations for cluster slot/band/relay choices. |
| Cluster intent traffic | **Analogous use** | P18 M2M intention traffic scheduling | Treat cluster intent, coordination, and cancellation messages as scheduled traffic, not overhead. |
| Robust cluster report trust | **Analogous use** | P9 Byzantine-Robust Federated Conformal Prediction | Add robust aggregation for conflicting member reports and compromised/stale nodes. |
| Cluster candidate sampler | **Analogous use** | P5 graph signal diffusion; P6 Agg-GNN | Use learned samplers only to generate cluster alternatives under local-state masks. |
| AoII micro-probe ranking | **Analogous use** | P3 WIQL-UCB AoII scheduling; P4 PCL-indexability | Rank cluster probes by expected incorrectness reduction, and label indexability status if using an index. |

Validation:
- Cluster tier fails if micro-coordination hides gateway-approved ancestors, creates untracked control traffic, or executes outside local physical feasibility.

## Tier 7.0: Federated / Multi-Gateway and Degraded Continuity

| Change | Direct or analogous | Paper reference | Proposal |
|---|---|---|---|
| Federated ECRK context exchange | **Analogous use** | P10 Proof-Carrying Plans | Gateway handoffs should exchange ECRK fields rather than only route state: provenance, trust, risk, hardware profile, ancestor coverage, and realization trace. |
| Byzantine-robust gateway calibration | **Analogous use** | P9 Byzantine-Robust Federated Conformal Prediction | Treat gateway context and calibration summaries as potentially malicious or selectively stale. |
| Degraded-continuity tail-risk gate | **Analogous use** | P8 Conformal Risk Training; P7 Conformal Risk Control | Use tail-risk fields to choose between handoff, degraded continuity, local tactical operation, or fail closed. |
| Handoff/control traffic class | **Analogous use** | P18 M2M intention traffic scheduling | Schedule gateway handoff, context sync, and continuity messages explicitly. |
| Channel/twin context residual | **Analogous use** | P13 RIoT Digital Twin; P14 MART-6G | When gateways share predictions, include twin residuals and hardware/channel calibration age. |
| Source-specific routing demotion note | **Analogous use** | v6 demotion of source-specific routing | Do not use source-specific routing as the main Tier 7 mechanism. Keep it only as a weak analogy for route-context dimensions. |

Validation:
- Inject a stale or malicious gateway summary. Tier 7 passes only if trust/risk fields widen or block unsafe handoff.

## Tier 8.0: RF-Cooperative Hypergraph and Whole-Stack Policy

| Change | Direct or analogous | Paper reference | Proposal |
|---|---|---|---|
| RF-action ECRK mandatory | **Analogous use** | P10 Proof-Carrying Plans; P11/P12 shield synthesis | Every RF-cooperative action must carry evidence for information effect, energy effect, interference harm, hardware profile, authority, and shield contract. |
| Nonlinear RF-action profile | **Direct application** | P1 Sensitive and Nonlinear RF EH | RF actions must include sensitivity, saturation, and piecewise harvester profile fields. |
| Waveform/action-class field | **Direct application** | P2 nonlinear WPT waveform optimization | If active RF assistance is allowed, record waveform/action class because nonlinear harvesting changes harvested DC power. |
| Hybrid relay action primitive | **Direct application** | P19 wireless-powered hybrid relay | Add a gated RF hyperedge class where a relay can both transfer energy and forward information. Keep it disabled unless nonlinear/HIL gates pass. |
| Whole-stack shield | **Analogous use** | P12 LTL Modulo Theories Shielding | Encode temporal/data constraints over RF power, route authority, schedule impact, energy state, and trust; shield can block or downgrade RF actions. |
| Hardware/twin residual gate | **Analogous use** | P13 RIoT Digital Twin; P14 MART-6G | Active RF actions require channel and harvester residuals, not just simulator wins. |
| Learned RF-action proposals only | **Analogous use** | P5 graph diffusion; P6 Agg-GNN | Learned models may propose RF-action candidates but cannot authorize RF-active behavior. |
| Physical interference and energy multi-effect replay | **Direct application** | P16 physical-interference scheduling; P1 nonlinear RF EH | Replay each RF hyperedge as both a SINR/interference event and a nonlinear EH event. |

Validation:
- Tier 8 fails if RF-active helpers improve simulated utility but fail nonlinear/HIL residual gates, physical replay, or shield constraints.

## v6 Implementation Order

1. **Tier 4.4 ECRK schema and replay validator.** This is the highest-leverage starting point because Tier 4.4 already owns certificates, ledgers, invalidation, and realized trace joins.
2. **Tier 2.9 ECRK-lite and tail-risk forecast fields.** Smallest upstream change that improves state/risk evidence.
3. **Tier 5 physical-SINR and control-traffic schedule replay.** Directly attacks the remaining MAC/control-plane realism gap.
4. **Tier 4.5 nonlinear harvester profile registry and winner-flip replay.** Directly attacks the hardware/nonlinear EH gap.
5. **Tier 4.6 / 5.5 AoII and violation-reduction observation/probe scheduler.** Converts state acquisition into a measured control action.
6. **Tier 4.7 learned distributional sampler in shadow mode.** Useful only after ECRK can prevent authority leakage.
7. **Tier 8 RF-action ECRK.** Do this last; it has the largest blast radius and must depend on Tier 4.4, 4.5, and 5 gates.

## Minimal Falsifiers

| Proposal family | Kill condition |
|---|---|
| ECRK | Seeded invalid route/schedule/RF-action installs successfully, or validation overhead exceeds control budget. |
| Tail-risk forecast bundles | Tail-risk fields do not catch rare stale-state failures better than current staleness inflation. |
| Nonlinear harvester profiles | Profile/HIL replay never changes route, schedule, or RF-action decisions and adds no residual insight. |
| Physical-SINR replay | Graph-feasible schedules almost never fail physical replay under stress, or physical replay is too slow for the intended gate. |
| AoII/violation-reduction observation | Probe/observation choices do not reduce incorrect route decisions under equal airtime and energy budget. |
| Robust report aggregation | Malicious/stale reports still produce false-safe route or gateway certificates. |
| Learned candidate distributions | Candidate diversity/quality does not improve under ECRK gates, or learned proposals suppress safe ancestors. |
| RF-action hyperedges | Benefits vanish under nonlinear EH, physical replay, HIL/twin residuals, or shield constraints. |

## Bottom Line

The v6 paper set should not be applied as a pile of feature requests. The coherent change is: make ECRK the evidence substrate, then let each tier populate more of it.

Direct applications mostly hit RF physics and wireless scheduling: nonlinear harvester profiles, waveform/action classes, physical-interference scheduling, and wireless-powered relay primitives.

Analogous uses mostly hit assurance and governance: proof-carrying plans, shields, conformal/tail-risk certificates, robust federated calibration, learned candidate sampling, and control-traffic scheduling.

