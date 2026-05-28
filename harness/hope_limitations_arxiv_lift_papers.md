# ArXiv Papers That Could Lift HOPE's Limitations

Target paper: `/home/dstefanescu/other_systems/o4/hope/Allerton_2025_Sheikholeslami.pdf`

HOPE's main limitations, as identified in the review:

- static network and known average interference powers;
- no mobility, bursty jammers, or adaptive adversaries;
- short-term-buffer model only, no long-horizon battery/supercapacitor policy;
- linear RF harvesting abstraction, no nonlinear rectifier behavior;
- stylized simulation, no hardware deployment;
- no MAC/scheduling/retransmission layer;
- independent-Rayleigh/average-interference outage model;
- no explicit cost for estimating and distributing interference/channel state.

The papers below are not all direct competitors. They are candidate building blocks for a stronger second-generation HOPE.

## Best Upgrade Directions

### 1. Add online learning for dynamic harvest/channel/interference conditions

**Accelerated Structure-Aware Reinforcement Learning for Delay-Sensitive Energy Harvesting Wireless Sensors**  
arXiv: https://arxiv.org/abs/1807.08315

Use this to replace HOPE's static one-shot graph computation with an online policy layer. The paper formulates delay-sensitive EH transmission as an MDP without prior knowledge of channel, packet-arrival, or energy-harvest dynamics, then uses structural properties of the value function to accelerate RL. For HOPE, the analogous state could include battery/supercapacitor level, estimated `I_u`, estimated `I_v`, queue pressure, and recent outage observations.

**ACES -- Automatic Configuration of Energy Harvesting Sensors with Reinforcement Learning**  
arXiv: https://arxiv.org/abs/1909.01968

Useful because it has real deployment evidence, not just simulation. ACES uses RL with supercapacitor-powered sensors and adapts to changing environmental patterns. This directly attacks HOPE's hardware/deployment gap and suggests a path to test RF-powered HOPE-like routing on nodes with real storage dynamics.

**Age-Aware Status Update Control for Energy Harvesting IoT Sensors via Reinforcement Learning**  
arXiv: https://arxiv.org/abs/2004.12684

Useful for adding an application-layer freshness objective. HOPE optimizes startup harvesting latency, but IoT systems often care about age of information. This paper optimizes the tradeoff between update freshness and energy use without exact battery knowledge. A HOPE extension could route not only for minimum bottleneck harvest time, but for freshness-aware utility under uncertain node energy.

### 2. Replace short-term-buffer pessimism with finite battery / retransmission dynamics

**Energy Management for Energy Harvesting Wireless Sensors with Adaptive Retransmission**  
arXiv: https://arxiv.org/abs/1710.09034

This paper adds finite battery size, adaptive retransmission, FEC/ARQ, and a POMDP power-control formulation. It is directly relevant to HOPE's missing MAC/reliability layer. HOPE currently satisfies a one-shot outage constraint; this line of work suggests a version where reliability is achieved through adaptive retransmission and finite-energy state, not only through static transmit-power allocation.

**Deep Reinforcement Learning Based Multidimensional Resource Management for Energy Harvesting Cognitive NOMA Communications**  
arXiv: https://arxiv.org/abs/2109.09503

Useful for extending HOPE from routing-only decisions to joint frequency/time/energy allocation with explicit battery and buffer constraints. The paper handles stochastic wireless environments with DDPG and action adjustment. A HOPE successor could use the closed-form HOPE weight as a prior or feature inside a DRL controller for resource allocation.

### 3. Use realistic RF harvester models

**Nonlinear Energy Harvesting Models in Wireless Information and Power Transfer**  
arXiv: https://arxiv.org/abs/1802.09994

This is probably the most important paper for fixing HOPE's physical-layer abstraction. It compares linear and nonlinear RF harvesting models and emphasizes limited sensitivity and rectifier non-idealities. In HOPE, the denominator `N_0 + I_u` treats additional interference as linearly harvestable energy. With nonlinear harvesting, that monotonic benefit may saturate, vanish below sensitivity thresholds, or change the optimal route.

**Waveform Optimization for Wireless Power Transfer with Nonlinear Energy Harvester Modeling**  
arXiv: https://arxiv.org/abs/1506.08879

Useful if HOPE is extended from passive ambient interference to controllable or cooperative RF energy sources. The paper derives channel-adaptive multisine waveforms from nonlinear harvester physics. It suggests that "interference as fuel" is incomplete: waveform shape, not just average received power, can determine harvested DC power.

**Waveform Optimization for Wireless Power Transfer with Power Amplifier and Energy Harvester Non-Linearities**  
arXiv: https://arxiv.org/abs/2111.14156

Useful for a hardware-realistic variant. It models both transmitter power-amplifier nonlinearity and energy-harvester nonlinearity. A practical HOPE deployment would need this kind of realism if interferers are not purely exogenous but include cooperative chargers or friendly jammers.

### 4. Improve spatial/outage modeling beyond one random square simulation

**Joint Uplink and Downlink Coverage Analysis of Cellular-based RF-powered IoT Network**  
arXiv: https://arxiv.org/abs/1705.06799

This gives a stochastic-geometry way to analyze RF-powered IoT coverage and explicitly handles correlation between harvested energy and SINR. That correlation is central to HOPE: nodes harvest from the same RF field that affects communication. This paper is a strong candidate for replacing HOPE's stylized random-square simulations with spatial network-level coverage analysis.

**IRS-Assisted RF-powered IoT Networks: System Modeling and Performance Analysis**  
arXiv: https://arxiv.org/abs/2210.16521

Useful if HOPE is extended to reconfigurable propagation. The paper derives energy coverage, uplink coverage, overall coverage, spatial throughput, and power efficiency for IRS-assisted RF-powered IoT using stochastic geometry. For HOPE, IRSs could alter the `I_u`/`I_v` geography, turning route selection into joint route-plus-environment-control.

### 5. Account for state-estimation cost and imperfect CSI

**Optimal Channel Estimation for Hybrid Energy Beamforming under Phase Shifter Impairments**  
arXiv: https://arxiv.org/abs/1902.08475

HOPE assumes the average interference terms needed for edge weights are known. This paper explicitly optimizes channel-estimation and energy-beamforming phases under nonlinear EH and hardware impairment. The transferable idea is to put an estimation budget into HOPE: route quality should be discounted by uncertainty in `I_u`, `I_v`, and link gain estimates.

**On Secure Communication using RF Energy Harvesting Two-Way Untrusted Relay**  
arXiv: https://arxiv.org/abs/1708.07989

Useful for adversarial and imperfect-CSI extensions. It studies RF-EH relaying with a friendly jammer and examines channel-estimation error. HOPE's interferers are passive or exogenous; this paper points toward a security-aware version where jamming can be cooperative, adversarial, and imperfectly cancellable.

## Most Promising Synthesis

The strongest extension would be **Adaptive Robust HOPE**:

1. Keep HOPE's edge-weight insight as the structural prior:
   `w_{u,v} = d_{u,v}^α (N_0 + I_v)/(N_0 + I_u)`.
2. Replace `N_0 + I_u` with a nonlinear harvested-DC-power function learned or calibrated from rectifier data.
3. Add finite battery/supercapacitor state and queue/freshness state.
4. Use stochastic-geometry analysis to characterize coverage and interference-harvesting correlation over realistic node/interferer fields.
5. Use online RL or POMDP control to adapt routes and powers under mobility, bursty interference, and imperfect estimates.
6. Add a MAC/retransmission layer so outage reliability is not only a static per-path constraint.

If I had to pick only three papers to drive that extension:

1. `Nonlinear Energy Harvesting Models in Wireless Information and Power Transfer` for realistic RF harvesting.
2. `Accelerated Structure-Aware Reinforcement Learning for Delay-Sensitive Energy Harvesting Wireless Sensors` for online adaptation.
3. `Joint Uplink and Downlink Coverage Analysis of Cellular-based RF-powered IoT Network` for spatial coverage and energy/SINR correlation.

