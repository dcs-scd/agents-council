# IP-HOPE Tiers vs HOPE Review Limitations

Date: 2026-05-28

Scope: local artifacts under `/home/dstefanescu/other_systems/o4/hope`, starting at Tier 2.9. I checked the `docs/` subtree for each substantive tier directory. I did not treat archive, scratch, or worktree copies as separate conceptual tiers unless they exposed a distinct tier-level design.

## Baseline: limitations from the HOPE review

The review of `Allerton_2025_Sheikholeslami.pdf` identified these deployment limits in the original HOPE paper:

| ID | Limitation from review | Short form |
|---|---|---|
| L1 | Static network; known node positions; known interferer positions or average powers; average-interference outage bound depends on estimation accuracy. | Static/known interference map |
| L2 | No mobility, bursty jammers, time-varying channels, or adaptive adversaries. | Dynamics/adversaries absent |
| L3 | Short-term-buffer model; no useful long-horizon storage, duty cycling, queues, traffic scheduling, or finite-battery policy. | No temporal energy/scheduling policy |
| L4 | Stylized simulation: uniform random nodes/interferers, narrow baselines. | Narrow evaluation |
| L5 | No hardware measurements or nonlinear harvesting curves. | No hardware/nonlinear EH validation |
| L6 | No MAC contention, synchronization cost, or real control-plane airtime accounting. | MAC/control overhead absent |
| L7 | State acquisition is the main deployment gap: HOPE is simple after weights are known, but real systems must estimate and distribute interference and energy state. | State acquisition cost |

## Tier-by-tier assessment

### Tier 2.9: certified protocol families, forecasts, regimes, and real execution

Evidence checked:
- `/hope/ip_hope_tier2_9/docs/tier2_9/README.md`
- `/hope/ip_hope_tier2_9/docs/TIER_2_9_ARCHITECTURE.md`
- `/hope/ip_hope_tier2_9/docs/tier2_9/hope_vs_tier2_9.md`
- `/hope/ip_hope_tier2_9/docs/TIER_2_9_REGIME_SPECTRUM.md`
- `/hope/ip_hope_tier2_9/docs/TIER_2_9_PREDICTION_DEEP_DIVE.md`

Limitations addressed:
- L1: Directly addressed. Tier 2.9 turns HOPE from a single formula using fixed interference into a family-selector framework using `ForecastBundle`, delayed/stale CQI handling, bounded interference forecasts, and safe fallback when forecasts are stale or invalid.
- L3: Partly addressed. It adds synchronized, energy-gated, cascaded, time-aware, and receding-horizon protocol families. This moves beyond HOPE's single-shot short-term buffer abstraction, but it is not yet a full finite-battery or queueing-control solution.
- L4: Directly addressed at the methodology level. The regime spectrum and candidate/realized trace machinery broaden the evaluation beyond the original paper's narrow comparison.
- L7: Directly addressed as an architectural concern. Prediction boundaries, provenance fields, staleness inflation, and certified outputs make state quality explicit rather than assumed.

Residual limits:
- L2 is only partially represented by regimes and overlays; true mobility/adaptive jammer modeling is not yet central.
- L5 remains mostly planned or profile-based, not demonstrated physical RF hardware validation.
- L6 is not fully solved; Tier 2.9 has replanning and trace accounting, but not real MAC contention/synchronization modeling.

Bottom line: Tier 2.9 is the first serious lift from HOPE-as-formula to HOPE-as-protocol-family-system. It directly targets the review's largest gap: perfect state knowledge.

### Tier 3: multi-flow scheduling, security, and staleness-aware quantile prediction

Evidence checked:
- `/hope/ip_hope_tier3/README.md`
- `/hope/ip_hope_tier3/CLAUDE.md`

Limitations addressed:
- L1: Partly addressed through GRU/TCN quantile prediction and staleness inflation.
- L3: Partly addressed through multi-flow scheduling and WRR fairness.
- L6: Partly addressed because concurrent flow scheduling is a prerequisite for real contention handling.
- L7: Partly addressed through RouteToken control packets and state/history stores.

Residual limits:
- It still carries a simplified gateway-managed architecture and does not model a full MAC layer.
- It adds packet integrity and HMAC rotation, which is operationally important but not one of the original HOPE paper's core mathematical limitations.

Bottom line: Tier 3 addresses the "single-flow toy" weakness, but it is not yet the main hidden-path or real-RF tier.

### Tier 4.0: TERG hidden-path discovery

Evidence checked:
- `/hope/ip_hope_tier_4/docs/tier_4/README.md`
- `/hope/ip_hope_tier_4/docs/tier_4/evaluation.md`
- `/hope/ip_hope_tier_4/docs/ARCHITECTURE.md`
- `/hope/cube_updates/Tiers 4–4.4_adjust_from_the Tier 2.md`

Limitations addressed:
- L3: Directly addressed for time-dependent route feasibility. TERG lifts routing into `(node, slot, band)` and `(node, slot, band, mode)`, exposing routes that flat HOPE-like routing cannot see because they require waiting, band choice, or mode changes.
- L4: Directly addressed through hidden-path benchmarks and candidate/realized evaluation.
- L7: Partly addressed because TERG makes prediction and state dependence explicit in the search object.

Residual limits:
- A lifted route is not automatically executable. Tier 4 discovers better route candidates but does not by itself prove projection, repair, validation, and runtime certification.
- Hardware, MAC contention, and adaptive adversaries remain weak.

Bottom line: Tier 4 attacks a limitation my review did not emphasize strongly enough: HOPE's graph is too flat. Some feasible low-latency routes are invisible unless time, energy, band, and mode become state dimensions.

### Tier 4.1: role-based TERG, abstraction/concretization, RouteFold priors

Evidence checked:
- `/hope/ip_hope_tier4_1/docs/tier4_1/README.md`
- `/hope/ip_hope_tier4_1/docs/tier4_1/evaluation.md`

Limitations addressed:
- L3: Partly addressed by projection-aware TERG and concrete repair services.
- L4: Partly addressed by projection-regret artifacts and hidden-path benchmarks.
- L7: Partly addressed by RouteFold guidance and richer prediction heads.

Residual limits:
- This tier is more about system structure and learned search priors than direct physical realism.
- It does not resolve hardware, MAC, or adversarial dynamics by itself.

Bottom line: Tier 4.1 starts converting TERG from a search idea into an abstraction/concretization stack. It reduces the gap between "found in lifted space" and "usable by a gateway."

### Tier 4.2: beyond-TERG execution structures and projection layer

Evidence checked:
- `/hope/ip_hope_tier_4_2/docs/tier4_2/README.md`
- `/hope/ip_hope_tier_4_2/docs/tier4_2/architecture.md`
- `/hope/ip_hope_tier_4_2/docs/tier4_2/evaluation.md`

Limitations addressed:
- L3: Directly addressed for temporal and multi-mode route execution. Tier 4.2 adds route bundles, anypath, cluster continuations, spray-lite, coded multipath, and hierarchical planning.
- L4: Directly addressed through hidden-path, closed-loop, and candidate benchmark modes.
- L6: Partly addressed through execution structures that can express more realistic transmission alternatives, though still above the real MAC layer.
- L7: Partly addressed through projection-guidance confidence and strict validation.

Residual limits:
- The main unresolved issue is projection survival: abstract candidates can collapse, fail validation, or require repair.
- Nonlinear harvesting and true hardware validation remain mostly outside this tier.

Bottom line: Tier 4.2 addresses the review's "traffic scheduling and duty-cycling absent" criticism more than original HOPE does, but it creates a new correctness burden: executable projection.

### Tier 4.3: belief-aware and execution-certified TERG

Evidence checked:
- `/hope/ip_hope_tier4_3/Tier 4.3 system description.md`
- `/hope/ip_hope_tier4_3/docs/tier4_3/README.md`
- `/hope/ip_hope_tier4_3/docs/tier4_3/evaluation.md`

Limitations addressed:
- L1: Directly addressed. Tier 4.3 treats missing information and uncertainty as first-class planning objects via `BeliefBundle`.
- L7: Directly addressed. It adds observation action menus, observation budgets, value-of-information accounting, equal-information evaluation arms, and regret decomposition.
- L3: Partly addressed through execution certificates, fallback envelopes, and bounded local repairs.
- L4: Directly addressed through failure taxonomies, cross-tier matched slices, and candidate/realized records.

Residual limits:
- Belief-aware planning models state acquisition, but it still depends on simulated or configured observation channels unless tied to real RF measurement.
- Adaptive adversaries are not yet a full game-theoretic object.

Bottom line: Tier 4.3 is the strongest direct answer to my review's "state acquisition is the real deployment gap" claim. It stops pretending the network simply knows the HOPE weights.

### Tier 4.4: centralized projection runtime, certificates, ledgers, invalidation

Evidence checked:
- `/hope/ip_hope_tier_4_4/docs/tier_4_4_docs/part1_understanding/1.1_overview.md`
- `/hope/ip_hope_tier_4_4/docs/TIER_4_4_PREDICTION_DEEP_DIVE.md`
- `/hope/ip_hope_tier_4_4/iphope/gateway/routing/ancestor29/README.md`
- `/hope/cube_updates/Tiers 4–4.4_adjust_from_the Tier 2.md`

Limitations addressed:
- L4: Directly addressed through certificate ledgers, realized trace joins, and invalidation lifecycle.
- L6: Partly addressed because execution certification and install gates begin to account for runtime control surfaces.
- L7: Directly addressed at the authority/provenance layer: forecasts, projection certificates, execution certificates, and ancestor protocol coverage are explicit.

Residual limits:
- Tier 4.4 improves correctness discipline, not physical channel realism.
- It can prevent unsafe installs, but it does not by itself measure real RF harvesting curves or real MAC contention.

Bottom line: Tier 4.4 addresses a system-engineering limitation absent from the original HOPE paper: an optimizer is not deployable unless candidates are certified, installed, invalidated, and joined to realized outcomes.

### Tier 4.5: scalable lifted search with hardware profile and HIL calibration hooks

Evidence checked:
- `/hope/ip_hope_tier_4_5/docs/part1_understanding/1.1_system_overview.md`
- `/hope/ip_hope_tier_4_5/docs/part2_architecture/2.1_high_level_architecture.md`
- `/hope/ip_hope_tier_4_5/docs/part5_infrastructure/5.1_infra_architecture.md`
- `/hope/ip_hope_tier_4_5/iphope/gateway/routing/terg45/README.md`
- `/hope/cube_updates/Adjustments_for_4_5_4_7.md`

Limitations addressed:
- L4: Directly addressed through a staged search/projection/certification/realization evaluation program.
- L5: Partly addressed. Tier 4.5 introduces hardware profiles, calibration residuals, and HIL smoke gates.
- L7: Partly addressed through equal-information snapshots and search certificates.

Residual limits:
- HIL calibration hooks are not the same as broad hardware validation under nonlinear harvester behavior.
- It is still a gateway/runtime search tier, not a physical-layer measurement paper.

Bottom line: Tier 4.5 is the first tier that materially points at my "no hardware measurements" criticism, but the evidence is calibration-gate architecture rather than final empirical proof.

### Tier 4.6: active observation and belief control

Evidence checked:
- `/hope/ip_hope_tier_4_6/docs/system_docs/part1_understanding/1.1_system_overview.md`
- `/hope/ip_hope_tier_4_6/docs/proposals/tier46-active-observation-belief-control.md`
- `/hope/ip_hope_tier_4_6/docs/implementation/ip-hope-tier46-belief-control/implementation-plan.md`

Limitations addressed:
- L1: Directly addressed via active observation and posterior belief updates.
- L7: Directly addressed. Observation actions, value-of-information, evidence certificates, and belief digests turn state acquisition into a controlled resource.
- L6: Partly addressed by accounting for observation budget and control decisions.
- L4: Partly addressed through evidence joins and accepted gates.

Residual limits:
- The tier is explicitly constrained: it cannot directly install routes or mint route authority. It improves information control, not route authority itself.
- It does not solve true adversarial sensing or physical MAC collisions.

Bottom line: Tier 4.6 deepens Tier 4.3's answer to the state-acquisition problem: the system can choose to observe, wait, route now, or fail closed.

### Tier 4.7: RouteFold-HOPE learned route-structure prior

Evidence checked:
- `/hope/ip_hope_tier_4_7/docs/part1_understanding/1.1_system_overview.md`
- `/hope/ip_hope_tier_4_7/docs/part2_architecture/2.1_high_level_architecture.md`
- `/hope/cube_updates/Adjustments_for_4_5_4_7.md`

Limitations addressed:
- L1: Partly addressed by learning route-structure priors over upstream planning snapshots, belief state, projection history, and route-health telemetry.
- L3: Partly addressed by biasing bounded search toward plausible route skeletons and transitions.
- L4: Partly addressed through shadow-first, ledgered influence and evaluation of RouteFold guidance modes.
- L7: Partly addressed through observation-value scores and auditable bias bundles.

Residual limits:
- RouteFold is advisory and default-off. That is correct for safety, but it means this tier does not directly solve a physical limitation unless later gates show realized improvement.
- It can introduce new model risk: OOD priors and learned bias may hide lower-tier winners unless ancestor coverage is enforced.

Bottom line: Tier 4.7 attacks search efficiency and structural prior quality, not the physical HOPE assumptions directly. It is useful only if it remains certificate-bounded and lower-tier-compatible.

### Tier 5.0: multi-flow schedule, reservation, conflict, fairness, QoS

Evidence checked:
- `/hope/ip_hope_tier_5/docs/part1_understanding/1.1_system_overview.md`
- `/hope/ip_hope_tier_5/docs/MDOC_TIER50_ARCHITECTURE.md`
- `/hope/cube_updates/tier_5_and_tier_5_5_adjust.md`

Limitations addressed:
- L3: Directly addressed. Tier 5 turns route choice into certified multi-flow scheduling with flow classes, reservations, conflict graphs, fairness, AoI, and progress joins.
- L6: Directly addressed at the scheduling/resource-conflict level. It is the main answer to the review's missing traffic scheduling and contention criticism, although it is still not a full standards-level MAC model.
- L4: Directly addressed by reframing evaluation as a multi-flow schedule cube rather than a protocol-family cube.
- L7: Partly addressed through schedule certificates and ledgers.

Residual limits:
- It models gateway-owned scheduling, not necessarily carrier-sense collision behavior, hidden terminals, synchronization drift, or real link-layer airtime.
- Hardware/nonlinear EH remains inherited, not solved here.

Bottom line: Tier 5 is the strongest answer to the review's "no traffic scheduling / queueing / MAC contention" criticism.

### Tier 5.5: bounded local probes and evidence reports

Evidence checked:
- `/hope/ip_hope_tier_5_5/docs/system_documentation/part1_understanding/1.1_system_overview.md`
- `/hope/cube_updates/tier_5_and_tier_5_5_adjust.md`

Limitations addressed:
- L1: Partly addressed through gateway-authorized local probes that gather opportunity evidence.
- L7: Directly addressed as a local-evidence acquisition layer: explore tokens, replay-resistant report ingestion, and downstream belief/route-health updates.
- L6: Partly addressed by making probe energy, airtime, trust, and schedule cost explicit.

Residual limits:
- Tier 5.5 deliberately does not allow local rerouting. It improves evidence quality, not autonomous routing.
- It still depends on certificate and schedule context from earlier tiers.

Bottom line: Tier 5.5 addresses the "how do we know the weights locally?" gap without letting nodes invent routes. This is a disciplined state-acquisition extension.

### Tier 6.0: gateway-approved node-tactical execution

Evidence checked:
- `/hope/ip_hope_tier_6/docs/tier6/overview.md`
- `/hope/ip_hope_tier_6/docs/mdoc/tier6_architecture.md`
- `/hope/ip_hope_tier_6/docs/tier6/tactical_envelope_certificates.md`
- `/hope/cube_updates/Adjustments_tier6_6_5.md`

Limitations addressed:
- L2: Partly addressed. Tactical envelopes let nodes react locally inside bounded authority, which is necessary under time variation.
- L3: Partly addressed through approved alternates, fallback, and local tactical decisions.
- L6: Partly addressed through token/report/cancel/refresh protocol messages and schedule compatibility guards.
- L7: Partly addressed through deviation reports and audit decisions.

Residual limits:
- It is not decentralized learning or unrestricted mesh routing. That is a safety choice, but it limits adaptation to rapidly changing or adversarial environments.
- It does not itself provide physical RF validation.

Bottom line: Tier 6 tackles a gap introduced by strict gateway control: in a changing channel, waiting for the gateway can be too slow. It allows local tactical flexibility without giving up route-version authority.

### Tier 6.5: cluster-tactical micro-coordination

Evidence checked:
- `/hope/ip_hope_tier_6_5/docs/part1_understanding/1.1_system_overview.md`
- `/hope/ip_hope_tier_6_5/docs/implementation/tier65-cluster-tactical/implementation-plan.md`
- `/hope/cube_updates/Adjustments_tier6_6_5.md`

Limitations addressed:
- L2: Partly addressed through small-cluster decisions over relay choice, slot choice, band choice, and fallback.
- L3: Partly addressed by cluster envelopes and micro-scheduling inside existing reservations.
- L6: Partly addressed because local coordination can reduce centralized contention and recovery latency.
- L7: Partly addressed via cluster reports, tokens, and certificates.

Residual limits:
- The plan explicitly excludes unrestricted mesh routing, cluster-created global routes, decentralized learning, full multi-gateway federation, and cooperative energy beacons.
- It is a bounded continuity layer, not a full distributed protocol.

Bottom line: Tier 6.5 extends Tier 6 from single-node tactical deviations to bounded local coordination. It addresses dynamic execution fragility, but intentionally avoids unbounded autonomy.

### Tier 7.0: federated / multi-gateway and degraded continuity

Evidence checked:
- `/hope/ip_hope_tier_7/docs/implementation/tier70-federated-gateway/implementation-plan.md`
- `/hope/ip_hope_tier_7/docs/implementation/tier70-federated-degraded/implementation-plan.md`
- `/hope/cube_updates/Adjustments_tier7.md`

Limitations addressed:
- L2: Partly addressed for gateway degradation, partial reachability, and multi-gateway conditions.
- L3: Partly addressed through continuity and handoff mechanisms when the primary gateway is degraded.
- L4: Directly addressed through a federated authority/degraded continuity evaluation program.
- L7: Directly addressed at the inter-gateway authority and context-exchange layer.

Residual limits:
- This is not a physical RF or MAC tier. It solves authority continuity and federation, not fading statistics or harvester physics.
- Real transport links are abstracted; no real network deployment is gated by the inspected plan.

Bottom line: Tier 7 addresses a limitation outside the original HOPE model: single-gateway authority is a fragile assumption. It is most relevant for disaster recovery or contested deployments.

### Tier 8.0: RF-cooperative hypergraph and whole-stack policy

Evidence checked:
- `/hope/ip_hope_tier_8/docs/tier8/overview.md`
- `/hope/ip_hope_tier_8/implementation-plan.md`
- `/hope/cube_updates/Adjustments_tier8.md`

Limitations addressed:
- L2: Partly addressed by representing cooperative RF actions and whole-stack effects, including hostile or stressed regimes if evaluated.
- L3: Partly addressed by considering RF actions whose effects include information delivery, energy harvesting, interference, route health, schedule impact, tactical side effects, cluster side effects, and federation side effects.
- L5: Partly addressed in principle because RF action certificates and HIL gates are required before limited active deployment.
- L6: Partly addressed through whole-stack policy and safety arbitration.
- L7: Partly addressed through certificate stacks and policy decisions over lower-tier route substrates.

Residual limits:
- Tier 8 is high-risk because it co-optimizes many layers. The inspected plan correctly forbids uncertified helpers, unbounded RF beacons, black-box authority, validator mutation, and learned-policy execution authority.
- It remains an evaluation/design program unless backed by real RF/HIL evidence.

Bottom line: Tier 8 is the broadest answer to the review: it tries to exploit the same dual nature of interference that HOPE identified, but at the RF-action and whole-stack policy level. It is also where safety discipline matters most.

## Coverage matrix

Legend: `D` = directly addressed, `P` = partly addressed, `N` = not materially addressed by that tier, `S` = safety/evaluation scaffold rather than physical proof.

| Tier | L1 static/known state | L2 dynamics/adversaries | L3 energy/scheduling | L4 evaluation breadth | L5 hardware/nonlinear EH | L6 MAC/control overhead | L7 state acquisition |
|---|---|---|---|---|---|---|---|
| 2.9 | D | P | P | D | S | P | D |
| 3 | P | N | P | P | S | P | P |
| 4.0 | P | N | D | D | N | P | P |
| 4.1 | P | N | P | P | N | P | P |
| 4.2 | P | P | D | D | S | P | P |
| 4.3 | D | P | P | D | S | P | D |
| 4.4 | P | P | P | D | S | P | D |
| 4.5 | P | P | P | D | P/S | P | P |
| 4.6 | D | P | P | P | S | P | D |
| 4.7 | P | P | P | P | N | P | P |
| 5.0 | P | P | D | D | S | D | P |
| 5.5 | P | P | P | P | S | P | D |
| 6.0 | P | P | P | P | S | P | P |
| 6.5 | P | P | P | P | S | P | P |
| 7.0 | P | P | P | D | N | P | D |
| 8.0 | P | P | P | D | P/S | P | P |

## Comparison against my review

My review was accurate about the original HOPE paper, but incomplete as a roadmap for IP-HOPE. It framed the missing work mainly as physical and protocol realism:

- imperfect interference maps;
- nonlinear harvesters;
- finite buffers;
- mobility;
- MAC overhead;
- adversaries.

The tier artifacts show that IP-HOPE addresses those limits through a broader stack:

1. Tier 2.9 addresses imperfect state by replacing a single HOPE rule with certified protocol families, forecast bounds, staleness handling, regimes, and realized traces.
2. Tiers 4.0-4.4 address hidden route geometry and execution correctness: the route search space is lifted, then projected, repaired, certified, invalidated, and joined to outcomes.
3. Tiers 4.3-4.6 address state acquisition as a control problem: observe, wait, route, or fail closed under belief and value-of-information constraints.
4. Tiers 5.0-5.5 address the operational fact that real networks have multiple flows and local evidence acquisition.
5. Tiers 6.0-6.5 address bounded local and cluster-level reaction when centralized routing is too slow.
6. Tier 7 addresses multi-gateway authority and degraded gateway continuity.
7. Tier 8 generalizes HOPE's sign-aware interference insight into cooperative RF actions and whole-stack policy, but only under strict certificate and HIL gates.

The most important mismatch: the review's limitations are mostly paper-model limitations; the IP-HOPE tiers are systemization layers. A tier can address a limitation architecturally without proving it empirically. For example, Tier 4.5 and Tier 8 add hardware/HIL gates, but that is not equivalent to a published physical validation across nonlinear harvesters and real RF environments.

## Remaining gaps after all inspected tiers

1. Hardware proof remains thin relative to the ambition. Several tiers introduce hardware profiles, calibration IDs, HIL gates, and RF action certificates, but the inspected documents do not establish broad real-world RF-harvester validation.
2. MAC realism remains partial. Tier 5 makes scheduling and conflict explicit, but real collision domains, synchronization drift, carrier-sense behavior, retransmission policy, and link-layer airtime are not fully modeled in the reviewed docs.
3. Adaptive adversaries remain mostly stress conditions, not a complete adversarial control problem.
4. Mobility and topology churn are addressed indirectly through belief, observation, tactical envelopes, clusters, and federation, but not as a first-class mobility model with field evidence.
5. Analytical clarity is traded for stack complexity. Original HOPE is clean because it reduces to shortest path under strong assumptions. IP-HOPE removes assumptions by adding forecasts, lifted search, projection, certificates, schedules, probes, tactical envelopes, federation, and RF hypergraphs. That is necessary for realism, but each layer needs independent validation to avoid looking better only because lower-tier winners were omitted or unsafe candidates were silently filtered.

## Overall judgment

Starting with Tier 2.9, the IP-HOPE tiers address most limitations identified in the review, but not all at the same level of maturity.

The strongest addressed limits are:
- static/known interference state: Tiers 2.9, 4.3, 4.6, 5.5;
- hidden time/band/mode route structure: Tiers 4.0-4.2;
- state-acquisition cost: Tiers 4.3, 4.6, 5.5, 7;
- multi-flow scheduling and contention abstraction: Tier 5;
- execution safety: Tiers 4.4-6.5;
- whole-stack RF cooperation: Tier 8.

The weakest remaining limits are:
- physical hardware/nonlinear harvester evidence;
- real MAC-layer behavior;
- mobility as a measured condition;
- adaptive adversaries as strategic opponents rather than overlays;
- end-to-end empirical proof that the full stack outperforms lower-tier baselines without selection bias.

So the honest assessment is: the IP-HOPE tier program is much more ambitious and covers the right missing dimensions, but the reviewed tier documents are a system roadmap plus many implementation/evaluation scaffolds, not a completed empirical refutation of all HOPE limitations.
