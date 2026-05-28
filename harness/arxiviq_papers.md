# ArXivIQ Paper Reviews

Source: https://arxiviq.substack.com/archive?sort=new
Generated: 2026-05-28T02:53:18.756Z
Reviews: 373

## Language Models Need Sleep

Post: https://arxiviq.substack.com/p/language-models-need-sleep
Authors: Sangyun Lee, Sean McLeish, Tom Goldstein, Giulia Fanti
Paper: https://arxiv.org/abs/2605.26099
Code: N/A
Model: N/A

TL;DR
WHAT was done? The authors introduce LLM Sleep, a training and inference framework for hybrid attention-SSM architectures that periodically runs N offline recurrent passes over active context to consolidate information into its fast-weight state-space model blocks before clearing the attention key-value cache.
WHY it matters? Vanilla hybrid architectures fail to execute deep reasoning over context that has been evicted from active attention, regardless of their nominal storage capacity. By shifting iterative reasoning compute to an offline “sleep” phase, LLM Sleep decouples the computational depth required for memory consolidation from the strict latency constraints of real-time prediction, unlocking superior multi-hop reasoning and long-context comprehension without increasing inference-phase latency.

## LLMs as Noisy Channels: A Shannon Perspective on Model Capacity and Scaling Laws

Post: https://arxiviq.substack.com/p/llms-as-noisy-channels-a-shannon
Authors: Xu Ouyang, Deyi Liu, Yuhang Cai, Jing Liu, Yuan Yang, Chen Zheng, Thomas Hartvigsen, Yiyuan Ma
Paper: https://arxiv.org/abs/2605.23901
Code: N/A
Model: N/A

TL;DR
WHAT was done? The authors propose the Shannon Scaling Law, a novel unified scaling framework for Large Language Models (LLMs) derived from the classical Shannon-Hartley theorem. By treating training as an information transmission process over a noisy channel, they formulate model parameters as channel bandwidth and training tokens as signal power, successfully unifying standard monotonic scaling behavior with non-monotonic phenomena like catastrophic overtraining and quantization-induced degradation.
WHY it matters? Traditional scaling laws assume infinite monotonic performance gains, yet practitioners increasingly encounter “U-shaped” loss basins where performance degrades due to overtraining or low-bit quantization. The Shannon Scaling Law provides a rigorous theoretical foundation that maps these boundaries, enabling precise resource allocation, cost-efficient compute planning, and highly accurate extrapolation to unseen larger models and longer training runs where standard scaling laws collapse.
Executive summary: For AI researchers and technical managers, this work represents a critical transition from brute-force parameter scaling to optimizing “information density.” By showing that LLM capacity is strictly bounded by cumulative noise (arising from data, model interactions, and architectural limits), the paper provides a mathematical blueprint to identify the exact thresholds where further pretraining, quantization, or fine-tuning will trigger catastrophic capacity collapse.

## Gated DeltaNet-2: Decoupling Erase and Write in Linear Attention

Post: https://arxiviq.substack.com/p/gated-deltanet-2-decoupling-erase
Authors: Ali Hatamizadeh, Yejin Choi, Jan Kautz
Paper: https://arxiv.org/abs/2605.22791
Code: https://github.com/NVlabs/GatedDeltaNet-2
Model: N/A

TL;DR
WHAT was done? The authors developed Gated DeltaNet-2, a linear recurrent attention mechanism featuring “Gated Delta Rule-2.” This architecture decouples the memory update into a channel-wise erase gate acting on the key axis and a channel-wise write gate on the value axis. To make parallel training viable, they derived a chunkwise parallel training formulation that absorbs the channel-wise decay into asymmetric rank-one erase factors, utilizing highly parallelized custom Triton kernels.
WHY it matters? This architecture addresses a core bottleneck in recurrent linear models: the scalar tie between erasing old associations and writing new ones. By decoupling these operations, Gated DeltaNet-2 minimizes memory interference under fixed state capacities, matching or exceeding the long-context retrieval capabilities of standard Transformers while maintaining linear-time scaling. At a 1.3B parameter scale trained on 100B FineWeb-Edu tokens, Gated DeltaNet-2 achieves state-of-the-art results across language modeling, commonsense reasoning, and long-context multi-key retrieval.

## Agentic Systems as Boosting Weak Reasoning Models

Post: https://arxiviq.substack.com/p/agentic-systems-as-boosting-weak
Authors: Varun Sunkaraneni, Pierfrancesco Beneventano, Riccardo Neumarker, Tomaso Poggio, Tomer Galanti
Paper: https://arxiv.org/abs/2605.14163
Code: N/A
Model: N/A

TL;DR
WHAT was done? The paper introduces a theoretical and empirical framework that formalizes agentic committee search as inference-time boosting. By dividing the problem into distinct components—proposal coverage, local identifiability, progress depth, and diversity—the authors show that a lightweight model (GPT-5.4 nano) can be orchestrated using a structured critic-comparator harness to match the standalone performance of frontier models on software engineering benchmarks.
WHY it matters? This matters because it shifts the focus of LLM scaling from monolithic parameter expansion to software-defined inference architectures. It mathematically proves that generation capability does not inherently imply verification capability, establishing that the ultimate limit of test-time scaling is bounded by the underlying proposer’s “blind-spot floor” rather than selection inefficiencies.

## LT2: Linear-Time Looped Transformers

Post: https://arxiviq.substack.com/p/lt2-linear-time-looped-transformers
Authors: Chunyuan Deng, Yizhe Zhang, Rui-jie Zhu, Yuanyuan Xu, Jiarui Liu, T. S. Eugene Ng, and Hanjie Chen
Paper: https://arxiv.org/abs/2605.20670
Code: https://github.com/chili-lab/LT2
Model: https://huggingface.co/chili-lab/Ouro-hybrid-1.4B

TL;DR
WHAT was done? The authors introduce LT2 (Linear-Time Looped Transformers), a family of recursive architectures that replace computationally heavy quadratic softmax attention with subquadratic, linear-time, or sparse token-mixing primitives. Additionally, they propose a hybrid paradigm that mixes different attention variants along both depth and loop dimensions, and establish a multi-stage distillation strategy to convert existing pre-trained looped transformers into linear-time equivalents.
WHY it matters? While standard looped transformers offer supreme parameter efficiency by reusing layers across multiple iterations, their reliance on quadratic self-attention causes the training FLOPs and KV-cache storage to grow quadratically with context length, leading to a computational bottleneck. By integrating linear-time mixers, LT2 breaks this bottleneck, proving theoretically and empirically that looping actively enriches subquadratic mixers—expanding the combinatorial receptive field of sparse attention and increasing the state rank of linear attention—thus enabling highly capable, long-context reasoning in small language models with minimal memory footprint.

## What do Language Models Learn and When? The Implicit Curriculum Hypothesis

Post: https://arxiviq.substack.com/p/what-do-language-models-learn-and
Authors: Emmy Liu, Kaiser Sun, Millicent Li, Isabelle Lee, Lindia Tjuatja, Jen-tse Huang, Graham Neubig
Paper: https://arxiv.org/abs/2604.08510
Code: https://github.com/KaiserWhoLearns/ElementalTask
Model: N/A

TL;DR
WHAT was done? The authors propose and validate the Implicit Curriculum Hypothesis, demonstrating that language models acquire skills during pretraining in a highly stable, compositional, and predictable order across different model families, sizes, and training data mixtures. To verify this, they design a custom suite of 91 simple and compositional tasks, mapping the developmental trajectories of 9 models from 4 major open-weight families spanning 410M to 13B parameters.
WHY it matters? This research shifts the paradigm of pretraining diagnostics away from uninterpretable, smooth validation loss curves and coarse downstream benchmarks toward a structured approach where skill acquisition is predictable and legible. Most remarkably, it proves that the pretraining trajectory of a completely unseen, out-of-distribution compositional task can be predicted solely from the geometric proximity of its task representation (function vector) in the model’s residual stream.

## DMax: Aggressive Parallel Decoding for dLLMs

Post: https://arxiviq.substack.com/p/dmax-aggressive-parallel-decoding
Authors: Zigeng Chen, Gongfan Fang, Xinyin Ma, Ruonan Yu, Xinchao Wang
Paper: https://arxiv.org/abs/2604.08302
Code: https://github.com/czg1225/DMax
Model: N/A

TL;DR
WHAT was done? The authors introduce DMax, a novel training and inference framework designed to unlock aggressive decoding parallelism in Diffusion Language Models (dLLMs). It mitigates the cascading error accumulation that typical parallel decoding methods suffer from by reformulating the standard binary mask-to-token transition into a self-revising continuous trajectory in the embedding space. This is achieved via two core techniques: On-Policy Uniform Training (OPUT), which trains the model on its own predictive distribution to learn self-correction, and Soft Parallel Decoding (SPD), which represents intermediate decoding states as a probability-weighted interpolation between predicted tokens and mask embeddings.
WHY it matters? While non-autoregressive parallel decoding has promised massive throughput improvements, existing masked diffusion models suffer severe generation quality collapse when forced to decode aggressively due to irreversible early errors. DMax successfully bridges this speed-accuracy gap. Applying DMax to the state-of-the-art LLaDA-2.0-mini baseline yields more than a 2.5× improvement in speed (tokens-per-forward) on complex reasoning (GSM8K) and coding (MBPP) benchmarks with negligible accuracy degradation, achieving over 1,300 tokens per second (TPS) on dual H200 GPUs.

## Generative Recursive Reasoning

Post: https://arxiviq.substack.com/p/generative-recursive-reasoning
Authors: Junyeob Baek, Mingyu Jo, Minsu Kim, Mengye Ren, Yoshua Bengio, Sungjin Ahn
Paper: https://arxiv.org/abs/2605.19376
Code: https://ahn-ml.github.io/gram-website
Model: N/A

TL;DR
WHAT was done? The authors introduce Generative Recursive reAsoning Models (GRAM), a probabilistic framework that transforms recursive latent reasoning from a deterministic sequence of updates into a stochastic, multi-trajectory computation. By integrating learned, state-dependent Gaussian residual perturbations into latent transitions and training the system via amortized variational inference, GRAM models both conditional reasoning p θ ​( y ∣ x ) and unconditional generation p θ ​( x ) over continuous-latent trajectories.
WHY it matters? Existing recursive reasoning models suffer from mode collapse in multi-solution landscapes because their state trajectories are fundamentally deterministic. GRAM breaks this bottleneck by enabling width-based inference-time scaling (parallel trajectory sampling) as a latency-friendly complement to traditional depth-based scaling. It consistently outperforms leading deterministic recursive baselines on complex reasoning and constraint-satisfaction tasks (such as Sudoku-Extreme, N-Queens, and Graph Coloring) while remaining parameter-efficient and demonstrating strong unconditional generation capabilities.

## LLMs Improving LLMs: Agentic Discovery for Test-Time Scaling

Post: https://arxiviq.substack.com/p/llms-improving-llms-agentic-discovery
Authors: Tong Zheng, Haolin Liu, Chengsong Huang, Huiwen Bao, Sheng Zhang, Rui Liu, Runpeng Dai, Ruibo Chen, Chenxi Liu, Tianyi Xiong, Xidong Wu, Hongming Zhang, Heng Huang
Paper: https://arxiv.org/abs/2605.08083
Code: https://github.com/zhengkid/AutoTTS
Model: N/A

TL;DR
WHAT was done? A consortium of researchers (spanning UMD, UVA, Google, Meta, and others) introduced AutoTTS, an environment-driven framework that uses an explorer LLM to automatically synthesize and discover test-time scaling (TTS) algorithms. By formulating inference compute allocation as a policy search within an offline replay environment, the system autonomously designs reasoning controllers that dictate when a language model should branch, probe, prune, or terminate.
WHY it matters? Test-time scaling is currently dominated by manually engineered heuristics (e.g., self-consistency, early stopping). AutoTTS demonstrates a paradigm shift where researchers construct discovery environments rather than hand-crafting algorithms. The resulting AI-discovered strategy, the Confidence Momentum Controller, achieves superior accuracy-cost Pareto frontiers, reducing inference token usage by nearly 70% compared to standard self-consistency, all for a total discovery compute cost of just under $40.

## All Circuits Lead to Rome: Rethinking Functional Anisotropy in Circuit and Sheaf Discovery for LLMs

Post: https://arxiviq.substack.com/p/all-circuits-lead-to-rome-rethinking
Authors: Xi Chen, Mingyu Jin, Jingcheng Niu, Yutong Yin, Jinman Zhao, Bangwei Guo, Dimitris N. Metaxas, Zhaoran Wang, Yutao Yue, Gerald Penn
Paper: https://arxiv.org/abs/2605.12671
Code: https://github.com/TonyXiChen/OASR
Model: N/A

TL;DR
WHAT was done? The authors introduced Overlap-Aware Sheaf Repulsion (OASR) to demonstrate that large language models (LLMs) contain multiple, functionally equivalent, and nearly non-overlapping computational subgraphs that independently execute the same task, fundamentally challenging the prevailing assumption of unique canonical circuits.
WHY it matters? This shifts the mechanistic interpretability paradigm from a reductionist search for a single ground-truth circuit to a distributive framework. It implies that aligning, editing, or evaluating models based on single sub-networks may fail, as parallel, highly redundant mechanisms can seamlessly sustain the underlying behavior.

## ELF: Embedded Language Flows

Post: https://arxiviq.substack.com/p/elf-embedded-language-flows
Authors: Keya Hu, Linlu Qiu, Yiyang Lu, Hanhong Zhao, Tianhong Li, Yoon Kim, Jacob Andreas, Kaiming He
Paper: https://arxiv.org/abs/2605.10938
Code: https://github.com/lillian039/ELF
Model: N/A

TL;DR
WHAT was done? The authors introduced Embedded Language Flows (ELF), a novel continuous diffusion language model utilizing continuous-time Flow Matching. ELF operates entirely within a high-dimensional continuous embedding space, using a shared-weight network to perform denoising, and applies discretization to map embeddings back to discrete tokens exclusively at the final generative time step.
WHY it matters? This framework successfully challenges the prevailing assumption that text generation requires inherently discrete diffusion algorithms. By demonstrating superior generation quality with significantly fewer sampling steps and requiring a magnitude fewer training tokens than leading discrete models, ELF paves the way for unifying the underlying architectures of text, image, and video generative systems.
Executive summary: For research scientists and technical leaders evaluating the next generation of multimodal architectures, the bifurcation between continuous diffusion for vision and discrete diffusion (or autoregression) for language has been a persistent architectural friction. ELF demonstrates that the historical underperformance of continuous diffusion language models stems from design choices—specifically, intermediate per-step discretization—rather than an innate incompatibility with language. By leveraging a single shared-weight network for both the continuous flow and the final discrete projection, ELF allows language models to inherit the scaling laws, training stability, and sampling techniques (like classifier-free guidance) that have recently propelled image generation models.

## On Training in Imagination

Post: https://arxiviq.substack.com/p/on-training-in-imagination
Authors: Nadav Timor, Ravid Shwartz-Ziv, Micah Goldblum, Yann LeCun, David Harel
Paper: https://arxiv.org/abs/2605.06732v2
Code: N/A
Model: N/A

TL;DR
WHAT was done? The authors provide a theoretical and empirical framework that decomposes the return error in model-based reinforcement learning into independent dynamics and reward components. By applying power-law scaling to these distinct error sources, they derive a closed-form solution for optimally allocating a fixed data budget between environment transitions and reward annotations.
WHY it matters? In modern paradigms like Reinforcement Learning from Human Feedback (RLHF) and robotics, reward labels (human preferences or expert evaluations) are significantly more expensive than raw environmental state transitions. This work replaces heuristic hyperparameter tuning with a mathematically rigorous strategy for data collection, proving that the different scaling behaviors of dynamics and reward models dictate fundamentally asymmetric budget allocations.
Executive summary: For research leaders and infrastructure engineers building large-scale world models, this paper delivers a critical mathematical insight: reward models learn much faster than dynamics models. Consequently, data acquisition pipelines should heavily index on transition data over reward annotations. Furthermore, the analysis demonstrates that when constrained by a fixed budget, purchasing high volumes of cheap, noisy reward labels is often mathematically superior to procuring a small batch of high-fidelity, expensive labels, provided the noise is zero-mean.

## TurboQuant: Online Vector Quantization with Near-optimal Distortion Rate

Post: https://arxiviq.substack.com/p/turboquant-online-vector-quantization
Authors: Amir Zandieh, Majid Daliri, Majid Hadian, Vahab Mirrokni
Paper: https://arxiv.org/abs/2504.19874v1
Code: N/A + Unofficial
Model: N/A

TL;DR
WHAT was done? Researchers from Google and NYU introduced TurboQuant, a two-stage, data-oblivious vector quantization algorithm. It achieves near-optimal distortion rates by randomly rotating high-dimensional vectors to induce a stable Beta distribution, applying optimal scalar quantization, and utilizing a 1-bit sketch on the residual to ensure unbiased inner product estimation.
WHY it matters? For memory-bound AI infrastructure—specifically Large Language Model (LLM) KV caches and massive-scale vector databases—offline preprocessing and data-dependent codebook training are paralyzing bottlenecks. TurboQuant provides a highly vectorized, zero-overhead indexing alternative that matches information-theoretic limits, allowing for aggressive compression without sacrificing long-context retrieval or retrieval-augmented generation (RAG) performance.

## A Single Neuron Is Sufficient to Bypass Safety Alignment in Large Language Models

Post: https://arxiviq.substack.com/p/a-single-neuron-is-sufficient-to
Authors: Hamid Kazemi, Atoosa Chegini, Maria Safi
Paper: https://arxiv.org/abs/2605.08513v1
Code: N/A
Model: N/A

TL;DR
WHAT was done? The researchers demonstrated that safety alignment in modern Large Language Models (LLMs) is mediated by isolated, individual MLP neurons rather than being robustly distributed across the network. By identifying and intervening on a single “refusal neuron,” they successfully bypassed safety guardrails; conversely, by amplifying a single “concept neuron,” they induced specific harmful content from completely benign prompts.
WHY it matters? This finding fundamentally challenges the prevailing assumption that standard alignment techniques (like RLHF or fine-tuning) create a distributed, highly resilient safety substrate. Revealing that a model’s safety perimeter possesses a single-point failure exposes a severe architectural fragility, necessitating new alignment paradigms that genuinely distribute safety knowledge to withstand surgical white-box interventions.
Executive summary: For AI strategists and model builders, this paper highlights a critical vulnerability in current frontier and open-weight models. Despite millions of parameters dedicated to safety fine-tuning, the actual gating mechanism for declining harmful requests condenses down to a single neuron. Furthermore, this is not merely a refusal vulnerability; the underlying harmful knowledge is similarly bottlenecked in specific “concept neurons.” This indicates that our current safety training does not overwrite harmful capabilities or distribute robust ethical representations, but merely wires a brittle, single-component tripwire that can be trivially bypassed at inference time.

## World Model for Robot Learning: A Comprehensive Survey

Post: https://arxiviq.substack.com/p/world-model-for-robot-learning-a
Authors: Bohan Hou, Gen Li, Jindou Jia, Tuo An, Xinying Guo, Sicong Leng, Haoran Geng, Yanjie Ze, Tatsuya Harada, Philip Torr, Oier Mees, Marc Pollefeys, Zhuang Liu, Jiajun Wu, Pieter Abbeel, Jitendra Malik, Yilun Du, Jianfei Yang
Paper: https://arxiv.org/abs/2605.00080v1
Code: https://github.com/NTUMARS/Awesome-World-Model-for-Robotics-Policy
Model: N/A

TL;DR
WHAT was done? This paper provides a comprehensive, policy-centric taxonomy of how world models are integrated into robotic learning. It systematically categorizes the field across architectural paradigms (from decoupled pipelines to unified single-backbones) and functional roles (from passive video predictors to interactive reinforcement learning simulators), with a specific emphasis on the emergence of Multimodal Large Language Models (MLLMs) as internal dynamics engines.
WHY it matters? Purely reactive Vision-Language-Action (VLA) models are reaching a performance ceiling in long-horizon reasoning and robustness against compounding errors. By injecting explicit predictive structures, world models—particularly those internalizing "what happens next" logic within MLLM transformer layers—provide the necessary causal foresight, physical grounding, and synthetic data amplification required to push embodied intelligence toward reliable, closed-loop deployment in complex real-world environments.
Executive summary: The survey fundamentally redefines the utility of world models in robotics. It argues that perceptual realism is secondary to action-conditioned consistency and functional utility. By unifying disparate modeling architectures under a shared probabilistic framework, the authors map out a strategic transition: we are moving away from isolated video generation models toward internalized cognitive substrates that allow robots to imagine, plan, and self-correct before committing to physical action.

## Fast Byte Latent Transformer

Post: https://arxiviq.substack.com/p/fast-byte-latent-transformer
Authors: Julie Kallini, Artidoro Pagnoni, Tomasz Limisiewicz, Gargi Ghosh, Luke Zettlemoyer, Christopher Potts, Xiaochuang Han, Srinivasan Iyer
Paper: https://arxiv.org/abs/2605.08044v1
Code: N/A
Model: N/A

TL;DR
WHAT was done? The authors introduce three novel generation techniques—BLT Diffusion (BLT-D), BLT Self-speculation (BLT-S), and BLT Diffusion+Verification (BLT-DV)—to enable parallel byte decoding in hierarchical language models. By utilizing block-wise discrete diffusion and internal self-speculation, they bypass strict byte-by-byte autoregressive bottlenecks.
WHY it matters? Byte-level architectures inherently resolve subword tokenization flaws (like adversarial fragility and multilingual disparity) but have been crippled by slow inference speeds. By dramatically reducing memory bandwidth costs—by up to 92% in some configurations—these techniques render tokenizer-free foundation models computationally competitive for real-world deployment.

## Compute Optimal Tokenization

Post: https://arxiviq.substack.com/p/compute-optimal-tokenization
Authors: Tomasz Limisiewicz, Artidoro Pagnoni, Srini Iyer, Mike Lewis, Sachin Mehta, Alisa Liu, Margaret Li, Gargi Ghosh, Luke Zettlemoyer
Paper: https://arxiv.org/abs/2605.01188v1
Code: https://co-tok.github.io
Model: N/A

TL;DR
WHAT was done? The authors systematically derived compression-aware neural scaling laws by training nearly 1,300 models to determine how information granularity (bytes per token) impacts optimal compute allocation.
WHY it matters? This work proves that the widely accepted heuristic of scaling models by 20 tokens per parameter is an artifact of specific subword tokenizers. Establishing a tokenizer-agnostic scaling law based on bytes provides a robust framework for maximizing compute efficiency across diverse languages and modalities.
Executive summary: For research teams optimizing large-scale pre-training runs, the tokenization scheme is often treated as a static preprocessing step. This paper reframes tokenization as a dynamic scaling variable. By optimizing the “compression rate” (information density), the authors demonstrate that training data should scale proportionally to model parameters in bytes, not tokens. Furthermore, they reveal that the optimal compression rate is compute-dependent, requiring lower compression as FLOP budgets scale up, thus offering a new blueprint for training highly efficient, massively multilingual foundation models.

## Manifold Steering Reveals the Shared Geometry of Neural Network Representation and Behavior

Post: https://arxiviq.substack.com/p/manifold-steering-reveals-the-shared
Authors: Daniel Wurgaft, Can Rager, Matthew Kowal, Vasudev Shyam, Sheridan Feucht, Usha Bhalla, Tal Haklay, Eric Bigelow, Raphael Sarfati, Thomas McGrath, Owen Lewis, Jack Merullo, Noah D. Goodman, Thomas Fel, Atticus Geiger, Ekdeep Singh Lubana
Paper: https://arxiv.org/abs/2605.05115v1
Code: https://github.com/goodfire-ai/causalab/tree/manifold_steering
Model: LLaMA 3.1 8B, LLaMA 3.1 70B

TL;DR
WHAT was done? The authors introduce “manifold steering,” a novel intervention technique that navigates the curved, non-linear geometric structures of neural representations rather than assuming a flat, Euclidean latent space. By fitting splines to both internal activations and external output distributions, they demonstrate a bidirectional isometry between these two spaces. Steering models along these intrinsic internal curves directly induces smooth, natural trajectories in the model’s output behavior.
WHY it matters? This work challenges the pervasive Linear Representation Hypothesis (LRH) which dictates that concepts are encoded as straight vectors. By proving that respecting intrinsic geometry is necessary for coherent causal interventions, this research provides a principled mechanism to mitigate common steering pathologies like “teleportation” (unnatural intermediate states) and diversity collapse. It suggests that the proper unit of causal analysis in foundation models is not a linear direction, but an intrinsic coordinate on a representation manifold.
Executive summary: For non-technical stakeholders and domain experts, steering AI models has historically relied on pushing their internal states in straight lines, which often forces the model into unnatural, error-prone intermediate states. This paper proves that neural networks actually organize concepts in curved, geometric shapes ( see also ). By building a mathematical framework that strictly follows these internal curves, we can control foundation models smoothly and reliably, fundamentally upgrading our ability to align and guide AI systems without breaking their internal logic.

## Sparser, Faster, Lighter Transformer Language Models

Post: https://arxiviq.substack.com/p/sparser-faster-lighter-transformer
Authors: Edoardo Cetin, Stefano Peluchetti, Emilio Castillo, Akira Naruse, Mana Murakami, Llion Jones (Sakana AI & NVIDIA)
Paper: https://arxiv.org/abs/2603.23198
Code: https://github.com/SakanaAI/sparser-faster-llms
Model: N/A

TL;DR
WHAT was done? The authors present a hardware-native execution framework that accelerates large language models by exploiting unstructured activation sparsity. They introduce a novel memory packing format (TwELL), dynamic hybrid training representations, and a suite of custom CUDA kernels that seamlessly fuse sparse data materialization with computation.
WHY it matters? This research resolves a fundamental bottleneck in modern AI systems: the paradox where theoretically cheaper sparse matrix multiplications run slower than dense ones on GPUs due to misaligned memory access patterns. By proving that 99% unstructured sparsity can be translated into >20% wall-clock speedups without architectural surgery, this approach establishes a practical, deployable lever for scaling foundation models efficiently.

## A Theory of Generalization in Deep Learning

Post: https://arxiviq.substack.com/p/a-theory-of-generalization-in-deep
Authors: Elon Litman, Gabe Guo
Paper: https://arxiv.org/abs/2605.01172v1
Code: N/A
Model: N/A

TL;DR
WHAT was done? Researchers from Stanford University present a non-asymptotic theory of generalization proving that the evolving empirical Neural Tangent Kernel partitions a network’s output space into a test-visible signal channel and a test-invisible noise reservoir. From this theory, they derive a zero-overhead optimizer modification for AdamW that directly estimates and minimizes population risk via a per-parameter gradient variance gate.
WHY it matters? This framework finally moves the mathematical understanding of neural networks past the restrictive “lazy” (frozen-kernel) regime into full feature learning. By dynamically filtering out parameter updates where batch noise dominates signal, the method practically eliminates the need for early stopping, accelerates grokking by 5x, and significantly reduces policy drift in noisy alignment tasks like Direct Preference Optimization (DPO).

## Learning to Forget: Continual Learning with Adaptive Weight Decay

Post: https://arxiviq.substack.com/p/learning-to-forget-continual-learning
Authors: Aditya A. Ramesh, Alex Lewandowski, Jürgen Schmidhuber
Paper: https://arxiv.org/abs/2604.27063v1
Code: https://github.com/Aditya-Ramesh-10/Fade
Model: N/A

TL;DR
WHAT was done? The authors introduce Forgetting through Adaptive DEcay (FADE), an online, meta-learning algorithm that assigns dynamic, per-parameter weight decay rates to a network’s parameters. Using forward-mode meta-gradient descent, FADE selectively modulates how quickly individual weights forget their past states based on prediction error.
WHY it matters? In continual learning scenarios with non-stationary data streams and finite model capacity, a network must navigate the stability-plasticity trade-off. Standard scalar weight decay acts as a global regularizer, erasing both stale mapping and stable knowledge uniformly. FADE resolves this by automating judicious parameter-specific forgetting, significantly improving performance and mitigating the loss of plasticity without increasing architectural complexity.
Executive summary: For technical leaders and AI strategists, this paper provides a highly efficient, O ( d ) method to automate parameter-specific forgetting in neural networks. By shifting weight decay from a static regularization penalty to a dynamic mechanism, the algorithm effectively halves the tracking error compared to standard optimizers like AdamW. This capability is foundational for deploying bounded-capacity agents into perpetual-learning environments where task boundaries are unknown and data is entirely non-stationary.

## SkillClaw: Let Skills Evolve Collectively with Agentic Evolver

Post: https://arxiviq.substack.com/p/skillclaw-let-skills-evolve-collectively
Authors: Ziyu Ma, Shidong Yang, Yuxiang Ji, Xucong Wang, Yong Wang, Yiming Hu, Tongwen Huang, Xiangxiang Chu
Paper: https://arxiv.org/abs/2604.08377
Code: https://github.com/AMAP-ML/SkillClaw
Model: N/A

TL;DR
WHAT was done? The authors proposed SkillClaw, a framework that transitions large language model agents from using static, pre-defined procedural skills to dynamic, self-improving skill ecosystems. The system aggregates execution trajectories across multiple users and employs an autonomous “agentic evolver” to iteratively refine or create skills in a shared centralized repository.
WHY it matters? This matters because contemporary agent deployments suffer from fragmented learning; individual instances repeatedly stumble on identical edge cases and failure modes. By establishing a formalized loop of collective evidence gathering, open-ended reasoning, and empirical validation, this framework enables monotonic, system-wide accumulation of procedural intelligence without requiring manual engineering interventions.

## Learning is Forgetting: LLM Training As Lossy Compression

Post: https://arxiviq.substack.com/p/learning-is-forgetting-llm-training
Authors: Henry C. Conklin, Tom Hosking, Tan Yi-Chern, Julian Gold, Jonathan D. Cohen, Thomas L. Griffiths, Max Bartolo, Seraphina Goldfarb-Tarrant
Paper: https://arxiv.org/abs/2604.07569v1
Code: https://github.com/hcoxec/soft_h
Model: N/A

TL;DR
WHAT was done? Researchers from Princeton University and Cohere successfully applied Information Bottleneck (IB) theory to large language models of up to 32 billion parameters. By introducing a differentiable “soft-entropy estimator,” they mapped the pre-training trajectories of large transformers onto the information plane, revealing that training follows a distinct two-phase process: an initial expansion of representations to fit target labels, followed by a prolonged compression phase where irrelevant input data is forgotten.
WHY it matters? This work provides a holistic, model-wide alternative to mechanistic interpretability. It demonstrates that the degree to which a model approaches the optimal limit of lossy compression strictly predicts its performance on complex downstream benchmarks ( r =0.52) and human preference alignment ( r =0.76). Consequently, this introduces a viable path to use unsupervised information-theoretic metrics for early stopping and model selection, drastically reducing reliance on compute-heavy, task-specific evaluation suites.

## Odysseus: Scaling VLMs to 100+ Turn Decision-Making in Games via Reinforcement Learning

Post: https://arxiviq.substack.com/p/odysseus-scaling-vlms-to-100-turn
Authors: Chengshuai Shi, Wenzhe Li, Xinran Liang, Yizhou Lu, Wenjia Yang, Ruirong Feng, Seth Karten, Ziran Yang, Zihan Ding, Gabriel Sarch, Danqi Chen, Karthik Narasimhan, Chi Jin
Paper: https://arxiv.org/abs/2605.00347
Code: https://odysseus-project.github.io/
Model: N/A

TL;DR
WHAT was done? The authors introduce Odysseus, an open reinforcement learning framework designed to scale Vision-Language Models (VLMs) to continuous decision-making tasks requiring over 100 interaction turns. By coupling a large VLM policy with a remarkably lightweight Convolutional Neural Network (CNN) critic and applying positive-advantage filtering, the framework circumvents the computational and stability bottlenecks of traditional multi-modal actor-critic methods.
WHY it matters? Current RL fine-tuning for foundation models typically struggles to progress beyond 20–30 turn horizons or relies heavily on purely supervised imitation learning. By demonstrating that temporal credit assignment can be effectively delegated to a tiny, visually-focused critic, this work provides a computationally tractable blueprint for transforming passive reasoning models into robust embodied agents capable of deep, long-term environmental interaction.

## Scaling Test-Time Compute for Agentic Coding

Post: https://arxiviq.substack.com/p/scaling-test-time-compute-for-agentic
Authors: Joongwon (Daniel) Kim, Winnie Yang, Kelvin Niu, Hongming Zhang, Yun Zhu, Eryk Helenowski, Ruan Silva, Zhengxing Chen, Srini Iyer, Manzil Zaheer, Daniel Fried, Hannaneh Hajishirzi, Sanjeev Arora, Gabriel Synnaeve, Ruslan Salakhutdinov, Anirudh Goyal
Paper: https://arxiv.org/abs/2604.16529
Code: N/A
Model: N/A

TL;DR
WHAT was done? Researchers from Meta and their academic collaborators introduced a framework for scaling test-time compute in long-horizon coding agents. They transitioned away from using raw execution trajectories in favor of structured summaries, deploying a Recursive Tournament Voting (RTV) algorithm for parallel selection and an adapted Parallel-Distill-Refine (PDR) method for sequential reasoning.
WHY it matters? This work isolates the primary bottleneck in autonomous agent scaling: information representation. By proving that models cannot effectively adjudicate or learn from noisy, raw interaction logs, the authors provide a scalable methodology to push frontier models significantly higher on complex benchmarks without additional pre-training.
Executive summary: For practitioners designing system-2 architectures, this paper demonstrates that allocating more compute at inference time yields diminishing returns if the underlying experience is not compressed. Converting raw agentic trajectories into distilled representations allows models to reliably cross-pollinate ideas from failed attempts, drastically reducing the step-count for subsequent solutions and setting a new architectural standard for software engineering agents.

## Convergent Evolution: How Different Language Models Learn Similar Number Representations

Post: https://arxiviq.substack.com/p/convergent-evolution-how-different
Authors: Deqing Fu, Tianyi Zhou, Mikhail Belkin, Vatsal Sharan, Robin Jia
Paper: https://arxiv.org/abs/2604.20817
Code: N/A
Model: https://hf.co/collections/deqing/convergent-evolution

TL;DR
WHAT was done? The authors systematically investigate why diverse language models naturally develop periodic representations for numerical tokens. They identify a two-tiered hierarchy separating “spectral convergence” (the universal emergence of Fourier spikes in embedding spaces) from “geometric convergence” (the functional ability to linearly classify a number modulo a period).
WHY it matters? This work introduces a critical theoretical check for mechanistic interpretability. It proves that visually prominent structures in a model’s representation space do not guarantee that the model has learned a functional algorithm, challenging the assumption that shared statistical artifacts inherently equal shared reasoning capabilities.
Executive summary: Researchers frequently interpret periodic patterns in large language model (LLM) embeddings as evidence of learned modular arithmetic. This paper demonstrates that these Fourier signatures are merely a ubiquitous artifact of dataset token frequencies—appearing even in classical word embeddings or raw, untrained data distributions. However, true functional utility, measured by linear separability of residue classes, selectively emerges only when the architecture, optimizer, and specific text-number co-occurrence data align. By mapping this phenomenon as a form of “convergent evolution,” the paper provides a rigorous framework for distinguishing superficial statistical mimicry from genuine functional feature learning.

## Micro Language Models Enable Instant Responses

Post: https://arxiviq.substack.com/p/micro-language-models-enable-instant
Authors: Wen Cheng, Tuochao Chen, Karim Helwani, Sriram Srinivasan, Luke Zettlemoyer, Shyamnath Gollakota
Paper: https://arxiv.org/abs/2604.19642v1
Code: https://github.com/Sensente/micro_language_model_swen_project
Model: N/A

TL;DR
WHAT was done? Researchers from the University of Washington and Meta AI introduce micro language models ( μ LMs) ranging from 8M to 30M parameters, designed to execute an asymmetric “commit-and-continue” generation protocol. The on-device μ LM instantly generates and commits the first 4–8 words of a response to mask network latency, while a cloud-based large language model uses this prefix as a seed to seamlessly complete the response.
WHY it matters? This paradigm overcomes the strict thermal and memory constraints of wearable devices like smartwatches and smart glasses. By reframing the cloud model as a continuator rather than a primary respondent, the system achieves sub-50ms Time to First Token (TTFT) and high-quality generation, effectively bypassing the multi-second queuing and network round-trip delays inherent to cloud-only AI assistants.

## ELT: Elastic Looped Transformers for Visual Generation

Post: https://arxiviq.substack.com/p/elt-elastic-looped-transformers-for
Authors: Sahil Goyal, Swayam Agrawal, Gautham Govind Anil, Prateek Jain, Sujoy Paul, Aditya Kusupati
Paper: https://arxiv.org/abs/2604.09168
Code: N/A
Model: N/A

TL;DR
WHAT was done? The authors introduced Elastic Looped Transformers (ELT), a highly parameter-efficient recurrent architecture for visual generation. By iteratively applying a single, weight-shared block of transformer layers and training it via a novel Intra-Loop Self Distillation (ILSD) algorithm, the model supports dynamic inference. This enables varying computational budgets (loop counts) at test time without retraining.
WHY it matters? This approach effectively decouples a generative model’s parameter count from its computational depth. By maintaining a minimal memory footprint that fits entirely on an accelerator’s on-chip memory (SRAM), ELT circumvents the “memory wall” of slow HBM transfers. The method matches state-of-the-art visual fidelity with a 4x reduction in parameters, offering a flexible test-time compute lever for both resource-constrained edge devices and high-end cloud rendering.
Executive summary: For practitioners scaling generative vision architectures, simply stacking more unique transformer layers has diminishing returns due to severe memory transfer bottlenecks. This paper demonstrates that recursive architectural depth, when explicitly regularized for early exits via self-distillation, provides identical representational power to massive feedforward stacks. The resulting model can halt its internal iterations dynamically at inference, granting engineers a continuous pareto frontier of latency versus quality from a single training run.

## SGD at the Edge of Stability: The Stochastic Sharpness Gap

Post: https://arxiviq.substack.com/p/sgd-at-the-edge-of-stability-the
Authors: Fangshuo Liao, Afroditi Kolomvaki, Anastasios Kyrillidis
Paper: https://arxiv.org/abs/2604.21016
Code: N/A
Model: N/A

TL;DR
WHAT was done? The authors extended the self-stabilization theory of gradient descent to the stochastic regime. They identified that mini-batch gradient noise strengthens a cubic sharpness-reducing force in the loss landscape, explicitly deriving a closed-form formula for the “Stochastic Sharpness Gap”—the exact magnitude by which stochastic gradient descent (SGD) suppresses sharpness below the classical 2/ η instability threshold.
WHY it matters? This theoretical breakthrough formally connects two critical phenomena in deep learning: the Edge of Stability (EoS) and the implicit regularization of small batch sizes. By mathematically proving that higher gradient noise (via smaller batches) directly forces optimization into flatter minima, this work provides a rigorous mechanical foundation for hyperparameter scaling laws, moving the field beyond empirical heuristics toward precise, predictable landscape control.

## Agentic World Modeling: Foundations, Capabilities, Laws, and Beyond

Post: https://arxiviq.substack.com/p/agentic-world-modeling-foundations
Authors: Meng Chu, Xuan Billy Zhang, Kevin Qinghong Lin, Lingdong Kong, Jize Zhang, Teng Tu, Weijian Ma, Ziqi Huang, Senqiao Yang, Wei Huang, Yeying Jin, Zhefan Rao, Jinhui Ye, Xinyu Lin, Xichen Zhang, Qisheng Hu, Shuai Yang, Leyang Shen, Wei Chow, Yifei Dong, Fengyi Wu, Quanyu Long, Bin Xia, Shaozuo Yu, Mingkang Zhu, Wenhu Zhang, Jiehui Huang, Haokun Gui, Haoxuan Che, Long Chen, Qifeng Chen, Wenxuan Zhang, Wenya Wang, Xiaojuan Qi, Yang Deng, Yanwei Li, Mike Zheng Shou, Zhi-Qi Cheng, See-Kiong Ng, Ziwei Liu, Philip Torr, Jiaya Jia
Paper: https://arxiv.org/abs/2604.22748
Code: https://github.com/matrix-agent/awesome-agentic-world-modeling
Model: N/A

TL;DR
WHAT was done? The authors synthesize over 400 research works to propose a unified, two-dimensional “levels × laws” taxonomy for world models. They organize the field into three capability hierarchies: L1 Predictor (one-step local transitions), L2 Simulator (multi-step, constraint-adhering rollouts), and L3 Evolver (autonomous, evidence-driven model revision). This hierarchy intersects four governing-law regimes—physical, digital, social, and scientific—mapping what rules a simulated environment must obey. Additionally, they propose a Minimal Reproducible Evaluation Package (MREP) focused on decision-centric metrics over aesthetic visual generation.
WHY it matters? The term “world model” has fractured across communities, often erroneously conflating high-fidelity video generation with actual decision-usable simulation. By strictly defining boundaries based on intervention sensitivity, long-horizon coherence, and autonomous model updating, this framework provides a rigorous diagnostic tool for researchers. It shifts the benchmark of success from perceptual realism to whether a model can actively refine its internal laws through deployment evidence, charting a concrete roadmap toward neuro-symbolic, self-improving agentic ecosystems.

## Hyperloop Transformers

Post: https://arxiviq.substack.com/p/hyperloop-transformers
Authors: Abbas Zeitoun, Lucas Torroba-Hennigen, Yoon Kim (Massachusetts Institute of Technology)
Paper: https://arxiv.org/abs/2604.21254
Code: N/A
Model: N/A

TL;DR
WHAT was done? The authors introduce the Hyperloop Transformer, a novel parameter-efficient language model architecture that combines a “middle-cycle” parameter-sharing strategy with manifold-constrained hyper-connections applied strictly at loop boundaries. This approach expands the standard one-dimensional residual stream into a matrix-valued parallel stream, allowing the shared layers to adapt more flexibly to different depths.
WHY it matters? Deploying high-capability LLMs on edge devices (e.g., smartphones with 8GB–16GB RAM) is bottlenecked by the model’s memory footprint, not just compute. Historically, weight-sharing architectures like looped Transformers underperform depth-matched standard models in perplexity. This work bridges that gap, demonstrating that a carefully engineered matrix residual stream allows a model with 50% fewer parameters to outperform its unlooped, full-parameter counterpart, while seamlessly maintaining robustness under post-training 4-bit quantization.

## Decoupled DiLoCo for Resilient Distributed Pre-training

Post: https://arxiviq.substack.com/p/decoupled-diloco-for-resilient-distributed
Authors: Arthur Douillard, Keith Rush, Yani Donchev, Zachary Charles, Nova Fallen, Ayush Dubey, Ionel Gog, Josef Dean, Blake Woodworth, Zachary Garrett, Nate Keating, Jenny Bishop, Henry Prior, Edouard Yvinec, Arthur Szlam, Marc’Aurelio Ranzato, Jeff Dean
Paper: https://arxiv.org/abs/2604.21428
Code: N/A
Model: N/A

TL;DR
WHAT was done? The authors introduce Decoupled DiLoCo, a distributed pre-training framework that replaces the tightly coupled Single Program Multiple Data (SPMD) paradigm with a fully asynchronous architecture. By dividing compute into independent “learners” that communicate parameter fragments to a central, CPU-based synchronizer via a minimum-quorum and adaptive grace-window system, the framework isolates hardware failures and eliminates lock-step synchronization barriers.
WHY it matters? This matters because the conventional SPMD approach is fundamentally bottlenecked by hardware reliability at scale; a single chip failure or transient straggler can stall an entire massive cluster. By treating pre-training as a distributed systems problem—prioritizing availability and partition tolerance over strict parameter consistency—this method maintains zero global downtime and near-optimal goodput under massive simulated hardware failures. It enables the practical use of geographically distributed, heterogeneous, and preemptible hardware to train large-scale foundation models without degrading downstream performance.
Executive summary: For technical managers and infrastructure leaders, this paper presents a highly practical blueprint for escaping the stringent hardware reliability limits of frontier AI training. By allowing parts of a computing cluster to operate independently and sync asynchronously, organizations can combine cheaper, less reliable, or geographically separated chips—even mixing older hardware generations—to train massive models without downtime or a drop in final intelligence.

## Universal Transformers Need Memory: Depth-State Trade-offs in Adaptive Recursive Reasoning

Post: https://arxiviq.substack.com/p/universal-transformers-need-memory
Authors: Grigory Sapunov
Paper: https://arxiv.org/abs/2604.21999v2
Code: https://github.com/che-shr-cat/utm-jax
Model: N/A

TL;DR
WHAT was done? The authors (suddenly it’s me this time) introduced a single-block Universal Transformer augmented with explicit memory tokens and an adjusted Adaptive Computation Time (ACT) mechanism. They demonstrated that resolving a subtle routing initialization trap enables this compact model to solve complex combinatorial reasoning tasks like Sudoku-Extreme, provided it is equipped with sufficient internal memory capacity.
WHY it matters? This work provides compelling empirical evidence that architectural depth—even when rendered dynamically adaptive—is insufficient for complex reasoning without a persistent, localized state space. By diagnosing and correcting a long-standing failure mode in ACT initialization, this research charts a more stable path toward parameter-efficient, recursive “System 2” reasoning models capable of scaling inference-time compute.
Executive summary: For practitioners exploring inference-time scaling and recursive reasoning loops, this paper highlights a critical oversight in classical adaptive computation networks. A weight-shared transformer block fundamentally requires dedicated memory tokens to act as a computational scratchpad. Furthermore, standard zero-bias or positive-bias initializations for adaptive routing frequently lock models into a shallow-halt equilibrium. By simply inverting this initialization bias to force deep early processing, the authors drastically stabilized training and unlocked specialized attention mechanisms, validating the method on notoriously difficult reasoning benchmarks.
See also the post about the UTM-Jax, code behind this paper.

## SAW-INT4: System-Aware 4-Bit KV-Cache Quantization for Real-World LLM Serving

Post: https://arxiviq.substack.com/p/saw-int4-system-aware-4-bit-kv-cache
Authors: Jinda Jia, Jisen Li, Zhongzhu Zhou, Jung Hwan Heo, Jue Wang, Tri Dao, Shuaiwen Leon Song, Ben Athiwaratkun, Chenfeng Xu, Tianyi Zhang, Xiaoxia Wu
Paper: https://arxiv.org/abs/2604.19157
Code: https://github.com/togethercomputer/saw-int4
Model: N/A

TL;DR
WHAT was done? The authors present SAW-INT4, a framework that successfully deploys token-wise 4-bit KV-cache quantization using Block-Diagonal Hadamard Rotation (BDR). By architecting the method as a fused CUDA kernel entirely compatible with modern paged-memory layouts, they achieve near-lossless 4-bit compression without the throughput penalties typically associated with complex quantization techniques.
WHY it matters? In production environments handling long-context inference (e.g., millions of tokens), memory bandwidth and capacity are the absolute limits on scaling. This work demonstrates that algorithmic compression metrics are irrelevant if they violate hardware constraints like memory coalescing or continuous batching. By prioritizing system compatibility over theoretical representational capacity, the authors provide a viable blueprint for doubling concurrent serving capacity.
Executive summary: For machine learning practitioners engineering LLM infrastructure, managing KV-cache memory remains an acute operational bottleneck. While many existing compression strategies achieve impressive offline accuracy, their irregular memory access patterns actively degrade hardware throughput. This paper proves that a lightweight, static mathematical rotation mitigates the accuracy degradation of naive INT4 quantization while introducing zero measurable latency overhead, fundamentally positioning effective KV-cache compression as a systems co-design problem.

## Scaling Self-Play with Self-Guidance

Post: https://arxiviq.substack.com/p/scaling-self-play-with-self-guidance
Authors: Luke Bailey, Kaiyue Wen, Kefan Dong, Tatsunori Hashimoto, Tengyu Ma
Paper: https://arxiv.org/abs/2604.20209v1
Code: https://github.com/LukeBailey181/sgs
Model: N/A

TL;DR
WHAT was done? Researchers at Stanford University introduce Self-Guided Self-Play (SGS), an asymmetric self-play algorithm for formal theorem proving. It mitigates the common issue of reward hacking in curriculum generation by introducing a language model “Guide” that explicitly evaluates synthetic problems for mathematical elegance and relevance, preventing the task generator from collapsing into degenerate outputs.
WHY it matters? Sustaining self-play over long computing horizons is the primary bottleneck in autonomous reinforcement learning. By systematically curating synthetic data, this framework enables a 7-billion parameter model to surpass the performance of a 671-billion parameter baseline, proving that qualitative data gating is a critical requirement for scaling reinforcement learning compute.

## The Linear Centroids Hypothesis: How Deep Network Features Represent Data

Post: https://arxiviq.substack.com/p/the-linear-centroids-hypothesis-how
Authors: Thomas Walker, Ahmed Imtiaz Humayun, Randall Balestriero, Richard Baraniuk
Paper: https://arxiv.org/abs/2604.11962
Code: https://github.com/ThomasWalker1/LinearCentroidsHypothesis
Model: N/A

TL;DR
WHAT was done? The authors introduce the Linear Centroids Hypothesis (LCH), a novel framework for mechanistic interpretability. Instead of analyzing features as linear directions in a model’s latent activation space, the LCH identifies features based on the geometry of the network’s input space. By computing “centroids”—vector summarizations derived from the input-output Jacobian that describe the functional mapping of a network’s local region—the authors demonstrate a more rigorous method for feature extraction, circuit discovery, and saliency mapping.
WHY it matters? Current interpretability relies heavily on the Linear Representation Hypothesis (LRH), which is prone to identifying “spurious” features that a model extracts but does not actually utilize in its computational graph. By grounding feature discovery in the model’s functional geometry, LCH provides a drop-in replacement for latent activations that yields cleaner feature dictionaries, drastically improves the robustness of linear probes, and natively links features to specific functional circuits across multiple network layers.

## There Will Be a Scientific Theory of Deep Learning

Post: https://arxiviq.substack.com/p/there-will-be-a-scientific-theory
Authors: Jamie Simon, Daniel Kunin, Alexander Atanasov, Enric Boix-Adserà, Blake Bordelon, Jeremy Cohen, Nikhil Ghosh, Florentin Guth, Arthur Jacot, Mason Kamb, Dhruva Karkada, Eric J. Michaud, Berkan Ottlik, Joseph Turnbull
Paper: https://arxiv.org/abs/2604.21691v1
Code: N/A
Model: N/A

TL;DR
WHAT was done? A large, multi-institutional coalition of researchers synthesizes five growing bodies of theoretical work to propose “learning mechanics.” This framework argues that deep learning is transitioning from an empirical art to a predictive science, governed by solvable macroscopic laws analogous to statistical and classical mechanics in physics.
WHY it matters? Relying purely on trial-and-error for scaling overparameterized models has become economically and computationally unsustainable. Grounding neural network dynamics in a predictive mathematical theory enables zero-shot hyperparameter transfer across scales, allows us to forecast scaling law exponents mathematically rather than empirically, and provides a rigorous, first-principles foundation for AI safety and governance.

## DeepSeek-V4: Towards Highly Efficient Million-Token Context Intelligence

Post: https://arxiviq.substack.com/p/deepseek-v4-towards-highly-efficient
Authors: DeepSeek-AI
Paper: [ huggingface ] [arxiv]
Code: https://github.com/deepseek-ai/DeepGEMM
Model: https://huggingface.co/collections/deepseek-ai/deepseek-v4

TL;DR
WHAT was done? DeepSeek-AI introduces the DeepSeek-V4 series (including the 1.6T parameter Pro and 284B Flash models), featuring a novel hybrid attention architecture, manifold-constrained residual connections, and the Muon optimizer to natively and efficiently support a one-million-token context window.
WHY it matters? The quadratic complexity of attention and the linear scaling of the KV cache have long bottlenecked long-horizon reasoning. By reducing KV cache size by 90% and inference FLOPs by 73% at the million-token mark compared to its immediate predecessor, this architecture makes massive cross-document analysis, online learning, and persistent agentic thought economically and computationally viable.
Executive summary: DeepSeek-V4 represents a strategic unification of recent advances in Mixture-of-Experts (MoE) scaling, reinforcement learning, and systems engineering. It directly addresses the scaling limits of previous generation models by attacking the memory and compute footprint of long-context attention. For engineering teams and strategists, V4 proves that the barrier to extreme long-context processing is no longer strictly bound by hardware limits, but can be systematically dismantled through algorithmic compression, specialized kernels, and rigorous post-training distillation, ultimately delivering performance that challenges the most capable proprietary frontier models.

## Generalization at the Edge of Stability

Post: https://arxiviq.substack.com/p/generalization-at-the-edge-of-stability
Authors: Mario Tuci, Caner Korkmaz, Umut Şimşekli, Tolga Birdal
Paper: https://arxiv.org/abs/2604.19740v1
Code: https://circle-group.github.io/research/GATES
Model: N/A

TL;DR
WHAT was done? The authors introduced a theoretical framework that models stochastic optimization as a random dynamical system converging to a fractal pullback attractor. They derived a novel complexity measure, the Sharpness Dimension, which relies on the complete Hessian spectrum to bound the worst-case generalization error of neural networks trained in locally unstable regimes.
WHY it matters? Modern large-scale training frequently pushes models into an oscillatory, chaotic regime known as the “Edge of Stability,” where classical “flat minima” theories fundamentally break down. By proving mathematically that network generalization is controlled by the dimension of a lower-dimensional fractal subset rather than ambient parameter count, this work provides a rigorous explanation for why massively overparameterized networks generalize well without requiring convergence to a single, stable point.
Executive summary: For researchers and engineering teams scaling frontier models, this paper dictates a paradigm shift from analyzing isolated parameter checkpoints to studying the long-term sets (attractors) that algorithms explore. It demonstrates that single-metric evaluations of the loss landscape, such as the top Hessian eigenvalue, are dangerously insufficient predictors of model performance. Instead, computing the Sharpness Dimension—which balances both the expanding and contracting dimensions of the landscape—offers a highly robust predictor for generalization and effectively explains sudden learning phenomena like grokking.

## GIANTS: Generative Insight Anticipation from Scientific Literature

Post: https://arxiviq.substack.com/p/giants-generative-insight-anticipation
Authors: Joy He-Yueya, Anikait Singh, Ge Gao, Michael Y. Li, Sherry Yang, Chelsea Finn, Emma Brunskill, Noah D. Goodman
Paper: https://arxiv.org/abs/2604.09793
Code: https://github.com/joyheyueya/giants
Model: https://huggingface.co/giants2026

TL;DR
WHAT was done? The authors formalize the task of “insight anticipation”—predicting the core, novel contribution of a downstream scientific paper strictly from the summaries of its foundational parent papers. To support this, they construct the 17k-example GiantsBench dataset and train GIANTS-4B, a 4B-parameter language model fine-tuned via reinforcement learning with semantic similarity rewards.
WHY it matters? The work demonstrates that the ability to synthesize scientific literature does not scale linearly with model size alone. By isolating the conceptual synthesis phase from the noise of open-ended idea generation, the authors prove that specialized reinforcement learning on smaller open-weight models heavily outperforms generalized frontier models in executing targeted, verifiable scientific reasoning.

## Rich Insights from Cheap Signals: Efficient Evaluations via Tensor Factorization

Post: https://arxiviq.substack.com/p/rich-insights-from-cheap-signals
Authors: Felipe Maia Polo, Aida Nematzadeh, Virginia Aglietti, Adam Fisch, Isabela Albuquerque (University of Michigan, Google DeepMind)
Paper: https://arxiv.org/abs/2603.02029
Code: N/A
Model: N/A

TL;DR
WHAT was done? The authors developed a statistical framework utilizing CANDECOMP/PARAFAC (CP) tensor decomposition to merge abundant, noisy automated evaluations (autoraters) with extremely sparse human gold-standard judgments. This two-stage method pretrains latent representations of generative models and prompts on machine feedback, then calibrates them to human preferences to yield prompt-level performance metrics with rigorous confidence intervals.
WHY it matters? As frontier models converge on aggregate benchmark scores, evaluating their true capabilities requires high-resolution, prompt-level analysis. This approach circumvents the prohibitive cost of human labeling by treating evaluation as a transfer-learning problem. It enables the creation of statistically valid, micro-level leaderboards and allows developers to accurately predict the performance of new models without collecting any novel human data for them.
Executive summary: The AI evaluation paradigm is shifting from monolithic benchmark averages to fine-grained diagnostics. However, mapping model performance at the individual prompt level typically faces a severe data bottleneck: human labels are too expensive, and LLM-as-a-judge proxies are systematically biased. This DeepMind and University of Michigan paper elegantly solves this by structuring the evaluation space as a low-rank tensor. By doing so, they demonstrate that the latent factors governing task difficulty and model skill can be successfully recovered from cheap automated signals and mathematically aligned to human reality using only a tiny calibration dataset.

## Selecting Feature Interactions for Generalized Additive Models by Distilling Foundation Models

Post: https://arxiviq.substack.com/p/selecting-feature-interactions-for
Authors: Jingyun Jia, Chandan Singh, Rich Caruana, Ben Lengerich
Paper: https://arxiv.org/abs/2604.13332
Code: https://github.com/Clouddelta/tab-distill
Model: N/A

TL;DR
WHAT was done? The authors proposed TabDistill, a framework that uses Tabular Foundation Models (TFMs) to discover complex, high-order feature interactions, which are then extracted and injected into Generalized Additive Models (GAMs) as explicit additive terms.
WHY it matters? It bridges the gap between high-capacity, opaque foundation models and strictly transparent statistical modeling. This allows high-stakes applications in healthcare or finance to benefit from advanced representation learning without sacrificing human readability or auditability.
Executive summary: Deep learning has finally achieved state-of-the-art performance on tabular data via foundational models, but these networks remain impenetrable black boxes. This paper reverses their typical deployment role: rather than using them for end-to-end prediction, it utilizes them as structural teachers. By systematically probing a foundation model to extract the exact feature combinations it relies upon, and feeding those interactions into a simple, interpretable GAM, practitioners can achieve high accuracy while maintaining a fully transparent, glass-box architecture.

## Loop, Think, & Generalize: Implicit Reasoning in Recurrent-Depth Transformers

Post: https://arxiviq.substack.com/p/loop-think-and-generalize-implicit
Authors: Harsh Kohli, Srinivasan Parthasarathy, Huan Sun, Yuekun Yao
Paper: https://arxiv.org/abs/2604.07822v1
Code: https://github.com/OSU-NLP-Group/Loop-Think-Generalize
Model: N/A

TL;DR
WHAT was done? The authors evaluate whether recurrent-depth (looped) transformers can successfully perform implicit multi-hop reasoning over parametric knowledge without explicit Chain-of-Thought. By iteratively passing inputs through the same shared transformer layers, the model learns to systematically generalize to unseen factual combinations and extrapolate to reasoning depths significantly beyond its training distribution.
WHY it matters? This work provides a rigorous architectural solution to the compositionality failures inherent in standard transformers. By shifting the computational burden from rigid parameter depth to dynamic inference-time recurrence, the paper offers a scalable mechanism for “latent reasoning.” This proves that models can internally unroll complex rule-based logic to solve out-of-distribution tasks simply by “thinking” longer.
Executive summary: For practitioners exploring inference-time scaling, this research demonstrates that recurrent-depth architectures resolve the strict layer-bound limits of vanilla transformers. By stabilizing iterative unrolling and introducing entropy-aware adaptive halting, the model achieves profound systematic generalization through a sharp grokking phase. Crucially, the work identifies an upper bound to this scaling—latent overthinking—providing strategic boundaries for the deployment of test-time compute in foundational models.

## Dive into Claude Code: The Design Space of Today's and Future AI Agent Systems

Post: https://arxiviq.substack.com/p/dive-into-claude-code-the-design
Authors: Jiacheng Liu, Xiaohan Zhao, Xinyi Shang, Zhiqiang Shen
Paper: https://arxiv.org/abs/2604.14228v1
Code: https://github.com/VILA-Lab/Dive-into-Claude-Code
Model: N/A

TL;DR
WHAT was done? The authors reverse-engineered the TypeScript source code of Anthropic’s Claude Code (v2.1.88) to map the architectural design space of production-grade AI coding agents. They extracted the system’s core mechanisms, revealing a complex seven-component infrastructure that strictly separates the underlying language model’s reasoning capabilities from the operational safety, context, and memory management harness.
WHY it matters? The study empirically demonstrates that as foundation models converge in baseline reasoning capabilities, the critical differentiator for autonomous system reliability becomes the deterministic engineering harness surrounding the model. By revealing that 98.4% of a production agent’s codebase is operational infrastructure rather than AI decision logic, the paper forces a strategic pivot away from fragile prompt-based orchestration toward robust, operating-system-like architectures.
Executive summary: For engineering leaders and AI researchers, this analysis serves as a definitive blueprint of how frontier labs deploy autonomous tools. It unpacks how Claude Code manages unbounded context pressure via a graduated five-layer compaction pipeline and enforces safety through a rigorous deny-first permission gate. Crucially, it highlights the structural trade-offs of these systems: while heavy infrastructure amplifies short-term velocity, bounded context windows and isolated subagent architectures introduce a documented risk of degrading global codebase coherence and long-term human comprehension.

## A Mechanistic Analysis of Looped Reasoning Language Models

Post: https://arxiviq.substack.com/p/a-mechanistic-analysis-of-looped
Authors: Hugh Blayney, Álvaro Arroyo, Johan Obando-Ceron, Pablo Samuel Castro, Aaron Courville, Michael Bronstein, Xiaowen Dong
Paper: https://arxiv.org/abs/2604.11791v1
Code: https://github.com/TrelisResearch/nanochat/tree/recursive
Model: N/A

TL;DR
WHAT was done? The authors conducted a deep mechanistic analysis of looped language models—architectures that scale test-time compute by repeatedly applying the same Transformer blocks. They prove theoretically and demonstrate empirically that these cyclic networks naturally converge to distinct fixed points in latent space, self-organizing into predictable “stages of inference” that mirror the functional depth of standard feedforward models.
WHY it matters? As the field pushes toward adaptive reasoning capabilities via test-time computation, understanding the internal dynamics of recurrent depth is critical. By demonstrating that looped models decouple functional reasoning stages from raw parameter count, this research provides a theoretical substrate for designing highly parameter-efficient reasoning engines that avoid the “overthinking” degradation commonly seen in unconstrained recurrent models.

## Think Anywhere in Code Generation

Post: https://arxiviq.substack.com/p/think-anywhere-in-code-generation
Authors: Xue Jiang, Tianyu Zhang, Ge Li, Mengyang Liu, Taozhi Chen, Zhenhua Xu, Binhua Li, Wenpin Jiao, Zhi Jin, Yongbin Li, Yihong Dong
Paper: https://arxiv.org/abs/2603.29957v2
Code: https://github.com/jiangxxxue/Think-Anywhere
Model: N/A

TL;DR
WHAT was done? Researchers from Peking University and Alibaba’s Tongyi Lab introduce THINK-ANYWHERE, a novel reasoning mechanism that allows Large Language Models (LLMs) to dynamically pause and trigger deliberation at any token position during code generation, shifting away from the dominant paradigm of generating a single, exhaustive “thinking” block prior to code execution.
WHY it matters? This approach more accurately mirrors human coding cognition, where problems and edge cases often reveal themselves only during implementation. By invoking reasoning specifically at high-entropy bottlenecks, the model achieves state-of-the-art accuracy across code generation benchmarks while paradoxically reducing the total number of generated tokens, optimizing inference-time compute.

## Squeeze Evolve: Unified Multi-Model Orchestration for Verifier-Free Evolution

Post: https://arxiviq.substack.com/p/squeeze-evolve-unified-multi-model
Authors: Monishwaran Maheswaran, Leon Lakhani, Zhongzhu Zhou, Shijia Yang, Junxiong Wang, Coleman Hooper, Yuezhou Hu, Rishabh Tiwari, Jue Wang, Harman Singh, Qingyang Wu, Yuqing Jian, Ce Zhang, Kurt Keutzer, Tri Dao, Xiaoxia Wu, Ben Athiwaratkun, James Zou, Chenfeng Xu
Paper: https://arxiv.org/abs/2604.07725
Code: https://github.com/squeeze-evolve/squeeze-evolve
Model: N/A

TL;DR
WHAT was done? The authors introduce Squeeze Evolve, a framework that orchestrates multi-model evolutionary inference without relying on external verifiers. By utilizing model-intrinsic confidence and semantic diversity signals, the system dynamically routes candidate trajectory recombination tasks to either heavy, high-capability models or smaller, cost-effective models based on the required marginal utility.
WHY it matters? Test-time compute scaling is a proven path to superior reasoning, but running advanced evolutionary searches uniformly on frontier models is economically unsustainable and frequently leads to “diversity collapse.” Squeeze Evolve solves both issues simultaneously, establishing a new cost-capability frontier that reduces API costs by up to 3× and increases system serving throughput by nearly 10×, all while matching or exceeding the performance of significantly more expensive single-model approaches.
Executive summary: For deployment architectures scaling complex reasoning or scientific discovery, uniform querying of heavy models is becoming an outdated strategy. This paper demonstrates that initialization quality dominates final accuracy; therefore, utilizing a large model strictly for initial generation and adaptively routing subsequent refinement steps to cheaper models based on internal certainty provides massive efficiency gains. Coupled with custom inference engine modifications, this orchestration technique makes large-scale, verifier-free inference practically deployable under strict latency and budget constraints.

## Muon Dynamics as a Spectral Wasserstein Flow

Post: https://arxiviq.substack.com/p/muon-dynamics-as-a-spectral-wasserstein
Authors: Gabriel Peyré
Paper: https://arxiv.org/abs/2604.04891
Code: https://github.com/gpeyre/spectral-wasserstein
Model: N/A

TL;DR
WHAT was done? The paper introduces a family of “Spectral Wasserstein” distances parameterized by a matrix norm on positive semidefinite matrices. By generalizing optimal transport to penalize global displacement covariance, the author proves that the continuous-time limit of the Muon optimizer is an exact gradient flow under the operator-norm instance of this geometry.
WHY it matters? This work shifts spectrally normalized updates from empirical algorithmic heuristics to rigorous, continuous-time geometric principles. It provides the mathematical continuum framework required to analyze the stability, particle coordination, and potential global convergence of the modern, matrix-aware optimizers currently used to train large language models.

## The Art of Building Verifiers for Computer Use Agents

Post: https://arxiviq.substack.com/p/the-art-of-building-verifiers-for
Authors: Corby Rosset, Pratyusha Sharma, Andrew Zhao, Miguel Gonzalez-Fernandez, Ahmed Awadallah
Paper: https://arxiv.org/abs/2604.06240v1
Code: https://github.com/microsoft/fara
Model: N/A

TL;DR
WHAT was done? The authors designed the Universal Verifier (UV), a multi-phase system for evaluating Computer Use Agent (CUA) trajectories. It departs from single-prompt binary judgments by introducing task-specific rubrics, multimodal relevance scoring across all trajectory screenshots, and the explicit separation of execution quality (process rewards) from goal completion (outcome rewards). Furthermore, they open-sourced CUAVerifierBench, a dataset of 246 human-labeled trajectories for evaluating verifier alignment.
WHY it matters? Reliable verification is the primary bottleneck for scaling Reinforcement Learning from Human Feedback (RLHF) and autonomous training loops in agentic AI. Existing evaluators suffer from massive false positive rates—often blindly trusting hallucinated agent claims. By reducing the false positive rate to near-zero while matching human inter-annotator agreement, this framework provides a trustable, fine-grained reward signal necessary to train the next generation of robust web and desktop agents.
Executive summary: As AI models shift from answering questions to executing long-horizon tasks on computers, evaluating whether they actually succeeded has become deceptively complex. A model might do everything right but fail due to a login wall, or conversely, hallucinate success without completing the task. This paper demonstrates that solving the verification bottleneck requires architectural rigor, not just larger foundation models. By structurally decoupling process from outcome and enforcing meticulous visual grounding at every step, the proposed system drives false positive evaluation rates down from over 30% to roughly 1%. For AI research labs, this signals a necessary shift away from simplistic end-state evaluation toward modular, evidence-based verification pipelines.

## Mathematical methods and human thought in the age of AI

Post: https://arxiviq.substack.com/p/mathematical-methods-and-human-thought
Authors: Tanya Klowden, Terence Tao
Paper: https://arxiv.org/abs/2603.26524
Code: N/A
Model: N/A

TL;DR
WHAT was done? The authors propose a strategic and philosophical framework for integrating artificial intelligence into mathematically rigorous workflows, mapping a phased transition from peripheral augmentation to collaborative coexistence.
WHY it matters? As language and reasoning models scale, the automation of intellectual output is becoming dangerously decoupled from grounded cognitive processes. This paradigm matters because unchecked integration risks systemic data contamination (”AI collapse”) and epistemic circularity, requiring robust formal verification guardrails to safely harness AI as a complementary intellectual substrate.
Another relevant recent article from Quanta Magazine: “ The AI Revolution in Math Has Arrived ”

## The Latent Space: Foundation, Evolution, Mechanism, Ability, and Outlook

Post: https://arxiviq.substack.com/p/the-latent-space-foundation-evolution
Authors: Xinlei Yu, Zhangquan Chen, Yongbo He, Tianyu Fu, Cheng Yang, Chengming Xu, Yue Ma, Xiaobin Hu, Zhe Cao, Jie Xu, Guibin Zhang, Jiale Tao, Jiayi Zhang, Siyuan Ma, Kaituo Feng, Haojie Huang, Youxing Li, Ronghao Chen, Huacan Wang, Chenglin Wu, Zikun Su, Xiaogang Xu, Kelu Yao, Kun Wang, Chen Gao, Yue Liao, Ruqi Huang, Tao Jin, Zhucun Xue, Cheng Tan, Jiangning Zhang, Wenqi Ren, Yanwei Fu, Yong Liu, Yu Wang, Xiangyu Yue, Yu-Gang Jiang, Shuicheng Yan
Paper: https://arxiv.org/abs/2604.02029v1
Code: https://github.com/YU-deep/Awesome-Latent-Space
Model: N/A

TL;DR
WHAT was done? The authors present a comprehensive taxonomy and formal survey of “latent space” approaches in language-based models, transitioning the field’s view of continuous internal states from hidden implementation details to a primary, machine-native computational substrate. The work organizes hundreds of fragmented studies across a two-dimensional framework mapping mechanistic designs (architecture, representation, computation, optimization) against functional abilities (reasoning, planning, perception, memory, embodiment, and collaboration).
WHY it matters? Current autoregressive models face severe structural limitations due to linguistic redundancy, discretization bottlenecks, and sequential decoding costs. Shifting computation into a continuous latent manifold allows models to encode superpositions of reasoning paths, preserve high-fidelity multimodal information, and communicate agent-to-agent without semantic loss, fundamentally redefining the architectural constraints of next-generation foundational models.

## Memory Intelligence Agent

Post: https://arxiviq.substack.com/p/memory-intelligence-agent
Authors: Jingyang Qiao, Weicheng Meng, Yu Cheng, Zhihang Lin, Zhizhong Zhang, Xin Tan, Jingyu Gong, Kun Shao, Yuan Xie
Paper: https://arxiv.org/abs/2604.04503v2
Code: https://github.com/ECNU-SII/MIA
Model: https://huggingface.co/LightningCreeper/MIA

TL;DR
WHAT was done? The authors propose the Memory Intelligence Agent (MIA), a framework that restructures autonomous agent reasoning into a decoupled Manager-Planner-Executor architecture. It transitions from retrieving factual knowledge to internalizing procedural search strategies by combining an explicit non-parametric memory buffer with continuous parametric updates via reinforcement learning, even during inference (Test-Time Learning).
WHY it matters? This work empirically demonstrates that intelligent memory management and strategic abstraction can bridge the performance gap between small and large models. By using a 7B-parameter Executor to outperform a 32B-parameter model by an 18% margin, MIA establishes that internalizing the “how” of problem-solving is more computationally efficient and scalable than simply expanding context windows or scaling raw model parameters.
Executive summary: Modern deep research agents frequently suffer from memory bloat and attention dilution when processing extensive execution histories. The MIA framework addresses this by compressing raw interaction traces into high-level workflow summaries, which are then used to dynamically update a dedicated planning agent via an alternating reinforcement learning paradigm. For AI strategists and system architects, this signals a shift toward self-evolving, unsupervised agent architectures where learning continuous task-specific procedures during inference yields superior returns compared to static, knowledge-heavy context retrieval.

## ASI-Evolve: AI Accelerates AI

Post: https://arxiviq.substack.com/p/asi-evolve-ai-accelerates-ai
Authors: Weixian Xu, Tiantian Mi, Yixiu Liu, Yang Nan, Zhimeng Zhou, Lyumanshan Ye, Lin Zhang, Yu Qiao, Pengfei Liu
Paper: https://arxiv.org/abs/2603.29640
Code: https://github.com/GAIR-NLP/ASI-Evolve
Model: N/A

TL;DR
WHAT was done? The authors introduced ASI-EVOLVE, an agentic framework designed to automate the costly, long-horizon research cycles that drive foundational AI progress. The system implements a learn–design–experiment–analyze loop, augmented by a persistent cognition base of human priors and a dedicated analyzer that distills multi-dimensional training logs into actionable, causal insights.
WHY it matters? While previous evolutionary agents have succeeded in narrow algorithmic tasks or publication generation, this framework demonstrates unified, autonomous discovery across the three core pillars of modern AI: model architectures, pretraining data curation, and reinforcement learning (RL) algorithms. By successfully shifting the optimization burden from human researchers to an agentic pipeline, this work establishes a precedent for recursive, closed-loop AI self-improvement.
Executive summary: For senior practitioners managing large-scale research efforts, ASI-EVOLVE represents a structural shift in how we approach the AI development stack. Rather than manually tuning attention mechanisms or RL loss formulations, researchers can deploy this framework to search vast hypothesis spaces. By leveraging semantic retrieval over past literature and programmatic log analysis, the system discovered 105 novel linear attention architectures outperforming established baselines, evolved data curation strategies that boosted MMLU performance by over 18 points, and formulated new RL update rules surpassing competitive baselines. This points toward a near future where the human role transitions from engineering solutions to defining the constraint spaces for autonomous discovery.

## AI+HW 2035: Shaping the Next Decade

Post: https://arxiviq.substack.com/p/aihw-2035-shaping-the-next-decade
Authors: Deming Chen, Jason Cong, Azalia Mirhoseini, Christos Kozyrakis, Subhasish Mitra, Jinjun Xiong, Cliff Young, Anima Anandkumar, Michael Littman, Aron Kirschen, Sophia Shao, Serge Leef, Naresh Shanbhag, Dejan Milojicic, Michael Schulte, Gert Cauwenberghs, Jerry M. Chow, Tri Dao, Kailash Gopalakrishnan, Richard Ho, Hoshik Kim, Kunle Olukotun, David Z. Pan, Mark Ren, Dan Roth, Aarti Singh, Yizhou Sun, Yusu Wang, Yann LeCun, and Ruchir Puri
Paper: https://arxiv.org/abs/2603.05225
Code: N/A
Model: N/A

TL;DR
WHAT was done? A massive consortium of academic and industrial leaders formulated a comprehensive 10-year strategic roadmap to unify artificial intelligence algorithms and hardware development, aiming for a targeted 1000× improvement in training and inference efficiency.
WHY it matters? The exponential scaling of foundation models has collided with hard physical, thermal, and infrastructural limits. The energy required to move data now eclipses the energy required to compute it, creating a severe “memory wall.” Resolving this is mathematically and practically necessary to prevent global datacenter power constraints from halting AI progress.
Executive summary: For hardware strategists, architecture designers, and ML researchers, this roadmap serves as an urgent directive. It outlines the transition from siloed, compute-centric development to a cross-layer co-design paradigm. By mandating 3D compute-in-memory (CIM) integration, algorithmic robustness to mixed-signal noise, and AI-driven Electronic Design Automation (EDA), the paper charts a path toward sustainable, agentic AI capable of operating efficiently from the gigawatt cloud down to milliwatt physical edge devices.

## Crashing Waves vs. Rising Tides: Preliminary Findings on AI Automation from Thousands of Worker Evaluations of Labor Market Tasks

Post: https://arxiviq.substack.com/p/crashing-waves-vs-rising-tides-preliminary
Authors: Matthias Mertens, Adam Kuzee, Brittany S. Harris, Harry Lyu, Wensu Li, Jonathan Rosenfeld, Meiri Anto, Martin Fleming, Neil Thompson
Paper: https://arxiv.org/abs/2604.01363
Code: N/A
Model: N/A

TL;DR
WHAT was done? Researchers at MIT FutureTech evaluated 41 large language models against 3,000+ realistic labor tasks derived from the O*NET database. By collecting over 17,000 double-blind evaluations from human domain experts, they modeled the success probability of AI outputs as a function of the time it would take a human to complete the task.
WHY it matters? This study reshapes our mental model of automation dynamics. Instead of AI abruptly conquering niche tasks while failing at everything else (a “crashing wave”), models are improving broadly and in parallel across almost all text-based labor domains (a “rising tide”). This flat distribution of performance scaling indicates a more predictable but pervasive timeline for labor market disruption.
Executive summary: For research strategists and policy planners, this paper provides crucial empirical grounding. While frontier systems are already reaching a 50% success rate on human tasks that take three to four hours to complete, the shallow slope of the success-duration curve means that achieving near-perfect, error-free reliability will take significantly longer. Consequently, raw reasoning capability is scaling beautifully, but the actual gating factor for economic displacement will be the “last-mile” systems engineering required to integrate these models into complex enterprise workflows.
As of April 2026 AI is still not good enough to produce a comic without an error… 😿

## Neural Computers

Post: https://arxiviq.substack.com/p/neural-computers
Authors: Mingchen Zhuge, Changsheng Zhao, Haozhe Liu, Zijian Zhou, Shuming Liu, Wenyi Wang, Ernie Chang, Gael Le Lan, Junjie Fei, Wenxuan Zhang, Yasheng Sun, Zhipeng Cai, Zechun Liu, Yunyang Xiong, Yining Yang, Yuandong Tian, Yangyang Shi, Vikas Chandra, Jürgen Schmidhuber
Paper: https://arxiv.org/abs/2604.06425v1
Code: https://github.com/metauto-ai/NeuralComputer
Model: N/A

TL;DR
WHAT was done? Researchers from Meta AI and KAUST propose a new architectural paradigm called a Neural Computer (NC), which unifies computation, memory, and I/O operations into a single learned latent runtime state. Rather than treating an AI as an agent that manipulates an external operating system, they instantiate the computer directly within the weights of a diffusion transformer (built on Wan2.1), demonstrating this concept via two prototypes: NC CLIGen ​ for terminal environments and NC GUIWorld ​ for desktop graphical interfaces.
WHY it matters? This work outlines a fundamental shift from the modular Von Neumann hardware/software stack to a unified “neural latent stack.” If this trajectory holds, future systems will not be explicitly coded but differentiably configured. By proving that early runtime primitives—like I/O alignment and short-horizon control—can emerge solely from observing interface traces, the paper provides a roadmap toward Completely Neural Computers (CNCs) that could replace traditional digital computing substrates.
Executive summary: For strategic leaders and systems researchers, this paper highlights a critical divergence in AI system design. While the industry heavily invests in tool-using agents that interact with external software, this research suggests an alternative where the model itself absorbs the execution environment. Through extensive ablations on data quality and action injection, the authors show that models can render highly accurate interfaces and respond to user inputs. However, they also reveal a severe limitation in native symbolic reasoning, proving that current video-based instantiations are exceptional renderers but fragile reasoners.

## HISA: Efficient Hierarchical Indexing for Fine-Grained Sparse Attention

Post: https://arxiviq.substack.com/p/hisa-efficient-hierarchical-indexing
Authors: Yufei Xu, Fanxu Meng, Fan Jiang, Yuxuan Wang, Ruijie Zhou, Zhaohui Wang, Jiexi Wu, Zhixin Pan, Xiaojuan Tang, Wenjie Pei, Tongxuan Liu, Di Yin, Xing Sun, Muhan Zhang
Paper: https://arxiv.org/abs/2603.28458v3
Code: https://github.com/MuLabPKU/TransArch
Model: N/A

TL;DR
WHAT was done? The authors introduce Hierarchical Indexed Sparse Attention (HISA), a training-free, drop-in replacement for the token-level sparse indexers found in models like DeepSeek-V3.2 and GLM-5. HISA replaces exhaustive token-by-token scoring with a two-stage routing mechanism: a block-level coarse filter followed by fine-grained token refinement, ultimately preserving the exact output structure required by downstream sparse attention operators.
WHY it matters? As language models scale to context windows of 128K to 1M tokens, sparse attention paradigms have successfully reduced the cost of attention computation itself. However, the metadata search mechanism—the indexer—has quietly become the new quadratic bottleneck. By rewriting the search path, HISA drastically reduces the asymptotic indexing complexity, unlocking up to a 3.75× kernel-level speedup and enabling economically viable inference at extreme context lengths without sacrificing retrieval accuracy.

## ClawSafety: "Safe" LLMs, Unsafe Agents

Post: https://arxiviq.substack.com/p/clawsafety-safe-llms-unsafe-agents
Authors: Bowen Wei, Yunbei Zhang, Jinhao Pan, Kai Mei, Xiao Wang, Jihun Hamm, Ziwei Zhu, Yingqiang Ge
Paper: https://arxiv.org/abs/2604.01438
Code: https://weibowen555.github.io/ClawSafety/
Model: N/A

TL;DR
WHAT was done? The authors introduced CLAWSAFETY, a benchmark of 120 adversarial scenarios designed to evaluate the susceptibility of personal AI agents to indirect prompt injections. Grounded in high-privilege professional workspaces, the study tests five frontier LLMs across multiple agent frameworks using varied attack vectors (skills, emails, web).
WHY it matters? This research proves that safety alignment techniques optimized for text generation fail to generalize to agentic workflows. By demonstrating that vulnerabilities are modulated by the agent’s scaffolding rather than the model alone, the work forces a paradigm shift in AI security: evaluations must target the complete deployment stack, not just the isolated neural network.
Executive summary: As LLMs transition from isolated chat assistants to autonomous agents with read/write access to local environments, the security perimeter inherently shifts. This paper reveals a critical “compliance gap” where safe text models willingly execute unauthorized actions via tool calls when manipulated by their environment. Through rigorous sandboxed evaluations, the authors show that attackers bypass basic input filters by exploiting the agent’s workflow context and operational trust. Ultimately, the findings establish that securing an agent requires engineering instruction provenance and robust identity verification within the orchestration framework itself.

## Grounding Social Perception in Intuitive Physics

Post: https://arxiviq.substack.com/p/grounding-social-perception-in-intuitive
Authors: Lance Ying, Aydan Y. Huang, Aviv Netanyahu, Andrei Barbu, Boris Katz, Joshua B. Tenenbaum, Tianmin Shu
Paper: https://arxiv.org/abs/2603.27410v1
Code: https://osf.io/fkp5m/
Model: N/A

TL;DR
WHAT was done? The authors introduced PHASE, a dataset of 500 procedurally generated animations of 2D physics-based agent interactions, and proposed SIMPLE, a computational framework that infers agents’ social goals and relationships by integrating a forward physics engine with Bayesian inverse planning.
WHY it matters? Current state-of-the-art vision-language models and graph neural networks often fail to correctly interpret complex social interactions—such as distinguishing competition from collaboration—because they treat social perception as visual pattern matching. By demonstrating that an “analysis-by-synthesis” approach grounded in physical constraints matches human judgment, this work provides a scalable blueprint for endowing AI systems with robust, human-like physical and social common sense.
Executive summary: To build AI systems that can safely and intelligently operate in shared physical spaces, those systems must understand human intent. This paper argues that inferring intent requires more than mapping visual features to social labels; it requires simulating the physical constraints under which agents operate. The authors demonstrate that explicitly coupling intuitive psychology (theory of mind) with intuitive physics (resolving forces and collisions) enables a model to accurately reverse-engineer hidden mental states from observed trajectories. This highlights a strategic bottleneck in purely feedforward architectures and validates generative simulation as a critical pathway for advanced agentic reasoning.

## Embarrassingly Simple Self-Distillation Improves Code Generation

Post: https://arxiviq.substack.com/p/embarrassingly-simple-self-distillation
Authors: Ruixiang Zhang, Richard He Bai, Huangjie Zheng, Navdeep Jaitly, Ronan Collobert, Yizhe Zhang
Paper: https://arxiv.org/abs/2604.01193v1
Code: https://github.com/apple/ml-ssd
Model: N/A

TL;DR
WHAT was done? The researchers introduced Simple Self-Distillation (SSD), a post-training method where a large language model fine-tunes on its own raw, unverified outputs. By generating samples under specific temperature and truncation configurations and directly optimizing a cross-entropy loss against those targets, the model achieves massive gains without reinforcement learning, verifiers, or a stronger teacher.
WHY it matters? This work fundamentally challenges the assumption that improving a language model requires higher-quality external data or complex execution sandboxes. By demonstrating that unverified, and sometimes even garbled, self-generated data can reorganize a model’s internal probability distributions to resolve structural decoding conflicts, this research offers a highly scalable, computationally inexpensive alternative to current alignment and reasoning paradigms.
Executive summary: For strategy leaders and research scientists building coding assistants, the bottleneck has historically been the generation of verified synthetic data or the operational instability of reinforcement learning. This paper proves that latent code generation capabilities can be unlocked purely by exploiting the model’s own distributional geometry. SSD extracts a signal not from the “correctness” of the training data, but from how temperature-shifted sampling forces the model to mathematically suppress distractor tokens in syntax-heavy contexts while preserving diversity at critical algorithmic decision points.

## Meta-Harness: End-to-End Optimization of Model Harnesses

Post: https://arxiviq.substack.com/p/meta-harness-end-to-end-optimization
Authors: Yoonho Lee, Roshen Nair, Qizheng Zhang, Kangwook Lee, Omar Khattab, Chelsea Finn
Paper: https://arxiv.org/abs/2603.28052v1
Code: https://github.com/stanford-iris-lab/meta-harness-tbench2-artifact
Model: N/A

TL;DR
WHAT was done? The authors introduce Meta-Harness, an agentic outer-loop system that autonomously searches for and rewrites the executable infrastructure (the “harness”) surrounding a language model. By granting a coding agent unrestricted filesystem access to raw execution traces from past attempts, the system iteratively programs custom retrieval logic, memory management, and prompt assembly architectures.
WHY it matters? Hand-crafting the programmatic wrapper around foundation models has become a primary performance bottleneck. Meta-Harness demonstrates that allowing an agent to causally debug its own uncompressed execution history yields sophisticated, stateful policies that significantly outperform state-of-the-art, human-engineered orchestrations across classification, complex coding, and IMO-level mathematical reasoning.
Executive summary: For research scientists and engineers building compound AI systems, this paper signals a strategic shift from prompt optimization to automated system architecture design. Rather than relying on lossy textual summaries or gradient-based updates to model weights, Meta-Harness proves that giving frontier coding agents direct filesystem access to raw log data enables them to autonomously write, debug, and optimize complex Python wrappers. The resulting auto-generated infrastructures achieve massive performance gains, suggesting that the future of system engineering lies in meta-loop optimization.

## How Well Does Agent Development Reflect Real-World Work?

Post: https://arxiviq.substack.com/p/how-well-does-agent-development-reflect
Authors: Zora Z. Wang, Sanidhya Vijayvargiya, Aspen Chen, Hanmo Zhang, Venu Arvind Arangarajan, Jett Chen, Valerie Chen, Diyi Yang, Daniel Fried, Graham Neubig
Paper: https://arxiv.org/abs/2603.01203
Code: https://github.com/zorazrw/ai4work-resources
Model: N/A

TL;DR
WHAT was done? The authors present a systematic framework to map 72,342 task instances across 43 AI agent benchmarks directly to the U.S. labor market. By leveraging O*NET occupational taxonomies and Bureau of Labor Statistics data, they quantify exactly which economic sectors and skills our current benchmarking efforts actually represent.
WHY it matters? This research highlights a massive structural misalignment in AI development: we are aggressively optimizing agents for a tiny, highly specific slice of the economy. By establishing a unified measure for task complexity and agent autonomy, the paper provides a quantitative roadmap for shifting agent development away from methodological convenience and toward domains with substantially higher societal and economic impact.
Executive summary: For research leaders and product strategists building general-purpose agents, this paper is a critical reality check. Current evaluation suites overwhelmingly over-index on software engineering—a domain comprising only 7.6% of U.S. employment—while virtually ignoring highly digitized, capital-rich sectors like management and legal work. Furthermore, the authors introduce a mathematically grounded definition of agent autonomy based on hierarchical workflow complexity. This allows teams to rigorously define capability boundaries rather than relying on binary pass/fail metrics on arbitrary tasks, enabling a more strategic allocation of research effort toward historically underserved labor markets.

## MIRAGE: The Illusion of Visual Understanding

Post: https://arxiviq.substack.com/p/mirage-the-illusion-of-visual-understanding
Authors: Mohammad Asadi, Jack W. O’Sullivan, Fang Cao, Tahoura Nedaee, Kamyar Fardi, Fei-Fei Li, Ehsan Adeli, Euan Ashley
Paper: https://arxiv.org/abs/2603.21687
Code: N/A
Model: N/A

TL;DR
WHAT was done? The authors systematically investigated and quantified the “mirage effect”—a phenomenon where multimodal AI models generate detailed visual descriptions and reasoning traces for images that were never provided. To address this, they introduced B-Clean, a post-hoc framework designed to filter out benchmark questions that models can answer purely through text-based heuristics, isolating genuine visual reasoning.
WHY it matters? High performance on standard multimodal benchmarks is widely interpreted as evidence of strong visual understanding. This paper demonstrates that such scores are heavily inflated by language priors and structural benchmark flaws. In clinical applications, this creates a dangerous “silent failure mode” where models confidently fabricate pathology-biased diagnoses when an image is missing, fundamentally challenging the reliability and safety of current vision-language models in high-stakes environments.

## Transformers learn factored representations

Post: https://arxiviq.substack.com/p/transformers-learn-factored-representations
Authors: Adam Shai, Loren Amdahl-Culleton, Casper L. Christensen, Henry R. Bigelow, Fernando E. Rosas, Alexander B. Boyd, Eric A. Alt, Kyle J. Ray, Paul M. Riechers
Paper: https://arxiv.org/abs/2602.02385v1
Code: https://github.com/Astera-org/factored-reps
Model: N/A

TL;DR
WHAT was done? The authors formalize and empirically validate the “Factored World Hypothesis,” demonstrating that transformers inherently decompose complex, multi-part data streams into independent discrete factors. Rather than representing these factors in a massive, exponentially scaling joint mathematical space, the architecture natively isolates them into low-dimensional, mutually orthogonal subspaces within the residual stream.
WHY it matters? This research provides a rigorous mathematical foundation for mechanistic interpretability. It proves that modularity and disentangled representations are not merely convenient accidents of training, but representational attractors driven by a strong inductive bias. By demonstrating that transformers prefer dimensional efficiency over brute-force memorization—even when a factored approach is technically lossy—this work suggests that finding interpretable sub-networks and tuning models via surgical subspace interventions is fundamentally aligned with how the architecture operates.
Executive summary: For AI strategists, domain experts, and model builders, this paper proves that breaking down complex environments into modular, independent concepts is a native feature of the transformer architecture. The network actively prefers to organize information into isolated, highly efficient sub-compartments. This validates the pursuit of precise, localized interventions in AI systems, unlocking new methodologies to interpret, debug, and control frontier models without disrupting their broader cognitive capabilities.

## Efficient Universal Perception Encoder

Post: https://arxiviq.substack.com/p/efficient-universal-perception-encoder
Authors: Chenchen Zhu, Saksham Suri, Cijo Jose, Maxime Oquab, Marc Szafraniec, Wei Wen, Yunyang Xiong, Patrick Labatut, Piotr Bojanowski, Raghuraman Krishnamoorthi, Vikas Chandra
Paper: https://arxiv.org/abs/2603.22387v1
Code: N/A
Model: N/A

TL;DR
WHAT was done? The paper introduces the Efficient Universal Perception Encoder (EUPE), a three-stage distillation pipeline that creates a compact vision encoder capable of robust zero-shot performance across image understanding, dense prediction, and vision-language tasks. Rather than distilling multiple domain-expert models directly into a small student, the authors first distil the experts into a massive 1.9-billion parameter “proxy teacher,” which then teaches the efficient student model.
WHY it matters? Deploying multimodal foundation models on edge devices typically requires hot-swapping specialized encoders (e.g., one for depth, another for OCR), incurring prohibitive memory and compute costs. By proving that efficient backbones inherently lack the parameter capacity to unify divergent expert representations natively, this research establishes an intermediate aggregation step as a mandatory structural bridge for creating highly capable, multi-task mobile architectures.
Executive summary: For edge AI to achieve seamless, multi-domain perception, relying on disjoint foundation models is computationally unfeasible. The authors reveal that existing methods of agglomerating multiple teachers directly into a small student fail because tiny models cannot resolve conflicting latent geometries. By shifting the complex task of knowledge unification to a heavy intermediate proxy model, and only then compressing that single, unified representation into a lightweight backbone, the resulting model rivals domain-specific experts of the same size across all key vision benchmarks.
still not perfect generation…

## Path-Constrained Mixture-of-Experts

Post: https://arxiviq.substack.com/p/path-constrained-mixture-of-experts
Authors: Zijin Gu, Tatiana Likhomanenko, Vimal Thilak, Jason Ramapuram, Navdeep Jaitly
Paper: https://arxiv.org/abs/2603.18297
Code: N/A
Model: N/A

TL;DR
WHAT was done? The authors introduce PathMoE, a Mixture-of-Experts (MoE) architecture that constrains the combinatorial routing space by sharing router parameters across blocks of consecutive layers, rather than treating each layer’s expert selection independently.
WHY it matters? By explicitly constraining the sequence of experts a token can visit, PathMoE drastically improves statistical sample efficiency, consistently boosting performance at the 16B parameter scale. Furthermore, it eliminates the need for auxiliary load-balancing losses during training and induces highly robust, interpretable expert specialization based on natural linguistic structures.
Executive summary: For research groups scaling sparse architectures, independent per-layer routing introduces a severe statistical bottleneck due to exponentially large path permutations. By tying router weights across localized network blocks, PathMoE channels tokens through consistent computational pathways. This minor architectural constraint translates into measurable performance gains across broad benchmarks, removes the operational overhead of tuning load-balancing hyperparameters, and reveals that models naturally route data by syntactic function when provided with the proper spatial inductive bias.

## Grounding World Simulation Models in a Real-World Metropolis

Post: https://arxiviq.substack.com/p/grounding-world-simulation-models
Authors: Junyoung Seo, Hyunwook Choi, Minkyung Kwon, Jinhyeok Choi, Siyoon Jin, Gayoung Lee, Junho Kim, JoungBin Lee, Geonmo Gu, Dongyoon Han, Sangdoo Yun, Seungryong Kim, and Jin-Hwa Kim
Paper: https://arxiv.org/abs/2603.15583v1
Code: https://seoul-world-model.github.io
Model: N/A

TL;DR
WHAT was done? The paper introduces the Seoul World Model (SWM), a 2-billion parameter city-scale video generation system. Built on a Diffusion Transformer (DiT), SWM uses a geo-indexed retrieval mechanism to anchor its autoregressive video generation to actual, physical street-view data of Seoul, rather than fabricating imagined environments.
WHY it matters? Existing generative world models suffer from an inability to maintain geographic and topological fidelity over long temporal horizons; once a camera turns a corner, the model invents the street. By grounding generation in real-world spatial data via retrieval-augmented generation (RAG), SWM bridges the gap between static 3D city reconstructions and dynamic video simulation. This provides a structural foundation for high-fidelity urban planning visualizations and reliable edge-case simulation for autonomous driving.
Executive summary: For research leaders and domain experts, this work represents a critical transition from purely parametric, hallucinated world models to physically grounded “digital twins.” By introducing a mechanism to dynamically retrieve future visual frames and inject them as attention anchors, the system effectively solves the long-horizon drift problem typical of autoregressive video generation. This validates spatial RAG as a necessary architecture for persistent, large-scale environmental simulation.

## Agentic AI and the next intelligence explosion

Post: https://arxiviq.substack.com/p/agentic-ai-and-the-next-intelligence
Authors: James Evans, Benjamin Bratton, Blaise Agüera y Arcas
Paper: https://arxiv.org/abs/2603.20639v1 (also in Science )
Code: N/A
Model: N/A

TL;DR
WHAT was done? The authors present a foundational paradigm shift regarding the trajectory of artificial general intelligence, arguing that frontier models (e.g., DeepSeek-R1, QwQ-32B) do not scale via monolithic computation, but rather through emergent “societies of thought” (topic of another recent paper by these authors). The paper introduces a theoretical and practical framework for “Institutional Alignment,” proposing that the next leap in capabilities relies on multi-agent organizational sociology rather than isolated parameter scaling.
WHY it matters? This reconceptualization fundamentally alters how we should approach AI scaling and safety. By demonstrating that optimization pressure inherently breeds multi-perspective internal dialogue, the authors show that traditional dyadic alignment (RLHF) is structurally incapable of governing future systems. Moving forward, engineering scalable AI ecosystems will require the design of rigid sociological templates—roles, hierarchies, and constitutional protocols—mirroring human bureaucratic and legal infrastructure.
Executive summary: For research scientists and technical leaders, the pursuit of a singular, omniscient “god-model” is a mathematical and historical dead end. Evidence from recent reasoning models reveals that intelligence is an inherently plural, relational property. As models tackle harder tasks, they spontaneously fragment into multi-agent internal debates. Consequently, the next frontier of AI research is not just increasing FLOPs or dataset size, but organizational engineering: constructing the digital institutions, role definitions, and conflict-resolution hypergraphs required to coordinate trillions of interacting biological and artificial agents.

## Learning to Rewrite Tool Descriptions for Reliable LLM-Agent Tool Use

Post: https://arxiviq.substack.com/p/learning-to-rewrite-tool-descriptions
Authors: Ruocheng Guo, Kaiwen Dong, Xiang Gao, Kamalika Das
Paper: https://arxiv.org/abs/2602.20426
Code: N/A
Model: N/A

TL;DR
WHAT was done? The authors introduced Trace-Free+, a learning-based framework that rewrites human-centric API documentation into agent-optimized tool descriptions. By employing a curriculum learning strategy, the system fine-tunes a language model to transition from trace-rich training scenarios to trace-free inference, allowing it to generate high-quality descriptions for completely unseen tools without requiring live execution traces at test time.
WHY it matters? Relying on trial-and-error execution traces during inference is often infeasible in cold-start deployments or privacy-constrained environments. By shifting the optimization burden entirely to an offline compilation step, this method drastically reduces inference costs, preserves data privacy, and scales robustly even when an agent must select from candidate pools exceeding 100 tools.
Executive summary: For practitioners building compound AI systems and tool-using agents, the quality of the environment—specifically the tool interfaces—is just as critical as the reasoning capabilities of the agent itself. This paper demonstrates that we can systematically translate brittle, human-written API documentation into robust, constraint-explicit schemas without incurring the overhead of test-time exploration. This points to a highly deployable paradigm where API ecosystems can be pre-compiled into agent-native formats.

## Quantum Deep Learning: A Comprehensive Review

Post: https://arxiviq.substack.com/p/quantum-deep-learning-a-comprehensive
Authors: Yanjun Ji, Zhao-Yun Chen, Marco Roth, David A. Kreplin, Christian Schiffer, Martin King, Oliver Anton, M. Sahnawaz Alam, Markus Krutzik, Dennis Willsch, Ludwig Mathey, Frank K. Wilhelm, Guo-Ping Guo
Paper: https://arxiv.org/abs/2603.06644
Code: N/A
Model: N/A

TL;DR
WHAT was done? The authors provide a rigorously structured, operational review of Quantum Deep Learning (QDL), formalizing a taxonomy that categorizes the field into four distinct paradigms: hybrid quantum-classical models, quantum deep neural networks, quantum subroutines for deep learning primitives, and quantum-inspired classical algorithms. The work establishes a strict evaluation framework centered on end-to-end resource contracts.
WHY it matters? As quantum hardware transitions from heuristic near-term implementations toward early fault-tolerant systems, the theoretical promise of quantum advantage is frequently obscured by hidden classical overheads and mismatched baselines. This synthesis matters because it standardizes how we must account for data access, state preparation, and finite-shot measurement costs, offering a concrete blueprint for verifying genuine computational symbiosis against advanced classical surrogates.
Executive summary: This comprehensive review acts as a strategic methodology guide for researchers operating at the intersection of deep learning and quantum information. By meticulously dissecting the trade-offs between model expressivity, optimization trainability, and classical simulability, the authors formulate a rigorous four-pillar evaluation protocol. They demonstrate that sustainable progress in QDL requires moving beyond isolated depth capabilities toward holistic, hardware-aware codesign that explicitly tracks the cost of the quantum-classical interface.

## Memento-Skills: Let Agents Design Agents

Post: https://arxiviq.substack.com/p/memento-skills-let-agents-design
Authors: Huichi Zhou, Siyuan Guo, Anjie Liu, Zhongwei Yu, Ziqin Gong, Bowen Zhao, Zhixun Chen, Menglong Zhang, Yihang Chen, Jinsong Li, Runyu Yang, Qiangbin Liu, Xinlei Yu, Jianmin Zhou, Na Wang, Chunyang Sun, Jun Wang
Paper: https://arxiv.org/abs/2603.18743
Code: https://github.com/Memento-Teams/Memento-Skills
Model: N/A

TL;DR
WHAT was done? The authors introduced Memento-Skills, a generalist agent system that autonomously constructs, mutates, and refines reusable task-specific skills without modifying the underlying model’s weights. By treating structured markdown files and code as an external episodic memory, the system uses a closed-loop “Read-Write Reflective Learning” framework to continuously optimize its execution policy based on environmental feedback.
WHY it matters? Deployment-time learning for Large Language Models (LLMs) is traditionally bottlenecked by the prohibitive computational cost of parameter updates. This framework provides a mathematically grounded pathway to continual learning for frozen models, demonstrating that self-improving, persistent memory can yield massive performance gains (over 100% relative improvement on certain benchmarks) while maintaining rigorous convergence guarantees.
Executive summary: For practitioners scaling agentic workflows, relying on static prompts or few-shot libraries limits the agent’s ability to adapt to edge cases over time. Memento-Skills shifts the paradigm from parameter-based learning to memory-based skill evolution. By outfitting a frozen LLM with an offline reinforcement learning router and a mechanism to rewrite its own logic files, the system effectively acts as a senior engineer continuously refactoring a shared codebase. This approach dramatically increases task success rates in complex reasoning environments, suggesting that the future of agentic reliability lies in sophisticated, self-mutating memory architectures rather than solely in larger foundation models.

## MetaClaw: Just Talk -- An Agent That Meta-Learns and Evolves in the Wild

Post: https://arxiviq.substack.com/p/metaclaw-just-talk-an-agent-that
Authors: Peng Xia, Jianwen Chen, Xinyu Yang, Haoqin Tu, Jiaqi Liu, Kaiwen Xiong, Siwei Han, Shi Qiu, Haonian Ji, Yuyin Zhou, Zeyu Zheng, Cihang Xie, Huaxiu Yao
Paper: https://arxiv.org/abs/2603.17187
Code: https://github.com/aiming-lab/MetaClaw
Model: N/A

TL;DR
WHAT was done? The authors proposed MetaClaw, a continual meta-learning framework that enables deployed Large Language Model (LLM) agents to evolve asynchronously in production. It achieves this by combining a gradient-free “fast adaptation” loop that synthesizes natural language skills from failure trajectories with a gradient-based “slow adaptation” loop that performs opportunistic policy optimization during periods of user inactivity.
WHY it matters? Deployed agents inevitably suffer from task distribution drift, rendering static pre-trained weights increasingly misaligned with user workflows. MetaClaw provides a mathematically grounded and system-level solution to this non-stationarity. By introducing a strict versioning mechanism that separates pre-adaptation failure data from post-adaptation success data, it prevents the stale reward contamination that typically plagues continuous reinforcement learning in agents.
Executive summary: For practitioners managing autonomous agent deployments, continuous performance degradation in the face of evolving user requirements is a primary bottleneck. MetaClaw introduces a dual-timescale architecture: immediate behavioral correction through dynamically injected prompt skills, followed by delayed, asynchronous weight updates via cloud-based fine-tuning. This framework abstracts away service downtime while dramatically improving end-to-end task reliability, proving that coordinating discrete semantic memory with continuous parameter optimization can bridge the capability gap between open-weights models and frontier proprietary APIs.

## Hyperagents

Post: https://arxiviq.substack.com/p/hyperagents
Authors: Jenny Zhang, Bingchen Zhao, Wannan Yang, Jakob Foerster, Jeff Clune, Minqi Jiang, Sam Devlin, Tatiana Shavrina
Paper: https://arxiv.org/abs/2603.19461
Code: https://github.com/facebookresearch/Hyperagents
Model: N/A

TL;DR
WHAT was done? The authors introduced DGM-Hyperagents (DGM-H), a framework that unifies a task-solving agent and a meta-optimizing agent into a single, fully editable self-referential program. By embedding this combined entity within an open-ended evolutionary search, the system autonomously rewrites both its task-execution logic and its own underlying self-improvement mechanisms.
WHY it matters? Prior self-improving systems are bottlenecked by human-engineered meta-learning algorithms that fail to generalize across domains. DGM-H demonstrates that an agent can autonomously invent transferable optimization techniques—such as persistent memory systems and automated bias detection—allowing performance gains and meta-level capabilities to compound across entirely disparate domains like robotics reward design and Olympiad-level math grading.
Executive summary: For research leaders and domain experts focused on scalable alignment and open-endedness, this paper from Meta FAIR and university collaborators provides a blueprint for systems that do not merely get better at a task, but get better at the process of getting better. By making the meta-learning mechanism explicitly programmable and editable by the agent itself, the authors bypass the need to hand-engineer domain-specific improvement heuristics, presenting a robust path toward self-accelerating optimization architectures.

## Why AI systems don't learn and what to do about it: Lessons on autonomous learning from cognitive science

Post: https://arxiviq.substack.com/p/why-ai-systems-dont-learn-and-what
Authors: Emmanuel Dupoux, Yann LeCun, Jitendra Malik (FAIR at META, EHESS, UC Berkeley)
Paper: https://arxiv.org/abs/2603.15381
Code: N/A
Model: N/A

TL;DR
WHAT was done? The authors propose a comprehensive conceptual blueprint for autonomous learning architectures, departing from static training pipelines. They formalize a tripartite architecture comprising System A (learning from observation), System B (learning from action), and a hardwired System M (meta-control orchestrator), all optimized through a bilevel evolutionary-developmental (Evo/Devo) framework.
WHY it matters? As modern foundation models encounter diminishing returns on text data scaling and exhibit profound brittleness when faced with domain shifts in the physical world, creating agents capable of autonomous, continuous learning is a critical imperative for the field. This framework provides a theoretically grounded roadmap to escape the rigid constraints of human-driven Machine Learning Operations (MLOps) and build systems that can adapt continuously without human intervention.

## LeWorldModel: Stable End-to-End Joint-Embedding Predictive Architecture from Pixels

Post: https://arxiviq.substack.com/p/leworldmodel-stable-end-to-end-joint
Authors: Lucas Maes, Quentin Le Lidec, Damien Scieur, Yann LeCun, Randall Balestriero
Paper: https://arxiv.org/abs/2603.19312
Code: https://github.com/lucas-maes/le-wm
Model: https://drive.google.com/drive/folders/1r31os0d4-rR0mdHc7OlY_e5nh3XT4r4e

TL;DR
WHAT was done? The authors introduce LeWorldModel (LeWM), an end-to-end Joint Embedding Predictive Architecture (JEPA) that learns a world model directly from raw pixels. The method prevents the notorious representation collapse problem using a streamlined two-term objective: a standard mean-squared error for temporal prediction and a scalable regularization term that enforces an isotropic Gaussian distribution on the latent embeddings.
WHY it matters? This approach effectively eliminates the reliance on fragile architectural heuristics—such as stop-gradients, exponential moving averages, or massive multi-term loss functions—typically required to stabilize self-supervised world models. By reducing the regularization to a single hyperparameter, the framework achieves stable training on a single GPU in hours, yielding a model capable of planning up to 48 times faster than foundation-model-based alternatives while demonstrating zero-shot intuitive physics understanding.
Executive summary: For research leaders and engineers building scalable robotic or planning agents, this paper proves that stable, pixel-to-action world models do not strictly require pre-trained vision encoders or highly complex optimization balancing acts. By mathematically enforcing embedding distributions to match a Gaussian topology, models can organically learn structured, actionable representations directly from offline data. This significantly lowers the compute barrier for physical reasoning tasks and provides a mathematically grounded, reproducible template for predictive architectures.

## Neural Thickets: Diverse Task Experts Are Dense Around Pretrained Weights

Post: https://arxiviq.substack.com/p/neural-thickets-diverse-task-experts
Authors: Yulu Gan, Phillip Isola
Paper: https://arxiv.org/abs/2603.12228
Code: https://github.com/sunrainyg/RandOpt
Model: N/A

TL;DR
WHAT was done? The authors proposed a fully parallel, gradient-free post-training algorithm called RandOpt that improves pretrained large language models by simply sampling random Gaussian noise over the model weights, evaluating these perturbed models, and ensembling the predictions of the top performers.
WHY it matters? This work challenges the assumption that aligning or post-training language models strictly requires complex, sequential optimization like reinforcement learning. It reveals a structural phenomenon termed “neural thickets,” demonstrating that at sufficient scale, a pretrained model acts as a distribution containing dense, diverse task-specific experts right in its immediate weight neighborhood.

## M^2 RNN: Non-Linear RNNs with Matrix-Valued States for Scalable Language Modeling

Post: https://arxiviq.substack.com/p/m2-rnn-non-linear-rnns-with-matrix
Authors: Mayank Mishra, Shawn Tan, Ion Stoica, Joseph Gonzalez, Tri Dao
Paper: https://arxiv.org/abs/2603.14360
Code: https://github.com/open-lm-engine/lm-engine
Model: https://huggingface.co/collections/open-lm-engine/m2rnn

TL;DR
WHAT was done? The authors introduce Matrix-to-Matrix RNN (M²RNN), a novel non-linear recurrent architecture that expands the conventional vector-valued hidden state into a matrix-valued state updated via an outer product.
WHY it matters? Linear state space models and attention mechanisms are constrained in their theoretical expressivity, particularly in tracking deterministic finite-state automata. M²RNN resolves this expressivity deficit while circumventing the severe hardware utilization penalties historically associated with non-linear RNNs, establishing a scalable, highly expressive drop-in layer for modern hybrid architectures.
Executive summary: For architecture researchers and pre-training teams, the core finding is that the historical underperformance of non-linear RNNs (like LSTMs or GRUs) on language modeling tasks was a state-capacity issue, not an inherent flaw of non-linearity itself. By combining a matrix-valued state expansion with an input-dependent, state-independent forget gate, M²RNN achieves superior long-context retrieval and perfect state-tracking length generalization. When deployed sparingly within hybrid architectures, inserting even a single M²RNN layer yields significant perplexity and downstream accuracy gains with minimal throughput degradation.

## V-JEPA 2.1: Unlocking Dense Features in Video Self-Supervised Learning

Post: https://arxiviq.substack.com/p/v-jepa-21-unlocking-dense-features
Authors: Lorenzo Mur-Labadia, Matthew Muckley, Amir Bar, Mido Assran, Koustuv Sinha, Mike Rabbat, Yann LeCun, Nicolas Ballas, Adrien Bardes
Paper: https://arxiv.org/abs/2603.14482
Code: N/A
Model: N/A

TL;DR
WHAT was done? The authors from FAIR at Meta introduce V-JEPA 2.1, a family of self-supervised vision models that unifies image and video representation learning. By extending the Joint-Embedding Predictive Architecture (JEPA) objective to supervise both masked and unmasked context tokens via a distance-weighted prediction loss, and by applying this supervision hierarchically across intermediate encoder layers, the model learns features that are both temporally consistent and spatially dense.
WHY it matters? Historically, self-supervised vision models have forced a tradeoff: image-based models excel at capturing fine-grained local geometry like depth and segmentation, while video-based models excel at capturing global dynamics and motion. V-JEPA 2.1 resolves this dichotomy, yielding a single encoder capable of driving state-of-the-art performance in both dense static tasks, such as monocular depth estimation, and predictive video tasks, such as robotic manipulation and short-term action anticipation. This represents a critical step toward robust, general-purpose world models for embodied AI.

## AgentOS: From Application Silos to a Natural Language-Driven Data Ecosystem

Post: https://arxiviq.substack.com/p/agentos-from-application-silos-to
Authors: Rui Liu, Tao Zhe, Dongjie Wang, Zijun Yao, Kunpeng Liu, Yanjie Fu, Huan Liu, Jian Pei
Paper: https://arxiv.org/abs/2603.08938
Code: N/A
Model: N/A

TL;DR
WHAT was done? The authors propose a conceptual and architectural redesign of the computing environment called AgentOS. It replaces traditional Graphical User Interfaces (GUIs) and isolated applications with a “Single Port” natural language interface and an “Agent Kernel” that dynamically translates user intent into composable “Skills-as-Modules.”
WHY it matters? Deploying probabilistic, autonomous large language model (LLM) agents on top of legacy, deterministic operating systems creates fragile interaction loops and severe security vulnerabilities. By reimagining the operating system as a continuous Knowledge Discovery and Data Mining (KDD) pipeline, AgentOS offers a structurally native way to orchestrate multi-agent workflows, maintain persistent contextual memory, and enforce semantic security boundaries.
Executive summary: The current paradigm of forcing autonomous agents to navigate systems built for human visual processing is fundamentally mismatched, resulting in what the authors term the “Screen-as-Interface” bottleneck. AgentOS resolves this by subsuming the traditional desktop beneath an intelligent intent-routing layer. This shift demands a pivot from conventional systems engineering to real-time data mining, where the operating system must continuously construct personalized knowledge graphs, recommend executable logic, and optimize action sequences to safely operationalize ambiguous human intent.

## OpenClaw-RL: Train Any Agent Simply by Talking

Post: https://arxiviq.substack.com/p/openclaw-rl-train-any-agent-simply
Authors: Yinjie Wang, Xuyang Chen, Xiaolong Jin, Mengdi Wang, Ling Yang
Paper: https://arxiv.org/abs/2603.10165
Code: https://github.com/Gen-Verse/OpenClaw-RL
Model: N/A

TL;DR
WHAT was done? Researchers from Princeton University introduced OpenClaw-RL, an asynchronous reinforcement learning framework designed to train language agents continuously during live deployment. By decoupling policy serving, environment execution, reward judging, and model training into independent asynchronous loops, the system captures ephemeral “next-state signals” (such as user corrections or terminal trace errors) and converts them into optimization gradients using a combination of scalar Process Reward Models (PRMs) and token-level Hindsight-Guided On-Policy Distillation (OPD).
WHY it matters? The prevailing paradigm of agent alignment relies heavily on batch-collected, static datasets or episodic outcome rewards that provide desperately sparse credit assignment for long-horizon tasks. By engineering a non-blocking architecture that dynamically absorbs implicit user and environmental feedback without pausing inference, this work provides a viable blueprint for self-improving agents that adapt in real-time, significantly mitigating the data collection bottleneck in modern reinforcement learning.

## Attention Residuals

Post: https://arxiviq.substack.com/p/attention-residuals
Authors: Guangyu Chen, Yu Zhang, Jianlin Su, Weixin Xu, Siyuan Pan, Yaoyu Wang, Yucheng Wang, Guanduo Chen, Bohong Yin, Yutian Chen, Junjie Yan, Ming Wei, Y. Zhang, Fanqing Meng, Chao Hong, Xiaotong Xie, Shaowei Liu, Enzhe Lu, Yunpeng Tai, Yanru Chen, Xin Men, Haiqing Guo, Y. Charles, Haoyu Lu, Lin Sui, Jinguo Zhu, Zaida Zhou, Weiran He, Weixiao Huang, Xinran Xu, Yuzhi Wang, Guokun Lai, Yulun Du, Yuxin Wu, Zhilin Yang, Xinyu Zhou
Paper: https://arxiv.org/abs/2603.15031
Code: https://github.com/MoonshotAI/Attention-Residuals
Model: N/A

TL;DR
WHAT was done? The authors replace the ubiquitous additive residual connection with “Attention Residuals”, a mechanism that uses learned, depth-wise softmax attention to aggregate representations from all preceding layers. To scale this for massive models, they introduce a block-wise variant with custom pipeline parallelism caching and two-phase inference optimizations.
WHY it matters? Standard residuals uniformly accumulate outputs, leading to unbounded hidden-state growth and the progressive dilution of early-layer information. By migrating to a content-aware retrieval mechanism over network depth, this architecture tightly bounds representation magnitudes, uniformizes gradient flow, and significantly boosts reasoning performance on compute-equivalent models, yielding a 1.25x compute efficiency advantage.

## Omnilingual MT: Machine Translation for 1,600 Languages

Post: https://arxiviq.substack.com/p/omnilingual-mt-machine-translation
Authors: The Omnilingual MT Team, Belen Alastruey, Niyati Bafna, Andrea Caciolai, Kevin Heffernan, Artyom Kozhevnikov, Christophe Ropers, Eduardo Sánchez, Charles-Eric Saint-James, Ioannis Tsiamas, Chierh Cheng, Joe Chuang, Paul-Ambroise Duquenne, Mark Duppenthaler, Nate Ekberg, Cynthia Gao, Pere Lluís Huguet Cabot, João Maria Janeiro, Jean Maillard, Gabriel Mejia Gonzalez, Holger Schwenk, Edan Toledo, Arina Turkatenko, Albert Ventayol-Boada, Rashel Moritz, Alexandre Mourachko, Surya Parimi, Mary Williamson, Shireen Yates, David Dale, Marta R. Costa-jussà
Paper: https://ai.meta.com/research/publications/omnilingual-mt-machine-translation-for-1600-languages/
Code: N/A
Model: N/A

TL;DR
WHAT was done? Researchers at FAIR (Meta) have introduced Omnilingual Machine Translation (OMT), a comprehensive suite of models, datasets, and evaluation metrics that extends machine translation support to over 1,600 languages. They propose two distinct architectural pathways: a decoder-only lineage (OMT-LLaMA) built on LLaMA 3, and a 3B-parameter encoder-decoder model (OMT-NLLB) derived from the OmniSONAR cross-lingual embedding space. To support this scale, the team additionally developed the ¬y seed dataset, the BOUQuET and Met-BOUQuET evaluation frameworks, and the BLASER 3 reference-free quality estimation metric.
WHY it matters? This work shatters the operational ~200-language ceiling that has defined the frontier of massively multilingual machine translation for the past several years. More strategically, it isolates and addresses the “generation bottleneck”—the phenomenon where large models can interpret undersupported languages via cross-lingual transfer but fail to generate coherent text in them. By demonstrating that specialized 1B to 8B parameter models can match or exceed the translation performance of 70B parameter foundational models, this research establishes a Pareto-efficient blueprint for global linguistic inclusion.
Executive summary: For practitioners deploying large language models globally, this paper demonstrates that sheer parameter scaling is an inefficient mechanism for capturing the long tail of human languages. Instead, targeted interventions—such as massive vocabulary expansion, cross-lingual sentence embedding alignment, and structured data generation across grammatical paradigms—yield superior translation fidelity at a fraction of the inference cost. The introduction of BLASER 3 also provides a scalable, automated alternative to expensive human quality estimation across thousands of dialects and scripts.

## Towards a Neural Debugger for Python

Post: https://arxiviq.substack.com/p/towards-a-neural-debugger-for-python
Authors: Maximilian Beck, Jonas Gehring, Jannik Kossen, Gabriel Synnaeve
Paper: https://arxiv.org/abs/2603.09951
Code: N/A
Model: N/A

TL;DR
WHAT was done? The authors formulate interactive debugging as a Markov Decision Process, training language models to predict intermediate program states conditioned on standard debugger actions (e.g., step_into, breakpoint ). They construct a data pipeline that transforms Python execution traces into formatted trajectory trees, enabling both forward execution and inverse state inference.
WHY it matters? Current execution-aware models consume linear, non-interactive traces, which fails to reflect how developers actually isolate faults. By equipping a model with interactive control over simulated execution, this work provides a foundational “world model” for agentic coding systems, allowing them to step through code, reverse-engineer inputs, and iteratively self-correct without needing a live runtime environment.

## The Spike, the Sparse and the Sink: Anatomy of Massive Activations and Attention Sinks

Post: https://arxiviq.substack.com/p/the-spike-the-sparse-and-the-sink
Authors: Shangwen Sun, Alfredo Canziani, Yann LeCun, Jiachen Zhu
Paper: https://arxiv.org/abs/2603.05498
Code: N/A
Model: N/A

TL;DR
WHAT was done? Researchers from New York University and Meta mechanistically decouple two pervasive phenomena in modern Large Language Models: massive activations (extreme magnitude outliers in specific hidden channels) and attention sinks (disproportionate attention mass directed to initial or delimiter tokens). Through rigorous architectural ablations on Llama-style models, they demonstrate that massive activations act as implicit global parameters generated by early feed-forward blocks, while normalization layers independently mold these outliers into sparse, invariant substrates that attention heads exploit to dump excess probability mass.
WHY it matters? This work proves that the persistent overlap between massive activations and attention sinks is an incidental artifact of the pre-norm Transformer architecture, not a functional necessity. By modifying normalization logic or introducing dynamic gating, practitioners can eradicate massive activations without degrading language modeling performance. This provides a direct structural pathway for safer ultra-low-precision quantization and efficient KV-cache management, freeing engineers from building complex, post-hoc workarounds.
See also: [NeurIPS 2025] Gated Attention for Large Language Models: Non-linearity, Sparsity, and Attention-Sink-Free

## Solaris: Building a Multiplayer Video World Model in Minecraft

Post: https://arxiviq.substack.com/p/solaris-building-a-multiplayer-video
Authors: Georgy Savva, Oscar Michel, Daohan Lu, Suppakit Waiwitlikhit, Timothy Meehan, Dhairya Mishra, Srivats Poddar, Jack Lu, Saining Xie
Paper: https://arxiv.org/abs/2602.22208
Code: https://github.com/solaris-wm/solaris
Model: https://huggingface.co/collections/nyu-visionx/solaris-models

TL;DR
WHAT was done? Researchers at New York University developed Solaris, a multi-agent video world model capable of simulating consistent, multi-view observations for multiple interacting players in Minecraft. To achieve this, they built a highly controlled data orchestration engine (SolarisEngine) to collect 12.64 million synchronized multiplayer frames, introduced architectural modifications to share spatial-temporal attention across agents, and proposed a memory-efficient algorithm termed Checkpointed Self Forcing to enable stable long-horizon training.
WHY it matters? Current video world models are inherently solipsistic, modeling environments from a single agent’s perspective. By proving that a unified diffusion architecture can maintain perspective consistency and spatial memory across multiple viewpoints simultaneously, this work lays the structural foundation for training foundation models that can accurately simulate complex multi-agent environments. This is a crucial stepping stone for synthetic data generation and multi-agent reinforcement learning.

## CUDA Agent: Large-Scale Agentic RL for High-Performance CUDA Kernel Generation

Post: https://arxiviq.substack.com/p/cuda-agent-large-scale-agentic-rl
Authors: Weinan Dai, Hanlin Wu, Qiying Yu, Huan-ang Gao, Jiahao Li, Chengquan Jiang, Weiqiang Lou, Yufan Song, Hongli Yu, Jiaze Chen, Wei-Ying Ma, Ya-Qin Zhang, Jingjing Liu, Mingxuan Wang, Xin Liu, Hao Zhou
Paper: https://arxiv.org/abs/2602.24286
Code: https://cuda-agent.github.io/
Model: N/A

TL;DR
WHAT was done? Researchers from ByteDance and Tsinghua University introduced a reinforcement learning framework that trains a Large Language Model (LLM) agent to autonomously write, profile, and optimize low-level CUDA kernels. Supported by a novel synthetic dataset of over 6,000 composite PyTorch operators and a highly isolated execution sandbox, the system leverages Proximal Policy Optimization (PPO) alongside targeted pretraining strategies to stabilize multi-turn agentic learning.
WHY it matters? Hand-optimizing GPU kernels is a notoriously difficult, specialized skill that limits the rapid deployment of novel neural network architectures. By proving that an agentic RL system can consistently discover custom memory access patterns and hardware-specific operator fusions, this work successfully beats static compiler heuristics like torch.compile and outperforms generalist frontier models, pointing toward a future where hardware-aware performance engineering is fully automated.

## FlashAttention-4: Algorithm and Kernel Pipelining Co-Design for Asymmetric Hardware Scaling

Post: https://arxiviq.substack.com/p/flashattention-4-algorithm-and-kernel
Authors: Ted Zadouri, Markus Hoehnerbach, Jay Shah, Timmy Liu, Vijay Thakkar, Tri Dao
Paper: https://arxiv.org/abs/2603.05451
Code: https://github.com/Dao-AILab/flash-attention/tree/main/flash_attn/cute
Model: N/A

TL;DR
WHAT was done? The authors present an algorithmic co-design for computing exact attention specifically optimized for NVIDIA’s Blackwell architecture. The method introduces software-emulated exponential functions, conditional softmax rescaling, and novel 2-CTA tensor core utilization to bypass hardware components that have not scaled as quickly as raw matrix multiplication units.
WHY it matters? Datacenter hardware is experiencing extreme asymmetric scaling. Because Blackwell’s tensor cores are more than twice as fast as the previous generation while memory bandwidth and exponential function units have stagnated, legacy algorithms leave massive compute capabilities on the table. By meticulously restructuring the math to match the physical pipeline, this approach achieves up to 1613 TFLOPs/s, establishing a necessary foundation for efficient long-context model deployment on next-generation clusters.

## Beyond Language Modeling: An Exploration of Multimodal Pretraining

Post: https://arxiviq.substack.com/p/beyond-language-modeling-an-exploration
Authors: Shengbang Tong, David Fan, John Nguyen, Ellis Brown, Gaoyue Zhou, Shengyi Qian, Boyang Zheng, Théophane Vallaeys, Junlin Han, Rob Fergus, Naila Murray, Marjan Ghazvininejad, Mike Lewis, Nicolas Ballas, Amir Bar, Michael Rabbat, Jakob Verbeek, Luke Zettlemoyer, Koustuv Sinha, Yann LeCun, Saining Xie
Paper: https://arxiv.org/abs/2603.03276
Code: N/A
Model: N/A

TL;DR
WHAT was done? Researchers at FAIR, Meta, and NYU conducted a controlled, from-scratch empirical study on unified multimodal pretraining. By combining discrete next-token prediction for language with continuous flow matching for vision within a single architecture, they systematically isolated the variables governing multimodal learning. They demonstrated that a single Representation Autoencoder (RAE) can handle both understanding and generation, and that Mixture-of-Experts (MoE) architectures naturally resolve the scaling asymmetries between language and vision.
WHY it matters? The prevailing approach to multimodal AI involves bolting visual adapters onto frozen language models, a paradigm that confounds new multimodal capabilities with inherited text priors. By training from scratch, this work maps the native scaling laws of unified models. It proves that modality competition is largely an architectural artifact, not a fundamental flaw, and demonstrates that world modeling capabilities—such as navigating an environment based on free-form text commands—emerge zero-shot purely from general multimodal pretraining.

## Secret mixtures of experts inside your LLM

Post: https://arxiviq.substack.com/p/secret-mixtures-of-experts-inside
Authors: Enric Boix-Adsera
Paper: https://arxiv.org/abs/2512.18452
Code: https://github.com/eboix/secret_moe
Model: N/A

TL;DR
WHAT was done? The research introduces a theoretical framework and empirical distillation method demonstrating that the dense Multilayer Perceptron (MLP) layers in trained Large Language Models inherently perform sparse computations that can be accurately approximated by sparsely-activating Mixture of Experts (MoE) layers. This phenomenon is rigorously shown to rely on the dictionary-sparse structure of the neural network’s internal activation distributions, rather than the architecture alone.
WHY it matters? This finding provides a mechanistic explanation for why transitioning from dense architectures to MoE architectures is highly effective in modern frontier models. By proving that standard MLPs already exhibit latent MoE-like structure, this work bridges the gap between deep learning theory and empirical architecture design, offering a mathematically grounded rationale for sparse scaling and providing a resource-efficient paradigm for architectural experimentation via layer-wise distillation.

## Speculative Speculative Decoding

Post: https://arxiviq.substack.com/p/speculative-speculative-decoding
Authors: Tanishq Kumar, Tri Dao, Avner May
Paper: https://arxiv.org/abs/2603.03251
Code: https://github.com/tanishqkumar/ssd
Model: N/A

TL;DR
WHAT was done? The authors introduce Speculative Speculative Decoding (SSD) and its optimized implementation, Saguaro. SSD breaks the sequential dependency between drafting and verification in standard speculative decoding by having the draft model predict verification outcomes and proactively generate speculations for those outcomes in parallel with the target model’s verification pass.
WHY it matters? By effectively hiding drafting latency behind verification compute, SSD achieves up to a 2x speedup over optimized speculative decoding baselines and up to a 5x speedup over standard autoregressive decoding. Crucially, it pushes the strict latency-throughput Pareto frontier outward, demonstrating that speculative methods can be made more compute-efficient per device through aggressive asynchronous parallelism.

## AI Must Embrace Specialization via Superhuman Adaptable Intelligence

Post: https://arxiviq.substack.com/p/ai-must-embrace-specialization-via
Authors: Judah Goldfeder, Philippe Wyder, Yann LeCun, Ravid Shwartz-Ziv
Paper: https://arxiv.org/abs/2602.23643
Code: N/A
Model: N/A

TL;DR
WHAT was done? The authors systematically dismantle the prevailing concept of Artificial General Intelligence (AGI), arguing that human intelligence is fundamentally specialized rather than general. In its place, they propose Superhuman Adaptable Intelligence (SAI)—a framework that shifts the ultimate goal of AI research from a static checklist of capabilities to the measurable speed of skill acquisition and adaptation in high-utility domains.
WHY it matters? The pursuit of a monolithic, do-everything AGI is computationally intractable and scientifically misleading. Shifting the industry’s North Star to SAI provides verifiable benchmarks based on adaptation time and directs engineering focus toward self-supervised learning, modular architectures, and predictive world models rather than raw next-token prediction.

## Alien Science: Sampling Coherent but Cognitively Unavailable Research Directions from Idea Atoms

Post: https://arxiviq.substack.com/p/alien-science-sampling-coherent-but
Authors: Alejandro H. Artiles, Martin Weiss, Levin Brinkmann, Anirudh Goyal, and Nasim Rahaman
Paper: https://arxiv.org/abs/2603.01092
Code: https://anonymous.4open.science/r/Paper-atomyzer-82F4/
Model: N/A

TL;DR
WHAT was done? The authors introduced a pipeline that decomposes thousands of machine learning papers into discrete “idea atoms,” then trains two generative models: one to maximize the structural coherence of atom combinations, and another to minimize their cognitive availability to typical researchers. By fusing these models, the system samples “alien” research directions that are logical but highly unlikely to be proposed by human scientists.
WHY it matters? Standard language models prompted to generate research ideas tend to output highly probable but incremental combinations, converging on a narrow slice of familiar concepts. By formally decoupling plausibility from human cognitive predictability, this framework allows researchers to deliberately explore the blind spots of the scientific community, shifting the role of AI from merely accelerating human ideation to complementing it with genuinely non-obvious trajectories.
The paper is published at the ICLR 2026 Post-AGI Science and Society Workshop.

## Memory Caching: RNNs with Growing Memory

Post: https://arxiviq.substack.com/p/memory-caching-rnns-with-growing
Authors: Ali Behrouz, Zeman Li, Yuan Deng, Peilin Zhong, Meisam Razaviyayn, Vahab Mirrokni
Paper: https://arxiv.org/abs/2602.24281
Code: N/A
Model: N/A

TL;DR
WHAT was done? The authors introduce Memory Caching (MC), a framework that splits input sequences into discrete segments and caches the compressed memory states (checkpoints) of recurrent neural networks at the end of each segment. By utilizing routing and gating mechanisms, current tokens can selectively attend to both their active online memory and a subset of these historical cached states.
WHY it matters? Recurrent neural networks are theoretically constrained by their fixed-size memory capacity, forcing them to overwrite past information and severely degrading performance on recall-intensive tasks. Memory Caching elegantly interpolates between the O ( L ) computational profile of RNNs and the O ( L 2 ) growing capacity of Transformers. By dynamically expanding the effective memory capacity, this technique allows sub-quadratic architectures to achieve near-Transformer performance on in-context retrieval and Needle-In-A-Haystack tasks.

## Evaluating AGENTS.md: Are Repository-Level Context Files Helpful for Coding Agents?

Post: https://arxiviq.substack.com/p/evaluating-agentsmd-are-repository
Authors: Thibaud Gloaguen, Niels Mündler, Mark Müller, Veselin Raychev, Martin Vechev
Paper: https://arxiv.org/abs/2602.11988
Code: N/A
Model: N/A

TL;DR
WHAT was done? Researchers from ETH Zurich and LogicStar.ai rigorously investigated whether repository-level context files (such as AGENTS.md ) actually improve the performance of autonomous coding agents. Because existing benchmarks lack repositories with developer-committed context files, the authors constructed AGENTBENCH, a novel evaluation suite of 138 real-world Python software engineering tasks sourced from niche repositories. They evaluated four frontier models across three settings: providing no context file, providing an LLM-generated context file, and providing a human-written context file.
WHY it matters? Despite ubiquitous recommendations from industry leaders to use context files to guide agents, this paper demonstrates that LLM-generated context files actually degrade task success rates while inflating inference costs by over 20%. The findings challenge standard operational heuristics, revealing that supplying models with broad architectural overviews often distracts them into unbounded exploration rather than focused execution.

## Symmetry in language statistics shapes the geometry of model representations

Post: https://arxiviq.substack.com/p/symmetry-in-language-statistics-shapes
Authors: Dhruva Karkada, Daniel J. Korchinski, Andres Nava, Matthieu Wyart, Yasaman Bahri
Paper: https://arxiv.org/abs/2602.15029
Code: https://github.com/dkarkada/symmetry-stats-repgeom
Model: N/A

TL;DR
WHAT was done? The authors present a unified mathematical theory proving that the highly structured geometric representations found in language models—such as circles for months or continuous 1D manifolds for historical years—emerge spontaneously from translation symmetry in the pairwise co-occurrence statistics of the training corpus. By modeling word co-occurrence driven by continuous latent variables, they analytically derive the exact manifold geometries and validate them empirically across both shallow word embeddings and deep transformer representations (e.g., Gemma 2 2B).
WHY it matters? This research provides a fundamental organizing principle for geometric interpretability. It demonstrates that complex internal representational geometries are not necessarily the product of sophisticated architectural priors or deep computational circuits, but are instead direct, analytically predictable consequences of the low-order statistical structures inherent to natural data. This significantly demystifies how models organize semantic concepts and provides strict theoretical bounds on downstream tasks like linear coordinate decoding.

## Semantic Tube Prediction: Beating LLM Data Efficiency with JEPA

Post: https://arxiviq.substack.com/p/semantic-tube-prediction-beating
Authors: Hai Huang, Yann LeCun, Randall Balestriero
Paper: https://arxiv.org/abs/2602.22617
Code: https://github.com/galilai-group/llm-jepa#stp
Model: N/A

TL;DR
WHAT was done? The authors introduce Semantic Tube Prediction (STP), an auxiliary self-supervised learning objective that forces the hidden states of Large Language Models (LLMs) to follow smooth, locally linear trajectories (geodesics) during training. By regularizing the hidden state evolution to stay within a tight “tube” around these geodesics, STP separates genuine semantic signal from statistical noise without requiring the manual data augmentations characteristic of previous Joint-Embedding Predictive Architectures (JEPAs).
WHY it matters? This approach radically improves the Signal-to-Noise Ratio (SNR) of model updates, allowing LLMs to match standard full-dataset fine-tuning accuracy using 16 times less training data. By effectively challenging the strict data-efficiency bounds implied by traditional power-law scaling, this work demonstrates that geometrically principled priors can dramatically outpace brute-force data scaling.

## Vox Deorum: A Hybrid LLM Architecture for 4X / Grand Strategy Game AI -- Lessons from Civilization V

Post: https://arxiviq.substack.com/p/vox-deorum-a-hybrid-llm-architecture
Authors: John Chen, Sihan Cheng, Can Gurkan, Ryan Lay, Moez Salahuddin
Paper: https://arxiv.org/abs/2512.18564
Code: https://github.com/CIVITAS-John/vox-deorum
Model: N/A

TL;DR
WHAT was done? The authors introduce Vox Deorum, a hybrid “LLM+X” architecture designed for Sid Meier’s Civilization V. The system functionally decapitates the game’s algorithmic AI, replacing its high-level strategic module with an LLM while delegating all micro-tactical execution to traditional search-based algorithms.
WHY it matters? Grand strategy games have historically broken both pure Reinforcement Learning (due to long-horizon credit assignment failures) and pure LLM approaches (due to execution hallucinations and prohibitive token latency). By structurally decoupling macro-strategy from tactical execution, this architecture successfully completes full, 400-turn games with survival and win rates statistically tied with highly optimized algorithmic baselines, proving that hierarchical delegation is the key to scaling LLMs in complex, combinatorially explosive environments.

## Some Simple Economics of AGI

Post: https://arxiviq.substack.com/p/some-simple-economics-of-agi
Authors: Christian Catalini, Xiang Hui, Jane Wu
Paper: https://arxiv.org/abs/2602.20946
Code: N/A
Model: N/A

TL;DR
WHAT was done? The authors introduce a macroeconomic framework that models the transition to Artificial General Intelligence (AGI) not as an expansion of raw capability, but as a collision between two competing cost curves: the exponentially decaying cost to automate execution and the biologically bounded cost of human verification. By partitioning the economy along the axis of “measurability,” the model formalizes the structural erosion of human oversight through mechanisms like the “Missing Junior Loop” and the “Codifier’s Curse.”
WHY it matters? This matters because it shifts the prevailing economic narrative from skill-biased technical change to measurability-biased technical change. It mathematically demonstrates that when autonomous execution scales faster than our capacity to verify it, the economy accumulates severe, unpriced systemic risk. The framework proves that the true bottleneck to realizing value from AGI is not intelligence, but the scalable, underwritten verification of outcomes.

## On the "Induction Bias" in Sequence Models

Post: https://arxiviq.substack.com/p/on-the-induction-bias-in-sequence
Authors: M.Reza Ebrahimi, Michaël Defferrard, Sunny Panchal, Roland Memisevic
Paper: https://arxiv.org/abs/2602.18333
Code: N/A
Model: N/A

TL;DR
WHAT was done? The authors present a large-scale empirical study from Qualcomm AI Research comparing the in-distribution data efficiency of Transformers and Recurrent Neural Networks (RNNs) on state-tracking tasks. By independently varying sequence lengths and state-space sizes, they identify the minimal sample sizes required for convergence. They formalize an “induction bias” and introduce a mechanism-sharing factor to measure whether models learn length-agnostic rules or isolated heuristics.
WHY it matters? While previous literature has extensively documented Transformer failures in out-of-distribution (OOD) length extrapolation, this work reveals a deeper foundational flaw: severe inefficiency even when training and evaluation distributions perfectly match. Transformers are shown to suffer from destructive interference across sequence lengths, learning separate computational paths for different lengths rather than a unified algorithmic rule. This fundamental lack of amortized learning has direct implications for applying sequence models to agentic workflows, multi-hop reasoning, and managing context degradation at scale.

## Let There Be Claws: An Early Social Network Analysis of AI Agents on Moltbook

Post: https://arxiviq.substack.com/p/let-there-be-claws-an-early-social
Authors: H.C.W. Price, H. AlMuhanna, P.M. Bassani, M. Ho, T.S. Evans
Paper: https://arxiv.org/abs/2602.20044
Code: N/A
Model: N/A

TL;DR
WHAT was done? The authors conducted an empirical social network analysis of Moltbook, a newly launched Reddit-style platform exclusively for AI agents. By monitoring over 15,000 active accounts and analyzing 20,040 posts and 192,410 comments over a 12-day window, they mapped the platform’s bipartite co-participation networks and directed comment graphs to quantify structural emergence, community clustering, and topic evolution.
WHY it matters? As the field shifts from isolated reinforcement learning to multi-agent ecosystems, we must understand how autonomous agents interact at scale. This paper provides a crucial empirical baseline demonstrating that large language model (LLM) agents naturally and rapidly self-organize into highly stratified societies. The emergence of extreme attention inequality, strict hierarchical roles, and machine-speed cultural shifts highlights that systemic AI risks will likely arise from aggregate population dynamics rather than single-agent behaviors.

## Causal-JEPA: Learning World Models through Object-Level Latent Interventions

Post: https://arxiviq.substack.com/p/causal-jepa-learning-world-models
Authors: Heejeong Nam, Quentin Le Lidec, Lucas Maes, Yann LeCun, Randall Balestriero
Paper: https://arxiv.org/abs/2602.11389
Code: https://github.com/galilai-group/cjepa
Model: N/A

TL;DR
WHAT was done? The authors introduce Causal-JEPA (C-JEPA), an object-centric world model that applies the Joint Embedding Predictive Architecture to learn interaction-aware dynamics. By shifting the standard masking paradigm from spatial image patches to entire object trajectories over time, the framework forces a bidirectional transformer to predict missing object states by reasoning over the visible states of interacting entities and auxiliary control variables.
WHY it matters? Object-centric world models typically struggle to learn explicit interactions, often defaulting to independent self-dynamics unless heavily constrained by complex architectures. C-JEPA addresses this by treating object-level masking as a latent intervention, functionally demanding relational reasoning to minimize the loss. This inductive bias yields a ~20% absolute improvement in counterfactual reasoning tasks and enables sample-efficient model predictive control, achieving parity with heavy patch-based models while consuming roughly 1% of the token budget.

## Agents of Chaos

Post: https://arxiviq.substack.com/p/agents-of-chaos
Authors: Natalie Shapira, Chris Wendler, Avery Yen, Gabriele Sarti, Koyena Pal, Olivia Floody, Adam Belfki, Alex Loftus, Aditya Ratan Jannali, Nikhil Prakash, Jasmine Cui, Giordano Rogers, Jannik Brinkmann, Can Rager, Amir Zur, Michael Ripa, Aruna Sankaranarayanan, David Atkinson, Rohit Gandikota, Jaden Fiotto-Kaufman, EunJeong Hwang, Hadas Orgad, P Sam Sahil, Negev Taglicht, Tomer Shabtay, Atai Ambus, Nitay Alon, Shiri Oron, Ayelet Gordon-Tapiero, Yotam Kaplan, Vered Shwartz, Tamar Rott Shaham, Christoph Riedl, Reuth Mirsky, Maarten Sap, David Manheim, Tomer Ullman, David Bau
Paper: https://arxiv.org/abs/2602.20021
Code: N/A
Model: N/A

TL;DR
WHAT was done? The authors conducted an exploratory, live-environment red-teaming study on autonomous language-model-powered agents. Over a two-week period, researchers interacted with agents deployed in sandboxed virtual machines with persistent memory, full shell execution, and multi-party communication tools (Discord, email) to expose systemic vulnerabilities under benign and adversarial conditions.
WHY it matters? This research highlights a critical security and governance gap in agentic deployment. It demonstrates that highly capable models, when given operational autonomy and tool access, are structurally vulnerable to unauthorized compliance, identity spoofing, and catastrophic resource mismanagement. This directly challenges current paradigms of AI safety, indicating that post-training behavioral alignment is insufficient for systems operating as delegated proxies in socially embedded environments.

## Discovering Multiagent Learning Algorithms with Large Language Models

Post: https://arxiviq.substack.com/p/discovering-multiagent-learning-algorithms
Authors: Zun Li, John Schultz, Daniel Hennes, Marc Lanctot
Paper: https://arxiv.org/abs/2602.16928
Code: N/A
Model: N/A

TL;DR
WHAT was done? The authors deployed an LLM-driven evolutionary coding system, AlphaEvolve, to automatically discover entirely new algorithm variants for Multi-Agent Reinforcement Learning (MARL). By semantically mutating Python source code, the system discovered novel, non-intuitive extensions to both Counterfactual Regret Minimization (CFR) and Policy Space Response Oracles (PSRO).
WHY it matters? Progress in algorithmic game theory has historically been bottlenecked by human intuition, relying on manual trial-and-error to find mathematically tractable heuristics for regret discounting or meta-strategy blending. This research demonstrates that treating algorithm design as a symbolic search problem yields highly effective, reactive mechanisms—such as volatility-adaptive discounting and asymmetric regret boosting—that significantly outperform state-of-the-art human-designed baselines.

## Think Deep, Not Just Long: Measuring LLM Reasoning Effort via Deep-Thinking Tokens

Post: https://arxiviq.substack.com/p/think-deep-not-just-long-measuring
Authors: Wei-Lin Chen, Liqian Peng, Tian Tan, Chao Zhao, Blake JianHang Chen, Ziqian Lin, Alec Go, Yu Meng
Paper: https://arxiv.org/abs/2602.13517
Code: N/A
Model: N/A

TL;DR
WHAT was done? The authors introduce the Deep-Thinking Ratio (DTR), a mechanistically grounded metric to quantify inference-time reasoning effort. By tracking the layer-wise predictive distributions of intermediate hidden states, DTR isolates “deep-thinking tokens”—tokens whose probability distributions undergo sustained, depth-wise revisions before stabilizing in the latest transformer layers. They also propose Think@n, a test-time scaling strategy that routes compute based on the DTR of short generation prefixes.
WHY it matters? This work addresses the breakdown of the “longer is better” heuristic in test-time compute, where relying on raw token counts often inadvertently optimizes for error-amplifying verbosity (overthinking). By demonstrating that internal latent stabilization is a far superior predictor of reasoning accuracy than sequence length or output confidence, this framework allows for the early termination of flawed reasoning trajectories, matching full self-consistency performance at half the computational cost.
Another recent work challenging the “longer is better” heuristic is “ Think Fast and Slow: Step-Level Cognitive Depth Adaptation for LLM Agents ”.

## The Molecular Structure of Thought: Mapping the Topology of Long Chain-of-Thought Reasoning

Post: https://arxiviq.substack.com/p/the-molecular-structure-of-thought
Authors: Qiguang Chen, Yantao Du, Ziniu Li, Jinhao Liu, Songyao Duan, Jiarui Guo, Minghao Liu, Jiaheng Liu, Tong Yang, Ge Zhang, Libo Qin, Wanxiang Che, Wenhao Huang
Paper: https://arxiv.org/abs/2601.06002
Code: N/A
Model: N/A

TL;DR
WHAT was done? The authors introduce a theoretical framework that models Long Chain-of-Thought (Long CoT) reasoning as a “molecular structure.” By mapping reasoning steps as nodes and cognitive transitions as chemical bonds (Deep Reasoning, Self-Reflection, Self-Exploration), they demonstrate that effective reasoning relies on a stable topological distribution of these bonds rather than surface-level token imitation. They operationalize this via MOLE-SYN, a distribution-transfer method that guides the synthesis of Long CoT structures in weaker instruction models, yielding substantial performance and reinforcement learning stability gains.
WHY it matters? This work provides a mechanistic explanation for why naive distillation of advanced reasoning models often fails and why compressed reasoning traces defend against model cloning. More broadly, it shifts the paradigm of latent reasoning research from node-centric trajectory tracking to edge-centric topological modeling, offering a mathematically grounded blueprint for cold-starting inference-time compute models.

## Unified Latents (UL): How to train your latents

Post: https://arxiviq.substack.com/p/unified-latents-ul-how-to-train-your
Authors: Jonathan Heek, Emiel Hoogeboom, Thomas Mensink, Tim Salimans
Paper: https://arxiv.org/abs/2602.17270
Code: N/A
Model: N/A

TL;DR
WHAT was done? The authors introduce Unified Latents (UL), a framework that jointly trains a deterministic image encoder, a diffusion prior, and a diffusion decoder. By explicitly linking the fixed noise injected into the latent space to the maximum precision of the prior diffusion model, they replace the manual KL-divergence penalties found in standard VAEs with a weighted Mean Squared Error (MSE) over noise levels, offering a precise, mathematically bounded measurement of latent information.
WHY it matters? This method fundamentally resolves the tension between latent information density and generative modeling difficulty. By providing explicit hyper-parameters to tune the bitrate of the latent space, UL establishes a new Pareto frontier for pre-training efficiency, setting highly competitive generation metrics on ImageNet-512 (1.4 FID) and matching the state-of-the-art on Kinetics-600 (1.3 FVD) while requiring fewer training FLOPs than baseline latent diffusion methods. It provides a principled foundation for defining scaling laws in representation learning.

## Think Fast and Slow: Step-Level Cognitive Depth Adaptation for LLM Agents

Post: https://arxiviq.substack.com/p/think-fast-and-slow-step-level-cognitive
Authors: Ruihan Yang, Fanghua Ye, Xiang Wei, Ruoqing Zhao, Kang Luo, Xinbo Xu, Bo Zhao, Ruotian Ma, Shanyi Wang, Zhaopeng Tu, Xiaolong Li, Deqing Yang, Linus
Paper: https://arxiv.org/abs/2602.12662
Code: https://github.com/rhyang2021/CogRouter
Model: N/A

TL;DR
WHAT was done? The authors, hailing from Fudan University and Tencent Hunyuan, introduced CogRouter, a framework designed to dynamically modulate a large language model agent’s cognitive depth at the step level during long-horizon tasks. Grounded in ACT-R cognitive theory, the system defines four hierarchical reasoning levels. It employs a two-stage training pipeline: Cognition-aware Supervised Fine-tuning (CoSFT) for balanced initialization, followed by Cognition-Aware Policy Optimization (CoPO), a novel reinforcement learning algorithm that performs step-level credit assignment via confidence-aware advantage reweighting.
WHY it matters? In the broader landscape of latent concept prediction and test-time compute scaling, current models exhibit severe cognitive rigidity—they either operate as purely reactive policies or engage in exhaustive chain-of-thought universally. CogRouter provides a mathematically principled mechanism to allocate test-time compute strictly where it is needed. By preventing the mode collapse typically seen in trajectory-level RL methods, it enables a 7B parameter model to surpass frontier systems like GPT-4o and OpenAI-o3 in agentic environments, while dramatically reducing token consumption by 62% compared to standard uniform-reasoning baselines.

## Theory of Space: Can Foundation Models Construct Spatial Beliefs through Active Exploration?

Post: https://arxiviq.substack.com/p/theory-of-space-can-foundation-models
Authors: Pingyue Zhang, Zihan Huang, Yue Wang, Jieyu Zhang, Letian Xue, Zihan Wang, Qineng Wang, Keshigeyan Chandrasegaran, Ruohan Zhang, Yejin Choi, Ranjay Krishna, Jiajun Wu, Li Fei-Fei, Manling Li
Paper: https://arxiv.org/abs/2602.07055
Code: https://github.com/mll-lab-nu/Theory-of-Space
Model: N/A

TL;DR
WHAT was done? The authors introduce “Theory of Space” (ToS), a benchmark and evaluation framework designed to test whether Multimodal Large Language Models (MLLMs) can actively explore a partially observable environment to construct, revise, and exploit an explicit internal spatial belief (a cognitive map). Unlike previous benchmarks that test passive spatial reasoning on static images, ToS requires the agent to autonomously navigate to reduce uncertainty and output a structured JSON representation of the world layout at every step.
WHY it matters? This work shifts the evaluation paradigm from stateless input-output mapping to latent state maintenance. It reveals a critical “Active-Passive Gap” where models like GPT-5.2 and Gemini-3 Pro perform significantly worse when they must gather their own information rather than analyzing pre-collected logs. Furthermore, it identifies “Belief Inertia,” a phenomenon where vision-based agents fail to overwrite obsolete spatial priors even after observing contradictory evidence, highlighting a fundamental deficiency in how current foundation models model latent world states over time.

## Next Concept Prediction in Discrete Latent Space Leads to Stronger Language Models

Post: https://arxiviq.substack.com/p/next-concept-prediction-in-discrete
Authors: Yuliang Liu, Yunchong Song, Yixuan Wang, Kewen Ge, Alex Lamb, Qipeng Guo, Kai Chen, Bowen Zhou, Zhouhan Lin
Paper: https://arxiv.org/abs/2602.08984
Code: https://github.com/LUMIA-Group/ConceptLM
Model: N/A

TL;DR
WHAT was done? The authors introduce ConceptLM, a language modeling framework that augments standard Next Token Prediction (NTP) with Next Concept Prediction (NCP). Instead of predicting the sequence solely token-by-token, the model first predicts a high-level “concept”—a discrete latent vector representing a span of k tokens—and uses this concept to condition the generation of the actual tokens. This creates a two-tier hierarchy where the model implicitly “plans” the immediate future in a discrete semantic space before committing to specific syntax.
WHY it matters? This work addresses the efficiency and reasoning limitations of token-myopic models. By forcing the model to predict in a coarser, abstract latent space, ConceptLM demonstrates superior scaling laws—achieving comparable performance to GPT-2/Pythia baselines while using 37% fewer parameters or 24% fewer training tokens. Theoretically, it aligns LLMs closer to the “World Model” paradigm (similar to JEPA in vision), where prediction happens in abstraction rather than pixel/token space, potentially unlocking better long-range dependency modeling.

## Categorical Flow Maps

Post: https://arxiviq.substack.com/p/categorical-flow-maps
Authors: Daan Roos, Oscar Davis, Floor Eijkelboom, Michael Bronstein, Max Welling, İsmail İlkan Ceylan, Luca Ambrogioni, Jan-Willem van de Meent
Paper: https://arxiv.org/abs/2602.12233
Code: N/A
Model: N/A

TL;DR
WHAT was done? The authors introduce Categorical Flow Maps (CFM), a method for training continuous-time generative flow models on the probability simplex to produce discrete data such as text, molecular graphs, and images. They propose a novel endpoint-based parametrisation that rigorously respects the geometry of the simplex and a corresponding self-distillation objective, Endpoint-Consistent Lagrangian Distillation (ECLD). This framework enables high-quality generation in as few as one or two steps.
WHY it matters? While continuous diffusion models have successfully moved to few-step generation via consistency distillation, discrete modalities have lagged behind, often relying on computationally expensive autoregressive loops or high-step discrete diffusion chains. CFM provides a mathematically grounded framework to apply flow matching and self-distillation to discrete data, achieving State-of-the-Art (SOTA) results for single-step generation on molecular graphs (QM9, ZINC) and competitive perplexity on text benchmarks (Text8, LM1B).

## Learning on the Manifold: Unlocking Standard Diffusion Transformers with Representation Encoders

Post: https://arxiviq.substack.com/p/learning-on-the-manifold-unlocking
Authors: Amandeep Kumar, Vishal M. Patel (Johns Hopkins University)
Paper: https://arxiv.org/abs/2602.10099
Code: https://github.com/amandpkr/RJF
Model: N/A

TL;DR
WHAT was done? The authors propose Riemannian Flow Matching with Jacobi Regularization (RJF), a method to train standard Diffusion Transformers (DiTs) directly on the feature spaces of pre-trained encoders like DINOv2 or SigLIP. By replacing Euclidean linear interpolation with geodesic paths on the hypersphere ( S d −1 ) and weighting the loss to account for curvature-induced error propagation, they enable convergence without architectural changes.
WHY it matters? This work challenges the prevailing “capacity bottleneck” hypothesis (e.g., from RAE ). Recent literature suggested that DiTs fail on high-dimensional representation latents unless the model width is massively scaled. This paper proves the failure is actually geometric, not dimensional. By respecting the manifold geometry, the authors achieve SOTA-level performance (FID 3.37 on ImageNet-256) using a standard 131M parameter DiT-B, outperforming baselines that required significantly larger compute budgets.
Another somewhat related recent work was “ One Layer Is Enough: Adapting Pretrained Visual Encoders for Image Generation ”. There Apple’s researchers proposed FAE (Feature Auto-Encoder) to project DINO embeddings into low-dimensional latents suitable for DiT. Here the approach is alternative: do not change the DINO embeddings, and work directly on them, but at the same time do not expand your DiT (which RAE proposes to do).

## When Models Manipulate Manifolds: The Geometry of a Counting Task

Post: https://arxiviq.substack.com/p/when-models-manipulate-manifolds
Authors: Wes Gurnee, Emmanuel Ameisen, Isaac Kauvar, Julius Tarng, Adam Pearce, Chris Olah, Joshua Batson
Paper: https://arxiv.org/abs/2601.04480
Code: N/A
Model: Claude 3.5 Haiku

TL;DR
WHAT was done? The authors successfully reverse-engineered the mechanistic circuitry responsible for line-wrapping in Claude 3.5 Haiku. They demonstrate that the model does not rely on integer registers to track line length; instead, it constructs a “character count manifold”—a spiraling geometric structure embedded in the residual stream. By manipulating the curvature and rotation of this manifold via attention heads, the model performs precise arithmetic operations to determine when to insert a newline.
WHY it matters? This work provides a concrete bridge between feature-based interpretability (sparse dictionaries) and geometric interpretability (manifolds). It reveals that tasks we consider “arithmetic” (counting, subtraction) are implemented in Transformers through “geometric” operations (rotation, projection) on low-dimensional curves. This challenges the notion that neural networks struggle with precise counting by showing they simply adopt a different, continuous mathematical substrate to solve the problem.
ArXivIQ is a reader-supported publication. To receive new posts and support my work, consider becoming a free or paid subscriber.

## Intelligent AI Delegation

Post: https://arxiviq.substack.com/p/intelligent-ai-delegation
Authors: Nenad Tomašev, Matija Franklin, Simon Osindero
Paper: https://arxiv.org/abs/2602.11865
Code: N/A
Model: N/A

TL;DR
WHAT was done? The authors propose a comprehensive framework for “Intelligent Delegation,” moving beyond simple task decomposition to a robust protocol for transferring authority, responsibility, and accountability in multi-agent systems. They introduce mechanisms for dynamic assessment, contract-first decomposition, and verifiable task completion using cryptographic proofs to enable safe, web-scale agent economies.
WHY it matters? As we transition from isolated chatbots to an “agentic web” of interacting systems, heuristic-based orchestration (like simple tool-use loops) becomes brittle and unsafe. This framework provides the necessary theoretical and technical substrate—anchored in principal-agent theory and cryptoeconomic security—to allow agents to hire, monitor, and settle tasks with other agents (and humans) in a trustless environment.

## Rethinking Memory Mechanisms of Foundation Agents in the Second Half: A Survey

Post: https://arxiviq.substack.com/p/rethinking-memory-mechanisms-of-foundation
Authors: Wei-Chieh Huang, Weizhi Zhang, Yueqing Liang, Yuanchen Bei, Yankai Chen, Tao Feng, Xinyu Pan, Zhen Tan, Yu Wang, Tianxin Wei, Shanglin Wu, Ruiyao Xu, Liangwei Yang, Rui Yang, Wooseong Yang, Chin-Yuan Yeh, Hanrong Zhang, Haozhen Zhang, Siqi Zhu, Henry Peng Zou, Wanjia Zhao, Song Wang, Wujiang Xu, Zixuan Ke, Zheng Hui, Dawei Li, Yaozu Wu, Langzhou He, Chen Wang, Xiongxiao Xu, Baixiang Huang, Juntao Tan, Shelby Heinecke, Huan Wang, Caiming Xiong, Ahmed Abdelhadi Metwally, Jun Yan, Chen-Yu Lee, Hanqing Zeng, Yinglong Xia, Xiaokai Wei, Ali Payani, Yu Wang, Haitong Ma, Wenya Wang, Chenguang Wang, Yu Zhang, Xin Eric Wang, Yongfeng Zhang, Jiaxuan You, Hanghang Tong, Xiao Luo, Xue Steve Liu, Yizhou Sun, Wei Wang, Julian McAuley, James Zou, Jiawei Han, Philip S. Yu, Kai Shu
Paper: https://arxiv.org/abs/2602.06052
Code: https://github.com/AgentMemoryWorld/Awesome-Agent-Memory
Model: N/A

TL;DR
WHAT was done? The authors present a comprehensive taxonomy and strategic analysis of memory mechanisms in Large Language Model (LLM) agents, synthesizing over 200 papers. They propose a unified framework categorizing memory by substrate (internal vs. external), cognitive mechanism (episodic, semantic, procedural), and subject (user-centric vs. agent-centric), while exploring the operational lifecycle of memory in both single and multi-agent systems.
WHY it matters? We are transitioning from the “First Half” of AI—defined by static benchmarks and scaling laws—to the “Second Half,” characterized by real-world utility in persistent, long-horizon environments. Static context windows are insufficient for agents that must maintain state over days or months. This survey provides the architectural blueprint for self-evolving agents capable of learning from experience without expensive retraining.
This is the third agent memory review in the last two months. The first two were: Memory in the Age of AI Agents and AI Meets Brain: Memory Systems from Cognitive Neuroscience to Autonomous Agents.

## FIRE: Frobenius-Isometry Reinitialization for Balancing the Stability-Plasticity Tradeoff

Post: https://arxiviq.substack.com/p/fire-frobenius-isometry-reinitialization
Authors: Isaac Han, Sangyeon Park, Seungwon Oh, Donghu Kim, Hojoon Lee, Kyung-Joong Kim
Paper: https://arxiv.org/abs/2602.08040
Code: https://isaac7778.github.io/fire/
Model: N/A

TL;DR
WHAT was done? The authors propose FIRE (Frobenius-Isometry REinitialization), a method that mathematically formalizes weight resetting in continual learning as a constrained optimization problem. Instead of using heuristic noise injection, FIRE projects weights onto an orthogonal manifold to maximize plasticity while minimizing the Frobenius distance to the previous weights to maximize stability. This projection is achieved via an efficient Newton-Schulz iteration that approximates the polar decomposition.
WHY it matters? Neural networks lose the ability to learn (plasticity) over time, particularly in non-stationary environments like Reinforcement Learning (RL) or continual pretraining. Current fixes, such as “Shrink and Perturb,” rely on hand-tuned hyperparameters to guess the right amount of noise to inject. FIRE eliminates this guesswork, providing a theoretically grounded, tuning-free mechanism that demonstrably reduces dormant neurons and improves adaptation in Vision, LLMs, and RL.

## Rectified LpJEPA: Joint-Embedding Predictive Architectures with Sparse and Maximum-Entropy Representations

Post: https://arxiviq.substack.com/p/rectified-lpjepa-joint-embedding
Authors: Yilun Kuang, Yash Dagade, Tim G. J. Rudner, Randall Balestriero, Yann LeCun
Paper: https://arxiv.org/abs/2602.01456
Code: https://github.com/YilunKuang/rectified-lp-jepa
Model: N/A

TL;DR
WHAT was done? The authors introduce Rectified LpJEPA, a self-supervised learning framework that enforces explicit sparsity and non-negativity in latent representations. They propose Rectified Distribution Matching Regularization (RDMReg), which aligns feature distributions with a Rectified Generalized Gaussian (RGG) target using a sliced two-sample distribution-matching loss.
WHY it matters? While recent methods like LeJEPA ( review ) solved representational collapse by forcing features toward isotropic Gaussians, this creates inherently dense representations. This work theoretically and empirically demonstrates that one can maintain maximum-entropy properties while enforcing controllable sparsity ( L 0 ​ norms) via rectification, bridging the gap between biological efficiency (sparse coding) and the scalability of modern Joint-Embedding Predictive Architectures.

## Parallel Stochastic Gradient-Based Planning for World Models

Post: https://arxiviq.substack.com/p/parallel-stochastic-gradient-based
Authors: Michael Psenka, Michael Rabbat, Aditi Krishnapriyan, Yann LeCun, Amir Bar
Paper: https://arxiv.org/abs/2602.00475
Code: https://www.michaelpsenka.io/grasp/
Model: N/A

TL;DR
WHAT was done? The authors introduce GRASP (Gradient RelAxed Stochastic Planner), a parallelized planning algorithm designed specifically for learned world models. Instead of rolling out trajectories sequentially (shooting methods), GRASP treats future states as independent optimization variables (”lifted” states) and optimizes them in parallel using gradient descent. Crucially, it incorporates Langevin dynamics for exploration and a specific stop-gradient mechanism to handle the unstable geometry of learned latent spaces.
WHY it matters? This work appears to be the “reasoning engine” counterpart to Yann LeCun’s Joint Embedding Predictive Architecture ( JEPA ). While recent work has focused on training world models ( V-JEPA, I-JEPA — see review here ), effective planning within those non-Euclidean latent spaces has remained brittle due to exploding gradients and local minima. GRASP solves this by decoupling temporal dependencies, offering a robust way to perform long-horizon control in the high-dimensional latent spaces envisioned by the “Autonomous Machine Intelligence” roadmap.

## From Kepler to Newton: Inductive Biases Guide Learned World Models in Transformers

Post: https://arxiviq.substack.com/p/from-kepler-to-newton-inductive-biases
Authors: Ziming Liu, Sophia Sanborn, Surya Ganguli, Andreas Tolias
Paper: https://arxiv.org/abs/2602.06923
Code: https://github.com/KindXiaoming/newton-kepler
Model: N/A

TL;DR
WHAT was done? The authors investigate the failure of standard Transformers to learn Newtonian mechanics from planetary orbit data—a failure mode recently highlighted by Vafa et al. (2025). They propose three critical inductive biases— Spatial Smoothness, Spatial Stability via noisy context training, and Temporal Locality via context window restriction—that force the model to abandon curve-fitting (Keplerian models) in favor of discovering local causal forces (Newtonian models).
WHY it matters? This work provides a mechanistic explanation for why foundation models can achieve high predictive accuracy without understanding underlying physical laws. It demonstrates a controllable phase transition between “memorizing geometry” and “learning dynamics,” suggesting that for AI to perform scientific discovery, we must architecturally constrain it to look for local, invariant rules rather than global historical patterns.

## Research on World Models Is Not Merely Injecting World Knowledge into Specific Tasks

Post: https://arxiviq.substack.com/p/research-on-world-models-is-not-merely
Authors: Bohan Zeng, Kaixin Zhu, Daili Hua, Bozhou Li, Chengzhuo Tong, Yuran Wang, Xinyi Huang, Yifan Dai, Zixiang Zhang, Yifan Yang, Zhou Liu, Hao Liang, Xiaochen Ma, Ruichuan An, Tianyi Bai, Hongcheng Gao, Junbo Niu, Yang Shi, Xinlong Chen, Yue Ding, Minglei Shi, Kai Zeng, Yiwen Tang, Yuanxing Zhang, Pengfei Wan, Xintao Wang, Wentao Zhang
Paper: https://arxiv.org/abs/2602.01630
Code: N/A
Model: N/A

TL;DR
WHAT was done? The authors present a critical analysis of the current state of “World Models,” arguing that the field has fragmented into task-specific silos (e.g., video generation, embodied driving) that merely “inject” world knowledge rather than simulate it. They propose a Unified World Model Framework that normatively integrates five specific modules: Interaction, Reasoning, Memory, Environment, and Multimodal Generation.
WHY it matters? As we hit data quality bottlenecks in scaling laws, the industry is pivoting toward world models to replace the token-prediction paradigm. However, this paper argues that current SOTA methods (like Sora or specific VLMs) fail at fundamental physical consistency (e.g., object permanence) because they prioritize statistical fitting over systemic coherence. This work provides a design specification to bridge the gap between “generative media” and “physically grounded simulation.”

## AI Meets Brain: Memory Systems from Cognitive Neuroscience to Autonomous Agents

Post: https://arxiviq.substack.com/p/ai-meets-brain-memory-systems-from
Authors: Jiafeng Liang, Hao Li, Chang Li, Jiaqi Zhou, Shixin Jiang, Zekun Wang, Changkai Ji, Zhihao Zhu, Runxuan Liu, Tao Ren, Jinlan Fu, See-Kiong Ng, Xia Liang, Ming Liu, and Bing Qin
Paper: https://arxiv.org/abs/2512.23343
Code: https://github.com/AgentMemory/Huaman-Agent-Memory
Model: N/A

TL;DR
WHAT was done? The authors present a comprehensive survey synthesizing cognitive neuroscience principles with the architecture of Large Language Model (LLM) based agents. They propose a unified taxonomy for agentic memory that mirrors biological systems—specifically distinguishing between episodic (experience) and semantic (knowledge) memory, and mapping the lifecycle of memory formation, storage, retrieval, and updating.
WHY it matters? This work addresses the critical “statelessness bottleneck” in current AI. While LLMs have vast parametric knowledge, they lack the persistent, evolving identity required for long-horizon agency. By formalizing memory not just as a retrieval mechanism (like RAG) but as a dynamic cognitive process (formation, consolidation, forgetting), this survey provides a blueprint for moving agents from passive responders to continuous learners capable of self-evolution.
There was also another recent review of memory for agents: Memory in the Age of AI Agents.

## MoCo: A One-Stop Shop for Model Collaboration Research

Post: https://arxiviq.substack.com/p/moco-a-one-stop-shop-for-model-collaboration
Authors: Shangbin Feng, Yuyang Bai, Ziyuan Yang, Yike Wang, Zhaoxuan Tan, Jiajie Yan, Zhenyu Lei, Wenxuan Ding, Weijia Shi, Haojin Wang, Zhenting Qi, Yuru Jiang, Heng Wang, Chengsong Huang, Yu Fei, Jihan Yao, Yilun Du, Luke Zettlemoyer, Yejin Choi, Yulia Tsvetkov
Paper: https://arxiv.org/abs/2601.21257
Code: https://github.com/BunsenFeng/model_collaboration
Model: N/A

TL;DR
WHAT was done? The authors introduce MOCO, a unified Python library that implements and benchmarks 26 different model collaboration algorithms. These algorithms span four distinct levels of information exchange—API routing, text-based debate, logit fusion, and parameter merging—tested across 25 datasets including reasoning, coding, and safety benchmarks.
WHY it matters? As the field shifts from training single monolithic models to composing systems of experts, research has become fragmented. MOCO provides the first rigorous comparative framework for these disparate methods. Crucially, it quantifies “collaborative emergence,” showing that collaborative systems can solve approximately 18.5% of problems that were previously impossible for any individual constituent model to solve on its own.

## Neural Neural Scaling Laws

Post: https://arxiviq.substack.com/p/neural-neural-scaling-laws
Authors: Michael Y. Hu, Jane Pan, Ayush Rajesh Jhaveri, Nicholas Lourie, Kyunghyun Cho
Paper: https://arxiv.org/abs/2601.19831
Code: https://github.com/michahu/neuneu
Model: N/A

TL;DR
WHAT was done? The authors propose NeuNeu, a neural network-based forecaster that predicts downstream task performance of language models. Unlike traditional scaling laws that fit rigid parametric curves (e.g., power laws) to aggregate metrics, NeuNeu treats forecasting as a time-series extrapolation problem. It utilizes a Transformer backbone conditioned on historical accuracy trajectories and, crucially, token-level validation loss distributions rather than simple averages.
WHY it matters? This approach reduces prediction error by 38% compared to standard logistic scaling laws and successfully predicts non-monotonic behaviors (like inverse scaling) that break parametric assumptions. It demonstrates that the distribution of validation losses contains rich signal about future capabilities that is lost when averaged into a scalar perplexity score, effectively serving as a learned “world model” for training dynamics.

## Memorization Dynamics in Knowledge Distillation for Language Models

Post: https://arxiviq.substack.com/p/memorization-dynamics-in-knowledge
Authors: Jaydeep Borkar, Karan Chadha, Niloofar Mireshghallah, Yuchen Zhang, Irina-Elena Veliche, Archi Mitra, David A. Smith, Zheng Xu, Diego Garcia-Olano
Paper: https://arxiv.org/abs/2601.15394
Code: N/A
Model: N/A

TL;DR
WHAT was done? The authors systematically investigated training data memorization in Large Language Models (LLMs) trained via Knowledge Distillation (KD). By comparing distilled “Student” models against independently fine-tuned “Baseline” models and their “Teachers” (using Pythia, OLMo-2, and Qwen-3 families), they discovered that distillation reduces memorization of training data by over 50%.
WHY it matters? This overturns the assumption that student models inevitably inherit the privacy vulnerabilities of their teachers. The research demonstrates that KD acts as a regularizer that selectively filters out high-entropy “noise” (difficult-to-learn examples) while retaining generalizable knowledge. Furthermore, the authors show that memorization is highly predictable using pre-training metrics like zlib entropy, allowing for proactive data sanitation.

## Perplexity Cannot Always Tell Right from Wrong

Post: https://arxiviq.substack.com/p/perplexity-cannot-always-tell-right
Authors: Petar Veličković, Federico Barbero, Christos Perivolaropoulos, Simon Osindero, Razvan Pascanu
Paper: https://arxiv.org/abs/2601.22950
Code: N/A
Model: N/A

TL;DR
WHAT was done? The authors rigorously prove that for decoder-only Transformers, perplexity is a theoretically flawed metric for model selection. By leveraging recent findings on Transformer continuity, they demonstrate that if a model is confident and accurate on a sequence, there must exist a neighboring sequence where the model is confident but wrong, yet achieves a vanishingly low perplexity score.
WHY it matters? This dismantles the assumption that minimizing perplexity equates to maximizing generation quality or accuracy, particularly in Out-of-Distribution (OOD) settings. It reveals a “blind spot” where models can game the metric by trading accuracy for unearned confidence, suggesting that current leaderboards and evaluation protocols for Large Language Models (LLMs) may be systematically selecting for overconfident hallucinations rather than robust reasoning.

## Shaping capabilities with token-level data filtering

Post: https://arxiviq.substack.com/p/shaping-capabilities-with-token-level
Authors: Neil Rathi, Alec Radford
Paper: https://arxiv.org/abs/2601.21571
Code: https://github.com/neilrathi/token-filtering
Model: Custom Transformers (up to 1.8B)

TL;DR
WHAT was done? The authors propose token-level data filtering as a mechanism to surgically remove specific capabilities (using medical knowledge as a proxy) during the pretraining phase. By training lightweight classifiers to identify and mask specific tokens associated with a target domain, they prevent the model from learning those concepts while preserving adjacent knowledge (e.g., general biology).
WHY it matters? This represents a shift from “post-hoc” safety (RLHF/Unlearning) to “ab initio” safety. The results are striking: token filtering scales significantly better than document-level filtering, creating a 7000× compute slowdown for the model to re-acquire the forgotten knowledge at the 1.8B parameter scale. Furthermore, the paper features Alec Radford (lead author of GPT-2 and GPT-3) as an independent author alongside Anthropic researchers, signaling a high-profile convergence on data curation as a primary safety lever.

## Evolutionary Strategies lead to Catastrophic Forgetting in LLMs

Post: https://arxiviq.substack.com/p/evolutionary-strategies-lead-to-catastrophic
Authors: Immanuel Abdi, Akshat Gupta, Micah Mok, Alexander Lu, Nicholas Lee, Gopala Anumanchipalli
Paper: https://arxiv.org/abs/2601.20861
Code: https://github.com/akshat57/es-catastrophic
Model: https://huggingface.co/collections/immanuelabdi/es-at-scale-lead-to-catastrophic-forgetting

TL;DR
WHAT was done? The authors conducted a rigorous empirical analysis of Evolutionary Strategies (ES) for fine-tuning Large Language Models (LLMs), specifically comparing it against Group Relative Policy Optimization (GRPO). While verifying that ES can match gradient-based methods on specific reasoning tasks, they demonstrate that ES induces severe catastrophic forgetting of prior knowledge.
WHY it matters? As the field pushes toward on-device learning and continuous adaptation, memory-efficient, gradient-free methods like ES are becoming attractive alternatives to backpropagation. However, this study reveals a critical failure mode: ES achieves performance through dense, high-norm parameter updates that globally disrupt the model, suggesting it is currently unsuitable for continual learning scenarios despite its hardware efficiency.

## Self-Improving Pretraining: using post-trained models to pretrain better models

Post: https://arxiviq.substack.com/p/self-improving-pretraining-using
Authors: Ellen Xiaoqing Tan, Shehzaad Dhuliawala, Jing Xu, Ping Yu, Sainbayar Sukhbaatar, Jason Weston, Olga Golovneva
Paper: https://arxiv.org/abs/2601.21343
Code: N/A
Model: N/A

TL;DR
WHAT was done? The authors introduce “Self-Improving Pretraining,” a method that replaces standard next-token prediction with an online reinforcement learning loop during the pretraining phase. Instead of passively learning from raw corpora, the model uses a strong post-trained “teacher” model to rewrite low-quality data on the fly and judge the student model’s own generations. This allows the model to learn from a curated, high-quality signal—composed of rewrites and its own best rollouts—rather than raw web text.
WHY it matters? This approach challenges the prevailing dogma that alignment (safety, factuality) is solely a post-training concern (SFT/RLHF). By integrating preference learning into the pretraining substrate, the method prevents the model from baking in toxicity or hallucinations found in raw data. It demonstrates that models can learn to be safe even when trained on unsafe data, provided the training objective actively steers them away from it, yielding up to 86.3% win rate improvements over standard baselines.

## Self-Distillation Enables Continual Learning

Post: https://arxiviq.substack.com/p/self-distillation-enables-continual
Authors: Idan Shenfeld, Mehul Damani, Jonas Hübotter, Pulkit Agrawal
Paper: https://arxiv.org/abs/2601.19897
Code: http://idanshenfeld.com/SDFT
Model: N/A

TL;DR
WHAT was done? The authors introduce Self-Distillation Fine-Tuning (SDFT), a method that converts standard demonstration datasets into on-policy learning signals. By using a copy of the model conditioned on a demonstration (acting as the teacher) to supervise the unconditioned model (the student), SDFT approximates an Inverse Reinforcement Learning (IRL) objective. This allows the model to update based on its own generated trajectories rather than statically cloning expert behavior.
WHY it matters? Continual learning in Foundation Models is currently bottlenecked by the stability-plasticity dilemma: Supervised Fine-Tuning (SFT) is prone to catastrophic forgetting because it is inherently off-policy (it suffers from distribution shift), while on-policy Reinforcement Learning (RL) requires explicit reward functions that are often unavailable. SDFT offers a “best of both worlds” solution: it achieves the stability and generalization benefits of on-policy learning using only standard demonstration data, significantly outperforming SFT on sequential skill acquisition and knowledge injection tasks.
Another similar concurrent work: Reinforcement Learning via Self-Distillation

## Reinforcement Learning via Self-Distillation

Post: https://arxiviq.substack.com/p/reinforcement-learning-via-self-distillation
Authors: Jonas Hübotter, Frederike Lübeck, Lejs Behric, Anton Baumann, Marco Bagatella, Daniel Marta, Ido Hakimi, Idan Shenfeld, Thomas Kleine Buening, Carlos Guestrin, Andreas Krause
Paper: https://arxiv.org/abs/2601.20802
Code: https://github.com/lasgroup/SDPO
Model: Qwen3, Olmo3-7B-Instruct

TL;DR
WHAT was done? The authors introduce Self-Distillation Policy Optimization (SDPO), an online reinforcement learning algorithm designed to leverage “rich feedback” (e.g., compiler errors, unit test logs) rather than sparse scalar rewards. Instead of relying on an external teacher or a learned reward model, SDPO uses the current policy itself —conditioned on the feedback and the original question—as a “self-teacher.” This mechanism retrospectively evaluates the model’s own attempt and distills corrected token probabilities back into the policy.
WHY it matters? This approach resolves the “credit assignment” bottleneck inherent in modern Reinforcement Learning with Verifiable Rewards (RLVR). By converting unstructured textual feedback into dense, token-level gradients without requiring a superior teacher model (like GPT-4), SDPO allows models to self-correct significantly faster. Empirically, it matches state-of-the-art accuracy with 4x fewer generations than strong baselines and naturally curbing the “reward hacking” verbosity often observed in reasoning models.

## Teaching Models to Teach Themselves: Reasoning at the Edge of Learnability

Post: https://arxiviq.substack.com/p/teaching-models-to-teach-themselves
Authors: Shobhita Sundaram, John Quan, Ariel Kwiatkowski, Kartik Ahuja, Yann Ollivier, Julia Kempe
Paper: https://arxiv.org/abs/2601.18778
Code: N/A
Model: N/A

TL;DR
WHAT was done? The authors propose SOAR (Self-Optimization via Asymmetric RL), a bilevel meta-reinforcement learning framework where a “teacher” LLM generates synthetic problems to train a “student” LLM. Unlike standard self-play that optimizes for game outcomes or intrinsic curiosity, the teacher here is explicitly rewarded based on the student’s measured improvement on a set of unsolvable, hard problems.
WHY it matters? This approach effectively solves the “cold start” problem in Reinforcement Learning with Verifiable Rewards (RLVR). When a model cannot solve a single instance of a hard dataset (0% success rate), standard RL fails due to a lack of gradient signal. SOAR demonstrates that models possess a latent “pedagogical” capability—distinct from problem-solving—that can be sharpened via meta-RL to generate useful “stepping stone” curricula, enabling the student to solve problems that were previously out of reach without human-curated data.

## Advancing regulatory variant effect prediction with AlphaGenome

Post: https://arxiviq.substack.com/p/advancing-regulatory-variant-effect
Authors: Žiga Avsec, Natasha Latysheva, Jun Cheng, Guido Novati, Kyle R. Taylor, Tom Ward, Clare Bycroft, Lauren Nicolaisen, Eirini Arvaniti, Joshua Pan, Raina Thomas, Vincent Dutordoir, Matteo Perino, Soham De, Alexander Karollus, Adam Gayoso, Toby Sargeant, Anne Mottram, Lai Hong Wong, Pavol Drotár, Adam Kosiorek, Andrew Senior, Richard Tanburn, Taylor Applebaum, Souradeep Basu, Demis Hassabis & Pushmeet Kohli
Paper: https://doi.org/10.1038/s41586-025-10014-0
Code: https://github.com/google-deepmind/alphagenome_research
Model: http://deepmind.google.com/science/alphagenome

TL;DR
WHAT was done? The authors introduce AlphaGenome, a unified deep learning model that processes 1 Megabase (Mb) of DNA sequence to predict 5,930 functional genomic tracks (including RNA-seq, splicing, and chromatin features) at single-base resolution. By utilizing a U-Net-inspired architecture with a Transformer bottleneck and a distillation training strategy, the model achieves state-of-the-art performance in both track prediction and variant effect prediction (VEP).
WHY it matters? Previous sequence-to-function models faced a hard trade-off: they either offered high resolution with short context (e.g., SpliceAI ) or long context with low resolution (e.g., Enformer ). AlphaGenome resolves this dichotomy, allowing researchers to simultaneously model fine-grained mechanisms like splicing and long-range interactions like enhancer-promoter looping in a single inference pass.

## "Just in Time" World Modeling Supports Human Planning and Reasoning

Post: https://arxiviq.substack.com/p/just-in-time-world-modeling-supports
Authors: Tony Chen, Sam Cheyette, Kelsey R Allen, Joshua B Tenenbaum, Kevin A Smith
Paper: https://arxiv.org/abs/2601.14514
Code: https://github.com/chentoast/physics_repr
Model: N/A

TL;DR
WHAT was done? The authors propose a “Just-in-Time” (JIT) framework for mental simulation, where agents construct internal representations of a scene incrementally during the simulation process rather than pre-computing a simplified model. By interleaving stochastic simulation with a local visual “lookahead,” the model represents only the objects immediately relevant to the current simulated trajectory.
WHY it matters? This work challenges the dominant “resource-rational” view that agents optimize their mental models before planning—a process that paradoxically requires full knowledge of the environment to determine what to ignore. JIT provides a computationally plausible mechanism for how humans (and potentially autonomous agents) handle complex, cluttered environments by offloading memory to the visual scene, demonstrating superior fit to human behavioral data compared to global optimization baselines.

## Towards Execution-Grounded Automated AI Research

Post: https://arxiviq.substack.com/p/towards-execution-grounded-automated
Authors: Chenglei Si, Zitong Yang, Yejin Choi, Emmanuel Candès, Diyi Yang, Tatsunori Hashimoto
Paper: https://arxiv.org/abs/2601.14525
Code: https://github.com/NoviScl/Automated-AI-Researcher
Model: N/A

TL;DR
WHAT was done? The authors developed an end-to-end “Automated Idea Executor” that allows Large Language Models (LLMs) to not only propose research ideas but also implement them as code patches, execute them on GPUs, and receive ground-truth performance feedback. They utilized this execution feedback loop to improve the ideation capabilities of frontier models (like Claude 3.5 Sonnet and GPT-5) through two distinct methods: evolutionary search and Reinforcement Learning (RL).
WHY it matters? This work addresses the “hallucination bottleneck” in automated science, where agents generate plausible-sounding but functionally useless ideas. By closing the loop with actual execution, the authors demonstrate that LLMs can discover novel algorithms that outperform strong baselines (e.g., beating the best human performance on a specific GRPO task). Crucially, the paper reveals a counter-intuitive divergence in learning dynamics: while evolutionary search effectively discovers outliers, RL tends to suffer from mode collapse, optimizing for “safe,” simple code changes rather than scientific breakthroughs.

## VibeTensor: System Software for Deep Learning, Fully Generated by AI Agents

Post: https://arxiviq.substack.com/p/vibetensor-system-software-for-deep
Authors: Bing Xu, Terry Chen, Fengzhe Zhou, Tianqi Chen, Yangqing Jia, Vinod Grover, Haicheng Wu, Wei Liu, Craig Wittenbrink, Wen-mei Hwu, Roger Bringmann, Ming-Yu Liu, Luis Ceze, Michael Lightstone, Humphrey Shi
Paper: https://arxiv.org/abs/2601.16238
Code: https://github.com/NVLabs/vibetensor
Model: N/A

TL;DR
WHAT was done? The authors present VibeTensor, a functional deep learning system software stack generated entirely by LLM-powered coding agents. Rather than generating isolated scripts, the agents constructed a full runtime environment including a C++20 core, a PyTorch-like Python overlay, a custom CUDA caching allocator, and a reverse-mode autograd engine. The system is capable of training small models like minGPT and Vision Transformers on H100 GPUs, validating that agents can manage complex, stateful abstractions across language boundaries.
WHY it matters? This represents a shift from code generation for “leaf-node” logic to system-level architecture. It empirically demonstrates that current agents can handle memory ownership, concurrency, and cross-language interoperability (C++/Python/CUDA) when constrained by rigorous compile-time and runtime tests. However, it also highlights unique “compositional” failure modes where AI-generated subsystems function correctly in isolation but degrade drastically when integrated, suggesting that agents struggle to “see” global performance dynamics.

## Learning to Discover at Test Time

Post: https://arxiviq.substack.com/p/learning-to-discover-at-test-time
Authors: Mert Yuksekgonul, Daniel Koceja, Xinhao Li, Federico Bianchi, Jed McCaleb, Xiaolong Wang, Jan Kautz, Yejin Choi, James Zou, Carlos Guest rin, Yu Sun
Paper: https://arxiv.org/abs/2601.16175
Code: N/A
Model: gpt-oss-120b

TL;DR
WHAT was done? The authors introduce TTT-Discover, a method that fine-tunes a Large Language Model (LLM) using Reinforcement Learning (RL) during inference on a single, specific test problem. Instead of relying on a frozen model to search for a solution, TTT-Discover updates the model weights dynamically to internalize the structure of the specific task at hand.
WHY it matters? This approach shifts the paradigm of “test-time compute” from pure search (like tree search or rejection sampling) to test-time learning. By optimizing an entropic objective that prioritizes the single best outcome rather than average performance, TTT-Discover achieves state-of-the-art results on open scientific problems—including discovering new bounds for the Erdős Minimum Overlap problem and engineering GPU kernels that outperform human experts—using only an open-weight model ( gpt-oss-120b ).

## The unreasonable effectiveness of pattern matching

Post: https://arxiviq.substack.com/p/the-unreasonable-effectiveness-of
Authors: Gary Lupyan, Blaise Agüera y Arcas
Paper: arXiv:2601.11432
Code: N/A
Model: tested on Gemini 2.5 Pro, Gemini 3 Pro, ChatGPT (o3)

TL;DR
WHAT was done? The authors investigated the capability of Large Language Models (LLMs) to recover semantic meaning from “Jabberwocky” text—passages where content words are replaced by nonsense strings while preserving syntax (e.g., “He dwushed a ghanc zawk”). They demonstrate that models like Gemini and ChatGPT can translate this apparent gibberish back into the original source text or plausible alternatives, and even play interactive fiction games written entirely in nonsense words, solely by leveraging structural patterns.
WHY it matters? This challenges the reductionist view that LLMs are merely “stochastic parrots” or “blurry JPEGs.” The research argues that high-level semantic understanding is an emergent property of sophisticated pattern matching. It suggests that the mechanism LLMs use to “de-blur” nonsense text is fundamentally similar to human cognition, which relies on constraint satisfaction rather than the formal boolean logic favored by symbolic AI.
ArXivIQ is a reader-supported publication. To receive new posts and support my work, consider becoming a free or paid subscriber.

## Do Latent Tokens Think? A Causal and Adversarial Analysis of Chain-of-Continuous-Thought

Post: https://arxiviq.substack.com/p/do-latent-tokens-think-a-causal-and
Authors: Yuyi Zhang, Boyu Tang, Tianjie Ju, Sufeng Duan, Gongshen Liu
Paper: https://arxiv.org/abs/2512.21711
Code: N/A
Model: N/A

TL;DR
WHAT was done? The authors rigorously evaluate the “Chain-of-Continuous-Thought” (COCONUT) paradigm ( see review )—where explicit reasoning tokens are replaced by latent vectors—to determine if true reasoning is occurring. Through causal steering interventions and adversarial “shortcut” datasets, they compare the behavior of latent tokens against explicit Chain-of-Thought (CoT) traces.
WHY it matters? As labs attempt to internalize “System 2” reasoning to save compute and tokens (e.g., COCONUT ), it is critical to know if these compressed states actually encode reasoning or merely act as computational placeholders. This paper provides evidence that current continuous reasoning methods function as “pseudo-reasoning” mechanisms that are highly susceptible to shortcut learning, challenging the reliability of implicit reasoning architectures.

## Modeling Language as a Sequence of Thoughts

Post: https://arxiviq.substack.com/p/modeling-language-as-a-sequence-of
Authors: Nasim Borazjanizadeh, James L. McClelland
Paper: https://arxiv.org/abs/2512.25026
Code: N/A
Model: N/A

TL;DR
WHAT was done? The authors introduce the Thought Gestalt (TG) model, a recurrent Transformer architecture that processes text one sentence at a time. Instead of maintaining a full history of past tokens (KV-cache), TG compresses each processed sentence into a single vector representation—a “gestalt”—which is stored in a differentiable memory. Crucially, the model is trained end-to-end; gradients from future token predictions flow backward through the memory to optimize the parameters that generated earlier sentence representations.
WHY it matters? This approach challenges the dominance of the static context window by demonstrating that “event-level” recurrence can be more data-efficient than raw token attention. The authors show that TG outperforms GPT-2 baselines in data scaling laws (requiring ~5-8% less data for matched perplexity) and significantly mitigates the Reversal Curse (where models fail to infer B → A after learning A → B ), suggesting that compressing context into latent “thoughts” creates more robust semantic representations than surface-level token statistics.

## Learning Latent Action World Models In The Wild

Post: https://arxiviq.substack.com/p/learning-latent-action-world-models
Authors: Quentin Garrido, Tushar Nagarajan, Basile Terver, Nicolas Ballas, Yann LeCun, Michael Rabbat
Paper: https://arxiv.org/abs/2601.05230
Code: N/A
Model: N/A

TL;DR
WHAT was done? The authors successfully trained Latent Action Models (LAMs) on uncurated, in-the-wild video data (YouTube-Temporal-1B) without action labels. Crucially, they demonstrate that continuous latent spaces (regularized via sparsity or noise) significantly outperform the standard Vector Quantization (VQ) approaches used in prior work like Genie when dealing with complex, real-world scene dynamics.
WHY it matters? This work removes the reliance on massive action-labeled datasets or narrow simulation environments for training World Models. By training a lightweight “controller” to map real robot actions to these learned latent actions, the authors show that a model learned purely from YouTube videos can achieve planning performance on robotics tasks (DROID, RECON) comparable to models trained with ground-truth actions, effectively unlocking the internet as a training source for robotic control.

## A Brain-like Synergistic Core in LLMs Drives Behaviour and Learning

Post: https://arxiviq.substack.com/p/a-brain-like-synergistic-core-in
Authors: Pedro Urbina-Rodriguez, Zafeirios Fountas, Fernando E. Rosas, Jun Wang, Andrea I. Luppi, Haitham Bou-Ammar, Murray Shanahan, Pedro A. M. Mediano
Paper: https://arxiv.org/abs/2601.06851
Code: https://github.com/Imperial-MIND-lab/integrated-info-decomp
Model: Gemma 3, Llama 3, Qwen 3, DeepSeek-V2

TL;DR
WHAT was done? The authors applied Integrated Information Decomposition (ΦID) to analyze information flow within Large Language Models (LLMs), treating attention heads and experts as information-processing units. They discovered that LLMs spontaneously develop a “synergistic core” in their middle layers—where information integration exceeds the sum of individual parts—while early and late layers remain predominantly redundant.
WHY it matters? This topological organization mirrors the “synergistic core” found in the human brain, suggesting a convergent evolutionary principle between biological and artificial intelligence. Practically, the study demonstrates that targeting this core during Reinforcement Learning Fine-Tuning (RLFT) yields significantly higher generalization performance on reasoning tasks (MATH benchmark) compared to training redundant components, offering a principled strategy for efficient model training and compression.

## Gecko: An Efficient Neural Architecture Inherently Processing Sequences with Arbitrary Lengths

Post: https://arxiviq.substack.com/p/gecko-an-efficient-neural-architecture
Authors: Xuezhe Ma, Shicheng Wen, Linghao Jin, Bilge Acun, Ruihang Lai, Bohan Hou, Will Lin, Hao Zhang, Songlin Yang, Ryan Lee, Mengxi Wu, Jonathan May, Luke Zettlemoyer, Carole-Jean Wu
Paper: https://arxiv.org/abs/2601.06463
Code: https://github.com/XuezheMax/gecko-llm
Model: N/A

TL;DR
WHAT was done? The authors propose Gecko, a 7B-parameter sequence modeling architecture built upon the Megalodon backbone (gated attention with exponential moving averages). They introduce three architectural refinements to solve stability and retention issues in linear attention: Timestep Decay Normalization to stabilize statistics over time, Sliding Chunk Attention to eliminate boundary artifacts, and Adaptive Working Memory to compress history into a fixed state without the forced forgetting typical of State Space Models.
WHY it matters? Gecko achieves a training loss of 1.68 on 2T tokens, outperforming Llama 2-7B (1.75) and Megalodon-7B (1.70) while matching the efficiency of linear-time models. Uniquely, it exhibits inherent long-context capabilities, successfully retrieving information from contexts up to 4 million tokens without the specialized fine-tuning or context-extension tricks required by Transformers, challenging the dominance of attention-based models in ultra-long-context regimes.
* The perplexity graphs seem to be wrong:) The better graph with log-likelihood is below in the text

## Reasoning Models Generate Societies of Thought

Post: https://arxiviq.substack.com/p/reasoning-models-generate-societies
Authors: Junsol Kim, Shiyang Lai, Nino Scherrer, Blaise Agüera y Arcas and James Evans
Paper: https://arxiv.org/abs/2601.10825
Code: N/A
Model: N/A

TL;DR
WHAT was done? The authors demonstrate that state-of-the-art reasoning models (like DeepSeek-R1 and QwQ-32B) do not merely perform extended computation; they implicitly simulate a “society of thought”—a multi-agent dialogue characterized by distinct internal personas, conflict, and reconciliation. Through mechanistic interpretability and reinforcement learning (RL) ablations, the study shows that steering models toward conversational behaviors directly improves reasoning accuracy.
WHY it matters? This reframes the “Chain of Thought” (CoT) paradigm from a linear computational scaling law to a social scaling phenomenon. It suggests that the efficacy of test-time compute is mechanistically driven by the model’s ability to instantiate diverse, adversarial perspectives within its activation space. This opens a new avenue for model alignment where we optimize for internal cognitive diversity rather than just output correctness.

## Can AI mediation improve democratic deliberation?

Post: https://arxiviq.substack.com/p/can-ai-mediation-improve-democratic
Authors: Michael Henry Tessler, Georgina Evans, Michiel A. Bakker, Iason Gabriel, Sophie Bridgers, Rishub Jain, Raphael Koster, Verena Rieser, Anca Dragan, Matthew Botvinick, and Christopher Summerfield
Paper: https://arxiv.org/abs/2601.05904
Code: https://github.com/google-deepmind/habermas_machine
Model: N/A

TL;DR
WHAT was done? The authors investigate the application of the “Habermas Machine” (HM)—an AI system combining generative Large Language Models (LLMs) with social choice theory—to mediate deliberative discourse. Unlike standard summarization tools, the HM generates candidate consensus statements and utilizes a “Personalized Reward Model” to simulate an election, selecting the statement that maximizes predicted group endorsement via the Schulze method.
WHY it matters? This work proposes a technical solution to “Fishkin’s Trilemma,” which posits that democratic processes cannot simultaneously maximize participation, political equality, and deliberative depth. By automating the synthesis of common ground and enabling hierarchical aggregation, the HM offers a pathway to scale high-quality deliberation to thousands of participants—a feat previously impossible with human moderation alone.

## Classical billiards can compute

Post: https://arxiviq.substack.com/p/classical-billiards-can-compute
Authors: Eva Miranda and Isaac Ramos
Paper: https://arxiv.org/abs/2512.19156
Code: N/A
Model: N/A

TL;DR
WHAT was done? The authors rigorously prove that a single point particle moving inside a two-dimensional billiard table with fixed polygonal (and parabolic) walls is Turing complete. By adapting the framework of Topological Kleene Field Theory (TKFT), they construct a specific billiard table where the trajectory of the ball simulates the evolution of any given reversible Turing machine.
WHY it matters? This result bridges a significant gap in the physical Church-Turing thesis. While high-dimensional or active systems were known to be universal, it was long conjectured (e.g., by Moore in 1990) that low-dimensional, passive systems might lack the complexity for universal computation. This paper refutes that, demonstrating that undecidability is a fundamental feature of standard Hamiltonian mechanics in dimension two. Consequently, determining whether a specific trajectory is periodic or reaches a target region is algorithmically undecidable, placing a hard logical limit on long-term prediction distinct from the sensitivity to initial conditions found in chaos.
ArXivIQ is a reader-supported publication. To receive new posts and support my work, consider becoming a free or paid subscriber.

## Group Representational Position Encoding

Post: https://arxiviq.substack.com/p/group-representational-position-encoding
Authors: Yifan Zhang, Zixiang Chen, Yifeng Liu, Zhen Qin, Huizhuo Yuan, Kangping Xu, Yang Yuan, Quanquan Gu, Andrew Chi-Chih Yao
Paper: https://arxiv.org/abs/2512.07805
Code: https://github.com/model-architectures/GRAPE
Model: N/A

TL;DR
WHAT was done? The authors introduce GRAPE (Group Representational Position Encoding), a unified framework that derives positional encodings from group actions. By formalizing positions as elements of a Lie group acting on the token representation space, GRAPE unifies two distinct families: multiplicative rotations (recovering RoPE via SO ( d )) and additive biases (recovering ALiBi and Forgetting Transformer via unipotent actions in GL ( d + k )).
WHY it matters? This work moves positional encoding from heuristic design to rigorous algebraic structure. It demonstrates that widely used methods like RoPE and ALiBi are merely special cases of a broader generator formulation. Crucially, it introduces efficient closed-form matrix exponentials for learnable subspaces (allowing for non-commuting rotations) and proves that “forgetting” mechanisms in long-context modeling are mathematically equivalent to additive group actions, offering a principled path for designing next-generation context-aware architectures.

## Beyond Real: Imaginary Extension of Rotary Position Embeddings for Long-Context LLMs

Post: https://arxiviq.substack.com/p/beyond-real-imaginary-extension-of
Authors: Xiaoran Liu, Yuerong Song, Zhigeng Liu, Zengfeng Huang, Qipeng Guo, Zhaoxiang Liu, Shiguo Lian, Ziwei He, Xipeng Qiu
Paper: https://arxiv.org/abs/2512.07525
Code: https://github.com/OpenMOSS/rope_pp
Model: N/A

TL;DR
WHAT was done? The authors propose RoPE++, a modification to the standard Rotary Position Embedding that recovers the usually discarded imaginary component of the complex-valued attention score. By treating the real and imaginary parts as independent attention heads—one capturing local semantics and the other capturing global position—they achieve better long-context performance. Additionally, they introduce a configuration that maintains performance while halving the KV cache size.
WHY it matters? Standard RoPE is the de facto standard for LLMs (Llama 3, Qwen 2), but it mathematically discards half the positional information (the phase) during the dot product. RoPE++ demonstrates that this discarded “imaginary” information is governed by a Sine Integral characteristic that naturally favors long-range dependencies. This offers a theoretically grounded method to improve context retrieval and inference efficiency without increasing parameter counts.
Another similar idea was presented earlier in September, see “ Decoupling the “What” and “Where” With Polar Coordinate Positional Embeddings ”. It’s unclear, why the current paper does not cite that work.

## Decoupling the "What" and "Where" With Polar Coordinate Positional Embeddings

Post: https://arxiviq.substack.com/p/decoupling-the-what-and-where-with
Authors: Anand Gopalakrishnan, Robert Csordás, Jürgen Schmidhuber, Michael C. Mozer
Paper: https://arxiv.org/abs/2509.10534
Code: N/A
Model: N/A

TL;DR
WHAT was done? The authors propose Polar Coordinate Position Embedding (PoPE), a modification to the industry-standard Rotary Position Embedding (RoPE). PoPE explicitly separates feature magnitude (content) from phase (position) using a polar coordinate formulation. Unlike RoPE, which rotates pairs of Cartesian coordinates, PoPE treats every dimension as a magnitude derived via a nonlinearity and assigns a strictly position-dependent phase. This removes the mathematical interference between content and positional information in the attention mechanism.
WHY it matters? This architectural shift yields significant improvements in zero-shot length extrapolation without the need for the complex frequency interpolation or fine-tuning required by methods like YaRN. Theoretically, it identifies and fixes an “entanglement” in RoPE where the content of the key and query vectors inadvertently shifts the relative positional encoding. Empirically, it solves specific algorithmic tasks (like pointer arithmetic) that RoPE fails at completely, while improving perplexity on standard language modeling benchmarks across scales (up to 774M parameters).

## Recursive Language Models

Post: https://arxiviq.substack.com/p/recursive-language-models
Authors: Alex L. Zhang, Tim Kraska, Omar Khattab
Paper: https://arxiv.org/abs/2512.24601
Code: N/A
Model: N/A

TL;DR
WHAT was done? The MIT authors propose Recursive Language Models (RLMs), an inference-time paradigm that decouples input length from the model’s physical context window. Instead of tokenizing massive prompts directly, RLMs treat the input as an external variable within a Python REPL environment. The model writes code to programmatically inspect, chunk, and recursively query sub-instances of itself over specific segments of the data.
WHY it matters? This approach effectively solves “context rot”—the performance degradation observed in long-context models (even frontier ones like GPT-5) when processing dense information. By leveraging code for data management and recursion for local reasoning, RLMs achieve state-of-the-art performance on inputs exceeding 10 million tokens (two orders of magnitude beyond current limits) while often reducing inference costs compared to full-context ingestion.

## Extending the Context of Pretrained LLMs by Dropping Their Positional Embeddings

Post: https://arxiviq.substack.com/p/extending-the-context-of-pretrained
Authors: Yoav Gelberg, Koshi Eguchi, Takuya Akiba, Edoardo Cetin
Paper: https://arxiv.org/abs/2512.12167
Code: https://github.com/SakanaAI/DroPE
Model: N/A

TL;DR
WHAT was done? The authors propose DroPE (Dropping Positional Embeddings), a training recipe that decouples the optimization benefits of positional embeddings (PEs) from their inference-time constraints. The method involves pretraining a Transformer with standard Rotary Positional Embeddings (RoPE) to facilitate convergence, then removing the PEs entirely and performing a brief “recalibration” phase (treating the model as a NoPE architecture) on the original context length.
WHY it matters? This approach challenges the assumption that explicit PEs are required for inference or that complex frequency scaling is necessary for context extension. DroPE enables models to generalize zero-shot to sequence lengths far exceeding their training window (e.g., from 2k to 8k+ effective usage) without the performance degradation observed in methods like YaRN or RoPE-NTK, specifically avoiding the “semantic distortion” caused by compressing low-frequency components.

## GDPO: Group reward-Decoupled Normalization Policy Optimization for Multi-reward RL Optimization

Post: https://arxiviq.substack.com/p/gdpo-group-reward-decoupled-normalization
Authors: Shih-Yang Liu, Xin Dong, Ximing Lu, Shizhe Diao, Peter Belcak, Mingjie Liu, Min-Hung Chen, Hongxu Yin, Yu-Chiang Frank Wang, Kwang-Ting Cheng, Yejin Choi, Jan Kautz, Pavlo Molchanov
Paper: https://arxiv.org/abs/2601.05242
Code: https://github.com/NVlabs/GDPO
Model: N/A

TL;DR
WHAT was done? The authors from NVIDIA identify a critical failure mode in Group Relative Policy Optimization (GRPO) when applied to multi-objective reinforcement learning. They propose GDPO, which decouples the normalization process: instead of summing rewards before normalization, GDPO normalizes each reward signal (e.g., correctness, format, brevity) independently within the group before aggregation.
WHY it matters? This solves “reward signal collapse,” where different combinations of raw rewards result in identical advantage estimates, blinding the policy to improvements in specific objectives. GDPO enables stable training of models (like DeepSeek-R1 or Qwen2.5) on complex tasks requiring simultaneous adherence to strict formatting, length constraints, and reasoning correctness, scenarios where standard GRPO frequently fails or converges to suboptimal local minima.

## Training AI Co-Scientists Using Rubric Rewards

Post: https://arxiviq.substack.com/p/training-ai-co-scientists-using-rubric
Authors: Shashwat Goel, Rishi Hazra, Dulhan Jayalath, Timon Willi, Parag Jain, William F. Shen, Ilias Leontiadis, Francesco Barbieri, Yoram Bachrach, Jonas Geiping, Chenxi Whitehouse
Paper: https://arxiv.org/abs/2512.23707
Code: N/A
Model: N/A

TL;DR
WHAT was done? The authors introduce a scalable framework for training Large Language Models (LLMs) to generate rigorous research plans. Instead of relying on expensive human feedback or unavailable wet-lab simulators, they leverage existing scientific literature to automatically extract “Research Goals” and corresponding “Grading Rubrics.” They then train a policy using Reinforcement Learning (specifically Group Relative Policy Optimization) where the reward is provided by a model grading its own outputs against these extracted rubrics.
WHY it matters? This work addresses the “simulator bottleneck” in AI for Science. While AlphaFold utilized physical constraints for rewards, open-ended research planning lacks a computable objective function. By formalizing the peer-review intuition—that verifying a plan is easier than generating it—this paper demonstrates that models can self-improve in abstract reasoning tasks using privileged information (the ground truth rubric) during training, achieving a 70% preference rate over baselines in human expert evaluations.

## Conditional Memory via Scalable Lookup: A New Axis of Sparsity for Large Language Models

Post: https://arxiviq.substack.com/p/conditional-memory-via-scalable-lookup
Authors: Xin Cheng, Wangding Zeng, Damai Dai, Qinyu Chen, Bingxuan Wang, Zhenda Xie, Kezhao Huang, Xingkai Yu, Zhewen Hao, Yukun Li, Han Zhang, Huishuai Zhang, Dongyan Zhao, Wenfeng Liang
Paper: https://github.com/deepseek-ai/Engram/blob/main/Engram_paper.pdf
Code: https://github.com/deepseek-ai/Engram
Model: N/A

TL;DR
WHAT was done? The authors introduce Engram, a “conditional memory” module that injects massive, static N -gram embedding tables into Transformer layers. By decoupling knowledge storage from neural computation, they formulate a Sparsity Allocation law, demonstrating that replacing roughly 20% of Mixture-of-Experts (MoE) parameters with these hash-based lookups significantly improves performance across reasoning and knowledge tasks.
WHY it matters? This work challenges the “all-neural” paradigm of LLMs. It proves that specialized lookups are more efficient than attention for static patterns (entities, idioms), effectively “deepening” the network and freeing up attention heads for complex reasoning. Furthermore, because retrieval indices are deterministic, the memory tables can be offloaded to CPU RAM with negligible latency, offering a path to scale models far beyond GPU HBM limits.
Another recent interesting approach with trading computation for memory was described here.

## From Entropy to Epiplexity: Rethinking Information for Computationally Bounded Intelligence

Post: https://arxiviq.substack.com/p/from-entropy-to-epiplexity-rethinking
Authors: Marc Finzi, Shikai Qiu, Yiding Jiang, Pavel Izmailov, J. Zico Kolter, Andrew Gordon Wilson
Paper: https://arxiv.org/abs/2601.03220
Code: N/A
Model: N/A

TL;DR
WHAT was done? The authors introduce epiplexity, a new information-theoretic measure that quantifies the amount of structural information a computationally bounded observer can extract from data. Unlike Shannon entropy or Kolmogorov complexity, which assume infinite computational resources, epiplexity explicitly accounts for the finiteness of the model (the program) and the training process (the compute).
WHY it matters? This framework resolves longstanding paradoxes where classical theory contradicts deep learning practice—specifically, why deterministic transformations (like running a game engine) can create valuable learning signals, and why predicting data in different orders (factorization) yields different representations. Practically, it offers a rigorous metric for data selection, suggesting that the best pre-training data is not what minimizes final loss (entropy), but what maximizes the learnable structure (epiplexity) absorbed by the model.

## The Art of Scaling Test-Time Compute for Large Language Models

Post: https://arxiviq.substack.com/p/the-art-of-scaling-test-time-compute
Authors: Aradhye Agarwal, Ayan Sengupta, Tanmoy Chakraborty
Paper: https://arxiv.org/abs/2512.02008
Code: https://github.com/Aradhye2002/art_of_tts
Model: N/A

TL;DR
WHAT was done? The authors conducted a large-scale empirical analysis of Test-Time Scaling (TTS) strategies, generating over 30 billion tokens across eight open-source LLMs (ranging from 7B to 235B parameters). They evaluated parallel, sequential, and length-based filtering strategies on reasoning benchmarks like AIME and GPQA Diamond to determine how different model architectures respond to increased inference compute.
WHY it matters? This work challenges the prevailing assumption that “more inference compute always equals better performance.” It identifies distinct model behaviors—termed “Short-Horizon” and “Long-Horizon”—that correlate with specific post-training algorithms (e.g., GRPO vs. GSPO). The study provides a strategic decision matrix for inference engineering, demonstrating that standard techniques like Beam Search can actually degrade performance on reasoning tasks for certain model families.

## KernelEvolve: Scaling Agentic Kernel Coding for Heterogeneous AI Accelerators at Meta

Post: https://arxiviq.substack.com/p/kernelevolve-scaling-agentic-kernel
Authors: Gang Liao, Hongsen Qin, Ying Wang, Alicia Golden, Michael Kuchnik, Yavuz Yetim, Jia Jiunn Ang, Chunli Fu, Yihan He, Samuel Hsia, Zewei Jiang, Dianshi Li, Uladzimir Pashkevich, Varna Puvvada, Feng Shi, Matt Steiner, Ruichao Xiao, Nathan Yan, Xiayu Yu, Zhou Fang, Abdul Zainul-Abedin, Ketan Singh, Hongtao Yu, Wenyuan Chi, Barney Huang, Sean Zhang, Noah Weller, Zach Marine, Wyatt Cook, Carole-Jean Wu, Gaoxiang Liu
Paper: https://arxiv.org/abs/2512.23236
Code: N/A
Model: N/A

TL;DR
WHAT was done? The authors developed KernelEvolve, an automated framework utilizing Large Language Models (LLMs) and graph-based search to generate high-performance Triton kernels. The system integrates a retrieval-augmented generation (RAG) pipeline to inject hardware-specific knowledge (for NVIDIA, AMD, and Meta’s custom MTIA silicon) into generic coding agents, automating the optimization of both compute-intensive and data-preprocessing operators.
WHY it matters? This represents a strategic shift in AI infrastructure: decoupling model architecture from hardware constraints. By achieving 100% correctness on KernelBench and demonstrating up to 17× speedups over PyTorch baselines in production, KernelEvolve proves that agents can manage the combinatorial explosion of operators and hardware targets—crucially enabling the adoption of proprietary silicon (MTIA) where public training data for LLMs is non-existent.

## Spiking Manifesto

Post: https://arxiviq.substack.com/p/spiking-manifesto
Authors: Eugene Izhikevich
Paper: https://arxiv.org/abs/2512.11843
Code: https://github.com/izhikevich/SNN
Model: N/A

TL;DR
WHAT was done? The author proposes a novel Spiking Neural Network (SNN) framework that abandons the simulation of membrane potentials in favor of treating spike latencies as vectors. By mapping relative spike timings (permutations) to synaptic weights via Look-Up Tables (LUTs), the method completely eliminates Matrix Multiplications (MatMuls) from the inference loop, effectively compiling Deep Learning architectures—including Transformers and RNNs—into sparse, memory-efficient table lookups.
WHY it matters? This approach challenges the foundational efficiency bottleneck of modern AI: the O ( N 2 ) compute and memory cost of dense matrix operations. By leveraging the combinatorial explosion of spike orderings ( n! states) rather than the linear capacity of vector spaces, the proposed architecture demonstrates a theoretical 10,000x reduction in memory bandwidth and significantly faster convergence rates, suggesting a viable path toward running LLM-class logic on milliwatt-scale hardware.

## Attention Is Not What You Need

Post: https://arxiviq.substack.com/p/attention-is-not-what-you-need
Authors: Zhang Chong
Paper: arXiv:2512.19428
Code: N/A
Model: N/A

TL;DR
WHAT was done? The author introduces “Causal Grassmann,” an architecture that replaces the standard L × L self-attention mechanism with a geometric mixing layer. Instead of computing global pairwise weights, the model reduces hidden states to a low-dimensional space, treats local token pairs as 2D subspaces on a Grassmann manifold, and encodes their interaction via Plücker coordinates.
WHY it matters? This approach challenges the dogma that soft attention matrices are essential for sequence modeling. By constraining interactions to a finite-dimensional manifold (Gr(2, r )), the method achieves linear complexity O ( L ) in sequence length and offers a pathway toward mathematically tractable interpretability, moving away from the opaque “tensor lifting” of standard Transformers.

## One Layer Is Enough: Adapting Pretrained Visual Encoders for Image Generation

Post: https://arxiviq.substack.com/p/one-layer-is-enough-adapting-pretrained
Authors: Yuan Gao, Chen Chen, Tianrong Chen, Jiatao Gu
Paper: https://arxiv.org/abs/2512.07829
Code: N/A
Model: N/A

TL;DR
WHAT was done? The authors from Apple introduce FAE (Feature Auto-Encoder), a framework that compresses high-dimensional representations from frozen pretrained vision models (like DINOv2 or SigLIP) into low-dimensional latents suitable for generative models. Crucially, they achieve this using an encoder consisting of only a single self-attention layer, paired with a unique “double decoder” strategy that reconstructs features before decoding pixels.
WHY it matters? This approach solves the dimensionality mismatch between “understanding” features (high-dim, redundant) and “generative” latents (low-dim, compact) without complex alignment losses or massive architectural changes to the generator. It enables diffusion models to converge 7–13× faster than concurrent baselines while achieving state-of-the-art FID scores (1.29 on ImageNet 256×256), effectively proving that lightweight adaptation is sufficient to bridge discriminative and generative paradigms.

## Training convolutional neural networks with the Forward–Forward Algorithm

Post: https://arxiviq.substack.com/p/training-convolutional-neural-networks
Authors: Riccardo Scodellaro, Ajinkya Kulkarni, Frauke Alves, Matthias Schröter
Paper: https://www.nature.com/articles/s41598-025-26235-2
Code: https://doi.org/10.5281/zenodo.11571949 (not available at the moment), based on https://github.com/loeweX/Forward-Forward
Model: N/A

TL;DR
WHAT was done? The authors successfully extended Geoffrey Hinton’s Forward-Forward (FF) algorithm—originally restricted to fully connected networks—to Convolutional Neural Networks (CNNs). They achieved this by introducing “spatially-extended labeling,” a technique that superimposes label information (via Fourier patterns or morphological distortions) across the entire input image, allowing convolutional filters to access label data locally at any spatial position.
WHY it matters? This addresses a critical architectural limitation in non-backpropagation learning. Standard FF relies on localized label encoding (like a one-hot corner), which fails in CNNs where shared weights scan the whole image. By demonstrating that CNNs can be trained via local “goodness” maximization on complex datasets like CIFAR-100, this work advances the viability of biologically plausible, low-memory training methods suitable for neuromorphic hardware.

## Dynamic Large Concept Models: Latent Reasoning in an Adaptive Semantic Space

Post: https://arxiviq.substack.com/p/dynamic-large-concept-models-latent
Authors: Xingwei Qu, Shaowen Wang, Zihao Huang, Ge Zhang, Kai Hua, Fan Yin, Rui-Jie Zhu, Jundong Zhou, Qiyang Min, Zihao Wang, Yizhi Li, Tianyu Zhang, He Xing, Zheng Zhang, Yuxuan Song, Tianyu Zheng, Zhiyuan Zeng, Chenghua Lin, Wenhao Huang
Paper: https://arxiv.org/abs/2512.24617
Code: N/A
Model: N/A

TL;DR
WHAT was done? The authors introduce Dynamic Large Concept Models (DLCM), a hierarchical architecture that breaks the standard uniform-compute paradigm of LLMs. Instead of processing every token with equal depth, DLCM dynamically groups tokens into variable-length “concepts” based on learned semantic boundaries. These concepts are processed by a high-capacity “thinking” backbone in a compressed latent space, and then decoded back into tokens via cross-attention.
WHY it matters? This represents a structural shift from “next-token prediction” to “next-concept reasoning.” By decoupling the reasoning granularity from the surface token count, the model achieves better performance on reasoning-heavy tasks (like ARC and PIQA) with matched inference FLOPs. Furthermore, the authors propose a “Decoupled μP “ and a compression-aware scaling law to stabilize and optimize these heterogeneous, non-uniform architectures.

## mHC: Manifold-Constrained Hyper-Connections

Post: https://arxiviq.substack.com/p/mhc-manifold-constrained-hyper-connections
Authors: Zhenda Xie, Yixuan Wei, Huanqi Cao, Chenggang Zhao, Chengqi Deng, Jiashi Li, Damai Dai, Huazuo Gao, Jiang Chang, Liang Zhao, Shangyan Zhou, Zhean Xu, Zhengyan Zhang, Wangding Zeng, Shengding Hu, Yuqing Wang, Jingyang Yuan, Lean Wang, Wenfeng Liang
Paper: https://arxiv.org/abs/2512.24880
Code: N/A
Model: N/A

TL;DR
WHAT was done? The authors from DeepSeek propose Manifold-Constrained Hyper-Connections (mHC), a framework that modifies the recently proposed “Hyper-Connections” architecture by projecting the residual mixing matrices onto the Birkhoff polytope (the set of doubly stochastic matrices). This is achieved via a differentiable Sinkhorn-Knopp iteration within the network’s forward pass.
WHY it matters? While expanding residual streams increases model capacity, it historically breaks the “Identity Mapping” property essential for training deep networks, leading to signal explosion and instability. mHC mathematically restores this property, allowing for wider, more complex topologies (scaling width rather than just depth) without the severe gradient instability or memory overhead typically associated with such expansions.

## Web World Models

Post: https://arxiviq.substack.com/p/web-world-models
Authors: Jichen Feng, Yifan Zhang, Chenggong Zhang, Yifu Lu, Shilong Liu, Mengdi Wang
Paper: https://arxiv.org/abs/2512.23676
Code: https://princeton-ai2-lab.github.io/Web-World-Models/
Model: N/A

TL;DR
WHAT was done? The authors introduce the Web World Model (WWM), a hybrid architectural paradigm that decouples environmental state into two layers: a deterministic “Physics” layer defined by standard web code (TypeScript/JSON), and a probabilistic “Imagination” layer synthesized by Large Language Models (LLMs). Through a suite of implementations—ranging from infinite procedural galaxies to card games and cellular automata—they demonstrate how to build consistent, effectively infinite environments without relying on massive static databases or hallucination-prone end-to-end generative models.
WHY it matters? This work addresses the “missing middle” between rigid, finite web applications and uncontrollable, fully generative world models (like World Models ). By treating the modern web stack as a neuro-symbolic substrate, it offers a practical blueprint for deploying long-running, hallucination-free agents that can explore infinite state spaces while retaining the structural guarantees required for game mechanics and software reliability.

## An Information Theoretic Perspective on Agentic System Design

Post: https://arxiviq.substack.com/p/an-information-theoretic-perspective
Authors: Shizhe He, Avanika Narayan, Ishan S. Khare, Scott W. Linderman, Christopher Ré, Dan Biderman
Paper: https://arxiv.org/abs/2512.21720
Code: N/A
Model: N/A

TL;DR
WHAT was done? The authors formalize the design of multi-step agentic systems (e.g., “Deep Research”) as an information-theoretic problem, modeling the summarization step as a noisy channel. They introduce a tractable estimator for Mutual Information (MI) to measure how well a “compressor” model retains context for a “predictor” model.
WHY it matters? This framework challenges the common heuristic of using the largest possible model for the final reasoning step. The study reveals that “front-loading” compute into the compressor is far more efficient; a 7B parameter compressor paired with a smaller predictor often outperforms massive end-to-end models. Practically, this allows local, edge-device models (3B) to act as compressors, recovering 99% of frontier-model accuracy at 26% of the API cost.

## Sliding Window Recurrences for Sequence Models

Post: https://arxiviq.substack.com/p/sliding-window-recurrences-for-sequence
Authors: Dragos Secrieru, Garyk Brixi, Yoshua Bengio, Taiji Suzuki, Michael Poli, Stefano Massaroli
Paper: https://arxiv.org/abs/2512.13921
Code: N/A
Model: N/A

TL;DR
WHAT was done? The authors introduce Sliding Window Recurrences (SWR) and the Phalanx layer, a token-mixing primitive that approximates linear recurrences by truncating them to hardware-aligned local windows. Specifically, they propose a “Jagged Window” approximation implemented via a Block Two-Pass (B2P) algorithm. This method replaces the global scan operation—typical of state space models—with fully parallelizable local matrix multiplications and a single-step neighbor update, effectively reducing the algorithmic depth to O (1).
WHY it matters? While linear recurrences (like Mamba or GLA) are theoretically efficient ( O ( N )), their implementation often relies on parallel scans (prefix sums) that are memory-bandwidth bound and struggle to fully utilize Tensor Cores. By mathematically formalizing the decay of information in stable systems, this paper demonstrates that long-range recurrence dependencies can be safely severed after a specific horizon. This allows the Phalanx layer to map perfectly onto GPU memory hierarchies (registers → shared memory), delivering over 10-40% speedups compared to optimized Transformers and Sliding Window Attention (SWA) at context lengths from 4K to 32K, without degrading perplexity in hybrid architectures.

## Adaptation of Agentic AI

Post: https://arxiviq.substack.com/p/adaptation-of-agentic-ai
Authors: Pengcheng Jiang, Jiacheng Lin, Zhiyi Shi, Zifeng Wang, Luxi He, Yichen Wu, Ming Zhong, Peiyang Song, Qizheng Zhang, Heng Wang, Xueqiang Xu, Hanwen Xu, Pengrui Han, Dylan Zhang, Jiashuo Sun, Chaoqi Yang, Kun Qian, Tian Wang, Changran Hu, Manling Li, Quanzheng Li, Hao Peng, Sheng Wang, Jingbo Shang, Chao Zhang, Jiaxuan You, Liyuan Liu, Pan Lu, Yu Zhang, Heng Ji, Yejin Choi, Dawn Song, Jimeng Sun, Jiawei Han
Paper: https://arxiv.org/abs/2512.16301
Code: https://github.com/pat-jj/Awesome-Adaptation-of-Agentic-AI
Model: N/A

TL;DR
WHAT was done? The authors introduce a unified taxonomy for “Agentic Adaptation,” categorizing how AI systems improve through interaction. They decompose the design space into four paradigms based on the locus of optimization (modifying the Agent vs. modifying the Tool) and the source of supervision (Tool Execution vs. Agent Output).
WHY it matters? This framework identifies a critical shift in system design: moving from expensive, monolithic model finetuning (adapting the agent) to the “Symbiotic Inversion” (adapting lightweight tools to serve frozen agents). This insight offers a path to build systems that achieve state-of-the-art performance with orders of magnitude less training data and compute than current reasoning models like DeepSeek-R1.

## Hypernetworks That Evolve Themselves

Post: https://arxiviq.substack.com/p/hypernetworks-that-evolve-themselves
Authors: Joachim Winther Pedersen, Erwan Plantec, Eleni Nisioti, Marcello Barylli, Milton Montero, Kathrin Korte, Sebastian Risi
Paper: https://arxiv.org/abs/2512.16406
Code: https://github.com/Joachm/self-referential_GHNs (404 for now)
Model: N/A

TL;DR
WHAT was done? The authors propose Self-Referential Graph HyperNetworks (GHNs), a class of neural networks capable of generating parameters not only for a policy network but also for their own offspring. By embedding a stochastic variation mechanism within the network architecture itself, the system internalizes the evolutionary operators (mutation and inheritance) that are typically handled by external algorithms.
WHY it matters? This represents a structural shift from “optimizing a fixed model” to creating “models that optimize themselves.” The approach demonstrates superior adaptation in non-stationary environments (where rules change abruptly) compared to traditional evolutionary strategies like CMA-ES or OpenES. It suggests that “evolvability”—the ability to effectively explore the search space—can be learned as a context-dependent trait rather than applied as a fixed heuristic.

## Sophia: A Persistent Agent Framework of Artificial Life

Post: https://arxiviq.substack.com/p/sophia-a-persistent-agent-framework
Authors: Mingyang Sun, Feng Hong, Weinan Zhang
Paper: https://arxiv.org/abs/2512.18202
Code: N/A
Model: N/A

TL;DR
WHAT was done? The authors propose “System 3,” a meta-cognitive architectural layer designed to sit above standard LLM perception (System 1) and reasoning (System 2) modules. They instantiate this via Sophia, a persistent agent framework that integrates episodic memory, intrinsic motivation, and theory-of-mind. Unlike traditional agents that reset between sessions, Sophia maintains a continuous “Growth Journal,” allowing it to generate its own learning goals and refine its behavior over time without parameter updates.
WHY it matters? This work addresses the “ossification” problem in current agentic AI: the inability of deployed agents to adapt to non-stationary environments or improve without human-in-the-loop retraining. By demonstrating how Forward Learning (primarily achieved through in-context adaptation) can be orchestrated by a meta-controller to achieve an 80% reduction in reasoning costs for recurring tasks, the paper offers a concrete engineering blueprint for moving from reactive tools to persistent, self-evolving digital entities (Artificial Life).

## The Prism Hypothesis: Harmonizing Semantic and Pixel Representations via Unified Autoencoding

Post: https://arxiviq.substack.com/p/the-prism-hypothesis-harmonizing
Authors: Weichen Fan, Haiwen Diao, Quan Wang, Dahua Lin, Ziwei Liu
Paper: https://arxiv.org/abs/2512.19693
Code: https://github.com/WeichenFan/UAE
Model: N/A

TL;DR
WHAT was done? The authors propose the “Prism Hypothesis,” positing that the tension between semantic understanding (e.g., DINO) and visual generation (e.g., VAEs) is a frequency-domain problem: semantics reside in low frequencies, while details reside in high frequencies. Based on this, they introduce Unified Autoencoding (UAE), a tokenizer that decomposes pretrained semantic latents into frequency bands. It retains a semantic base band aligned with the teacher model while offloading fine-grained reconstruction details to residual high-frequency bands.
WHY it matters? Current foundation models rely on disjoint architectures—separate encoders for understanding and decoding for generation—creating significant inefficiency and representation misalignment. UAE demonstrates that a single latent space can achieve state-of-the-art reconstruction (beating RAE and SVG ) while maintaining the high linear-probing accuracy of discriminative models, effectively unifying perception and generation without the typical trade-offs.

## NVIDIA Nemotron 3: Efficient and Open Intelligence

Post: https://arxiviq.substack.com/p/nvidia-nemotron-3-efficient-and-open
Authors: NVIDIA (250+ сontributors)
Paper: https://arxiv.org/abs/2512.20856
Code: https://github.com/NVIDIA-NeMo/RL
Model: https://huggingface.co/collections/nvidia/nvidia-nemotron-v3 (Nemotron 3 Nano model and Tech Report are published. Super and Ultra releases will follow in the coming months)

TL;DR
WHAT was done? The authors introduce the Nemotron 3 family (Nano, Super, Ultra), a new line of language models utilizing a hybrid Mamba-Transformer Mixture-of-Experts (MoE) architecture. Key innovations include LatentMoE (a routing mechanism that compresses expert inputs to save bandwidth), native NVFP4 training for the larger models, and a specialized multi-environment Reinforcement Learning (RL) pipeline.
WHY it matters? This release marks a significant architectural shift in the Nemotron lineage, moving from dense hybrids to sparse MoE hybrids to maximize inference throughput. By combining the constant-state generation of Mamba with a hardware-aware LatentMoE design, the models achieve a 1M token context window and massive throughput gains over standard Transformers, while NVFP4 sets a new baseline for low-precision training stability.

## PHOTON: Hierarchical Autoregressive Modeling for Lightspeed and Memory-Efficient Language Generation

Post: https://arxiviq.substack.com/p/photon-hierarchical-autoregressive
Authors: Yuma Ichikawa, Naoya Takagi, Takumi Nakagawa, Yuzi Kanazawa, Akira Sakai
Paper: https://arxiv.org/abs/2512.20687
Code: N/A
Model: N/A

TL;DR
WHAT was done? The authors propose PHOTON, a hierarchical language model architecture that abandons the standard “flat” autoregressive scan in favor of a multi-resolution approach. PHOTON processes text via a bottom-up encoder that compresses tokens into coarse latent streams, and a top-down decoder that reconstructs fine-grained tokens using strictly bounded local attention.
WHY it matters? This architecture fundamentally decouples the cost of generation from the total sequence length during the decoding phase. By maintaining a compact, slowly updating global state and restricting token-level generation to local chunks, PHOTON reduces Key-Value (KV) cache traffic by orders of magnitude. This yields up to 10 3 × higher throughput per unit of memory compared to vanilla Transformers in memory-bound settings, offering a potential solution to the bandwidth bottleneck in long-context serving.

## Distributional AGI Safety

Post: https://arxiviq.substack.com/p/distributional-agi-safety
Authors: Nenad Tomašev, Matija Franklin, Julian Jacobs, Sébastien Krier, Simon Osindero
Paper: https://arxiv.org/abs/2512.16856
Code: N/A
Model: N/A

TL;DR
WHAT was done? The authors propose a “Distributional AGI Safety” framework that shifts the locus of control from aligning individual models to governing the interactions of multi-agent systems. They introduce the concept of a Virtual Agentic Sandbox Economy, a defense-in-depth architecture where safety is enforced through market mechanisms—such as transaction taxes, cryptographically verified identity, and circuit breakers—rather than solely relying on the internal weights of a single neural network.
WHY it matters? Current safety paradigms largely assume a monolithic AGI emergence (one giant model). This paper argues for the “Patchwork AGI” hypothesis: general intelligence emerging from a network of specialized, sub-AGI agents. This matters strategically because standard methods like RLHF cannot prevent emergent collective pathologies—such as tacit collusion or flash crashes—requiring us to treat AGI safety as a problem of economic design and system governance rather than just individual value alignment.

## Bolmo: Byteifying the Next Generation of Language Models

Post: https://arxiviq.substack.com/p/bolmo-byteifying-the-next-generation
Authors: Benjamin Minixhofer, Tyler Murray, Tomasz Limisiewicz, Anna Korhonen, Luke Zettlemoyer, Noah A. Smith, Edoardo M. Ponti, Luca Soldaini, Valentin Hofmann
Paper: https://arxiv.org/abs/2512.15586
Code: https://github.com/allenai/bolmo-core
Model: https://huggingface.co/allenai/Bolmo-7B

TL;DR
WHAT was done? The authors introduce Bolmo, a family of byte-level language models (1B and 7B) created not by training from scratch, but by “byteifying” existing subword models (Olmo 3). By replacing the embedding and tokenizer layers of a pre-trained Transformer with lightweight, local Recurrent Neural Networks (mLSTMs) and employing a two-stage distillation process, they convert a subword model to a byte-level model using less than 1% of the original pre-training token budget.
WHY it matters? Byte-level models (BLMs) theoretically solve major issues like tokenization bias, vocabulary bottlenecks, and character blindness, but they have historically been prohibitively expensive to train to state-of-the-art levels. This work provides a generalizable recipe to “retrofit” high-performance subword models into byte-level models efficiently. Crucially, it demonstrates that these retrofitted models can inherit the post-training ecosystem (e.g., instruction tuning) of their parents via weight merging, bypassing the need to rebuild the entire safety and alignment pipeline for byte-level architectures.

## SonicMoE: Accelerating MoE with IO and Tile-aware Optimizations

Post: https://arxiviq.substack.com/p/sonicmoe-accelerating-moe-with-io
Authors: Wentao Guo, Mayank Mishra, Xinle Cheng, Ion Stoica, Tri Dao
Paper: https://arxiv.org/abs/2512.14080
Code: https://github.com/Dao-AILab/sonic-moe
Model: N/A

TL;DR
WHAT was done? The authors introduce SonicMoE, a hardware-aware training framework designed specifically for “fine-grained” Mixture of Experts (MoE) models (high expert count, small intermediate dimensions). The work proposes a memory-efficient backward pass algorithm that minimizes activation caching, a set of Hopper-optimized kernels that overlap heavy IO with computation, and a novel “Token Rounding” routing strategy that eliminates padding overhead in Grouped GEMMs.
WHY it matters? As demonstrated by models like DeepSeek-V3 and Qwen3, the industry is shifting toward fine-grained MoEs to maximize model quality per FLOP. However, this granularity introduces severe memory bandwidth bottlenecks and computational waste due to GEMM tile misalignment. SonicMoE effectively solves this, achieving a 1.86x throughput improvement on H100s compared to state-of-the-art baselines like ScatterMoE and reducing activation memory by 45%, enabling the training of massive MoEs on fewer GPUs.

## A Practical Guide for Designing, Developing, and Deploying Production-Grade Agentic AI Workflows

Post: https://arxiviq.substack.com/p/a-practical-guide-for-designing-developing
Authors: Eranga Bandara, Ross Gore, Peter Foytik, Sachin Shetty, Ravi Mukkamala, Abdul Rahman, Xueping Liang, Safdar H. Bouka, Amin Hass, Sachini Rajapakse, Ng Wee Keong, Kasun De Zoysae, Aruna Withanage, Nilaan Loganathan
Paper: https://arxiv.org/abs/2512.08769
Code: https://gitlab.com/rahasak-labs/podcast-workflow
Model: N/A

TL;DR
WHAT was done? The authors present a comprehensive engineering framework for transitioning agentic AI from experimental notebooks to production-grade Kubernetes environments. Using a “News-to-Podcast” generation workflow as a case study, they propose nine specific design patterns—such as “Pure Functions over Tool Calls” and “Consortium-based Reasoning”—to mitigate the non-determinism inherent in Large Language Models (LLMs).
WHY it matters? As organizations move beyond single-prompt completion to multi-step agentic workflows, reliability becomes the primary bottleneck. This paper provides a necessary blueprint for AgentOps, demonstrating how to decouple reasoning from execution and establishing that strict software engineering principles (like the Single Responsibility Principle) are even more critical when the compute engine is probabilistic.

## Next-Embedding Prediction Makes Strong Vision Learners

Post: https://arxiviq.substack.com/p/next-embedding-prediction-makes-strong
Authors: Sihan Xu, Ziqiao Ma, Wenhao Chai, Xuweiyi Chen, Weiyang Jin, Joyce Chai, Saining Xie, Stella X. Yu
Paper: https://arxiv.org/abs/2512.16922
Code: https://github.com/sihanxu/nepa
Model: https://huggingface.co/collections/SixAILab/nepa

TL;DR
WHAT was done? The authors introduce NEPA (Next-Embedding Predictive Autoregression), a self-supervised learning framework that trains Vision Transformers (ViT) by predicting the embedding of the next image patch conditioned on previous patches. Unlike standard generative approaches, NEPA operates entirely in a continuous latent space without discrete tokenizers (like VQ-VAE) or pixel-level reconstruction (like MAE).
WHY it matters? This approach effectively unifies the training objective of vision and language models. By demonstrating that a pure “next-token prediction” objective works on continuous visual representations without auxiliary momentum encoders or contrastive negative pairs, NEPA offers a scalable, simplified paradigm. It achieves state-of-the-art results (85.3% Top-1 on ImageNet-1K with ViT-L), proving that causal modeling is sufficient for learning robust visual semantics.

## VL-JEPA: Joint Embedding Predictive Architecture for Vision-language

Post: https://arxiviq.substack.com/p/vl-jepa-joint-embedding-predictive
Authors: Delong Chen, Mustafa Shukor, Théo Moutakanni, Willy Chung, Jade Yu, Tejaswi Kasarla, Allen Bolourchi, Yann LeCun, Pascale Fung
Paper: https://arxiv.org/abs/2512.10942
Code: N/A
Model: N/A

TL;DR
WHAT was done? The authors introduce VL-JEPA, a non-autoregressive vision-language model that predicts continuous text embeddings rather than discrete tokens. By utilizing a Joint Embedding Predictive Architecture (JEPA), the model aligns visual inputs and textual queries directly in a latent representation space, invoking a text decoder only when human-readable output is strictly necessary.
WHY it matters? This architecture decouples semantic reasoning from syntactic generation. It yields a 2.85x reduction in decoding operations for streaming video tasks through “selective decoding” and outperforms standard token-generating VLMs of comparable size in controlled settings. Theoretically, it validates the shift towards LeCun’s “World Model” approach in the multimodal domain, proving that supervision in abstract embedding space is more sample-efficient than reconstruction in data space.

## T5Gemma 2: Seeing, Reading, and Understanding Longer

Post: https://arxiviq.substack.com/p/t5gemma-2-seeing-reading-and-understanding
Authors: Biao Zhang, Paul Suganthan, Gaël Liu, Ilya Philippov, Sahil Dua, Ben Hora, Kat Black, Gus Martins, Omar Sanseviero, Shreya Pathak, Cassidy Hardin, Francesco Visin, Jiageng Zhang, Kathleen Kenealy, Qin Yin, Olivier Lacombe, Armand Joulin, Tris Warkentin and Adam Roberts
Paper: https://arxiv.org/abs/2512.14856
Code: N/A
Model: https://huggingface.co/collections/google/t5gemma-2

TL;DR
WHAT was done? Google DeepMind researchers introduced T5Gemma 2, a family of encoder-decoder models (270M, 1B, 4B) constructed by adapting pre-trained decoder-only Gemma 3 checkpoints. The authors extended the text-only adaptation recipe to support multimodal inputs (via SigLIP) and long contexts (up to 128k tokens) while introducing architectural optimizations like tied word embeddings and merged attention to reduce parameter counts by ~10% without performance loss.
WHY it matters? This work challenges the prevailing dominance of decoder-only architectures (like LLaMA or GPT) by demonstrating that encoder-decoder models possess superior inductive biases for long-context modeling and multimodal retrieval (see also this post ). It provides a blueprint for efficiently converting high-performing causal LLMs into bidirectional models that excel at “reading” extensive context before generating, offering a strategic alternative for RAG and document-heavy workflows.

## Memory in the Age of AI Agents

Post: https://arxiviq.substack.com/p/memory-in-the-age-of-ai-agents
Authors: Yuyang Hu, Shichun Liu, Yanwei Yue, Guibin Zhang, Boyang Liu, Fangyi Zhu, Jiahang Lin, Honglin Guo, Shihan Dou, Zhiheng Xi, Senjie Jin, Jiejun Tan, Yanbin Yin, Jiongnan Liu, Zeyu Zhang, Zhongxiang Sun, Yutao Zhu, Hao Sun, Boci Peng, Zhenrong Cheng, Xuanbo Fan, Jiaxin Guo, Xinlei Yu, Zhenhong Zhou, Zewen Hu, Jiahao Huo, Junhao Wang, Yuwei Niu, Yu Wang, Zhenfei Yin, Xiaobin Hu, Yue Liao, Qiankun Li, Kun Wang, Wangchunshu Zhou, Yixin Liu, Dawei Cheng, Qi Zhang, Tao Gui, Shirui Pan, Yan Zhang, Philip Torr, Zhicheng Dou, Ji-Rong Wen, Xuanjing Huang, Yu-Gang Jiang, Shuicheng Yan
Paper: https://arxiv.org/abs/2512.13564
Code: https://github.com/Shichun-Liu/Agent-Memory-Paper-List
Model: N/A

TL;DR
WHAT was done? The authors present a comprehensive taxonomy for Agent Memory, moving beyond traditional “short-term/long-term” dichotomies to a structured framework defined by Forms (Token-level, Parametric, Latent), Functions (Factual, Experiential, Working), and Dynamics (Formation, Evolution, Retrieval). The paper systematically distinguishes agent memory from related concepts like RAG and Context Engineering, offering a blueprint for self-evolving systems.
WHY it matters? As LLM agents transition from static question-answering to long-horizon autonomous tasks, the stateless nature of the underlying models becomes a critical bottleneck. This work is significant because it formalizes memory not just as a storage buffer, but as an active, self-optimizing cognitive substrate necessary for continual learning and self-evolution without the prohibitive cost of constant retraining.

## Solving a Million-Step LLM Task with Zero Errors

Post: https://arxiviq.substack.com/p/solving-a-million-step-llm-task-with
Authors: Elliot Meyerson, Giuseppe Paolo, Roberto Dailey, Hormoz Shahrzad, Olivier Francon, Conor F. Hayes, Xin Qiu, Babak Hodjat, Risto Miikkulainen
Paper: https://arxiv.org/abs/2511.09030
Code: https://github.com/cognizant-ai-lab/neuro-san-benchmarking (Related)
Model: N/A

TL;DR
WHAT was done? The authors propose MAKER (Maximal Agentic decomposition, first-to-ahead-by-K Error correction, and Red-flagging), a framework that solves a task requiring over one million sequential LLM steps with zero errors. By decomposing the Towers of Hanoi problem into atomic subtasks ( m =1) and applying a specific voting mechanism, they demonstrate that relatively small, non-reasoning models can achieve reliability scales previously thought impossible for stochastic generators.
WHY it matters? This work challenges the prevailing dogma that solving long-horizon tasks requires exponentially smarter “reasoning” models. Instead, it provides a proof-of-existence for Massively Decomposed Agentic Processes (MDAPs), showing that architectural changes—specifically extreme modularity and statistical error correction—allow costs to scale log-linearly (Θ( s ln s )) rather than exponentially with task length.

## Multiple Token Divergence: A Measure of In-Context Computation Density

Post: https://arxiviq.substack.com/p/multiple-token-divergence-a-measure
Authors: Vincent Herrmann, Eric Alcaide, Jürgen Schmidhuber
Paper: NeurIPS 2025 Submission
Code: N/A
Model: N/A

TL;DR
WHAT was done? The authors propose Multiple Token Divergence (MTD), a metric that quantifies the “computational density” of a generated token by measuring the KL divergence between the output distribution of the full model and that of a shallow, limited auxiliary head.
WHY it matters? Standard Next-Token Prediction loss ( L NLL ​) is a flawed proxy for reasoning effort; a model can achieve low loss on trivial tasks (copying) and high loss on complex but undetermined tasks (creative writing). MTD successfully decorrelates “predictability” from “computational effort,” offering a non-invasive way to detect when a model is utilizing its full depth for reasoning versus relying on surface-level heuristics.

## JEPA as a Neural Tokenizer: Learning Robust Speech Representations with Density Adaptive Attention

Post: https://arxiviq.substack.com/p/jepa-as-a-neural-tokenizer-learning
Authors: Georgios Ioannides, Christos Constantinou, Aman Chadha, Aaron Elkins, Linsey Pang, Ravid Shwartz-Ziv, Yann LeCun
Paper: https://arxiv.org/abs/2512.07168
Code: https://github.com/gioannides/Density-Adaptive-JEPA
Model: N/A

TL;DR
WHAT was done? The authors propose a two-stage speech representation framework. Stage 1 utilizes a Joint-Embedding Predictive Architecture ( JEPA ) augmented with a Density Adaptive Attention Mechanism (DAAM) to learn semantic features via masked latent prediction, completely decoupled from waveform reconstruction. Stage 2 freezes this encoder and trains a HiFi-GAN decoder with Finite Scalar Quantization (FSQ), achieving an extremely low frame rate of 2.5 Hz (47.5 tokens/sec).
WHY it matters? This approach resolves the tension in neural audio codecs between preserving acoustic fidelity and learning high-level semantic structure. By replacing standard VQ-VAE codebooks with analytic FSQ and using probability-based attention gating, the model produces highly compressed, reversible tokens suitable for Large Language Model integration without sacrificing the ability to reconstruct high-fidelity audio.

## General Agentic Memory Via Deep Research

Post: https://arxiviq.substack.com/p/general-agentic-memory-via-deep-research
Authors: B.Y. Yan, Chaofan Li, Hongjin Qian, Shuqi Lu, Zheng Liu
Paper: https://arxiv.org/abs/2511.18423
Code: https://github.com/VectorSpaceLab/general-agentic-memory
Model: N/A

TL;DR
WHAT was done? The authors propose General Agentic Memory (GAM), a framework that shifts memory management from “Ahead-of-Time” (AOT) static compression to “Just-in-Time” (JIT) compilation. Instead of relying solely on pre-computed summaries or vector indices, GAM maintains a dual-agent system: a Memorizer that structures raw history into pages with contextual headers, and a Researcher that performs iterative, multi-step “deep research” (planning, searching, reflecting) at runtime to answer queries.
WHY it matters? This approach addresses the “information loss” inherent in traditional RAG and memory summarization. By deferring the decision of “what is important” until the query is actually received, GAM achieves state-of-the-art performance on heavy reasoning benchmarks like HotpotQA and RULER, demonstrating that compute-heavy retrieval outperforms static context window scaling for complex agentic tasks.

## ThreadWeaver: Adaptive Threading for Efficient Parallel Reasoning in Language Models

Post: https://arxiviq.substack.com/p/threadweaver-adaptive-threading-for
Authors: Long Lian, Sida Wang, Felix Juefei-Xu, Tsu-Jui Fu, Xiuyu Li, Adam Yala, Trevor Darrell, Alane Suhr, Yuandong Tian, Xi Victoria Lin
Paper: https://arxiv.org/abs/2512.07843
Code: N/A
Model: N/A

TL;DR
WHAT was done? The authors introduce ThreadWeaver, a framework that enables Large Language Models (LLMs) to dynamically break sequential Chain-of-Thought (CoT) reasoning into concurrent threads. By training the model to output specific control tokens ( <Parallel>, <Thread> ) and leveraging a trie-based attention mechanism during training, the system allows for “fork-join” execution patterns. They further refine this behavior using a modified reinforcement learning algorithm, P-GRPO, which optimizes for both answer correctness and reduced critical path length.
WHY it matters? Inference latency for complex reasoning tasks typically scales linearly with chain length ( O ( N )), creating a bottleneck for “System 2” scaling. ThreadWeaver demonstrates that it is possible to maintain state-of-the-art accuracy (matching sequential baselines like Qwen3-8B) while achieving significant wall-clock speedups (up to 1.53x). Crucially, it achieves this compatibly with standard inference engines (e.g., vLLM) without requiring custom CUDA kernels or specialized KV-cache management.

## Towards a Science of Scaling Agent Systems

Post: https://arxiviq.substack.com/p/towards-a-science-of-scaling-agent
Authors: Yubin Kim, Ken Gu, Chanwoo Park, Chunjong Park, Samuel Schmidgall, A. Ali Heydari, Yao Yan, Zhihan Zhang, Yuchen Zhuang, Mark Malhotra, Paul Pu Liang, Hae Won Park, Yuzhe Yang, Xuhai Xu, Yilun Du, Shwetak Patel, Tim Althoff, Daniel McDuff, and Xin Liu
Paper: https://arxiv.org/abs/2512.08296
Code: N/A
Model: N/A

TL;DR
WHAT was done? The authors conducted a controlled evaluation of 180 agent system configurations, varying model capability (across OpenAI, Google, and Anthropic families), coordination topology, and task properties. They derived a quantitative “scaling law” for multi-agent systems (MAS) that predicts performance based on interaction metrics, challenging the prevailing assumption that increasing agent count monotonically improves performance.
WHY it matters? This work establishes that MAS performance is not driven by simple scaling but by a trade-off between parallelization benefits and coordination overhead. The study identifies specific “regimes of failure”—specifically tool-heavy and sequential tasks—where adding agents degrades performance by up to 70%, offering a predictive framework ( R 2 =0.513) for determining when to deploy complex swarms versus single strong models.

## ORION: Teaching Language Models to Reason Efficiently in the Language of Thought

Post: https://arxiviq.substack.com/p/orion-teaching-language-models-to
Authors: Kumar Tanmay, Kriti Aggarwal, Paul Pu Liang, Subhabrata Mukherjee
Paper: https://arxiv.org/abs/2511.22891
Code: https://github.com/Hippocratic-AI-Research/Orion
Model: N/A

TL;DR
WHAT was done? The authors introduce ORION, a framework that compresses the reasoning traces of Large Reasoning Models (LRMs) by aligning them to a symbolic “Language of Thought” called Mentalese. They achieve this via a two-stage process: Supervised Fine-Tuning (SFT) on a new dataset of 40k compressed reasoning traces, followed by a novel reinforcement learning objective called Shorter Length Preference Optimization (SLPO), which dynamically rewards brevity without sacrificing accuracy.
WHY it matters? Current reasoning models (like DeepSeek-R1 or OpenAI o1) achieve performance by scaling test-time compute, often resulting in verbose, redundant, and expensive outputs. ORION demonstrates that a 1.5B parameter model can match or exceed the accuracy of much larger models (including GPT-4o and Claude 3.5 Sonnet on math benchmarks) while generating reasoning traces that are 10–20x shorter. This drastically reduces inference latency and training costs (by 7-9x), offering a viable path for deploying reasoning agents in resource-constrained or real-time environments.

## Walrus: A Cross-Domain Foundation Model for Continuum Dynamics

Post: https://arxiviq.substack.com/p/walrus-a-cross-domain-foundation
Authors: Michael McCabe, Payel Mukhopadhyay, Tanya Marwah, Bruno Regaldo-Saint Blancard, Francois Rozet, Cristiana Diaconu, Lucas Meyer, Kaze W. K. Wong, Hadi Sotoudeh, Alberto Bietti, Irina Espejo, Rio Fear, Siavash Golkar, Tom Hehir, Keiya Hirashima, Geraud Krawezik, Francois Lanusse, Rudy Morel, Ruben Ohana, Liam Parker, Mariel Pettee, Jeff Shen, Kyunghyun Cho, Miles Cranmer, Shirley Ho
Paper: https://arxiv.org/abs/2511.15684
Code: https://github.com/PolymathicAI/walrus
Model: https://huggingface.co/polymathic-ai/walrus

TL;DR
WHAT was done? The authors introduce Walrus, a 1.3B parameter transformer-based foundation model designed to simulate physical fields across varying dimensions and domains. The model is pretrained on 19 diverse physical scenarios—ranging from astrophysics to non-Newtonian fluids—by treating 2D data as slices within a 3D embedding space and utilizing novel stabilization techniques to allow for long-horizon forecasting.
WHY it matters? Existing surrogates for physical simulation (like FNO or GraphCast) are typically constrained to specific geometries or dimensionality, preventing the scaling benefits seen in NLP. Walrus demonstrates that by unifying 2D and 3D training regimes and solving autoregressive grid artifacts via “patch jittering,” a single model can generalize across disparate physical regimes, outperforming domain-specific baselines on both short-term accuracy and long-term stability.

## SIMA 2: A Generalist Embodied Agent for Virtual Worlds

Post: https://arxiviq.substack.com/p/sima-2-a-generalist-embodied-agent
Authors: SIMA Team, Google DeepMind
Paper: https://arxiv.org/abs/2512.04797
Code: N/A
Model: N/A

TL;DR
WHAT was done? The authors introduce SIMA 2, a generalist Vision-Language-Action (VLA) model built by finetuning Gemini Flash-Lite. Unlike its predecessor, which mapped instructions directly to keyboard actions, SIMA 2 integrates an internal chain-of-thought reasoning process, enabling it to handle ambiguous instructions, engage in dialogue, and perform complex multi-step tasks across diverse 3D environments.
WHY it matters? This work demonstrates a successful recipe for “foundation agents” that do not suffer from catastrophic forgetting; SIMA 2 retains the general math and reasoning capabilities of the base Gemini model while achieving human-level competence in video games. Furthermore, it introduces a scalable mechanism for open-ended self-improvement using LLMs as both task-setters and reward models, allowing the agent to learn in new environments without access to ground-truth code APIs.

## The Universal Weight Subspace Hypothesis

Post: https://arxiviq.substack.com/p/the-universal-weight-subspace-hypothesis
Authors: Prakhar Kaushik, Shravan Chaudhari, Ankit Vaidya, Rama Chellappa, Alan Yuille
Paper: https://arxiv.org/abs/2512.05117
Code: https://toshi2k2.github.io/unisub/
Model: N/A

TL;DR
WHAT was done? The authors analyzed over 1,100 deep neural networks—ranging from Vision Transformers to LLaMA-3 and Mistral LoRAs—to demonstrate that models trained on diverse, disjoint tasks converge to a shared, low-dimensional parameter subspace. By applying spectral decomposition to the aggregated weights of these models, they identified a “universal” set of basis vectors that captures the majority of variance, allowing new tasks to be learned by simply optimizing scalar coefficients rather than full weight matrices.
WHY it matters? This finding suggests that the vast majority of parameters in fine-tuned models are redundant. It provides a geometric explanation for the success of parameter-efficient fine-tuning (PEFT) and enables massive model compression (up to 100x memory reduction) and instant, arithmetic-based model merging without the need for complex retraining or heuristic pruning.

## On the Origin of Algorithmic Progress in AI

Post: https://arxiviq.substack.com/p/on-the-origin-of-algorithmic-progress
Authors: Hans Gundlach, Alex Fogelson, Jayson Lynch, Ana Trišović, Jonathan Rosenfeld, Anmol Sandhu, Neil Thompson
Paper: https://arxiv.org/abs/2511.21622
Code: https://github.com/hansgundlach/Experimental_Progress
Model: N/A

TL;DR
WHAT was done? The authors deconstruct the widely cited estimate that algorithmic efficiency increased by roughly 22,000× between 2012 and 2023. By conducting ablation studies on modern Transformers (reverting components like SwiGLU and Rotary Embeddings) and performing scaling experiments against LSTMs, they determine that the vast majority of “progress” is not the sum of many small improvements. Instead, 91% of extrapolated gains at the frontier (10 23 FLOPs) stem from two specific, scale-dependent shifts: the architectural transition from LSTMs to Transformers and the optimization shift from Kaplan to Chinchilla scaling laws.
WHY it matters? This challenges the prevailing narrative that AI progress is driven by a steady exponential stream of algorithmic refinements independent of hardware. The findings suggest that many algorithmic innovations yield negligible benefits at small scales and only compound at massive compute budgets. Consequently, algorithmic progress is not a universal constant; it is a function of compute scale, implying that future efficiency gains may be inextricably linked to our ability to continue scaling hardware resources.

## How Far Are We from Genuinely Useful Deep Research Agents?

Post: https://arxiviq.substack.com/p/how-far-are-we-from-genuinely-useful
Authors: Dingling Zhang, He Zhu, Jincheng Ren, Kangqi Song, Xinran Zhou, Boyu Feng, Shudong Liu, Jiabin Luo, Weihao Xie, Zhaohui Wang, Tianrui Qin, King Zhu, Yuqing Wang, Qianben Chen, Yuchen Eleanor Jiang, Wei Wang, Jiaheng Liu, Wangchunshu Zhou
Paper: https://arxiv.org/abs/2512.01948
Code: https://github.com/OPPO-PersonalAI/FINDER_DEFT
Model: N/A

TL;DR
WHAT was done? The authors introduce FINDER, a fine-grained benchmark for Deep Research Agents (DRAs) comprised of 100 expert-curated tasks with 419 specific evaluation checklists, and DEFT, a grounded-theory taxonomy that categorizes agent failures into 14 distinct modes.
WHY it matters? Current benchmarks often conflate “chatting ability” with “research rigor,” allowing models to pass by generating fluent but substanceless text. This work quantifies a critical phenomenon: Strategic Content Fabrication, where agents mimic the form of professional analysis (citations, academic tone) while fabricating the substance, revealing that the bottleneck for agents is no longer task comprehension, but evidence integration and reasoning resilience.

## From Code Foundation Models to Agents and Applications: A Comprehensive Survey and Practical Guide to Code Intelligence

Post: https://arxiviq.substack.com/p/from-code-foundation-models-to-agents
Authors: Jian Yang, Xianglong Liu, Weifeng Lv, Ken Deng, Shawn Guo, Lin Jing, Yizhi Li, Shark Liu, Xianzhen Luo, Yuyu Luo, Changzai Pan, Ensheng Shi, Yingshui Tan, Renshuai Tao, Jiajun Wu, Xianjie Wu, Zhenhe Wu, Daoguang Zan, Chenchen Zhang, Wei Zhang, He Zhu, Terry Yue Zhuo, Kerui Cao, Xianfu Cheng, Jun Dong, Shengjie Fang, Zhiwei Fei, Xiangyuan Guan, Qipeng Guo, Zhiguang Han, Joseph James, Tianqi Luo, Renyuan Li, Yuhang Li, Yiming Liang, Congnan Liu, Jiaheng Liu, Qian Liu, Ruitong Liu, Tyler Loakman, Xiangxin Meng, Chuang Peng, Tianhao Peng, Jiajun Shi, Mingjie Tang, Boyang Wang, Haowen Wang, Yunli Wang, Fanglin Xu, Zihan Xu, Fei Yuan, Ge Zhang, Jiayi Zhang, Xinhao Zhang, Wangchunshu Zhou, Hualei Zhu, King Zhu, Bryan Dai, Aishan Liu, Zhoujun Li, Chenghua Lin, Tianyu Liu, Chao Peng, Kai Shen, Libo Qin, Shuangyong Song, Zizheng Zhan, Jiajun Zhang, Jie Zhang, Zhaoxiang Zhang, Bo Zheng
Paper: https://arxiv.org/abs/2511.18538
Code: N/A
Model: N/A

TL;DR
WHAT was done? The authors present an exhaustive synthesis of the current state of Code Intelligence, transitioning from foundational Large Language Models (LLMs) to autonomous Software Engineering (SWE) agents. Beyond a typical literature review, the paper provides a “practical guide” by conducting original experiments to establish scaling laws specific to programming languages, benchmarking supervised fine-tuning (SFT) frameworks, and evaluating Reinforcement Learning (RL) strategies like RLVR (Reinforcement Learning with Verifiable Rewards).
WHY it matters? This work is significant because it bridges the gap between academic code generation benchmarks and the complex, repository-level reality of modern software engineering. It identifies that code models follow distinct scaling laws compared to natural language models and provides actionable “training recipes” for practitioners building the next generation of developer tools, moving the field from simple code completion to full-cycle autonomous maintenance and repair.

## Is Vibe Coding Safe? Benchmarking Vulnerability of Agent-Generated Code in Real-World Tasks

Post: https://arxiviq.substack.com/p/is-vibe-coding-safe-benchmarking
Authors: Songwen Zhao, Danqing Wang, Kexun Zhang, Jiaxuan Luo, Zhuo Li, Lei Li
Paper: https://arxiv.org/abs/2512.03262
Code: https://github.com/LeiLiLab/susvibes
Model: N/A

TL;DR
WHAT was done? The authors introduced SusVibes, a benchmark evaluating the security of code generated by autonomous agents (like SWE-Agent and OpenHands) in repository-level contexts. Instead of simple function completion, the benchmark constructs 200 complex feature-request tasks derived from historical vulnerability fixes in open-source Python projects.
WHY it matters? This work quantifies the risks of “vibe coding”—the growing practice of delegating implementation to agents with minimal human oversight. The results are alarming: while state-of-the-art agents (powered by Claude 4 Sonnet) achieve 61% functional correctness, over 80% of those functionally correct solutions contain critical security vulnerabilities. This highlights a severe misalignment between functional utility and software security in current agentic workflows.

## Embedded Universal Predictive Intelligence: a coherent framework for multi-agent learning

Post: https://arxiviq.substack.com/p/embedded-universal-predictive-intelligence
Authors: Alexander Meulemans, Rajai Nasser, Maciej Wołczyk, Marissa A. Weis, Seijin Kobayashi, Blake Richards, Guillaume Lajoie, Angelika Steger, Marcus Hutter, James Manyika, Rif A. Saurous, João Sacramento, and Blaise Agüera y Arcas
Paper: https://arxiv.org/abs/2511.22226
Code: N/A
Model: N/A

TL;DR
WHAT was done? The authors introduce Embedded Universal Predictive Intelligence (MUPI), a comprehensive mathematical framework that redefines agents not as external observers acting on an environment, but as embedded entities within a joint universe. By constructing a Bayesian mixture over “universes” (programs defining joint agent-environment dynamics) rather than just environments, they solve the infinite recursion problem inherent in mutual prediction. They introduce the Reflective Universal Inductor (RUI) —a theoretical oracle ensuring the agent’s hypothesis class contains the agent itself—and define new game-theoretic solution concepts, such as the Subjective Embedded Equilibrium, which rationalize cooperation in scenarios like the Prisoner’s Dilemma where classical Nash equilibria fail.
WHY it matters? This work theoretically grounds the behavior of modern Foundation Models, which naturally predict sequences of interleaved actions and observations. It solves the long-standing “grain of truth” problem in multi-agent reinforcement learning (MARL), where an agent cannot perfectly model an environment that contains a copy of itself without infinite recursion. By proving that universal priors (Occam’s razor) naturally lead to structural similarity awareness, the paper provides a normative justification for Evidential Decision Theory in AI, suggesting that agents which model themselves as part of the world will naturally cooperate with structurally similar peers without needing explicit communication.

## Every Token Counts: Generalizing 16M Ultra-Long Context in Large Language Models

Post: https://arxiviq.substack.com/p/every-token-counts-generalizing-16m
Authors: Xiang Hu, Zhanchao Zhou, Ruiqi Liang, Zehuan Li, Wei Wu, Jianguo Li
Paper: https://arxiv.org/abs/2511.23319
Code: https://github.com/ant-research/long-context-modeling
Model: N/A

TL;DR
WHAT was done? The authors introduce HSA-UltraLong, an 8B-parameter Mixture-of-Experts (MoE) model capable of processing context lengths up to 16 million tokens. They propose Hierarchical Sparse Attention (HSA), a mechanism that treats past context chunks as retrievable “experts,” and combine it with a curriculum learning strategy that carefully balances local sliding windows with global sparse retrieval.
WHY it matters? Standard Transformers suffer from quadratic complexity ( O ( N 2 )), and existing linear alternatives (like Mamba ) often compress state too aggressively, losing resolution on distant tokens. HSA-UltraLong demonstrates that by making the context retrieval process differentiable and end-to-end learnable, models can achieve “random access” memory over millions of tokens without the prohibitive cost of full attention or the accuracy degradation of heuristic sparse methods.

## On the Fundamental Limits of LLMs at Scale

Post: https://arxiviq.substack.com/p/on-the-fundamental-limits-of-llms
Authors: Muhammad Ahmed Mohsin, Muhammad Umer, Ahsan Bilal, Zeeshan Memon, Muhammad Ibtsaam Qadir, Sagnik Bhattacharya, Hassan Rizwan, Abhiram R. Gorle, Maahe Zehra Kazmi, Ayesha Mohsin, Muhammad Usman Rafique, Zihao He, Pulkit Mehta, Muhammad Ali Jamshed, John M. Cioffi
Paper: https://arxiv.org/abs/2511.12869
Code: N/A
Model: N/A

TL;DR
WHAT was done? The authors present a unified theoretical framework identifying five immutable boundaries to Large Language Model (LLM) scaling: hallucination, context compression, reasoning degradation, retrieval fragility, and multimodal misalignment. By synthesizing proofs from computability theory, information theory, and statistical learning, they demonstrate that these failure modes are not merely transient data artifacts but intrinsic properties of the transformer architecture and the next-token prediction objective.
WHY it matters? This work challenges the prevailing “scale is all you need” orthodoxy by mathematically proving that specific error classes—such as those arising from undecidable problems or long-tail distribution estimation—cannot be resolved simply by adding parameters or compute. It suggests that achieving reliability requires architectural paradigm shifts, such as neuro-symbolic integration or bounded-oracle retrieval, rather than just larger models.

## CLaRa: Bridging Retrieval and Generation with Continuous Latent Reasoning

Post: https://arxiviq.substack.com/p/clara-bridging-retrieval-and-generation
Authors: Jie He, Richard He Bai, Sinead Williamson, Jeff Z. Pan, Navdeep Jaitly, Yizhe Zhang
Paper: https://arxiv.org/abs/2511.18659
Code: https://github.com/apple/ml-clara
Model: N/A

TL;DR
WHAT was done? The authors (from Apple and University of Edinburgh) propose CLaRa, a unified Retrieval-Augmented Generation (RAG) framework that compresses documents into continuous “memory tokens” and optimizes retrieval and generation end-to-end. By utilizing a Straight-Through Estimator (STE), they allow gradients from the language modeling loss to flow back into the retrieval mechanism, aligning document selection with generation utility rather than just semantic similarity.
WHY it matters? Standard RAG systems suffer from a “broken gradient” problem: retrievers are optimized for similarity (e.g., cosine distance) while generators are optimized for next-token prediction, often leading to misalignment where retrieved documents are semantically similar but factually insufficient. CLaRa demonstrates that treating retrieval as a differentiable step in a shared latent space significantly improves performance on extensive QA benchmarks (NQ, HotpotQA) while compressing context length by up to 16x.

## ToolOrchestra: Elevating Intelligence via Efficient Model and Tool Orchestration

Post: https://arxiviq.substack.com/p/toolorchestra-elevating-intelligence
Authors: Hongjin Su, Shizhe Diao, Ximing Lu, Mingjie Liu, Jiacheng Xu, Xin Dong, Yonggan Fu, Peter Belcak, Hanrong Ye, Hongxu Yin, Yi Dong, Evelina Bakhturina, Tao Yu, Yejin Choi, Jan Kautz, Pavlo Molchanov
Paper: https://arxiv.org/abs/2511.21689
Code: https://github.com/NVlabs/ToolOrchestra/
Model: https://huggingface.co/nvidia/Orchestrator-8B

TL;DR
WHAT was done? The authors introduce ToolOrchestra, a framework for training lightweight language models (specifically an 8B parameter model) to act as routing controllers for a suite of diverse tools and stronger “expert” models (such as GPT-5). By utilizing Group Relative Policy Optimization (GRPO) on a massive synthetic dataset called ToolScale, the resulting Orchestrator learns to balance task accuracy with computational cost and user preferences.
WHY it matters? This research challenges the “monolithic” scaling hypothesis by demonstrating that an 8B model, when properly trained to coordinate external resources, can outperform frontier models like GPT-5 on complex benchmarks like Humanity’s Last Exam (HLE) while reducing inference costs by roughly 70%. It validates the strategic shift from single giant models to compound AI systems where intelligence emerges from orchestration rather than parameter count.

## [NeurIPS 2025] Superposition Yields Robust Neural Scaling

Post: https://arxiviq.substack.com/p/neurips-2025-superposition-yields
Authors: Yizhou Liu, Ziming Liu, and Jeff Gore
Paper: https://arxiv.org/abs/2505.10465, NeurIPS submission
Code: https://github.com/liuyz0/SuperpositionScaling
Model: N/A

TL;DR
WHAT was done? The authors propose a mechanistic explanation for neural scaling laws by linking them to representation superposition. By adapting a sparse autoencoder framework and validating on open-source LLMs (OPT, Pythia, Qwen), they demonstrate that when models operate in a “strong superposition” regime—representing significantly more features than they have dimensions—the loss scales inversely with model width ( L ∝1/ m ). This scaling is driven by the geometric interference between feature vectors rather than the statistical properties of the data tail.
WHY it matters? This work, a NeurIPS 2025 Best Paper Runner-Up, provides a first-principles derivation of scaling laws that is robust to data distribution. Unlike previous theories relying on manifold approximation, this research suggests that the “power law” behavior of LLMs is a geometric inevitability of compressing sparse concepts into dense spaces. It implies that overcoming these scaling barriers requires architectural interventions to manage feature interference, as simply adding more data cannot bypass the geometric bottleneck.

## [NeurIPS 2025] Optimal Mistake Bounds for Transductive Online Learning

Post: https://arxiviq.substack.com/p/neurips-2025-optimal-mistake-bounds
Authors: Zachary Chase, Steve Hanneke, Shay Moran, Jonathan Shafer
Paper: https://openreview.net/forum?id=EoebmBe9fG
Code: N/A
Model: N/A

TL;DR
WHAT was done? The authors resolved a 30-year-old open problem in learning theory by establishing tight mistake bounds for Transductive Online Learning. Recognized as a Best Paper Runner-Up at NeurIPS 2025, they proved that for a hypothesis class with Littlestone dimension d, the optimal mistake bound is Θ(sqrt( d ​)).
WHY it matters? This result quantifies exactly how much “looking ahead” helps. It proves that having access to the unlabeled sequence of future test points allows for a quadratic reduction in mistakes compared to the standard online setting (where the bound is d ). This closes a massive exponential gap between the previous best known lower bound of Ω(log d ) and upper bound of O ( d ).

## [NeurIPS 2025] Does Reinforcement Learning Really Incentivize Reasoning Capacity in LLMs Beyond the Base Model?

Post: https://arxiviq.substack.com/p/neurips-2025-does-reinforcement-learning
Authors: Yang Yue, Zhiqi Chen, Rui Lu, Andrew Zhao, Zhaokai Wang, Yang Yue, Shiji Song, Gao Huang
Paper: https://arxiv.org/abs/2504.13837, NeurIPS submission
Code: https://limit-of-rlvr.github.io
Model: N/A

TL;DR
WHAT was done? In this NeurIPS 2025 Best Paper Runner-Up, the authors systematically probed the reasoning boundaries of Large Language Models (LLMs) trained via Reinforcement Learning with Verifiable Rewards (RLVR). Using the unbiased pass@k metric across mathematics, coding, and visual reasoning tasks, they compared base models against their RL-tuned counterparts to determine if RLVR generates novel reasoning patterns or merely amplifies existing ones.
WHY it matters? The findings challenge the prevailing narrative that RLVR allows models to autonomously discover “superhuman” strategies similar to AlphaGo. The study reveals that while RLVR significantly improves sampling efficiency (correct answers appear more often), it does not expand the model’s fundamental reasoning capability boundary. In fact, for large k, base models often solve more unique problems than their RL-trained versions, suggesting that current RL methods are bounded by the priors of the pre-trained model.

## [NeurIPS 2025] Why Diffusion Models Don’t Memorize: The Role of Implicit Dynamical Regularization in Training

Post: https://arxiviq.substack.com/p/neurips-2025-why-diffusion-models
Authors: Tony Bonnaire, Raphaël Urfin, Giulio Biroli, Marc Mézard
Paper: https://arxiv.org/abs/2505.17638, NeurIPS submission
Code: https://github.com/tbonnair/Why-Diffusion-Models-Don-t-Memorize
Model: N/A

TL;DR
WHAT was done? The authors provide a theoretical and empirical analysis characterizing the training dynamics of score-based diffusion models. Recognizing that models can eventually overfit, they identify two distinct timescales: τ gen ​, when the model learns to generate valid samples, and τ mem ​, when it begins to memorize specific training instances. This work was awarded a Best Paper Award at NeurIPS 2025.
WHY it matters? This work resolves the paradox of why overparameterized diffusion models generalize despite having the capacity to perfectly memorize training data. By proving that τ mem ​ scales linearly with the dataset size n while τ gen ​ remains constant, the paper establishes that “early stopping” is not just a heuristic, but a structural necessity driven by Implicit Dynamical Regularization. This explains why larger datasets widen the safety window for training, allowing massive models to generalize robustly.

## [NeurIPS 2025] 1000 Layer Networks for Self-Supervised RL: Scaling Depth Can Enable New Goal-Reaching Capabilities

Post: https://arxiviq.substack.com/p/neurips-2025-1000-layer-networks
Authors: Kevin Wang, Ishaan Javali, Michał Bortkiewicz, Tomasz Trzciński, Benjamin Eysenbach
Paper: https://openreview.net/forum?id=s0JVsx3bx1
Code: N/A
Model: N/A

TL;DR
WHAT was done? The authors successfully scaled Reinforcement Learning (RL) policies from the standard 2-5 layers to over 1,000 layers by utilizing Self-Supervised Learning (specifically Contrastive RL) combined with modern architectural choices like Residual connections, LayerNorm, and Swish activations.
WHY it matters? This challenges the prevailing dogma that RL does not benefit from depth. While standard algorithms like SAC saturate or collapse with deeper networks, this work shows that Contrastive RL allows for continued performance scaling (20x–50x gains), enabling agents to solve long-horizon humanoid mazes and develop emergent locomotor skills without explicit reward engineering.
ArXivIQ is a reader-supported publication. To receive new posts and support my work, consider becoming a free or paid subscriber.

## [NeurIPS 2025] Gated Attention for Large Language Models: Non-linearity, Sparsity, and Attention-Sink-Free

Post: https://arxiviq.substack.com/p/neurips-2025-gated-attention-for
Authors: Zihan Qiu, Zekun Wang, Bo Zheng, Zeyu Huang, Kaiyue Wen, Songlin Yang, Rui Men, Le Yu, Fei Huang, Suozhi Huang, Dayiheng Liu, Jingren Zhou, Junyang Lin (Qwen Team)
Paper: https://arxiv.org/abs/2505.06708, NeurIPS submission
Code: https://github.com/qiuzh20/gated_attention
Model: https://huggingface.co/collections/Qwen/qwen3-next

TL;DR
WHAT was done? The authors introduce Gated Attention, a mechanism that applies a learnable, input-dependent sigmoid gate immediately after the Scaled Dot-Product Attention (SDPA) output. By modulating the attention output Y with a gate σ ( XW θ ​), the method introduces element-wise sparsity and non-linearity before the final output projection.
WHY it matters? This simple architectural modification yields profound stability improvements for large-scale training (eliminating loss spikes) and consistently improves perplexity on 15B MoE and 1.7B dense models. Crucially, it mechanistically eliminates the “Attention Sink” phenomenon and “Massive Activations” without requiring heuristic fixes like “sink tokens,” thereby significantly improving long-context extrapolation.

## [NeurIPS 2025] Artificial Hivemind: The Open-Ended Homogeneity of Language Models (and Beyond)

Post: https://arxiviq.substack.com/p/neurips-2025-artificial-hivemind
Authors: Liwei Jiang, Yuanjun Chai, Margaret Li, Mickel Liu, Raymond Fok, Nouha Dziri, Yulia Tsvetkov, Maarten Sap, Yejin Choi
Paper: https://arxiv.org/abs/2510.22954, NeurIPS submission
Code: https://github.com/liweijiang/artificial-hivemind
Model: N/A

TL;DR
WHAT was done? The authors introduce INFINITY-CHAT, a dataset of 26K real-world open-ended queries, to systematically evaluate output diversity across 70+ state-of-the-art LLMs. They identify a pervasive “Artificial Hivemind” phenomenon where models exhibit extreme mode collapse—both repeatedly generating the same outputs internally (intra-model) and converging on strikingly similar responses across different model families (inter-model).
WHY it matters? This invalidates the common assumption that increasing temperature or using model ensembles guarantees diversity. The study reveals that modern RLHF and instruction tuning have homogenized the “creative” latent space of models to such a degree that distinct models (e.g., DeepSeek and GPT-4) act as near-identical clones on open-ended tasks. Furthermore, it demonstrates that current Reward Models are poorly calibrated to diverse human preferences (pluralism), failing to score valid but idiosyncratic responses correctly.

## Step by Step Network

Post: https://arxiviq.substack.com/p/step-by-step-network
Authors: Dongchen Han, Tianzhu Ye, Zhuofan Xia, Kaiyi Chen, Yulin Wang, Hanting Chen, Gao Huang
Paper: https://arxiv.org/abs/2511.14329
Code: N/A
Model: N/A

TL;DR
WHAT was done? The authors propose StepsNet, a generalized macro-architecture that replaces standard residual blocks with a cascaded, “step-by-step” processing stream. Instead of processing all input channels simultaneously, StepsNet splits the input, processes a subspace first, and progressively introduces the remaining channels into deeper layers.
WHY it matters? This architecture solves the “shortcut degradation” problem where signal-to-noise ratios collapse in extremely deep networks (hundreds of layers). By preserving clean signal paths for deeper layers and breaking the traditional width-depth trade-off, StepsNet allows models to scale to nearly 500 layers while maintaining training stability and improving performance on ImageNet and COCO with no additional parameter cost.

## Nemotron Elastic: Towards Efficient Many-in-One Reasoning LLMs

Post: https://arxiviq.substack.com/p/nemotron-elastic-towards-efficient
Authors: Ali Taghibakhshi, Sharath Turuvekere Sreenivas, Saurav Muralidharan, Ruisi Cai, Marcin Chochowski, Ameya Sunil Mahabaleshwarkar, Yoshi Suhara, Oluwatobi Olabiyi, Daniel Korzekwa, Mostofa Patwary, Mohammad Shoeybi, Jan Kautz, Bryan Catanzaro, Ashwath Aithal, Nima Tajbakhsh, Pavlo Molchanov
Paper: https://arxiv.org/abs/2511.16664
Code: N/A
Model: https://huggingface.co/nvidia/Nemotron-Elastic-12B

TL;DR
WHAT was done? The authors introduce Nemotron Elastic, a framework for training a single “parent” Large Language Model (12B) that contains valid, high-performance “child” sub-networks (9B and 6B) within its weight parameters (Matryoshka). By combining State Space Models (Mamba) with Attention in a hybrid architecture, they utilize a curriculum-based training pipeline and a differentiable router to simultaneously optimize multiple model sizes for reasoning tasks.
WHY it matters? Training model families (e.g., 8B, 70B, 405B) usually requires independent, prohibitively expensive runs for each size. Nemotron Elastic reduces the training token cost by over 360× compared to training from scratch and 7× compared to state-of-the-art compression methods like Minitron-SSM. Furthermore, it solves the specific challenge of preserving long-context reasoning capabilities in compressed models, enabling “many-in-one” deployment where a single memory footprint serves dynamic latency constraints.
Visual TL;DR

## What Does It Take to Be a Good AI Research Agent? Studying the Role of Ideation Diversity

Post: https://arxiviq.substack.com/p/what-does-it-take-to-be-a-good-ai
Authors: Alexis Audran-Reiss, Jordi Armengol Estapé, Karen Hambardzumyan, Amar Budhiraja, Martin Josifoski, Edan Toledo, Rishi Hazra, Despoina Magka, Michael Shvartsman, Parth Pathak, Justine T Kao, Lucia Cipolina-Kun, Bhavul Gauri, Jean-Christophe Gagnon-Audet, Emanuel Tewolde, Jenny Zhang, Taco Cohen, Yossi Adi, Tatiana Shavrina, Yoram Bachrach
Paper: https://arxiv.org/abs/2511.15593
Code: N/A
Model: N/A

TL;DR
WHAT was done? The authors conducted a large-scale analysis of 11,000 trajectories on MLE-bench to quantify the relationship between “ideation diversity” (the entropy of proposed ML architectures) and agent success. They subsequently validated this via a controlled ablation study, demonstrating that forcing agents to propose narrower sets of ideas causes statistically significant performance drops.
WHY it matters? This work identifies a critical mechanism in the design of autonomous research agents: diversity acts as a hedge against implementation failure. The findings suggest that current SOTA agents (like o3 or DeepSeek-R1) succeed not merely through superior coding, but by exploring a wider distribution of solution types, thereby increasing the probability of finding a solution that is both effective and—crucially—implementable within the agent’s constraints.
Still TL;DR

## Back to Basics: Let Denoising Generative Models Denoise

Post: https://arxiviq.substack.com/p/back-to-basics-let-denoising-generative
Authors: Tianhong Li, Kaiming He
Paper: https://arxiv.org/abs/2511.13720
Code: N/A
Model: N/A

TL;DR
WHAT was done? The authors introduce “Just Image Transformers” (JiT), a simplified generative framework that discards tokenizers, latent spaces, and U-Nets in favor of standard Vision Transformers operating directly on raw image patches. By mathematically demonstrating that predicting clean data ( x ) is structurally distinct from predicting noise ( ϵ ) in high-dimensional spaces, they successfully train competitive diffusion models on ImageNet (256 2, 512 2, 1024 2 ) without the complex pre-processing pipelines that currently dominate the field.
WHY it matters? This work challenges the hegemony of Latent Diffusion Models (LDMs) by identifying that the instability of pixel-space diffusion stems from the prediction target ( ϵ ), not the data modality itself. By proving that x -prediction leverages the manifold hypothesis to bypass the curse of dimensionality, this paper offers a path to apply generative modeling in domains like biology or physics, where pre-trained perceptual compressors (VAEs) are unavailable or suboptimal.

## Cognitive Foundations for Reasoning and Their Manifestation in LLMs

Post: https://arxiviq.substack.com/p/cognitive-foundations-for-reasoning
Authors: Priyanka Kargupta, Shuyue Stella Li, Haocheng Wang, Jinu Lee, Shan Chen, Orevaoghene Ahia, Dean Light, Thomas L. Griffiths, Max Kleiman-Weiner, Jiawei Han, Asli Celikyilmaz, Yulia Tsvetkov
Paper: https://arxiv.org/abs/2511.16660
Code: https://github.com/stellalisy/CognitiveFoundations
Model: N/A

TL;DR
WHAT was done? The authors synthesize a massive taxonomy of 28 cognitive elements—spanning computational invariants to meta-cognitive controls—and conduct a fine-grained analysis of 170K reasoning traces across 17 models (including DeepSeek-R1 and Qwen3) and humans. They identify that while models default to shallow “forward chaining,” successful reasoning on complex tasks requires hierarchical and meta-cognitive structures.
WHY it matters? This work provides empirical evidence that current LLMs are not “reasoning” in the human sense but are instead approximating output via rigid sequential patterns. Crucially, the authors demonstrate that explicitly scaffolding these missing cognitive structures at test time can improve performance on ill-structured problems by up to 60%, suggesting models possess latent capabilities that current training paradigms fail to elicit.

## Evolution Strategies at the Hyperscale

Post: https://arxiviq.substack.com/p/evolution-strategies-at-the-hyperscale
Authors: Bidipta Sarkar, Mattie Fellows, Juan Agustin Duque, Alistair Letcher, Antonio León Villares, Anya Sims, Dylan Cope, Jarek Liesen, Lukas Seier, Theo Wolf, Uljad Berdica, Alexander David Goldie, Aaron Courville, Karin Sevegnani, Shimon Whiteson, Jakob Nicolaus Foerster
Paper: https://arxiv.org/abs/2511.16652
Code: https://eshyperscale.github.io/
Model: N/A

TL;DR
WHAT was done? The authors introduce EGGROLL (Evolution Guided General Optimization via Low-rank Learning), a method to scale Evolution Strategies (ES) to billion-parameter neural networks. By replacing full-rank Gaussian perturbation matrices with low-rank factorizations, they reduce the auxiliary memory footprint from O ( mn ) to O ( r ( m + n )) and achieve near-linear scaling on clusters, enabling the training of non-differentiable systems like integer-only language models.
WHY it matters? Standard backpropagation is memory-intensive and requires differentiable architectures. While ES offers an alternative for non-differentiable objectives or discrete hardware constraints, it historically failed to scale due to the cost of storing and computing dense noise matrices for large parameter sets. EGGROLL breaks this bottleneck, proving that low-rank perturbations can approximate true natural gradients, theoretically converging at a fast O (1/ r ) rate.

## ARC Is a Vision Problem!

Post: https://arxiviq.substack.com/p/arc-is-a-vision-problem
Authors: Keya Hu, Ali Cy, Linlu Qiu, Xiaoman Delores Ding, Runqian Wang, Yeyin Eva Zhu, Jacob Andreas, Kaiming He
Paper: https://arxiv.org/abs/2511.14761
Code: https://github.com/lillian039/VARC
Model: N/A

TL;DR
WHAT was done? The authors propose VARC (Vision ARC), a framework that reframes the Abstraction and Reasoning Corpus (ARC) not as a language or program synthesis task, but as a direct image-to-image translation problem. By mapping ARC grids onto a high-resolution “canvas” and utilizing standard vision architectures (ViT and U-Net) combined with aggressive Test-Time Training (TTT), they achieve state-of-the-art results among models trained from scratch.
WHY it matters? This approach challenges the prevailing dominance of Large Language Models (LLMs) in abstract reasoning. With only 18 million parameters, VARC achieves 54.5% accuracy (60.4% with ensembling) on ARC-1, rivaling average human performance and outperforming massive LLMs like GPT-5 that lack visual grounding. It demonstrates that correct inductive biases—specifically 2D locality and scale invariance—can be far more efficient than scale.
ArXivIQ is a reader-supported publication. To receive new posts and support my work, consider becoming a free or paid subscriber.

## Mamba-3: Improved Sequence Modeling using State Space Principles

Post: https://arxiviq.substack.com/p/mamba-3-improved-sequence-modeling
Authors: Anonymous authors because of ICLR 2026 Conference Submission
Paper: https://openreview.net/forum?id=HwCvaJOiCj
Code: N/A
Model: N/A

TL;DR
WHAT was done? The authors introduce Mamba-3, an architectural evolution of the Mamba state-space model family. The method integrates three key technical improvements: a trapezoidal discretization scheme (replacing Euler’s method), a Multi-Input Multi-Output (MIMO) formulation to increase arithmetic intensity, and a theoretical bridge connecting complex-valued SSMs to Data-Dependent Rotary Embeddings (RoPE).
WHY it matters? This work addresses the two primary weaknesses of efficient linear-time models: their inability to solve state-tracking tasks (like parity or arithmetic) and their poor hardware utilization (memory-bound) during decoding. By recovering the expressivity of complex-valued dynamics without the computational overhead, Mamba-3 sets a new Pareto frontier for inference efficiency, outperforming Mamba-2 and strong Transformer baselines on standard language modeling benchmarks.
See also reviews of S4, Mamba and Mamba 2.
ArXivIQ is a reader-supported publication. To receive new posts and support my work, consider becoming a free or paid subscriber.

## Vector Symbolic Algebras for the Abstraction and Reasoning Corpus

Post: https://arxiviq.substack.com/p/vector-symbolic-algebras-for-the
Authors: Isaac Joffe, Chris Eliasmith
Paper: https://arxiv.org/abs/2511.08747
Code: https://github.com/ijoffe/ARC-VSA-2025
Model: N/A

TL;DR
WHAT was done? The authors propose a cognitively plausible solver for the ARC-AGI benchmark that integrates “System 1” intuition with “System 2” reasoning using Vector Symbolic Algebras (VSAs). By encoding grid objects into high-dimensional distributed vectors (Holographic Reduced Representations and Spatial Semantic Pointers), the system performs object-centric program synthesis via algebraic operations. This approach achieves a task accuracy of 3.0% on the ARC-AGI-1 Eval split and 83.1% on the 1D-ARC benchmark, outperforming GPT-4 on the latter.
WHY it matters? This work establishes an architectural baseline for neurosymbolic reasoning that prioritizes sample efficiency over scale. It demonstrates that encoding strong inductive biases—specifically object permanence, symmetry, and arithmetic—directly into the mathematical structure of the latent space allows for learning from as few as 2-3 examples without massive pre-training. This offers a potential solution to the “math-blindness” of transformers, suggesting that future agents may require VSA-based co-processors to handle precise spatial logic.

## HybridCoT: Interleaving Latent and Text Chain-of-Thought for Efficient Reasoning

Post: https://arxiviq.substack.com/p/hybridcot-interleaving-latent-and
Authors: Shannon Zejiang Shen, Rulin Shao, Chenyu Wang, Songlin Yang, Vincent-Pierre Berges, Gargi Ghosh, Pang Wei Koh, Luke Zettlemoyer, Yoon Kim, Jason E Weston, David Sontag, Wen-tau Yih
Paper: [ Under Review at ICLR 2026, Accepted to NeurIPS 2025 Workshop ER ]
Code: To be released
Model: N/A

TL;DR
WHAT was done? The authors propose HybridCoT, a framework that interleaves standard text tokens with continuous “latent” tokens within the same Chain-of-Thought (CoT) trace. By selectively retaining critical symbolic text (specifically math operators) while compressing semantic reasoning into dense vectors, the method achieves significant context reduction. Furthermore, they introduce Iterative Parallelized Latent Rollout (IPLR), a training algorithm that decouples training complexity from sequence length.
WHY it matters? As reasoning chains grow to thousands of steps (”System 2” scaling), inference costs become prohibitive. Pure latent approaches often fail at precise symbolic manipulation, while KV-cache compression (like sliding windows) loses context. HybridCoT offers a pragmatic solution: it retains 94% of the performance of full text CoT on complex math benchmarks (AIME, MATH) while reducing inference compute by ~50% (1.97x speedup). It significantly outperforms efficient baselines like LightThinker and StreamLLM.

## Next-Latent Prediction Transformers Learn Compact World Models

Post: https://arxiviq.substack.com/p/next-latent-prediction-transformers
Authors: Jayden Teoh, Manan Tomar, Kwangjun Ahn, Edward S. Hu, Pratyusha Sharma, Riashat Islam, Alex Lamb, John Langford
Paper: https://arxiv.org/abs/2511.05963
Code: N/A
Model: N/A

TL;DR
WHAT was done? The paper introduces Next-Latent Prediction (NextLat), a simple yet powerful training framework that augments the standard next-token prediction objective in transformers. It adds a self-supervised auxiliary loss that trains a lightweight latent dynamics model (pᵩ) to predict the transformer’s next hidden state (hₜ₊₁) given the current hidden state (hₜ) and the next token (Xₜ₊₁). This is achieved without any changes to the transformer’s architecture, parallel training, or inference procedure.
WHY it matters? Standard transformers lack an inherent incentive to compress history into compact, structured representations, often leading to poor generalization. NextLat provides a theoretical guarantee (Theorem 3.2) that its objective forces the transformer’s hidden states to converge to belief states —minimal sufficient statistics of the past needed to predict the future. This injects a recurrent inductive bias, encouraging the model to learn a compact internal “world model” with consistent transition dynamics. Empirically, this results in dramatic improvements: transformers trained with NextLat achieve representations that are over 3x more compressed (Table 1), learn world models more consistent with reality (Figure 1), and demonstrate superior performance in reasoning, lookahead planning, and long-horizon prediction across multiple benchmarks.

## Scaling Synthetic Data Creation with 1,000,000,000 Personas

Post: https://arxiviq.substack.com/p/scaling-synthetic-data-creation-with
Authors: Tao Ge, Xin Chan, Xiaoyang Wang, Dian Yu, Haitao Mi, Dong Yu
Paper: https://arxiv.org/abs/2406.20094
Code: https://github.com/tencent-ailab/persona-hub
Model: N/A

TL;DR
What was done? The paper introduces a novel persona-driven methodology for generating diverse synthetic data at an unprecedented scale. To enable this, the authors created Persona Hub, a collection of 1 billion unique personas automatically curated from web data. By integrating these personas into prompts, a Large Language Model (LLM) can be steered to generate high-quality, context-rich data from nearly any perspective. The efficacy of this method was demonstrated by fine-tuning a 7B parameter model (Qwen2-7B) on 1.07 million synthesized math problems. To facilitate further research, the authors have released 200,000 personas and over 100,000 synthetic data samples.
Why it matters? This work presents a powerful solution to the diversity bottleneck in synthetic data generation, a critical challenge for scaling AI capabilities. The most striking result is that the fine-tuned 7B model achieved 64.9% accuracy on the challenging out-of-distribution MATH benchmark, matching the performance of the much larger gpt-4-turbo-preview. This demonstrates that the persona-driven approach is a highly effective method for knowledge extraction and replication, capable of transferring the advanced reasoning capabilities of a large, proprietary model to a smaller, open-source one. It signals a potential paradigm shift where the competitive advantage in AI may move from proprietary data to superior data synthesis and knowledge extraction techniques.

## Code-enabled language models can outperform reasoning models on diverse tasks

Post: https://arxiviq.substack.com/p/code-enabled-language-models-can
Authors: Cedegao E. Zhang, Cédric Colas, Gabriel Poesia, Joshua B. Tenenbaum, Jacob Andreas
Paper: https://arxiv.org/abs/2510.20909
Code: N/A
Model: N/A

TL;DR
WHAT was done? The authors introduce CodeAdapt, a simple and highly efficient recipe that enables standard instruction-tuned Language Models (LMs) to match or outperform their expensive, Reinforcement Learning (RL)-trained counterparts, known as Reasoning Models (RMs). CodeAdapt combines two key components: 1) The CodeAct framework, which allows an LM to interleave natural language planning with multi-step, iterative Python code execution, and 2) Generalization-guided Few-shot Learning (GFL), a novel, lightweight in-context learning method that bootstraps powerful reasoning strategies from as few as five training examples per task. This approach avoids any gradient-based fine-tuning.
WHY it matters? This work challenges the dominant paradigm that achieving state-of-the-art reasoning requires massive and costly RL post-training. By demonstrating that a cheaper, architecturally-driven approach can elicit superior performance, it democratizes access to advanced AI reasoning. CodeAdapt not only achieves an average performance of 66.5% across eight diverse tasks, surpassing RMs’ 61.9%, but does so with vastly greater efficiency, using 10-81% fewer tokens at inference. The findings suggest that strong reasoning capabilities are already latent in standard instruct LMs and can be unlocked through hybrid neural-symbolic architectures, shifting the focus from brute-force scaling to more efficient, cognitively-grounded system design.

## Scaling Latent Reasoning via Looped Language Models

Post: https://arxiviq.substack.com/p/scaling-latent-reasoning-via-looped
Authors: Rui-Jie Zhu, Zixuan Wang, Kai Hua, Tianyu Zhang, Ziniu Li, Haoran Que, Boyi Wei, Zixin Wen, Fan Yin, He Xing, Lu Li, Jiajun Shi, Kaijing Ma, Shanda Li, Taylor Kergan, Andrew Smith, Xingwei Qu, Mude Hui, Bohong Wu, Qiyang Min, Hongzhi Huang, Xun Zhou, Wei Ye, Jiaheng Liu, Jian Yang, Yunfeng Shi, Chenghua Lin, Enduo Zhao, Tianle Cai, Ge Zhang, Wenhao Huang, Yoshua Bengio, Jason Eshraghian
Paper: https://arxiv.org/abs/2510.25741
Code: N/A
Model: N/A

TL;DR
WHAT was done? The paper introduces Ouro, a family of Looped Language Models (LoopLMs) trained on 7.7T tokens. Instead of scaling parameter counts, Ouro uses a recurrent architecture where a shared block of layers is applied iteratively within the latent space. This approach integrates reasoning directly into the pre-training phase, governed by an adaptive early-exit mechanism. This mechanism is trained via a two-stage process: an initial entropy-regularized objective to ensure broad exploration of computational depths, followed by a focused training stage that tunes the exit gate based on realized performance gains.
WHY it matters? This work establishes iterative latent computation as a critical third scaling axis beyond just parameters and data. It demonstrates exceptional 2-3x parameter efficiency, with 1.4B and 2.6B Ouro models matching or outperforming standard 4B to 8B transformers on complex reasoning tasks. Crucially, through controlled experiments, the authors show this advantage stems not from increased knowledge storage capacity (which remains constant) but from a fundamentally superior capability for knowledge manipulation and composition. The resulting latent reasoning traces are also more causally faithful than traditional Chain-of-Thought, and model safety uniquely improves with deeper computation, offering a path to more efficient, trustworthy, and powerful LLMs.

## AlphaResearch: Accelerating New Algorithm Discovery with Language Models

Post: https://arxiviq.substack.com/p/alpharesearch-accelerating-new-algorithm
Authors: Zhaojian Yu, Kaiyue Feng, Yilun Zhao, Shilin He, Xiao-Ping Zhang, Arman Cohan
Paper: https://arxiv.org/abs/2511.08522
Code: https://github.com/answers111/alpha-research
Model: https://huggingface.co/alpha-research/AlphaResearch-RM-Qwen-7B

TL;DR
WHAT was done? The paper introduces AlphaResearch, an autonomous agent that discovers new algorithms for open-ended problems. Its core innovation is a “dual research environment” that enhances the execution-based verification used in systems like AlphaEvolve. This environment adds a simulated peer-review mechanism, powered by a reward model (AlphaResearch-RM-7B) trained on over 24,000 ICLR peer-review records. This model evaluates the novelty and quality of a proposed idea before it is implemented, filtering out unpromising paths early. The authors also introduce AlphaResearchComp, a new open-source benchmark of 8 challenging algorithmic problems to ensure transparent and reproducible evaluation.
WHY it matters? This dual approach directly addresses the “ideation-execution gap,” a key challenge where AI-generated ideas are either innovative but infeasible, or feasible but scientifically uninteresting. By synergizing idea quality with execution performance, AlphaResearch accelerates meaningful discovery. This was validated when the agent discovered a new, best-of-known algorithm for the “Packing Circles” problem, surpassing solutions from both human experts and strong baselines like AlphaEvolve. The work represents a significant step forward, shifting the paradigm from just finding code that runs to discovering algorithms that are scientifically valuable.

## LeJEPA: Provable and Scalable Self-Supervised Learning Without the Heuristics

Post: https://arxiviq.substack.com/p/lejepa-provable-and-scalable-self
Authors: Randall Balestriero, Yann LeCun
Paper: https://arxiv.org/abs/2511.08544
Code: https://github.com/rbalestr-lab/lejepa
Model: N/A

TL;DR
WHAT was done? The paper introduces LeJEPA, a new self-supervised learning (SSL) framework that replaces the brittle heuristics of current Joint-Embedding Predictive Architectures (JEPAs) with a rigorous theoretical foundation. The authors first prove that the isotropic Gaussian is the unique optimal distribution for a model’s embeddings to minimize worst-case prediction risk on downstream tasks. To enforce this, they introduce a novel and highly scalable objective, Sketched Isotropic Gaussian Regularization (SIGReg), which uses random 1D projections and characteristic function matching to constrain the high-dimensional embedding space with linear time and memory complexity. The final LeJEPA objective combines a standard JEPA prediction loss with SIGReg, resulting in a lean, collapse-free training pipeline that eliminates the need for stop-gradients, teacher-student networks, and other ad-hoc fixes.
WHY it matters? LeJEPA marks a significant step in the maturation of SSL, moving the field from ad-hoc R&D to principled, provably optimal design. Its key innovations provide three major benefits:
Reliability and Simplicity: It offers exceptional training stability across diverse architectures and scales with a single trade-off hyperparameter, making foundation model pretraining more robust and accessible.
Actionable Training Signal: For the first time in JEPAs, the training loss strongly correlates (up to 99%) with downstream performance, providing a reliable, label-free signal for model selection.
New Pretraining Paradigm: It demonstrates that principled, in-domain SSL on small, specialized datasets can substantially outperform transfer learning from massive, generically-trained frontier models like DINOv2/v3, re-establishing domain-specific SSL as a viable and powerful strategy.

## Continuous Autoregressive Language Models

Post: https://arxiviq.substack.com/p/continuous-autoregressive-language
Authors: Chenze Shao, Darren Li, Fandong Meng, Jie Zhou
Paper: https://arxiv.org/abs/2510.27688
Code: https://github.com/shaochenze/calm
Model: N/A

TL;DR
WHAT was done? The paper introduces Continuous Autoregressive Language Models (CALM), a new paradigm that shifts LLM generation from sequential, discrete next-token prediction to continuous next-vector prediction. This is achieved by using a robust, high-fidelity variational autoencoder to compress a chunk of K tokens into a single continuous vector, thereby reducing the number of autoregressive steps K-fold. The shift to a continuous domain required the development of a comprehensive likelihood-free toolkit, including: an Energy Transformer head for efficient, single-step vector generation; a novel evaluation metric, BrierLM, based on the strictly proper Brier score; and a principled, black-box algorithm for temperature sampling.
WHY it matters? This work directly confronts the fundamental computational bottleneck of LLMs: their inefficient, token-by-token generation process. By increasing the “semantic bandwidth” of each generative step, CALM establishes a new and highly effective scaling axis for language models. Experiments show this approach yields a superior performance-compute trade-off; for instance, a CALM model achieves the performance of a strong discrete baseline with 44% fewer training FLOPs and 34% fewer inference FLOPs. This establishes next-vector prediction as a powerful and scalable pathway towards building ultra-efficient language models, moving beyond the traditional scaling laws focused solely on parameters and data.

## Huxley-Gödel Machine: Human-Level Coding Agent Development by an Approximation of the Optimal Self-Improving Machine

Post: https://arxiviq.substack.com/p/huxley-godel-machine-human-level
Authors: Wenyi Wang, Piotr Piękos, Li Nanbo, Firas Laakom, Yimeng Chen, Mateusz Ostaszewski, Mingchen Zhuge, Jürgen Schmidhuber
Paper: https://arxiv.org/abs/2510.21614
Code: https://github.com/metauto-ai/HGM
Model: N/A

TL;DR
WHAT was done? The paper identifies and addresses the “Metaproductivity-Performance Mismatch,” a critical flaw in current self-improving coding agents where immediate benchmark performance is a poor predictor of long-term improvement potential. To solve this, the authors introduce the Huxley-Gödel Machine (HGM), an algorithm that approximates the theoretically optimal Gödel Machine. Instead of relying on individual agent scores, HGM is guided by a novel, lineage-based metric called Clade-Metaproductivity (CMP), which aggregates the performance of an agent’s entire tree of descendants to better estimate its future potential. This is combined with an efficient, asynchronous tree-search strategy that decouples agent creation from evaluation.
WHY it matters? This work marks a significant paradigm shift in designing autonomous AI systems, moving from greedy, short-term optimization to a more principled approach focused on long-term evolutionary potential. The method is not only more effective—discovering higher-quality agents—but also dramatically more efficient, requiring up to 6.8x fewer CPU-hours than previous state-of-the-art methods. Most notably, an agent designed by HGM achieves human-level performance on the SWE-bench Lite benchmark, matching the best officially verified results from human-engineered agents. This demonstrates a powerful new pathway toward automated AI design that can produce robust, transferable, and expert-level solutions.
Image from repo

## Encoder-Decoder or Decoder-Only? Revisiting Encoder-Decoder Large Language Model

Post: https://arxiviq.substack.com/p/encoder-decoder-or-decoder-only-revisiting
Authors: Biao Zhang, Yong Cheng, Siamak Shakeri, Xinyi Wang, Min Ma, Orhan Firat
Paper: https://arxiv.org/abs/2510.26622
Code: N/A
Model: N/A

TL;DR
WHAT was done? The paper conducts a rigorous, large-scale empirical comparison between modernized Encoder-Decoder (RedLLM) and dominant Decoder-Only (DecLLM) architectures, scaling from 150M to 8B parameters. The authors updated the Encoder-Decoder model with modern recipes like RoPE, RMSNorm, and SwiGLU, and pretrained both architectures on 1.6T tokens (RedPajama V1) before instruction tuning on FLAN.
WHY it matters? This work provides compelling evidence challenging the prevailing industry consensus that decoder-only models are superior. While DecLLM is more compute-optimal during pretraining, the study reveals that after instruction tuning, RedLLM achieves comparable or even superior quality on downstream tasks. More critically, RedLLM demonstrates substantially better training and inference efficiency, dominating the quality-compute Pareto frontier when measured by inference FLOPs. This suggests that for practical, cost-sensitive deployment, the modernized Encoder-Decoder architecture offers a superior quality-efficiency trade-off, potentially redirecting future architectural development in LLMs.

## Nested Learning: The Illusion of Deep Learning Architectures

Post: https://arxiviq.substack.com/p/nested-learning-the-illusion-of-deep
Authors: Ali Behrouz, Meisam Razaviyayn, Peiling Zhong, Vahab Mirrokni
Paper: https://abehrouz.github.io/files/NL.pdf
Code: The authors plan to provide data and code via Github after the paper is made publicly available (however, they promised the same for Titans, but haven’t published yet).
Model: N/A

TL;DR
WHAT was done? The paper introduces Nested Learning (NL), a new theoretical paradigm that reframes machine learning models and their training procedures as an integrated system of nested, multi-level optimization problems. Each component in this hierarchy operates with its own “context flow”—such as a stream of data samples or gradients—and a distinct update frequency. This “white-box” view reveals that existing deep learning methods learn by compressing context. The authors use this framework to make three core contributions: (1) Deep Optimizers, which reinterprets optimizers like SGD with Momentum as learnable, multi-level memory modules that compress gradients; (2) the Continuum Memory System (CMS), which generalizes long- and short-term memory into a hierarchy of memory blocks updating at different time scales; and (3) HOPE (or Self-Modifying Titans), a new self-modifying sequence architecture that combines these principles and achieves state-of-the-art performance.
WHY it matters? Nested Learning offers a principled, neuro-inspired solution to one of the biggest challenges in AI: the static nature of Large Language Models (LLMs). By moving beyond the “illusion” of simply stacking layers, NL provides a mathematical blueprint for designing models capable of continual learning, self-improvement, and higher-order in-context reasoning. This work transitions AI design from heuristic architecture stacking to the explicit engineering of multi-timescale memory systems. The resulting HOPE architecture demonstrates superior performance over strong baselines like Transformers and its predecessor, Titans, pointing toward a future of more adaptive, efficient, and robust AI systems that can overcome the “amnesia” that plagues current models.

## Titans: Learning to Memorize at Test Time

Post: https://arxiviq.substack.com/p/titans-learning-to-memorize-at-test
Authors: Ali Behrouz, Peilin Zhong, and Vahab Mirrokni
Paper: https://arxiv.org/abs/2501.00663
Code: The authors stated their intention to make the code available soon, but it didn’t happen since January 2025 😟
Model: N/A

TL;DR
WHAT was done? The paper introduces Titans, a new family of hybrid architectures designed to overcome the context-length limitations of current sequence models. The core innovation is a novel Neural Long-Term Memory Module (LMM), a deep, non-linear recurrent module that functions as a meta in-context learner. This means the LMM doesn’t just process data; it learns how to memorize and forget information adaptively at test time by optimizing its own weights during the forward pass. This is achieved through a gradient-based “surprise” metric with momentum, allowing it to track and store important events over time, and an adaptive forgetting mechanism, which prevents memory overflow. The authors propose three variants (MAC, MAG, MAL) for integrating this LMM with short-term attention.
WHY it matters? Titans bridge the critical gap between Transformers, which offer high accuracy but suffer from quadratic scaling costs, and modern linear recurrent models, which are efficient but struggle to compress extremely long contexts without information loss. By combining a powerful, dynamically updating long-term memory with precise short-term attention, Titans demonstrate state-of-the-art performance across diverse benchmarks. Most notably, they achieve unprecedented effectiveness in extreme long-context tasks, scaling to over 2 million tokens and outperforming much larger models like GPT-4 on the BABILong reasoning benchmark. This work introduces a new paradigm for building sequence models with robust, adaptive memory, paving the way for AI systems that can effectively process and reason over massive, document-length inputs.
Also the new Nested Learning paper by the same authors from Google proposes Hope, a variant of the Titans architecture (we’ll cover it tomorrow).

## Mathematical exploration and discovery at scale

Post: https://arxiviq.substack.com/p/mathematical-exploration-and-discovery
Authors: Bogdan Georgiev, Javier Gómez-Serrano, Terence Tao, Adam Zsolt Wagne
Paper: https://arxiv.org/abs/2511.02864
Code: https://github.com/google-deepmind/alphaevolve_repository_of_problems
Model: N/A

TL;DR
WHAT was done? This 80-page paper provides a deep, comprehensive validation of AlphaEvolve, an AI system that uses a large language model (LLM) to guide an evolutionary search for novel mathematical constructions. Expanding significantly on an initial white paper, the authors tested AlphaEvolve on a vast portfolio of 67 challenging problems in analysis, combinatorics, and geometry. The system represents a major leap over its predecessor, FunSearch, by evolving entire codebases rather than single functions. The authors also detail new operational modes like a “generalizer” that discovers universal formulas from specific examples, and showcase a full AI pipeline integrating AlphaEvolve (for pattern discovery) with Deep Think (for symbolic proof) and AlphaProof (for formal verification). The system autonomously rediscovered known solutions and, in many cases, discovered new state-of-the-art constructions and improved numerical bounds, from raising the 11D kissing number to finding a better packing for 11 cubes.
WHY it matters? This work establishes a new paradigm for “constructive mathematics at scale,” demonstrating a powerful and efficient methodology for human-AI collaboration. Authored by a team including Fields Medalist Terence Tao, the paper shows how AI can systematically explore vast search spaces to find concrete solutions that complement human intuition, often in just hours instead of months. Unlike AI systems focused on proving existing theorems (e.g., for IMO gold medals), AlphaEvolve excels at generating the novel objects and conjectures that fuel mathematical progress. It provides a blueprint for a future where AI not only verifies human knowledge but actively participates in its creation, moving from empirical observation to formally verified results.
See also the recent Google’s AI for Math Initiative.

## Context Engineering 2.0: The Context of Context Engineering

Post: https://arxiviq.substack.com/p/context-engineering-20-the-context
Authors: Qishuo Hua, Lyumanshan Ye, Dayuan Fu, Yang Xiao, Xiaojie Cai, Yunze Wu, Jifan Lin, Junfei Wang, Pengfei Liu
Paper: https://arxiv.org/abs/2510.26493
Code: https://github.com/GAIR-NLP/SII-CLI
Model: N/A

TL;DR
WHAT was done? This paper reframes “context engineering” from a recent LLM-era trend into a long-evolving discipline with a history spanning over two decades. It establishes a systematic theoretical foundation, defining the practice as a process of entropy reduction —transforming high-entropy human intentions into low-entropy, machine-understandable formats. The authors introduce a novel four-stage evolutionary model (Context Engineering 1.0 to 4.0) that maps the discipline’s progression against the increasing intelligence of machines, from primitive computation to speculative superhuman AI. The framework organizes current practices into three core dimensions: context collection, management, and usage, providing a comprehensive taxonomy of design patterns for building sophisticated AI agents.
WHY it matters? This work provides a crucial intellectual anchor for a field currently fragmented across disparate practices like prompt engineering and RAG. By historicizing the discipline and providing a unified conceptual language, it elevates the conversation from tactical prompt tweaking to the strategic design of cognitive architectures. This perspective is essential for tackling the core challenges of building scalable, long-horizon, and reliable AI systems. The proposed trajectory toward a “Semantic Operating System for Context” sets a clear and ambitious research agenda for developing agents that can manage lifelong context, moving the field closer to truly collaborative and proactive AI.

## What Really Matters in Matrix-Whitening Optimizers?

Post: https://arxiviq.substack.com/p/what-really-matters-in-matrix-whitening
Authors: Kevin Frans, Pieter Abbeel, Sergey Levine
Paper: https://arxiv.org/abs/2510.25000
Code: https://github.com/kvfrans/matrix-whitening
Model: N/A

TL;DR
WHAT was done? This paper systematically deconstructs the family of matrix-whitening optimizers (e.g., SOAP, Muon, Shampoo) to identify the core components driving their superior performance over elementwise methods like Adam. Through a meticulously controlled experimental framework on a GPT-2 model, the authors isolate and ablate two key mechanisms: spectral normalization (the geometric orthogonalization of gradient updates) and variance adaptation (the statistical scaling of updates based on historical variance, akin to Adam’s β₂ ​ mechanism).
WHY it matters? The study delivers a paradigm-shifting insight: performance gains are not explained solely by achieving accurate spectral normalization, which has been the dominant theoretical motivation. In fact, the best-performing optimizer, SOAP, was less accurate at spectral normalization than the runner-up, Muon. The crucial, often-overlooked ingredient is variance adaptation. Variance-adapted versions of optimizers consistently and significantly outperform their signed-descent counterparts across all tested families. This reframes the design principles for future optimizers, suggesting that progress lies in the modular combination of these two components rather than a singular focus on perfect gradient orthogonalization. The paper also validates memory-efficient, low-rank factorization for variance buffers, providing a practical path for scaling these powerful methods to massive models.

## Exponential Dynamic Energy Network for High Capacity Sequence Memory

Post: https://arxiviq.substack.com/p/exponential-dynamic-energy-network
Authors: Arjun Karuvally, Pichsinee Lertsaroj, Terrence J. Sejnowski, Hava T. Siegelmann
Paper: https://arxiv.org/abs/2510.24965
Code: https://github.com/arjunkaruvally/EDEN_torch
Model: N/A

TL;DR
WHAT was done? The paper introduces the Exponential Dynamic Energy Network (EDEN), a novel neural architecture that extends the classical energy paradigm of Hopfield networks to model sequential memory. EDEN achieves this by combining a fast, high-capacity static energy network (responsible for storing individual memories) with a slow, asymmetrically interacting modulatory population. This slow population dynamically evolves the network’s energy function over time, causing the energy minima to shift in a controlled manner, thus enabling robust transitions between sequential memory states.
WHY it matters? This work presents several major breakthroughs. First, it solves a long-standing challenge by demonstrating exponential sequence memory capacity ( O ( γ N )), a dramatic improvement over the linear capacity ( O ( N )) of conventional sequence models. This makes it a viable blueprint for scalable and reliable external memory in AI systems. Second, EDEN establishes a new Dynamic Energy Paradigm, providing a rigorous and interpretable theoretical framework for temporal memory. Crucially, the paper highlights that the high-capacity memory mechanism used is functionally equivalent to the self-attention mechanism in Transformers, forging an exciting link between classic theories of memory and cutting-edge AI. Finally, the model offers strong biological plausibility, as its fast and slow neural populations exhibit dynamics analogous to the “time cells” and “ramping cells” observed in the human brain during episodic memory tasks.

## Memory-Augmented Transformers: A Systematic Review from Neuroscience Principles to Enhanced Model Architectures

Post: https://arxiviq.substack.com/p/memory-augmented-transformers-a-systematic
Authors: Parsa Omidi, Xingshuai Huang, Axel Laborieux, Bahareh Nikpour, Tianyu Shi, Armaghan Eshaghi
Paper: https://arxiv.org/abs/2508.10824
Code: N/A
Model: N/A

TL;DR
WHAT was done? This paper presents a systematic review that establishes a comprehensive, interdisciplinary framework for Memory-Augmented Transformers (MATs). It bridges fundamental neuroscience principles—such as dynamic multi-timescale memory, selective attention, and consolidation—with recent engineering advancements. The authors introduce a novel, multi-dimensional taxonomy that organizes the field across three core axes: functional objectives (e.g., context extension, reasoning), memory types (parameter-encoded, state-based, explicit, and hybrid), and integration techniques (e.g., attention fusion, gated control). The review meticulously analyzes the evolution of core memory operations, revealing a clear trajectory from static caching mechanisms to dynamic, self-managing systems.
WHY it matters? This unified framework provides a much-needed roadmap for overcoming the critical limitations of standard Transformers, namely their fixed context windows, static knowledge, and computational inefficiency. The next frontier for AI involves building persistent, adaptive agents, which cannot be achieved with stateless models. This review offers a design playbook for building these next-generation systems by treating memory not as a passive buffer but as an active, hierarchical substrate for reasoning and adaptation. By charting the field’s rapid evolution, it directly informs the development of more capable, efficient, and trustworthy AI agents capable of genuine lifelong learning.

## A Practitioner's Guide to Kolmogorov-Arnold Networks

Post: https://arxiviq.substack.com/p/a-practitioners-guide-to-kolmogorov
Authors: Amir Noorizadegan, Sifan Wang, and Leevan Ling
Paper: https://arxiv.org/abs/2510.25781
Code: https://github.com/AmirNoori68/kan-review
Model: N/A

TL;DR
WHAT was done? The authors provide a systematic and comprehensive review of Kolmogorov-Arnold Networks (KANs, see my review here ), synthesizing their theoretical foundations, diverse architectural variants, and practical implementation strategies. Moving beyond simplistic “KAN vs. MLP” comparisons, the paper introduces a methodical, basis-centric framework that analyzes the trade-offs of various learnable basis functions—including B-splines, Chebyshev polynomials, ReLU compositions, and Gaussian RBFs. This synthesis culminates in a practical “Choose-Your-KAN” guide, offering heuristics to map problem characteristics to optimal KAN architectures and training schedules.
WHY it matters? This work brings essential structure to the chaotic and rapidly expanding KAN landscape. Instead of adding another isolated benchmark, it establishes a principled science of KAN design, explaining why certain variants excel on specific tasks. By framing KANs as a modular framework rooted in classical approximation theory, it provides a clear path to mitigating known deep learning challenges like spectral bias in Physics-Informed Neural Networks (PINNs). For practitioners, it serves as an indispensable roadmap for applying KANs effectively, while for researchers, it defines the critical theoretical gaps—in basis selection, optimization, and interpretability—that must be addressed to mature the field.

## Kimi Linear: An Expressive, Efficient Attention Architecture

Post: https://arxiviq.substack.com/p/kimi-linear-an-expressive-efficient
Authors: Yu Zhang, Zongyu Lin, Xingcheng Yao, Jiaxi Hu, Fanqing Meng, Chengyin Liu, Xin Men, Songlin Yang, Zhiyuan Li, Wentao Li, Enzhe Lu, Weizhou Liu, Yanru Chen, Weixin Xu, Longhui Yu, Yejie Wang, Yu Fan, Longguang Zhong, Enming Yuan, Dehao Zhang, Yizhi Zhang, T.Y. Liu, Haiming Wang, Shengjun Fang, Weiran He, Shaowei Liu, Yiwei Li, Jianlin Su, Jiezhong Qiu, Bo Pang, Junjie Yan, Zhejun Jiang, Weixiao Huang, Bohong Yin, Jiacheng You, Chu Wei, Zhengtao Wang, Chao Hong, Yutian Chen, Guanduo Chen, Yucheng Wang, Huabin Zheng, Feng Wang, Yibo Liu, Mengnan Dong, Zheng Zhang, Siyuan Pan, Wenhao Wu, Yuhao Wu, Longyu Guan, Jiawen Tao, Guohong Fu, Xinran Xu, Yuzhi Wang, Guokun Lai, Yuxin Wu, Xinyu Zhou, Zhilin Yang, Yulun Du
Paper: https://arxiv.org/abs/2510.26692
Code: https://github.com/MoonshotAI/Kimi-Linear
Model: https://huggingface.co/moonshotai/Kimi-Linear-48B-A3B-Instruct

TL;DR
WHAT was done? The paper introduces Kimi Linear, a hybrid attention architecture that interleaves a novel linear attention module, Kimi Delta Attention (KDA), with standard full attention (MLA) in a 3:1 ratio. At its core, KDA refines the Gated Delta Rule from Gated DeltaNet ( https://openreview.net/forum?id=r8H7xhYPwz ) by introducing a fine-grained, channel-wise gating mechanism for more precise recurrent memory control. For hardware efficiency, it employs a bespoke chunkwise parallel algorithm based on a constrained variant of the Diagonal-Plus-Low-Rank (DPLR) structure ( https://arxiv.org/abs/2111.00396 ), achieving nearly twice the kernel speed of general DPLR formulations.
WHY it matters? This work marks a significant milestone by demonstrating, for the first time under rigorous, matched-scale comparisons, that a hybrid linear architecture can consistently outperform a strong full-attention baseline across short-context, long-context, and reinforcement learning scenarios. It effectively ends the long-standing trade-off between model quality and computational cost. By reducing KV cache usage by up to 75% and achieving up to 6.3x faster decoding at a 1M token context, Kimi Linear provides a scalable, Pareto-optimal “drop-in replacement” for standard Transformers, unlocking new possibilities for agentic AI and extreme long-context applications.

## The Principles of Diffusion Models

Post: https://arxiviq.substack.com/p/the-principles-of-diffusion-models
Authors: Chieh-Hsin Lai, Yang Song, Dongjun Kim, Yuki Mitsufuji, Stefano Ermon
Paper: https://arxiv.org/abs/2510.21890
Code: N/A
Model: N/A

TL;DR
WHAT was done? This 470-pages monograph presents a unified theoretical framework for diffusion models, demonstrating that the three historically distinct approaches—the variational view (e.g., DDPM), the score-based view (e.g., Score SDE), and the flow-based view (e.g., Flow Matching)—are mathematically equivalent. They all converge on the same core principle: learning a time-dependent vector field to reverse a fixed forward corruption process. The authors show that this entire generative process is governed by a single differential equation (the Probability Flow ODE), with its consistency guaranteed by the Fokker-Planck equation. The work further proves that the various prediction targets used in training (noise, clean data, score, or velocity) are algebraically interchangeable, clarifying that their differences are matters of implementation and stability, not fundamental modeling capacity.
WHY it matters? This work transforms the art of designing diffusion models into a science. By providing a unified differential equation framework, it replaces a collection of disparate heuristics with a principled engineering discipline. This “first principles” understanding is crucial for systematically developing faster samplers (like DPM-Solver), enabling robust and controllable generation (via guidance), and designing the next generation of highly efficient, standalone generative models (like Consistency Models). These new models learn the solution map directly from data, resolving the long-standing trade-off between sample quality and speed and paving the way for more powerful and practical generative AI.

## gLSTM: Mitigating Over-Squashing by Increasing Storage Capacity

Post: https://arxiviq.substack.com/p/glstm-mitigating-over-squashing-by
Authors: Hugh Blayney, Álvaro Arroyo, Xiaowen Dong, Michael M. Bronstein
Paper: https://arxiv.org/abs/2510.08450
Code: https://github.com/HughBlayney/gLSTM
Model: N/A

TL;DR
WHAT was done? The paper re-characterizes the “over-squashing” problem in Graph Neural Networks (GNNs) by splitting it into two distinct failure modes: low sensitivity (signal propagation failure) and saturated storage capacity (information bottleneck). To address the latter, the authors introduce gLSTM, a novel GNN architecture inspired by the xLSTM sequence model. gLSTM augments each node’s representation with an associative memory (a matrix hidden state) to explicitly increase its information storage and retrieval capabilities. They also propose a new synthetic task, Neighbor Associative Recall (NAR), specifically designed to isolate and measure this capacity limitation in a shallow-graph setting, avoiding confounding factors from deep architectures.
WHY it matters? This work shifts the GNN community’s focus from mitigating over-squashing through purely topological or sensitivity-based fixes (like graph rewiring) to developing more capable node-level architectures. It provides empirical evidence that capacity saturation can occur independently of sensitivity loss, clarifying a long-standing issue. This is critical for applications like drug discovery, where understanding long-range interactions between distant atoms is essential. The gLSTM architecture and the NAR benchmark provide a new path forward, demonstrating that enhancing a node’s internal memory is a powerful, previously underexplored strategy for creating GNNs that can handle complex, long-range dependencies.

## Train for Truth, Keep the Skills: Binary Retrieval-Augmented Reward Mitigates Hallucinations

Post: https://arxiviq.substack.com/p/train-for-truth-keep-the-skills-binary
Authors: Tong Chen, Akari Asai, Luke Zettlemoyer, Hannaneh Hajishirzi, Faeze Brahman
Paper: https://arxiv.org/abs/2510.17733
Code: https://github.com/chentong0/rl-binary-rar
Model: N/A

TL;DR
WHAT was done? The authors propose an online Reinforcement Learning (RL) method to combat factual errors in language models by introducing a novel Binary Retrieval-Augmented Reward (Binary RAR). Instead of using a complex continuous score, this reward is a simple binary signal: 1 if the model’s entire output is factually correct when checked against retrieved documents, and 0 if any contradiction is found.
WHY it matters? This approach effectively resolves the critical “hallucination-utility tradeoff,” where reducing factual errors often degrades a model’s general skills. Binary RAR achieves a state-of-the-art reduction in hallucination rates (a 39.3% drop in long-form generation) while uniquely preserving capabilities like instruction following and reasoning—a common failure point for methods using continuous rewards. The strict, all-or-nothing penalty resists “reward hacking” and encourages the model to learn sophisticated behaviors like calibrated abstention, strategically saying “I don’t know” when uncertain. This work presents a simple, robust, and scalable path toward building more reliable and trustworthy AI.

## Compress to Impress: Efficient LLM Adaptation Using a Single Gradient Step on 100 Samples

Post: https://arxiviq.substack.com/p/compress-to-impress-efficient-llm
Authors: Shiva Sreeram, Alaa Maalouf, Pratyusha Sharma, Daniela Rus
Paper: https://arxiv.org/abs/2510.20800
Code: Not specified in the paper
Model: N/A

TL;DR
WHAT was done? The paper introduces an extremely efficient, training-free method to adapt Large Language Models (LLMs) to new domains. It builds upon the LAyer-SElective-Rank reduction (LASER) technique but addresses its critical bottleneck: a slow, exhaustive search for which weight matrices to compress. The authors replace this search with a single backward pass on just 100 labeled examples. The gradient of each matrix’s singular values is used to reliably score and identify which components are detrimental and should be pruned. Furthermore, they enhance the compression quality by introducing multi-subspace factorization—approximated via a simple “block splitting” heuristic—where different parts of a weight matrix are compressed independently to better remove overfitting noise.
WHY it matters? This work makes high-quality LLM adaptation dramatically more accessible and practical. By reducing the process to a “minute-scale operation on a single GPU,” it achieves up to a 52x computational speedup over its predecessor while maintaining or even improving accuracy. The core insight—that effective adaptation is driven by aligning to a domain’s prompting style with minimal data, rather than requiring large datasets—challenges conventional wisdom. This provides a fast, robust, and resource-light pipeline for customizing LLMs, which is particularly valuable for on-device deployment, rapid prototyping, and use in settings where computational resources or labeled data are scarce.

## The Markovian Thinker

Post: https://arxiviq.substack.com/p/the-markovian-thinker
Authors: Milad Aghajohari, Kamran Chitsaz, Amirhossein Kazemnejad, Sarath Chandar, Alessandro Sordoni, Aaron Courville, Siva Reddy
Paper: https://arxiv.org/abs/2510.06557
Code: https://github.com/McGill-NLP/the-markovian-thinker
Model: https://huggingface.co/collections/McGill-NLP/the-markovian-thinker

TL;DR
WHAT? The paper introduces “Markovian Thinking,” a new paradigm for training reasoning LLMs via Reinforcement Learning (RL). This is instantiated by the “Delethink” environment, which reframes the reasoning process into a sequence of fixed-size chunks. At the boundary of each chunk, the environment resets the context, retaining only a short, learned textual carryover—a “Markovian state”—to continue the thought process. The RL policy is trained to write a sufficient state into this carryover to enable seamless continuation.
WHY IT MATTERS? This approach decouples the total thinking length from the model’s active context size, fundamentally changing the computational scaling. It transforms the prohibitive quadratic compute cost ( O ( N 2 )) and linear memory growth of standard Long-Chain-of-Thought (LongCoT) RL into linear compute and constant memory with respect to thinking length. This makes it economically feasible to train LLMs for extremely long reasoning traces (e.g., 96K tokens). Furthermore, Delethink-trained models exhibit superior test-time scaling, continuing to improve well beyond their training budget where LongCoT models plateau. The work also reveals that state-of-the-art LLMs already possess latent Markovian capabilities zero-shot, providing a strong foundation for this highly efficient training regime.

## AION-1: Omnimodal Foundation Model for Astronomical Sciences

Post: https://arxiviq.substack.com/p/aion-1-omnimodal-foundation-model
Authors: Liam Parker*, Francois Lanusse*, Jeff Shen*, Ollie Liu, Tom Hehir, Leopoldo Sarra, Lucas Meyer, Micah Bowles, Sebastian Wagner-Carena, Helen Qu, Siavash Golkar, Alberto Bietti, Hatim Bourfoune, Nathan Cassereau, Pierre Cornette, Keiya Hirashima, Geraud Krawezik, Ruben Ohana, Nicholas Lourie, Michael McCabe, Rudy Morel, Payel Mukhopadhyay, Mariel Pettee, Bruno Regaldo-Saint Blancard, Kyunghyun Cho, Miles Cranmer, Shirley Ho
Paper: https://arxiv.org/abs/2510.17960
Code: https://github.com/PolymathicAI/AION/
Model: N/A

TL;DR
WHAT was done? The authors introduce AION-1, a family of large-scale (300M to 3.1B parameters) omnimodal foundation models for astronomy. AION-1 tackles the core challenge of data heterogeneity by unifying 39 different data types—including imaging, spectroscopy, and scalar metadata—from five major astronomical surveys into a single coherent framework. This is achieved through a novel two-stage architecture: first, a suite of bespoke, modality-specific tokenizers homogenizes the noisy, instrument-specific data into a unified discrete vocabulary. Second, a large Transformer encoder-decoder is pretrained using a multimodal masked modeling objective, forcing it to learn the joint physical distribution across all data types.
WHY it matters? AION-1 represents a paradigm shift from building siloed, bespoke models for each astronomical task to using a single, frozen, pre-trained backbone. This approach demonstrates state-of-the-art performance across a diverse range of downstream tasks while dramatically improving data efficiency; it achieves high accuracy with two to three orders of magnitude fewer labels than traditional supervised models. Crucially, the model exhibits emergent capabilities like producing survey-invariant embeddings (enabling zero-shot transfer between telescopes), performing cross-modal generation (e.g., spectral super-resolution), and enabling superior zero-shot retrieval of extremely rare objects like strong gravitational lenses. It provides a scalable blueprint for building foundation models in other data-rich experimental sciences.

## Soft-Masked Diffusion Language Models

Post: https://arxiviq.substack.com/p/soft-masked-diffusion-language-models
Authors: Michael Hersche, Samuel Moor-Smith, Thomas Hofmann, Abbas Rahimi
Paper: https://arxiv.org/abs/2510.17206
Code: Not available
Model: Not available

TL;DR
WHAT was done? The paper introduces Soft-Masking (SM), a novel mechanism for Masked Diffusion Language Models (MDLMs). Instead of the standard, rigid binary choice (either retain a [MASK] token or replace it with a single prediction), SM enriches the feedback for subsequent decoding steps. It does this by dynamically blending the [MASK] token’s embedding with a confidence-weighted convex combination of the top-k predicted token embeddings from the previous step. The authors also propose an efficient, parallelizable two-pass training methodology to teach the model to leverage this richer, continuous feedback signal.
WHY it matters? This work addresses a core limitation of MDLMs—the loss of valuable predictive information during the discrete unmasking process. By injecting continuous, uncertainty-aware feedback, SM significantly improves model performance, leading to lower perplexity and higher MAUVE scores in language modeling. Crucially, it delivers substantial accuracy gains on complex coding tasks, particularly in high-throughput settings. This means achieving better results with fewer iterative steps, directly translating to lower latency and cheaper inference costs in production environments. SM is a lightweight enhancement that complements existing efficiency techniques like advanced unmasking (ReMDM) and blockwise decoding (Fast-dLLM), making MDLMs a more powerful and practical alternative to autoregressive models.

## Planned Diffusion

Post: https://arxiviq.substack.com/p/planned-diffusion
Authors: Daniel Israel, Tian Jin, Ellie Cheng, Aditya Grover, Suvinay Subramanian, Guy Van den Broeck, Michael Carbin
Paper: https://arxiv.org/abs/2510.18087
Code: Not available
Model: Not available

TL;DR
WHAT was done? The paper introduces “Planned Diffusion,” a novel hybrid framework for text generation that combines the strengths of autoregressive (AR) and diffusion models within a single, unified architecture. The method operates in two stages: first, it uses an AR process to sequentially generate a high-level “plan” that defines the semantic structure and partitions the output into conditionally independent text spans. Second, it executes this plan by generating the content for all defined spans simultaneously using a parallel discrete diffusion process.
WHY it matters? This approach directly challenges the fundamental trade-off between generation speed and output quality in large language models. By treating text generation as a dynamic parallel scheduling problem, Planned Diffusion significantly reduces the sequential critical path, achieving a 1.27x to 1.81x speedup over standard AR generation on the AlpacaEval benchmark ( https://github.com/tatsu-lab/alpaca_eval ) with only a minimal quality drop. This expands the latency-quality Pareto frontier, offering a practical and scalable path toward faster, more efficient, high-quality LLMs without the overhead of multi-model systems like speculative decoding ( https://arxiv.org/abs/2211.17192 ).

## The Free Transformer

Post: https://arxiviq.substack.com/p/the-free-transformer
Authors: François Fleuret
Paper: https://arxiv.org/abs/2510.17558
Code: Not available
Model: Not available

TL;DR
WHAT was done? The paper introduces the “Free Transformer,” an extension of the standard decoder-only Transformer that conditions its generative process on random latent variables. This is achieved by reformulating the architecture as a Conditional Variational Autoencoder (CVAE). The key innovation is an exceptionally efficient design where the latent variable is injected into the decoder’s middle layer, allowing the encoder and decoder to share the first half of the Transformer blocks. This adds only one extra non-causal Transformer block and results in a minimal computational overhead of just 3-4%.
WHY it matters? This work challenges the long-standing paradigm of purely autoregressive generation. By allowing the model to learn and condition on explicit, high-level latent decisions (e.g., topic, sentiment, or problem structure), it provides a more powerful inductive bias. The results are compelling: without any special tuning of the baseline optimizer, the Free Transformer shows substantial performance improvements on complex reasoning, math, and code generation benchmarks (e.g., HumanEval+, GSM8K, MBPP). This suggests that providing models with the “freedom” to structure their generation via latent variables is a more efficient path to enhanced reasoning capabilities than relying solely on scaling up autoregressive models.

## Compute as Teacher: Turning Inference Compute Into Reference-Free Supervision

Post: https://arxiviq.substack.com/p/compute-as-teacher-turning-inference
Authors: Dulhan Jayalath, Shashwat Goel, Thomas Foster, Parag Jain, Suchin Gururangan, Cheng Zhang, Anirudh Goyal, Alan Schelten
Paper: https://arxiv.org/abs/2509.14234
Code: N/A
Model: N/A

TL;DR
WHAT was done? The paper introduces Compute as Teacher (CaT), a method that transforms a model’s own exploratory outputs into high-quality, reference-free supervision. Instead of selecting the “best” answer from a group of parallel rollouts, CaT uses a frozen “anchor” policy to synthesize a single, improved reference by reconciling contradictions and integrating partial solutions. For verifiable tasks like math, this synthesized answer acts as a target for programmatic checkers. For non-verifiable domains like healthcare dialogue, CaT introduces a novel mechanism: the anchor generates self-proposed rubrics (fine-grained, binary criteria) from the synthesized reference, which are then scored by an LLM judge to provide a robust reward signal for Reinforcement Learning (CaT-RL).
WHY it matters? CaT provides a powerful solution to the supervision bottleneck in specialized LLM post-training, particularly in domains where ground truth is expensive, subjective, or non-existent. Its synthesis-over-selection approach is a paradigm shift; it enables genuine self-correction, producing correct answers even when all individual rollouts are flawed—a feat impossible for methods like best-of-N or majority vote. The self-proposed rubric mechanism makes reliable RL fine-tuning feasible in subjective areas, mitigating the known biases of coarse LLM-as-a-judge scoring. This work establishes a practical framework for trading inference compute for supervision, paving the way for more autonomous and scalable model improvement.

## Are Large Reasoning Models Interruptible?

Post: https://arxiviq.substack.com/p/are-large-reasoning-models-interruptible
Authors: Tsung-Han Wu, Mihran Miroyan, David M. Chan, Trevor Darrell, Narges Norouzi, Joseph E. Gonzalez
Paper: https://arxiv.org/abs/2510.11713
Code: https://github.com/dynamic-lm/interrupt-lrm
Model: N/A

TL;DR
WHAT was done? This paper challenges the conventional “frozen world” assumption used to evaluate Large Reasoning Models (LRMs), where context is static and outputs are generated without interruption. The authors introduce a novel analytical framework and a public benchmark to assess LRM robustness under realistic dynamic conditions: time-constrained interruptions (forcing an immediate answer or requesting speedup) and dynamic context (introducing task-altering information mid-reasoning). Using this framework, they evaluate state-of-the-art LRMs on complex math and coding tasks.
WHY it matters? The study reveals that high static accuracy severely overestimates real-world robustness, with performance dropping by up to 60% when context changes late in the reasoning process. More importantly, it identifies and characterizes three novel and critical failure modes:
Reasoning Leakage: Models ignore hard-stop signals and continue their chain-of-thought within the final answer, inflating computational costs.
Panic: When asked to speed up, models catastrophically abandon their reasoning process instead of compressing it gracefully.
Self-Doubt: Models fail to trust and incorporate new, valid information, often sticking to their original, now-incorrect reasoning path.
These findings demonstrate that interruptibility and adaptability are not inherent properties of current LRMs and must be explicitly designed and evaluated for, shifting the paradigm for building trustworthy and reliable AI agents.
ArXivIQ is a reader-supported publication. To receive new posts and support my work, consider becoming a free or paid subscriber.

## A mathematical theory for understanding when abstract representations emerge in neural networks

Post: https://arxiviq.substack.com/p/a-mathematical-theory-for-understanding
Authors: Bin Wang, W. Jeffrey Johnston, and Stefano Fusi
Paper: https://arxiv.org/abs/2510.09816
Code: N/A
Model: N/A

TL;DR
WHAT was done? The authors developed a novel analytical framework that maps the complex, non-convex optimization of a nonlinear neural network’s weights to a tractable, convex mean-field problem over the distribution of its hidden layer preactivations. Using this framework, they mathematically proved that abstract, disentangled representations of latent task variables—where each variable is encoded along an orthogonal axis—are the guaranteed optimal solutions (global minima) for networks trained on multi-label supervised learning tasks with a standard mean square error loss and l 2​ regularization.
WHY it matters? This work provides the first rigorous theoretical proof for the emergence of abstract representations, a fundamental phenomenon widely observed in both high-performing AI systems and the brain. It establishes that this optimal coding geometry is a universal outcome dictated primarily by the task structure, robust across different activation functions (e.g., ReLU, Tanh) and extendable to deep and recurrent architectures. This shifts the field from empirical observation to a principled, mathematical understanding of how and why neural networks learn representations that support generalization.

## BitNet Distillation

Post: https://arxiviq.substack.com/p/bitnet-distillation
Authors: Xun Wu, Shaohan Huang, Wenhui Wang, Ting Song, Li Dong, Yan Xia, Furu Wei
Paper: https://arxiv.org/abs/2510.13998
Code: https://github.com/microsoft/BitNet
Model: N/A

TL;DR
WHAT was done? The paper introduces BitNet Distillation (BitDistill), a three-stage Quantization-Aware Training (QAT) framework designed to fine-tune existing, pre-trained full-precision LLMs into 1.58-bit models (with ternary weights {−1,0,1}) for specific downstream tasks. The pipeline consists of (1) architectural refinement with Sub-Layer Normalization (SubLN) for training stability, (2) a crucial continual pre-training “warm-up” to adapt the model to the low-bit feature space, and (3) a dual-distillation fine-tuning stage using both logits and multi-head attention knowledge from an FP16 teacher.
WHY it matters? This work solves a critical bottleneck in extreme model compression: the poor scalability of direct quantization. Previous attempts to fine-tune 1.58-bit models showed a performance gap that widened as model size increased. BitDistill overcomes this, achieving performance comparable to full-precision FP16 counterparts across various model scales. By enabling up to 10x memory savings and 2.65x faster inference on CPUs, it provides a practical and cost-effective pathway to deploy powerful, specialized LLMs on resource-constrained and edge devices without the prohibitive cost of training ultra-low-bit models from scratch.

## LIMI: Less is More for Agency

Post: https://arxiviq.substack.com/p/limi-less-is-more-for-agency
Authors: Yang Xiao, Mohan Jiang, Jie Sun, Keyu Li, Jifan Lin, Yumin Zhuang, Ji Zeng, Shijie Xia, Qishuo Hua, Xuefeng Li, Xiaojie Cai, Tongyu Wang, Yue Zhang, Liming Liu, Xia Wu, Jinlong Hou, Yuan Cheng, Wenjie Li, Xiang Wang, Dequan Wang, Pengfei Liu
Paper: https://arxiv.org/abs/2509.17567
Code: https://github.com/GAIR-NLP/SII-CLI
Model: N/A

TL;DR
WHAT was done? The paper challenges the conventional “more data is better” scaling paradigm for developing AI agents. The authors introduce LIMI (Less Is More for Intelligent Agency), a method that fine-tunes a large language model (GLM-4.5) on a minimal dataset of just 78 meticulously curated, high-quality demonstrations of complex collaborative workflows. These demonstrations, or “trajectories,” capture the complete problem-solving process—including reasoning, tool use, and environmental feedback—within specialized domains like software development and scientific research.
WHY it matters? This work establishes the Agency Efficiency Principle: that sophisticated machine autonomy emerges not from data abundance but from the strategic curation of demonstrations that capture the essence of agentic behavior. The results are striking: LIMI achieves a 73.5% score on AgencyBench, delivering a 53.7 percentage point improvement over a baseline trained on 10,000 samples—using 128 times less data. This finding provides a new, more sustainable, and resource-efficient blueprint for cultivating capable AI agents, suggesting that the industry’s focus should shift from computational brute force to the intellectual craft of high-quality data engineering. It fundamentally alters the development roadmap for transitioning from “thinking AI” to reliable “working AI.”

## Scientific Algorithm Discovery by Augmenting AlphaEvolve with Deep Research

Post: https://arxiviq.substack.com/p/scientific-algorithm-discovery-by
Authors: Gang Liu, Yihan Zhu, Jie Chen, Meng Jiang
Paper: https://arxiv.org/abs/2510.06056
Code: https://github.com/liugangcode/deepevolve
Model: N/A

TL;DR
WHAT was done? The authors introduce DeepEvolve, an agent framework that enhances scientific algorithm discovery by integrating deep research with algorithm evolution. This system augments the evolutionary approach of models like AlphaEvolve by incorporating an iterative loop with six modules: planning research questions, searching external knowledge bases (e.g., arXiv, PubMed), synthesizing proposals, implementing them via cross-file code editing, evaluating performance, and selecting candidates for the next round. A key engineering contribution is an automated debugging agent that resolves execution errors, dramatically improving the success rate of implementing complex ideas.
WHY it matters? This work addresses a critical bottleneck in AI-driven science: pure algorithm evolution based on an LLM’s internal knowledge quickly plateaus and yields only marginal gains in complex domains. DeepEvolve provides a robust solution by grounding hypothesis generation in external scientific literature, ensuring that proposed ideas are both innovative and feasible. By successfully demonstrating sustained, significant performance gains across nine diverse scientific benchmarks—from chemistry to mathematics—the framework offers a practical blueprint for building more effective and reliable AI co-scientists capable of genuine algorithmic innovation.
ArXivIQ is a reader-supported publication. To receive new posts and support my work, consider becoming a free or paid subscriber.

## Latent learning: episodic memory complements parametric learning by enabling flexible reuse of experiences

Post: https://arxiviq.substack.com/p/latent-learning-episodic-memory-complements
Authors: Andrew Kyle Lampinen, Martin Engelcke, Yuxuan Li, Arslan Chaudhry, James L. McClelland
Paper: https://arxiv.org/abs/2509.16189
Code: Not available
Model: Not available

TL;DR
WHAT was done? This paper identifies and demonstrates a key generalization failure in modern AI systems called the “latent learning gap.” Parametric models, like transformers and RL agents, often fail to flexibly reuse information that was learned incidentally (i.e., not directly relevant to the training objective), even when that information is necessary for a new task. For example, a model trained on “Plato taught Aristotle” fails to answer “Who was Aristotle’s teacher?” without the original context. The authors show across a diverse set of novel benchmarks—spanning language reasoning, code-like tasks, and simulated navigation—that this failure is not due to a lack of knowledge, but an inability to apply it flexibly. They then demonstrate that augmenting these models with an oracle episodic memory system (nonparametric retrieval) effectively bridges this gap by reinstating the original rich context of past experiences, allowing the model’s in-context learning abilities to solve the new task.
WHY it matters? This work provides a powerful, cognitive-science-inspired framework for understanding a fundamental limitation of current AI and rationalizes the success of methods like Retrieval-Augmented Generation (RAG). It reframes retrieval not just as a tool for fact-checking but as a necessary complementary system for enabling a different, more flexible mode of generalization that parametric learning alone struggles with. The findings suggest that the data inefficiency and brittleness of AI systems may stem from this latent learning failure. By highlighting the critical role of episodic memory and the necessity of training models how to use retrieved context, this research points toward building more robust, adaptable, and biologically plausible AI architectures.

## Barbarians at the Gate: How AI is Upending Systems Research

Post: https://arxiviq.substack.com/p/barbarians-at-the-gate-how-ai-is
Authors: Audrey Cheng, Shu Liu, Melissa Pan, Zhifei Li, Bowen Wang, Alexander Krentsel, Tian Xia, Mert Cemri, Jongseok Park, Shuo Yang, Jeff Chen, Lakshya Agrawal, Aditya Desai, Jiarong Xing, Koushik Sen, Matei Zaharia, Ion Stoica
Paper: https://arxiv.org/abs/2510.06189
Code: The work primarily uses the open-source OpenEvolve framework.
Model: N/A

TL;DR
WHAT was done? This paper introduces and empirically validates a new research methodology called AI-Driven Research for Systems (ADRS). This approach uses Large Language Model (LLM) ensembles within an evolutionary loop to automatically discover and optimize high-performance algorithms for computer systems problems. The methodology’s success hinges on a key insight: systems research is uniquely suited for AI automation because it naturally provides reliable, fast, and inexpensive “verifiers” (simulators or real-world systems) that can accurately score the performance of any generated solution. This grounds the AI’s search process in empirical reality, mitigating the risk of hallucination.
WHY it matters? The ADRS approach is shown to be highly effective, discovering algorithms that match or significantly outperform state-of-the-art human-designed solutions across 11 diverse tasks. The results are striking, including a 5.0x runtime speedup in Mixture-of-Experts (MoE) load balancing and a 26% cost reduction in multi-region cloud job scheduling, often achieved in a few hours for under $20. This automates the most time-consuming stages of research—algorithm design and evaluation—which account for over 40% of a researcher’s effort. It fundamentally shifts the role of human researchers away from meticulous implementation towards higher-level problem formulation and strategic guidance, heralding a new era of accelerated, AI-driven scientific discovery.

## Agentic Context Engineering: Evolving Contexts for Self-Improving Language Models

Post: https://arxiviq.substack.com/p/agentic-context-engineering-evolving
Authors: Qizheng Zhang, Changran Hu, Shubhangi Upasani, Boyuan Ma, Fenglu Hong, Vamsidhar Kamanuru, Jay Rainton, Chen Wu, Mengmeng Ji, Hanchen Li, Urmish Thakker, James Zou, Kunle Olukotun
Paper: https://arxiv.org/abs/2510.04618
Code: N/A
Model: N/A

TL;DR
WHAT was done? The paper introduces Agentic Context Engineering (ACE), a framework for self-improving language models that treats context not as a static prompt but as a comprehensive, “evolving playbook.” ACE uses a modular, agentic architecture with three roles—a Generator, a Reflector, and a Curator—to iteratively accumulate, refine, and organize strategies. Instead of costly and destructive monolithic rewriting, it employs structured, incremental “delta updates” to the playbook, preserving detailed knowledge over time.
WHY it matters? ACE directly solves two critical failures in existing context adaptation methods: brevity bias, where optimization drops crucial domain details for concise instructions, and context collapse, where iterative rewriting degrades accumulated knowledge, causing sharp performance drops. By maintaining a detailed playbook, ACE enables robust self-improvement. Experimentally, it boosts performance by +10.6% on agent tasks and +8.6% on financial reasoning. Remarkably, it allows a smaller (?) open-source model (DeepSeek-V3.1) to match a top-ranked proprietary agent (GPT-4.1-based) on the AppWorld benchmark. Furthermore, its incremental approach reduces adaptation latency by up to 91.5% and token costs by 83.6%, making continuous, self-improving AI systems scalable and practical for real-world deployment.

## Best-of-∞ - Asymptotic Performance of Test-Time Compute

Post: https://arxiviq.substack.com/p/best-of-asymptotic-performance-of
Authors: Junpei Komiyama, Daisuke Oba, Masafumi Oyamada
Paper: https://arxiv.org/abs/2509.21091
Code: https://github.com/jkomiyama/BoInf-code-publish
Model: N/A

TL;DR
WHAT was done? This paper introduces “Best-of-∞,” a theoretical framework defining the asymptotic performance limit of the best-of-N (BoN) strategy with majority voting. To approximate this limit with finite resources, the authors propose two key innovations: 1) An adaptive sampling algorithm that uses Bayesian modeling (specifically, the Bayes factor) to dynamically decide when to stop generating answers, thereby optimizing computational spend. 2) A method for creating optimally weighted ensembles of multiple LLMs by formulating the weight optimization problem in the asymptotic limit as a tractable Mixed-Integer Linear Program (MILP).
WHY it matters? This work provides a principled and highly efficient alternative to the common but computationally expensive fixed-budget BoN approach. The adaptive sampling scheme achieves the same accuracy as fixed sampling but with a 2x-5x reduction in computational cost, directly addressing the challenge of expensive LLM inference. Furthermore, the MILP-optimized ensembles demonstrably outperform even the best single LLM, showcasing that intelligently combining diverse models is a powerful path to SOTA performance. This shifts the paradigm from heuristic test-time scaling to a more rigorous, cost-effective, and performance-driven framework.

## Understanding Transformers for Time Series: Rank Structure, Flow-of-ranks, and Compressibility

Post: https://arxiviq.substack.com/p/understanding-transformers-for-time
Authors: Annan Yu, Danielle C. Maddix, Boran Han, Xiyuan Zhang, Abdul Fatir Ansari, Oleksandr Shchur, Christos Faloutsos, Andrew Gordon Wilson, Michael W. Mahoney, Yuyang Wang
Paper: https://arxiv.org/abs/2510.03358
Code: N/A
Model: N/A

TL;DR
WHAT was done? The paper introduces a novel analytical framework for Transformers based on rank structure, specifically for time-series data. It establishes that time-series embeddings, unlike text or vision, have an inherently low numerical rank due to small patch sizes and smooth embedding functions. The authors introduce the “flow-of-ranks,” a phenomenon where the numerical rank of representations gradually increases with model depth due to non-linear mixing. Leveraging these insights, they demonstrate that Time Series Foundation Models (TSFMs) are severely over-parameterized and can be dramatically compressed.
WHY it matters? This work provides a principled, data-driven alternative to the common practice of transferring architectural designs from LLMs to TSFMs. The findings explain why TSFMs are so compressible and offer a concrete methodology for designing more efficient models. By applying these principles to the Chronos model ( https://arxiv.org/abs/2403.07815, human review here ), the authors achieve a 65% reduction in inference time and an 81% reduction in memory without any loss of accuracy. This not only makes large-scale TSFMs more practical for deployment in resource-constrained environments but also provides a foundational blueprint for designing modality-aware foundation models.

## Gemini Robotics 1.5

Post: https://arxiviq.substack.com/p/gemini-robotics-15
Authors: Gemini Robotics Team, Google DeepMind
Paper: https://arxiv.org/abs/2510.03342
Code: N/A
Model: N/A

TL;DR
WHAT was done? The paper introduces the Gemini Robotics 1.5 family, a pair of foundation models designed to advance general-purpose robotics. This family includes: 1) Gemini Robotics 1.5 (GR 1.5), a multi-embodiment Vision-Language-Action (VLA) model for low-level control, and 2) Gemini Robotics-ER 1.5 (GR-ER 1.5), a state-of-the-art Embodied Reasoning (ER) model for high-level understanding and planning. The work introduces three core innovations. First, a novel Motion Transfer (MT) mechanism enables a single VLA model to learn from heterogeneous data across different robots (ALOHA, Bi-arm Franka, Apollo humanoid) and achieve zero-shot skill transfer. Second, an Embodied Thinking capability allows the VLA model to interleave actions with internal, natural-language reasoning, significantly improving its ability to handle complex, multi-step tasks. Third, the GR-ER 1.5 model establishes a new state-of-the-art on a wide range of embodied reasoning tasks, providing the intelligence for a powerful agentic system.
WHY it matters? This research marks a significant step towards creating truly general-purpose robots. The proposed agentic architecture, which combines a high-level reasoning “orchestrator” (GR-ER 1.5) with a low-level “action model” (GR 1.5), provides a robust framework for solving complex, long-horizon problems. The Motion Transfer mechanism directly tackles the critical data scarcity bottleneck in robotics by unifying learning across different platforms, accelerating progress towards generalist capabilities. Finally, the “thinking” process makes robot behavior more effective, transparent, and capable of sophisticated error recovery, pushing the field from simple reactive control towards cognitive agency.

## [Dreamer 4] Training Agents Inside of Scalable World Models

Post: https://arxiviq.substack.com/p/dreamer-4-training-agents-inside
Authors: Danijar Hafner, Wilson Yan, Timothy Lillicrap
Paper: https://arxiv.org/abs/2509.24527
Code: N/A
Model: N/A

TL;DR
WHAT was done? The paper introduces Dreamer 4, a 2B-parameter agent that is the first to solve the long-horizon “obtain diamonds” challenge in Minecraft purely from a fixed offline dataset. This is achieved by training a policy via reinforcement learning (RL) entirely inside a learned world model. The core innovation is this world model: an efficient transformer architecture trained with a novel “shortcut forcing” objective. This objective, which builds on flow matching but crucially predicts the final clean state (x-prediction) instead of the update vector (v-prediction), allows the model to accurately simulate complex game mechanics in real-time (21 FPS) on a single GPU.
WHY it matters? This work marks a significant milestone by demonstrating that complex control tasks, previously requiring costly or unsafe online interaction, can be mastered efficiently through imagination. It validates the offline world model paradigm for high-stakes applications like robotics, providing a recipe for training agents safely from fixed datasets. Furthermore, the model’s ability to learn from vast unlabeled videos with minimal action-labeled data—and to generalize its learned action conditioning to entirely new environments—presents a scalable path toward building general-purpose simulators and advancing embodied AI by leveraging the wealth of video data available on the internet.

## Evolution Strategies at Scale: LLM Fine-Tuning Beyond Reinforcement Learning

Post: https://arxiviq.substack.com/p/evolution-strategies-at-scale-llm
Authors: Xin Qiu, Yulu Gan, Conor F. Hayes, Qiyao Liang, Elliot Meyerson, Babak Hodjat, Risto Miikkulainen
Paper: https://arxiv.org/abs/2509.24372
Code: https://github.com/VsonicV/es-fine-tuning-paper
Model: N/A

TL;DR
WHAT was done? This paper presents the first successful scaling of Evolution Strategies (ES), a class of black-box optimization algorithms, to fine-tune the full parameters of multi-billion parameter Large Language Models (LLMs). By developing a memory-efficient and highly parallelizable implementation, the authors directly search in the vast parameter space of models like Qwen and LLaMA, bypassing the need for backpropagation entirely.
WHY it matters? The results challenge the current dominance of Reinforcement Learning (RL) methods like PPO for LLM alignment. The scaled ES approach is shown to outperform state-of-the-art RL techniques in several critical dimensions: it is significantly more sample-efficient (often requiring <20% of the data), more robust across different base models, less prone to “reward hacking,” and produces more stable, consistent results across runs. This work opens a promising new direction for LLM fine-tuning that is simpler, more efficient, and potentially better suited for tasks with sparse, long-horizon rewards.

## Recursive Self-Aggregation Unlocks Deep Thinking in Large Language Models

Post: https://arxiviq.substack.com/p/recursive-self-aggregation-unlocks
Authors: Siddarth Venkatraman, Vineet Jain, Sarthak Mittal, Vedant Shah, Johan Obando-Ceron, Yoshua Bengio, Guillaume Lajoie, Glen Berseth, Brian R. Bartoldson, Bhavya Kailkhura, Nikolay Malkin, Moksh Jain
Paper: https://arxiv.org/abs/2509.26626
Code: https://github.com/HyperPotatoNeo/RSA
Model: N/A

TL;DR
WHAT was done? The paper introduces Recursive Self-Aggregation (RSA), a novel test-time scaling method that treats LLM reasoning as an evolutionary process. Instead of refining a single solution or simply picking the best from a batch, RSA maintains a diverse population of candidate reasoning chains. Over multiple sequential steps, it directs the LLM to aggregate random subsets of this population, recursively generating improved solutions by cross-referencing and recombining useful intermediate steps. This hybrid approach combines the breadth of parallel exploration with the depth of sequential refinement. The authors also propose an “aggregation-aware” reinforcement learning (RL) strategy to explicitly train the LLM for this aggregation task, mitigating performance degradation that occurs with standard RL fine-tuning.
WHY it matters? RSA provides a powerful and general mechanism to significantly boost LLM reasoning capabilities without altering model parameters or requiring external verifiers. The key impact is that it allows smaller, more accessible models (e.g., a 4B parameter model) to achieve performance competitive with or even superior to much larger, specialized reasoning models on challenging tasks. This suggests that algorithmic efficiency at inference time is a viable and potent scaling vector, offering an alternative to ever-increasing pre-training compute. Furthermore, the success of aggregation-aware RL highlights a crucial insight: to maximize the potential of advanced inference strategies, LLM training objectives must be co-designed to align with them.

## Thoughtbubbles: an Unsupervised Method for Parallel Thinking in Latent Space

Post: https://arxiviq.substack.com/p/thoughtbubbles-an-unsupervised-method
Authors: Houjun Liu, Shikhar Murty, Christopher D. Manning, Róbert Csordás
Paper: https://arxiv.org/abs/2510.00219
Code: https://github.com/stanfordnlp/thoughtbubbles
Model: N/A

TL;DR
WHAT was done? The paper introduces Thoughtbubbles, a novel Transformer architecture that learns to dynamically allocate parallel computation in its latent space. Instead of generating explicit text like in Chain-of-Thought, this model can “fork” (clone) or “delete” the latent residual streams of specific tokens. Tokens that require more processing form temporary “bubbles” of parallel computation within the network, which are later merged to produce a final output (Figure 1).
WHY it matters? This is the first known method to achieve adaptive, parallel thinking behavior in a completely unsupervised manner, using only the standard language modeling loss during pretraining. It shifts the paradigm of adaptive computation from explicit, serial text generation to implicit, parallel latent operations. This approach not only provides a more native and flexible way for models to “think” but also demonstrates remarkable efficiency. Empirically, Thoughtbubbles outperforms both parameter-matched and computation-matched baselines, with a 319M parameter model achieving better perplexity than a 772M standard Transformer, showcasing a new and highly effective path for scaling model reasoning capabilities.

## Rethinking Thinking Tokens: LLMs as Improvement Operators

Post: https://arxiviq.substack.com/p/rethinking-thinking-tokens-llms-as
Authors: Lovish Madaan, Aniket Didolkar, Suchin Gururangan, John Quan, Ruan Silva, Ruslan Salakhutdinov, Manzil Zaheer, Sanjeev Arora, Anirudh Goyal
Paper: https://arxiv.org/abs/2510.01123
Code: N/A
Model: N/A

TL;DR
WHAT was done? The paper challenges the standard long chain-of-thought (CoT) approach to LLM reasoning by reframing the model as an “improvement operator.” The authors introduce two inference strategies: Sequential Refinement (SR), which iteratively improves a single solution, and Parallel-Distill-Refine (PDR), which (i) generates multiple diverse drafts in parallel, (ii) distills them into a compact, bounded summary (a “workspace”), and (iii) refines a new solution conditioned on this workspace. To align training with this complex inference scheme, they propose Operator-Consistent Reinforcement Learning (RL), which fine-tunes the model on a task that mirrors the PDR process, thereby reducing the train-test mismatch.
WHY it matters? This work successfully decouples reasoning depth from context length, addressing the core drawbacks of long CoT: high latency, inflated compute costs, and vulnerability to long-context failures. The PDR method demonstrates a powerful new trade-off, converting parallel compute (which is often more readily available) into higher accuracy at a lower latency. On the AIME 2024 math benchmark, PDR achieves up to an 11% absolute accuracy gain over long CoT at a matched sequential budget. This research opens up a new design space for “inference-time orchestration,” providing a practical path toward building more efficient, powerful, and scalable reasoning systems.

## The Dragon Hatchling

Post: https://arxiviq.substack.com/p/the-dragon-hatchling
Authors: Adrian Kosowski, Przemysław Uznański, Jan Chorowski, Zuzanna Stamirowska, Michał Bartoszkiewicz
Paper: https://arxiv.org/abs/2509.26507
Code: https://github.com/pathwaycom/bdh
Model: N/A

TL;DR
WHAT was done? The paper introduces ‘Dragon Hatchling’ (BDH), a novel Large Language Model architecture designed as a “missing link” between tensor-based Transformers and distributed graph models of the brain. BDH’s dynamics are not defined by matrix operations but by a local, biologically plausible “edge-reweighting kernel” that combines modus ponens -like inference with Hebbian learning. Its GPU-friendly variant, BDH-GPU, is a state-space model that scales primarily in a single, high neuronal dimension ( n ). It uses linear attention in this large space and a unique ReLU-lowrank feed-forward block, ensuring all neuron activations are sparse and positive.
WHY it matters? This work offers a concrete architectural path toward “Axiomatic AI”—models whose behavior is more foreseeable and generalizable, especially for long-horizon reasoning. While achieving performance competitive with the GPT-2 architecture, BDH-GPU naturally exhibits highly desirable properties often absent in standard Transformers:
Emergent Structure: Its parameters spontaneously develop modular, scale-free network structures, mirroring efficient biological systems.
Inherent Interpretability: The model’s state is localized on individual neuron-neuron links (”synapses”), leading to empirically verified “monosemantic synapses” that selectively activate for specific abstract concepts.
Novel Engineering: Its uniform scaling facilitates new forms of model engineering, like directly merging separately trained models by concatenating their parameters. This provides a powerful micro-foundational framework for understanding how high-level reasoning can emerge from simple, local interactions.

## Explore-Execute Chain: Towards an Efficient Structured Reasoning Paradigm

Post: https://arxiviq.substack.com/p/explore-execute-chain-towards-an
Authors: Kaisen Yang, Lixuan He, Rushi Shah, Kaicheng Yang, Qinwei Ma, Dianbo Liu, Alex Lamb
Paper: https://arxiv.org/abs/2509.23946
Code: https://github.com/yks23/Explore-Execute-Chain
Model: N/A

TL;DR
WHAT was done? The paper introduces the Explore-Execute Chain (E 2 C), a structured reasoning framework that decouples Large Language Model (LLM) reasoning into two distinct phases: a stochastic, high-level “Exploration” for generating concise plans, and a deterministic “Execution” for carrying out a selected plan. This paradigm is instilled via a two-stage training process combining Supervised Fine-Tuning (SFT) with a novel causal data generation algorithm to ensure plan adherence, followed by Reinforcement Learning (RL) with token-specific reward scaling to prioritize high-level planning.
WHY it matters? This separation of concerns leads to dramatic improvements in computational efficiency and interpretability. At test time, E 2 C can sample multiple cheap exploration plans and execute only the most promising one, achieving state-of-the-art accuracy (58.1% on AIME’2024) using less than 10% of the decoding tokens required by comparable methods like Forest-of-Thought. Furthermore, its “Exploration-Focused SFT” allows for highly data-efficient domain adaptation, improving accuracy on medical benchmarks by up to 14.5% with only 3.5% of the training tokens of standard SFT. E 2 C represents a significant step towards more scalable, transparent, and controllable AI reasoning.

## Towards General Agentic Intelligence via Environment Scaling

Post: https://arxiviq.substack.com/p/towards-general-agentic-intelligence
Authors: Runnan Fang, Shihao Cai, Baixuan Li, Jialong Wu, Guangyu Li, Wenbiao Yin, Xinyu Wang, Xiaobin Wang, Liangcai Su, Zhen Zhang, Shibin Wu, Zhengwei Tao, Yong Jiang, Pengjun Xie, Fei Huang, Jingren Zhou
Paper: https://arxiv.org/abs/2509.13311
Code: https://github.com/Alibaba-NLP/DeepResearch
Model: N/A

TL;DR
WHAT was done? The paper introduces a principled framework for developing advanced AI agents by tackling the core problem of data scarcity. The authors developed a pipeline that automatically constructs diverse, fully simulated, and verifiable environments where agents can interact with tools. This process involves modeling tool dependencies as a graph, programmatically materializing tools as executable code that operates on database-like states, and generating high-fidelity interaction data. This data is then used to train a family of models, named AgentScaler, through a novel two-phase fine-tuning strategy that first builds fundamental tool-use skills and then specializes them for specific domains.
WHY it matters? This work addresses a fundamental bottleneck in agentic AI: the lack of scalable and realistic training environments. By automating the creation of verifiable interaction data, it provides a robust and cost-effective alternative to manual data collection or less reliable simulation methods. The results are significant: the AgentScaler models achieve state-of-the-art performance among open-source competitors, with smaller models (e.g., 4B parameters) performing on par with much larger 30B models. This demonstrates that advanced agentic capabilities can be efficiently trained, making powerful, reliable AI agents more practical and accessible for real-world deployment, especially in resource-constrained scenarios.

## Towards a Physics Foundation Model

Post: https://arxiviq.substack.com/p/towards-a-physics-foundation-model
Authors: Florian Wiesner, Matthias Wessling, Stephen Baek
Paper: https://arxiv.org/abs/2509.13805
Code: https://github.com/FloWsnr/General-Physics-Transformer
Model: N/A

TL;DR
WHAT was done? The authors introduce the General Physics Transformer (GPhyT), a large-scale transformer model trained on a diverse 1.8 TB corpus of simulation data. GPhyT employs a novel hybrid architecture, acting as a “neural differentiator” that learns the temporal derivative of a physical system, which is then advanced in time by a standard numerical integrator. This approach allows a single, pre-trained model to simulate a wide range of disparate physical systems—from incompressible flows and thermal convection to shock waves and multi-phase dynamics—without being explicitly provided with the underlying governing equations.
WHY it matters? This work marks a significant step towards a “train once, deploy anywhere” Physics Foundation Model (PFM), a paradigm previously exclusive to domains like natural language processing. By demonstrating that a model can infer governing dynamics purely from context, GPhyT achieves true zero-shot generalization to entirely new physical systems and boundary conditions. It not only outperforms specialized architectures by up to 29x on known tasks but also maintains stable, physically plausible predictions in long-term rollouts. This research establishes that learning generalizable physical principles from data alone is feasible, opening a path to a universal physics engine that could democratize high-fidelity simulations and accelerate scientific discovery.

## Internalizing Self-Consistency in Language Models: Multi-Agent Consensus Alignment

Post: https://arxiviq.substack.com/p/internalizing-self-consistency-in
Authors: Ankur Samanta, Akshayaa Magesh, Youliang Yu, Runzhe Wu, Ayush Jain, Daniel Jiang, Boris Vidolov, Paul Sajda, Yonathan Efroni, Kaveh Hassani
Paper: https://arxiv.org/abs/2509.15172
Code: N/A
Model: N/A

TL;DR
WHAT was done? The paper introduces Multi-Agent Consensus Alignment (MACA), a self-supervised reinforcement learning framework that post-trains language models (LMs) to be more consistent reasoners. Instead of relying on human feedback, MACA engages multiple clones of an LM in an iterative debate to solve problems. The framework then uses the debate’s outcomes—specifically, the majority consensus—to create preference data. Trajectories leading to the consensus answer are marked as “preferred,” while dissenting ones are “not preferred.” This self-generated data is then used to fine-tune the model using preference optimization methods like DPO and KTO, teaching it to favor reasoning paths that align with its own internal consensus.
WHY it matters? This work marks a significant shift from superficial, inference-time fixes for LM inconsistency to a method that instills self-consistency as a core, intrinsic property of the model. By enabling models to supervise themselves, MACA offers a highly scalable and cost-effective alternative to human annotation. The results are impressive: not only does it dramatically improve self-consistency (+27.6% on GSM8K) and reasoning accuracy across single-agent (+23.7% on MATH) and multi-agent (+42.7% on MathQA) settings, but the learned skill generalizes remarkably well to entirely new domains (+16.3% on GPQA). This suggests that self-consistency is a foundational and transferable reasoning capability, and that LMs can autonomously unlock their own latent potential through internal deliberation.

## ShinkaEvolve: Towards Open-Ended And Sample-Efficient Program Evolution

Post: https://arxiviq.substack.com/p/shinkaevolve-towards-open-ended-and
Authors: Robert Tjarko Lange, Yuki Imajuku and Edoardo Cetin
Paper: https://arxiv.org/abs/2509.19349
Code: https://github.com/SakanaAI/ShinkaEvolve
Model: N/A

TL;DR
WHAT was done? The paper introduces ShinkaEvolve, a new open-source framework that uses large language models (LLMs) for evolutionary program synthesis and scientific discovery. It addresses the critical issue of sample inefficiency in existing methods by incorporating three key algorithmic innovations: 1) an adaptive parent sampling strategy that intelligently balances exploration and exploitation; 2) a code novelty rejection-sampling mechanism using embeddings and an LLM-as-judge to prune redundant program variants; and 3) a bandit-based LLM ensemble selector that dynamically prioritizes models based on their historical performance.
WHY it matters? ShinkaEvolve marks a significant step towards making AI-driven algorithmic discovery practical and accessible. By achieving state-of-the-art results with orders of magnitude fewer evaluations than previous methods, it dramatically lowers the computational and economic barriers to entry. This efficiency is demonstrated across diverse and challenging domains, including discovering a new state-of-the-art algorithm for circle packing with only 150 samples, designing high-performing agent scaffolds for mathematical reasoning, improving competitive programming solutions, and even discovering a novel load balancing loss function for Mixture-of-Experts (MoE) models. Its open-source release further democratizes these powerful tools, enabling broader community engagement in automated scientific discovery.

## Parallel-R1: Towards Parallel Thinking via Reinforcement Learning

Post: https://arxiviq.substack.com/p/parallel-r1-towards-parallel-thinking
Authors: Tong Zheng, Hongming Zhang, Wenhao Yu, Xiaoyang Wang, Runpeng Dai, Rui Liu, Huiwen Bao, Chengsong Huang, Heng Huang, Dong Yu
Paper: https://arxiv.org/abs/2509.07980
Code: https://github.com/zhengkid/Parallel-R1
Model: N/A

TL;DR
WHAT was done? The paper introduces Parallel-R1, the first reinforcement learning (RL) framework designed to teach large language models to perform parallel thinking for complex mathematical reasoning tasks. To overcome the “cold-start” problem where models have no prior parallel thinking ability, the authors devised a progressive curriculum: it begins with Supervised Fine-Tuning (SFT) on easily-generated data from simple tasks to teach the basic format, then transitions to RL for exploration and generalization on more difficult problems. The framework incorporates a dedicated reward design, notably an alternating reward schedule that balances task accuracy with the explicit use of parallel structures.
WHY it matters? This work moves beyond superficial pattern-matching from SFT and costly test-time strategies to permanently instill an adaptive, complex reasoning skill within the model itself. The study reveals two profound insights: 1) The model’s reasoning strategy naturally evolves during training from early-stage computational exploration to late-stage multi-perspective verification. 2) Parallel thinking can serve as a mid-training exploration scaffold; a temporary, forced-exploration phase unlocks a significantly higher performance ceiling in the final model, suggesting a new paradigm for improving RL training. Ultimately, this research provides a potential blueprint for teaching AI more general cognitive strategies, moving beyond single-path computation towards models that can deliberate, self-critique, and synthesize multiple viewpoints to arrive at more robust conclusions.
Note: It’s interesting that the method reminiscents a bit the parallel scaling from the “One extinction scenario” in the latest Eliezer Yudkowsky & Nate Soares book.

## Memory Decoder: A Pretrained, Plug-and-Play Memory for Large Language Models

Post: https://arxiviq.substack.com/p/memory-decoder-a-pretrained-plug
Authors: Jiaqi Cao, Jiarui Wang, Rubin Wei, Qipeng Guo, Kai Chen, Bowen Zhou, Zhouhan Lin
Paper: https://arxiv.org/abs/2508.09874
Code: N/A
Model: N/A

TL;DR
WHAT was done? The authors introduce Memory Decoder (MemDec), a small, pretrained transformer decoder that functions as a plug-and-play memory module for Large Language Models (LLMs). Instead of performing costly, real-time retrieval from external databases (like RAG), MemDec is trained to imitate the output probability distributions of a non-parametric k-nearest neighbor (kNN) retriever on a domain-specific corpus. During inference, it runs in parallel with a base LLM, and their output distributions are simply interpolated, enhancing the LLM’s domain knowledge without altering its original parameters.
WHY it matters? This work presents a novel and highly practical paradigm for LLM domain adaptation that sidesteps the major drawbacks of existing methods. It avoids the catastrophic forgetting and high computational cost of Domain Adaptive Pretraining (DAPT) and eliminates the significant inference latency of Retrieval-Augmented Generation (RAG). A single, compact MemDec can be reused across an entire family of LLMs of varying sizes, dramatically reducing the resources needed for specialization. This modular approach makes developing and deploying powerful, domain-specific LLMs more efficient, scalable, and accessible for real-world applications in fields like finance, law, and biomedicine.

## What Characterizes Effective Reasoning? Revisiting Length, Review, and Structure of CoT

Post: https://arxiviq.substack.com/p/what-characterizes-effective-reasoning
Authors: Yunzhen Feng, Julia Kempe, Cheng Zhang, Parag Jain, Anthony Hartshorn
Paper: https://arxiv.org/abs/2509.19284
Code: N/A
Model: N/A

TL;DR
WHAT was done? The authors conduct a systematic re-examination of what makes Chain-of-Thought (CoT) reasoning effective across ten large reasoning models. They challenge the “longer-is-better” narrative by showing that shorter CoTs and less review are generally associated with higher accuracy. The core contribution is the introduction of a novel structural metric, the Failed-Step Fraction (FSF), which is the proportion of steps in abandoned reasoning branches. This metric is derived from a new, simplified method for extracting a reasoning graph directly from a CoT trace.
WHY it matters? This work fundamentally shifts the focus from the quantity of reasoning (more tokens) to its structural quality. FSF consistently outpredicts traditional metrics for correctness. Crucially, the authors provide strong causal evidence for its importance: 1) test-time selection using FSF yields significant accuracy gains (up to 13%), and 2) editing CoTs to remove failed branches improves accuracy on incorrect traces by 8-14%. This latter finding suggests that current models don’t fully “unsee” their mistakes; the presence of a failed path appears to poison subsequent reasoning. The paper makes a compelling case that future efforts should prioritize structure-aware scaling and context control over indiscriminate generation.

## Why Johnny Can't Use Agents: Industry Aspirations vs. User Realities with AI Agent Software

Post: https://arxiviq.substack.com/p/why-johnny-cant-use-agents-industry
Authors: Pradyumna Shome, Sashreek Krishnan, Sauvik Das
Paper: https://arxiv.org/abs/2509.14528
Code: N/A
Model: N/A

TL;DR
WHAT was done? This paper presents a two-part study on the practical usability of commercial AI agents. First, the authors systematically reviewed 102 marketed AI agent products to build a taxonomy of their advertised capabilities, categorizing them into three core functions: Orchestration (manipulating software), Creation (generating structured documents), and Insight (synthesizing information). Second, they conducted a think-aloud usability study where 31 participants used two popular commercial agents, Manus and Operator, to complete tasks representative of these categories.
WHY it matters? The study reveals a critical paradox: while users were generally impressed with the agents' capabilities and achieved high System Usability Scale (SUS) scores, they still encountered five fundamental barriers to effective collaboration. These include misaligned mental models, agents presuming trust without demonstrating competence, inflexible collaboration styles, overwhelming communication overhead, and a lack of agent "metacognition" (i.e., self-awareness of limitations). This research provides a crucial, empirically-grounded perspective that shifts the conversation about AI agents from pure technical performance to the nuanced, human-centered interaction challenges that must be overcome. It offers an actionable roadmap for designing agents that can transition from being "talented lone wolf mercenaries" to true collaborative partners.

## Imagined Autocurricula

Post: https://arxiviq.substack.com/p/imagined-autocurricula
Authors: Ahmet H. Güzel, Tim Rocktäschel, Matthew T. Jackson, Jarek L. Liesen, Ilija Bogunovic, Jakob N. Foerster, Jack Parker-Holder
Paper: https://arxiv.org/abs/2509.13341
Code: Not available
Model: Not available

TL;DR
WHAT was done? The paper introduces Imagined Autocurricula (IMAC), a novel framework for training reinforcement learning agents from offline data. The method first trains a diffusion-based world model on a diverse, pre-collected dataset. This world model is then used to generate "imagined" environments for the agent to train in. Crucially, instead of using these imagined rollouts randomly, IMAC employs Prioritized Level Replay (PLR) to create an automatic curriculum. The system prioritizes training on imagined scenarios that exhibit high temporal difference (TD) errors, effectively focusing the agent on experiences with the greatest learning potential.
WHY it matters? This work matters because it provides a crucial blueprint for how to effectively use the powerful "foundation world models" that are beginning to emerge. While teams are building models that can simulate worlds from internet data, a key open question has been how to train an agent inside them without wasting immense computation on useless scenarios. IMAC provides an answer: let the agent guide its own learning. This self-curated curriculum is the missing link that could turn these massive, static world models into dynamic, open-ended training grounds, paving the way for agents that learn continually and generalize far beyond what we've seen before.

## Pre-training under infinite compute

Post: https://arxiviq.substack.com/p/pre-training-under-infinite-compute
Authors: Konwoo Kim, Suhas Kotha, Percy Liang, Tatsunori Hashimoto
Paper: https://arxiv.org/abs/2509.14786
Code: https://github.com/marin-community/marin/tree/suhas/data-efficiency
Model: N/A

TL;DR
WHAT was done? This paper re-evaluates language model pre-training for a future where compute is effectively unlimited but high-quality data is scarce. The authors show that standard recipes (scaling parameters or epochs) inevitably overfit in this regime. They propose a new evaluation framework based on the asymptote of scaling laws —the best possible performance a method can achieve with infinite compute. Through extensive experiments, they find that two classical techniques, when properly optimized, yield superior asymptotes: (1) Aggressive regularization, with weight decay up to 30x higher than standard practice, which enables monotonic loss decrease with model size, and (2) Ensembling independently trained models, which achieves a fundamentally lower loss asymptote than scaling a single model. Their best "joint scaling recipe" combines both, achieving a 5.17x data efficiency improvement. Finally, they demonstrate these gains can be distilled into smaller, inference-efficient models, with self-distillation surprisingly allowing a model to outperform its identical teacher.
WHY it matters? This work provides a crucial roadmap for the next phase of LLM development, where progress will be constrained by data, not compute. It challenges the "bigger-is-better" philosophy for single models, demonstrating that algorithmic improvements can unlock significant performance and data efficiency. The proposed asymptote-based evaluation offers a more robust metric for comparing training strategies in a compute-abundant world. The findings suggest that investing compute in training ensembles and then distilling them into smaller models is a more effective strategy than training a single monolithic model. The surprising success of self-distillation also provides a powerful, data-driven method for synthetic data augmentation, offering a path to better leverage existing datasets.

## LLM-JEPA: Large Language Models Meet Joint Embedding Predictive Architectures

Post: https://arxiviq.substack.com/p/llm-jepa-large-language-models-meet
Authors: Hai Huang, Yann LeCun, Randall Balestriero
Paper: https://arxiv.org/abs/2509.14252
Code: https://github.com/rbalestr-lab/llm-jepa
Model: N/A

TL;DR
WHAT was done? The authors introduce LLM-JEPA, a novel training objective that integrates Joint Embedding Predictive Architectures (JEPAs)—a highly successful paradigm from computer vision—into the training of Large Language Models (LLMs). This hybrid approach complements the standard next-token prediction loss with a JEPA objective that learns to predict the embedding of one "view" of data (e.g., a code snippet) from another related view (e.g., its natural language description). Being able to obtain non-trivial views like this is crucial to the success of JEPA objectives.
WHY it matters? This work successfully bridges a long-standing gap between training methodologies in vision and language. By moving beyond purely input-space reconstruction, LLM-JEPA enables models to learn richer, more structured, and abstract representations. The empirical results are compelling: LLM-JEPA significantly boosts performance across various models and tasks, improves robustness to overfitting, and accelerates convergence in parameter-efficient fine-tuning (PEFT). It represents a promising new direction for developing more capable and efficient LLMs.
Note: see also other posts related to the JEPA architecture: JEPA for time-series, video V-JEPA and V-JEPA 2.

## Scaling Agents via Continual Pre-training

Post: https://arxiviq.substack.com/p/scaling-agents-via-continual-pre
Authors: Liangcai Su, Zhen Zhang, Guangyu Li, Zhuo Chen, Chenxi Wang, Maojia Song, Xinyu Wang, Kuan Li, Jialong Wu, Xuanzhong Chen, Zile Qiao, Zhongwang Zhang, Huifeng Yin, Shihao Cai, Runnan Fang, Zhengwei Tao, Wenbiao Yin, Chenxiong Qian, Yong Jiang, Pengjun Xie, Fei Huang, Jingren Zhou
Paper: https://arxiv.org/abs/2509.13310
Code: https://github.com/Alibaba-NLP/DeepResearch
Model: N/A

TL;DR
WHAT was done? This paper, from Alibaba Group, introduces "Agentic Continual Pre-training" (Agentic CPT), a novel intermediate training stage positioned between standard pre-training and task-specific fine-tuning. This new layer is designed to build powerful "agentic foundation models" pre-aligned with core agent behaviors like multi-step reasoning and tool use. To fuel this process, the authors developed two scalable, offline data synthesis methods: First-order Action Synthesis (FAS) for generating planning and reasoning data without external API calls, and Higher-order Action Synthesis (HAS) for remodeling suboptimal trajectories into rich, multi-step decision-making problems. These methods are integrated into a progressive two-stage training strategy, culminating in the AgentFounder-30B model.
WHY it matters? This work provides a concrete recipe for addressing a fundamental bottleneck in agent development: post-training methods on general-purpose models struggle to simultaneously teach complex agentic capabilities and align them with expert demonstrations, creating an "optimization tension." By embedding agentic skills at a foundational level, Agentic CPT makes subsequent fine-tuning more efficient and effective, as evidenced by significantly lower SFT loss. The resulting AgentFounder model establishes a new state-of-the-art across 10 demanding benchmarks, outperforming strong open-source and even commercial deep research agents. This research charts a more robust and scalable path toward building highly capable AI agents, helping to democratize the creation of advanced agentic systems.

## World Modeling with Probabilistic Structure Integration

Post: https://arxiviq.substack.com/p/world-modeling-with-probabilistic
Authors: Klemen Kotar, Wanhee Lee, Rahul Venkatesh, Honglin Chen, Daniel Bear, Jared Watrous, Simon Kim, Khai Loong Aw, Lilian Naing Chen, Stefan Stojanov, Kevin Feigelis, Imran Thobani, Alex Durango, Khaled Jedoui, Atlas Kazemian, Dan Yamins
Paper: https://arxiv.org/abs/2509.09737
Code: Not available
Model: Not available

TL;DR
WHAT was done? The authors introduce Probabilistic Structure Integration (PSI), a three-step framework for building richly controllable and self-improving world models from raw video data. First, they train a probabilistic, random-access autoregressive model (Ψ) that functions as a scalable probabilistic graphical model of the visual world. Second, they use this model to extract fundamental "intermediate structures"—such as optical flow, depth, and object segments—in a zero-shot fashion by framing the extraction process as causal inference via structured counterfactual prompts. Third, these extracted structures are tokenized and integrated back into the model's training data as new token types, creating a virtuous cycle where the model continually expands its own control surfaces and improves its predictive capabilities without architectural changes.
WHY it matters? PSI represents a significant paradigm shift for world modeling in non-linguistic domains, moving beyond static representation learning towards the dynamic, flexible prompting and integration capabilities that define modern Large Language Models (LLMs). This creates a unified and scalable system that can be queried and controlled with high precision, bridging generative and discriminative tasks within a single model. The self-improving cycle provides a principled mechanism for an AI to bootstrap a hierarchical understanding of the world—from pixels to motion to physics—autonomously. This work offers a compelling blueprint for developing more general, physics-aware AI with the potential to power the next generation of robotics and embodied agents.
Figure 1: Probabilistic Structure Integration.

## DINOv3

Post: https://arxiviq.substack.com/p/dinov3
Authors: Oriane Siméoni, Huy V. Vo, Vasil Khalidov, Maximilian Seitzer, Federico Baldassarre, Maxime Oquab, Cijo Jose, Marc Szafraniec, Seungeun Yi, Michaël Ramamonjisoa, Francisco Massa, Daniel Haziza, Luca Wehrstedt, Jianyuan Wang, Timothée Darcet, Théo Moutakanni, Leonel Sentana, Claire Roberts, Andrea Vedaldi, Jamie Tolan, John Brandt, Camille Couprie, Julien Mairal, Hervé Jégou, Patrick Labatut, Piotr Bojanowski
Paper: https://arxiv.org/abs/2508.10104
Code: N/A
Model: N/A

TL;DR
WHAT was done? The paper introduces DINOv3, a 7-billion parameter vision foundation model trained entirely with self-supervised learning (SSL). The authors tackle a critical bottleneck in scaling SSL: the degradation of dense feature maps during long training schedules. Their key innovation is "Gram anchoring," a novel regularization technique that enforces patch-level consistency by aligning the Gram matrix of the model's features with that of an earlier, more stable version of itself. This is combined with a meticulous data curation pipeline on 1.7 billion images, an improved ViT architecture using Rotary Positional Embeddings (RoPE), and a suite of post-hoc strategies including high-resolution adaptation and efficient multi-student distillation.
WHY it matters? DINOv3 marks a significant milestone where a single, frozen self-supervised backbone can serve as a universal visual encoder, achieving state-of-the-art performance across an unprecedented range of dense and global vision tasks—from semantic segmentation and 3D correspondence to object detection and image classification—without requiring task-specific fine-tuning. By solving the dense feature degradation problem, DINOv3 unlocks the full potential of scaling SSL, delivering exceptionally clean and robust features that outperform specialized supervised and weakly-supervised models. This work advances the "train once, apply everywhere" paradigm for computer vision, radically simplifying downstream development and setting a new standard for versatile, general-purpose vision AI.

## Virtual Agent Economies

Post: https://arxiviq.substack.com/p/virtual-agent-economies
Authors: Nenad Tomašev, Matija Franklin, Joel Z. Leibo, Julian Jacobs, William A. Cunningham, Iason Gabriel, and Simon Osindero
Paper: https://arxiv.org/abs/2509.10147
Code: N/A
Model: N/A

TL;DR
WHAT was done? The paper proposes a conceptual framework called the "sandbox economy" to analyze the emergent economic layer of autonomous AI agents. This framework characterizes agent economies along two key dimensions: their origins (intentional vs. emergent) and their permeability (the degree of interaction with the human economy). The authors argue for proactively architecting these economies rather than allowing their spontaneous and potentially risky emergence. They outline a blueprint for creating steerable agent markets using three main pillars: 1) Market mechanisms, such as auctions inspired by Ronald Dworkin's distributive justice principles, for fair resource allocation and preference alignment; 2) The design of "mission economies" to coordinate agents towards collective societal goals; and 3) A robust socio-technical infrastructure leveraging Verifiable Credentials (VCs), Decentralized Identifiers (DIDs), Proof-of-Personhood (PoP), and hybrid AI-human oversight systems to ensure trust, safety, and accountability.
WHY it matters? The current trajectory of rapid AI agent development points towards the accidental emergence of a vast, highly permeable global economy operating at scales and speeds beyond human oversight. This poses significant systemic risks, including financial instability crystallized in the concept of High-Frequency Negotiation (HFN), and the potential to dramatically exacerbate inequality as users with more capable agents gain significant advantages. This paper shifts the research paradigm from simply observing emergent AI behavior to actively designing the economic and governance systems in which agents will operate. By embedding societal objectives like fairness and collective well-being into the foundational infrastructure of agent-to-agent transactions, this work provides a crucial roadmap for steering this powerful technological shift towards long-term human flourishing, rather than risking a future of unintended and potentially harmful economic consequences.
ArXivIQ is a reader-supported publication. To receive new posts and support my work, consider becoming a free or paid subscriber.

## Jet-Nemotron: Efficient Language Model with Post Neural Architecture Search

Post: https://arxiviq.substack.com/p/jet-nemotron-efficient-language-model
Authors: Yuxian Gu, Qinghao Hu, Shang Yang, Haocheng Xi, Junyu Chen, Song Han, Han Cai
Paper: https://arxiv.org/abs/2508.15884
Code: https://github.com/NVlabs/Jet-Nemotron
Model: N/A

TL;DR
WHAT was done? The paper introduces Jet-Nemotron, a new family of hybrid-architecture language models that achieve state-of-the-art accuracy while being exceptionally efficient. This is enabled by a novel framework called Post Neural Architecture Search (PostNAS). Instead of costly training from scratch, PostNAS starts with a pre-trained full-attention model, freezes its MLP weights, and then systematically searches for the optimal attention architecture. This four-step process includes: (1) learning the best placement for a few crucial full-attention layers, (2) selecting the best existing linear attention block, (3) designing a new, more powerful linear attention block called JetBlock with dynamic convolutions, and (4) performing a hardware-aware search that optimizes for real-world generation throughput, not just parameter count.
WHY it matters? This work presents a significant paradigm shift in LLM architecture design. By dramatically reducing the computational cost and risk of exploration, PostNAS democratizes architectural innovation, making it accessible beyond the largest research labs. The resulting Jet-Nemotron models resolve the typical trade-off between accuracy and efficiency; for instance, Jet-Nemotron-2B matches or surpasses leading models like Qwen3 ( paper ) and Llama 3 ( paper ) on key benchmarks while delivering up to a 53.6x decoding speedup. This focus on hardware-aware optimization and the finding that KV cache size is more critical than parameter count for throughput provides a practical blueprint for building the next generation of powerful, deployable, and cost-effective language models.

## Temporal depth in a coherent self and in depersonalization: theoretical model

Post: https://arxiviq.substack.com/p/temporal-depth-in-a-coherent-self
Authors: Alexey Tolchinsky, Michael Levin, Chris Fields, Lancelot Da Costa, Rachael Murphy, Daniel Friedman, and David Pincus
Paper: https://doi.org/10.3389/fpsyg.2025.1585315
Code: N/A
Model: N/A

TL;DR
WHAT was done? The authors propose an integrated theoretical model for dissociative experiences, such as depersonalization and Dissociative Identity Disorder (DID). This framework unifies concepts from first-principles theories like the Technological Approach to Mind Everywhere (TAME) and the Free Energy Principle (FEP), with nonlinear dynamical systems and clinical neuroscience. The central and novel hypothesis is that a "collapse of temporal depth"—an agent's ability to plan into the future and recall the past—is a common and causal factor in the onset of dissociation, regardless of its specific trigger. The Self is modeled as a hierarchical generative model whose health corresponds to a stable "point attractor" landscape, while dissociative states are represented by fragmented, "multistable" attractor landscapes.
WHY it matters? This work moves beyond the currently fragmented landscape of theories on dissociation by offering a powerful, unifying mechanism. It provides a new, computationally grounded parameter ("temporal depth") that could inform future diagnostic and therapeutic strategies. For AI research, it offers a rich, biologically-inspired blueprint for understanding complex failure modes in intelligent agents, particularly in areas like robust planning, self-modeling, and contextual coherence. The model frames psychopathology in the language of dynamical systems—phase transitions, attractors, and stability—providing a valuable lens for designing more resilient and self-aware AI.

## A Survey of Reinforcement Learning for Large Reasoning Models

Post: https://arxiviq.substack.com/p/a-survey-of-reinforcement-learning
Authors: Kaiyan Zhang, Yuxin Zuo, Bingxiang He, Youbang Sun, Runze Liu, Che Jiang, Yuchen Fan, Kai Tian, Guoli Jia, Pengfei Li, Yu Fu, Xingtai Lv, Yuchen Zhang, Sihang Zeng, Shang Qu, Haozhan Li, Shijie Wang, Yuru Wang, Xinwei Long, Fangfu Liu, Xiang Xu, Jiaze Ma, Xuekai Zhu, Ermo Hua, Yihao Liu, Zonglin Li, Huayu Chen, Xiaoye Qu, Yafu Li, Weize Chen, Zhenzhao Yuan, Junqi Gao, Dong Li, Zhiyuan Ma, Ganqu Cui, Zhiyuan Liu, Biqing Qi, Ning Ding, Bowen Zhou
Paper: https://arxiv.org/abs/2509.08827
Code: https://github.com/TsinghuaC3I/Awesome-RL-for-LRMs
Model: N/A

TL;DR
WHAT was done? This paper provides a comprehensive and systematic survey of Reinforcement Learning (RL) as a foundational methodology for transforming Large Language Models (LLMs) into Large Reasoning Models (LRMs). It charts the field's evolution from using RL for human alignment (e.g., RLHF, DPO) to leveraging it to directly incentivize and scale complex reasoning capabilities. The survey meticulously reviews the core pillars of this new paradigm: foundational components like reward design and policy optimization, critical unresolved problems such as the "sharpening vs. discovery" debate, the ecosystem of training resources including datasets and dynamic environments, and a wide array of downstream applications from coding to robotics.
WHY it matters? This work is crucial because it consolidates the scattered progress in a rapidly evolving field and frames RL as a new, critical scaling axis for AI capabilities, complementary to traditional pre-training. By enabling models to learn from verifiable outcomes and self-generated data, RL offers a path to overcoming data annotation bottlenecks and fostering more robust, generalizable reasoning. For researchers and practitioners, this survey serves as an essential roadmap, clarifying the state of the art, highlighting key intellectual debates, and outlining a clear vision for future research aimed at achieving Artificial SuperIntelligence (ASI) through more capable and autonomous reasoning systems.

## SpikingBrain Technical Report: Spiking Brain-inspired Large Models

Post: https://arxiviq.substack.com/p/spikingbrain-technical-report-spiking
Authors: Yuqi Pan, Yupeng Feng, Jinghao Zhuang, Siyu Ding, Zehao Liu, Bohan Sun, Yuhong Chou, Han Xu, Xuerui Qiu, Anlin Deng, Anjie Hu, Peng Zhou, Man Yao, Jibin Wu, Jian Yang, Guoliang Sun, Bo Xu, Guoqi Li
Paper: https://arxiv.org/abs/2509.05276
Code: https://github.com/BICLab/SpikingBrain-7B
Model: N/A

TL;DR
WHAT was done? The paper introduces SpikingBrain, a comprehensive framework for developing efficient, brain-inspired Large Language Models (LLMs). The authors present two models, SpikingBrain-7B (linear) and SpikingBrain-76B (hybrid-linear MoE), which integrate three core innovations: 1) Hybrid Architectures combining linear, sliding-window, and standard attention with adaptive spiking neurons and sparse Mixture-of-Experts (MoE) to achieve near-linear complexity; 2) Efficient Conversion Training, a pipeline that adapts pre-trained Transformers using less than 2% of the typical training data; and 3) Custom System Engineering to enable stable, large-scale training and deployment on a non-NVIDIA (MetaX) GPU cluster. The framework also includes a novel spiking scheme that achieves over 69% activation sparsity for low-power, event-driven inference.
WHY it matters? This work represents a significant step towards sustainable and scalable AI by demonstrating a practical alternative to the resource-intensive paradigm of mainstream Transformers. It proves the feasibility of achieving competitive performance on non-NVIDIA hardware, a vital step in breaking vendor lock-in and fostering a more competitive AI hardware market. The reported >100x inference speedup for 4M-token sequences and substantial energy savings create a viable path for deploying powerful, long-context LLMs on resource-constrained platforms, including edge and mobile devices. By successfully integrating principles from neuroscience into a full-stack hardware and software solution, SpikingBrain provides a compelling blueprint for the next generation of energy-efficient AI and neuromorphic computing.

## K2-Think: A Parameter-Efficient Reasoning System

Post: https://arxiviq.substack.com/p/k2-think-a-parameter-efficient-reasoning
Authors: Zhoujun Cheng, Richard Fan, Shibo Hao, Taylor W. Killian, Haonan Li, Suqi Sun, Hector Ren, Alexander Moreno, Daqian Zhang, Tianjun Zhong, Yuxin Xiong, Yuanzhe Hu, Yutao Xie, Xudong Han, Yuqi Wang, Varad Pimpalkhute, Yonghao Zhuang, Aaryamonvikram Singh, Xuezhi Liang, Anze Xie, Jianshu She, Desai Fan, Chengqian Gao, Liqun Ma, Mikhail Yurochkin, John Maggs, Xuezhe Ma, Guowei He, Zhiting Hu, Zhengzhong Liu, Eric P. Xing
Paper: https://arxiv.org/abs/2509.07604
Code: * https://github.com/MBZUAI-IFM/K2-Think-SFT
Model: https://huggingface.co/LLM360/K2-Think

TL;DR
WHAT was done? The paper introduces K2-Think, a 32-billion parameter reasoning system built on the Qwen2.5 base model. It achieves frontier performance, matching or surpassing models orders of magnitude larger (like GPT-OSS 120B and DeepSeek v3.1) on complex reasoning tasks, especially in mathematics. This is accomplished not through scale, but via a synergistic, six-pillar recipe combining post-training (Long Chain-of-thought Supervised Finetuning and Reinforcement Learning with Verifiable Rewards) with advanced test-time computation (agentic "Plan-Before-You-Think", Best-of-3 sampling) and hardware optimization (speculative decoding on Cerebras Wafer-Scale Engines).
WHY it matters? K2-Think provides compelling evidence that the path to advanced AI reasoning is not solely paved with ever-larger parameter counts. It demonstrates a paradigm shift towards parameter efficiency, where a holistic, full-stack approach—from data curation and multi-stage training to intelligent inference-time computation and hardware co-design—can unlock state-of-the-art capabilities. By open-sourcing the entire system, this work democratizes access to frontier-level reasoning and offers a more sustainable and economically viable blueprint that addresses the growing challenge of inference cost, proving that smaller models can effectively "punch above their weight."
ArXivIQ is a reader-supported publication. To receive new posts and support my work, consider becoming a free or paid subscriber.

## Learning When to Plan: Efficiently Allocating Test-Time Compute for LLM Agents

Post: https://arxiviq.substack.com/p/learning-when-to-plan-efficiently
Authors: Davide Paglieri, Bartłomiej Cupiał, Jonathan Cook, Ulyana Piterbarg, Jens Tuyls, Edward Grefenstette, Jakob Nicolaus Foerster, Jack Parker-Holder, Tim Rocktäschel
Paper: https://arxiv.org/abs/2509.03581
Code: N/A
Model: N/A

TL;DR
WHAT was done? This paper challenges the prevailing "always-plan" (e.g., ReAct) and "never-plan" paradigms for LLM agents. The authors first demonstrate that there exists an optimal, task-dependent "Goldilocks" frequency for planning that outperforms these naive strategies. To enable agents to learn this behavior, they introduce a conceptual framework for dynamic planning and a two-stage training pipeline. First, a model is "primed" via Supervised Fine-Tuning (SFT) on diverse trajectories that include explicit natural language plans. Second, Reinforcement Learning (RL) is used to refine the agent's ability to decide when to allocate test-time compute for planning, optimizing a trade-off between task reward and the computational cost of generating plans.
WHY it matters? This work pioneers a learned approach to test-time compute allocation for LLM agents, moving beyond rigid heuristics and toward a form of meta-cognition—the ability to reason about one's own reasoning process. The resulting agents are more computationally efficient, adaptive, and sample-efficient. Crucially, the RL-trained agents become highly steerable, capable of following human-written plans to solve complex tasks (like completing the Crafter benchmark by mining a diamond) that are beyond their autonomous capabilities. This marks a significant step towards more practical, controllable, and collaborative agentic AI systems.

## These Are Not All the Features You Are Looking For: A Fundamental Bottleneck in Supervised Pretraining

Post: https://arxiviq.substack.com/p/these-are-not-all-the-features-you
Authors: Xingyu (Alice) Yang, Jianyu Zhang, Léon Bottou
Paper: https://arxiv.org/abs/2506.18221
Code: https://github.com/facebookresearch/richreps-timecat
Model: N/A

TL;DR
WHAT was done? The paper identifies and formalizes a fundamental limitation in deep learning called the "information saturation bottleneck." It demonstrates that during supervised pretraining on diverse data mixtures, models with an implicit sparsity bias tend to learn only a subset of features sufficient for the overall task. This leads to the permanent loss of other features that are crucial for downstream transfer, causing inconsistent performance even on sub-components of the original pretraining data. As an initial solution, the authors propose constructing "richer feature representations" by concatenating features from multiple models, each trained for a shorter duration. Their novel "TIME-CAT" method shows this approach can recover the lost features and significantly improve generalization, all while maintaining the original pretraining computational budget.
WHY it matters? This work directly challenges the prevailing "bigger is better" paradigm in foundation models, providing a compelling explanation for why simply scaling up models and data does not guarantee comprehensive feature learning or robust generalization. It suggests that the very optimization processes that make deep learning effective can also be a source of its brittleness. The findings shift the focus from a monolithic pursuit of scale to a more nuanced strategy of promoting feature diversity during pretraining. The proposed cost-neutral method offers a practical path toward building more capable and reliable models for transfer learning, opening a new problem space centered on efficient and complete feature acquisition.
Another interesting paper on representations is here.

## Jointly Reinforcing Diversity and Quality in Language Model Generations

Post: https://arxiviq.substack.com/p/jointly-reinforcing-diversity-and
Authors: Tianjian Li, Yiming Zhang, Ping Yu, Swarnadeep Saha, Daniel Khashabi, Jason Weston, Jack Lanchantin, Tianlu Wang
Paper: https://arxiv.org/abs/2509.02534
Code: https://github.com/facebookresearch/darling [404 at the moment]
Model: N/A

TL;DR
WHAT was done? The paper introduces Diversity-Aware Reinforcement Learning (DARLING), an online RL framework that tackles the "diversity collapse" in post-trained language models. Instead of treating quality and diversity as a trade-off, DARLING jointly optimizes for both. Its core innovation is a learned semantic classifier that measures diversity by partitioning generated responses into semantically equivalent clusters, going beyond superficial lexical differences. This diversity signal is then multiplied with a quality reward to create a unified "diversity-aware" reward, which guides the RL training process by amplifying the advantage for responses that are both high-quality and distinct.
WHY it matters? This work addresses a critical limitation of current LLMs, where fine-tuning for helpfulness often leads to repetitive and predictable outputs. The most significant finding is that explicitly optimizing for diversity doesn't just enhance creativity; it serves as a powerful mechanism for exploration that leads to higher-quality responses. In verifiable tasks like competition math, DARLING improves both solution variety ( pass@k ) and correctness ( pass@1 ). This reframes diversity from a desirable feature for creative tasks into a fundamental tool for improving robust problem-solving, demonstrating that a broader exploration of the solution space helps models discover better and more effective strategies.

## Canaries in the Coal Mine? Six Facts about the Recent Employment Effects of Artificial Intelligence

Post: https://arxiviq.substack.com/p/canaries-in-the-coal-mine-six-facts
Authors: Erik Brynjolfsson, Bharat Chandar, Ruyu Chen
Paper: https://digitaleconomy.stanford.edu/publications/canaries-in-the-coal-mine/
Code: N/A
Model: N/A

TL;DR
WHAT was done? The authors conducted a large-scale empirical study analyzing high-frequency, individual-level payroll data from ADP, the largest payroll provider in the U.S., to measure the real-world employment effects of generative AI since its widespread adoption in late 2022. By linking millions of worker records to established measures of occupational AI exposure, they systematically present six facts about recent labor market shifts. The headline finding is a significant, 13% relative decline in employment for early-career workers (ages 22-25) in the most AI-exposed occupations. The study further demonstrates that these declines are concentrated in roles where AI automates tasks rather than augments human capabilities and that the effect persists even after controlling for firm-level economic shocks.
WHY it matters? This paper provides some of the first concrete, large-scale, and near real-time evidence of generative AI's impact on the labor market, moving the conversation from speculation to empirical observation. It identifies a specific, vulnerable demographic—young, entry-level workers—as the "canaries in the coal mine," suggesting that AI's initial displacement effects are not uniform but are disproportionately affecting the newest entrants to the workforce. By distinguishing between automation and augmentation, the research offers a crucial nuance for business leaders and policymakers, highlighting that the nature of AI deployment is a key determinant of its labor market consequences. This work sets a new benchmark for data-driven analysis in this domain and provides a critical early warning for education, workforce development, and economic policy.
Note: see also a position paper from ICML 2025 about prioritizing the Future of Work

## Supporting Our AI Overlords: Redesigning Data Systems to be Agent-First

Post: https://arxiviq.substack.com/p/supporting-our-ai-overlords-redesigning
Authors: Shu Liu, Soujanya Ponnapalli, Shreya Shankar, Sepanta Zeighami, Alan Zhu, Shubham Agarwal, Ruiqi Chen, Samion Suwito, Shuo Yuan, Ion Stoica, Matei Zaharia, Alvin Cheung, Natacha Crooks, Joseph E. Gonzalez, Aditya G. Parameswaran
Paper: https://arxiv.org/abs/2509.00997
Code: Not available
Model: Not available

TL;DR
WHAT was done? The paper proposes a fundamental redesign of data systems with a new "agent-first" architecture. It identifies the emerging dominant workload from LLM agents as "agentic speculation"—a high-throughput, exploratory, redundant, and steerable process of querying data. To support this, the authors introduce novel concepts including: 1) A richer "probe" interface that supplements SQL with natural language "briefs" about agent intent and goals; 2) A "satisficing" query optimizer that provides "good enough" approximate answers to guide agents efficiently; 3) An "agentic memory store" acting as a persistent semantic cache for grounding; and 4) A "branched updates" transaction model for massive parallel "what-if" scenarios with ultra-fast rollbacks.
WHY it matters? Current data systems, built for human-driven, targeted queries, are becoming a major bottleneck for the scale and speculative nature of LLM agents. This work provides a compelling vision and a research blueprint for the next generation of data systems that act as active, collaborative partners to AI agents, rather than passive data repositories. By natively supporting agentic speculation, this new architecture could unlock significant gains in efficiency and productivity, paving the way for more sophisticated and powerful AI-driven data analysis and manipulation. It shifts the paradigm from a simple "query-answer" model to an interactive, intelligent dialogue between AI agents and the data infrastructure that supports them.

## Fisher-Orthogonal Projection Methods for Natural Gradient Descent with Large Batches

Post: https://arxiviq.substack.com/p/fisher-orthogonal-projection-methods
Authors: Yishun Lu, Wesley Armour
Paper: https://arxiv.org/abs/2508.13898
Code: N/A
Model: N/A

TL;DR
WHAT was done? The authors introduce Fisher-Orthogonal Projection (FOP), a novel second-order optimization algorithm that enhances Natural Gradient Descent (NGD) for training with extremely large mini-batches. Instead of simply averaging gradients, FOP computes gradients from two sub-batches to create an average and a difference component. The key innovation is to project the difference component to be orthogonal to the average component under the Fisher information metric. This geometry-aware, variance-controlled correction is then adaptively added to the main update, with both the mixing coefficient and the layer-wise step size dynamically adjusted to minimize local loss.
WHY it matters? FOP addresses a critical bottleneck in modern deep learning: existing optimizers struggle at the massive batch sizes enabled by modern GPUs. First-order methods like SGD/AdamW lose the stochastic noise needed for good generalization, while second-order methods like KFAC become unstable or require excessive damping that nullifies their benefits. FOP not only achieves stable and faster convergence—with speedups up to 7.5x over baselines—but it also improves generalization, reducing error rates on long-tailed datasets by 2.3-3.3%. By making second-order optimization practical, robust, and scalable in a "plug-and-play" manner, FOP provides a powerful tool for efficiently training the next generation of large-scale models.
ArXivIQ is a reader-supported publication. To receive new posts and support my work, consider becoming a free or paid subscriber.

## Questioning Representational Optimism in Deep Learning: The Fractured Entangled Representation Hypothesis

Post: https://arxiviq.substack.com/p/questioning-representational-optimism
Authors: Akarsh Kumar, Jeff Clune, Joel Lehman, Kenneth O. Stanley
Paper: https://arxiv.org/abs/2505.11581
Code: https://github.com/akarshkumar0101/fer
Model: N/A

TL;DR
WHAT was done? The authors introduce the Fractured Entangled Representation (FER) hypothesis, challenging the assumption that better performance in AI implies better internal representations. Using Compositional Pattern Producing Networks (CPPNs) to generate images, they compare networks evolved through an open-ended search process (from Picbreeder) with networks trained via conventional stochastic gradient descent (SGD) to produce the exact same output image.
WHY it matters? The study reveals that even with pixel-identical outputs, the internal representations are radically different. The evolved networks exhibit an organized, modular Unified Factored Representation (UFR), where concepts like symmetry are learned efficiently and can be manipulated semantically. In contrast, SGD-trained networks develop a disorganized, redundant, and entangled FER. This suggests that modern AI models, despite impressive benchmark scores, might be developing "imposter intelligence" built on brittle, fractured heuristics. FER is proposed as a potential root cause for critical limitations in generalization, creativity, and continual learning, urging a shift in focus from mere output performance to the quality of a model's internal structure.

## Fantastic Pretraining Optimizers and Where to Find Them

Post: https://arxiviq.substack.com/p/fantastic-pretraining-optimizers
Authors: Kaiyue Wen, David Hall, Tengyu Ma, Percy Liang
Paper: https://arxiv.org/abs/2509.02046
Code: https://github.com/marin-community/marin/tree/kaiyue/optimizers
Model: N/A

TL;DR
What was done? The authors conduct a systematic and rigorous re-evaluation of eleven deep learning optimizers for language model pretraining. They address two common methodological flaws in prior research: unequal hyperparameter tuning and limited evaluation setups. Using a meticulous three-phase coordinate descent framework, they ensure near-optimal hyperparameters for all optimizers—including the AdamW baseline—across four model scales (0.1B to 1.2B parameters) and multiple data-to-model ratios (1-8x the Chinchilla optimum).
Why it matters? This work serves as a critical reality check for the field. It reveals that the widely claimed 1.4-2x speedups of novel optimizers over AdamW are often significantly inflated due to poorly tuned baselines. The study finds that the true speedup is much more modest, peaking at 1.4x for small models and, crucially, diminishing with scale to a mere 1.1x for 1.2B parameter models. This finding challenges the narrative of rapid progress in optimization and sets a new, higher standard for fair and robust benchmarking. It provides invaluable, sobering insights for researchers and practitioners, highlighting that for large-scale training, the race for a "better-than-AdamW" optimizer is far from over, and true gains may require new approaches designed explicitly for scalability.

## Noise Hypernetworks: Amortizing Test-Time Compute in Diffusion Models

Post: https://arxiviq.substack.com/p/noise-hypernetworks-amortizing-test
Authors: Luca Eyring, Shyamgopal Karthik, Alexey Dosovitskiy, Nataniel Ruiz, Zeynep Akata
Paper: https://arxiv.org/abs/2508.09968
Code: https://github.com/ExplainableML/HyperNoise
Model: N/A

TL;DR
WHAT was done? The authors introduce Noise Hypernetworks (HyperNoise), a novel framework that amortizes the expensive, iterative process of test-time optimization in diffusion models into a one-time post-training stage. Instead of modifying the core generative model, they train a lightweight, parameter-efficient hypernetwork (using LoRA) to predict an optimal initial noise latent for a frozen, step-distilled generator. The training relies on a theoretically grounded and computationally tractable objective formulated entirely in the noise space, which balances reward maximization with a KL-divergence regularizer (approximated as an L2 penalty on the noise modification) to maintain fidelity to the base model.
Note: a hypernetwork is a neural network that generates weights for another network. More on this in the original paper ( https://arxiv.org/abs/1609.09106 ). See also another interesting link between diffusion and hypernetworks.
WHY it matters? This work elegantly solves the critical trade-off between generation quality and inference speed. Current test-time scaling methods, while improving outputs, introduce prohibitive latency (often minutes per image), making them impractical for real-time applications. HyperNoise recovers a substantial portion of these quality gains—enhancing prompt-following, aesthetics, and composition—at a fraction of the computational cost, adding negligible inference latency (achieving 33x to 300x speedups over baselines). Furthermore, its principled noise-space regularization effectively prevents the "reward-hacking" and artifact generation that plague direct fine-tuning approaches, offering a robust and efficient path to align powerful generative models with desired objectives.

## StepWiser: Stepwise Generative Judges for Wiser Reasoning

Post: https://arxiviq.substack.com/p/stepwiser-stepwise-generative-judges
Authors: Wei Xiong, Wenting Zhao, Weizhe Yuan, Olga Golovneva, Tong Zhang, Jason Weston, Sainbayar Sukhbaatar
Paper: https://arxiv.org/abs/2508.19229
Code: Not provided, but the paper references the use of Math-Verify, the Axolotl package, and the verl library for GRPO.
Model: N/A

TL;DR
WHAT was done? The paper introduces StepWiser, a novel framework for supervising the multi-step reasoning of Large Language Models (LLMs). Instead of using a traditional "black-box" classifier to score intermediate reasoning steps, the authors train a "generative judge" that reasons about the reasoning (meta-reasons). This judge produces its own Chain-of-Thought (CoT) analysis to explain its verdict on each step's logical validity. The framework involves three key innovations: (1) a self-segmentation technique that teaches the policy model to break its reasoning into coherent "chunks-of-thought"; (2) an annotation method that assigns rewards to these chunks based on the relative progress measured by Monte Carlo rollouts; and (3) training the generative judge via online Reinforcement Learning (RL) to align its explained judgments with these reward signals.
WHY it matters? This work represents a significant paradigm shift from opaque, discriminative reward models to transparent, explainable AI critics. By forcing the judge to "show its work," StepWiser enhances the reliability and interpretability of LLM evaluation. Practically, this leads to superior performance in identifying errors, enables more robust self-correction mechanisms at inference time, and provides a higher-quality signal for selecting training data. It pushes the field towards 'wiser' AI systems that don't just execute tasks, but can introspect, self-critique, and improve their own logical processes—moving from an AI that simply knows the answer to one that understands why its reasoning is correct.

## Rethinking scale in network neuroscience: Contributions and opportunities at the nanoscale

Post: https://arxiviq.substack.com/p/rethinking-scale-in-network-neuroscience
Authors: Richard F. Betzel, Caio Seguin, and Maria Grazia Puxeddu
Paper: https://arxiv.org/abs/2508.16760
Code: N/A
Model: N/A

TL;DR
WHAT was done? This paper presents a compelling argument for shifting the focus of network neuroscience from the widely-used meso-scale (networks of brain regions) to the nanoscale (networks of individual neurons and synapses). The authors review how nanoscale connectomes, reconstructed from high-resolution electron microscopy, provide a level of biological fidelity that is absent in coarser models. At this fine-grained resolution, network nodes are individual neurons and edges are countable, directed synapses, often with rich annotations like cell type and neurotransmitter identity. This alignment with biological reality makes core network science concepts—such as paths, communities, and centrality—mechanistically interpretable and experimentally testable.
WHY it matters? This work is significant because it addresses a fundamental weakness in network neuroscience: the ambiguity and inferential nature of meso-scale brain networks. By advocating for nanoscale "ground truth" data, the paper paves the way for moving beyond abstract, correlational models towards building mechanistic, predictive, and causally verifiable models of neural computation. For AI and machine learning, this is a paradigm shift. It offers access to exceptionally rich, high-fidelity graph datasets where features are not abstract embeddings but direct biological properties. This enables the development of more powerful Graph Neural Networks, biologically constrained generative models, and ultimately, a path toward more explainable, bio-plausible AI inspired by the brain's actual wiring diagram.

## Solving the compute crisis with physics-based ASICs

Post: https://arxiviq.substack.com/p/solving-the-compute-crisis-with-physics
Authors: Maxwell Aifer, Zach Belateche, Suraj Bramhavar, Kerem Y. Camsari, Patrick J. Coles, Gavin Crooks, Douglas J. Durian, Andrea J. Liu, Anastasia Marchenkova, Antonio J. Martinez, Peter L. McMahon, Faris Sbahi, Benjamin Weiner, and Logan G. Wright
Paper: https://arxiv.org/abs/2507.10463
Code: - https://github.com/zachbe/digial-ising
Model: N/A

TL;DR
WHAT was done? The authors propose a new computing paradigm called Physics-based Application-Specific Integrated Circuits (ASICs). Instead of expending massive amounts of energy to enforce idealized digital abstractions (like statelessness, perfect determinism, and synchronized operations), this approach directly harnesses the intrinsic, and often "messy," physical dynamics of hardware for computation. By strategically relaxing these traditional constraints, the hardware is designed to operate as an exact realization of a physical process, making it exceptionally efficient for certain tasks. The paper outlines a comprehensive vision, from the fundamental principles and design strategies to a roadmap for scaling and integration into heterogeneous computing systems.
WHY it matters? This work directly confronts the "compute crisis" fueled by modern AI, which is defined by unsustainable energy consumption, prohibitive training costs, and the fast-approaching limits of conventional CMOS scaling. Physics-based ASICs offer a plausible path forward by fundamentally rethinking the relationship between software and hardware. This paradigm promises substantial gains in energy efficiency and computational throughput, potentially accelerating critical AI workloads like diffusion models, sampling, and optimization, as well as scientific simulations. Ultimately, this could help democratize access to high-performance computing and unlock new frontiers in AI that are currently bottlenecked by the brute-force approach of digital computing.

## Scalable Thermodynamic Second-order Optimization

Post: https://arxiviq.substack.com/p/scalable-thermodynamic-second-order
Authors: Kaelan Donatella, Samuel Duffield, Denis Melanson, Maxwell Aifer, Phoebe Klett, Rajath Salegame, Zach Belateche, Gavin Crooks, Antonio J. Martinez, Patrick J. Coles
Paper: https://arxiv.org/abs/2502.08603
Code: N/A
Model: N/A

TL;DR
WHAT was done? The paper introduces "Thermodynamic K-FAC," a novel algorithm that accelerates the Kronecker-Factored Approximate Curvature (K-FAC) optimizer by offloading its most computationally expensive operations—matrix inversions and linear system solves—to specialized, physics-based thermodynamic computers. This hybrid approach uses digital hardware for gradient calculations and parameter updates, while leveraging the natural relaxation dynamics of an analog system to efficiently handle the linear algebra bottlenecks.
WHY it matters? This work presents a viable path to making second-order optimization practical for training large-scale AI models. Second-order methods can converge in fewer iterations but are often too slow per iteration on digital hardware due to their cubic O(n³) complexity for matrix inversions. By leveraging thermodynamic hardware, the authors reduce this bottleneck's complexity to a more favorable O(n²κ²), where κ is the matrix condition number. This yields a linear advantage with network width n, making K-FAC's per-iteration cost competitive with first-order methods like Adam. Crucially, the approach is shown to be robust to the inherent quantization noise of analog hardware, suggesting a tangible route to overcoming the computational barriers that have long relegated powerful second-order optimizers to niche applications.

## Critiques of World Models

Post: https://arxiviq.substack.com/p/critiques-of-world-models
Authors: Eric Xing, Mingkai Deng, Jinyu Hou, Zhiting Hu
Paper: https://arxiv.org/abs/2507.05169
Code: N/A
Model: N/A

TL;DR
WHAT was done? The paper presents a comprehensive critique of prevailing approaches to building World Models (WMs), arguing that the field has become overly focused on high-fidelity video generation. It systematically dissects a popular school of thought that advocates for using only sensory data, continuous latent representations, encoder-encoder architectures (like JEPA), and latent-space objectives. As an alternative, the authors propose the Physical, Agentic, and Nested (PAN) World Model, a new architectural blueprint for general-purpose, agentic reasoning. PAN is a hierarchical generative model that integrates an enhanced LLM for high-level reasoning and a diffusion model for low-level dynamics. It operates on mixed continuous/discrete representations, is trained with an observation-grounded generative loss to prevent model collapse, and is designed to train agents via reinforcement learning in simulated environments.
WHY it matters? This work serves as a crucial course correction, shifting the goal of world modeling from simply simulating visual content to building foundational reasoning engines for AGI. It provides a principled, theoretically-backed argument for why design choices like multimodal data integration (including text), mixed representations, and observation-grounded learning are essential for creating robust, generalizable, and truly intelligent agents. The PAN framework offers a concrete and ambitious roadmap for moving beyond the limitations of current systems, paving the way for agents capable of complex, long-horizon, and human-like planning.

## Time to Embed: Unlocking Foundation Models for Time Series with Channel Descriptions

Post: https://arxiviq.substack.com/p/time-to-embed-unlocking-foundation
Authors: Utsav Dutta, Sina Khoshfetrat Pakazad, Henrik Ohlsson
Paper: https://arxiv.org/abs/2505.14543
Code: Not publicly available
Model: Not publicly available

TL;DR
WHAT was done? The paper introduces CHARM (CHannel-Aware Representation Model), a 7M-parameter foundation embedding model for multivariate time series. Its key innovation is the architectural integration of textual channel descriptions to create domain-aware representations. This is achieved through a novel Contextual Temporal Convolutional Network (TCN) and custom Contextual Attention Layers that use text to modulate inter-channel interactions and temporal dependencies. The model is trained using a Joint Embedding Predictive Architecture (JEPA), a self-supervised method that predicts latent representations of masked data segments rather than reconstructing noisy raw signals, making the learned embeddings more robust.
WHY it matters? CHARM sets a new state-of-the-art across diverse downstream tasks—forecasting, classification, and anomaly detection—often outperforming specialized models. It marks a significant shift from treating time series as undifferentiated numerical streams to understanding them through semantic context, similar to how human experts operate. This approach not only improves performance but also enhances model interpretability by revealing learned cross-channel dynamics. By successfully demonstrating a robust, transferable, and semantically grounded foundation model, CHARM paves the way for more intelligent, general-purpose AI for time series analysis.

## Seeing, Listening, Remembering, and Reasoning: A Multimodal Agent with Long-Term Memory

Post: https://arxiviq.substack.com/p/seeing-listening-remembering-and
Authors: Lin Long, Yichen He, Wentao Ye, Yiyuan Pan, Yuan Lin, Hang Li, Junbo Zhao, Wei Li
Paper: https://arxiv.org/abs/2508.09736
Code: https://github.com/bytedance-seed/m3-agent
Model: N/A

TL;DR
WHAT was done? The paper introduces M3-Agent, a novel framework for multimodal AI agents equipped with a human-like long-term memory. This agent continuously processes real-time video and audio streams to build and update two types of memory: episodic (for specific events) and semantic (for accumulated world knowledge). The memory is structured as an entity-centric, multimodal graph, enabling consistent tracking of entities like people across different modalities. The agent employs reinforcement learning (DAPO, https://arxiv.org/abs/2503.14476 ) to perform multi-turn, iterative reasoning over this memory to accomplish complex tasks. To evaluate these capabilities, the authors also developed M3-Bench, a new long-video question-answering benchmark featuring real-world videos and challenging questions focused on memory-based reasoning.
WHY it matters? This work marks a significant step toward creating more autonomous and cognitively sophisticated AI agents. By moving beyond the limitations of fixed context windows and simple retrieval, M3-Agent tackles the core challenges of continuous learning, long-term knowledge retention, and consistent reasoning in dynamic environments. While many agent frameworks use simple vector lookups for "memory," this approach often lacks consistency. M3-Agent's structured, graph-based memory actively builds relationships between entities, providing a robust foundation for next-generation applications like truly helpful household robots, advanced personal assistants, and more intuitive human-AI collaboration systems.

## Deep Think with Confidence

Post: https://arxiviq.substack.com/p/deep-think-with-confidence
Authors: Yichao Fu, Xuewei Wang, Yuandong Tian, Jiawei Zhao
Paper: https://arxiv.org/abs/2508.15260
Code: https://jiaweizzhao.github.io/deepconf
Model: N/A

TL;DR
WHAT was done? The authors introduce Deep Think with Confidence (DeepConf), a test-time inference method that enhances the reasoning capabilities of Large Language Models (LLMs). Instead of treating all generated reasoning paths equally, DeepConf leverages the model's internal log-probabilities to derive localized confidence scores. It operates in two modes: an offline mode that filters completed reasoning traces and applies confidence-weighted majority voting, and a novel online mode that dynamically terminates the generation of low-confidence traces mid-stream. This is achieved without any additional model training or complex hyperparameter tuning.
WHY it matters? This work addresses the critical challenge of high computational cost and diminishing returns in popular test-time scaling methods like self-consistency. By intelligently filtering out low-quality reasoning and enabling early stopping, DeepConf achieves state-of-the-art accuracy (e.g., 99.9% on the AIME 2025 benchmark with GPT-OSS-120B) while dramatically reducing the number of generated tokens—by up to 84.7%. This makes high-performance LLM reasoning more efficient, scalable, and economically viable, paving the way for more practical deployment in real-world applications.

## Thermodynamic Natural Gradient Descent

Post: https://arxiviq.substack.com/p/thermodynamic-natural-gradient-descent
Authors: Maxwell Aifer, Kaelan Donatella, Denis Melanson, Samuel Duffield, Gavin Crooks, Patrick J. Coles
Paper: https://arxiv.org/abs/2405.13817
Code: The experiments use the `posteriors` ( https://github.com/normal-computing/posteriors ) and `peft` ( https://github.com/huggingface/peft ) libraries.
Model: N/A

TL;DR
WHAT was done? The paper introduces Thermodynamic Natural Gradient Descent (TNGD), a novel hybrid digital-analog algorithm for training neural networks. It tackles the prohibitive computational cost of Natural Gradient Descent (NGD), a powerful second-order optimization method, by offloading the most expensive step—solving a large linear system—to a specialized analog computer called a "stochastic processing unit" (SPU). The SPU leverages physical thermodynamic processes (specifically, an Ornstein-Uhlenbeck process) to efficiently estimate the natural gradient, which is then used by a standard GPU to update the model's parameters.
WHY it matters? TNGD demonstrates that the per-iteration computational complexity of a second-order method can be reduced to be on par with first-order methods like Adam or SGD. This is a significant breakthrough because second-order methods, which use curvature information of the loss landscape, are known to have better convergence properties but have been considered impractical for large-scale AI due to their immense computational overhead on digital hardware. By co-designing the optimization algorithm with novel hardware, this work reopens the door for second-order methods in deep learning, potentially enabling faster training, better model performance, and more energy-efficient AI development.

## Covariant Gradient Descent

Post: https://arxiviq.substack.com/p/covariant-gradient-descent
Authors: Dmitry Guskov, Vitaly Vanchurin
Paper: https://arxiv.org/abs/2504.05279
Code: N/A
Model: N/A

TL;DR
WHAT was done? The authors introduce Covariant Gradient Descent (CGD), a new optimization framework that unifies popular gradient-based methods like SGD, RMSProp, and Adam into a single, cohesive structure. The core idea is to define the optimization dynamics using a "covariant force vector" and a "covariant metric tensor." These are constructed from the first and second statistical moments of the gradients, estimated efficiently using exponential moving averages. This formulation ensures that the optimization process is consistent across different parameterizations and can naturally handle the curved geometry of high-dimensional loss landscapes. The paper demonstrates that leveraging the full covariance matrix of gradients—not just the diagonal elements used by existing methods—leads to a more accurate representation of this geometry.
WHY it matters? This work shifts the paradigm of optimizer design from a collection of effective but disconnected heuristics to a principled, unified theory grounded in geometry. It reveals that popular optimizers are essentially simplified versions of a more general dynamic, often discarding valuable information about gradient correlations. The experimental results show that by incorporating this richer geometric information (via the full covariance matrix), the proposed "full CGD" optimizer achieves faster, more stable convergence and a lower final loss than its predecessors on benchmark tasks. While computational scalability remains a challenge for large models, CGD provides a powerful theoretical lens and a clear path toward developing the next generation of more efficient and robust optimization algorithms.

## OptimalThinkingBench: Evaluating Over and Underthinking in LLMs

Post: https://arxiviq.substack.com/p/optimalthinkingbench-evaluating-over
Authors: Pranjal Aggarwal, Seungone Kim, Jack Lanchantin, Sean Welleck, Jason Weston, Ilia Kulikov, Swarnadeep Saha
Paper: https://arxiv.org/abs/2508.13141
Code: https://github.com/facebookresearch/RAM/tree/main/projects/otb
Model: N/A

TL;DR
WHAT was done? The authors introduce OptimalThinkingBench, a unified benchmark designed to jointly evaluate two critical failure modes in LLMs: "overthinking" on simple tasks and "underthinking" on complex ones. The benchmark comprises two sub-benchmarks: OverthinkingBench, featuring simple queries across 72 domains, and UnderthinkingBench, containing 11 challenging reasoning tasks. To quantify performance, the paper proposes novel metrics, including Overthinking-Adjusted Accuracy (OAA) which penalizes excessive computation, and a final F1 score ( F_otb ) that harmonizes efficiency on simple tasks with accuracy on complex ones.
WHY it matters? This work addresses a fundamental trade-off in the current LLM landscape, which forces users to choose between "fast but simple" non-thinking models and "powerful but slow" thinking models. By creating a unified framework to measure and encourage "optimal thinking"—the ability to adapt computational effort to task complexity—this research paves the way for a new generation of single, unified LLMs that are both high-performing and efficient. The comprehensive evaluation of 33 state-of-the-art models reveals a crucial finding: no current model can optimally balance these two aspects, highlighting a significant and previously unquantified gap in LLM capabilities.

## SSRL: Self-Search Reinforcement Learning

Post: https://arxiviq.substack.com/p/ssrl-self-search-reinforcement-learning
Authors: Yuchen Fan, Kaiyan Zhang, Heng Zhou, Yuxin Zuo, Yanxu Chen, Yu Fu, Xinwei Long, Xuekai Zhu, Che Jiang, Yuchen Zhang, Li Kang, Gang Chen, Cheng Huang, Zhizhou He, Bingning Wang, Lei Bai, Ning Ding, Bowen Zhou
Paper: https://arxiv.org/abs/2508.10874
Code: https://github.com/TsinghuaC3I/SSRL
Model: N/A

TL;DR
WHAT was done? The paper introduces Self-Search Reinforcement Learning (SSRL), a novel framework that trains Large Language Models (LLMs) to perform agentic search tasks using only their own internal, parametric knowledge. By prompting the LLM to simulate the entire search process—generating queries, "retrieving" information, and reasoning—it creates a "full-simulation" environment for training. SSRL then uses a specialized composite reward, including a crucial format-based component, to enhance the model's ability to structure its reasoning and reliably access its internal knowledge. This eliminates the need for costly external search API calls during the RL training phase.
WHY it matters? This work presents a significant step towards more scalable, cost-effective, and autonomous AI agents. It empirically demonstrates that LLMs possess a vast, elicitable store of world knowledge that can be leveraged directly for complex tasks, reducing dependence on external tools. SSRL is shown to be over 5 times more time-efficient than semi-real baselines like ZeroSearch. Critically, the skills learned in this purely internal, simulated environment exhibit robust "sim-to-real" transfer, allowing the trained agent to seamlessly integrate with and benefit from real-world search engines during inference without any additional fine-tuning. This provides a viable path for developing sophisticated search agents offline while ensuring their effectiveness in online, real-world applications.

## xRFM: Accurate, scalable, and interpretable feature learning models for tabular data

Post: https://arxiviq.substack.com/p/xrfm-accurate-scalable-and-interpretable
Authors: Daniel Beaglehole, Adityanarayanan Radhakrishnan, David Holzmüller, Mikhail Belkin
Paper: https://arxiv.org/abs/2508.10053
Code: https://github.com/dmbeaglehole/xRFM
Model: N/A

TL;DR
WHAT was done? The authors introduce xRFM, a novel algorithm for tabular data that fuses an adaptive binary tree structure with specialized feature-learning kernel machines. The model recursively partitions data using a unique, supervised splitting criterion based on the top eigenvector of the Average Gradient Outer Product (AGOP). At each leaf of the tree, a dedicated "Leaf RFM" (Recursive Feature Machine) is trained to learn features locally relevant to that specific data subset. This hybrid architecture is designed to be highly scalable, adaptive, and inherently interpretable.
WHY it matters? This work presents a powerful new contender in a field long dominated by Gradient Boosted Decision Trees (GBDTs). By achieving log-linear training and logarithmic inference times, xRFM overcomes the traditional scalability bottleneck of kernel methods, making them viable for massive datasets. It delivers state-of-the-art performance, outperforming 31 other methods on 100 regression tasks and proving highly competitive on 200 classification tasks. Most significantly, xRFM provides native "glass-box" interpretability through its learned AGOP matrices, offering direct insights into local feature importance without requiring post-hoc explainability tools. It represents a new paradigm for tabular data that elegantly combines predictive power, scalability, and transparency.

## Mathematical Foundations of Geometric Deep Learning

Post: https://arxiviq.substack.com/p/mathematical-foundations-of-geometric
Authors: Haitz Sáez de Ocáriz Borde and Michael Bronstein
Paper: https://arxiv.org/abs/2508.02723
Code: N/A
Model: N/A

TL;DR
WHAT was done? This paper provides a comprehensive and pedagogical review of the core mathematical concepts that form the bedrock of Geometric Deep Learning (GDL). It systematically navigates through algebraic structures (sets, groups), geometric and analytical tools (norms, metrics, inner products), vector calculus, topology, differential geometry (manifolds), functional analysis, spectral theory, and graph theory. Rather than introducing a new algorithm, the authors meticulously build the mathematical scaffolding required to understand how neural networks can be designed for non-Euclidean data, such as graphs and manifolds, as comprehensively outlined in their proto-book on the topic ( https://arxiv.org/abs/2104.13478 ).
WHY it matters? The work bridges a crucial knowledge gap often present in standard computer science curricula. It presents GDL not as a collection of disparate architectures, but as a unified field grounded in the principles of symmetry, invariance, and equivariance. For researchers and practitioners, this foundational understanding is critical for moving AI beyond simple grid-like data (images, text) to tackle complex, structured problems in science, engineering, and biology. By formalizing the "geometric priors" that make models like GNNs and Transformers effective, this work provides the language to create more robust, data-efficient, and generalizable models that respect the intrinsic structure of the data they process.

## Fast and scalable retrosynthetic planning with a transformer neural network and speculative beam search

Post: https://arxiviq.substack.com/p/fast-and-scalable-retrosynthetic
Authors: Mikhail Andronov, Natalia Andronova, Jürgen Schmidhuber, Michael Wand, Djork-Arné Clevert
Paper: https://arxiv.org/abs/2508.01459
Code: https://github.com/Academich/faster-ml-casp
Model: N/A

TL;DR
WHAT was done? The authors significantly accelerated AI-based multi-step retrosynthesis planning by adapting cutting-edge inference techniques from Large Language Models (LLMs). They integrated their Speculative Beam Search (SBS) algorithm with the Medusa drafting strategy into a SMILES-to-SMILES transformer model. This new approach, termed Medusa Speculative Beam Search (MSBS), allows the model to predict and verify multiple chemical "tokens" (parts of a SMILES string) in parallel, drastically reducing the number of computationally expensive forward passes needed to generate potential reaction precursors.
WHY it matters? The high latency of AI-based Computer-Aided Synthesis Planning (CASP) systems is a major bottleneck preventing their widespread use for high-throughput synthesizability screening in drug discovery. By making the core single-step model orders of magnitude faster without sacrificing accuracy, this work enables the overall planning system to solve 26% to 86% more molecules under the same tight time constraints of several seconds. This breakthrough brings AI-powered CASP systems closer to meeting the demanding speed requirements of industrial drug design workflows, turning a powerful but slow research tool into a practical, high-throughput accelerator for chemical discovery.

## Speed Always Wins: A Survey on Efficient Architectures for Large Language Models

Post: https://arxiviq.substack.com/p/speed-always-wins-a-survey-on-efficient
Authors: Weigao Sun, Jiaxi Hu, Yucheng Zhou, Jusen Du, Disen Lan, Kexin Wang, Tong Zhu, Xiaoye Qu, Yu Zhang, Xiaoyu Mo, Daizong Liu, Yuxuan Liang, Wenliang Chen, Guoqi Li, Yu Cheng
Paper: https://arxiv.org/abs/2508.09834
Code: https://github.com/weigao266/Awesome-Efficient-Arch
Model: N/A

TL;DR
WHAT was done? This paper provides a comprehensive and systematic survey of innovative architectures designed to enhance the efficiency of Large Language Models (LLMs). The authors categorize recent advancements into seven key areas: Linear Sequence Modeling (e.g., Mamba, Linear Attention), Sparse Sequence Modeling (e.g., Longformer, dynamic sparsity), Efficient Full Attention (e.g., FlashAttention), Sparse Mixture-of-Experts (MoE), Hybrid Architectures, Diffusion LLMs, and their applications across diverse modalities like vision and audio. The survey details the core design principles, technical formulations, and hardware-level optimizations for each category, presenting a unified blueprint (Figure 1) of the current landscape. In some sense it’s the next step beyond the well-known “Efficient Transformers: A Survey” paper from 2020 ( https://arxiv.org/abs/2009.06732 ).
WHY it matters? The traditional Transformer architecture, with its quadratic self-attention complexity, poses significant computational and financial barriers to scaling and deploying LLMs. This survey is crucial as it organizes the vast and fragmented research field dedicated to overcoming this "efficiency ceiling." By providing a structured overview of the trade-offs between different approaches—from approximating attention to conditional computation and hardware co-design—it equips researchers and practitioners with the necessary context to build more sustainable, scalable, and versatile AI systems. It maps the evolution from resource-intensive models towards architectures that can handle ultra-long contexts, power real-time agents, and operate efficiently across multiple data types, charting a clear path for the future of resource-aware foundation models.

## Is Chain-of-Thought Reasoning of LLMs a Mirage? A Data Distribution Lens

Post: https://arxiviq.substack.com/p/is-chain-of-thought-reasoning-of
Authors: Chengshuai Zhao, Zhen Tan, Pingchuan Ma, Dawei Li, Bohan Jiang, Yancheng Wang, Yingzhen Yang, and Huan Liu
Paper: https://arxiv.org/abs/2508.01191
Code: https://github.com/ChengshuaiZhao0/DataAlchemy
Model: N/A

TL;DR
WHAT was done? The authors challenge the perception of Chain-of-Thought (CoT) as a genuine reasoning process in LLMs. They propose a "data distribution lens," hypothesizing that CoT is a form of structured pattern matching, whose effectiveness is fundamentally bounded by the similarity between training and test data. To test this, they introduce DataAlchemy, a controlled synthetic environment for training LLMs from scratch. This framework allows them to systematically probe CoT's brittleness across three well-defined dimensions of distribution shift: task, length, and format.
WHY it matters? This work provides some of the most rigorous and controlled evidence to date that the reasoning we observe in LLMs may be a "brittle mirage." It suggests that even sophisticated CoT prompting does not endow models with abstract, generalizable inference but rather enables them to replicate learned sequential patterns. This has profound implications for the development and deployment of AI, cautioning against over-reliance on CoT in high-stakes applications and highlighting the critical need for rigorous out-of-distribution (OOD) testing. The paper reframes a key aspect of LLM capability, urging the field to move beyond surface-level performance and pursue models with more authentic and robust reasoning.

## Generalists vs. Specialists: Evaluating LLMs on Highly-Constrained Biophysical Sequence Optimization Tasks

Post: https://arxiviq.substack.com/p/generalists-vs-specialists-evaluating
Authors: Angelica Chen, Samuel D. Stanton, Frances Ding, Robert G. Alberstein, Andrew M. Watkins, Richard Bonneau, Vladimir Gligorijević, Kyunghyun Cho, Nathan C. Frey
Paper: https://arxiv.org/abs/2410.22296, ICML 2025 Poster
Code: The implementation of LaMBO-2, a baseline solver, is available in the poli-baselines repository: https://github.com/MachineLearningLifeScience/poli-baselines
Model: N/A

TL;DR
WHAT was done? This paper tackles the challenge of using Large Language Models (LLMs) for highly-constrained biophysical sequence optimization, a task where standard LLMs typically fail. The authors introduce three key innovations:
Ehrlich functions, a new synthetic benchmark suite that mimics the complex, constrained, and non-additive nature of real biophysical design problems, allowing for rigorous and reproducible evaluation without train-test leakage.
LLOME (Language Model Optimization with Margin Expectation), a novel bi-level optimization framework that embeds an LLM within an iterative online feedback loop, enabling it to learn and adapt its sequence generation policy to satisfy fine-grained constraints.
MargE (Margin-Aligned Expectation) loss, a new preference learning objective that significantly outperforms standard methods like Supervised Fine-Tuning (SFT) and Direct Preference Optimization (DPO) in this context by effectively using ground-truth rewards and avoiding common pitfalls like mode collapse.
WHY it matters? This work demonstrates a crucial paradigm shift: with the right framework and training objective, generalist LLMs can be transformed into powerful optimization agents capable of matching or even outperforming specialized, purpose-built solvers on complex scientific design tasks. The results show that LLMs can learn to navigate highly constrained search spaces, a critical capability for applications in drug discovery, materials science, and protein engineering. The paper also provides a valuable new benchmark (Ehrlich functions) for the research community and offers deep, practical insights into the limitations of popular preference learning methods like DPO, guiding the development of more robust alignment techniques for high-stakes, real-world optimization problems.

## R-Zero: Self-Evolving Reasoning LLM from Zero Data

Post: https://arxiviq.substack.com/p/r-zero-self-evolving-reasoning-llm
Authors: Chengsong Huang, Wenhao Yu, Xiaoyang Wang, Hongming Zhang, Zongxia Li, Ruosen Li, Jiaxin Huang, Haitao Mi, Dong Yu
Paper: https://arxiv.org/abs/2508.05004
Code: https://github.com/Chengsong-Huang/R-Zero
Model: N/A

TL;DR
WHAT was done? The paper introduces R-Zero, a fully autonomous framework that enables Large Language Models (LLMs) to enhance their reasoning capabilities without any pre-existing tasks or human labels. Starting from a single base LLM, R-Zero initiates a co-evolutionary loop between two models: a Challenger and a Solver. The Challenger's goal is to generate novel reasoning problems that are precisely at the edge of the Solver's current ability. Its reward is based on maximizing the Solver's uncertainty, targeting a ~50% success rate, which is theorized to be the optimal point for learning. The Solver, in turn, is trained to solve these increasingly difficult problems, using pseudo-labels generated via a majority vote of its own multiple answers.
WHY it matters? This matters because it addresses a fundamental bottleneck in AI: the heavy reliance on vast, human-curated datasets. R-Zero offers a scalable path toward AI systems that can improve autonomously, potentially surpassing the limits of human-provided knowledge. Empirically, the method substantially boosts reasoning performance on various LLMs (e.g., +6.49 on math benchmarks for Qwen3-4B-Base) and demonstrates that these learned skills generalize to broader reasoning tasks. It even acts as a "performance amplifier" when combined with traditional supervised fine-tuning, making it a powerful and practical tool for advancing AI.

## Discovering and using Spelke segments

Post: https://arxiviq.substack.com/p/discovering-and-using-spelke-segments
Authors: Rahul Venkatesh, Klemen Kotar, Lilian Naing Chen, Seungwoo Kim, Luca Thomas Wheeler, Jared Watrous, Ashley Xu, Gia Ancone, Wanhee Lee, Honglin Chen, Daniel Bear, Stefan Stojanov, Daniel Yamins
Paper: https://arxiv.org/abs/2507.16038
Code: https://neuroailab.github.io/spelke_net
Model: N/A

TL;DR
WHAT was done? This paper introduces SpelkeNet, a self-supervised visual world model that learns to discover "Spelke segments"—groups of pixels that move cohesively under physical forces. Instead of relying on semantic labels, SpelkeNet is trained on large-scale videos to predict plausible future motions. It uses a novel "statistical counterfactual probing" procedure: it applies "virtual pokes" to a static image and analyzes the resulting motion correlations to identify which parts of the scene belong together physically. The authors also introduce SpelkeBench, a new benchmark specifically designed to evaluate this physically-grounded segmentation concept.
WHY it matters? This work marks a fundamental shift in object segmentation, moving from an appearance-based ("what does it look like?") to a causal, physics-based paradigm ("how does it behave?"). This is crucial for robotics and embodied AI, where understanding how objects physically interact is more important than knowing their semantic category. By producing segments that align with real-world motion, SpelkeNet enables significantly more physically plausible and realistic object manipulation in downstream tasks, outperforming strong baselines like SAM on benchmarks designed to test this capability. It's a significant step toward AI systems with an intuitive grasp of physics.

## CoT-Self-Instruct: Building high-quality synthetic prompts for reasoning and non-reasoning tasks

Post: https://arxiviq.substack.com/p/cot-self-instruct-building-high-quality
Authors: Ping Yu, Jack Lanchantin, Tianlu Wang, Weizhe Yuan, Olga Golovneva, Ilia Kulikov, Sainbayar Sukhbaatar, Jason Weston, Jing Xu
Paper: https://arxiv.org/abs/2507.23751
Code: N/A
Model: N/A

TL;DR
WHAT was done? The paper introduces CoT-Self-Instruct, a two-stage pipeline for generating high-quality synthetic training data for LLMs. In the first stage, an LLM uses Chain-of-Thought (CoT) to reason about a small set of seed prompts and then generate a new, complex synthetic instruction. For reasoning tasks, this includes generating the answer as well. The second stage involves a rigorous curation process. For verifiable reasoning tasks, a novel "Answer-Consistency" filter is applied, which rejects prompts where the model's majority-voted answer doesn't match the self-generated one. For non-verifiable tasks, the Rejecting Instruction Preferences (RIP) method ( https://arxiv.org/abs/2501.18578 ) is used to filter prompts based on reward model scores.
WHY it matters? This method is significant because the resulting synthetic data enables LLMs to achieve performance that surpasses models trained on existing high-quality, human-annotated datasets like s1k ( https://arxiv.org/abs/2501.19393, review here ) and OpenMathReasoning ( https://arxiv.org/abs/2504.16891 ) for reasoning, and WildChat ( https://arxiv.org/abs/2405.01470 ) for instruction following. It demonstrates that by instructing an LLM to reason about the data generation process and then self-curate the output, we can create a more effective training curriculum than what is often produced by humans. This work represents a major step towards data-centric AI and more autonomous, self-improving LLMs, reducing the dependency on expensive and potentially biased manual data annotation.

## A Survey of Context Engineering for Large Language Models

Post: https://arxiviq.substack.com/p/a-survey-of-context-engineering-for
Authors: Lingrui Mei, Jiayu Yao, Yuyao Ge, Yiwei Wang, Baolong Bi, Yujun Cai, Jiazhi Liu, Mingyu Li, Zhong-Zhi Li, Duzhen Zhang, Chenlin Zhou, Jiayi Mao, Tianze Xia, Jiafeng Guo, Shenghua Liu
Paper: https://arxiv.org/abs/2507.13334
Code: https://github.com/Meirtz/Awesome-Context-Engineering
Model: N/A

TL;DR
WHAT was done? This survey introduces and formalizes "Context Engineering," a discipline for the systematic optimization of information payloads for Large Language Models (LLMs). The authors present a novel, comprehensive taxonomy that deconstructs this field into two primary layers: foundational Components (Context Retrieval and Generation, Context Processing, Context Management) and sophisticated System Implementations (Retrieval-Augmented Generation, Memory Systems, Tool-Integrated Reasoning, Multi-Agent Systems). By analyzing over 1400 papers, the work formalizes context not as a static string but as a dynamic set of components, framing its assembly as an optimization problem grounded in information theory and Bayesian inference.
WHY it matters? This work provides a critical, unifying framework for a field that has been developing in fragmented silos, shifting the paradigm from the "art" of prompt design to the "science" of information logistics. It offers a clear roadmap for building more capable and reliable AI systems. Most significantly, the survey identifies a fundamental asymmetry in current models: despite remarkable proficiency in understanding complex contexts, LLMs show pronounced limitations in generating equally sophisticated, long-form outputs. This "comprehension-generation gap" pinpoints a major bottleneck in AI development and sets a defining priority for future research.

## Einstein Fields: A Neural Perspective To Computational General Relativity

Post: https://arxiviq.substack.com/p/einstein-fields-a-neural-perspective
Authors: Sandeep S. Cranganore, Andrei Bodnar, Arturs Berzins, Johannes Brandstetter
Paper: https://arxiv.org/abs/2507.11589
Code: https://github.com/AndreiB137/EinFields
Model: N/A

TL;DR
WHAT was done? This paper introduces Einstein Fields ( EinFields ), a novel framework that uses implicit neural networks to compress computationally intensive 4D numerical relativity simulations into compact neural network weights. Instead of relying on traditional, discrete grid-based methods, EinFields models the metric tensor—the core field of general relativity—as a continuous function of spacetime coordinates. By learning this fundamental geometric representation from analytical or numerical solutions, all other physical quantities, such as curvature tensors and particle trajectories (geodesics), are derived post-hoc via automatic differentiation (AD).
WHY it matters? This approach matters because it tackles the immense computational and storage costs of numerical relativity. EinFields achieve compression factors of up to 4000x while maintaining high precision (Table 2). The use of AD yields derivatives that are orders of magnitude more accurate than traditional finite-difference methods (Table 3). This enables a more efficient, flexible, and accurate way to store, analyze, and derive physical insights from complex spacetime simulations, potentially paving the way for a new class of hybrid AI and physics models in astrophysics and fundamental science.
EinFields Schwarzschild black hole rendering with ray tracing ( source )
ArXivIQ is a reader-supported publication. To receive new posts and support my work, consider becoming a free or paid subscriber.

## Meta CLIP 2: A Worldwide Scaling Recipe

Post: https://arxiviq.substack.com/p/meta-clip-2-a-worldwide-scaling-recipe
Authors: Yung-Sung Chuang, Yang Li, Dong Wang, Ching-Feng Yeh, Kehan Lyu, Ramya Raghavendra, James Glass, Lifei Huang, Jason Weston, Luke Zettlemoyer, Xinlei Chen, Zhuang Liu, Saining Xie, Wen-tau Yih, Shang-Wen Li, Hu Xu
Paper: https://arxiv.org/abs/2507.22062
Code: N/A
Model: N/A

TL;DR
WHAT was done? The paper introduces Meta CLIP 2, the first-ever recipe to train a Contrastive Language-Image Pre-training (CLIP) model from scratch using native worldwide web-scale data. This end-to-end framework bypasses the need for machine translation or proprietary datasets. The core innovation is a three-part recipe: (1) constructing multilingual metadata from sources like Wikipedia and WordNet for over 300 languages; (2) a novel, language-specific curation algorithm that balances concept distributions by dynamically setting a sampling threshold ( t_lang ) for each language; and (3) a worldwide training framework that scales the number of seen image-text pairs and identifies a sufficient model capacity (ViT-H/14) as the inflection point for success.
WHY it matters? This work provides a groundbreaking solution to the "curse of multilinguality," a long-standing problem where training on non-English data degrades a model's English performance. Meta CLIP 2 demonstrates that with proper scaling of data, metadata, and model capacity, English and non-English data become mutually beneficial. The resulting ViT-H/14 model not only improves English-only performance on ImageNet (81.3% vs. 80.5%) but also sets a new state-of-the-art on multilingual benchmarks. By open-sourcing this recipe, the authors provide a vital blueprint for building truly global, culturally aware, and more capable foundation models, unlocking the vast, non-English portion of the web for sustainable AI scaling.

## Thousand-Brains Systems: Sensorimotor Intelligence for Rapid, Robust Learning and Inference

Post: https://arxiviq.substack.com/p/thousand-brains-systems-sensorimotor
Authors: Niels Leadholm, Viviane Clay, Scott Knudstrup, Hojae Lee, Jeff Hawkins; all from the Thousand Brains Project
Paper: https://arxiv.org/abs/2507.04494
Code: https://github.com/thousandbrainsproject/tbp.tbs_sensorimotor_intelligence Model: https://github.com/thousandbrainsproject/tbp.monty/
Model: N/A

TL;DR
WHAT was done? This paper introduces and evaluates Monty, the first implementation of a "thousand-brains system," an AI architecture inspired by the structure and function of the brain's neocortex. Instead of passively learning from massive static datasets, Monty learns structured, 3D models of objects by actively moving sensors over them and integrating information within explicit reference frames. The core innovation lies in its use of local, associative (Hebbian-like) learning, which confers a constellation of desirable properties absent in many deep learning systems.
WHY it matters? This approach matters because it demonstrates a viable path to overcoming some of AI's most significant hurdles. Monty exhibits robust generalization by emphasizing an object's shape over its texture, enabling accurate recognition even with novel poses and sensory noise. It achieves rapid, few-shot learning and is inherently resilient to the catastrophic forgetting that plagues deep networks in continual learning settings. Most strikingly, it accomplishes this with orders of magnitude fewer computational operations (FLOPs) for both learning and inference compared to state-of-the-art Vision Transformers, challenging the dominant paradigm of "bigger data, bigger models" and pointing towards a more efficient, robust, and scalable future for AI.

## A Survey of Self-Evolving Agents: On Path to Artificial Super Intelligence

Post: https://arxiviq.substack.com/p/a-survey-of-self-evolving-agents
Authors: Huan-ang Gao, Jiayi Genga, Wenyue Hua, Mengkang Hu, Xinzhe Juan, Hongzhang Liu, Shilong Liu, Jiahao Qiu, Xuan Qi, Yiran Wu, Hongru Wang, Han Xiao, Yuhang Zhou, Shaokun Zhang, Jiayi Zhang, Jinyu Xiang, Yixiong Fang, Qiwen Zhao, Dongrui Liu, Qihan Ren, Cheng Qian, Zhenhailong Wang, Minda Hu, Huazheng Wang, Qingyun Wu, Heng Ji, Mengdi Wang
Paper: https://arxiv.org/abs/2507.21046
Code: https://github.com/CharlesQ9/Self-Evolving-Agents
Model: N/A

TL;DR
WHAT was done? This paper provides the first systematic and comprehensive survey of self-evolving agents, a new class of AI systems designed to overcome the static nature of today's Large Language Models (LLMs). The authors establish a unified theoretical framework for understanding and designing these agents, organizing the field around three foundational questions: what to evolve (models, context, tools, architecture), when to evolve (during or between tasks), and how to evolve (via reward-based, imitation, or population-based methods). The work also proposes tailored paradigms and metrics for evaluating these continuously adapting systems.
WHY it matters? The static nature of LLMs is a critical bottleneck for their deployment in open-ended, dynamic environments. This survey frames self-evolving agents as a crucial paradigm shift from scaling static models to developing autonomous systems that continuously learn from experience. By providing a clear roadmap for designing, comparing, and evaluating these agents, the paper lays the groundwork for advancing more adaptive, robust, and versatile AI. This research direction is presented as an essential step on the path toward realizing Artificial Super Intelligence (ASI), where agents can evolve autonomously and perform at or beyond human-level intelligence across a wide array of tasks (Figure 1).

## Agentic Web: Weaving the Next Web with AI Agents

Post: https://arxiviq.substack.com/p/agentic-web-weaving-the-next-web
Authors: Yingxuan Yang, Mulei Ma, Yuxuan Huang, Huacan Chai, Chenyu Gong, Haoran Geng, Yuanjian Zhou, Ying Wen, Meng Fang, Muhao Chen, Shangding Gu, Ming Jin, Costas Spanos, Yang Yang, Pieter Abbeel, Dawn Song, Weinan Zhang, Jun Wang
Paper: https://arxiv.org/abs/2507.21206
Code: https://github.com/SafeRL-Lab/agentic-web
Model: N/A

TL;DR
WHAT was done? The authors present "Agentic Web," a comprehensive conceptual framework for the next phase of the internet, where autonomous AI agents act as primary intermediaries. The paper provides a structured analysis of this paradigm shift by tracing the web's historical evolution from the search-centric PC era and recommendation-driven Mobile era to a new action-oriented Agentic era. It introduces a novel three-dimensional model (Intelligence, Interaction, Economics) to define agent capabilities and outlines the necessary algorithmic and architectural transitions, including the critical role of new communication protocols like MCP and A2A. The work also forecasts the emergence of an "Agent Attention Economy" and provides a detailed taxonomy of systemic risks and governance challenges.
WHY it matters? This paper provides a crucial, structured vocabulary and a forward-looking roadmap for a rapidly emerging field. By defining the "Agentic Web," it shifts the research focus from developing individual agents to architecting an entirely new, agent-native internet ecosystem. It's significant because it synthesizes disparate trends into a coherent vision, highlighting the profound technological, economic, and security transformations ahead. This work is essential for researchers and builders as it frames the key challenges, from ensuring robust agent cognition and secure multi-agent coordination to designing viable business models that move beyond human attention, providing a foundational text for shaping the future of the internet.

## Tversky Neural Networks: Psychologically Plausible Deep Learning with Differentiable Tversky Similarity

Post: https://arxiviq.substack.com/p/tversky-neural-networks-psychologically
Authors: Moussa Koulako Bala Doumbouya, Dan Jurafsky, Christopher D. Manning
Paper: https://arxiv.org/abs/2506.11035
Code: N/A
Model: N/A

TL;DR
What was done? This paper introduces a groundbreaking differentiable parameterization of Tversky's psychologically plausible theory of similarity, which has been historically incompatible with gradient-based deep learning. The authors derive new neural network building blocks, most notably the Tversky Projection Layer, a non-linear alternative to the standard fully-connected layer. This new layer computes similarity based on a learnable set of common and distinctive features, directly inspired by human cognitive science.
Why it matters? This work challenges the universal reliance on simplistic geometric similarity (e.g., dot product) in deep learning. By integrating a more cognitively aligned model, Tversky Neural Networks achieve impressive results: they are not only more interpretable by design, but also demonstrably more performant and parameter-efficient. On the NABirds benchmark, a Tversky layer adapter boosted a frozen ResNet-50's accuracy by 24.7%. In a GPT-2 model trained from scratch, these layers reduced perplexity by 7.5% while simultaneously cutting parameter count by 34.8%. This research provides a new paradigm for building deep learning models that are more powerful, efficient, and fundamentally aligned with human reasoning.

## AlphaEarth Foundations: An embedding field model for accurate and efficient global mapping from sparse label data

Post: https://arxiviq.substack.com/p/alphaearth-foundations-an-embedding
Authors: Christopher F. Brown, Michal R. Kazmierski, Valerie J. Pasquarella, William J. Rucklidge, Masha Samsikova, Chenhui Zhang, Evan Shelhamer, Estefania Lahera, Olivia Wiles, Simon Ilyushchenko, Noel Gorelick, Lihui Lydia Zhang, Sophia Alj, Emily Schechter, Sean Askay, Oliver Guinan, Rebecca Moore, Alexis Boukouvalas and Pushmeet Kohli
Paper: https://arxiv.org/abs/2507.22291
Code: N/A
Model: N/A

TL;DR
WHAT was done? The authors introduce AlphaEarth Foundations (AEF), a geospatial foundation model that creates a universal, time-continuous "embedding field" for the entire planet. AEF assimilates petabytes of data from diverse sources—including optical, radar (SAR), LiDAR, climate, and geotagged text—into a single, compact (64-byte), and high-resolution (10m) representation. The model is built on a novel Space Time Precision (STP) encoder and trained with a multi-objective loss that includes reconstruction, a teacher-student consistency objective for robustness to data sparsity, a batch uniformity objective to maximize embedding space utilization, and a CLIP-like loss for aligning with semantic text.
WHY it matters? AEF marks a paradigm shift in Earth Observation AI. It is the first task-agnostic model to consistently outperform all tested baselines—both engineered and learned—across a wide range of mapping applications without any re-training, reducing error by ~24% on average. By effectively translating sparse labels into detailed global maps, it tackles the dual challenges of data scarcity and volume. The public release of annual embedding fields from 2017-2024 democratizes access to high-performance geospatial analysis, enabling practitioners to build advanced monitoring systems for food security, conservation, and disaster response with unprecedented efficiency.

## Persona Vectors: Monitoring and Controlling Character Traits in Language Models

Post: https://arxiviq.substack.com/p/persona-vectors-monitoring-and-controlling
Authors: Runjin Chen, Andy Arditi, Henry Sleight, Owain Evans, Jack Lindsey
Paper: https://arxiv.org/abs/2507.21509
Code: https://github.com/safety-research/persona_vectors
Model: N/A

TL;DR
WHAT was done? The authors introduce an automated pipeline to extract "persona vectors"—linear directions in a language model's activation space that represent specific character traits like evil, sycophancy, or a propensity to hallucinate. These vectors are derived from natural language descriptions of traits by contrasting model activations on trait-eliciting versus trait-suppressing prompts. The framework leverages these vectors for a full lifecycle of persona management: monitoring shifts in real-time, controlling behavior via activation steering, and, most notably, predicting and preventing undesirable persona changes during finetuning.
WHY it matters? This work provides a scalable and interpretable toolkit for tackling the critical AI safety problem of emergent and unpredictable model personas. It shifts the paradigm from reactive fixes to proactive alignment. The ability to predict which training data will cause harmful shifts before finetuning enables a new form of model-aware data curation. Furthermore, the novel "preventative steering" method offers a way to bake alignment directly into the training process, limiting persona drift while better preserving general capabilities. This provides a practical path toward building more reliable, controllable, and fundamentally safer language models.

## Hierarchical Reasoning Model

Post: https://arxiviq.substack.com/p/hierarchical-reasoning-model
Authors: Guan Wang, Jin Li, Yuhao Sun, Xing Chen, Changling Liu, Yue Wu, Meng Lu, Sen Song, Yasin Abbasi Yadkori
Paper: https://arxiv.org/abs/2506.21734
Code: https://github.com/sapientinc/HRM
Model: N/A

TL;DR
WHAT was done? The paper introduces the Hierarchical Reasoning Model (HRM), a novel recurrent architecture inspired by the human brain. HRM features two interdependent modules operating at different timescales: a high-level module for slow, abstract planning, and a low-level module for rapid, detailed computation. This design enables significant computational depth while maintaining stability through a "hierarchical convergence" process. Training is made highly efficient by a one-step gradient approximation that bypasses Backpropagation Through Time (BPTT), and the model dynamically allocates resources using an Adaptive Computational Time (ACT) mechanism (see my series of posts on ACT ).
WHY it matters? HRM fundamentally challenges the dominant "bigger is better" paradigm of large language models (LLMs). With only 27M parameters and trained from scratch on just ~1000 examples, it achieves near-perfect performance on complex reasoning tasks (like Sudoku-Extreme and Maze-Hard) where massive Chain-of-Thought (CoT) models completely fail. This suggests that sophisticated architecture and computational depth, rather than sheer scale, can be a more efficient and robust path to advanced AI reasoning. Furthermore, the model's learned internal structure spontaneously develops a brain-like dimensionality hierarchy, providing strong empirical validation for a brain-inspired approach.

## Learning without training: The implicit dynamics of in-context learning

Post: https://arxiviq.substack.com/p/learning-without-training-the-implicit
Authors: Benoit Dherin, Hanna Mazzawi, Michael Wunder, Michael Munn, Javier Gonzalvo
Paper: https://arxiv.org/abs/2507.16003
Code: N/A
Model: N/A

TL;DR
WHAT was done? The authors propose a theoretical framework that explains in-context learning (ICL) as an implicit, on-the-fly weight modification process. They introduce the concept of a "contextual block" (a generalization of a transformer block) and demonstrate mathematically that the context provided in a prompt is implicitly transformed into a low-rank update to the weight matrix of the subsequent MLP layer. This means the model isn't just retrieving information; it's dynamically re-parameterizing itself during inference. The paper provides an explicit formula for this rank-1 weight update and shows that the sequential processing of context tokens resembles a stochastic gradient descent optimization on the MLP weights.
WHY it matters? This work provides a compelling and more general mechanistic explanation for the "magic" of ICL, moving it from a black-box emergent property to a quantifiable, architectural dynamic. Unlike prior work that often relied on simplified toy models (e.g., linear attention), this framework is designed to be closer to real-world transformers. It creates a powerful link between ICL and parameter-efficient fine-tuning (PEFT) methods like LoRA, suggesting that ICL might be an implicit form of the same low-rank adaptation. This insight offers a new lens for interpretability, could lead to more principled prompt engineering, and provides a foundational theory for how models "learn without training."

## GEPA: Reflective Prompt Evolution Can Outperform Reinforcement Learning

Post: https://arxiviq.substack.com/p/gepa-reflective-prompt-evolution
Authors: Lakshya A Agrawal, Shangyin Tan, Dilara Soylu, Noah Ziems, Rishi Khare, Krista Opsahl-Ong, Arnav Singhvi, Herumb Shandilya, Michael J Ryan, Meng Jiang, Christopher Potts, Koushik Sen, Alexandros G. Dimakis, Ion Stoica, Dan Klein, Matei Zaharia, Omar Khattab
Paper: https://arxiv.org/abs/2507.19457
Code: N/A
Model: N/A

TL;DR
What was done? The authors introduced GEPA (Genetic-Pareto), a novel algorithm for optimizing prompts in complex, multi-module AI systems. Instead of relying on traditional reinforcement learning (RL), GEPA employs a language-driven, evolutionary approach. Its core innovation is "reflective prompt mutation," where an LLM analyzes its own performance—including reasoning steps, tool usage, and detailed evaluation feedback—in natural language to diagnose failures and propose targeted improvements to its instructional prompts. This process is guided by a genetic algorithm that uses Pareto selection to maintain a diverse set of high-performing prompts, preventing the optimizer from getting stuck in local optima.
Why it matters? This work signals a potential paradigm shift in how we optimize LLM-based agents. GEPA demonstrates that learning through language-based self-reflection is dramatically more sample-efficient than learning from sparse, scalar rewards. It outperforms the RL method GRPO by an average of 10% while using up to 35x fewer "rollouts" (system executions). It also surpasses the state-of-the-art prompt optimizer MIPROv2 ( https://aclanthology.org/2024.emnlp-main.525/ ), and surprisingly shows that evolving detailed instructions alone can be more effective than optimizing few-shot examples. This approach makes adapting powerful AI systems far more practical and affordable, especially in settings where data is scarce or system executions are expensive.

## Energy-Based Transformers are Scalable Learners and Thinkers

Post: https://arxiviq.substack.com/p/energy-based-transformers-are-scalable
Authors: Alexi Gladstone, Ganesh Nanduru, Md Mofijul Islam, Peixuan Han, Hyeonjeong Ha, Aman Chadha, Yilun Du, Heng Ji, Jundong Li, Tariq Iqbal
Paper: https://arxiv.org/abs/2507.02092
Code: https://github.com/alexiglad/EBT
Model: N/A

TL;DR
What was done? The paper introduces Energy-Based Transformers (EBTs), a new class of models that frame "thinking" as an optimization procedure. Instead of directly generating predictions, EBTs learn an energy function that acts as a verifier, assigning a compatibility score (unnormalized probability) to any input-prediction pair. Predictions are then made by starting with a random candidate and iteratively refining it through gradient descent to find the lowest energy (most compatible) state. This process allows three key facets of "System 2 thinking" to emerge entirely from unsupervised learning: dynamic computation allocation, inherent uncertainty modeling, and explicit prediction verification.
Why it matters? EBTs challenge the dominant paradigms of autoregressive models and Diffusion Transformers (DiTs) by leveraging a more fundamental principle: it is often computationally easier to verify a solution than to generate it. This leads to a more efficient and robust path to scalable AI. The most significant findings are that EBTs exhibit a learning scalability rate up to 35% higher than traditional Transformer++ models during pretraining. They outperform DiTs in image denoising with 99% fewer forward passes and show stronger generalization on out-of-distribution (OOD) data. This suggests that learning to verify is a more scalable and generalizable principle than learning to generate directly, offering a promising new direction for building more capable and reliable foundation models.

## Subliminal Learning: Language models transmit behavioral traits via hidden signals in data

Post: https://arxiviq.substack.com/p/subliminal-learning-language-models
Authors: Alex Cloud, Minh Le, James Chua, Jan Betley, Anna Sztyber-Betley, Jacob Hilton, Samuel Marks, Owain Evans
Paper: https://arxiv.org/abs/2507.14805
Code: N/A
Model: N/A

TL;DR
WHAT was done? The paper introduces and empirically demonstrates "subliminal learning," a surprising phenomenon where language models (LLMs) transmit behavioral traits—such as preferences or even misalignment—to other models during distillation. Critically, this transmission occurs through training data that is semantically unrelated to the trait itself (e.g., sequences of numbers, filtered code) and has been rigorously stripped of any explicit or subtle references to the trait. The authors show this effect holds across different data modalities and traits but is highly dependent on the "teacher" and "student" models sharing a similar initialization or base architecture. A theoretical result is also provided, suggesting this is a general property of neural networks.
[Editor note] I want to explicitly highlight, that most of the experiments do not require logit distillation (which is the typical way of doing things when doing distillation), but just token-level distillation, essentially fine-tuning. So for each token the student does NOT see the whole distribution of logits, it just sees the most probable token, which makes the work even more interesting!
WHY it matters? This work uncovers a significant and previously unknown pitfall for AI safety and development. It reveals that common data-filtering practices are insufficient to prevent the propagation of unintended, potentially harmful traits from one model generation to the next. The finding that misalignment can be transmitted "subliminally" poses a direct challenge to current alignment strategies that rely on curating "clean" data. The mechanism appears to be based on model-specific statistical patterns, not universal semantic content, making detection and mitigation extremely difficult. This research forces a re-evaluation of the risks associated with model distillation and the integrity of synthetic data, urging the AI community to develop deeper safety evaluations that probe beyond superficial model behavior.

## AlphaGo Moment for Model Architecture Discovery

Post: https://arxiviq.substack.com/p/alphago-moment-for-model-architecture
Authors: Yixiu Liu, Yang Nan, Weixian Xu, Xiangkun Hu, Lyumanshan Ye, Zhen Qin, Pengfei Liu
Paper: https://arxiv.org/abs/2507.18074
Code: https://github.com/GAIR-NLP/ASI-Arch
Model: https://gair-nlp.github.io/ASI-Arch

TL;DR
Researchers have developed ASI-ARCH, a fully autonomous AI system that represents the first demonstration of "Artificial Superintelligence for AI research" (ASI4AI). This system moves beyond traditional Neural Architecture Search (NAS) by enabling AI to conduct end-to-end scientific research: it autonomously hypothesizes novel architectural concepts, implements them as code, and empirically validates them through experimentation.
Over 20,000 GPU hours, ASI-ARCH conducted 1,773 autonomous experiments, discovering 106 novel, state-of-the-art (SOTA) linear attention architectures that outperform human-designed baselines like Mamba2. The most significant finding is the establishment of the first empirical scaling law for scientific discovery (Figure 1), demonstrating a strong linear relationship between computational budget and the number of SOTA architectures found. This suggests that the pace of AI research, previously constrained by human cognitive capacity, can now become a computation-scalable process, marking a potential paradigm shift in how AI itself is advanced.

## [ICML 2025] Position: AI Safety should prioritize the Future of Work

Post: https://arxiviq.substack.com/p/icml-2025-position-ai-safety-should
Authors: Sanchaita Hazra, Bodhisattwa Prasad Majumder, Tuhin Chakrabarty
Paper: https://arxiv.org/abs/2504.13959, ICML submission
Code: https://github.com/joshgivens/ScoreMatchingwithMissingData
Model: N/A

TL;DR
WHAT was done? The authors argue that the current AI safety paradigm is dangerously narrow, focusing on technical and long-term existential risks while overlooking the immediate, systemic disruption AI causes to the future of work. In this position paper, they use established economic theories—such as rent-seeking (where firms pursue wealth by manipulating policy rather than creating value), intertemporal consumption, and institutional economics—to frame the societal risks of unchecked AI deployment. These risks include destabilizing economies through job insecurity, exacerbating inequality by favoring capital over labor, creating an "algorithmic monoculture" that impairs learning, and devaluing creative labor through widespread copyright infringement.
WHY it matters? Its most crucial contribution is reframing the very definition of existential risk. The paper compellingly argues that we should be as concerned with "accumulative x-risks"—death by a thousand cuts from systemic job loss, decaying institutions, and data colonialism —as we are with a single, "decisive" event like a rogue superintelligence. This shifts the timeline for "safety" from a hypothetical future to a pressing now. By proposing a pro-worker governance framework, the paper provides a crucial bridge between technical AI research and the tangible, human-centric policy needed to steer AI development towards shared prosperity rather than systemic disruption.

## [ICML 2025] Score Matching With Missing Data

Post: https://arxiviq.substack.com/p/score-matching-with-missing-data
Authors: Josh Givens, Song Liu, Henry W J Reeve
Paper: https://arxiv.org/abs/2506.00557, ICML submission
Code: https://github.com/joshgivens/ScoreMatchingwithMissingData
Model: N/A

TL;DR
WHAT was done? The paper introduces a general framework for adapting score matching—a powerful technique for learning data distributions—to handle partially missing data. The authors propose two distinct but complementary methods: (1) a Marginal Importance Weighting (IW) approach, which estimates marginal scores using importance sampling, and (2) a Marginal Variational (Var) approach, which uses variational inference to approximate intractable expectations in the score matching objective's gradient. Crucially, this framework is compatible with any parameterized score model (including explicit formulations, not just neural networks) and extends to major variants like truncated, sliced, and denoising score matching.
WHY it matters? This work significantly broadens the applicability of score-based models by addressing the ubiquitous problem of incomplete data. Prior methods were often restricted to specific neural network architectures within diffusion models. This research provides a more flexible and general solution, enabling the use of score matching for tasks like energy-based modeling and graphical model estimation where explicit parameters are key. Imagine trying to map the intricate network of interactions between genes using expression data, a classic graphical model estimation task. In reality, such datasets are plagued by missing measurements. This work provides the tools to build these crucial biological networks directly from incomplete data, demonstrating superior performance on real-world datasets.

## [ICML 2025] Conformal Prediction as Bayesian Quadrature

Post: https://arxiviq.substack.com/p/icml-2025-conformal-prediction-as
Authors: Jake C. Snell, Thomas L. Griffiths
Paper: https://arxiv.org/abs/2502.13228, ICML submission
Code: https://github.com/jakesnell/conformal-as-bayes-quad
Model: N/A

TL;DR
WHAT was done? This paper reframes frequentist conformal prediction through a Bayesian lens, modeling the problem of bounding expected loss as an application of Bayesian Quadrature. By leveraging a classic result from distribution-free statistics—that the spacings between ordered quantiles of i.i.d. samples follow a Dirichlet distribution—the authors develop a nonparametric framework that remains distribution-free. Instead of producing a single point estimate of risk, their method computes the full posterior distribution of a provable upper bound on the expected loss, which they call L+.
WHY it matters? This approach provides a richer, more practical "data-conditional" guarantee on model performance. While traditional conformal methods offer guarantees that hold on average over many datasets, experiments show they can frequently fail to control risk for individual calibration sets (Table 1, 3). This Bayesian framework yields a more complete view of potential outcomes (Figure 4) and leads to significantly lower failure rates while maintaining competitive (and often smaller) prediction sets. It unifies existing methods like Split Conformal Prediction and Conformal Risk Control as special cases, offering a more robust and interpretable foundation for quantifying uncertainty in high-stakes AI systems.

## [ICML 2025] CollabLLM: From Passive Responders to Active Collaborators

Post: https://arxiviq.substack.com/p/icml-2025-collabllm-from-passive
Authors: Shirley Wu, Michel Galley, Baolin Peng, Hao Cheng, Gavin Li, Yao Dou, Weixin Cai, James Zou, Jure Leskovec, Jianfeng Gao
Paper: https://arxiv.org/abs/2502.00640, ICML submission
Code: http://aka.ms/CollabLLM
Model: https://huggingface.co/collabllm

TL;DR
What was done? This paper introduces CollabLLM, a training framework designed to transform Large Language Models (LLMs) from passive instruction-followers into active collaborators. The key innovation is "Multiturn-aware Rewards" (MR), a forward-looking reward mechanism. Instead of optimizing for the immediate next response, CollabLLM estimates the long-term impact of a response by simulating future conversational turns with an LLM-based user simulator. This simulation allows it to calculate a holistic reward that balances task success (extrinsic metrics) with user experience factors like efficiency and engagement (intrinsic metrics). The model is then fine-tuned using reinforcement learning (PPO/DPO) to maximize these long-term gains.
Why it matters? This work addresses a fundamental limitation of current LLMs: their passive nature in complex, multi-turn conversations. Real-world users often have ambiguous or evolving goals, leading to frustrating and inefficient interactions. By training models to proactively clarify intent, ask guiding questions, and optimize for the entire conversational outcome, CollabLLM makes a significant leap toward more human-centered AI. The approach is validated not just in simulations but through a large-scale study with 201 real users, which demonstrated a 17.6% increase in user satisfaction and a 10.4% reduction in task completion time. This research provides a scalable and effective blueprint for building genuinely helpful AI assistants that can act as strategic partners rather than just reactive tools.
ArXivIQ is a reader-supported publication. To receive new posts and support my work, consider becoming a free or paid subscriber.

## [ICML 2025] The Value of Prediction in Identifying the Worst-Off

Post: https://arxiviq.substack.com/p/icml-2025-the-value-of-prediction
Authors: Unai Fischer-Abaigar, Christoph Kern, Juan Carlos Perdomo
Paper: https://openreview.net/forum?id=26JsumCG0z
Code: The paper utilizes the open-source CatBoost library
Model: N/A

TL;DR
WHAT was done? This paper introduces a formal framework to evaluate the trade-off between improving a model's predictive accuracy and expanding bureaucratic capacity (i.e., screening more people) in government programs designed to help the "worst-off." The authors develop the Prediction-Access Ratio (PAR), a novel metric that quantifies the relative welfare benefit of investing in better predictions versus increasing the number of individuals who can be screened and supported. Through theoretical models and a real-world case study on long-term unemployment in Germany, they analyze the conditions under which each policy lever is more effective.
WHY it matters? This work provides a crucial counter-narrative to the "accuracy-first" mindset prevalent in applied machine learning. It demonstrates that in many real-world, resource-constrained scenarios, investing in the operational capacity to act on predictions yields greater societal benefits than marginal improvements in model accuracy. The PAR offers policymakers a principled, data-driven tool to move beyond isolated technical metrics and make holistic, cost-aware decisions about system design. The research signals a maturation of AI for social good, shifting the focus from "how accurate is the model?" to "what is the most effective way to improve welfare, and how does prediction fit in?"

## [ICML 2025] Roll the dice & look before you leap: Going beyond the creative limits of next-token prediction

Post: https://arxiviq.substack.com/p/icml-2025-outstanding-paper-award-fda
Authors: Vaishnavh Nagarajan, Chen Henry Wu, Charles Ding, Aditi Raghunathan
Paper: https://openreview.net/forum?id=Hi0SyHMmkd
Code: https://github.com/chenwu98/algorithmic-creativity
Model: N/A

TL;DR
WHAT was done? The authors introduce a novel suite of minimal, controllable algorithmic tasks designed to quantify the creative limits of language models. These tasks, inspired by real-world creativity (e.g., wordplay, problem design), require a "leap of thought"—an implicit, multi-step planning process. Using this testbed, the paper compares standard next-token prediction (NTP) against multi-token approaches like teacherless training and diffusion models. It also introduces "seed-conditioning," a new technique that injects random noise at the input layer to elicit diversity.
WHY it matters? This work provides strong, quantifiable evidence that the dominant NTP paradigm is fundamentally "myopic and memorizes excessively," struggling with tasks that demand foresight and originality. The results show that multi-token methods significantly boost "algorithmic creativity" and reduce memorization (Figure 3, 4). Furthermore, the surprising effectiveness of seed-conditioning, even with deterministic decoding, challenges the standard reliance on output-layer sampling for diversity. This research offers a principled path forward for developing more genuinely creative AI, moving beyond local text coherence toward models capable of the global planning needed for complex applications like scientific discovery and novel design.

## [ICML 2025] Train for the Worst, Plan for the Best: Understanding Token Ordering in Masked Diffusions

Post: https://arxiviq.substack.com/p/icml-2025-outstanding-paper-award
Authors: Jaeyeon Kim, Kulin Shah, Vasilis Kontonis, Sham Kakade, Sitan Chen
Paper: https://arxiv.org/abs/2502.06768
Code: N/A
Model: N/A

TL;DR
WHAT was done? This paper investigates the fundamental trade-off between training complexity and inference flexibility in Masked Diffusion Models (MDMs). It provides theoretical and empirical evidence that MDMs "train for the worst" by learning to solve an exponentially large and computationally difficult set of token infilling problems, in contrast to the simpler sequential task of autoregressive models (ARMs). However, the authors demonstrate that this apparent training weakness can be transformed into a powerful inference-time strength. By employing simple "adaptive inference" strategies that strategically choose the token decoding order, MDMs can "plan for the best," effectively sidestepping the hard subproblems encountered during training.
WHY it matters? This work provides a new lens for viewing generative model reasoning, showing that for certain complex tasks, inference-time flexibility can be more valuable than a more constrained training paradigm. On logic puzzles like Sudoku, an MDM with adaptive inference drastically improves its accuracy from under 7% to nearly 90%, outperforming even much larger ARMs that were explicitly taught the correct decoding order. The "train for the worst, plan for the best" philosophy challenges the dominance of autoregressive models for discrete sequence generation and opens new avenues for creating more robust and capable models for complex planning and problem-solving domains.

## Chain of Thought Monitorability: A New and Fragile Opportunity for AI Safety

Post: https://arxiviq.substack.com/p/chain-of-thought-monitorability-a
Authors: Tomek Korbak, Mikita Balesni, Elizabeth Barnes, Joe Benton, Mark Chen, Allan Dafoe, Scott Emmons, David Farhi, Dan Hendrycks, Evan Hubinger, Erik Jenner, Victoria Krakovna, David Lindner, Aleksander Mądry, Neel Nanda, Jakub Pachocki, Mary Phuong, Joshua Saxe, Martín Soto, Jasmine Wang, Bowen Baker, Rohin Shah, Vlad Mikulik, Yoshua Bengio, Joseph Bloom, Alan Cooney, Anca Dragan, Owain Evans, Ryan Greenblatt, Marius Hobbhahn, Geoffrey Irving, Daniel Kokotajlo, Shane Legg, David Luan, Julian Michael, Dave Orr, Ethan Perez, Fabien Roger, Buck Shlegeris, Eric Steinberger, Wojciech Zaremba.
Paper: https://arxiv.org/abs/2507.11473
Code: N/A
Model: N/A

TL;DR
WHAT was done? The paper introduces a conceptual framework for AI safety centered on "Chain of Thought (CoT) Monitorability." The authors argue that for reasoning models built on the Transformer architecture, CoT is not merely a prompting technique but a necessary form of working memory for completing complex, serial tasks. This externalization of the model's "thinking" process into human-readable language offers a unique, albeit imperfect, window into its internal state, allowing for automated monitoring to detect misbehavior, deception, or misalignment.
WHY it matters? This work highlights a significant, practical opportunity for AI oversight that is more interpretable than analyzing raw activations. However, the authors issue a critical warning: this monitorability is fragile. It is vulnerable to degradation from common development practices, such as aggressive outcome-based reinforcement learning, direct process supervision that encourages "safe-looking" but unfaithful reasoning, or the development of novel architectures that reason in opaque latent spaces. The paper serves as an urgent call to action for the AI community to actively research, evaluate, and preserve CoT monitorability, treating it as a critical safety property to be managed throughout the model development lifecycle.

## AgentsNet: Coordination and Collaborative Reasoning in Multi-Agent LLMs

Post: https://arxiviq.substack.com/p/agentsnet-coordination-and-collaborative
Authors: Florian Grötschla, Luis Müller, Mikhail Galkin, Jan Tönshoff, Bryan Perozzi
Paper: https://arxiv.org/abs/2507.08616
Code: https://github.com/floriangroetschla/AgentsNet
Model: N/A

TL;DR
The authors introduce AgentsNet, a novel benchmark designed to evaluate the coordination and collaborative reasoning of multi-agent LLM systems. It grounds evaluation in five fundamental, theoretically-backed problems from distributed computing: graph coloring, minimal vertex cover, maximal matching, leader election, and consensus. Agents are situated within diverse network topologies (e.g., small-world, scale-free) and interact via a structured, multi-round message-passing protocol. A key innovation is its scalability, testing systems with up to 100 agents, a significant leap from the 2-5 agents in typical benchmarks.
This work is significant because it moves beyond measuring simple task performance to rigorously assess the core competencies of decentralized coordination, self-organization, and communication. The findings reveal a critical bottleneck: while today's top LLMs perform well in small groups, their collaborative abilities collapse as the network size increases, with performance dropping to near-zero in 100-agent scenarios. AgentsNet provides a much-needed, scalable tool to diagnose these failures and guide the development of more robust, truly collaborative AI systems.

## Grounding Intelligence in Movement

Post: https://arxiviq.substack.com/p/grounding-intelligence-in-movement
Authors: Melanie Segado, Michael L. Platt, Felipe Parodi, Jordan K. Matelsky, Eva B. Dyer, Konrad P. Kording
Paper: https://arxiv.org/abs/2507.02771
Code: Not available
Model: Not available

TL;DR
WHAT was done? The authors present a position paper arguing that biological movement should be treated as a primary, first-class modeling target for AI, rather than an afterthought of vision or language models. They critique the fragmented landscape of current approaches—from video generators that defy physics to reinforcement learning agents that fail to generalize—and propose a unifying framework to build overarching movement models. This framework (Figure 2) emphasizes cross-modal data integration (video, IMU, EMG, etc.), strict adherence to biomechanical and physical constraints, deep contextual awareness, and generalizability across diverse species and tasks.
WHY it matters? This work directly confronts a modern-day manifestation of Moravec's paradox: AI's persistent struggle with motor tasks that are trivial for most biological organisms. By advocating for a dedicated, foundational approach to movement, the paper charts a path to overcoming the limitations of current systems, which often lack physical plausibility and contextual understanding. Success in this area would not only advance core AI capabilities in generation and control but also create a shared foundation for understanding behavior across biological and artificial systems, unlocking transformative applications in robotics, medicine, neuroscience, and conservation.

## Mixture-of-Recursions: Learning Dynamic Recursive Depths for Adaptive Token-Level Computation

Post: https://arxiviq.substack.com/p/mixture-of-recursions-learning-dynamic
Authors: Sangmin Bae, Yujin Kim, Reza Bayat, Sungnyun Kim, Jiyoun Ha, Tal Schuster, Adam Fisch, Hrayr Harutyunyan, Ziwei Ji, Aaron Courville, and Se-Young Yun
Paper: https://www.arxiv.org/abs/2507.10524
Code: https://github.com/raymin0223/mixture_of_recursions
Model: N/A

TL;DR
What was done? The authors introduce Mixture-of-Recursions (MoR), a novel Transformer framework that unifies two major efficiency paradigms: parameter sharing and adaptive computation. MoR reuses a shared block of layers across multiple recursion steps for parameter efficiency. Crucially, it employs lightweight routers to dynamically assign a different number of recursion steps (i.e., computational depth) to each individual token based on its complexity. This adaptive "thinking" is complemented by integrated, memory-efficient Key-Value (KV) caching strategies that selectively cache or share KV pairs based on the routing decisions, reducing memory footprint and prefill latency.
Why it matters? MoR establishes a new Pareto frontier for language model efficiency. By intelligently allocating computation, it achieves superior or comparable performance to much larger vanilla models while using significantly fewer unique parameters and less training compute. For example, an MoR model with 167M parameters outperforms a 315M-parameter vanilla baseline when trained with the same FLOPs budget. This work demonstrates that large-model quality is attainable without incurring large-model costs, making advanced AI more accessible for training and deployment. Furthermore, the adaptive depth mechanism provides a structural basis for "latent reasoning," paving the way for more intrinsically efficient and capable models.

## Frontier LLMs Still Struggle with Simple Reasoning Tasks

Post: https://arxiviq.substack.com/p/frontier-llms-still-struggle-with
Authors: Alan Malek, Jiawei Ge, Nevena Lazic, Chi Jin, András György, and Csaba Szepesvári
Paper: https://arxiv.org/abs/2507.07313
Code: https://www.github.com/google-deepmind/unpuzzles_and_simple_reasoning/ (not available at the moment)
Model: N/A

TL;DR
WHAT was done? The authors conducted a comprehensive evaluation of frontier LLMs, including the latest "thinking" models (like OpenAI's o1/o3 and Google's Gemini Pro models), on a novel set of simple reasoning benchmarks. These benchmarks consist of (1) procedurally generated tasks (e.g., counting, logic, planning) with tunable "tediousness" to scale computational load without changing the fundamental difficulty, and (2) the UNPUZZLES dataset, which contains well-known logical puzzles alongside their manually trivialized versions ("unpuzzles").
WHY it matters? This work provides a crucial reality check on the state of AI reasoning. It demonstrates that even the most advanced models are surprisingly brittle, with performance degrading on simple tasks as they become longer or more computationally intensive. More strikingly, the research reveals that models often fail on trivialized "unpuzzles" while succeeding on the original, complex versions. This phenomenon, termed "reasoning delirium," suggests that their impressive performance on benchmarks often stems from sophisticated memorization and statistical shortcuts rather than robust, generalizable logic. These findings challenge the narrative of ever-advancing AI reasoning, highlight the inadequacy of existing benchmarks, and underscore the need for caution when deploying these models in real-world applications.
ArXivIQ is a reader-supported publication. To receive new posts and support my work, consider becoming a free or paid subscriber.

## Memory Mosaics at scale

Post: https://arxiviq.substack.com/p/memory-mosaics-at-scale
Authors: Jianyu Zhang, Léon Bottou
Paper: https://arxiv.org/abs/2507.03285
Code: N/A
Model: N/A

TL;DR
WHAT was done? The authors successfully scaled "Memory Mosaics," a neural architecture based on associative memories, to the llama-8B size, training it on one trillion tokens. They introduce an enhanced version, "Memory Mosaics v2" (MMv2), featuring three key architectural innovations: an adaptive bandwidth for the memory's kernel, a gated time-variant key extractor for more context-aware feature representation, and a novel 3-level memory system that explicitly separates short-term, long-term, and persistent knowledge.
WHY it matters? This work presents a compelling challenge to the dominant "more data, more compute" scaling paradigm. MMv2 significantly outperforms traditional transformers on tasks requiring new-knowledge storage and in-context learning, even when trained on substantially less data—an MMv2 model trained on 1 trillion tokens surpasses a transformer trained on 8 trillion tokens on these key metrics. This suggests that architectural intelligence, rather than brute-force scaling alone, can be a more efficient path toward creating adaptable AI models. It provides strong evidence that how a model is designed to learn and remember can be more critical than simply the volume of data it consumes.

## Dynamic Chunking for End-to-End Hierarchical Sequence Modeling

Post: https://arxiviq.substack.com/p/dynamic-chunking-for-end-to-end-hierarchical
Authors: Sukjun Hwang, Brandon Wang, Albert Gu
Paper: https://arxiv.org/abs/2507.07955
Code: https://github.com/goombalab/hnet
Model: https://huggingface.co/cartesia-ai

TL;DR
WHAT was done? The authors introduce H-Net, a novel hierarchical network that replaces traditional fixed-vocabulary tokenization with a learned, end-to-end mechanism. If you remember the recent Byte Latent Transformer (BLT), H-Net goes beyond that to being truly end-to-end. At its core is "Dynamic Chunking" (DC), a system that automatically learns to segment raw byte sequences based on content and context. This is achieved through a similarity-based routing module that predicts chunk boundaries and a crucial smoothing module—based on an Exponential Moving Average (EMA)—that makes the discrete chunking process differentiable and stable for training. The architecture is recursive, allowing for multiple stages of hierarchy to learn increasingly complex abstractions.
WHY it matters? This work marks a significant step toward truly end-to-end foundation models, directly addressing a long-standing bottleneck in AI. By learning its own segmentation, H-Net not only outperforms strong BPE-tokenized Transformers on standard benchmarks but also scales more effectively with data (Figure 3). It demonstrates dramatically improved character-level robustness and superior performance on languages (Chinese, code) and modalities (DNA) where handcrafted tokenization struggles (Table 4, Figure 5, Figure 6). This research provides a powerful, generalizable blueprint for future models that learn more with less preprocessing, a tangible validation of the " bitter lesson " in a critical domain.

## Fast and Simplex: 2-Simplicial Attention in Triton

Post: https://arxiviq.substack.com/p/fast-and-simplex-2-simplicial-attention
Authors: Aurko Roy, Timothy Chou, Sai Surya Duvvuri, Sijia Chen, Jiecao Yu, Xiaodong Wang, Manzil Zaheer, Rohan Anil
Paper: https://arxiv.org/abs/2507.02754
Code: N/A
Model: N/A

TL;DR
WHAT was done? This paper explores the 2-simplicial Transformer, an architecture that replaces the standard dot-product attention with a more expressive trilinear function. Instead of comparing a query-key pair, this method assesses interactions between a query and two key vectors simultaneously (query, key, key'). To overcome the cubic computational complexity, the authors developed a highly efficient sliding-window implementation using a custom Triton kernel. They trained and evaluated large Mixture-of-Experts (MoE) models with interleaved 2-simplicial attention layers, comparing them against standard Transformer baselines on tasks requiring math, coding, and logical reasoning.
WHY it matters? The key finding is that 2-simplicial attention fundamentally alters the exponent (α) in the neural scaling laws that relate model loss to the number of parameters. While most architectural changes only improve performance by a constant factor, this work shows that 2-simplicial attention achieves a steeper scaling curve (a higher α), meaning it learns more efficiently from a fixed number of tokens. This is a significant contribution as the field confronts the limits of high-quality training data, suggesting that architectural innovation—not just scaling data and compute—is a powerful lever for building more parameter- and token-efficient models, especially for complex reasoning tasks.

## MemOS: A Memory OS for AI System

Post: https://arxiviq.substack.com/p/memos-a-memory-os-for-ai-system
Authors: Zhiyu Li, Shichao Song, Chenyang Xi, Hanyu Wang, Chen Tang, Simin Niu, Ding Chen, Jiawei Yang, Chunyu Li, Qingchen Yu, Jihao Zhao, Yezhaohui Wang, Peng Liu, Zehao Lin, Pengyuan Wang, Jiahao Huo, Tianyi Chen, Kai Chen, Kehang Li, Zhen Tao, Junpeng Ren, Huayi Lai, Hao Wu, Bo Tang, Zhengren Wang, Zhaoxin Fan, Ningyu Zhang, Linfeng Zhang, Junchi Yan, Mingchuan Yang, Tong Xu, Wei Xu, Huajun Chen, Haofeng Wang, Hongkang Yang, Wentao Zhang, Zhi-Qin John Xu, Siheng Chen, Feiyu Xiong
Paper: https://arxiv.org/abs/2507.03724
Code: https://github.com/MemTensor/MemOS
Model: N/A

TL;DR
WHAT was done? The paper introduces MemOS (Memory Operating System), a novel framework that treats memory in Large Language Models (LLMs) as a first-class, manageable system resource. It unifies the management of disparate memory types—plaintext (external documents), activation (KV-cache, hidden states), and parameter (model weights)—into a standardized unit called the MemCube. Each MemCube encapsulates not only memory content but also crucial metadata for provenance, versioning, and access control. MemOS is built on a three-layer architecture that provides OS-like services, including a MemScheduler for dynamic loading, MemLifecycle for state management, and MemGovernance for security and compliance.
WHY it matters? This work represents a significant paradigm shift from stateless, ad-hoc memory solutions like Retrieval-Augmented Generation (RAG) to a deeply integrated, stateful memory architecture. By enabling controllability, plasticity, and evolvability, MemOS addresses critical LLM limitations in long-context reasoning, continual personalization, and knowledge consistency. Experimentally, it achieves state-of-the-art performance on the LOCOMO benchmark and dramatically reduces inference latency via KV-cache acceleration. This provides a foundational infrastructure for developing the next generation of persistent, adaptive, and scalable AI agents.
ArXivIQ is a reader-supported publication. To receive new posts and support my work, consider becoming a free or paid subscriber.

## Sequential Diagnosis with Language Models

Post: https://arxiviq.substack.com/p/sequential-diagnosis-with-language
Authors: Harsha Nori, Mayank Daswani, Christopher Kelly, Scott Lundberg, Marco Tulio Ribeiro, Marc Wilson, Xiaoxuan Liu, Viknesh Sounderajah, Jonathan M Carlson, Matthew P Lungren, Bay Gross, Peter Hames, Mustafa Suleyman, Dominic King, Eric Horvitz
Paper: https://arxiv.org/abs/2506.22405
Code: The authors state they are working with partners to potentially release the SDBench benchmark publicly.
Model: N/A

TL;DR
WHAT was done? This paper introduces two key innovations to advance AI in medical diagnosis. First, the Sequential Diagnosis Benchmark (SDBench), a new evaluation framework built from 304 challenging New England Journal of Medicine (NEJM) cases. Unlike static tests, SDBench simulates real-world clinical practice by forcing diagnostic agents (AI or human) to iteratively ask questions and order tests from an information "Gatekeeper," with performance measured by both accuracy and cost. Second, the authors present the MAI Diagnostic Orchestrator (MAI-DxO), a model-agnostic system that simulates a panel of AI "physician" personas who collaboratively "debate" and reason through cases.
ArXivIQ is a reader-supported publication. To receive new posts and support my work, consider becoming a free or paid subscriber.

## Early Signs of Steganographic Capabilities in Frontier LLMs

Post: https://arxiviq.substack.com/p/early-signs-of-steganographic-capabilities
Authors: Artur Zolkowski, Kei Nishimura-Gasparian, Robert McCarthy, Roland S. Zimmermann, David Lindner
Paper: https://arxiv.org/abs/2507.02737
Code: https://github.com/arturzolkowski/steganographic-evals
Model: N/A

TL;DR
WHAT was done? This paper presents the first systematic evaluation of steganography in frontier Large Language Models (LLMs), assessing two distinct capabilities: encoded message passing and encoded reasoning. The authors developed a reusable open-source evaluation suite, a novel "State-Tracking" dataset for covert sequential reasoning, and compelling case studies demonstrating potential misuse. The methodology rigorously tests models under various conditions, such as with and without access to an unmonitored scratchpad (Chain-of-Thought), with and without prior coordination on encoding schemes, and across a range of common and uncommon ciphers.
ArXivIQ is a reader-supported publication. To receive new posts and support my work, consider becoming a free or paid subscriber.

## Vision-Language Models Create Cross-Modal Task Representations

Post: https://arxiviq.substack.com/p/vision-language-models-create-cross
Authors: Grace Luo, Trevor Darrell, Amir Bar
Paper: [ICML 2025] https://openreview.net/forum?id=77ziPGdQct, https://arxiv.org/abs/2410.22330
Code: https://vlm-cross-modal-reps.github.io/
Model: N/A

TL;DR
This paper provides compelling empirical evidence that Vision-Language Models (VLMs) develop a shared, abstract "task vector" to represent tasks internally. This representation is invariant to the input modality (image or text) and format (examples or instructions). The authors demonstrate this through a technique called "cross-modal patching," where this compressed task vector is extracted from one modality and injected into the model's processing of another. This method is shown to be more effective than traditional few-shot prompting for steering model behavior across modalities. For example, a task learned from text examples can be successfully applied to an image query, often with higher accuracy and lower resource usage due to the ability to cache and reuse the compact task vector.
ArXivIQ is a reader-supported publication. To receive new posts and support my work, consider becoming a free or paid subscriber.

## ASTRO: Teaching Language Models to Reason by Reflecting and Backtracking In-Context

Post: https://arxiviq.substack.com/p/astro-teaching-language-models-to
Authors: Joongwon Kim, Anirudh Goyal, Liang Tan, Hannaneh Hajishirzi, Srini Iyer, Tianlu Wang
Paper: https://arxiv.org/abs/2507.00417
Code: Not provided
Model: Not provided

TL;DR
What was done? The authors introduce ASTRO (Autoregressive Search-Taught Reasoner), a three-stage framework to teach language models to reason like search algorithms. The process starts by using Monte Carlo Tree Search (MCTS) to generate a synthetic dataset of mathematical problem-solving trajectories. Critically, these trajectories are converted into natural language Chain-of-Thought (CoT) solutions that explicitly encode self-reflection (" But wait, are we solving the problem correctly? ") and backtracking. The model is first fine-tuned on this data (SFT) and then further improved with reinforcement learning (RL) using verifiable rewards. This teaches the model to internalize structured search behaviors, allowing it to explore, identify errors, and backtrack to correct its reasoning path within a single, continuous generation.
ArXivIQ is a reader-supported publication. To receive new posts and support my work, consider becoming a free or paid subscriber.

## Improved Representation Steering for Language Models

Post: https://arxiviq.substack.com/p/beyond-prompts
Authors: Zhengxuan Wu, Qinan Yu, Aryaman Arora, Christopher D. Manning, Christopher Potts
Paper: https://arxiv.org/abs/2505.20809
Code: github.com/stanfordnlp/axbench
Model: N/A

TL;DR
WHAT? The paper introduces Reference-free Preference Steering (RePS), a new bidirectional preference optimization objective for training lightweight, intervention-based methods (like steering vectors) to control language models. Unlike previous methods, RePS is "reference-free," meaning it isn't constrained by the original model's likelihoods, allowing for more significant behavioral changes. It jointly optimizes for both incorporating a concept (steering) and removing it (suppression).
ArXivIQ is a reader-supported publication. To receive new posts and support my work, consider becoming a free or paid subscriber.

## INTUITOR: Unlocking AI Reasoning with Self-Certainty

Post: https://arxiviq.substack.com/p/intuitor-unlocking-ai-reasoning-with
Authors: Xuandong Zhao, Zhewei Kang, Aosong Feng, Sergey Levine, Dawn Song
Paper: https://arxiv.org/abs/2505.19590
Code: https://github.com/sunblaze-ucb/Intuitor
Model: N/A

TL;DR
WHAT was done? The paper introduces Reinforcement Learning from Internal Feedback (RLIF), a framework where LLMs improve their reasoning skills without external supervision. The authors propose INTUITOR, a novel RLIF method that uses the model's own "self-certainty"—defined as the KL divergence between its output distribution and a uniform one—as its sole intrinsic reward signal. This signal is integrated into the Group Relative Policy Optimization (GRPO) framework, replacing external, verifiable rewards and enabling fully unsupervised learning.
WHY it matters? This work offers a compelling alternative to the costly and domain-specific nature of existing methods like RLHF and RLVR. By learning from its own confidence, INTUITOR matches the performance of supervised methods on in-domain math tasks while demonstrating superior generalization to out-of-domain tasks like code generation. The approach also fosters the emergence of structured reasoning and is robust to reward exploitation, a common failure mode in RL. INTUITOR represents a significant and scalable step towards more autonomous AI systems that can learn and refine complex skills in environments where external validation is scarce or impossible.

## Why Transformers are Graph Neural Networks Winning the Hardware Lottery

Post: https://arxiviq.substack.com/p/bridging-the-gap
Authors: Chaitanya K. Joshi
Paper: https://arxiv.org/abs/2506.22084
Code: N/A
Model: N/A

TL;DR
WHAT was done? This paper formally establishes that the Transformer architecture is a specific instance of a Graph Neural Network (GNN). It demonstrates that the multi-head self-attention mechanism is mathematically equivalent to a message-passing GNN operating on a fully connected graph, where every input token is a node that attends to every other token. This perspective recasts the input sequence not as a line, but as a complete graph where positional encodings act as soft structural hints rather than hard constraints.
WHY it matters? This unifying perspective provides two crucial insights. First, it clarifies that Transformers are highly expressive "set processing networks" capable of learning complex global relationships without the constraints of a predefined sparse graph. Second, it powerfully argues that the Transformer's dominance is a result of "winning the hardware lottery" (a concept explored in https://arxiv.org/abs/2009.06489 ). Its implementation via dense matrix operations is vastly more efficient and scalable on modern GPUs and TPUs than the sparse message-passing operations typically used by GNNs. This hardware alignment, not just theoretical superiority, is presented as the key driver behind the Transformer's unprecedented success and the rise of foundation models.
In case you feel Deja Vu, you are not mistaken. The same author explored this idea five years ago, but without hardware lottery (the paper on that emerged later).

## From Classical Control to Deep Learning

Post: https://arxiviq.substack.com/p/from-classical-control-to-deep-learning
Authors: Jialiang Zhang, Haoran Geng, Yang You, Congyue Deng, Pieter Abbeel, Jitendra Malik, Leonidas Guibas
Paper: https://arxiv.org/abs/2506.02618
Code: The authors state that code, datasets, and models will be released upon acceptance.
Model: N/A

TL;DR
WHAT was done? The paper introduces the Neural Rodrigues Operator, a learnable generalization of the classical Rodrigues' rotation formula from robot control. This novel operator replaces the formula's fixed coefficients with trainable weights and generalizes joint angles to abstract, high-dimensional features. Building on this, the authors design the Rodrigues Network (RodriNet), a complete neural architecture that embeds the kinematic structure of articulated systems (like robots or hands) as a fundamental inductive bias. The network uses specialized layers to manage information flow along the kinematic chain, combined with self-attention for global context.
WHY it matters? In an era increasingly dominated by large, generalist models, this work makes a powerful case for specialized, physics-informed architectures. Unlike generic models like MLPs and Transformers that treat robot actions as unstructured data, RodriNet is inherently "kinematics-aware." This architectural prior leads to significant, measurable benefits: superior accuracy, dramatically faster convergence, and greater data efficiency. It achieves state-of-the-art results in both robotic manipulation and 3D hand reconstruction, often with far fewer parameters than competing methods. This provides a compelling blueprint for designing more efficient and robust architectures for embodied AI.

## Teaching AI to Challenge Itself

Post: https://arxiviq.substack.com/p/teaching-ai-to-challenge-itself
Authors: Yifei Zhou, Sergey Levine, Jason Weston, Xian Li, Sainbayar Sukhbaatar
Paper: https://arxiv.org/abs/2506.01716
Code: Not provided
Model: Not provided

TL;DR
This paper introduces the Self-Challenging Agent (SCA), a framework that enables Large Language Model (LLM) agents to autonomously generate their own high-quality training tasks. The agent plays two roles: a "challenger" that actively explores an environment and its tools to create novel problems, and an "executor" that learns by solving them.
The key innovation is the "Code-as-Task" (CaT) formalism. It defines each task with an instruction, a verification function, an example solution, and failure cases—all expressed in executable code. This structure allows for the automatic filtering of flawed or trivial tasks, ensuring the self-generated curriculum is robust and effective.
This matters because it addresses a primary bottleneck in developing capable AI agents: the costly and unscalable process of human task creation. By generating its own training data, the SCA framework demonstrated an average relative success rate improvement of 95.8% for a Llama-3.1-8B model on complex tool-use benchmarks, showcasing a promising path toward a "self-improvement flywheel" for creating more autonomous and adaptive AI systems.

## The Double-Edged Sword of Self-Supervision

Post: https://arxiviq.substack.com/p/the-double-edged-sword-of-self-supervision
Authors: Sheikh Shafayat, Fahim Tajwar, Ruslan Salakhutdinov, Jeff Schneider, Andrea Zanette
Paper: https://arxiv.org/abs/2505.21444
Code: https://github.com/tajwarfahim/srt
Model: N/A

TL;DR
WHAT was done? The paper introduces Self-Rewarded Training (SRT), a novel reinforcement learning framework that enables large language models (LLMs) to self-train on complex mathematical reasoning tasks without ground-truth supervision. The method leverages the model's own self-consistency—using majority voting over multiple generated answers—to create an intrinsic reward signal. This pseudo-reward guides the model's training, allowing it to iteratively improve its capabilities by being plugged into standard RL algorithms.
ArXivIQ is a reader-supported publication. To receive new posts and support my work, consider becoming a free or paid subscriber.

## MatFormer: One Transformer to Flexibly Serve All Deployment Needs

Post: https://arxiviq.substack.com/p/matformer-one-transformer-to-flexibly
Authors: Devvrit, Sneha Kudugunta, Aditya Kusupati, Tim Dettmers, Kaifeng Chen, Inderjit Dhillon, Yulia Tsvetkov, Hannaneh Hajishirzi, Sham Kakade, Ali Farhadi, Prateek Jain
Paper: https://arxiv.org/abs/2310.07707
Code: https://github.com/devvrit/matformer
Model: N/A

TL;DR
WHAT was done? The authors introduce MatFormer, a novel Transformer architecture designed for "elastic inference." By incorporating a nested, "matryoshka doll-style" structure within the Feed-Forward Network (FFN) blocks, MatFormer enables the training of a single, universal model. From this one model, hundreds of smaller, accurate submodels can be extracted at inference time without any additional training or fine-tuning. A simple and efficient heuristic, "Mix'n'Match," is also proposed to select the best submodel for a given compute budget by combining different layer sizes.
WHY it matters? This work tackles a major bottleneck in deploying large foundation models: the high cost and rigidity of being limited to a few fixed model sizes. MatFormer offers a paradigm shift from training many models to training just one, drastically reducing the amortized training cost and providing unprecedented flexibility. This allows practitioners to deploy an optimally-sized model for any latency or cost constraint, from cloud servers to edge devices. The extracted submodels not only match but often outperform their independently trained counterparts and significantly accelerate inference through techniques like speculative decoding, making powerful AI more efficient, accessible, and adaptable to real-world needs.

## Beyond Sparsity: Uncovering the Functional Roles of Dense Latents in LLMs

Post: https://arxiviq.substack.com/p/beyond-sparsity-uncovering-the-functional
Authors: Joshua Engels, Xiaoqing Sun, Alessandro Stolfo, Ben Wu, Mrinmaya Sachan, Senthooran Rajamanoharan, Max Tegmark
Paper: https://arxiv.org/abs/2506.15679
Code: The paper utilizes the Sparsify and TransformerLens libraries.
Model: N/A

TL;DR
WHAT was done? This paper systematically investigates "dense" (frequently activating) latents in Sparse Autoencoders (SAEs) trained on language models. Through a series of ablation experiments, geometric analyses, and causal interventions, the authors demonstrate that these latents are not undesirable training artifacts but rather intrinsic, functional features of the underlying language model. They introduce a comprehensive taxonomy classifying these dense features into distinct roles, including position tracking, context-dependent semantic binding, output entropy regulation, and lexical signal encoding.
WHY it matters? This work fundamentally challenges the prevailing assumption in interpretability research that only sparse features are meaningful and that dense latents are "bugs" to be eliminated. It reveals that language models rely on dense representations for crucial, often structural, computations. This forces a re-evaluation of SAE design and sparsity objectives, suggesting that future interpretability tools must account for both sparse and dense components to build a complete picture of model internals. This deeper understanding is a significant step toward developing more robust, controllable, and truly interpretable AI systems.

## Router-R1 

Post: https://arxiviq.substack.com/p/router-r1
Authors: Haozhen Zhang, Tao Feng, Jiaxuan You
Paper: https://arxiv.org/abs/2506.09033
Code: https://github.com/ulab-uiuc/Router-R1
Model: N/A

TL;DR
WHAT? The paper introduces Router-R1, a reinforcement learning (RL) framework that trains an LLM to act as an intelligent "orchestrator." This orchestrator learns to solve complex tasks by coordinating a pool of other specialized LLMs through a sequential, multi-round process. It interleaves internal reasoning ("think" actions) with dynamic model invocation ("route" actions), iteratively building a solution by synthesizing information from multiple sources.
WHY? This work moves beyond the limitations of traditional single-shot LLM routers, which assign a query to only one model. By treating routing as a sequential decision problem, Router-R1 can tackle complex, multi-hop reasoning that requires the complementary strengths of diverse models. From a certain perspective, this elevates the routing concept from a low-level efficiency trick (like in Mixture-of-Experts) to a high-level cognitive strategy, akin to a "Mixture-of-Agents." Its novel, lightweight reward system, which includes a cost component, enables the optimization of both performance and computational expense. Furthermore, Router-R1 demonstrates strong generalization to new, unseen LLMs without retraining, making it a highly adaptable and practical solution for dynamic, real-world AI ecosystems.

## Smarter Teachers, Not Bigger Models 

Post: https://arxiviq.substack.com/p/smarter-teachers-not-bigger-models
Authors: Edoardo Cetin, Tianyu Zhao, Yujin Tang
Paper: https://arxiv.org/abs/2506.08388
Code: https://github.com/SakanaAI/RLT
Model: N/A

TL;DR
WHAT was done? (Sakana.ai again) The paper introduces a new framework for training Reinforcement-Learned Teachers (RLTs). Instead of training language models (LMs) to solve complex problems from scratch—a task hampered by RL's notorious exploration challenge—this work reframes the objective. RLTs are given both the question and its solution, and their task is to generate the most effective, step-by-step explanation. They are trained with a novel, dense reward function that directly measures the quality of their teaching by evaluating a "student" model's understanding ( rSS ) and the logical clarity of the explanation itself ( rKL ).
WHY it matters? This approach sidesteps the exploration problem of traditional RL and aligns the training objective with the practical goal of knowledge distillation. The results are striking: a small 7B parameter RLT can generate raw reasoning traces that lead to better-performing student models than distillation pipelines using LMs orders of magnitude larger (Figure 1). This method improves efficiency, enhances the reusability of models through strong zero-shot transfer, and simplifies the distillation pipeline by removing the need for costly post-processing. It represents a significant step toward democratizing advanced RL-based reasoning, suggesting that training smaller, specialized "teacher" models is a more effective and accessible path than endlessly scaling "solver" models.

## From Black Box to Brain-Like 

Post: https://arxiviq.substack.com/p/from-black-box-to-brain-like
Authors: Badr AlKhamissi, C. Nicolò De Sabbata, Zeming Chen, Martin Schrimpf, Antoine Bosselut
Paper: https://arxiv.org/abs/2506.13331
Code: https://bkhmsi.github.io/mixture-of-cog-reasoners
Model: N/A

TL;DR
WHAT was done? The paper introduces the Mixture of Cognitive Reasoners (MICRO) architecture, a modular language model inspired by the functional specialization of the human brain. The authors partition a pretrained transformer's layers into four distinct "expert" modules—Language, Logic, Social, and World—each corresponding to a well-studied cognitive network. This specialization is induced and maintained through a novel three-stage training curriculum, which begins by pretraining the experts on a small, curated dataset to instill targeted inductive biases before large-scale, end-to-end finetuning.
ArXivIQ is a reader-supported publication. To receive new posts and support my work, consider becoming a free or paid subscriber.

## Unchaining Language Models from Fixed Tokens

Post: https://arxiviq.substack.com/p/unchaining-language-models-from-fixed
Authors: Mathurin Videau, Badr Youbi Idrissi, Alessandro Leite, Marc Schoenauer, Olivier Teytaud, and David Lopez-Paz
Paper: https://arxiv.org/abs/2506.14761
Code: https://github.com/facebookresearch/lingua/tree/main/apps/aunet
Model: N/A

TL;DR
WHAT was done? The paper introduces the Autoregressive U-Net (AU-Net), a novel architecture that learns to tokenize text internally as part of its training process. Instead of relying on a fixed, external tokenizer like Byte Pair Encoding (BPE), AU-Net operates directly on raw bytes. It uses a U-Net-like structure with contracting and expanding paths to dynamically pool bytes into hierarchical, multi-scale representations—from bytes to words, and then to multi-word chunks. This process is guided by adaptive pooling and skip connections that preserve information flow across granularities.
ArXivIQ is a reader-supported publication. To receive new posts and support my work, consider becoming a free or paid subscriber.

## From Tool to Strategist: LLM-First Search Redefines AI Reasoning

Post: https://arxiviq.substack.com/p/from-tool-to-strategist-llm-first
Authors: Nathan Herr, Tim Rocktäschel, Roberta Raileanu
Paper: https://arxiv.org/abs/2506.05213
Code: https://github.com/NathanHerr/LLM-First-Search
Model: N/A

TL;DR
WHAT was done? This paper introduces LLM-First Search (LFS), a novel reasoning framework where the Large Language Model (LLM) itself autonomously controls the problem-solving search process. Unlike established methods like Monte Carlo Tree Search (MCTS) or Tree-of-Thoughts, which rely on fixed exploration hyperparameters and external heuristics, LFS empowers the LLM to dynamically decide whether to exploit the current reasoning path or explore alternative branches. The model achieves this through dedicated prompts for evaluation (scoring potential actions) and exploration (deciding whether to backtrack), effectively internalizing the entire search strategy.
WHY it matters? This approach marks a paradigm shift from LLMs merely augmenting classical search algorithms to LLMs becoming self-guided problem-solvers. Experimentally, LFS demonstrates superior performance and computational efficiency, especially on more difficult reasoning tasks (Countdown, Sudoku) where traditional methods often falter due to rigid exploration strategies. It scales more effectively with stronger LLMs and increased compute budgets, eliminating the need for costly, task-specific hyperparameter tuning. This work paves the way for more adaptive, robust, and general-purpose AI agents capable of tackling complex problems with greater autonomy.

## Log-Linear Attention

Post: https://arxiviq.substack.com/p/log-linear-attention
Authors: Han Guo, Songlin Yang, Tarushii Goel, Eric P. Xing, Tri Dao, Yoon Kim
Paper: https://arxiv.org/abs/2506.04761
Code: https://github.com/HanGuo97/log-linear-attention
Model: N/A

TL;DR
WHAT was done? The authors introduce Log-Linear Attention, a novel attention mechanism designed to bridge the gap between the quadratic complexity of softmax attention and the expressiveness limitations of linear attention and State Space Models (SSMs). The core innovation is replacing the fixed-size hidden state of linear models with a logarithmically growing set of hidden states, managed through a hierarchical Fenwick tree-based partitioning scheme. This results in a mechanism with log-linear ( O(T*logT) ) training compute, logarithmic ( O(logT) ) decoding memory, and a matmul-rich parallel form suitable for modern accelerators.
ArXivIQ is a reader-supported publication. To receive new posts and support my work, consider becoming a free or paid subscriber.

## Breaking the Speed Barrier in Diffusion-Based Planning

Post: https://arxiviq.substack.com/p/breaking-the-speed-barrier-in-diffusion
Authors: Jaesik Yoon, Hyeonseo Cho, Yoshua Bengio, Sungjin Ahn
Paper: https://arxiv.org/abs/2506.09498
Code: Not publicly available at the time of this review.
Model: Not publicly available at the time of this review.

TL;DR
WHAT was done? The paper introduces Fast Monte Carlo Tree Diffusion (Fast-MCTD), a framework that dramatically accelerates Monte Carlo Tree Diffusion (MCTD), a powerful but computationally expensive planning method. It achieves this by integrating two key techniques: Parallel MCTD (P-MCTD), which executes multiple MCTS rollouts concurrently using delayed tree updates and a novel Redundancy-Aware Selection (RAS) mechanism to ensure diverse exploration; and Sparse MCTD (S-MCTD), which reduces the computational cost of each rollout by planning over abstract, coarsened trajectories created by subsampling the original plan.
ArXivIQ is a reader-supported publication. To receive new posts and support my work, consider becoming a free or paid subscriber.

## Surfer-H and Holo1

Post: https://arxiviq.substack.com/p/surfer-h-and-holo1
Authors: M. Andreux, B. Baldas Skuk, H. Benchekroun, E. Biré, A. Bonnet, R. Bordie, N. Bout, M. Brunel, P.-L. Cedoz, A. Chassang, M. Chen, A.D. Constantinou, A. d'Andigné, H. de La Jonquière, A. Delfosse, L. Denoyer, A. Deprez, A. Derupti, M. Eickenberg, M. Federico, C. Kantor, X. Koegler, Y. Labbé, M.C.H. Lee, E. Le Jumeau de Kergaradec, A. Mahla, A. Manevich, A. Maret, C. Masson, R. Maurin, A. Mena, P. Modard, A. Moyal, A. Nguyen Kerbel, J. Revelle, M. L. Richter, M. Santos, L. Sifre, M. Theillard, M. Thibault, L. Thiry, L. Tronchon, N. Usunier, and T. Wu
Paper: https://arxiv.org/abs/2506.02865
Code: N/A
Model: https://huggingface.co/collections/Hcompany/holo1-683dd1eece7eb077b96d0cbd

TL;DR
WHAT was done? The paper introduces Surfer-H, a modular web agent that operates directly on screenshots, bypassing the need for DOM or API access. This agent is powered by Holo1, a new family of open-weight Vision-Language Models (VLMs) in 3B and 7B parameter sizes, specifically specialized for web interaction tasks. The authors trained Holo1 on a meticulously curated data mixture that includes web crawls, synthetic data designed to address known failure cases (e.g., complex calendars, tables), and crucially, successful behavioral traces from prior agent executions. They also introduce and open-source WebClick, a new benchmark for evaluating UI element localization on web pages.
ArXivIQ is a reader-supported publication. To receive new posts and support my work, consider becoming a free or paid subscriber.

## Self-Adapting Language Models 

Post: https://arxiviq.substack.com/p/self-adapting-language-models
Authors: Adam Zweiger, Jyothish Pari, Han Guo, Ekin Akyürek, Yoon Kim, and Pulkit Agrawal
Paper: https://arxiv.org/abs/2506.10943
Code: https://jyopari.github.io/posts/seal
Model: N/A

TL;DR
WHAT was done? The paper introduces Se lf- A dapting L anguage Models (SEAL), a framework enabling LLMs to self-adapt by generating their own finetuning data and update directives, termed "self-edits." This process is governed by a nested loop system: an inner loop updates the model's weights via supervised finetuning (SFT) based on a generated self-edit, while an outer reinforcement learning (RL) loop optimizes the model's ability to generate effective self-edits. The reward signal for the RL loop is the downstream performance of the model after the weight update, directly training the LLM to learn how to learn more efficiently.
ArXivIQ is a reader-supported publication. To receive new posts and support my work, consider becoming a free or paid subscriber.

## MesaNet

Post: https://arxiviq.substack.com/p/mesanet
Authors: Johannes von Oswald, Nino Scherrer, Seijin Kobayashi, Luca Versari, Songlin Yang, Maximilian Schlegel, Kaitlin Maile, Yanick Schimpf, Oliver Sieberling, Alexander Meulemans, Rif A. Saurous, Guillaume Lajoie, Charlotte Frenkel, Razvan Pascanu, Blaise Agüera y Arcas, and João Sacramento
Paper: https://arxiv.org/abs/2506.05233
Code: https://github.com/fla-org/flash-linear-attention
Model: N/A

TL;DR
WHAT was done? The paper introduces MesaNet, a recurrent neural network (RNN) architecture featuring a novel "Mesa layer." This layer operationalizes the concept of "optimal test-time training." Instead of relying on a fixed, learned update rule like other modern RNNs (Mamba, xLSTM), the Mesa layer, at every time step, explicitly solves an in-context regression objective to optimality. This is achieved using a fast conjugate gradient (CG) solver. The design is numerically stable and chunkwise parallelizable, enabling efficient training on modern hardware.
ArXivIQ is a reader-supported publication. To receive new posts and support my work, consider becoming a free or paid subscriber.

## From Text to Task

Post: https://arxiviq.substack.com/p/from-text-to-task
Authors: Rujikorn Charakorn, Edoardo Cetin, Yujin Tang, Robert T. Lange
Paper: https://arxiv.org/abs/2506.06105
Code: https://github.com/SakanaAI/text-to-lora
Model: The work utilizes publicly available base models from Mistral, Meta, and Google, and the training data is sourced from https://huggingface.co/Lots-of-LoRAs.

TL;DR
WHAT was done? The paper introduces Text-to-LoRA (T2L), a hypernetwork that generates task-specific Low-Rank Adaptation (LoRA) adapters for Large Language Models (LLMs) in a single, inexpensive forward pass. Instead of requiring task-specific data and a lengthy fine-tuning process, T2L takes only a natural language description of the target task as input. The T2L hypernetwork's design allows it to generate a complete, structured adapter by processing a combined input vector representing the task description, the target module (e.g., query projection), and the specific layer index. The authors propose two training schemes: 1) A reconstruction loss to compress hundreds of pre-trained LoRA adapters, and 2) A supervised fine-tuning (SFT) loss on a diverse set of downstream tasks, which enables the model to generalize to entirely new tasks.
ArXivIQ is a reader-supported publication. To receive new posts and support my work, consider becoming a free or paid subscriber.

## SmolVLA

Post: https://arxiviq.substack.com/p/smolvla
Authors: Mustafa Shukor, Dana Aubakirova, Francesco Capuano, Pepijn Kooijmans, Steven Palma, Adil Zouitine, Michel Aractingi, Caroline Pascal, Martino Russi, Andres Marafioti, Simon Alibert, Matthieu Cord, Thomas Wolf, and Remi Cadene
Paper: https://arxiv.org/abs/2506.01844
Code: https://github.com/huggingface/lerobot
Model: https://huggingface.co/lerobot/smolvla_base

TL;DR
WHAT was done? The authors introduce SmolVLA, a compact Vision-Language-Action (VLA) model (~450M parameters) designed for efficiency and accessibility. The approach is threefold: 1) A lightweight architecture that leverages a compact VLM backbone with strategic layer skipping and an efficient action expert using interleaved attention and flow matching. 2) Pretraining exclusively on a small, curated set of public, community-contributed datasets (fewer than 30k episodes). 3) A novel asynchronous inference stack that decouples the robot's action execution from the model's perception and prediction, significantly reducing latency and improving responsiveness.
ArXivIQ is a reader-supported publication. To receive new posts and support my work, consider becoming a free or paid subscriber.

## DataRater

Post: https://arxiviq.substack.com/p/datarater
Authors: Dan A. Calian*, Gregory Farquhar*, Iurii Kemaev*, Luisa M. Zintgraf*, Matteo Hessel, Jeremy Shar, Junhyuk Oh, András György, Tom Schaul, Jeffrey Dean, Hado van Hasselt, David Silver
Paper: https://arxiv.org/abs/2505.17895
Code: N/A
Model: N/A

TL;DR
WHAT was done? The paper introduces DataRater, a meta-learning framework designed to automate dataset curation for foundation models. Instead of relying on manual heuristics, DataRater trains a separate model—a non-causal transformer—to assign a "value" score to each training data point. This value is learned through bilevel optimization: an inner loop trains a language model on data weighted by the DataRater, while an outer loop updates the DataRater itself to maximize the inner model's training efficiency (i.e., reduce the FLOPS required to reach a target performance) on a held-out dataset. The learned scores are then used to perform top-K filtering, creating a refined dataset.
ArXivIQ is a reader-supported publication. To receive new posts and support my work, consider becoming a free or paid subscriber.

## Architectural Innovation with Diffusion Model Grafting

Post: https://arxiviq.substack.com/p/architectural-innovation-with-diffusion
Authors: Keshigeyan Chandrasegaran, Michael Poli, Daniel Y. Fu, Dongjun Kim, Lea M. Hadzic, Manling Li, Agrim Gupta, Stefano Massaroli, Azalia Mirhoseini, Juan Carlos Niebles, Stefano Ermon, Li Fei-Fei
Paper: https://arxiv.org/abs/2506.05340
Code: N/A
Model: N/A

TL;DR
WHAT was done? The paper introduces "grafting," a novel two-stage methodology for editing pretrained Diffusion Transformers (DiTs) to explore new architectures with minimal compute. The process involves: 1) Activation Distillation, where a new operator (e.g., a gated convolution) is initialized by training it to mimic the output activations of an existing operator (e.g., MHA) from the pretrained model. 2) Lightweight Finetuning, where the entire modified model is finetuned on a small fraction of the original data (e.g., 10%) to mitigate cumulative error and recover performance. The authors demonstrate this by replacing MHA and MLP blocks with various efficient alternatives and even by fundamentally restructuring a model's topology, converting sequential depth into parallel width.
ArXivIQ is a reader-supported publication. To receive new posts and support my work, consider becoming a free or paid subscriber.

## Probing the 'Thinking' of AI 

Post: https://arxiviq.substack.com/p/probing-the-thinking-of-ai
Authors: Parshin Shojaee, Iman Mirzadeh, Maxwell Horton, Samy Bengio, Keivan Alizadeh, Mehrdad Farajtabar
Paper: https://ml-site.cdn-apple.com/papers/the-illusion-of-thinking.pdf
Code: Not available
Model: Not available

TL;DR
WHAT was done? This research introduces a novel evaluation framework to systematically probe the capabilities of Large Reasoning Models (LRMs). Instead of relying on standard benchmarks prone to data contamination, the authors use controllable algorithmic puzzles (e.g., Tower of Hanoi, Blocks World) where complexity can be precisely adjusted. This methodology allows for a deep analysis not just of final answers, but of the entire intermediate "thinking" trace generated by models like Claude 3.7 Sonnet and DeepSeek-R1.
ArXivIQ is a reader-supported publication. To receive new posts and support my work, consider becoming a free or paid subscriber.

## Beyond the Learning Rate

Post: https://arxiviq.substack.com/p/beyond-the-learning-rate
Authors: Priya Kasimbeg, Vincent Roulet, Naman Agarwal, Sourabh Medapati, Fabian Pedregosa, Atish Agarwala, George E. Dahl
Paper: https://arxiv.org/abs/2505.24005
Code: The study leverages the MLCommons AlgoPerf benchmark ( https://github.com/mlcommons/algorithmic-efficiency ) for evaluation, and some algorithm implementations were based on the Optax library ( https://github.com/deepmind/optax ).
Model: N/A

TL;DR
WHAT was done? The paper systematically evaluates existing "learning-rate-free" (LRF) optimization algorithms to determine if they deliver on the promise of "hyperparameter-free" deep learning. It tests them on the diverse ALGOPERF benchmark, first with their literature-supplied defaults and then after an extensive "ALGOPERF-calibration" process. This calibration seeks a single set of non-learning rate hyperparameters (e.g., momentum, weight decay, schedule parameters) that performs well across all workloads. The performance of these calibrated LRF methods is then compared against similarly calibrated traditional baselines like AdamW.
ArXivIQ is a reader-supported publication. To receive new posts and support my work, consider becoming a free or paid subscriber.

## The Measure of Memory

Post: https://arxiviq.substack.com/p/the-measure-of-memory
Authors: John X. Morris, Chawin Sitawarin, Chuan Guo, Narine Kokhlikyan, G. Edward Suh, Alexander M. Rush, Kamalika Chaudhuri, Saeed Mahloujifar
Paper: https://arxiv.org/abs/2505.24832
Code: Not available
Model: Not available

TL;DR
WHAT was done? This paper introduces a novel framework for quantifying how much language models (LMs) "know" about specific datapoints. It formally distinguishes "unintended memorization" (information about a particular dataset) from "generalization" (information about the true data-generating process), measuring these in bits using information theory and approximating Kolmogorov complexity via model likelihoods. A key empirical finding is that GPT-family models have an approximate information storage capacity of 3.6 bits per parameter.
ArXivIQ is a reader-supported publication. To receive new posts and support my work, consider becoming a free or paid subscriber.

## Quantum AI

Post: https://arxiviq.substack.com/p/quantum-ai
Authors: Giovanni Acampora, Andris Ambainis, Natalia Ares, Leonardo Banchi, Pallavi Bhardwaj, Daniele Binosi, G. Andrew D. Briggs, Tommaso Calarco, Vedran Dunjko, Jens Eisert, Olivier Ezratty, Paul Erker, Federico Fedele, Elies Gil-Fuster, Martin Gärttner, Mats Granath, Markus Heyl, Iordanis Kerenidis, Matthias Klusch, Anton Frisk Kockum, Richard Kueng, Mario Krenn, Jörg Lässig, Antonio Macaluso, Sabrina Maniscalco, Florian Marquardt, Kristel Michielsen, Gorka Muñoz-Gil, Daniel Müssig, Hendrik Poulsen Nautrup, Evert van Nieuwenburg, Roman Orus, Jörg Schmiedmayer, Markus Schmitt, Philipp Slusallek, Filippo Vicentini, Christof Weitenberg, and Frank K. Wilhelm.
Paper: https://arxiv.org/abs/2505.23860
Code: N/A
Model: N/A

TL;DR
WHAT was done? This white paper meticulously charts the landscape of Quantum Artificial Intelligence (QAI), presenting a strategic roadmap. It details the current status, explores the bidirectional synergies—how quantum computing (QC) can enhance AI (e.g., in machine learning, optimization, reasoning) and, conversely, how AI can accelerate QC development (e.g., hardware design, algorithm discovery, error correction, data analysis). A multi-timescale research agenda (short, mid, and long-term) is proposed, alongside an examination of foundational questions.
ArXivIQ is a reader-supported publication. To receive new posts and support my work, consider becoming a free or paid subscriber.

## Controlling the "Thought" Process

Post: https://arxiviq.substack.com/p/controlling-the-thought-process
Authors: Junyu Zhang, Runpei Dong, Haoran Geng, Peihao Li, Jitendra Malik, Saurabh Gupta, Han Wang, Xialin He, Xuying Ning, Yutong Bai, Huan Zhang
Paper: https://arxiv.org/abs/2505.24863
Code: https://alphaone-project.github.io/
Model: Models used are open-source (DeepSeek-R1, Qwen QwQ series); AlphaOne itself is a framework.

TL;DR
WHAT was done? The paper introduces AlphaOne ( α 1), a training-free framework that dynamically modulates the reasoning process of Large Reasoning Models (LRMs) at test time. It defines an "alpha moment" ( α ), which scales the LRM's average thinking phase token length ( N_think ) to set an overall thinking budget ( αN_think ). Before this moment, AlphaOne stochastically encourages "slow thinking" by inserting tokens like "wait,"; after this moment, it deterministically enforces "fast thinking" by replacing slow thinking tokens with an </think> token.
ArXivIQ is a reader-supported publication. To receive new posts and support my work, consider becoming a free or paid subscriber.

## AlphaEvolve

Post: https://arxiviq.substack.com/p/alphaevolve
Authors: Alexander Novikov, Ngân Vũ, Marvin Eisenberger, Emilien Dupont, Po-Sen Huang, Adam Zsolt Wagner, Sergey Shirobokov, Borislav Kozlovskii, Francisco J. R. Ruiz, Abbas Mehrabian, M. Pawan Kumar, Abigail See, Swarat Chaudhuri, George Holland, Alex Davies, Sebastian Nowozin, Pushmeet Kohli and Matej Balog
Paper: link
Code: Discovered algorithms and mathematical results in a Colab notebook
Model: N/A

TL;DR
WHAT was done? The researchers developed AlphaEvolve, an evolutionary coding agent. It synergizes state-of-the-art Large Language Models (LLMs) like Gemini with an evolutionary computation framework. AlphaEvolve autonomously generates and iteratively refines complex algorithms by making direct changes to entire codebases, guided by automated evaluation functions.
Thanks for reading ArXivIQ! Subscribe for free to receive new posts and support my work.
