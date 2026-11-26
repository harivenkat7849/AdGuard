import {
  EvaluationCriterion,
  ProjectObjective,
  RoadmapWeek,
  TechStackItem,
  TechnicalStep,
  WorkflowStage,
} from '../types/anomaly';

export const WORKFLOW_STAGES: WorkflowStage[] = [
  {
    id: 'advertising-data',
    step: '01',
    title: 'Advertising Data',
    shortLabel: 'Advertising Data',
    summary: 'Raw campaign, clickstream, session duration, and ad spend telemetry.',
    details:
      'Collects structured session events across campaigns including click counts, dwell time, spend per session, and campaign identifiers before feature normalization.',
    inputSample: '{ clicks: 42, duration: 18s, spend: $124.80 }',
    outputSample: 'Raw Session Event Record',
  },
  {
    id: 'preprocessing',
    step: '02',
    title: 'Preprocessing',
    shortLabel: 'Preprocessing',
    summary: 'Cleans missing values, encodes categories, and scales numerical features.',
    details:
      'Transforms raw telemetry into a uniform numeric feature matrix using standard scaling and categorical encoding so all dimensions contribute stably during training.',
    inputSample: 'Raw Session Event Record',
    outputSample: 'Normalized Vector x ∈ ℝⁿ',
  },
  {
    id: 'autoencoder',
    step: '03',
    title: 'Autoencoder',
    shortLabel: 'Autoencoder',
    summary: 'Compresses input into a latent bottleneck and reconstructs normal structure.',
    details:
      'A PyTorch encoder-decoder network trained primarily on normal advertising traffic learns a compact latent representation of typical campaign behavior.',
    inputSample: 'Normalized Vector x',
    outputSample: 'Reconstructed Vector x̂',
  },
  {
    id: 'reconstruction-error',
    step: '04',
    title: 'Reconstruction Error',
    shortLabel: 'Reconstruction Error',
    summary: 'Measures the difference between original input x and reconstructed output x̂.',
    details:
      'Computes reconstruction loss (e.g., Mean Squared Error) per session. Normal sessions reconstruct closely; unseen or irregular patterns yield higher error.',
    inputSample: 'x and x̂ Vectors',
    outputSample: 'MSE = ||x - x̂||² / n',
  },
  {
    id: 'anomaly-score',
    step: '05',
    title: 'Anomaly Score',
    shortLabel: 'Anomaly Score',
    summary: 'Maps reconstruction error onto an interpretable severity scale.',
    details:
      'Converts raw reconstruction error into a standardized anomaly score that enables consistent comparison across campaigns and interactive threshold tuning.',
    inputSample: 'Reconstruction Loss',
    outputSample: 'Score: 0.87 (Demo Signal)',
  },
  {
    id: 'fraud-flag',
    step: '06',
    title: 'Fraud Flag',
    shortLabel: 'Fraud Flag',
    summary: 'Flags sessions exceeding the configured detection threshold for review.',
    details:
      'When the anomaly score crosses the active threshold τ, the session is marked as potentially anomalous so analysts can audit spend and traffic quality.',
    inputSample: 'Score > Threshold τ',
    outputSample: 'Status: Anomalous / Review',
  },
];

export const TECHNICAL_STEPS: TechnicalStep[] = [
  {
    number: 'STEP 01',
    title: 'Data Collection',
    subtitle: 'Campaign, Clickstream & Spend Telemetry',
    description:
      'Collect campaign, clickstream, session and spending-related information into a unified tabular schema.',
    highlights: [
      'Session ID and campaign identifiers',
      'Click counts, engagement duration, and cadence',
      'Ad spend and cost-per-session indicators',
    ],
    codeHint: 'session_id, campaign_id, clicks, session_duration, ad_spend',
  },
  {
    number: 'STEP 02',
    title: 'Data Preprocessing',
    subtitle: 'Cleaning, Encoding & Scaling',
    description:
      'Clean the data, handle missing values, encode categorical features where appropriate, normalize numerical features and prepare the feature matrix.',
    highlights: [
      'Impute or remove incomplete session logs',
      'Encode categorical campaign metadata',
      'Scale numeric features with Scikit-learn pipelines',
    ],
    codeHint: 'X_scaled = scaler.fit_transform(features_df)',
  },
  {
    number: 'STEP 03',
    title: 'Autoencoder Training',
    subtitle: 'Unsupervised Representation Learning',
    description:
      'Build and train a PyTorch autoencoder to learn normal advertising behavior without requiring extensive labeled fraud examples.',
    highlights: [
      'Symmetric encoder → bottleneck → decoder layers',
      'Trained to minimize reconstruction loss on normal baselines',
      'Learns latent correlations across clicks, duration, and spend',
    ],
    codeHint: 'z = encoder(x); x_hat = decoder(z)',
  },
  {
    number: 'STEP 04',
    title: 'Reconstruction Error',
    subtitle: 'Input vs. Output Residual Loss',
    description:
      'Compare original input features with reconstructed output features using an appropriate reconstruction loss.',
    highlights: [
      'Compute per-sample MSE between x and x̂',
      'Low residuals align with learned normal sessions',
      'High residuals signal structural feature deviation',
    ],
    codeHint: 'error = torch.mean((x - x_hat) ** 2, dim=1)',
  },
  {
    number: 'STEP 05',
    title: 'Anomaly Detection',
    subtitle: 'Threshold-Based Classification',
    description:
      'Flag sessions with reconstruction errors above the configured threshold while balancing false positives and sensitivity.',
    highlights: [
      'Configurable threshold τ tuned on validation baselines',
      'Dynamic classification into Normal or Anomalous',
      'Designed as an early warning signal for analyst review',
    ],
    codeHint: 'status = "anomalous" if score > threshold else "normal"',
  },
  {
    number: 'STEP 06',
    title: 'API Deployment',
    subtitle: 'FastAPI Inference Service',
    description:
      'Expose the trained model through FastAPI to accept session information and return anomaly assessments in real time.',
    highlights: [
      'Typed Pydantic request and response validation',
      'Loads serialized PyTorch weights and preprocessing scaler',
      'Consumed cleanly by the React analytics dashboard',
    ],
    codeHint: 'POST /predict -> { anomaly_score, status }',
  },
];

export const TECH_STACK_ITEMS: TechStackItem[] = [
  {
    name: 'Python',
    category: 'Core Language',
    role: 'Core programming language',
    status: 'ML Pipeline Architecture',
    detail: 'Powers data preparation, model training scripts, evaluation utilities, and backend API services.',
  },
  {
    name: 'PyTorch',
    category: 'Deep Learning',
    role: 'Deep learning and autoencoder implementation',
    status: 'ML Pipeline Architecture',
    detail: 'Implements the symmetric encoder-decoder neural architecture and reconstruction loss optimization.',
  },
  {
    name: 'Autoencoder',
    category: 'ML Methodology',
    role: 'Unsupervised representation learning',
    status: 'ML Pipeline Architecture',
    detail: 'Learns compressed representations of normal ad sessions to flag out-of-distribution patterns.',
  },
  {
    name: 'Pandas & NumPy',
    category: 'Data Engineering',
    role: 'Data processing and numerical computation',
    status: 'ML Pipeline Architecture',
    detail: 'Handles tabular clickstream logs, aggregations, missing-value cleanup, and array operations.',
  },
  {
    name: 'Scikit-learn',
    category: 'Preprocessing & Eval',
    role: 'Preprocessing and evaluation utilities where applicable',
    status: 'ML Pipeline Architecture',
    detail: 'Provides feature scalers, train/validation splits, and threshold evaluation metrics.',
  },
  {
    name: 'FastAPI',
    category: 'Inference Backend',
    role: 'Model serving and prediction endpoints',
    status: 'Backend Integration Target',
    detail: 'Exposes the /predict REST endpoint with CORS and schema validation for live frontend requests.',
  },
  {
    name: 'React + TypeScript',
    category: 'Frontend UI',
    role: 'Interactive frontend',
    status: 'Implemented (Frontend)',
    detail: 'Drives this responsive SaaS analytics interface, threshold simulator, charts, and API client layer.',
  },
  {
    name: 'GSAP + ScrollTrigger',
    category: 'Motion Design',
    role: 'Animation and motion',
    status: 'Implemented (Frontend)',
    detail: 'Choreographs smooth hero entrances, scroll reveals, and telemetry counter transitions.',
  },
  {
    name: 'Git / GitHub',
    category: 'Version Control',
    role: 'Version control',
    status: 'Implemented (Frontend)',
    detail: 'Tracks codebase revisions, documentation, and reproducible deployment workflows.',
  },
];

export const PROJECT_OBJECTIVES: ProjectObjective[] = [
  {
    id: 'obj-1',
    title: 'Understand Anomaly Detection',
    description:
      'Explain the role of unsupervised anomaly detection in identifying unusual advertising and click behavior.',
    bloomLevel: 'Understand',
    bloomRationale: 'Conceptualizes why unsupervised modeling fits evolving, unlabeled ad traffic anomalies.',
  },
  {
    id: 'obj-2',
    title: 'Prepare Advertising Data',
    description: 'Process click, session, campaign and spend-related features.',
    bloomLevel: 'Apply',
    bloomRationale: 'Applies cleaning, encoding, and scaling techniques to build a model-ready feature matrix.',
  },
  {
    id: 'obj-3',
    title: 'Build an Autoencoder',
    description: 'Design and train an autoencoder using PyTorch.',
    bloomLevel: 'Create',
    bloomRationale: 'Constructs a custom neural network architecture tuned for normal session reconstruction.',
  },
  {
    id: 'obj-4',
    title: 'Detect Anomalous Sessions',
    description: 'Identify sessions that differ significantly from learned normal patterns.',
    bloomLevel: 'Apply',
    bloomRationale: 'Applies reconstruction error scoring and threshold logic to isolate suspicious activity.',
  },
  {
    id: 'obj-5',
    title: 'Evaluate Detection Performance',
    description: 'Analyze anomaly scores and available validation labels.',
    bloomLevel: 'Evaluate',
    bloomRationale: 'Critically assesses error distributions, threshold trade-offs, and model limitations.',
  },
  {
    id: 'obj-6',
    title: 'Deploy the Detection Model',
    description:
      'Develop a FastAPI endpoint that accepts campaign/session information and returns an anomaly assessment.',
    bloomLevel: 'Apply',
    bloomRationale: 'Applies API engineering and frontend integration to operationalize ML inference.',
  },
];

export const ROADMAP_WEEKS: RoadmapWeek[] = [
  {
    week: 'WEEK 1',
    title: 'Data Collection, Exploration & Feature Engineering',
    summary:
      'Understand advertising fraud, inspect campaign and clickstream data, identify relevant behavioral features and prepare a clean dataset.',
    deliverable: 'Advertising Data & Feature Engineering Report',
    tasks: [
      'Audit clickstream, session duration, and ad spend schemas',
      'Handle missing values and normalize continuous features',
      'Document feature distributions and behavioral baselines',
    ],
  },
  {
    week: 'WEEK 2',
    title: 'Autoencoder Development & Anomaly Detection',
    summary:
      'Design and train a PyTorch autoencoder, learn normal advertising behavior and establish reconstruction-error-based anomaly scoring.',
    deliverable: 'Trained Anomaly Detection Model',
    tasks: [
      'Architect symmetric encoder and decoder layers in PyTorch',
      'Train on normal behavioral subsets with MSE reconstruction loss',
      'Calibrate baseline anomaly score calculation',
    ],
  },
  {
    week: 'WEEK 3',
    title: 'Anomaly Analysis & Fraud Detection Workflow',
    summary:
      'Analyze detected anomalies, visualize suspicious patterns, refine the detection strategy and develop a fraud detection workflow.',
    deliverable: 'Anomaly Analysis & Fraud Detection Results',
    tasks: [
      'Inspect high-error sessions across campaigns and spend tiers',
      'Analyze threshold sensitivity on false positives/negatives',
      'Build visual diagnostic charts for anomaly interpretation',
    ],
  },
  {
    week: 'WEEK 4',
    title: 'FastAPI Deployment & Final Evaluation',
    summary:
      'Package the model into a FastAPI service, test API predictions, evaluate the workflow and document the final solution.',
    deliverable: 'Deployed AdGuard AI System & Final Report',
    tasks: [
      'Expose typed /predict endpoint with CORS enabled',
      'Connect React analytics dashboard to FastAPI service',
      'Complete system evaluation, limitations review, and documentation',
    ],
  },
];

export const EVALUATION_CRITERIA: EvaluationCriterion[] = [
  {
    name: 'Data Preparation & Feature Engineering',
    weight: 15,
    description: 'Dataset inspection, missing-value handling, encoding, and numerical scaling.',
    color: '#34D399',
  },
  {
    name: 'Autoencoder Implementation',
    weight: 25,
    description: 'PyTorch network design, training loop, latent bottleneck, and loss formulation.',
    color: '#10B981',
  },
  {
    name: 'Anomaly Detection & Analysis',
    weight: 15,
    description: 'Reconstruction error calculation, threshold calibration, and pattern analysis.',
    color: '#A3E635',
  },
  {
    name: 'Model Evaluation',
    weight: 15,
    description: 'Score distribution analysis, validation checks, and limitation awareness.',
    color: '#2DD4BF',
  },
  {
    name: 'FastAPI Deployment',
    weight: 15,
    description: 'Clean inference endpoint design, schema validation, and frontend integration.',
    color: '#38BDF8',
  },
  {
    name: 'Documentation & Presentation',
    weight: 15,
    description: 'Clear technical architecture, reproducible setup, and academic reporting.',
    color: '#818CF8',
  },
];

export const ARCHITECTURE_NODES = [
  {
    title: 'Advertising Dataset',
    subtitle: 'Clickstream, campaign & spend logs',
    layer: 'Input Layer',
  },
  {
    title: 'Data Preprocessing',
    subtitle: 'Cleaning, encoding & scaling',
    layer: 'Pipeline',
  },
  {
    title: 'Feature Extraction',
    subtitle: 'Normalized behavioral feature matrix',
    layer: 'Pipeline',
  },
  {
    title: 'PyTorch Autoencoder',
    subtitle: 'Encoder → Latent Space → Decoder',
    layer: 'Model Core',
  },
  {
    title: 'Reconstruction Error Calculation',
    subtitle: 'MSE between input x and output x̂',
    layer: 'Scoring',
  },
  {
    title: 'Anomaly Threshold',
    subtitle: 'Configurable cutoff τ comparison',
    layer: 'Decision',
  },
  {
    title: 'Detection Results',
    subtitle: 'Score, classification & signal metadata',
    layer: 'Output',
  },
  {
    title: 'FastAPI Backend',
    subtitle: 'REST inference endpoint (POST /predict)',
    layer: 'Serving',
  },
  {
    title: 'React Dashboard',
    subtitle: 'Interactive telemetry & session audit UI',
    layer: 'Presentation',
  },
];

export const API_EXAMPLE_REQUEST = `{
  "session_id": "SESSION_001",
  "clicks": 12,
  "session_duration": 145,
  "campaign_id": "CAMPAIGN_01",
  "ad_spend": 25.5
}`;

export const API_EXAMPLE_RESPONSE = `{
  "session_id": "SESSION_001",
  "anomaly_score": 0.87,
  "reconstruction_error": 0.87,
  "status": "anomalous",
  "message": "Potentially unusual session detected"
}`;

export const PROJECT_LIMITATIONS = [
  {
    title: 'Anomalies Are Not Proof of Fraud',
    description:
      'Anomalies are not necessarily fraudulent activity. Legitimate viral spikes, promotional bursts, or seasonal shifts can also raise reconstruction error.',
  },
  {
    title: 'Training Data Representativeness',
    description:
      'Performance depends on the quality and representativeness of training data. Contaminated baselines can cause the autoencoder to normalize abnormal traffic.',
  },
  {
    title: 'Threshold Sensitivity Trade-Offs',
    description:
      'Threshold selection directly affects false positives and false negatives; overly strict cutoffs create alert fatigue while loose thresholds miss subtle abuse.',
  },
  {
    title: 'Evolving & Subtle Fraud Patterns',
    description:
      'Unsupervised learning may struggle with subtle or changing fraud behavior that closely mimics typical session metrics.',
  },
  {
    title: 'Validation Label Requirements',
    description:
      'Rigorous quantitative evaluation requires appropriate validation information where available to benchmark precision and recall reliably.',
  },
];
