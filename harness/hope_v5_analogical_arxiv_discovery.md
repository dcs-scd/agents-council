# HOPE / IP-HOPE — v5 Analogical ArXiv Discovery

Date: 2026-05-28  
Skill used: `/home/dstefanescu/.codex/skills/analogical-arxiv-scout-v5`  
Mode: `constitutional`

This run redoes the earlier arXiv scouting with v5 discipline: mechanism search, target x-ray, kill tests, paper/source separation, invention candidates, and comparison against previous attempts.

## Target X-Ray

### Target thesis

Original HOPE extracts a clean shortest-path geometry for interference-powered routing: interference is harmful at the receiver but useful at the transmitter. IP-HOPE tries to turn that mathematical primitive into a deployable system through forecasts, lifted route search, certificates, schedules, probes, tactical envelopes, federation, and RF-cooperative actions.

### Success condition

Find arXiv papers whose mechanisms can help lift HOPE/IP-HOPE limitations by analogy. A useful paper must provide at least one of:

- a better physical model;
- a better state/uncertainty model;
- a better temporal/scheduling objective;
- a better runtime-certificate or safety mechanism;
- a better bridge from simulation to hardware;
- a better adversarial or omission-regret evaluation.

### Limitations to lift

| ID | Limitation |
|---|---|
| L1 | Static/known interference and energy state |
| L2 | Mobility, burstiness, time-varying channels, adaptive adversaries |
| L3 | No finite-battery, queueing, traffic scheduling, or long-horizon energy policy |
| L4 | Narrow/stylized simulation and weak evaluation breadth |
| L5 | No hardware/nonlinear RF-energy-harvester validation |
| L6 | Missing MAC/control-plane contention and synchronization cost |
| L7 | State acquisition, uncertainty, trust, and distribution cost |

### Scarce resources

| Resource | Why it matters for HOPE/IP-HOPE |
|---|---|
| Energy | Harvested RF is nonlinear, intermittent, and storage-limited. |
| State information | Interference, energy, channel, and topology state are costly and stale. |
| Communication | Telemetry and control traffic compete with data and energy. |
| Synchronization | Time-expanded schedules fail if timing assumptions are free. |
| Verification budget | Rich lifted policies need cheap runtime certificates. |
| Trust | Node/gateway reports can be stale, malicious, or selectively missing. |
| Hardware evidence | Simulation winners can disappear under measured rectifier/channel behavior. |

### Hard invariants

- Learned models may propose or bias, but must not authorize unsafe routes.
- Lower-tier winners must not be silently removed.
- Route/schedule authority must remain certificate-bound.
- Hardware/nonlinear EH claims require measured or calibrated evidence.
- Any promoted idea needs a cheap falsifier.

## Abstraction Map

| Concrete HOPE/IP-HOPE gap | Abstract form | v5 operator |
|---|---|---|
| Known interference map | Partial observability, stale state, hidden oracle | Distributionalize, Certify |
| Linear harvested-energy abstraction | Nonlinear response, sensitivity threshold, saturation | Nonlinearize |
| Bottleneck latency only | Freshness, queueing, finite battery, goal utility | Temporalize, Resource-bound |
| Flat route metric | Lifted state, hidden path, representation gap | State-lift |
| Free coordination | Communication/sync/control overhead | Resource-bound |
| Trusted reports | Byzantine telemetry, adversarial calibration | Adversarialize |
| Simulation wins | Hardware-calibrated digital twin | Bridge-to-physical |
| Learned policy temptation | Proposal-authority split | Split-authority, Certify |
| New tiers beating old tiers | Omission-regret | Omission-regret |

## Search Plan

Near queries:
- RF energy harvesting nonlinear harvester routing arXiv
- energy harvesting sensor AoI scheduling arXiv
- wireless powered cooperative relay arXiv
- physical interference link scheduling multihop arXiv

Adjacent queries:
- adaptive conformal inference distribution shift arXiv
- conformal risk control arXiv
- proof-carrying plans resource logic arXiv
- runtime verification self-adaptive systems changing requirements arXiv
- safe reinforcement learning robust control barrier functions arXiv
- goal-oriented wireless communication control arXiv

Far queries:
- shield synthesis runtime enforcement reactive systems arXiv
- digital twin wireless channel ray tracing arXiv
- logically constrained reinforcement learning arXiv
- online Whittle index sensor scheduling AoI arXiv

Anti-queries:
- nonlinear harvester invalidates linear RF energy harvesting
- simulator-only wireless network digital twin gap
- Byzantine federated conformal prediction
- omission / benchmark leakage / old baseline removal

## Candidate Triage

| Paper | Prior attempt? | v5 decision | Why |
|---|---:|---|---|
| [Sensitive and Nonlinear Far Field RF Energy Harvesting](https://arxiv.org/abs/1707.07041) | Yes | Keep | Strong nonlinearize operator; directly attacks L5. |
| [Scheduling Status Updates to Minimize AoI with an EH Sensor](https://arxiv.org/abs/1701.08354) | No | Keep | Adds freshness/threshold-policy objective missing from prior attempts. |
| [Age of Information in Multi-source Updating Systems Powered by EH](https://arxiv.org/abs/2109.07605) | No | Keep | Distributional AoI and queue discipline; direct L3/L7 mechanism. |
| Fair and Efficient Scheduling for Sensor Networks via Online Whittle Index Policy | No | Maybe | Highly relevant 2026 WUR/AoII paper, but not opened cleanly in this run; use in follow-up. |
| [Adaptive Conformal Inference Under Distribution Shift](https://arxiv.org/abs/2106.00170) | No | Keep | Stronger than static conformal papers for time-varying RF state. |
| [Conformal Risk Control](https://arxiv.org/abs/2208.02814) | No | Keep | Converts uncertainty into target-risk certificate, not only coverage. |
| [Federated Inference with Reliable UQ over Wireless Channels](https://arxiv.org/abs/2308.04237) | Yes | Keep | Direct wireless reporting-channel calibration mechanism. |
| [Certifiably Byzantine-Robust Federated Conformal Prediction](https://arxiv.org/abs/2406.01960) | Yes | Keep | Direct adversarial telemetry/trust mechanism. |
| [Proof-Carrying Plans](https://arxiv.org/abs/2008.04165) | No | Keep | Best new certificate analogy; turns route/schedule plans into proof-bearing artifacts. |
| [Shield Synthesis](https://arxiv.org/abs/1501.02573) | No | Keep | Runtime shield is a sharper authority-safety model than generic certificates. |
| [Runtime Verification with Changing Requirements](https://arxiv.org/abs/2303.16530) | No | Keep | Fits adaptive requirements across regimes/gateway states. |
| [Safe RL Using Robust Control Barrier Functions](https://arxiv.org/abs/2110.05415) | No | Keep | Clean proposal-authority split for learned route/tactical policies. |
| [LCRL](https://arxiv.org/abs/2209.10341) | No | Keep | LTL/LDBA policy synthesis maps to temporal route constraints. |
| [MART-6G ray-tracing digital twin](https://arxiv.org/abs/2502.14290) | No | Keep | Stronger bridge-to-physical than previous generic digital twin picks. |
| [Goal-Oriented Communication, Estimation, and Control](https://arxiv.org/abs/2312.16061) | No | Keep | Turns communication from throughput metric to control-value metric. |
| [Goal-Oriented Wireless Communication Resource Allocation](https://arxiv.org/abs/2311.02911) | No | Keep | Adds semantic/utility gain objective; direct scheduling analogy. |
| [Learning Decentralized Wireless Resource Allocations with GNNs](https://arxiv.org/abs/2107.01489) | Yes | Keep but narrow | Use for route-prior proposals only; not authority. |
| [Energy Harvesting Aware Multi-hop Routing via MARL](https://arxiv.org/abs/2203.11313) | Yes | Repair | Useful as proposal generator; previous attempts over-weighted it as routing solution. |
| [Wireless-Powered Cooperative Communications via a Hybrid Relay](https://arxiv.org/abs/1408.4841) | Yes | Keep but gate | Good Tier 8 RF-action primitive; must be nonlinear-EH/certificate gated. |
| Source-Specific Routing | Yes | Demote | Useful metaphor for extra route dimensions, but weak HOPE mechanism transfer. |
| Broad surveys on RF-EH / GNN / generative wireless | Yes | Demote to background | Useful taxonomies, weak source of concrete transfer mechanisms. |

## Selected Paper Reviews

### Sensitive and Nonlinear Far Field RF Energy Harvesting in Wireless Communications

Authors: Panos N. Alevizos, Aggelos Bletsas  
Paper: https://arxiv.org/abs/1707.07041  
Code: N/A  
Model/System: nonlinear RF harvester model

TL;DR

WHAT was done? The paper models harvested RF power as an arbitrary nonlinear, continuous, non-decreasing function of received power, including limited sensitivity and saturation. It uses finite measured datapoints and piecewise-linear approximation to propagate channel fading into harvested-power statistics.

WHY it matters? It attacks the hidden linearity assumption in RF-energy systems. An RF information signal can be decodable while still useless for energy harvesting if the rectifier sensitivity is worse than the communication receiver sensitivity.

Review

The paper's own contribution is a physical-model correction. It gives network researchers a more faithful harvester abstraction. The key mechanism is a measured nonlinear transfer curve: input RF power does not map linearly to harvested DC power, especially in low-power regimes.

Limitations

It does not solve routing, scheduling, or state estimation. It also does not eliminate the need for device-specific measurement.

Transfer Analysis

Paper claim: linear and unlimited-sensitivity EH models can deviate from reality, especially at low input power.  
Transfer claim: HOPE/IP-HOPE route weights need nonlinear harvester profiles, not scalar interference-as-energy terms.  
Target insertion point: Tier 4.5 hardware profiles; Tier 8 RF-action certificates.  
Required adaptation: bind route/schedule candidates to `harvester_profile_id`, sensitivity threshold, and saturation model.  
Analogy type: Nonlinearize + Certify.  
Falsifier: winner maps are unchanged under measured nonlinear harvester curves.  
Failure risk: measurement burden may dominate small-node deployments.

### Scheduling Status Updates to Minimize Age of Information with an Energy Harvesting Sensor

Authors: Baran Tan Bacinoglu, Elif Uysal-Biyikoglu  
Paper: https://arxiv.org/abs/1701.08354  
Code: N/A  
Model/System: AoI threshold policy for EH source

TL;DR

WHAT was done? The paper studies an EH sensor sending status updates over an erasure channel with time-varying energy constraints and battery limits. It formulates age-optimal transmission thresholds as functions of energy state and estimated age.

WHY it matters? It shows that the right action may be not to transmit even when energy is available. Freshness and energy causality jointly determine when transmission is valuable.

Review

This paper changes the objective. HOPE minimizes bottleneck harvest latency, but many sensor deployments care about freshness of state at the receiver. The nontrivial result is that finite energy arrivals imply a positive age threshold: sending immediately is not always optimal.

Limitations

The model is a remote sensing/status-update abstraction, not multi-hop RF-powered routing. It does not include interference-as-energy duality.

Transfer Analysis

Paper claim: AoI-optimal EH scheduling can require thresholding based on both energy and current age.  
Transfer claim: IP-HOPE should evaluate route schedules by information freshness and semantic update value, not only latency or packet delivery.  
Target insertion point: Tier 5 schedule cube; Tier 4.6 observation planning.  
Required adaptation: add `freshness_value`, `age_threshold`, and `energy_state` to schedule certificates.  
Analogy type: Temporalize + Resource-bound.  
Falsifier: AoI-aware certificates do not change any route/schedule choice under bursty telemetry.  
Failure risk: AoI can conflict with reliability and fairness.

### Age of Information in Multi-source Updating Systems Powered by Energy Harvesting

Authors: Mohamed A. Abd-Elmagid, Harpreet S. Dhillon  
Paper: https://arxiv.org/abs/2109.07605  
Code: N/A  
Model/System: stochastic hybrid systems AoI analysis

TL;DR

WHAT was done? The paper analyzes a multi-source real-time updating system powered by energy harvesting, deriving AoI distribution expressions under several queueing disciplines using stochastic hybrid systems.

WHY it matters? It moves EH communication analysis from one source and one average metric to multi-source freshness distributions under queue disciplines.

Review

IP-HOPE's Tier 5 problem is fundamentally multi-source/multi-flow. Average route latency is too weak when different physical processes generate updates with different freshness requirements. Distributional AoI is closer to the reliability object needed by a control or monitoring network.

Limitations

The paper is queueing analysis, not route construction. Its assumptions about arrivals and services need adaptation for RF-interference-powered multihop settings.

Transfer Analysis

Paper claim: stochastic hybrid systems can characterize distributional AoI for EH-powered multi-source updates.  
Transfer claim: Tier 5 can use distributional freshness as an evaluation/certificate target.  
Target insertion point: multi-flow schedule certificate and realized trace analytics.  
Required adaptation: model route schedule as a freshness service process with energy-causal constraints.  
Analogy type: Temporalize + Distributionalize.  
Falsifier: no observed difference between latency-optimal and freshness-optimal schedules on multi-source workloads.  
Failure risk: analytic complexity may exceed traffic model fidelity.

### Adaptive Conformal Inference Under Distribution Shift

Authors: Isaac Gibbs, Emmanuel Candes  
Paper: https://arxiv.org/abs/2106.00170  
Code: N/A  
Model/System: adaptive conformal inference

TL;DR

WHAT was done? The paper develops online conformal prediction methods for data distributions that vary over time, providing long-run coverage frequency without exchangeability.

WHY it matters? Static conformal prediction is often too rigid for wireless channels, interference, and energy traces.

Review

The target coverage parameter adapts as the data-generating process shifts. This is more relevant to RF networks than static split conformal methods because channel/interference regimes drift.

Limitations

Long-run coverage is not per-regime or adversarial guarantee. It can still hide short-term unsafe windows.

Transfer Analysis

Paper claim: adaptive conformal inference can maintain desired coverage frequency over time under unknown distribution shift.  
Transfer claim: IP-HOPE forecast bundles should carry adaptive coverage state, not static calibration labels.  
Target insertion point: Tier 2.9 forecast bundles; Tier 4.6 belief updates.  
Required adaptation: calibrate by regime, node, band, and staleness bucket.  
Analogy type: Distributionalize + Certify.  
Falsifier: adaptive intervals fail exactly during route-relevant regime changes.  
Failure risk: long-run guarantees may be too slow for safety-critical decisions.

### Conformal Risk Control

Authors: Anastasios N. Angelopoulos, Stephen Bates, Adam Fisch, Lihua Lei, Tal Schuster  
Paper: https://arxiv.org/abs/2208.02814  
Code: https://github.com/aangelopoulos/conformal-risk  
Model/System: conformal risk control

TL;DR

WHAT was done? The paper extends conformal prediction from coverage sets to expected monotone loss control, with extensions for distribution shift and adversarial/multiple risks.

WHY it matters? Routing decisions care about risk functions: outage, stale information, energy underflow, schedule violation, not merely whether a scalar prediction interval covers truth.

Review

This is one of the strongest v5 additions. HOPE/IP-HOPE needs risk certificates, not only prediction intervals. Conformal Risk Control maps better to IP-HOPE's certificate language than generic uncertainty quantification because the certificate can be over target loss.

Limitations

The loss must be defined correctly, monotonicity conditions matter, and calibration data must match deployment conditions.

Transfer Analysis

Paper claim: conformal methods can control expected monotone loss, not only coverage.  
Transfer claim: route certificates should control target risks: outage-risk, stale-state-risk, energy-underflow-risk, and repair-risk.  
Target insertion point: `CertifiedPlan`, `ScheduleCertificate50`, Tier 8 RF-action certificates.  
Required adaptation: define monotone route/schedule loss families and calibration splits.  
Analogy type: Certify + Resource-bound.  
Falsifier: risk-controlled certificates are either too loose to select routes or fail under regime shifts.  
Failure risk: wrong loss design creates false safety.

### Wireless Federated Conformal Prediction

Authors: Meiyi Zhu, Matteo Zecchin, Sangwoo Park, Caili Guo, Chunyan Feng, Osvaldo Simeone  
Paper: https://arxiv.org/abs/2308.04237  
Code: N/A  
Model/System: WFCP

TL;DR

WHAT was done? The paper introduces wireless federated conformal prediction, where devices communicate calibration statistics over a wireless channel using type-based multiple access and quantile correction.

WHY it matters? It removes the hidden assumption that calibration information is transmitted without cost or noise.

Review

Previous attempts correctly selected this paper. v5 sharpens why: it is not merely "conformal prediction for wireless." It is a direct attack on free state acquisition. Calibration messages are themselves wireless traffic, so uncertainty certification must account for communication constraints.

Limitations

It is an inference paper, not a routing stack. It assumes a pre-trained model shared by devices/server.

Transfer Analysis

Paper claim: wireless federated conformal prediction can provide formal coverage guarantees under limited wireless communication.  
Transfer claim: IP-HOPE telemetry calibration should be treated as a wireless protocol, not an oracle.  
Target insertion point: Tier 4.6 observation ledgers; Tier 7 federated gateways.  
Required adaptation: replace labels/losses with CQI/energy/route-state nonconformity scores.  
Analogy type: Measurement transfer + Certify.  
Falsifier: wireless-calibrated forecasts do not improve route safety over local stale-inflation baselines.  
Failure risk: TBMA-like assumptions may not fit all IP-HOPE control channels.

### Certifiably Byzantine-Robust Federated Conformal Prediction

Authors: Mintong Kang, Zhen Lin, Jimeng Sun, Cao Xiao, Bo Li  
Paper: https://arxiv.org/abs/2406.01960  
Code: N/A  
Model/System: Rob-FCP

TL;DR

WHAT was done? The paper proposes robust federated conformal prediction against malicious clients reporting arbitrary calibration statistics, with theoretical coverage bounds and empirical validation under Byzantine attacks.

WHY it matters? A distributed uncertainty certificate is unsafe if malicious participants can corrupt calibration.

Review

v5 assigns this paper a precise role: adversarial telemetry governance. The mechanism is a maliciousness score over conformity-score characterizations, plus coverage bounds under a bounded malicious-client model.

Limitations

The adversary model and data setting are not RF routing. Mapping "client" to "node/gateway" must be done carefully.

Transfer Analysis

Paper claim: federated conformal calibration can be made robust to Byzantine clients under stated conditions.  
Transfer claim: Tier 7 and Tier 4.6 should assume some telemetry/calibration reporters are malicious.  
Target insertion point: observation trust ledger, gateway federation, calibration certificate.  
Required adaptation: define route-state conformity vectors and maliciousness tests.  
Analogy type: Adversarialize + Certify.  
Falsifier: malicious nodes can still shrink risk intervals enough to induce unsafe routes.  
Failure risk: benign heterogeneous RF regimes may look malicious.

### Proof-Carrying Plans: a Resource Logic for AI Planning

Authors: Alasdair Hill, Ekaterina Komendantskaya, Ronald P. A. Petrick  
Paper: https://arxiv.org/abs/2008.04165  
Code: N/A  
Model/System: proof-carrying plans

TL;DR

WHAT was done? The paper defines a resource logic for AI planning in which plans can be verified through pre/postconditions and resource-aware execution, with Agda formalization and automatic plan-to-proof parsing.

WHY it matters? It gives a precise way to make a plan carry evidence that it respects resources and state transitions.

Review

This is the single most important new v5 paper for IP-HOPE. Earlier attempts talked about certificates but did not import a strong planning logic. Proof-carrying plans give a model: a route or schedule is not just an optimizer output; it is a proof object with resource preconditions and postconditions.

Limitations

It is not a wireless paper and does not cover probabilistic RF dynamics. The logic needs probabilistic/resource extensions for IP-HOPE.

Transfer Analysis

Paper claim: AI plans can be represented and verified as proof-bearing resource-aware objects.  
Transfer claim: IP-HOPE route/schedule candidates should carry machine-checkable resource proofs for energy causality, timing, certificate preconditions, and fallback bounds.  
Target insertion point: `CertifiedPlan`, projection runtime, Tier 5 schedule certificate, Tier 8 policy certificate.  
Required adaptation: create an IP-HOPE resource logic with energy/freshness/interference-risk types.  
Analogy type: Certify + Resource-bound.  
Falsifier: proof generation/verification overhead exceeds control-plane budget or fails to catch seeded invalid routes.  
Failure risk: proof language may be too brittle for uncertain wireless state unless paired with conformal risk certificates.

### Shield Synthesis: Runtime Enforcement for Reactive Systems

Authors: Roderick Bloem, Bettina Koenighofer, Robert Koenighofer, Chao Wang  
Paper: https://arxiv.org/abs/1501.02573  
Code: N/A  
Model/System: safety shield synthesis

TL;DR

WHAT was done? The paper synthesizes runtime shields that monitor a reactive system's inputs/outputs and minimally correct erroneous outputs to enforce a small set of critical properties.

WHY it matters? It separates the complex system from a small critical enforcement layer.

Review

This is a deeper analogy than generic runtime verification. IP-HOPE has many learned and heuristic proposal mechanisms. Instead of proving all of them correct, a shield can enforce critical route/schedule safety properties at runtime while preserving non-critical behavior where possible.

Limitations

The paper targets reactive systems. Wireless routing has probabilistic uncertainty and delayed observations, so enforcement may be less immediate.

Transfer Analysis

Paper claim: a runtime shield can enforce critical properties by correcting outputs only when necessary.  
Transfer claim: IP-HOPE should synthesize route/schedule shields that block or minimally repair unsafe route installs regardless of which planner proposed them.  
Target insertion point: Tier 4.4 projection runtime; Tier 6 tactical envelope; Tier 8 RF action arbiter.  
Required adaptation: define critical safety properties over energy, freshness, loop freedom, trust, and certificate validity.  
Analogy type: Split-authority + Certify.  
Falsifier: shield permits seeded unsafe installs or blocks too many valid high-value routes.  
Failure risk: delayed telemetry can make immediate correction impossible.

### Runtime Verification of Self-Adaptive Systems with Changing Requirements

Authors: Marc Carwehl, Thomas Vogel, Genaina Nunes Rodrigues, Lars Grunske  
Paper: https://arxiv.org/abs/2303.16530  
Code: N/A  
Model/System: adaptive runtime verification

TL;DR

WHAT was done? The paper adapts runtime verification for self-adaptive systems whose requirements change at runtime, preserving verification state and avoiding monitor restarts.

WHY it matters? IP-HOPE regimes change: lab, controlled RF, ambient RF, hostile ambient, degraded gateway, federation, and tactical operation require different requirements.

Review

The paper's mechanism is requirement mobility. Runtime monitors should not be redeployed from scratch whenever the environment changes. Instead, property automata can adapt while preserving satisfaction knowledge.

Limitations

The paper is not RF-EH routing. Wireless physical uncertainty must be added separately.

Transfer Analysis

Paper claim: runtime verification can handle changing requirements with safe automata adaptation and preserved intermediate results.  
Transfer claim: IP-HOPE should use regime-adaptive monitors, not one static certificate policy.  
Target insertion point: Tier 4.4/4.6 certificate modes; Tier 7 degraded/federated requirements.  
Required adaptation: define requirement profiles per regime and safe transitions among them.  
Analogy type: Certify + Protocolize.  
Falsifier: requirement adaptation misses violations at regime boundaries.  
Failure risk: too many regime-specific rules create governance complexity.

### Safe Reinforcement Learning Using Robust Control Barrier Functions

Authors: Yousef Emam, Gennaro Notomista, Paul Glotfelter, Zsolt Kira, Magnus Egerstedt  
Paper: https://arxiv.org/abs/2110.05415  
Code: N/A  
Model/System: robust CBF safety layer for RL

TL;DR

WHAT was done? The paper frames safety as a differentiable robust-control-barrier-function layer in model-based RL, projecting proposed RL actions onto safe actions.

WHY it matters? It gives a clean separation between reward-driven exploration and hard safety constraints.

Review

This is a better analogical use of learning than importing MARL routing wholesale. The key idea is not "RL works"; it is "RL can be wrapped in a safety projection layer." IP-HOPE needs exactly that: learned route priors and tactical policies can suggest actions, but a safety layer must constrain them.

Limitations

Control barrier functions require a usable notion of safe set and system dynamics. IP-HOPE's stochastic RF state makes that nontrivial.

Transfer Analysis

Paper claim: robust CBF layers can ensure safety while learning reward-driven policies.  
Transfer claim: RouteFold/MARL/tactical policies should be projected through certificate/barrier layers before route authority.  
Target insertion point: Tier 4.7 RouteFold, Tier 6/6.5 tactical decisions, Tier 8 learned policy proposals.  
Required adaptation: define RF-routing barrier functions over energy underflow, loops, trust, and schedule conflict.  
Analogy type: Split-authority + Certify.  
Falsifier: barrier projections destroy learned-policy gains or fail under uncertainty.  
Failure risk: safe set may be impossible to define tightly from stale state.

### LCRL: Certified Policy Synthesis via Logically-Constrained Reinforcement Learning

Authors: Hosein Hasanbeig, Daniel Kroening, Alessandro Abate  
Paper: https://arxiv.org/abs/2209.10341  
Code: linked from arXiv page  
Model/System: LCRL

TL;DR

WHAT was done? The paper presents a model-free RL tool for unknown MDPs that synthesizes policies maximizing satisfaction probability of linear temporal logic specifications via limit-deterministic Buchi automata.

WHY it matters? Many routing constraints are temporal: eventually deliver, never loop, recharge before transmit, preserve fallback, and do not violate envelope before rejoin.

Review

LCRL is valuable because it treats constraints as temporal logic, not scalar penalties. A route/tactical policy has obligations across time. Encoding those as LTL-like specifications prevents reward hacking and makes policy synthesis auditable.

Limitations

Theoretical guarantees depend on assumptions. Direct use in RF routing requires careful state abstraction.

Transfer Analysis

Paper claim: LTL-specified tasks can guide model-free RL over unknown MDPs with satisfaction-probability objectives.  
Transfer claim: IP-HOPE learned policies should be constrained by temporal route obligations, not only immediate cost.  
Target insertion point: Tier 6 tactical policies; Tier 8 whole-stack policies.  
Required adaptation: define LTL templates for route progress, energy causality, fallback, and certificate validity.  
Analogy type: Protocolize + Certify.  
Falsifier: temporal constraints make policy search intractable or do not reduce seeded route failures.  
Failure risk: LTL abstractions may be too coarse for continuous RF dynamics.

### Road to 6G Digital Twin Networks: Multi-Task Adaptive Ray-Tracing as a Key Enabler

Authors: Li Yu, Yinghe Miao, Jianhua Zhang, Shaoyi Liu, Yuxiang Zhang, Guangyi Liu  
Paper: https://arxiv.org/abs/2502.14290  
Code: N/A  
Model/System: MART-6G

TL;DR

WHAT was done? The paper proposes MART-6G, a multi-task adaptive ray-tracing platform for 6G digital twin networks, with environment twin, ray-tracing engine, and channel twin modules.

WHY it matters? It treats the wireless channel as something that must be twinned, calibrated, and task-adapted for online and offline digital-twin use.

Review

Previous attempts included digital twin papers, but this one is more structurally useful for HOPE because RF channel modeling is the physical bridge. A digital twin without channel/harvester calibration is just another simulator.

Limitations

It is 6G channel-oriented, not RF-energy-harvester-oriented. IP-HOPE still needs rectifier/storage measurements.

Transfer Analysis

Paper claim: adaptive ray-tracing can support digital twin tasks with environment, propagation, and channel modules.  
Transfer claim: IP-HOPE needs a channel-harvester twin with task-adaptive fidelity rather than a single simulator.  
Target insertion point: Tier 4.5 HIL; Tier 8 RF-action validation.  
Required adaptation: add nonlinear harvester/storage twin and route-execution trace join.  
Analogy type: Bridge-to-physical.  
Falsifier: twin-calibrated predictions fail to forecast route winner flips under measured RF traces.  
Failure risk: ray tracing may be overkill for cheap IoT deployments.

### Goal-Oriented Communication, Estimation, and Control over Bidirectional Wireless Links

Authors: Jie Cao, Ernest Kurniawan, Amnart Boonkajay, Nikolaos Pappas, Sumei Sun, Petar Popovski  
Paper: https://arxiv.org/abs/2312.16061  
Code: N/A  
Model/System: goal-oriented co-design framework

TL;DR

WHAT was done? The paper studies wireless networked control over imperfect bidirectional links, formulating a CMDP to reduce control violation probability under costs and designing goal-oriented scheduling/estimation/control policies.

WHY it matters? It makes communication value depend on the downstream control goal.

Review

This is a high-quality analogy for IP-HOPE's state acquisition problem. The right question is not "what telemetry can we collect?" but "which telemetry reduces violation probability per cost?" That matches Tier 4.6's observation-value layer, but with a stronger control objective.

Limitations

The paper is a control-network setting, not RF-powered multihop routing.

Transfer Analysis

Paper claim: scheduling/estimation/control can be co-designed around goal violation probability and communication cost.  
Transfer claim: IP-HOPE should assign observation and route-control value by downstream violation reduction, not packet metrics alone.  
Target insertion point: Tier 4.6 value-of-information; Tier 5 schedule objective.  
Required adaptation: define HOPE violation functions: outage, energy underflow, stale state, and certificate invalidation.  
Analogy type: Goal-oriented metric transfer.  
Falsifier: goal-oriented observation does not reduce violations relative to uncertainty-only observation.  
Failure risk: objective selection may encode wrong operational priorities.

### Goal-Oriented Wireless Communication Resource Allocation for the IIoT Application

Authors: Ping Zou, Ojas Kanhere, Shiwen Mao, Yuguang Fang, Jiang Xie  
Paper: https://arxiv.org/abs/2311.02911  
Code: N/A  
Model/System: utility-gain resource allocation

TL;DR

WHAT was done? The paper proposes resource allocation for IIoT based on goal-oriented utility gain rather than conventional communication metrics alone.

WHY it matters? It gives a way to prioritize transmissions by application value.

Review

The paper is useful because it attacks metric mismatch. A packet is not equally valuable in all states. IP-HOPE should not treat every route or observation as equal if the downstream control/application value differs.

Limitations

IIoT utility modeling is application-dependent. Direct transfer requires defining target-specific utility functions.

Transfer Analysis

Paper claim: resource allocation can be driven by goal-oriented utility gain in IIoT.  
Transfer claim: HOPE/IP-HOPE should rank route schedules by information/mission utility per energy/control cost.  
Target insertion point: Tier 5 scheduler; Tier 4.6 observation action value.  
Required adaptation: define utility gain for sensor freshness, delivery criticality, and route-state improvement.  
Analogy type: Metric transfer + Resource-bound.  
Falsifier: utility-gain scheduling increases missed safety/reliability obligations.  
Failure risk: utility model becomes arbitrary unless tied to application evidence.

## Transfer Matrix

| Paper | Source mechanism | Target limitation | Transfer slot | Analogy type | Strength | Main risk | Falsifier |
|---|---|---|---|---|---:|---|---|
| Alevizos/Bletsas 2017 | Nonlinear EH transfer curve | L5 | hardware profile / RF action certificate | Nonlinearize + Certify | 5 | measurement burden | winner maps unchanged under measured nonlinear curves |
| Bacinoglu/Uysal 2017 | AoI threshold policy under EH | L3, L7 | schedule/observation objective | Temporalize | 5 | AoI conflicts with reliability | no schedule choice changes |
| Abd-Elmagid/Dhillon 2021 | distributional AoI for multi-source EH | L3 | Tier 5 schedule analytics | Distributionalize | 4 | model mismatch | no improvement on multi-source workloads |
| Adaptive conformal 2021 | online calibration under shift | L1, L7 | forecast/belief bundles | Distributionalize + Certify | 5 | long-run hides local risk | unsafe intervals during regime switch |
| Conformal Risk Control 2022 | target-loss risk control | L1, L7 | route/schedule risk certificate | Certify | 5 | wrong loss | certificates fail under replay |
| WFCP 2023 | wireless calibration protocol | L7 | observation/federation ledger | Measurement transfer | 4 | TBMA/control mismatch | no safety gain over stale inflation |
| Rob-FCP 2024 | Byzantine calibration robustness | L2, L7 | trust certificate | Adversarialize | 4 | heterogeneity false positives | malicious reports still shrink risk |
| Proof-Carrying Plans 2020 | proof-bearing resource plans | L3, L6, L7 | `CertifiedPlan` logic | Certify + Resource-bound | 5 | proof brittleness | proof overhead too high or misses invalid route |
| Shield Synthesis 2015 | runtime correction shield | L2, L6, L7 | install/tactical/RF-action arbiter | Split-authority | 5 | delayed correction | shield permits seeded unsafe install |
| Runtime verification with changing requirements 2023 | adaptive monitors | L2, L7 | regime-specific certificate policy | Protocolize + Certify | 4 | rule explosion | missed regime-boundary violation |
| Robust CBF safe RL 2021 | safety projection layer | L2, L7 | learned policy wrapper | Split-authority | 4 | stale safe set | learned gains vanish or unsafe projection |
| LCRL 2022 | temporal-logic constrained RL | L2, L3 | tactical/whole-stack policy | Protocolize | 4 | abstraction mismatch | temporal rules do not reduce failures |
| MART-6G 2025 | adaptive channel twin | L4, L5 | hardware-calibrated digital twin | Bridge-to-physical | 4 | overkill / missing rectifier | twin fails to predict route flips |
| Goal-oriented comm/control 2023 | violation-probability objective | L3, L7 | VOI / schedule utility | Metric transfer | 4 | objective misspecification | no violation reduction |
| Agg-GNN 2021 | delayed local graph aggregation | L1, L7 | RouteFold priors | Proposal only | 3 | authority leakage | priors suppress lower-tier winners |
| Hybrid relay WPC 2014 | relay as energy+information actor | L3, L5, Tier 8 | RF cooperative hyperedge | Invert + Compose | 3 | ideal topology | no benefit under nonlinear EH |

## Invention Candidates

### 1. Proof-Carrying Freshness-Energy Routes

Source papers: Proof-Carrying Plans; Conformal Risk Control; AoI EH scheduling; Shield Synthesis.  
Target limitation: L1, L3, L6, L7.  
Core abstraction: a route/schedule candidate is valid only if it carries a checkable resource proof plus calibrated risk envelopes for freshness, energy, and outage.

Protocol:
- Actors: gateway planner, forecast/calibration service, proof generator, runtime shield, nodes.
- Information available: forecast bundles, harvester profile, queue/freshness state, certificate history.
- Allowed actions: propose route, attach proof, verify proof, install route, shield or repair route.
- Forbidden actions: install route without proof/risk certificate; learned model authorizes route directly.
- Success condition: route executes with lower stale-state/energy-underflow failures than Tier 2.9/Tier 5 baselines.

Resource vector:
- Time: proof generation and verification latency.
- Energy: proof-safe energy-causal constraints.
- State information: uncertainty calibrated by conformal risk control.
- Communication: certificate/proof payload overhead.
- Trust: telemetry trust gates.
- Verification: runtime shield catches proof-invalid deviations.

Examples: AoI-critical sensor route; energy-causal multi-hop schedule; route with fallback envelope.  
Nonexamples: pure shortest path; learned route without proof; static certificate without freshness/risk fields.  
Boundary cases: extremely fast mobility, too-stale state, proof payload too large.  
Positive theorem template: if the proof language soundly encodes energy causality and freshness bounds and risk envelopes satisfy calibrated loss bounds, then installed routes satisfy stated safety obligations up to calibrated risk.  
Negative/boundary template: if state drift exceeds calibration adaptation speed, proof-carrying routes can be formally valid yet physically stale.  
Minimal experiment: seed invalid routes that violate energy causality, freshness deadlines, and stale-state risk; compare detection/repair against current certificate checks.  
Falsifier: proof checks add more latency/control overhead than failures they prevent, or miss seeded violations.

### 2. Adaptive Regime Monitors

Source papers: Runtime Verification with Changing Requirements; Adaptive Conformal Inference; Rob-FCP.  
Target limitation: L2, L7.  
Core abstraction: certificate requirements are not static; they are automata that change with RF regime, gateway health, telemetry trust, and calibration drift.

Minimal experiment: replay the same route under regime transitions A/B/C/D/degraded and test whether adaptive monitors catch violations missed by static monitors without excessive false positives.  
Falsifier: adaptive monitors create contradictory requirements or miss boundary violations.

### 3. Goal-Oriented Observation Pricing

Source papers: Goal-oriented communication/control; goal-oriented resource allocation; AoI EH scheduling.  
Target limitation: L3, L7.  
Core abstraction: observations should be priced by downstream violation reduction per joule/control byte, not by uncertainty reduction alone.

Minimal experiment: compare observation policies: uncertainty-only, AoI-only, and goal-violation reduction on matched traces.  
Falsifier: goal-oriented observation does not reduce route/schedule failures or increases critical misses.

### 4. Channel-Harvester Twin With Omission-Regret

Source papers: MART-6G; nonlinear RF EH; waveform nonlinear WPT from previous attempt.  
Target limitation: L4, L5.  
Core abstraction: every claimed route/RF-action winner must be adjudicated in a calibrated channel+harvester twin, and compared against lower-tier winners preserved in the candidate pool.

Minimal experiment: run Tier 2.9/4/5/8 winner maps under linear EH simulator, nonlinear calibrated twin, and measured HIL traces.  
Falsifier: twin predictions do not match measured route winner flips.

### 5. Shielded Learned Route Priors

Source papers: Agg-GNN; Robust CBF safe RL; Shield Synthesis; LCRL.  
Target limitation: L2, L7.  
Core abstraction: learned models supply route skeletons or action preferences; a temporal-logic/barrier/shield layer blocks unsafe influence and logs omission regret against lower-tier winners.

Minimal experiment: compare RouteFold/GNN priors with and without shield and ancestor coverage on OOD topologies.  
Falsifier: shielded priors provide no search gain, or unshielded priors suppress safe lower-tier winners.

## Verification Record

| Candidate | Definition | Distinction | Source support | Transfer | Invariants | Resources | Metrics | Counterexample | Falsifier | MDL | Decision |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Proof-Carrying Freshness-Energy Routes | Pass | Pass | Strong | Strong | Pass | Exposes proof/control overhead | Freshness/energy/risk | stale but formally valid proof | concrete | Good compression of certificates | Promote |
| Adaptive Regime Monitors | Pass | Medium | Strong | Strong | Pass | governance overhead | violation catch vs false positives | requirement conflict | concrete | Adds complexity | Keep |
| Goal-Oriented Observation Pricing | Pass | Pass | Medium | Strong | Pass | needs utility model | violation reduction | wrong utility | concrete | Good if utility grounded | Keep |
| Channel-Harvester Twin With Omission-Regret | Pass | Pass | Strong | Strong | Pass | hardware/twin cost | winner flip prediction | twin mismatch | concrete | High value but expensive | Keep |
| Shielded Learned Route Priors | Pass | Medium | Strong | Strong | Pass if authority split | shield overhead | search gain under safety | stale safe set | concrete | Good safety compression | Keep |

## Promoted Research Artifact: Proof-Carrying Freshness-Energy Routes

One-sentence thesis: IP-HOPE should promote routes and schedules only when they carry a checkable proof over energy causality, freshness value, calibrated risk, and fallback authority.

Why this is new: prior attempts found papers about nonlinear EH, prediction, RL, and cooperative RF actions, but they did not synthesize a route object that combines resource proof, freshness objective, conformal risk certificate, and runtime shield.

Why this is plausible: Proof-Carrying Plans supplies the plan-as-proof pattern; AoI EH scheduling supplies the freshness-energy objective; Conformal Risk Control supplies calibrated risk; Shield Synthesis supplies runtime enforcement.

Why this may fail: proof objects may be too large, stale state can make correct proofs operationally wrong, and the proof language may not express probabilistic RF dynamics cleanly.

Definition:

```text
PC-FER = RouteOrScheduleCandidate
  + resource proof over energy/time/freshness preconditions
  + conformal risk envelope over uncertain RF quantities
  + runtime shield policy for deviations
  + omission-regret record against lower-tier candidates
```

Protocol:

1. Candidate generator proposes route/schedule.
2. Forecast service emits adaptive conformal risk envelopes.
3. Proof generator emits energy/freshness/resource proof.
4. Verifier checks proof and certificate consistency.
5. Runtime shield monitors deviations and repairs/blocks.
6. Realized trace adjudicates proof predictions.

Boundary claim: PC-FER is not useful when proof latency exceeds control-plane budget or when the system cannot measure enough state to bind proof preconditions.

Experiment:

Run matched traces with:

- Tier 2.9 family selector;
- Tier 5 schedule certificate;
- PC-FER without shield;
- PC-FER with shield.

Stress axes:

- nonlinear harvester profile;
- stale CQI;
- bursty update traffic;
- malicious telemetry;
- regime transition.

Expected result: PC-FER should reduce energy-underflow, stale-state, and invalid-install failures under stress, while preserving lower-tier winners unless exclusion-certified.

Kill condition: PC-FER fails if it does not reduce seeded safety violations, if proof/shield overhead dominates route latency, or if omission-regret shows it wins by dropping lower-tier candidates.

## Killed / Repaired Analogies

| Candidate | Verdict | Reason |
|---|---|---|
| Generic MARL EH routing as full IP-HOPE authority | Repaired | Use as proposal generator only; authority leak otherwise. |
| Source-specific routing as core transfer | Demoted | Mechanism is route-context dimensionality, but no energy/uncertainty/certificate mechanism. |
| Broad RF-EH surveys as selected mechanisms | Demoted | Useful for taxonomy, weak for concrete transfer. |
| Generative wireless management as route authority | Killed | Simulator/stress generator only; evidence mismatch and authority leak. |
| Cooperative relay as direct Tier 8 solution | Repaired | Keep only with nonlinear harvester, schedule, and certificate gates. |

## Comparison With Previous Attempts

### Previous attempt 1: `arxiv_papers_for_lifting_ip_hope_limitations.md`

What it did well:

- Covered broad categories: nonlinear EH, finite-battery routing, physical-interference scheduling, conformal uncertainty, POMDPs, GNN priors, cooperative RF, digital twins.
- Correctly identified several enduring papers: Alevizos/Bletsas nonlinear EH, WFCP, Rob-FCP, Agg-GNN, hybrid relay WPC.

What v5 improves:

- Adds missing high-leverage analogies: proof-carrying plans, shield synthesis, adaptive runtime verification, AoI scheduling, conformal risk control, goal-oriented communication.
- Separates survey/background papers from mechanism-bearing papers.
- Adds falsifiers and failure modes.
- Demotes generic MARL/GNN papers from "solution" to "proposal generator."
- Adds omission-regret and certificate authority as explicit selection filters.

### Previous attempt 2: `arxiv_lift_papers_reviews.md`

What it did well:

- Produced 30 review cards.
- Kept paper review and HOPE application sections separate.
- Created a broad map of relevant literature.

What v5 improves:

- It does not accept every paper equally.
- It triages, repairs, demotes, or kills weak analogies.
- It promotes a synthesized research artifact rather than ending at reviews.
- It adds operator traces and kill tests.
- It identifies stronger "infrastructure" analogies that were absent: proof-carrying plans, shields, changing-requirement runtime verification, and goal-oriented control.

### Net result

The previous attempts were useful bibliographies. v5 is a discovery pass. The main intellectual upgrade is moving from:

```text
papers related to HOPE limitations
```

to:

```text
mechanisms that can create new IP-HOPE artifacts, tests, and certificates
```

## Operator Policy Delta

| Operator | Fired? | Helped? | Outcome |
|---|---:|---:|---|
| Nonlinearize | Yes | Yes | Retain early for RF-EH targets. |
| Temporalize | Yes | Yes | Promoted AoI/freshness papers missed earlier. |
| Distributionalize | Yes | Yes | Static conformal upgraded to adaptive/risk conformal. |
| Certify | Yes | Strongly | Produced promoted artifact. |
| Split-authority | Yes | Strongly | Repaired learning papers. |
| Bridge-to-physical | Yes | Yes | Upgraded digital twin selection. |
| Adversarialize | Yes | Yes | Kept robust conformal and telemetry trust. |
| Omission-regret | Yes | Yes | Prevented higher-tier bias. |
| Structure-map | Yes | Strongly | Found proof-carrying plans and shield synthesis. |
| Morphologize | Partial | Medium | Produced RF action/certificate design-space idea. |

Next-run policy:

1. Start with `Target X-Ray`.
2. Fire `Temporalize`, `Certify`, and `Structure-map` earlier than in prior attempts.
3. Keep `Nonlinearize` mandatory for RF-EH.
4. Fire `Split-authority` before accepting any RL/GNN paper.
5. Add one anti-query family per promoted concept.

## Governance Record

Self-certification check: v5 did not treat novelty as truth; every promoted idea includes kill conditions.  
Anti-Goodhart check: no single metric is allowed to dominate; freshness, energy, risk, and verification overhead are all explicit.  
Novelty overclaim check: PC-FER is a proposed synthesis, not a paper-proven result.  
Source fidelity check: paper claims and transfer claims are separated in review cards.  
Rejected analogies: generic MARL authority, broad surveys as mechanisms, source-specific routing as core method, generative wireless as authority.  
Open violations: some candidate metadata for 2026 WUR/AoII papers should be revisited in a separate focused run because the arXiv page did not open cleanly during this run.

## Next Experiments

1. Build a toy PC-FER proof language with four predicates: `energy_causal`, `freshness_bound`, `risk_envelope_valid`, `fallback_authorized`.
2. Seed invalid candidate routes into the Tier 2.9 / Tier 5 harness and test whether PC-FER catches violations missed by existing certificates.
3. Add nonlinear harvester profiles from Alevizos/Bletsas and replay existing winner maps.
4. Add adaptive conformal risk envelopes for interference/energy forecasts and compare against static intervals.
5. Add an omission-regret report: for every v5-inspired route, record whether lower-tier candidates were preserved, rejected, or omitted.
6. Test goal-oriented observation pricing against uncertainty-only observation in Tier 4.6.
7. Run a focused arXiv pass on AoI/AoII/Whittle-index EH scheduling; this was the most underexplored high-value branch.
