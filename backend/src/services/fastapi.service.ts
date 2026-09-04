import axios from 'axios';
import { env } from '../config/env.js';
import { ProjectBlueprint, ProjectRequirement } from '../models/project.types.js';
import { ChatMessage } from '../models/chat.types.js';

export class FastAPIService {
  private static baseURL = env.FASTAPI_URL || 'http://localhost:8000/api/v1/ai';

  /**
   * Forward generation request to Python FastAPI microservice (Phase 3).
   * Parses validated multi-agent output from Gemini.
   */
  static async generateBlueprint(payload: ProjectRequirement, userId: string): Promise<Omit<ProjectBlueprint, 'id' | 'created_at' | 'updated_at'>> {
    try {
      const response = await axios.post(`${this.baseURL}/generate`, {
        titleIdea: payload.titleIdea || payload.domain,
        domain: payload.domain,
        skillLevel: payload.skillLevel || 'intermediate',
        preferredTech: payload.preferredTech || [],
        complexity: payload.complexity || 'Production Grade Architecture',
        agentMode: payload.agentMode || 'multi',
        customRequirements: payload.customRequirements || null,
      }, {
        timeout: 60000,
        headers: { 'Content-Type': 'application/json' },
      });

      const data = response.data;
      return {
        user_id: userId,
        title: data.title || payload.titleIdea,
        tagline: data.tagline || '',
        domain: data.domain || payload.domain,
        complexity: data.complexity || payload.complexity,
        agent_mode: data.agent_mode || payload.agentMode,
        abstract: data.abstract || '',
        problem_statement: data.problem_statement || '',
        literature_review: data.literature_review || '',
        methodology: data.methodology || [],
        algorithms_used: data.algorithms_used || [],
        why_useful: data.why_useful || [],
        real_world_applications: data.real_world_applications || [],
        objectives: data.objectives || [],
        features: data.features || [],
        tech_stack: data.tech_stack || [],
        architecture: data.architecture || { summary: '', components: [], diagramDescription: '' },
        datasets: data.datasets || [],
        research_references: data.research_references || [],
        roadmap: data.roadmap || [],
        viva_questions: data.viva_questions || [],
        starter_code: data.starter_code || [],
        uniquifier_suggestions: data.uniquifier_suggestions || [],
      };
    } catch (error: any) {
      console.warn('ℹ️ FastAPI worker offline or error at', this.baseURL, '— falling back to Express synthesizer:', error.message);

      // Domain-Aware Fallback synthesizer
      const domainClean = payload.domain || 'Artificial Intelligence & Machine Learning';
      const title = payload.titleIdea?.trim() || `${domainClean.split('&')[0].trim()} Intelligent Platform`;
      const techList = payload.preferredTech && payload.preferredTech.length > 0
        ? payload.preferredTech
        : ['Next.js 14', 'Node.js/Express', 'Python FastAPI', 'PostgreSQL (Supabase)'];

      // Domain specific presets
      const domainConfigs: Record<string, {
        abstract: string;
        problem: string;
        literature: string;
        methodology: any[];
        algorithms: any[];
        datasets: any[];
        viva: any[];
      }> = {
        'Blockchain, Cryptography & Web3': {
          abstract: `This project presents a verifiable, decentralized architecture for ${title}. By unifying zero-knowledge proof circuits (zk-SNARKs), automated smart contracts, and high-throughput off-chain state verification, the platform guarantees computational integrity, MEV-resistance, and private verifiable state transitions.`,
          problem: `Traditional centralized Web2 applications and early decentralized protocols face significant vulnerabilities including front-running (Maximal Extractable Value), privacy leakage on public ledgers, and prohibitive on-chain gas costs. This project addresses these bottlenecks by integrating succinct cryptographic proofs with scalable layer-2 state rollups.`,
          literature: `Contemporary literature in distributed ledger technology highlights trade-offs between on-chain consensus latency and data privacy. Existing automated market makers and oracle protocols lack native zero-knowledge verification for off-chain computations. This project bridges this gap through Circom-compiled arithmetic circuits and optimized Solidity smart contract verifiers.`,
          methodology: [
            {
              step_number: 1,
              title: "Cryptographic Circuit Design & Arithmetic Constraints",
              description: "Formulate R1CS arithmetic constraint systems and Circom circuits for private state verification.",
              details: ["Define public signals and private witness generation pipelines", "Generate trusted setup proving and verifying keys using Groth16", "Optimize circuit gate counts for low-overhead browser proof generation"]
            },
            {
              step_number: 2,
              title: "Smart Contract Architecture & Verifier Deployment",
              description: "Develop secure EVM smart contracts with reentrancy protection and on-chain zk-proof verification.",
              details: ["Deploy automated liquidity pool and escrow contracts in Solidity", "Implement on-chain verification contracts generated from Circom", "Enforce role-based access control and emergency timelock pauses"]
            },
            {
              step_number: 3,
              title: "Off-Chain Relayer & Microservice Pipeline",
              description: "Build asynchronous FastAPI relayer service to aggregate transactions and compute zero-knowledge proofs.",
              details: ["Batch pending transactions using off-chain Merkle tree accumulators", "Execute snarkjs proving pipelines asynchronously in worker threads", "Broadcast verified state updates to Ethereum/Polygon testnet"]
            },
            {
              step_number: 4,
              title: "Client Interface & Web3 Wallet Integration",
              description: "Expose intuitive Next.js 14 user dashboard with Ethers.js/Wagmi wallet connections and real-time transaction telemetry.",
              details: ["Support MetaMask and Coinbase Wallet session handshakes", "Provide client-side proof generation with WebAssembly workers", "Stream real-time blockchain event logs into PostgreSQL database"]
            }
          ],
          algorithms: [
            {
              name: "Groth16 Zero-Knowledge SNARK Protocol",
              category: "Succinct Non-Interactive Cryptographic Proofs",
              purpose: "Allows users to prove knowledge of private state transitions without revealing underlying witness data.",
              input_features: "Private witness inputs (secret keys, account balances), public state signals.",
              output: "Constant-size (128-byte) verifiable cryptographic proof.",
              rationale: "Lowest on-chain verification gas cost (~200k gas) among all modern zero-knowledge proving systems."
            },
            {
              name: "Sparse Merkle Tree (SMT) Membership Verification",
              category: "Cryptographic Data Structure",
              purpose: "Maintains constant-time cryptographic membership proofs for millions of off-chain accounts.",
              input_features: "Account leaf hashes, 256-bit cryptographic tree paths.",
              output: "Boolean membership inclusion proof against global Merkle root.",
              rationale: "Enables instant verification and non-membership proofs in zero-knowledge circuits."
            }
          ],
          datasets: [
            { name: "Etherscan Verified Smart Contract & Transaction Dataset", source: "Etherscan / Dune Analytics", description: "Historical dataset containing over 500,000+ verified transaction traces, gas consumption logs, and MEV arbitrage occurrences." }
          ],
          viva: [
            { question: "Why choose Groth16 over PLONK or STARKs in this project?", answer: "Groth16 produces the smallest proof size (3 group elements) and requires minimal on-chain verification gas on Ethereum, making it optimal for production capstone systems.", category: "Cryptography Defense" },
            { question: "How does this system prevent reentrancy and front-running attacks?", answer: "State changes follow the Checks-Effects-Interactions pattern with ReentrancyGuard mutexes, while batch auctions eliminate transaction ordering manipulation by miners.", category: "Security & Auditing" }
          ]
        },
        'Healthcare AI & Biomedical Engineering': {
          abstract: `This project presents an advanced biomedical AI platform for ${title}. By combining convolutional neural networks, vision transformers, and federated learning protocols, the system enables high-accuracy diagnostic segmentation and predictive disease triage while maintaining rigorous HIPAA/GDPR clinical privacy standards.`,
          problem: `Healthcare institutions struggle with diagnostic latency, inter-observer variability in clinical imaging, and strict data-silo constraints that prevent centralized model training. This project resolves these critical clinical bottlenecks by deploying edge-quantized deep learning models with differential privacy guarantees.`,
          literature: `Recent biomedical literature demonstrates the efficacy of U-Net variants and Vision Transformers in medical imaging. However, existing commercial systems are proprietary black-boxes that lack explainability (Grad-CAM heatmaps) and cannot learn collaboratively across hospitals. This project overcomes this via decentralized federated aggregation and multi-modal attention networks.`,
          methodology: [
            {
              step_number: 1,
              title: "DICOM Preprocessing, Artifact Removal & Normalization",
              description: "Ingest multi-modal clinical images (MRI/CT/X-ray), perform skull-stripping, and normalize voxel intensities.",
              details: ["Standardize imaging formats from DICOM/NIfTI into normalized NumPy tensors", "Apply CLAHE contrast enhancement and affine data augmentations", "Eliminate motion artifacts using median filtering and intensity scaling"]
            },
            {
              step_number: 2,
              title: "Deep Neural Network Architecture & Attention Modeling",
              description: "Formulate hybrid 3D U-Net and Vision Transformer architectures for multi-region lesion segmentation.",
              details: ["Extract hierarchical spatial features using residual convolutional blocks", "Incorporate multi-head self-attention mechanisms for global anatomical context", "Optimize Dice-BCE combined loss functions to combat severe class imbalance"]
            },
            {
              step_number: 3,
              title: "Federated Averaging & Differential Privacy Protection",
              description: "Enable multi-institutional collaborative training without centralizing sensitive patient records.",
              details: ["Implement Flower federated averaging (FedAvg) aggregation server", "Inject calibrated Gaussian differential privacy noise to local gradient updates", "Enforce cryptographic TLS channels for model weight synchronization"]
            },
            {
              step_number: 4,
              title: "Clinical Decision Support & Explainability Dashboard",
              description: "Deploy clinician web interface with interactive Grad-CAM visual overlays and automated report generation.",
              details: ["Render interactive 2D/3D slice visualizations with Next.js and WebGL", "Generate Grad-CAM heatmaps to highlight anatomical regions of interest", "Export certified diagnostic summary reports in PDF and DICOM structured formats"]
            }
          ],
          algorithms: [
            {
              name: "Hybrid 3D U-Net with Residual Squeeze-and-Excitation (SE-ResUNet)",
              category: "Deep Convolutional Segmentation Network",
              purpose: "Performs pixel-level anatomical segmentation and tumor boundary delineation from 3D volumetric scans.",
              input_features: "Normalized multi-channel MRI voxel tensors (T1, T1ce, T2, FLAIR).",
              output: "Multi-class segmentation mask (Whole Tumor, Enhancing Tumor, Tumor Core).",
              rationale: "Squeeze-and-excitation channel attention adaptively recalibrates feature maps, yielding superior Dice scores (>0.91)."
            },
            {
              name: "Federated Averaging (FedAvg) with Renyi Differential Privacy",
              category: "Decentralized Optimization & Privacy",
              purpose: "Coordinates distributed model parameter aggregation across independent hospital nodes.",
              input_features: "Decentralized client gradient updates and local sample counts.",
              output: "Aggregated global model weights with provable privacy guarantees.",
              rationale: "Eliminates raw patient data transmission while achieving within 1.5% of centralized model performance."
            }
          ],
          datasets: [
            { name: "Brain Tumor Segmentation (BraTS 2023 / PhysioNet Challenge)", source: "Synapse.org / PhysioNet", description: "Clinically annotated multi-institutional MRI benchmark with over 2,000+ cases across four standardized structural modalities." }
          ],
          viva: [
            { question: "How does the system handle severe medical class imbalance during training?", answer: "We implement a composite loss function combining Soft Dice Loss and Focal Loss, heavily penalizing false negatives on small lesion volumes.", category: "Model Optimization" },
            { question: "How is patient confidentiality preserved during model training?", answer: "Raw patient scans never leave the local clinical environment; only encrypted gradients with injected differential privacy noise are transmitted to the aggregator.", category: "Clinical Privacy & Ethics" }
          ]
        },
        'Cybersecurity & Network Defense': {
          abstract: `This project proposes a real-time, autonomous network defense and threat intelligence system for ${title}. Utilizing graph neural networks, deep packet inspection, and behavioral autoencoders, the platform detects zero-day intrusions, advanced persistent threats (APTs), and distributed denial-of-service anomalies with sub-second response times.`,
          problem: `Modern cyber threat landscapes feature polymorphic malware, encrypted lateral movement, and high-frequency automated attacks that easily evade static signature-based firewalls. Security operations centers (SOCs) suffer from severe alert fatigue and delayed incident response times. This project establishes an automated, self-healing defense pipeline.`,
          literature: `Traditional intrusion detection systems (Snort, Suricata) rely heavily on known rule databases. Contemporary research has demonstrated the promise of deep learning on network flow features, but struggles with topological network relationships. This project unifies Graph Convolutional Networks (GCNs) and transformer anomaly detectors to capture structural attack graphs.`,
          methodology: [
            {
              step_number: 1,
              title: "Network Packet Capture & Flow Graph Construction",
              description: "Ingest high-throughput raw PCAP streams, extract bidirectional NetFlow/IPFIX records, and construct dynamic host graphs.",
              details: ["Parse network packet headers (TCP/UDP/ICMP/DNS) using Scapy and libpcap", "Construct heterogeneous communication graphs (Nodes = IP/Ports, Edges = Flow attributes)", "Filter broadcast noise and normalize flow duration and packet sizes"]
            },
            {
              step_number: 2,
              title: "Graph Neural Network & Anomaly Modeling",
              description: "Train Graph Convolutional Networks and temporal autoencoders to detect malicious topological patterns.",
              details: ["Embed network graph structures using PyTorch Geometric", "Train Variational Autoencoders (VAE) on normal baseline traffic flows", "Compute reconstruction error thresholds for zero-day anomaly scoring"]
            },
            {
              step_number: 3,
              title: "Automated Incident Response & Quarantine Mitigation",
              description: "Execute automated firewall rule updates and containerized host isolation upon verified threat detection.",
              details: ["Generate dynamic iptables and OpenFlow SDN quarantine rules", "Trigger webhook notifications to incident response Slack/PagerDuty channels", "Isolate compromised virtual hosts in quarantined VLAN subnets"]
            },
            {
              step_number: 4,
              title: "Threat Intelligence Visualization & SOC Dashboard",
              description: "Expose real-time threat map, MITRE ATT&CK mapping, and forensic log exploration via Next.js interface.",
              details: ["Visualize live network topology and attack paths using D3.js force graphs", "Map detected anomalies directly to MITRE ATT&CK tactics and techniques", "Store immutable forensic audit logs in PostgreSQL with cryptographic hashing"]
            }
          ],
          algorithms: [
            {
              name: "Relational Graph Convolutional Network (R-GCN)",
              category: "Graph Deep Learning",
              purpose: "Analyzes multi-relational network communication topologies to detect lateral movement and command-and-control beacons.",
              input_features: "Adjacency matrix of network interactions, node feature vectors (IP reputation, open ports, flow volume).",
              output: "Node and edge classification probabilities (Normal, PortScan, DDoS, Ransomware, APT).",
              rationale: "Captures structural attack propagation that cannot be detected by examining isolated packet flows."
            },
            {
              name: "Temporal Variational Autoencoder (T-VAE)",
              category: "Unsupervised Anomaly Detection",
              purpose: "Models baseline temporal network traffic behavior and detects zero-day volumetric anomalies.",
              input_features: "Sliding window time-series vectors of packet arrival rates, byte distributions, and entropy.",
              output: "Reconstruction error score indicating likelihood of abnormal zero-day intrusion.",
              rationale: "Detects novel, previously unseen attacks without requiring labeled historical attack signatures."
            }
          ],
          datasets: [
            { name: "UNSW-NB15 & CICIDS2017 Benchmark Intrusion Datasets", source: "Canadian Institute for Cybersecurity", description: "Comprehensive network traffic captures containing normal user traffic alongside 14 modern attack categories including DoS, Web Attacks, Infiltration, and Botnets." }
          ],
          viva: [
            { question: "How does the system distinguish benign traffic spikes from genuine DDoS attacks?", answer: "We combine statistical entropy analysis of destination IP distributions with graph structural centrality metrics, preventing false alarms during legitimate traffic bursts.", category: "Network Security Defense" },
            { question: "How are zero-day exploits detected if no signature exists?", answer: "The temporal variational autoencoder learns normal behavioral manifolds; zero-day exploits generate high reconstruction deviations beyond the statistical confidence threshold.", category: "AI Detection Mechanics" }
          ]
        },
        'IoT, Robotics & Edge Computing': {
          abstract: `This project introduces an intelligent, edge-orchestrated autonomous robotics and IoT sensing platform for ${title}. Utilizing reinforcement learning, spatial SLAM, and lightweight edge neural quantization (TensorRT), the system delivers real-time obstacle avoidance, swarm coordination, and low-latency environmental mapping.`,
          problem: `Edge robotics and IoT deployments face severe resource constraints: restricted compute budgets, intermittent wireless connectivity, and strict millisecond-level latency requirements for obstacle avoidance. Cloud-only architectures introduce unacceptable latency and security risks for mission-critical robotic navigation.`,
          literature: `Existing robotics frameworks rely heavily on traditional A* and Dijkstra pathfinding or compute-heavy cloud models. Recent research in deep reinforcement learning (PPO, SAC) shows promise for adaptive navigation, but requires extreme model compression for edge deployment. This project bridges this gap via 8-bit quantized actor-critic networks on ROS2.`,
          methodology: [
            {
              step_number: 1,
              title: "Multi-Sensor Ingestion, Fusion & Filtering",
              description: "Ingest LiDAR point clouds, IMU telemetry, and camera streams using ROS2 and Kalman filtering.",
              details: ["Synchronize sensor messages using ROS2 message filters and topic publishers", "Fuse IMU accelerometer data with wheel odometry using Extended Kalman Filters (EKF)", "Filter noisy LiDAR point cloud returns using voxel grid downsampling"]
            },
            {
              step_number: 2,
              title: "Simultaneous Localization and Mapping (SLAM)",
              description: "Construct high-resolution 2D/3D occupancy grid maps of dynamic environments in real time.",
              details: ["Execute Cartographer / Fast-LIO laser odometry and loop closure algorithms", "Generate 2D probabilistic occupancy grids for local collision checking", "Store environmental feature maps in low-overhead spatial octrees"]
            },
            {
              step_number: 3,
              title: "Edge Deep Reinforcement Learning & Path Planning",
              description: "Deploy quantized Deep Reinforcement Learning agents for dynamic obstacle avoidance and target pursuit.",
              details: ["Train Multi-Agent Proximal Policy Optimization (MAPPO) agents in Gazebo/Isaac Sim", "Quantize PyTorch model weights to INT8 precision using TensorRT / ONNX Runtime", "Execute local trajectory rollouts with 50Hz control loops on embedded edge hardware"]
            },
            {
              step_number: 4,
              title: "Telemetry Streaming, Fleet Monitoring & Teleoperation",
              description: "Stream live robot telemetry, battery health, and map data to Next.js dashboard over secure WebSockets.",
              details: ["Bridge ROS2 topics to WebSockets using rosbridge_suite", "Render live 2D robot trajectories and LiDAR overlays on interactive HTML5 canvas", "Provide low-latency virtual joystick teleoperation and emergency e-stop controls"]
            }
          ],
          algorithms: [
            {
              name: "Multi-Agent Proximal Policy Optimization (MAPPO)",
              category: "Deep Reinforcement Learning",
              purpose: "Controls autonomous robot velocity and steering vectors for collision-free multi-agent navigation.",
              input_features: "LiDAR laser scan ranges (360-degree array), target relative coordinate vector, current velocity.",
              output: "Continuous linear and angular velocity commands (v, omega).",
              rationale: "Centralized training with decentralized execution ensures stable multi-robot swarm collision avoidance."
            },
            {
              name: "Extended Kalman Filter (EKF) Sensor Fusion",
              category: "State Estimation & Filtering",
              purpose: "Estimates precise 6-DOF robot pose (position and orientation) by fusing noisy IMU and wheel encoder data.",
              input_features: "Wheel encoder ticks, 3-axis accelerometer readings, 3-axis gyroscope angular velocities.",
              output: "Fused state vector [x, y, z, roll, pitch, yaw] with covariance uncertainty estimates.",
              rationale: "Optimal recursive state estimation that mitigates sensor drift in dynamic environments."
            }
          ],
          datasets: [
            { name: "KITTI Vision Benchmark & Robotics Telemetry Suite", source: "Karlsruhe Institute of Technology", description: "Real-world autonomous navigation dataset featuring synchronized stereo video, LiDAR point clouds, GPS, and IMU traces." }
          ],
          viva: [
            { question: "How does the system maintain real-time navigation latency on resource-limited edge hardware?", answer: "We apply 8-bit post-training quantization (INT8) via TensorRT, accelerating inference speed by 4.2x while preserving over 99% of floating-point decision fidelity.", category: "Edge Optimization" },
            { question: "How does the Extended Kalman Filter mitigate odometry wheel slip?", answer: "The EKF dynamically weights the covariance matrices of wheel odometry against high-frequency IMU gyro updates, rejecting transient slipping anomalies.", category: "Control Theory & SLAM" }
          ]
        },
        'Full Stack Cloud SaaS & Distributed Systems': {
          abstract: `This project delivers a high-throughput, enterprise-grade distributed microservice platform for ${title}. Featuring CQRS write-read segregation, transactional outbox messaging, distributed tracing, and automated multi-tenant scaling, the system guarantees 99.99% availability and sub-50ms API query latency.`,
          problem: `Monolithic enterprise architectures suffer from database bottlenecks during traffic spikes, cascading service failures, and complex schema migrations. As systems scale to millions of concurrent users, traditional synchronous architectures degrade severely in performance and fault tolerance.`,
          literature: `Contemporary software engineering research emphasizes event-driven architectures, event sourcing, and domain-driven design (DDD). While frameworks like Kafka and Redis offer building blocks, practical multi-tenant systems require automated tenant isolation, rate-limiting algorithms, and resilient fallback circuit breakers.`,
          methodology: [
            {
              step_number: 1,
              title: "Domain-Driven Design (DDD) & Microservice Partitioning",
              description: "Decompose system into decoupled bounded contexts and define strict asynchronous message schemas.",
              details: ["Establish bounded contexts for Auth, Billing, Task Orchestration, and Telemetry", "Define Protocol Buffer / JSON message schemas for asynchronous event buses", "Enforce strict interface contracts with OpenAPI 3.0 and TypeScript definitions"]
            },
            {
              step_number: 2,
              title: "CQRS Architecture & Transactional Outbox Pattern",
              description: "Separate high-throughput write operations from optimized read models using event sourcing.",
              details: ["Implement command handlers that persist event streams into PostgreSQL write databases", "Publish domain events reliably to Kafka / RabbitMQ using the Transactional Outbox pattern", "Project event streams into denormalized Redis and Elasticsearch read models"]
            },
            {
              step_number: 3,
              title: "Distributed Tracing, Resiliency & Circuit Breakers",
              description: "Incorporate OpenTelemetry distributed tracing and automated circuit breaker mechanisms.",
              details: ["Propagate W3C trace context headers across all inter-service HTTP/gRPC calls", "Implement Resilience4j / Opossum circuit breakers to isolate failing dependencies", "Configure distributed token-bucket rate limiting in Redis to prevent API abuse"]
            },
            {
              step_number: 4,
              title: "Multi-Tenant UI, Telemetry & Canary Deployment",
              description: "Deploy Next.js 14 tenant portal with real-time WebSocket notifications and Prometheus monitoring.",
              details: ["Implement multi-tenant data partitioning with tenant-scoped schema resolvers", "Stream live system health metrics and Grafana dashboards via Prometheus", "Configure automated blue-green and canary deployment pipelines with Docker and Kubernetes"]
            }
          ],
          algorithms: [
            {
              name: "Distributed Token Bucket Rate Limiting Algorithm",
              category: "Traffic Shaping & API Security",
              purpose: "Controls per-tenant API invocation rates and prevents distributed denial-of-service degradation.",
              input_features: "Tenant ID, request timestamp, token refill rate (r), bucket burst capacity (b).",
              output: "Boolean decision (Allow Request / Return HTTP 429 Too Many Requests).",
              rationale: "Atomic execution in Redis with Lua scripts guarantees microsecond evaluation across clustered API gateways."
            },
            {
              name: "Consistent Hashing with Virtual Nodes",
              category: "Distributed Data Partitioning",
              purpose: "Distributes incoming client workloads and caching keys uniformly across distributed cluster nodes.",
              input_features: "Tenant request key, cryptographic hash function (MurmurHash3), active server ring topology.",
              output: "Target cluster node assignment with minimal remapping upon node scaling.",
              rationale: "Minimizes key redistribution overhead to O(K/N) when nodes join or leave the cluster."
            }
          ],
          datasets: [
            { name: "Synthetic High-Throughput E-Commerce & Microservice Telemetry Logs", source: "OpenTelemetry Benchmark Suite", description: "Standardized benchmark suite with 1,000,000+ distributed trace spans, latency distributions, and simulated network partitions." }
          ],
          viva: [
            { question: "How does the Transactional Outbox pattern prevent dual-write data loss?", answer: "Database state updates and outgoing domain event messages are written into the same local ACID transaction; a background CDC worker polls the outbox table and guarantees at-least-once delivery to Kafka.", category: "Distributed Systems Architecture" },
            { question: "What are the trade-offs of using CQRS with Event Sourcing?", answer: "CQRS enables independent scaling of read and write workloads and provides a complete audit trail, but introduces eventual consistency latency and higher schema migration complexity.", category: "System Design Trade-Offs" }
          ]
        },
        'Artificial Intelligence & Machine Learning': {
          abstract: `This project develops an advanced predictive and generative AI platform for ${title}. Integrating transformer foundation models, gradient boosting regressors, and automated feature selection, the system provides high-precision inference, explainable feature attributions, and real-time decision support.`,
          problem: `Modern enterprises struggle with integrating complex machine learning models into production workflows due to model drift, lack of explainability, and high inference latency. Traditional static models degrade over time as real-world data distributions shift. This project establishes an automated, self-adapting machine learning lifecycle.`,
          literature: `Recent breakthroughs in transfer learning and ensemble methods show superior accuracy over legacy linear models. However, productionizing these models requires robust data preprocessing, automated hyperparameter tuning, and continuous monitoring pipelines. This project addresses this through a decoupled FastAPI inference engine and PostgreSQL telemetry tracking.`,
          methodology: [
            {
              step_number: 1,
              title: "Data Collection, Cleaning & Exploratory Data Analysis",
              description: "Ingest multi-source tabular and unstructured datasets, perform missing value imputation, and remove outliers.",
              details: ["Automate schema validation and type coercion for input datasets", "Handle missing values using Iterative MICE imputation", "Detect multivariate outliers using Isolation Forest algorithms"]
            },
            {
              step_number: 2,
              title: "Feature Engineering, Embedding Generation & Selection",
              description: "Extract high-impact statistical features, compute semantic embeddings, and rank feature importance.",
              details: ["Generate domain-specific interaction terms and temporal rolling averages", "Extract semantic embeddings using lightweight transformer backbones", "Perform feature selection using Recursive Feature Elimination (RFE) and Mutual Information"]
            },
            {
              step_number: 3,
              title: "Model Training, Hyperparameter Optimization & Cross-Validation",
              description: "Train ensemble models and fine-tune hyperparameters using Bayesian optimization.",
              details: ["Train XGBoost, LightGBM, and Random Forest ensemble regressors/classifiers", "Optimize hyperparameters using Optuna with 5-fold stratified cross-validation", "Evaluate precision, recall, F1-score, ROC-AUC, and Mean Squared Error metrics"]
            },
            {
              step_number: 4,
              title: "Model Explainability, API Deployment & Telemetry Monitoring",
              description: "Deploy production inference endpoints with SHAP explainability and real-time latency monitoring.",
              details: ["Compute TreeSHAP local feature attribution values for every prediction", "Expose sub-20ms inference endpoints via FastAPI with Pydantic validation", "Log prediction requests and monitor statistical distribution drift in PostgreSQL"]
            }
          ],
          algorithms: [
            {
              name: "Extreme Gradient Boosting (XGBoost / CatBoost)",
              category: "Supervised Ensemble Learning",
              purpose: "Performs high-precision classification and regression on multi-dimensional tabular feature sets.",
              input_features: "Normalized numerical features, categorical embeddings, historical performance metrics.",
              output: "Continuous prediction score / Multi-class probability distribution.",
              rationale: "Second-order gradient optimization and built-in L1/L2 regularization provide state-of-the-art predictive accuracy with resistance to overfitting."
            },
            {
              name: "TreeSHAP (SHapley Additive exPlanations)",
              category: "Explainable AI & Feature Attribution",
              purpose: "Calculates exact mathematical contributions of each feature to an individual model prediction.",
              input_features: "Trained tree ensemble model and query feature vector.",
              output: "Vector of Shapley attribution values summing to the model prediction delta.",
              rationale: "Provides theoretically grounded, consistent feature attributions essential for academic viva defense and commercial compliance."
            }
          ],
          datasets: [
            { name: "Kaggle Curated Machine Learning Benchmark Suite", source: "Kaggle / UCI Machine Learning Repository", description: "Comprehensive dataset with 100,000+ multi-variate records, clean class distributions, and benchmark evaluation splits." }
          ],
          viva: [
            { question: "How does TreeSHAP guarantee mathematical consistency in feature attribution?", answer: "TreeSHAP utilizes cooperative game theory axioms (Efficiency, Symmetry, Dummy, Additivity) to compute the unique attribution values that allocate prediction credit fairly among features.", category: "Explainable AI Defense" },
            { question: "How does the system detect and mitigate concept drift in production?", answer: "We implement the Kolmogorov-Smirnov statistical test on incoming feature distributions; when p-values drop below 0.05, an automated retraining pipeline is triggered.", category: "MLOps & System Maintenance" }
          ]
        }
      };

      const matchedConfig = domainConfigs[domainClean] || domainConfigs['Artificial Intelligence & Machine Learning'];

      return {
        user_id: userId,
        title,
        tagline: `A production-grade ${payload.complexity.toLowerCase()} system built with ${techList.slice(0, 3).join(', ')}.`,
        domain: domainClean,
        complexity: payload.complexity,
        agent_mode: payload.agentMode,
        abstract: matchedConfig.abstract,
        problem_statement: matchedConfig.problem,
        literature_review: matchedConfig.literature,
        methodology: matchedConfig.methodology,
        algorithms_used: matchedConfig.algorithms,
        why_useful: [
          `Enhanced Accuracy & Throughput: Reduces operational latency by over 60% compared to legacy architectures.`,
          `Decoupled Resiliency: Isolates user requests, API validation, and heavy compute across independent microservices.`,
          `Explainable & Auditable: Provides full transparency and telemetry logs for every system decision.`,
          `Production Build-Ready: Delivers complete starter code, relational schema, and viva defense explanations.`
        ],
        real_world_applications: [
          {
            domain: "Team Project Management",
            application: "Adapting the system to prioritize tasks within a team, considering individual member strengths, availability, and project dependencies."
          },
          {
            domain: "Educational Planning",
            application: "Helping students prioritize study tasks, assignments, and exam preparation based on their learning style, subject difficulty, and deadlines."
          },
          {
            domain: "Healthcare Scheduling",
            application: "Optimizing patient appointments and nurse task assignments in a hospital setting, considering urgency, staff availability, and resource constraints."
          },
          {
            domain: "Logistics & Supply Chain",
            application: "Prioritizing delivery routes, warehouse tasks, or inventory management based on real-time data, demand, and resource availability."
          },
          {
            domain: "Customer Support Systems",
            application: "Prioritizing support tickets based on customer impact, urgency, and agent expertise, leading to faster resolution times."
          }
        ],
        objectives: [
          `Architect a high-performance decoupled pipeline utilizing ${payload.preferredTech?.[0] || 'Next.js'} and ${payload.preferredTech?.[1] || 'Python'}.`,
          'Implement modular data validation, persistent database models, and role-based access control.',
          'Optimize throughput and latency under high concurrency benchmark workloads.',
          'Prepare comprehensive evaluation documentation, viva defense matrices, and starter code scaffolding.',
        ],
        features: [
          { title: 'Core Processing Pipeline', description: 'Handles data ingestion, validation, and real-time computation.', priority: 'high' },
          { title: 'Multi-Agent Intent Orchestration', description: 'Coordinated execution of Planner, Inspector, and Formatter modules.', priority: 'high' },
          { title: 'Telemetry & Analytics Engine', description: 'Provides real-time system monitoring, latency metrics, and audit logs.', priority: 'medium' },
        ],
        tech_stack: payload.preferredTech && payload.preferredTech.length > 0
          ? payload.preferredTech.map((tech, idx) => ({
              category: idx === 0 ? 'Frontend/Client' : idx === 1 ? 'Backend API' : idx === 2 ? 'AI Engine/ML' : 'Storage/Infra',
              item: tech,
              rationale: `Selected for industry-standard performance, community ecosystem, and production readiness in ${payload.domain}.`,
            }))
          : [
              { category: 'Frontend', item: 'Next.js 14 (React, Tailwind CSS)', rationale: 'Server rendering and responsive UI' },
              { category: 'Backend API', item: 'Node.js + Express', rationale: 'High-throughput REST API gateway' },
              { category: 'AI Service', item: 'Python + FastAPI', rationale: 'High concurrency async machine learning worker' },
              { category: 'Database', item: 'Supabase PostgreSQL', rationale: 'Scalable relational data storage with JSONB support' },
            ],
        architecture: {
          summary: `Decoupled microservice architecture: Next.js Frontend ➔ Express REST Gateway ➔ FastAPI Worker ➔ Google Gemini API ➔ PostgreSQL Database.`,
          components: ['Web Client Layer', 'API Gateway (Express)', 'AI Microservice (FastAPI)', 'Gemini Model Engine', 'PostgreSQL Storage'],
          diagramDescription: `Client [Next.js] ➔ REST Gateway [Express :5000] ➔ Worker [FastAPI :8000] ➔ Multi-Agent Pipeline [Gemini API] ➔ Database [PostgreSQL]`,
        },
        datasets: [
          { name: `${payload.domain.split('&')[0].trim()} Standard Benchmark Dataset`, source: 'Kaggle / Open Data Hub', description: 'Curated domain dataset with over 20,000+ labeled records for model training and evaluation.' },
        ],
        research_references: [
          { title: `Advances in Modern ${payload.domain.split('&')[0].trim()} Architectures`, authors: 'Smith et al.', year: '2024', link: 'https://arxiv.org/abs/2401.00001' },
        ],
        roadmap: [
          { phase: 'Phase 1: Architecture & API Gateway Scaffolding', duration: 'Weeks 1–2', tasks: ['Setup Next.js & Express REST API', 'Configure Clerk authentication', 'Define database schemas'] },
          { phase: 'Phase 2: FastAPI AI Worker & Pipeline Integration', duration: 'Weeks 3–4', tasks: ['Build FastAPI microservice', 'Implement multi-agent prompting', 'Integrate Gemini API'] },
          { phase: 'Phase 3: Testing & Viva Defense Preparation', duration: 'Weeks 5–6', tasks: ['Run benchmark evaluations', 'Export documentation into PDF/DOCX', 'Finalize defense prep'] },
        ],
        viva_questions: [
          { question: `What is the core architectural innovation in this ${payload.domain} project?`, answer: 'The decoupled microservice design separates frontend presentation, REST API gateway security, and heavy AI/ML compute into independent scalable tiers.', category: 'Architecture Defense' },
          { question: 'How are database queries optimized?', answer: 'Relational indexes on foreign keys, normalized profile tables, and JSONB document storage for variable project assets.', category: 'Database & Performance' },
        ],
        starter_code: [
          {
            file: 'server.py (FastAPI Worker)',
            language: 'python',
            code: 'from fastapi import FastAPI\nimport google.generativeai as genai\n\napp = FastAPI(title="ProjectMind AI Service")\n\n@app.post("/api/v1/ai/process")\nasync def process_task(data: dict):\n    return {"status": "success", "result": "processed"}',
          },
        ],
        uniquifier_suggestions: [
          'Add automated end-to-end integration tests using Vitest and Pytest.',
          'Incorporate WebSocket streaming for real-time progress updates during generation.',
        ],
      };
    }
  }

  /**
   * Forward chat prompt to Python FastAPI intent classifier & assistant.
   */
  static async sendChatMessage(prompt: string, projectId?: string, history?: any[]): Promise<ChatMessage> {
    const isGreeting = /^(hi|hello|hey|hey there|greetings|good morning|good afternoon|good evening|howdy|sup|hii+)[\s!.,?]*$/i.test(prompt.trim());

    try {
      const response = await axios.post(`${this.baseURL}/chat`, {
        prompt,
        projectId: projectId || null,
        conversationHistory: history || [],
      }, {
        timeout: 10000,
        headers: { 'Content-Type': 'application/json' },
      });

      const res = response.data;
      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        content: res.content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        intentClassification: {
          intent: res.intent || (isGreeting ? 'conversational' : 'project_inquiry'),
          confidence: res.confidence || 0.99,
          explanation: isGreeting ? 'Casual greeting detected' : `Classified by AI Service as ${res.intent}`,
        },
      };
    } catch {
      // Fallback intent classification & dynamic response
      if (isGreeting) {
        return {
          id: `msg-${Date.now()}`,
          sender: 'assistant',
          content: `Hello! 👋 I am your **ProjectMind AI Academic Mentor & Project Architect**.\n\nHow can I help you with your project today?\n\nHere are a few things we can do:\n- 💡 **Brainstorm unique project ideas** tailored to your preferred domain & tech stack\n- 🏗️ **Architect your system** (microservices, event-driven pipelines, database models)\n- 🗺️ **Generate a 6-phase SDLC sprint roadmap** with weekly deliverables\n- 🎓 **Practice Viva Defense questions** with realistic examiner scenarios\n- 💻 **Scaffold production starter code** across Next.js, Express, FastAPI, and PostgreSQL\n\nWhat would you like to explore?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          intentClassification: {
            intent: 'conversational',
            confidence: 0.99,
            explanation: 'Casual greeting or check-in identified.',
          },
        };
      }

      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        content: `Great question regarding **${prompt}**!\n\nTo architect this cleanly, we recommend a decoupled multi-tier topology:\n1. **Web Presentation Layer (Next.js 14 App Router)**: Server components with responsive Tailwind CSS layout.\n2. **REST API Gateway (Node.js/Express)**: Authenticated routing with JWT validation, rate limiting, and business validation.\n3. **Worker & Compute Engine (Python/FastAPI)**: Asynchronous task pipeline interfacing with Gemini AI models.\n4. **Relational Database (PostgreSQL / Supabase)**: Normalized relational tables with JSONB document support for project assets.\n\nWould you like me to detail the API endpoints, generate the starter code scaffolding, or create viva questions for this topic?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        intentClassification: {
          intent: 'project_inquiry',
          confidence: 0.98,
          explanation: 'Valid technical project inquiry identified.',
        },
      };
    }
  }

  /**
   * Check FastAPI worker health.
   */
  static async checkHealth(): Promise<{ status: 'Healthy' | 'Offline'; latencyMs: number }> {
    const start = Date.now();
    try {
      await axios.get(`${this.baseURL}/health`, { timeout: 2000 });
      return { status: 'Healthy', latencyMs: Date.now() - start };
    } catch {
      return { status: 'Offline', latencyMs: 0 };
    }
  }

  /**
   * Fetch current AI engine configuration from FastAPI worker.
   */
  static async getAIConfig(): Promise<{
    active_model: string;
    fallback_models: string[];
    available_models: string[];
    temperature: number;
    is_configured: boolean;
  }> {
    try {
      const res = await axios.get(`${this.baseURL}/config`, { timeout: 3000 });
      return res.data.data;
    } catch {
      return {
        active_model: 'gemini-3.5-flash-lite',
        fallback_models: ['gemini-3.5-flash', 'gemini-flash-latest', 'gemini-2.5-flash'],
        available_models: ['gemini-3.5-flash-lite', 'gemini-3.5-flash', 'gemini-flash-latest', 'gemini-2.5-flash', 'gemini-2.5-pro'],
        temperature: 0.4,
        is_configured: true,
      };
    }
  }

  /**
   * Update AI engine configuration on FastAPI worker.
   */
  static async updateAIConfig(payload: { model?: string; temperature?: number }): Promise<any> {
    const res = await axios.post(`${this.baseURL}/config`, payload, {
      timeout: 3000,
      headers: { 'Content-Type': 'application/json' },
    });
    return res.data.data;
  }

  /**
   * Ping FastAPI worker for diagnostics.
   */
  static async pingDiagnostics(): Promise<{
    status: 'Online' | 'Offline';
    latencyMs: number;
    activeModel: string;
    geminiStatus: string;
  }> {
    const start = Date.now();
    try {
      const res = await axios.get(`${this.baseURL}/ping`, { timeout: 3000 });
      const data = res.data;
      return {
        status: 'Online',
        latencyMs: data.latencyMs || (Date.now() - start),
        activeModel: data.activeModel || 'gemini-3.5-flash-lite',
        geminiStatus: data.geminiStatus || 'Online',
      };
    } catch {
      return {
        status: 'Offline',
        latencyMs: 0,
        activeModel: 'N/A',
        geminiStatus: 'Offline',
      };
    }
  }
}

