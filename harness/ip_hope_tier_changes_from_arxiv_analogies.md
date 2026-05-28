# IP-HOPE Tier Change Proposals from Analogical ArXiv Discovery

Date: 2026-05-28

Basis:
- Tier assessment: `ip_hope_tiers_vs_hope_review_limitations.md`
- v5 discovery packet: `hope_v5_analogical_arxiv_discovery.md`
- Earlier paper maps: `arxiv_papers_for_lifting_ip_hope_limitations.md`, `arxiv_lift_papers_reviews.md`

Rule used in this file:

- **Direct application** means the paper's method or model can be inserted into the tier with the same basic purpose the paper uses it for.
- **Analogous use** means the paper's mechanism transfers structurally, but the substrate changes; the proposal is a research hypothesis, not something the paper directly proves for HOPE/IP-HOPE.

## Source Paper Shortlist

| Key | Paper | URL |
|---|---|---|
| Nonlinear RF EH | Alevizos, Bletsas, *Sensitive and Nonlinear Far Field RF Energy Harvesting in Wireless Communications* | https://arxiv.org/abs/1707.07041 |
| EH AoI sensor | Bacinoglu, Uysal-Biyikoglu, *Scheduling Status Updates to Minimize Age of Information with an Energy Harvesting Sensor* | https://arxiv.org/abs/1701.08354 |
| Multi-source EH AoI | Abd-Elmagid, Dhillon, *Age of Information in Multi-source Updating Systems Powered by Energy Harvesting* | https://arxiv.org/abs/2109.07605 |
| Adaptive conformal | Gibbs, Candes, *Adaptive Conformal Inference Under Distribution Shift* | https://arxiv.org/abs/2106.00170 |
| Conformal risk | Angelopoulos et al., *Conformal Risk Control* | https://arxiv.org/abs/2208.02814 |
| WFCP | Zhu et al., *Federated Inference with Reliable Uncertainty Quantification over Wireless Channels via Conformal Prediction* | https://arxiv.org/abs/2308.04237 |
| Byzantine FCP | Kang et al., *Certifiably Byzantine-Robust Federated Conformal Prediction* | https://arxiv.org/abs/2406.01960 |
| Proof-carrying plans | Hill, Komendantskaya, Petrick, *Proof-Carrying Plans: a Resource Logic for AI Planning* | https://arxiv.org/abs/2008.04165 |
| Shield synthesis | Bloem et al., *Shield Synthesis: Runtime Enforcement for Reactive Systems* | https://arxiv.org/abs/1501.02573 |
| Changing-requirement RV | Carwehl et al., *Runtime Verification of Self-Adaptive Systems with Changing Requirements* | https://arxiv.org/abs/2303.16530 |
| Robust CBF safe RL | Emam et al., *Safe Reinforcement Learning Using Robust Control Barrier Functions* | https://arxiv.org/abs/2110.05415 |
| LCRL | Hasanbeig, Kroening, Abate, *Certified Policy Synthesis via Logically-Constrained Reinforcement Learning* | https://arxiv.org/abs/2209.10341 |
| MART-6G | Yu et al., *Road to 6G Digital Twin Networks: Multi-Task Adaptive Ray-Tracing as a Key Enabler* | https://arxiv.org/abs/2502.14290 |
| Goal-oriented control | Cao et al., *Goal-Oriented Communication, Estimation, and Control over Bidirectional Wireless Links* | https://arxiv.org/abs/2312.16061 |
| Goal-oriented resource allocation | Zou et al., *Goal-Oriented Wireless Communication Resource Allocation for the IIoT Application* | https://arxiv.org/abs/2311.02911 |
| Agg-GNN | Wang, Eisen, Ribeiro, *Learning Decentralized Wireless Resource Allocations with Graph Neural Networks* | https://arxiv.org/abs/2107.01489 |
| MARL EH routing | Zhang et al., *Energy Harvesting Aware Multi-hop Routing Policy in Distributed IoT System Based on Multi-agent Reinforcement Learning* | https://arxiv.org/abs/2203.11313 |
| Hybrid relay WPC | Chen et al., *Wireless-Powered Cooperative Communications via a Hybrid Relay* | https://arxiv.org/abs/1408.4841 |
| Physical link scheduling | Fan, Zhang, Ren, *Approximation Algorithms for Link Scheduling with Physical Interference Model in Wireless Multi-hop Networks* | https://arxiv.org/abs/0910.5215 |
| Localized physical scheduling | Zhou et al., *Throughput Optimizing Localized Link Scheduling for Multihop Wireless Networks Under Physical Interference Model* | https://arxiv.org/abs/1301.4738 |
| Waveform nonlinear WPT | Clerckx et al., *Waveform Optimization for Wireless Power Transfer with Nonlinear Energy Harvester Modeling* | https://arxiv.org/abs/1506.08879 |
| Hybrid relay time switching | Nasir et al., *Wireless-Powered Relays in Cooperative Communications: Time-Switching Relaying Protocols and Throughput Analysis* | https://arxiv.org/abs/1310.7648 |

## Tier 2.9: Certified protocol families, forecast bundles, and real execution

Current limitation focus: imperfect state, stale CQI/interference, family selection, early certification.

| Change | Direct or analogous | Paper reference | Proposal |
|---|---|---|---|
| Adaptive forecast calibration | **Direct application** | Adaptive conformal | Replace static forecast confidence with online adaptive conformal state per regime, node, band, and staleness bucket. `ForecastBundle` should expose calibration age, coverage target, observed coverage, and adaptation state. |
| Route-risk certificate | **Direct application** | Conformal risk | Convert `risk_penalty` from a heuristic scalar into a conformal risk certificate over monotone losses: outage loss, energy-underflow loss, stale-state loss, and replan-fragility loss. |
| Proof-bearing `CertifiedPlan` v0 | **Analogous use** | Proof-carrying plans | Add optional proof sidecars to `CertifiedPlan`: energy-causality preconditions, route-validity assumptions, forecast provenance, and permitted repair conditions. The paper proves a planning-logic pattern, not a wireless route logic. |
| Wireless calibration channel | **Direct application** | WFCP | Treat CQI/energy calibration as a wireless reporting protocol with its own uncertainty. Add "calibration transmission quality" to planner context rather than assuming free clean state. |
| Ancestor omission-regret report | **Analogous use** | Shield synthesis / omission-regret pattern from v5 | For every Tier 2.9 family selector win, record which families were eligible, excluded, or dominated. This prevents later tiers from appearing better by silently omitting safe lower-tier candidates. |

Minimum experiment:
- Replay existing Tier 2.9 scenarios with static quantile intervals vs adaptive conformal risk certificates.
- Seed stale-CQI failures and check whether certificate-aware selection avoids them without excessive conservatism.

## Tier 3: Multi-flow scheduling, RouteTokens, security, and quantile prediction

Current limitation focus: concurrent flows, fairness, telemetry history, security.

| Change | Direct or analogous | Paper reference | Proposal |
|---|---|---|---|
| Freshness-aware flow classes | **Direct application** | EH AoI sensor; Multi-source EH AoI | Add AoI/AoII-style freshness objectives to flow classes. Alarm, periodic sensing, bulk, and maintenance flows should have different freshness curves, not only priority weights. |
| Quantile prediction under drift | **Direct application** | Adaptive conformal | Calibrate GRU/TCN quantile bands online. Staleness inflation should be learned/adapted by realized coverage, not fixed as `a * sqrt(dt)` forever. |
| Byzantine telemetry guard | **Analogous use** | Byzantine FCP | Use robust conformity-style scores for node reports. The paper is about federated calibration, but the analogous mechanism is "malicious report detection over calibration summaries." |
| Shielded scheduler output | **Analogous use** | Shield synthesis | Add a small runtime shield between scheduler and RouteToken issuance to block invalid token sequences, unfair starvation, or energy-causality violations. |
| MARL as proposal generator only | **Analogous use** | MARL EH routing; Robust CBF safe RL | If MARL is used for multi-flow routing, it may propose candidate weights or orderings, but a certificate/shield layer must authorize final RouteTokens. |

Minimum experiment:
- Compare WRR-only vs AoI-aware WRR under bursty telemetry.
- Inject malicious/stale node reports and measure false-safe route tokens.

## Tier 4.0: TERG hidden-path discovery

Current limitation focus: flat route graphs miss time/band/mode hidden paths.

| Change | Direct or analogous | Paper reference | Proposal |
|---|---|---|---|
| Temporal route obligations | **Analogous use** | LCRL | Encode TERG route obligations as temporal specifications: eventually rejoin, never violate energy precondition before transmit, preserve fallback until route completion. LCRL supplies the logic-constrained policy idea, not a TERG solver. |
| TERG proof sidecar | **Analogous use** | Proof-carrying plans | Each lifted path should carry a proof sketch showing that time, band, and energy transitions respect allowed actions. This turns hidden-path discovery into certifiable hidden-path discovery. |
| TERG safety shield | **Analogous use** | Shield synthesis | Before installing a TERG-derived route, pass it through a shield that minimally edits or rejects route steps that violate critical invariants. |
| Hidden-path freshness axis | **Analogous use** | EH AoI sensor | Add hidden paths that are not just low latency but freshness-optimal: a route can be worse for first delivery but better for repeated status updates. |

Minimum experiment:
- Add seeded TERG candidates that are geometrically valid but violate temporal/fallback obligations. Verify proof/shield catches them.

## Tier 4.1: Role-based TERG, projection, and RouteFold priors

Current limitation focus: RouteFold guidance, abstraction/concretization, projection-aware search.

| Change | Direct or analogous | Paper reference | Proposal |
|---|---|---|---|
| Delayed local graph priors | **Analogous use** | Agg-GNN | Use aggregation-GNN structure for RouteFold features under delayed/asynchronous graph state. This is analogous: the paper handles wireless resource allocation, not IP-HOPE projection. |
| Projection-risk certificate | **Direct application** | Conformal risk | Calibrate risk of projection failure as a conformal loss: lifted trajectory projects to invalid object, repair cost exceeds bound, or realized trace violates expectation. |
| RouteFold shield | **Analogous use** | Robust CBF safe RL; Shield synthesis | RouteFold may bias ordering or skeletons, but its influence should pass through a barrier/shield that preserves lower-tier candidates and rejects unsafe bias. |
| Projection proof template | **Analogous use** | Proof-carrying plans | Projection from abstract trajectory to concrete route object should emit a proof of resource preservation: no hidden action added, no timing precondition lost, no fallback erased. |

Minimum experiment:
- OOD topology test: compare RouteFold-biased search with and without ancestor-preserving shield. Kill if RouteFold suppresses safe lower-tier winners.

## Tier 4.2: Beyond-TERG execution structures

Current limitation focus: route bundles, anypath, cluster continuations, spray-lite, coded multipath, hierarchical planning.

| Change | Direct or analogous | Paper reference | Proposal |
|---|---|---|---|
| Execution-object proof obligations | **Analogous use** | Proof-carrying plans | Every `RoutePlan`, `RouteSegment`, `MixedModeExecutionPlan`, and `RouteEnvelope` should carry different proof obligations. A mixed-mode plan must prove mode-switch validity; a route envelope must prove fallback bounds. |
| Runtime shield for concrete objects | **Analogous use** | Shield synthesis | Add per-object shields. A shield for `MixedModeExecutionPlan` rejects unsafe mode switches; a shield for `RouteEnvelope` rejects fallback paths that fail progress or energy constraints. |
| Goal-oriented execution selection | **Analogous use** | Goal-oriented control; goal-oriented resource allocation | Select among execution structures by downstream violation reduction, not only cost. Example: an anypath plan may be preferable if it reduces stale-state violation under uncertainty. |
| Physical-interference feasibility replay | **Direct application** | Physical link scheduling; localized physical scheduling | For execution structures involving parallelism or anypath alternatives, add SINR-style physical-interference replay before calling a plan executable. |

Minimum experiment:
- On the same hidden-path set, compare cost-only selection vs goal-oriented selection vs proof/shielded selection.

## Tier 4.3: Belief-aware, execution-certified TERG

Current limitation focus: missing information, observation actions, uncertainty, executability.

| Change | Direct or analogous | Paper reference | Proposal |
|---|---|---|---|
| Adaptive `BeliefBundle` calibration | **Direct application** | Adaptive conformal | Belief state should update calibration online as regimes drift. `BeliefBundle` should carry a coverage/adaptation record, not just point uncertainty. |
| Wireless observation certificate | **Direct application** | WFCP | Observations should be certified through the reporting channel that produced them. If a node report arrived over a weak/noisy control path, its calibration quality changes. |
| Byzantine observation ledger | **Analogous use** | Byzantine FCP | Add maliciousness/trust scores to observation records. This is analogous because node telemetry is not federated CP, but the structure is the same: distributed calibration reports can be adversarial. |
| Goal-oriented observation value | **Direct application** | Goal-oriented control | Observation value should be expected reduction in route/schedule violation probability per cost, not just uncertainty reduction. |
| Belief-to-proof bridge | **Analogous use** | Proof-carrying plans; conformal risk | Belief-aware routes should prove that their assumptions are covered by calibrated risk envelopes. |

Minimum experiment:
- Compare uncertainty-only VOI vs goal-oriented VOI under stale energy/interference traces.

## Tier 4.4: Projection runtime, certificates, ledger, invalidation

Current limitation focus: executable projection, repair, validation, certification, realized trace joins.

| Change | Direct or analogous | Paper reference | Proposal |
|---|---|---|---|
| Proof-carrying projection certificates | **Analogous use** | Proof-carrying plans | Replace opaque projection certificates with proof-carrying certificates: preconditions, transformation rule, preserved resources, introduced assumptions, and allowed repair region. |
| Synthesized install shield | **Analogous use** | Shield synthesis | Add a small install-time shield that rejects or minimally repairs candidates violating critical certificate properties, independent of planner identity. |
| Adaptive certificate requirements | **Analogous use** | Changing-requirement RV | Certificate requirements should change by regime: emulated lab, controlled RF, ambient RF, hostile ambient, degraded gateway, federation. Preserve monitor state across regime transitions. |
| Certificate risk loss | **Direct application** | Conformal risk | Calibrate certificate survival as a risk loss: projection invalidation, repair failure, runtime fallback activation, or trace mismatch. |
| Omission-regret ledger | **Analogous use** | v5 omission-regret from shield/certificate discipline | Every 4.4 candidate selected over Tier 2.9/Tier 4.2 ancestors should record whether ancestor routes were preserved, rejected, or omitted. |

Minimum experiment:
- Seed projection bugs and compare standard certificate checks vs proof-carrying certificates plus shield.

## Tier 4.5: Scalable lifted search, hardware profiles, HIL calibration

Current limitation focus: hardware profiles, HIL, scalable lifted search, search certificates.

| Change | Direct or analogous | Paper reference | Proposal |
|---|---|---|---|
| Nonlinear harvester profile registry | **Direct application** | Nonlinear RF EH | Replace linear harvested-energy assumptions with measured/piecewise nonlinear profiles. Add sensitivity threshold, saturation, and device profile ID to search snapshots. |
| Channel-harvester twin | **Analogous use** | MART-6G; Nonlinear RF EH | Adapt MART's channel-twin idea into a channel-plus-harvester twin: environment, propagation, rectifier/storage, and route-execution trace join. |
| Hardware residual risk certificate | **Direct application** | Conformal risk | HIL residuals should produce calibrated risk bounds over energy prediction error, timing prediction error, and route-success prediction error. |
| Waveform/action profile extension | **Analogous use** | Waveform nonlinear WPT | If RF actions or controlled energy transfer appear, add waveform class to hardware profiles. This is analogous because Tier 4.5 is not waveform optimization. |
| Hardware omission-regret report | **Analogous use** | MART-6G + omission-regret discipline | Report when a route wins in simulator but loses under calibrated twin or HIL trace. |

Minimum experiment:
- Replay Tier 4.5 search under linear EH, nonlinear literature profile, and measured HIL profile; record route winner flips.

## Tier 4.6: Active observation and belief control

Current limitation focus: observe/wait/route/fail-closed decisions; VOI; evidence certificates.

| Change | Direct or analogous | Paper reference | Proposal |
|---|---|---|---|
| Goal-oriented VOI | **Direct application** | Goal-oriented control | Observation actions should be ranked by expected reduction in violation probability per joule/control byte, not only posterior entropy reduction. |
| Adaptive observation calibration | **Direct application** | Adaptive conformal | Observation reliability should adapt online by node, band, report delay, and regime. |
| Wireless report calibration | **Direct application** | WFCP | Observation reports should include reporting-channel calibration quality. |
| Byzantine observation filter | **Analogous use** | Byzantine FCP | Add maliciousness scoring over repeated observation reports and calibration summaries. |
| Observation shield | **Analogous use** | Shield synthesis | A runtime shield should block observation policies that consume too much energy/control budget or route based on uncertified evidence. |

Minimum experiment:
- Compare entropy-VOI, goal-VOI, and Byzantine-aware goal-VOI on scenarios with stale and malicious reports.

## Tier 4.7: RouteFold learned route-structure prior

Current limitation focus: learned route skeletons, bounded search bias, observation-value scores, shadow-first rollout.

| Change | Direct or analogous | Paper reference | Proposal |
|---|---|---|---|
| Delayed graph aggregation architecture | **Analogous use** | Agg-GNN | RouteFold features should explicitly encode delayed/asynchronous graph state, not assume fresh global snapshots. |
| Temporal-logic constrained priors | **Analogous use** | LCRL | RouteFold should not propose skeletons that violate temporal obligations: progress, fallback, recharge-before-transmit, no unauthorized mode switch. |
| Barrier/shielded influence | **Analogous use** | Robust CBF safe RL; Shield synthesis | RouteFold output should be projected through a safety layer before influencing candidate order or skeleton injection. |
| Lower-tier suppression audit | **Analogous use** | Omission-regret discipline | Every RouteFold-biased selection must record whether Tier 2.9/4.x candidates were suppressed, merely reordered, or excluded. |
| Risk-calibrated prior confidence | **Direct application** | Conformal risk | RouteFold confidence should be calibrated as risk of harmful bias, not just predictive score. |

Minimum experiment:
- OOD topology and stale-state test: RouteFold with no shield, shielded RouteFold, and no RouteFold. Kill active influence if shielded RouteFold gives no gain or unsafe suppression.

## Tier 5.0: Multi-flow schedule, reservation, conflict, fairness, QoS

Current limitation focus: many flows, reservations, schedule certificates, fairness, AoI, conflict.

| Change | Direct or analogous | Paper reference | Proposal |
|---|---|---|---|
| AoI/AoII workload objectives | **Direct application** | EH AoI sensor; Multi-source EH AoI | Add freshness objectives to flow classes. Periodic sensing should optimize age/freshness, not just completion time. |
| Distributional freshness certificate | **Direct application** | Multi-source EH AoI; Conformal risk | Schedule certificates should report freshness distribution risk, not only average latency. |
| Physical-SINR schedule check | **Direct application** | Physical link scheduling; localized physical scheduling | Conflict graphs should be a fast filter; final schedule certificate should include physical-interference feasibility replay. |
| Proof-carrying schedule | **Analogous use** | Proof-carrying plans | `RouteSchedule50` should carry proof obligations for reservations, energy causality, fairness bound, and conflict constraints. |
| Goal-oriented scheduling | **Direct application** | Goal-oriented resource allocation | Allocate scarce schedule slots by utility gain and violation reduction, not only flow priority. |

Minimum experiment:
- Compare current scheduler, AoI scheduler, physical-SINR-certified scheduler, and proof-carrying scheduler under mixed alarm/periodic/bulk workloads.

## Tier 5.5: Bounded local probes and evidence reports

Current limitation focus: local opportunity evidence, explore tokens, replay-resistant report ingestion.

| Change | Direct or analogous | Paper reference | Proposal |
|---|---|---|---|
| Probe value by violation reduction | **Direct application** | Goal-oriented control | Probe actions should be priced by expected downstream violation reduction per energy/control cost. |
| Wireless probe-report calibration | **Direct application** | WFCP | Local reports should include reporting-channel calibration metadata, not just sensed values. |
| Robust report scoring | **Analogous use** | Byzantine FCP | Repeated local reports should be scored for malicious or inconsistent calibration behavior. |
| Probe shield | **Analogous use** | Shield synthesis | A shield should block probes that violate schedule reservation, energy budget, or trust policy. |
| Freshness-aware probe triggering | **Direct application** | EH AoI sensor | Trigger probes when expected age/uncertainty crosses a threshold, not at fixed intervals. |

Minimum experiment:
- Compare fixed probes, entropy probes, freshness threshold probes, and goal-oriented probes under limited probe budget.

## Tier 6.0: Gateway-approved node-tactical execution

Current limitation focus: bounded local execution inside signed tactical envelopes.

| Change | Direct or analogous | Paper reference | Proposal |
|---|---|---|---|
| Tactical shield in firmware/gateway boundary | **Analogous use** | Shield synthesis | Node tactical decisions should pass through a small shield enforcing no-loop, energy threshold, schedule compatibility, trust, and fallback rules. |
| Barrier projection for tactical choices | **Analogous use** | Robust CBF safe RL | If tactical choice uses learned/local scoring, project action onto a safe set before execution. |
| Temporal tactical obligations | **Analogous use** | LCRL | Tactical envelope should encode temporal obligations: if alternate chosen, eventually rejoin; if fallback activated, report; never transmit before energy precondition. |
| Proof-carrying tactical token | **Analogous use** | Proof-carrying plans | Tactical tokens should carry a compact proof of allowed alternate actions and resource bounds. |
| Adaptive tactical requirements | **Analogous use** | Changing-requirement RV | Tactical strictness should vary by regime and gateway health without restarting all monitors. |

Minimum experiment:
- Seed tactical deviations that look locally attractive but violate progress/fallback. Compare current validators vs shielded/proof-carrying tactical tokens.

## Tier 6.5: Cluster-tactical micro-coordination

Current limitation focus: bounded cluster relay/slot/band/fallback decisions.

| Change | Direct or analogous | Paper reference | Proposal |
|---|---|---|---|
| Cluster-local graph aggregation | **Analogous use** | Agg-GNN | Cluster scoring can use delayed local graph aggregation for relay/slot/band preferences, but only advisory. |
| Local physical-interference micro-scheduler | **Direct application** | Localized physical scheduling | Cluster micro-schedule feasibility should use localized physical-interference constraints, not only reservation membership. |
| Cluster proof envelope | **Analogous use** | Proof-carrying plans | `ClusterEnvelope65` should carry proof obligations over allowed cluster actions, no cluster-created global route, progress, and energy floor. |
| Cluster shield | **Analogous use** | Shield synthesis | A shield should block any cluster-local action outside the gateway-approved set. |
| Goal-oriented cluster decision | **Analogous use** | Goal-oriented resource allocation | Cluster decisions should optimize downstream route/schedule utility, not only local success probability. |

Minimum experiment:
- Compare cluster choices under local heuristic, GNN-advisory, physical-SINR-aware, and shielded/proof-carrying variants.

## Tier 7.0: Federated / multi-gateway and degraded continuity

Current limitation focus: gateway degradation, federation, handoff, trust, context exchange.

| Change | Direct or analogous | Paper reference | Proposal |
|---|---|---|---|
| Federated calibration over gateway links | **Direct application** | WFCP | Gateway federation should calibrate uncertainty through the actual inter-gateway reporting channel. |
| Byzantine gateway/node calibration | **Direct application** | Byzantine FCP | Add robust calibration and maliciousness scoring for federated context reports. |
| Adaptive degraded-mode monitors | **Analogous use** | Changing-requirement RV | Gateway-degraded mode should switch requirement automata while preserving monitor state. |
| Proof-carrying handoff plans | **Analogous use** | Proof-carrying plans | Handoff and continuity envelopes should carry proofs of authority transfer, fallback bounds, and ancestor-route preservation. |
| Goal-oriented context exchange | **Analogous use** | Goal-oriented control | Exchange context that most reduces route/handoff violation probability per byte, not all available context. |

Minimum experiment:
- Three-gateway replay with one malicious/stale gateway: compare naive federation, WFCP-calibrated federation, Byzantine-robust federation, and proof-carrying handoff.

## Tier 8.0: RF-cooperative hypergraph and whole-stack policy

Current limitation focus: RF cooperative actions, whole-stack policy, certificates, safety arbiter.

| Change | Direct or analogous | Paper reference | Proposal |
|---|---|---|---|
| Nonlinear RF-action effect vector | **Direct application** | Nonlinear RF EH; waveform nonlinear WPT | RF action certificates should include nonlinear harvester effect, waveform/action class, sensitivity threshold, saturation risk, and interference harm. |
| Hybrid relay hyperedges | **Direct application** | Hybrid relay WPC; hybrid relay time switching | Add hyperedge types where a relay transfers energy and information or time-switches harvest/forward behavior. |
| RF-action proof certificate | **Analogous use** | Proof-carrying plans | Every cooperative RF action should carry proof of allowed actor, intended effect, bounded harm, schedule compatibility, and fallback if effect fails. |
| RF-action shield | **Analogous use** | Shield synthesis | A safety arbiter should block cooperative RF actions whose predicted benefit relies on uncertified harvester/channel state. |
| Channel-harvester digital twin gate | **Analogous use** | MART-6G; Nonlinear RF EH | Limited-active RF actions should require channel+harvester twin agreement with HIL traces. |
| Whole-stack temporal policy constraints | **Analogous use** | LCRL | Whole-stack policies should satisfy temporal obligations: preserve lower-tier route candidates, do not emit uncertified RF action, eventually report realized effect. |

Minimum experiment:
- Evaluate one RF-action class, such as hybrid relay energy assist, under linear EH, nonlinear EH, channel-harvester twin, and HIL trace. Kill if benefit disappears under nonlinear/twin validation.

## Cross-Tier Changes

These should be implemented as shared infrastructure, not repeated separately in every tier.

| Shared change | Direct or analogous | Paper reference | Applies to |
|---|---|---|---|
| PC-FER: Proof-Carrying Freshness-Energy Routes | **Analogous use** | Proof-carrying plans + Conformal risk + EH AoI + Shield synthesis | 2.9, 4.4, 5.0, 6.0, 8.0 |
| Adaptive conformal risk bundles | **Direct application** | Adaptive conformal; Conformal risk | 2.9, 4.3, 4.6, 4.7, 7.0 |
| Proposal-authority split | **Analogous use** | Robust CBF safe RL; Shield synthesis | 4.7, 6.0, 6.5, 8.0 |
| Hardware/twin adjudication | **Analogous use** | MART-6G; Nonlinear RF EH | 4.5, 8.0 |
| Omission-regret reports | **Analogous use** | v5 governance pattern; shield/certificate discipline | all tiers after 2.9 |

## Prioritization

1. **Tier 2.9:** Add adaptive conformal risk fields to forecast bundles. This is the smallest high-leverage change.
2. **Tier 4.4:** Implement proof-carrying projection certificate prototype. This makes later tiers safer.
3. **Tier 5.0:** Add AoI/freshness workload objective and physical-SINR schedule replay.
4. **Tier 4.5:** Add nonlinear harvester profile registry and replay winner maps.
5. **Tier 4.6:** Replace uncertainty-only VOI with goal-oriented violation-reduction VOI.
6. **Tier 8.0:** Only after 4.5/4.4 gates exist, add one RF cooperative action class with nonlinear/twin certificate.

## Minimal Falsifiers

| Proposal family | Kill condition |
|---|---|
| Adaptive conformal risk | Does not reduce stale-state unsafe selections compared with current staleness inflation. |
| Proof-carrying routes/schedules | Proof overhead exceeds control budget or seeded invalid routes pass verification. |
| AoI/freshness scheduling | Freshness-aware scheduling does not improve critical update timeliness or worsens reliability/fairness beyond threshold. |
| Nonlinear harvester profiles | Winner maps do not change and measured HIL traces do not expose linear-model errors. |
| Goal-oriented VOI | Does not reduce route/schedule violations compared with entropy-only VOI. |
| Shields/barriers | Blocks too many valid candidates or permits seeded unsafe actions. |
| RF cooperative actions | Benefits vanish under nonlinear EH or channel-harvester twin validation. |

