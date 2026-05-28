# Reviews of ArXiv Papers Relevant to HOPE/IP-HOPE

Date: 2026-05-28

Scope: concise, source-grounded review cards for the papers listed in `arxiv_papers_for_lifting_ip_hope_limitations.md`. These are written as paper reviews first. Each card then adds a separate section on how the paper's ideas could help address HOPE limitations and the IP-HOPE tier limitations assessed in `ip_hope_tiers_vs_hope_review_limitations.md`.

Source basis: arXiv abstract pages and linked paper metadata. These are not full PDF deep dives.

## 1. Sensitive and Nonlinear Far Field RF Energy Harvesting in Wireless Communications

Authors: Panos N. Alevizos, Aggelos Bletsas  
Paper: https://arxiv.org/abs/1707.07041  
Code: N/A  
Model: N/A

TL;DR

WHAT was done? The paper models RF harvested power as an arbitrary nonlinear, continuous, non-decreasing function of received RF power, explicitly incorporating limited sensitivity and saturation. It uses piecewise-linear approximation from finite harvester datapoints to derive harvested-power statistics under fading.

WHY it matters? Much SWIPT and RF-energy work assumes a linear harvester. This paper shows that such a model can be badly wrong, especially in the low-input-power region where communication receivers may still decode but RF harvesters may not turn on.

Review

The central move is to separate communication sensitivity from harvesting sensitivity. That distinction is easy to miss: a receiver can extract bits from weak signals long before a rectifier can produce useful DC power. If a network model treats every received microwatt as proportionally harvestable, it systematically overestimates the benefit of ambient RF.

The paper's practical contribution is not just "nonlinear is better." It gives a usable approximation route: measure a finite set of input/output harvester datapoints, fit a piecewise-linear non-decreasing function, and propagate fading statistics through that function. That makes nonlinear EH portable into simulations without requiring a closed-form rectifier model for every device.

Limitations

The paper is about harvester modeling, not routing, scheduling, or control. It does not solve how a network should estimate each node's harvester curve in the field, how curves drift with temperature and impedance, or how multiple RF sources interact with circuit dynamics. Its value is foundational: it invalidates oversimplified energy models.

Useful for HOPE/IP-HOPE

This is a direct lift for the HOPE review's hardware/nonlinear harvester limitation. HOPE's edge weights depend on interference as an energy source, but the original model treats harvested energy too simply. IP-HOPE Tier 4.5 and Tier 8 should make `harvester_profile_id` a first-class certificate field and rerun winner maps under piecewise nonlinear profiles. Any route that wins only under a linear harvester should be marked simulation-fragile.

## 2. Nonlinear Energy Harvesting Models in Wireless Information and Power Transfer

Authors: Panos N. Alevizos, Georgios Vougioukas, Aggelos Bletsas  
Paper: https://arxiv.org/abs/1802.09994  
Code: N/A  
Model: N/A

TL;DR

WHAT was done? The paper compares linear and nonlinear RF energy-harvesting models for SWIPT, including limited and unlimited sensitivity cases, and quantifies successful SWIPT reception probabilities using practical rectifier assumptions.

WHY it matters? It demonstrates that information-bearing communication signals are not automatically good energy-transfer signals. The rectifier's non-ideal behavior can dominate the system-level conclusion.

Review

This paper pushes beyond the generic warning that nonlinear EH matters. It asks how the choice of EH model changes the probability that SWIPT actually works. That is the right metric: in a practical network, the question is not whether the model is elegant but whether a node both decodes and harvests enough energy under realistic circuitry.

The strongest insight is that "same RF signal, two functions" is not enough. The communication chain and the energy-harvesting chain have different thresholds and nonlinearities. A model can be accurate for decoding and still wrong for charging. This matters because SWIPT papers often use communications abstractions to reason about energy transfer.

Limitations

The paper does not provide a full network-control architecture. It is mostly a modeling and probability analysis paper. Its conclusions must be bound to specific rectifier classes and operating ranges.

Useful for HOPE/IP-HOPE

Use this paper to split HOPE/IP-HOPE reliability into decode reliability and harvest reliability. Tier 8 RF-action certificates should not certify an action using a single scalar "RF benefit." They need separate fields for decode success, harvester activation probability, saturation risk, and energy-transfer efficiency under a named rectifier model.

## 3. RF-based Energy Harvesting: Nonlinear Models, Applications and Challenges

Authors: Ruihong Jiang  
Paper: https://arxiv.org/abs/2405.04976  
Code: N/A  
Model: N/A

TL;DR

WHAT was done? This survey reviews RF energy-harvesting models, with emphasis on nonlinear behavior, applications, and open challenges.

WHY it matters? It gives a map of the modeling choices that determine whether RF-EH simulations are physically meaningful or merely optimistic.

Review

The paper's value is taxonomic. A system builder needs to know which harvester model family is being used, what regime it is valid in, and what assumptions are hidden in the curve. In RF-EH, these assumptions are not secondary: the rectifier model can flip the conclusion about whether a network can sustain itself.

As a survey, the paper is useful because it connects nonlinear modeling to application domains rather than treating harvester curves as isolated circuit details. That bridge is important for network papers, which often import simplistic energy equations because the circuit literature feels too far away.

Limitations

The paper is a survey, so it does not by itself validate a new routing or control method. It should be used as a design checklist, not as evidence that any specific protocol works.

Useful for HOPE/IP-HOPE

This should become the reading list behind the Tier 4.5 and Tier 8 hardware-profile registry. It can guide the set of harvester-model axes in the evaluation cube: sensitivity-limited, saturation-limited, logistic, piecewise measured, diode-based, and device-specific measured profiles.

## 4. RF Power Transmission for Self-sustaining Miniaturized IoT Devices

Authors: Lukas Schulthess, Federico Villani, Philipp Mayer, Michele Magno  
Paper: https://arxiv.org/abs/2407.21455  
Code: N/A  
Model: N/A

TL;DR

WHAT was done? The paper studies RF power transmission for small self-sustaining IoT devices, focusing on practical power delivery and device operation.

WHY it matters? It moves RF-powered IoT from abstract energy equations toward device-level constraints: rectification, storage, duty cycle, and useful operation under harvested power.

Review

This paper matters because miniaturized IoT devices are constrained by more than average harvested power. They need storage, power-management thresholds, startup behavior, and usable duty cycles. A routing paper that ignores those layers can report feasible paths that never produce an actual packet on hardware.

The useful mental model is "energy path," not just "wireless link." RF energy must pass through antenna coupling, rectification, storage, regulation, and load behavior before it becomes useful work. Each stage can introduce thresholds and nonlinear losses.

Limitations

The paper is hardware-oriented rather than a general network-routing framework. Its empirical setup may not span all RF environments, antenna designs, or deployment geometries.

Useful for HOPE/IP-HOPE

Tier 4.5 HIL gates should be upgraded from abstract calibration residuals to device lifecycle tests: cold start, storage refill, sustained transmit burst, duty-cycle recovery, and brownout behavior. HOPE's short-term-buffer model should be compared to measured finite-storage traces.

## 5. Waveform Optimization for Wireless Power Transfer with Nonlinear Energy Harvester Modeling

Authors: Bruno Clerckx, Ekaterina Bayguzina, David Yates, Paul D. Mitcheson  
Paper: https://arxiv.org/abs/1506.08879  
Code: N/A  
Model: N/A

TL;DR

WHAT was done? The paper optimizes wireless power-transfer waveforms while modeling the nonlinear energy harvester, rather than assuming harvested DC power is simply proportional to received RF power.

WHY it matters? It shows that the waveform itself is a control variable for energy delivery. RF power transfer is not only about path loss and received power.

Review

The paper's key reframe is that nonlinearity can be exploited, not merely corrected. If the rectifier response is nonlinear, then two waveforms with the same average RF power can produce different harvested DC power. That breaks many network-level abstractions that collapse energy transfer into scalar received power.

This is especially important for systems that can intentionally emit or shape RF energy. The energy-transmitter design space includes waveform, power, timing, and channel state, and the correct objective is harvested DC output under the rectifier model.

Limitations

Waveform optimization assumes more control over the RF source than passive ambient-harvesting systems have. It is not directly a routing paper and does not solve multi-hop network scheduling.

Useful for HOPE/IP-HOPE

Tier 8 cooperative RF actions should not be modeled only as "extra interference" or "extra energy." They can include waveform class. RF-action certificates need a field for waveform/energy-transfer mode and must bind the predicted benefit to a nonlinear harvester model.

## 6. Energy Harvesting Aware Multi-hop Routing Policy in Distributed IoT System Based on Multi-agent Reinforcement Learning

Authors: Wen Zhang et al.  
Paper: https://arxiv.org/abs/2203.11313  
Code: N/A  
Model: N/A

TL;DR

WHAT was done? The paper proposes an energy-harvesting-aware multi-hop routing policy for distributed IoT using multi-agent reinforcement learning.

WHY it matters? It treats routing as a sequential decision problem under changing energy availability, not as a one-shot shortest-path computation.

Review

The paper's contribution is the shift from static path cost to adaptive multi-agent policy. In energy-harvesting IoT, a node's forwarding choice changes future energy state, congestion, and relay availability. That makes the problem naturally sequential and distributed.

MARL is attractive here because no single node has global truth and the reward depends on network behavior over time. The risk is that learned policies can optimize simulation artifacts or hide unsafe behavior. For engineering use, the paper is best read as a proposal generator for adaptive routing behavior, not a complete safety architecture.

Limitations

Simulation-trained MARL policies depend heavily on environment design, reward shaping, and generalization tests. The paper does not remove the need for formal feasibility checks, safe fallback, or hardware-calibrated energy models.

Useful for HOPE/IP-HOPE

Use MARL outputs as candidate generators for Tier 6/6.5 tactical decisions and Tier 5 scheduling baselines. Do not let MARL authorize routes. In IP-HOPE terms: `learned_policy -> candidate / priority / local heuristic`; `certificate -> authority`.

## 7. Autonomous Management of Energy-Harvesting IoT Nodes Using Deep Reinforcement Learning

Authors: Abdulmajid Murad et al.  
Paper: https://arxiv.org/abs/1905.04181  
Code: N/A  
Model: N/A

TL;DR

WHAT was done? The paper applies deep reinforcement learning to autonomous management of energy-harvesting IoT nodes.

WHY it matters? It targets node operation under intermittent energy supply: a realistic EH node must decide when to sense, transmit, sleep, or conserve, not just choose a route.

Review

This paper is relevant because it shifts attention from network-layer routing to node lifecycle control. Energy harvesting creates local operational decisions: spend energy now or save it, maintain service quality or survive, transmit now or wait for a better energy state.

The technical idea is to learn policies that map observed energy/resource conditions into management actions. The appeal is adaptation under non-stationary harvesting. The danger is the same as with most DRL control papers: if the environment model is weak, the learned policy is brittle.

Limitations

The method needs careful validation under unseen energy traces, hardware differences, and safety constraints. Node-local DRL can also conflict with gateway-level routing unless policy authority is clearly bounded.

Useful for HOPE/IP-HOPE

This is a Tier 5/6 support paper: it suggests adding node duty-cycle state and local energy management to realized traces. For HOPE, it directly addresses the missing finite-buffer and duty-cycling limitation.

## 8. Energy-Efficient Routing Algorithm for Wireless Sensor Networks: A Multi-Agent Reinforcement Learning Approach

Authors: Parham Soltani et al.  
Paper: https://arxiv.org/abs/2508.14679  
Code: N/A  
Model: N/A

TL;DR

WHAT was done? The paper applies multi-agent reinforcement learning to energy-efficient routing in wireless sensor networks.

WHY it matters? WSN routing is not only shortest path; it must account for residual energy, forwarding burden, and network lifetime.

Review

The paper is part of a broader move away from static routing metrics toward adaptive local decision policies. Multi-agent learning is a plausible fit because each sensor's route choice affects neighbor depletion and future topology.

The main intellectual value is the decentralization pressure: global routing can be too slow or too expensive for energy-constrained sensor networks. A learned local policy can react faster, but at the cost of interpretability and certifiability.

Limitations

Without strong out-of-distribution and hardware tests, MARL routing can overfit synthetic topology and traffic assumptions. Energy-efficient does not automatically mean reliable, fair, or safe under adversarial interference.

Useful for HOPE/IP-HOPE

Use as a Tier 6.5 cluster-tactical comparator: can bounded local policy improve relay choice without violating gateway authority? The right IP-HOPE adaptation is advisory scoring inside a certified cluster envelope.

## 9. Energy Harvesting Wireless Communications: A Review of Recent Advances

Authors: Ozgur Ozel et al.  
Paper: https://arxiv.org/abs/1501.06026  
Code: N/A  
Model: N/A

TL;DR

WHAT was done? The paper surveys energy-harvesting wireless communications, including resource allocation, scheduling, and network design.

WHY it matters? It places EH networking in the broader context of queues, batteries, channel states, and optimal policies.

Review

This survey is valuable because it prevents a routing-only view of energy harvesting. EH systems are coupled control systems: energy arrives over time, data queues evolve, channels vary, and policies must decide when to transmit and at what power.

The strongest contribution for a systems researcher is the separation between energy causality and communication optimality. A policy cannot spend energy before it arrives, and finite storage changes the value of using or saving energy.

Limitations

As a review, it does not validate a specific implementation. Some models in the EH literature are idealized and may not incorporate nonlinear RF harvesting or hardware startup behavior.

Useful for HOPE/IP-HOPE

This is the conceptual basis for extending HOPE beyond short-term buffering. Tier 5 should incorporate energy-causality, queue state, battery capacity, leakage, and finite-storage overflow into schedule certificates.

## 10. Approximation Algorithms for Link Scheduling with Physical Interference Model in Wireless Multi-hop Networks

Authors: Shuai Fan, Lin Zhang, Yong Ren  
Paper: https://arxiv.org/abs/0910.5215  
Code: N/A  
Model: N/A

TL;DR

WHAT was done? The paper studies approximation algorithms for wireless link scheduling under the physical interference model.

WHY it matters? It replaces graph-style "conflict/no conflict" interference with SINR-style physical feasibility, which is closer to real wireless behavior.

Review

The paper addresses a core abstraction failure in many networking models: binary interference graphs are computationally convenient, but wireless interference is cumulative and power-dependent. Scheduling under physical interference is harder, yet it is the right target if the claim is about real simultaneous transmissions.

The contribution is algorithmic rather than empirical. It shows that even when the model becomes more realistic, one can still design approximate scheduling methods rather than surrender to intractability.

Limitations

Physical-interference models still abstract away synchronization, packet errors, fading dynamics, and hardware quirks. Approximation guarantees depend on model assumptions.

Useful for HOPE/IP-HOPE

Tier 5 schedule certificates should include a physical-SINR feasibility replay. Conflict graphs can remain fast filters, but claims about MAC/control contention should not stop at binary link conflicts.

## 11. Throughput Optimizing Localized Link Scheduling for Multihop Wireless Networks Under Physical Interference Model

Authors: Yaqin Zhou, Xiangyang Li, Min Liu, Xufei Mao, Shaojie Tang, Zhongcheng Li  
Paper: https://arxiv.org/abs/1301.4738  
Code: N/A  
Model: N/A

TL;DR

WHAT was done? The paper proposes localized link-scheduling algorithms with throughput guarantees under physical interference constraints.

WHY it matters? It moves physical-interference scheduling toward distributed/local operation, which is closer to deployable wireless mesh behavior than centralized global optimization.

Review

The central problem is that physical interference is realistic but computationally hostile. A scheduler that needs complete global optimization each slot is unlikely to work in a real multihop network. The paper's value is to combine localized operation with provable throughput guarantees.

The method uses partition/shifting ideas and pick-and-compare scheduling to handle physical interference. The point is not only higher throughput; it is the proof that local scheduling can retain meaningful fractions of the optimal capacity region under a more realistic interference model.

Limitations

The model remains idealized relative to real MAC stacks, and throughput guarantees are not the same as latency or energy guarantees. It also does not include RF energy-harvesting constraints.

Useful for HOPE/IP-HOPE

Tier 5 and Tier 6.5 can borrow this as a bridge from gateway schedules to local/cluster schedules. It is especially relevant for avoiding a central bottleneck when many flows compete under physical interference.

## 12. Wireless Networks with RF Energy Harvesting: A Contemporary Survey

Authors: Xiao Lu, Ping Wang, Dusit Niyato, Dong In Kim, Zhu Han  
Paper: https://arxiv.org/abs/1406.6470  
Code: N/A  
Model: N/A

TL;DR

WHAT was done? The paper surveys RF energy-harvesting networks, including system architecture, circuitry, applications, communication protocols, and open research directions.

WHY it matters? It connects circuit-level RF harvesting to network-level protocol design.

Review

The survey's strength is cross-layer scope. RF-EH networking cannot be understood at only one layer: antenna/circuit behavior shapes available energy; protocol design shapes when devices spend it; network topology shapes whether RF energy helps or hurts.

The paper is especially useful as a taxonomy. It separates single-hop, relay, multi-antenna, and cognitive-radio network settings, giving a designer a way to locate a specific protocol contribution within the broader RF-EH landscape.

Limitations

It is a 2014-era survey, so it predates many learning-based and digital-twin methods. It is better as a foundational map than as a current state-of-the-art endpoint.

Useful for HOPE/IP-HOPE

Use this as the cross-layer checklist for IP-HOPE: circuit model, RF source model, protocol, relay behavior, cognitive/interference behavior, and open evaluation gaps. It reinforces that HOPE's routing metric is only one layer of a larger RF-EH system.

## 13. Federated Inference with Reliable Uncertainty Quantification over Wireless Channels via Conformal Prediction

Authors: Meiyi Zhu, Matteo Zecchin, Sangwoo Park, Caili Guo, Chunyan Feng, Osvaldo Simeone  
Paper: https://arxiv.org/abs/2308.04237  
Code: N/A  
Model: WFCP

TL;DR

WHAT was done? The paper introduces wireless federated conformal prediction, using type-based multiple access and quantile correction to provide reliability guarantees when devices communicate calibration information over a wireless channel.

WHY it matters? It treats the communication channel as part of the uncertainty-quantification system rather than assuming perfect calibration messages.

Review

This is a sharp paper because it attacks a hidden assumption in federated conformal prediction: that clients can send calibration statistics cleanly. In wireless systems, calibration information is itself transmitted over a noisy, resource-limited channel.

The contribution is to make reliability survive wireless aggregation. Devices send loss-related statistical information, and the server uses it to calibrate prediction sets. Type-based multiple access and quantile correction are used so the final set retains formal coverage guarantees despite communication constraints.

Limitations

The paper addresses inference uncertainty, not routing. It assumes a shared pretrained model and a specific federated inference setting. Applying it to RF state estimation requires translation.

Useful for HOPE/IP-HOPE

This is a strong Tier 4.6 / Tier 7 paper. Forecast and belief bundles should carry coverage guarantees that account for noisy reporting channels, not just model residuals under clean telemetry. It directly attacks HOPE's state-acquisition gap.

## 14. Probabilistic Conformal Prediction with Approximate Conditional Validity

Authors: Vincent Plassier et al.  
Paper: https://arxiv.org/abs/2407.01794  
Code: N/A  
Model: N/A

TL;DR

WHAT was done? The paper studies probabilistic conformal prediction with approximate conditional validity.

WHY it matters? Marginal coverage can hide systematic failures on subpopulations. Approximate conditional validity is more relevant when errors vary by context.

Review

The core issue is that "90% coverage" is not enough if the missing 10% is concentrated exactly where the system is fragile. Wireless systems are heteroscedastic: error varies by node, channel, band, time, traffic, and interference regime.

This paper is useful because it pushes conformal prediction toward context-sensitive guarantees. That matters for any safety system where global averages can certify the wrong thing.

Limitations

Approximate conditional validity is still a statistical guarantee under assumptions. It does not solve distribution shift, adversarial reporting, or causal failure by itself.

Useful for HOPE/IP-HOPE

Tier 2.9 and 4.6 should not use one global coverage number for all forecast bundles. They need calibration by regime, band, node class, staleness bucket, and topology family.

## 15. Distributional Conformal Prediction

Authors: Victor Chernozhukov, Kaspar Wuthrich, Yinchu Zhu  
Paper: https://arxiv.org/abs/1909.07889  
Code: N/A  
Model: N/A

TL;DR

WHAT was done? The paper develops distributional conformal prediction, extending conformal methods beyond simple scalar intervals.

WHY it matters? Many decisions depend on the shape of a conditional distribution, not only on an interval endpoint.

Review

The paper's relevance is methodological. In routing under uncertainty, the system often needs a distribution over outcomes: energy arrival, interference, outage, delay, or route failure. A single calibrated interval can be too blunt.

Distributional conformal prediction offers a way to reason about calibrated distributional objects. For systems that make risk-sensitive decisions, this is closer to the object they actually need.

Limitations

The method is general; domain-specific validity depends on the calibration sample and exchangeability assumptions. Wireless dynamics can break those assumptions if regimes are not separated.

Useful for HOPE/IP-HOPE

Tier 2.9 `ForecastBundle` and Tier 4.3 `BeliefBundle` should distinguish median, tail, and distribution-shape uncertainty. Route certificates should know whether risk comes from tail mass or broad uncertainty.

## 16. Certifiably Byzantine-Robust Federated Conformal Prediction

Authors: arXiv listed authors; see paper page  
Paper: https://arxiv.org/abs/2406.01960  
Code: N/A  
Model: N/A

TL;DR

WHAT was done? The paper studies conformal prediction in federated settings where some participants may be Byzantine or malicious.

WHY it matters? A calibration system that trusts every client can be broken by bad reporters. Robust uncertainty quantification must handle adversarial contributions.

Review

This paper matters because state reports are part of the attack surface. In federated settings, uncertainty calibration can be poisoned just like model training. A Byzantine client can manipulate reported nonconformity scores or calibration evidence to shrink or distort prediction sets.

The paper's conceptual contribution is to make reliability certificates robust to malicious or faulty participants. For any distributed wireless system, this is a critical distinction: missing data is one problem; malicious data is a different one.

Limitations

The result is about federated conformal prediction, not RF routing. Its assumptions and adversary model must be matched carefully before import.

Useful for HOPE/IP-HOPE

Tier 7 federated gateways and Tier 4.6 observation reports need Byzantine-robust calibration. IP-HOPE should add telemetry adversary overlays: stale-but-honest, noisy, compromised, colluding, and selectively silent.

## 17. POMDP-Based Routing for DTNs with Partial Knowledge and Dependent Failures

Authors: Gregory F. Stock et al.  
Paper: https://arxiv.org/abs/2511.20241  
Code: N/A  
Model: N/A

TL;DR

WHAT was done? The paper applies POMDP-style routing to delay-tolerant networks under partial knowledge and dependent failures.

WHY it matters? It treats routing as decision-making under uncertain, correlated network state rather than assuming a complete current graph.

Review

The paper is relevant beyond DTNs because it frames routing under partial observability. Real networks rarely know all link states, node states, and future failures. If failures are dependent, naive independent-link assumptions produce overconfident plans.

POMDP routing makes belief state central. The planner chooses actions based not on the true state, but on a maintained distribution over possible states. That is the right abstraction for disconnected, degraded, or uncertain networks.

Limitations

POMDPs can be computationally expensive. The paper's DTN setting does not directly include RF energy harvesting, nonlinear harvesters, or physical interference scheduling.

Useful for HOPE/IP-HOPE

Tier 4.6 can reinterpret `observe`, `wait`, `route_now`, and `fail_closed` as a bounded POMDP action set. Tier 7 can use POMDP routing for degraded gateway continuity and federated handoff under partial knowledge.

## 18. BetaZero: Belief-State Planning for Long-Horizon POMDPs using Learned Approximations

Authors: Robert J. Moss et al.  
Paper: https://arxiv.org/abs/2306.00249  
Code: N/A  
Model: BetaZero

TL;DR

WHAT was done? The paper proposes a belief-state planning approach for long-horizon POMDPs using learned approximations.

WHY it matters? Exact belief-state planning becomes expensive quickly; learned approximations can make long-horizon partial-observation planning more tractable.

Review

The key contribution is not simply "use learning for POMDPs." It is to use learning to support planning over belief states, where the object being optimized is uncertainty-conditioned future value.

This is attractive for systems where observation itself is an action. A planner must decide whether information is worth acquiring before committing to a route or control action. Long horizons make that hard because the value of information may appear several steps later.

Limitations

Learned approximations can introduce opaque failure modes. In safety-critical routing, learned belief planning needs certificates, replay tests, and bounded action spaces.

Useful for HOPE/IP-HOPE

Tier 4.6 can use this as a research model for observation planning, but only in shadow mode initially. It should produce value-of-information candidates; certification should remain outside the learned model.

## 19. Flow-based Recurrent Belief State Learning for POMDPs

Authors: Xiaoyu Chen et al.  
Paper: https://arxiv.org/abs/2205.11051  
Code: N/A  
Model: N/A

TL;DR

WHAT was done? The paper learns recurrent belief-state representations for POMDPs using flow-based methods.

WHY it matters? Real belief states can be non-Gaussian and history-dependent. A weak belief representation can cripple downstream planning.

Review

The paper addresses the representation problem behind belief-state planning. If the belief state collapses uncertainty into a simple statistic, the planner may make confident but wrong decisions.

Flow-based recurrent belief learning is useful because it can represent richer distributions over latent state. That matters when observation histories induce multimodal possibilities, such as "node is silent because it is energy-starved" versus "node is silent because the link is jammed."

Limitations

The method is general and must be constrained for network control. Learned latent beliefs are hard to audit unless converted into explicit, certifiable summaries.

Useful for HOPE/IP-HOPE

Tier 4.3/4.6 `BeliefBundle` could evolve from scalar uncertainty fields to distributional belief objects, but certificate fields should expose digestible summaries: credible bands, modes, entropy, and observation value.

## 20. Relational Deep Reinforcement Learning for Routing in Wireless Networks

Authors: Victoria Manfredi et al.  
Paper: https://arxiv.org/abs/2012.15700  
Code: N/A  
Model: N/A

TL;DR

WHAT was done? The paper applies relational deep reinforcement learning to routing in wireless networks.

WHY it matters? Relational structure helps routing policies generalize across topology and traffic variation better than fixed-size state encodings.

Review

The paper's central idea is that routing is relational: nodes, links, queues, and packets form structured objects. A policy that understands those relations can potentially transfer across network sizes and layouts.

The important mechanism is not only route selection but decision context. A packet-centric or relation-aware model can consider queueing, congestion, link quality, and local alternatives. That is closer to operational routing than a static graph metric.

Limitations

RL routing remains sensitive to simulation fidelity, reward design, and generalization. It should not be accepted as reliable without adversarial and OOD topology tests.

Useful for HOPE/IP-HOPE

Tier 5 can use relational RL as a schedule-policy baseline for multi-flow traffic. Tier 4.7 RouteFold can borrow the relational inductive bias, but outputs should be route skeletons or rankings, not authority.

## 21. Learning Decentralized Wireless Resource Allocations with Graph Neural Networks

Authors: Zhiyang Wang, Mark Eisen, Alejandro Ribeiro  
Paper: https://arxiv.org/abs/2107.01489  
Code: N/A  
Model: Agg-GNN

TL;DR

WHAT was done? The paper develops aggregation GNNs for decentralized wireless resource allocation with delayed and asynchronous multi-hop graph information.

WHY it matters? It gives a principled model for local decision-making under partial, stale, graph-structured wireless state.

Review

The paper is highly relevant because it does not assume every node has fresh global state. Each transmitter processes graph-aggregated information from multi-hop neighbors, with delay and asynchrony. That mirrors the real state-acquisition problem in wireless networks.

The use of primal-dual learning brings constraints into the learning objective. The permutation-equivariance property supports transfer to different network configurations, which is essential for topology-general routing or resource allocation.

Limitations

The paper validates through numerical simulations, not broad physical deployments. GNN transfer is not automatic; it must be tested across topology families and regimes.

Useful for HOPE/IP-HOPE

This is a strong Tier 4.7 RouteFold reference. IP-HOPE can use Agg-GNN-style route priors over delayed local graph state, while preserving certificate-gated route authority.

## 22. Graph Neural Networks for Wireless Networks: Graph Representation, Architecture and Evaluation

Authors: Yang Lu, Yuhang Li, Ruichen Zhang, Wei Chen, Bo Ai, Dusit Niyato  
Paper: https://arxiv.org/abs/2404.11858  
Code: N/A  
Model: N/A

TL;DR

WHAT was done? The paper surveys graph representations, GNN architectures, and evaluation methods for wireless networks.

WHY it matters? GNN performance in wireless systems depends heavily on how the network is converted into a graph and how success is evaluated.

Review

This paper is useful because it asks the right engineering questions: what is the graph, what are the features, what architecture should process it, and what task-specific metrics matter? GNNs are not magic; their inductive bias is only useful when the representation matches the wireless problem.

The survey highlights graph representations for wireless parameters, message passing, attention and residual improvements, and evaluation for resource allocation tasks. For a system designer, this is a checklist for avoiding toy GNN experiments.

Limitations

Survey conclusions are not proof that any particular GNN improves a deployed network. The hardest part remains evaluation under shift and operational constraints.

Useful for HOPE/IP-HOPE

Use this to audit RouteFold feature design. RouteFold should specify graph nodes, edge features, band/time/mode features, message-passing depth, and evaluation metrics before claiming route-prior quality.

## 23. Graph Neural Networks in Large Scale Wireless Communication Networks: Scalability Across Random Geometric Graphs

Authors: Romina Garcia Camargo, Zhiyang Wang, Alejandro Ribeiro  
Paper: https://arxiv.org/abs/2510.00896  
Code: N/A  
Model: N/A

TL;DR

WHAT was done? The paper studies GNN scalability and transfer across large wireless networks modeled as random geometric graphs.

WHY it matters? A route-prior model that works on one topology size but fails when the graph grows is not useful for real wireless deployments.

Review

The paper addresses an important weakness in many wireless-GNN claims: scalability. Wireless networks are often random geometric graphs with locality, interference, and spatial structure. A useful GNN should exploit that structure and transfer across graph sizes.

For large networks, the evaluation question shifts from "does the model fit this graph?" to "does the policy retain behavior as topology density, size, and geometry change?" That is exactly the question learned routing priors need to answer.

Limitations

Random geometric graphs are still abstractions. They do not include all hardware, MAC, or adversarial behavior. Transfer results must be checked against richer scenarios.

Useful for HOPE/IP-HOPE

Tier 4.7 RouteFold should include topology-scale transfer tests: train on smaller graphs, test on larger/different geometric graphs, and report when learned priors suppress lower-tier winners.

## 24. Wireless-Powered Cooperative Communications via a Hybrid Relay

Authors: He Chen, Xiangyun Zhou, Yonghui Li, Peng Wang, Branka Vucetic  
Paper: https://arxiv.org/abs/1408.4841  
Code: N/A  
Model: N/A

TL;DR

WHAT was done? The paper studies a wireless-powered cooperative network with a hybrid access point, a hybrid relay, and a source without embedded energy supply. It proposes cooperative protocols and jointly optimizes time and power allocation for downlink energy transfer and uplink information transmission.

WHY it matters? The relay is not just a packet forwarder; it can also charge the source. That makes cooperation an RF-energy action, not merely a routing action.

Review

The paper's strongest idea is the hybrid relay. In classical cooperative communication, relays forward information. Here the relay also participates in energy transfer. This changes the role of network nodes: a neighbor can be useful even before it forwards, because it can help create the energy conditions needed for future transmission.

The joint time/power allocation is the right control problem. Energy transfer and information transfer compete for time, but energy transfer can unlock later throughput.

Limitations

The model is structured around a specific AP-relay-source topology. It is not a general multi-hop mesh routing architecture, and practical rectifier behavior may require richer modeling.

Useful for HOPE/IP-HOPE

Tier 8 should treat "relay as charger" as a valid RF hyperedge type. HOPE's insight that interference can be useful becomes more deliberate: not passive interference harvesting, but certified cooperative RF support.

## 25. Cooperative Strategies for Wireless-Powered Communications: An Overview

Authors: He Chen, Chao Zhai, Yonghui Li, Branka Vucetic  
Paper: https://arxiv.org/abs/1610.03527  
Code: N/A  
Model: N/A

TL;DR

WHAT was done? The paper surveys cooperative strategies for wireless-powered communications, including relaying, cooperative spectrum sharing, and cooperative jamming.

WHY it matters? It expands wireless-powered networking from single-link energy transfer into cooperative network behavior.

Review

This overview is important because it catalogs the RF actions a network can use when energy transfer is part of communication. Relays can transfer energy, spectrum-sharing systems can cooperate, and jamming can be powered and strategic.

For a systems designer, this is a vocabulary paper. It helps define action classes and protocol families, which is more useful than importing one narrow model.

Limitations

As a survey, it does not validate a single integrated architecture. Many cooperative schemes assume strong synchronization, coordination, or channel knowledge.

Useful for HOPE/IP-HOPE

Tier 8's RF-action taxonomy should start here: energy relaying, cooperative spectrum sharing, cooperative jamming, and hybrid information/energy relays. Each action needs certificates for energy benefit, interference harm, schedule cost, and trust risk.

## 26. Wireless-Powered Relays in Cooperative Communications: Time-Switching Relaying Protocols and Throughput Analysis

Authors: Ali Arshad Nasir et al.  
Paper: https://arxiv.org/abs/1310.7648  
Code: N/A  
Model: N/A

TL;DR

WHAT was done? The paper analyzes wireless-powered relays using time-switching relaying protocols and throughput metrics.

WHY it matters? It formalizes a basic RF-EH tradeoff: time spent harvesting is time not spent transmitting, but without harvesting the relay cannot forward.

Review

The paper's value is the time-switching abstraction. A wireless-powered relay must allocate time between energy harvesting and information forwarding. This is a minimal model of a broader scheduling tension in RF-powered networks.

The throughput analysis makes clear that energy availability is not a static node property. It is produced by a protocol choice. That matters for any routing method that treats relay energy as exogenous.

Limitations

The relaying model is narrower than a full mesh network. Throughput analysis under idealized assumptions does not handle arbitrary traffic, contention, or nonlinear harvesters.

Useful for HOPE/IP-HOPE

Tier 4/5/8 should include action classes that allocate slots to harvesting versus forwarding. HOPE's bottleneck-latency model can be extended with explicit harvest/forward time switching.

## 27. Autonomous Reconfigurable Intelligent Surfaces Through Wireless Energy Harvesting

Authors: Konstantinos Ntontin et al.  
Paper: https://arxiv.org/abs/2105.00163  
Code: N/A  
Model: N/A

TL;DR

WHAT was done? The paper studies reconfigurable intelligent surfaces that harvest wireless energy to support autonomous operation.

WHY it matters? It treats the radio environment itself as an energy-constrained controllable object.

Review

RIS work often assumes a passive surface with enough power to configure itself. This paper asks how the surface can be powered wirelessly. That turns RIS from an ideal control knob into another energy-harvesting node with constraints.

The idea is relevant because RF environments can be shaped, not only endured. But shaping requires control energy, information, and coordination.

Limitations

RIS deployment assumptions may be far from low-cost sensor networks. The paper is not a routing protocol and may rely on infrastructure not available in many HOPE-like deployments.

Useful for HOPE/IP-HOPE

Tier 8 could include RIS-like RF-shaping actions only as optional, certificate-heavy extensions. The useful idea is not "add RIS"; it is "environment control has an energy budget and should be certified."

## 28. RIoT Digital Twin: Modeling, Deployment, and Optimization of Reconfigurable IoT System with Optical-Radio Wireless Integration

Authors: Alaa Awad Abdellatif et al.  
Paper: https://arxiv.org/abs/2511.09303  
Code: N/A  
Model: RIoT Digital Twin

TL;DR

WHAT was done? The paper presents a digital-twin approach for reconfigurable IoT systems with optical-radio wireless integration.

WHY it matters? Digital twins can bridge simulation, deployment, optimization, and hardware-informed evaluation.

Review

This paper is relevant because it treats evaluation as an infrastructure problem. For complex IoT systems, a static simulator is not enough. The digital twin must represent communication, energy, deployment configuration, and optimization loops.

The most useful idea is calibration. A digital twin should not only produce traces; it should be anchored to measured behavior and then used to test policy changes before deployment.

Limitations

The system domain is optical-radio reconfigurable IoT, not specifically RF-powered interference routing. Digital twins can become false confidence machines if not grounded in physical measurements.

Useful for HOPE/IP-HOPE

IP-HOPE needs a hardware-calibrated digital twin, especially for Tier 4.5 and Tier 8. The twin should distinguish simulation-only winners from hardware-consistent winners.

## 29. Deep Generative Model and Its Applications in Efficient Wireless Network Management: A Tutorial and Case Study

Authors: Zehui Xiong et al.  
Paper: https://arxiv.org/abs/2303.17114  
Code: N/A  
Model: N/A

TL;DR

WHAT was done? The paper reviews deep generative models for wireless network management and gives tutorial/case-study treatment.

WHY it matters? Wireless systems often lack enough real data for every rare regime. Generative models can synthesize scenarios, augment data, or model distributions.

Review

The useful contribution is not that generative models should control networks. It is that they can represent and sample from complex wireless conditions where hand-written simulators are too narrow.

For evaluation, this matters because rare stressors are exactly where a routing system fails: mobility bursts, interference anomalies, correlated outages, and topology shifts. A generative model can help build richer stress suites.

Limitations

Synthetic data is dangerous if treated as truth. Generative models can reproduce training bias, hallucinate unrealistic states, or hide missing physical mechanisms.

Useful for HOPE/IP-HOPE

Use generative models only for stress generation and scenario proposal, not route authority. Tier 4/5/7 evaluation cubes could add generated stress cells, but every major claim should be checked against measured or physics-based traces.

## 30. Source-specific routing

Authors: Matthieu Boutier, Juliusz Chroboczek  
Paper: https://arxiv.org/abs/1403.0445  
Code: N/A  
Model: N/A

TL;DR

WHAT was done? The paper studies source-specific routing, where route choice depends on source address as well as destination.

WHY it matters? In multihomed or policy-rich networks, destination-only routing can choose paths that are wrong for the actual source context.

Review

The paper is a reminder that routing state often needs more dimensions than classic shortest-path formulations expose. Source-specific routing adds one such dimension: the source can determine which route is valid or preferred.

This is not an RF-energy paper, but it has architectural relevance. Many routing failures come from collapsing state too aggressively. If the routing table cannot represent the condition that matters, the protocol will make wrong decisions even with good local metrics.

Limitations

The paper addresses IP routing semantics, not energy harvesting, wireless interference, or mobility. Its direct technical machinery may not transfer to RF-EH routing.

Useful for HOPE/IP-HOPE

The lesson maps cleanly to TERG and Tier 7: route validity can depend on source, gateway, regime, authority domain, energy state, band, and certificate context. IP-HOPE should preserve these dimensions rather than flattening everything into one destination metric.

## Cross-paper synthesis

The papers fall into eight useful mechanisms:

1. Nonlinear RF harvesting: replace linear energy models with sensitivity/saturation-aware harvester profiles.
2. Energy-causal scheduling: model storage, duty cycle, queues, and future energy, not only instantaneous harvest.
3. Physical-interference scheduling: certify simultaneous transmissions under SINR-like constraints, not only graph conflicts.
4. Calibrated uncertainty: make forecast coverage conditional on regime, staleness, node class, and reporting channel.
5. Belief-state planning: treat observation and waiting as route-planning actions.
6. Learned route priors: use GNN/RL models to propose or rank candidates, not to authorize them.
7. Cooperative RF actions: add deliberate energy-transfer, hybrid relay, and RF-shaping actions under certificates.
8. Digital-twin evaluation: separate simulation wins from hardware-consistent wins.

For HOPE specifically, the most important upgrade path is:

```text
HOPE edge weight
  -> nonlinear harvester-aware edge weight
  -> finite-storage / time-expanded edge-state
  -> uncertainty-calibrated route certificate
  -> schedule/MAC feasibility certificate
  -> hardware-calibrated realized trace
```

For IP-HOPE, the main discipline is:

```text
learning and optimization propose;
certificates and ancestor coverage authorize;
hardware-calibrated traces adjudicate.
```

That rule prevents the stack from "solving" HOPE's limitations by replacing clean assumptions with unvalidated learned complexity.
