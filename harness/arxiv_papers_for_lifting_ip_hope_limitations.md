# ArXiv Papers Applicable to Lifting IP-HOPE / HOPE Limitations

Date: 2026-05-28

Purpose: identify arXiv papers with ideas that can help lift the limitations summarized in `ip_hope_tiers_vs_hope_review_limitations.md`.

Assessment limitation IDs:

| ID | Limitation |
|---|---|
| L1 | Static/known interference and energy state |
| L2 | Mobility, burstiness, time-varying channels, adaptive adversaries |
| L3 | No finite-battery, queueing, traffic scheduling, or long-horizon energy policy |
| L4 | Narrow/stylized simulation and weak evaluation breadth |
| L5 | No hardware/nonlinear RF-energy-harvester validation |
| L6 | Missing MAC/control-plane contention and synchronization cost |
| L7 | State acquisition, uncertainty, trust, and distribution cost |

## Highest-value papers

### 1. Nonlinear RF harvesting and hardware calibration

These are the most important papers for lifting L5. IP-HOPE should not keep treating harvested energy as a simple linear function of received RF power.

| Paper | Link | Relevant limitations | Applicable idea |
|---|---|---|---|
| Panos N. Alevizos, Aggelos Bletsas, **Sensitive and Nonlinear Far Field RF Energy Harvesting in Wireless Communications** | https://arxiv.org/abs/1707.07041 | L5, L1 | Use piecewise nonlinear harvester curves with sensitivity and saturation. This gives Tier 4.5 / Tier 8 a better `hardware_profile` model than linear EH. |
| Panos N. Alevizos, Georgios Vougioukas, Aggelos Bletsas, **Nonlinear Energy Harvesting Models in Wireless Information and Power Transfer** | https://arxiv.org/abs/1802.09994 | L5, L6 | Treat SWIPT/EH success probability under multiple practical harvester models. Useful for turning Tier 8 RF-action certificates into model-specific certificates. |
| Ruihong Jiang, **RF-based Energy Harvesting: Nonlinear Models, Applications and Challenges** | https://arxiv.org/abs/2405.04976 | L5 | Survey-level map of nonlinear EH models and how AI methods are used with them. Useful as the design checklist for Tier 4.5 HIL and Tier 8 RF-action gates. |
| Lukas Schulthess, Federico Villani, Philipp Mayer, Michele Magno, **RF Power Transmission for Self-sustaining Miniaturized IoT Devices** | https://arxiv.org/abs/2407.21455 | L5, L3 | Experimental RF WPT subsystem with storage and power management. Useful for replacing abstract "HIL gate" language with concrete rectifier/storage measurements. |
| Bruno Clerckx, Ekaterina Bayguzina, David Yates, Paul D. Mitcheson, **Waveform Optimization for Wireless Power Transfer with Nonlinear Energy Harvester Modeling** | https://arxiv.org/abs/1506.08879 | L5, L8-style RF cooperation | Shows waveform design changes harvested DC power under nonlinear EH. Applicable to Tier 8 cooperative RF actions and RF-action certificate scoring. |

How to use:
- Add harvester model family as a first-class axis in Tier 4.5 / 8 evaluation: `linear`, `sensitivity_limited`, `saturation_limited`, `piecewise_measured`, `rectifier_profile_id`.
- Require RF-action certificates to bind to a measured or literature-calibrated harvester profile.
- Report failure when a route only wins under the linear harvester abstraction.

### 2. Finite-battery, long-horizon energy policy, and energy-aware routing

These papers address L3: HOPE's short-term-buffer model leaves too much performance on the floor.

| Paper | Link | Relevant limitations | Applicable idea |
|---|---|---|---|
| Wen Zhang et al., **Energy Harvesting Aware Multi-hop Routing Policy in Distributed IoT System Based on Multi-agent Reinforcement Learning** | https://arxiv.org/abs/2203.11313 | L3, L2, L7 | Joint routing and energy allocation via multi-agent RL for intermittent EH IoT. Good substrate for Tier 6 / 6.5 bounded local policy, but should remain certificate-bounded. |
| Abdulmajid Murad et al., **Autonomous Management of Energy-Harvesting IoT Nodes Using Deep Reinforcement Learning** | https://arxiv.org/abs/1905.04181 | L3, L2 | Learns node management policies under non-stationary EH and resource constraints. Useful for node-local duty-cycle and energy-state policy proposals. |
| Parham Soltani et al., **Energy-Efficient Routing Algorithm for Wireless Sensor Networks: A Multi-Agent Reinforcement Learning Approach** | https://arxiv.org/abs/2508.14679 | L3, L2 | Uses local residual energy / hop / hotspot state for adaptive routing. Useful for Tier 6.5 cluster tactical scoring, with the caveat that IP-HOPE should not let MARL authorize routes. |
| Ozgur Ozel et al., **Energy Harvesting Wireless Communications: A Review of Recent Advances** | https://arxiv.org/abs/1501.06026 | L3, L6 | Broad review of scheduling, resource allocation, medium access, and networking under EH. Useful to audit whether Tier 5 scheduling covers known EH networking cases. |

How to use:
- Add finite battery and storage dynamics to the Tier 5 schedule cube.
- Use RL policies only as proposal generators or shadow baselines unless certified.
- Add `energy_storage_capacity`, `leakage`, `duty_cycle_policy`, and `queue_state` to candidate and realized-trace records.

### 3. MAC/control-plane contention and physical interference scheduling

These papers help lift L6. They are not exact HOPE replacements, but they supply the missing layer between route selection and actual simultaneous wireless operation.

| Paper | Link | Relevant limitations | Applicable idea |
|---|---|---|---|
| Shuai Fan, Lin Zhang, Yong Ren, **Approximation Algorithms for Link Scheduling with Physical Interference Model in Wireless Multi-hop Networks** | https://arxiv.org/abs/0910.5215 | L6, L4 | Link scheduling under physical SINR interference instead of a simplistic collision model. Useful for Tier 5 conflict-graph and schedule-certificate feasibility. |
| Peng-Jun Wan et al. style area, **Throughput Optimizing Localized Link Scheduling for Multihop Wireless Networks Under Physical Interference Model** | https://arxiv.org/abs/1301.4738 | L6, L4 | Localized scheduling under physical interference. Useful if Tier 5 wants a decentralized or local certificate approximation. |
| Xiao Lu et al., **Wireless Networks with RF Energy Harvesting: A Contemporary Survey** | https://arxiv.org/abs/1406.6470 | L5, L6 | RF-EH network survey covering architecture, circuits, protocols, and network types. Useful as a cross-layer checklist for Tier 5/8 evaluation axes. |

How to use:
- Add physical-SINR schedule feasibility to `ScheduleCertificate50`.
- Keep graph conflict models as fast filters, but require physical-interference replay for claims.
- Add control airtime and synchronization budget to candidate cost, not only data airtime.

### 4. State acquisition, uncertainty, conformal prediction, and trust

These are the most relevant papers for L1 and L7. IP-HOPE already has forecast bundles and belief bundles; these papers suggest stronger calibration and trust machinery.

| Paper | Link | Relevant limitations | Applicable idea |
|---|---|---|---|
| Meiyi Zhu et al., **Federated Inference with Reliable Uncertainty Quantification over Wireless Channels via Conformal Prediction** | https://arxiv.org/abs/2308.04237 | L7, L1, Tier 7 | Conformal reliability over noisy wireless reporting channels. Useful for calibrating distributed CQI/energy reports without assuming perfect telemetry. |
| Vincent Plassier et al., **Probabilistic Conformal Prediction with Approximate Conditional Validity** | https://arxiv.org/abs/2407.01794 | L7, L1 | Approximate conditional validity under heteroscedasticity. Useful because RF prediction errors vary by node, band, regime, and topology. |
| Victor Chernozhukov, Kaspar Wuthrich, Yinchu Zhu, **Distributional Conformal Prediction** | https://arxiv.org/abs/1909.07889 | L7, L1 | Distribution-aware conformal intervals. Useful for forecast bundles where quantile shape matters, not just residual size. |
| **Certifiably Byzantine-Robust Federated Conformal Prediction** | https://arxiv.org/abs/2406.01960 | L2, L7, Tier 7 | Robust calibration when some clients are malicious. Applicable to adversarial state reports, compromised nodes, and federated gateway trust. |

How to use:
- Make each `ForecastBundle` / `BeliefBundle` carry coverage evidence by regime, node class, band, and staleness bucket.
- Add adversarial or Byzantine telemetry overlays to Tier 4.6 / 7.
- Treat conformal intervals as route-certification inputs, not display-only diagnostics.

### 5. Belief-state planning and active observation

These papers are conceptually relevant to Tier 4.3 / 4.6. They are not RF-EH papers, but they directly address partial observability and observation/action coupling.

| Paper | Link | Relevant limitations | Applicable idea |
|---|---|---|---|
| Gregory F. Stock et al., **POMDP-Based Routing for DTNs with Partial Knowledge and Dependent Failures** | https://arxiv.org/abs/2511.20241 | L2, L7 | POMDP routing when nodes operate with partial network knowledge and correlated failures. Useful model for degraded/federated Tier 7 routing. |
| Robert J. Moss et al., **BetaZero: Belief-State Planning for Long-Horizon POMDPs using Learned Approximations** | https://arxiv.org/abs/2306.00249 | L3, L7 | Combines online search with learned policy/value approximations for long-horizon POMDPs. Applicable to Tier 4.6 observation planning if bounded by certificates. |
| Xiaoyu Chen et al., **Flow-based Recurrent Belief State Learning for POMDPs** | https://arxiv.org/abs/2205.11051 | L1, L7 | Learns flexible continuous belief states. Useful for representing multimodal channel/energy uncertainty rather than one Gaussian-like estimate. |

How to use:
- Treat Tier 4.6 `observe / wait / route_now / fail_closed` as a bounded POMDP action set.
- Use learned belief planners in shadow mode first.
- Require every learned observation policy to output a certifiable value-of-information decomposition.

### 6. Dynamic routing, queueing, and route priors

These papers help with L2/L3 and support RouteFold-like components.

| Paper | Link | Relevant limitations | Applicable idea |
|---|---|---|---|
| Victoria Manfredi et al., **Relational Deep Reinforcement Learning for Routing in Wireless Networks** | https://arxiv.org/abs/2012.15700 | L2, L3, L6 | Packet-centric RL with relational features and wait actions; generalizes across traffic, congestion, topology, and link dynamics. Useful for Tier 5 scheduling and Tier 6 tactical proposals. |
| Zhiyang Wang, Mark Eisen, Alejandro Ribeiro, **Learning Decentralized Wireless Resource Allocations with Graph Neural Networks** | https://arxiv.org/abs/2107.01489 | L2, L7, Tier 4.7 | GNNs using delayed/asynchronous local graph state for decentralized resource allocation. Directly relevant to RouteFold-style local route priors. |
| Yang Lu et al., **Graph Neural Networks for Wireless Networks: Graph Representation, Architecture and Evaluation** | https://arxiv.org/abs/2404.11858 | L4, L7, Tier 4.7 | Survey of wireless graph representations and evaluation. Good design reference for RouteFold feature bundles and evaluation metrics. |
| Romina Garcia Camargo et al., **Graph Neural Networks in Large Scale Wireless Communication Networks: Scalability Across Random Geometric Graphs** | https://arxiv.org/abs/2510.00896 | L4, L7, Tier 4.7 | Transferability/scalability of GNN policies over sparse random geometric graphs. Useful for validating whether RouteFold trained on small topologies can transfer. |

How to use:
- Add packet/flow-centric decision traces to Tier 5 realized records.
- Use GNN/RouteFold only for candidate ranking, skeleton proposals, and bounded search bias unless certified.
- Evaluate transfer across topology families, not just seeds from one graph generator.

### 7. Cooperative RF actions and RF hypergraph planning

These are the most relevant papers for Tier 8. They lift HOPE's "interference can be useful energy" idea into cooperative RF behavior.

| Paper | Link | Relevant limitations | Applicable idea |
|---|---|---|---|
| He Chen et al., **Wireless-Powered Cooperative Communications via a Hybrid Relay** | https://arxiv.org/abs/1408.4841 | L3, L5, Tier 8 | A relay both forwards information and transfers energy. Useful as a concrete primitive for Tier 8 RF cooperative hyperedges. |
| He Chen et al., **Cooperative Strategies for Wireless-Powered Communications: An Overview** | https://arxiv.org/abs/1610.03527 | L3, L8-style cooperation | Survey of relaying, spectrum sharing, and jamming in wireless-powered communications. Useful taxonomy for Tier 8 RF action classes. |
| Ali Arshad Nasir et al., **Wireless-Powered Relays in Cooperative Communications: Time-Switching Relaying Protocols and Throughput Analysis** | https://arxiv.org/abs/1310.7648 | L3, L6, Tier 8 | Online switching between energy harvesting and information transmission at relays. Directly maps to Tier 8 action timing and certificate constraints. |
| Konstantinos Ntontin et al., **Autonomous Reconfigurable Intelligent Surfaces Through Wireless Energy Harvesting** | https://arxiv.org/abs/2105.00163 | L5, L8-style RF cooperation | RIS powered by harvested information signals. Relevant if Tier 8 considers passive RF-shaping elements or environment-level RF actions. |

How to use:
- Add RF action classes: `relay_energy_transfer`, `time_switch_eh_it`, `cooperative_jamming_shadow`, `ris_reflect_harvest`, `wpt_assist`.
- Every RF action needs an effect vector: information gain, harvested energy, interference cost, schedule cost, trust risk, and hardware profile.
- Require omission-regret checks so Tier 8 does not beat lower tiers by deleting hard baselines.

### 8. Digital twins and hardware-informed evaluation breadth

These papers help with L4/L5: the assessment says IP-HOPE has many evaluation scaffolds, but still needs physical realism and broad validation.

| Paper | Link | Relevant limitations | Applicable idea |
|---|---|---|---|
| Alaa Awad Abdellatif et al., **RIoT Digital Twin: Modeling, Deployment, and Optimization of Reconfigurable IoT System with Optical-Radio Wireless Integration** | https://arxiv.org/abs/2511.09303 | L4, L5, L6 | NS-3 digital twin incorporating RF/optical communication, energy harvesting/consumption, and hardware power measurements. Useful template for IP-HOPE's evaluation stack. |
| Zehui Xiong et al., **Deep Generative Model and Its Applications in Efficient Wireless Network Management: A Tutorial** | https://arxiv.org/abs/2303.17114 | L2, L4 | Generative models for wireless network management under mobility, data scarcity, and changing topology. Useful for synthetic stress generation, not for route authority. |

How to use:
- Turn Tier 4.5/8 HIL from a pass/fail smoke test into calibration data for a digital twin.
- Generate stress scenarios with explicit provenance, then validate conclusions against real/hardware traces where possible.
- Separate "simulation-only winner" from "hardware-consistent winner."

### 9. Federated, multi-gateway, and degraded authority

These papers are relevant to Tier 7. They are less RF-specific, but useful for authority, failover, and routing under partial information.

| Paper | Link | Relevant limitations | Applicable idea |
|---|---|---|---|
| Matthieu Boutier, Juliusz Chroboczek, **Source-Specific Routing** | https://arxiv.org/abs/1403.0445 | L2, L7, Tier 7 | Practical dynamic routing for multihoming. Useful analogy for gateway federation and route choice under multiple authority domains. |
| Gregory F. Stock et al., **POMDP-Based Routing for DTNs with Partial Knowledge and Dependent Failures** | https://arxiv.org/abs/2511.20241 | L2, L7, Tier 7 | Best fit for degraded/partitioned routing with partial knowledge and correlated failures. |
| **Certifiably Byzantine-Robust Federated Conformal Prediction** | https://arxiv.org/abs/2406.01960 | L2, L7, Tier 7 | Helps protect federated calibration and route-state claims from malicious or faulty reporters. |

How to use:
- Add `gateway_health_state`, `context_quality`, `trust_certificate`, and `handoff_kind` as Tier 7 evaluation axes.
- Track omission regret against Tier 2.9 ancestor protocols.
- Do not treat federation as a new route protocol row; evaluate it as authority + continuity + trust over lower-tier routes.

## Recommended IP-HOPE research backlog

1. **Nonlinear harvester integration**  
   Implement measured/piecewise nonlinear EH profiles in Tier 4.5 and Tier 8. Re-run Tier 2.9 / 4.x / 8 winner maps under linear vs nonlinear profiles.

2. **Physical-SINR schedule certification**  
   Extend Tier 5 schedule certificates with physical interference feasibility, not only graph conflict constraints.

3. **Conformal forecast bundles**  
   Add conditional/conformal calibration fields to `ForecastBundle`, `HarvestForecastBundle`, and `BeliefBundle`: coverage target, empirical coverage, calibration split, staleness bucket, regime, and node/band class.

4. **Bounded POMDP observation planner**  
   Treat Tier 4.6 as a small action POMDP: `route_now`, `observe`, `wait`, `fail_closed`. Keep learned planners shadow-only until value-of-information certificates survive replay.

5. **RouteFold transfer test**  
   Evaluate RouteFold/GNN priors across topology families and network sizes. Do not accept improvements only on the training graph distribution.

6. **Hardware-calibrated digital twin**  
   Build an NS-3 or equivalent digital twin seeded by actual RF harvester measurements, not just parametric simulation.

7. **Adversarial telemetry overlays**  
   Add Byzantine/stale/malicious state reports to Tier 4.6 and Tier 7. Use robust conformal prediction and trust certificates to separate uncertainty from attack.

8. **RF-action certificate taxonomy**  
   For Tier 8, define RF hyperedges from cooperative WPC papers: relay energy transfer, EH/IT time switching, cooperative jamming, RIS reflect/harvest, and WPT assist. Each must carry a multi-effect vector and hardware profile.

## Strongest near-term matches by tier

| Tier | Best paper matches |
|---|---|
| Tier 2.9 | Zhu 2023 WFCP; Chernozhukov 2019 DCP; Fan 2009 physical interference scheduling |
| Tier 4.3 / 4.6 | Stock 2025 POMDP routing; BetaZero 2023; FORBES 2022; Byzantine-robust FCP 2024 |
| Tier 4.5 | Alevizos 2017/2018; Jiang 2024; Schulthess 2024; RIoT Digital Twin 2025 |
| Tier 4.7 | Wang/Eisen/Ribeiro 2021 Agg-GNN; Lu 2024 GNN survey; Camargo/Ribeiro 2025 scalability |
| Tier 5 | Fan 2009; Ozel 2015 EH review; Manfredi 2020 relational DRL routing |
| Tier 6 / 6.5 | Zhang 2022 MARL EH routing; Murad 2019 EH IoT node management; Soltani 2025 MARL WSN routing |
| Tier 7 | Source-Specific Routing 2015; Stock 2025 POMDP DTN; Byzantine-robust FCP 2024 |
| Tier 8 | Chen 2014 hybrid relay; Chen 2016 cooperative WPC overview; Nasir 2013 wireless-powered relays; Ntontin 2021 autonomous RIS |

## Critical caution

Several papers above are learning-heavy. They should not be imported into IP-HOPE as authority mechanisms. The right use is:

```text
learned model -> candidate / prior / uncertainty / observation value
certificate + replay + ancestor coverage -> route authority
```

That preserves the main virtue of the IP-HOPE tiers: increasing realism without letting an opaque model silently bypass lower-tier safe winners.
