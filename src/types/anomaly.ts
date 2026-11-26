export type DataMode = 'demo' | 'live';

export type SessionStatus = 'normal' | 'anomalous';

export interface SessionRecord {
  session_id: string;
  campaign_id: string;
  campaign_name: string;
  clicks: number;
  session_duration: number;
  ad_spend: number;
  ctr: number;
  reconstruction_error: number;
  anomaly_score: number;
  timestamp: string;
  signal_note?: string;
}

export interface ClassifiedSession extends SessionRecord {
  status: SessionStatus;
}

export interface PredictRequest {
  session_id: string;
  clicks: number;
  session_duration: number;
  campaign_id: string;
  ad_spend: number;
}

export interface PredictResponse {
  session_id: string;
  anomaly_score: number;
  reconstruction_error: number;
  status: SessionStatus;
  message: string;
  source?: DataMode;
  model_mode?: string;
}

export interface BatchPredictResponse {
  processed: number;
  anomalous_count: number;
  normal_count: number;
  threshold: number;
  model_mode: string;
  source: DataMode;
  results: PredictResponse[];
}

export interface HealthResponse {
  status: string;
  model_loaded?: boolean;
  model_mode?: string;
  database?: string;
  stored_sessions?: number;
  version?: string;
}

export interface CampaignSpendMetric {
  campaign_id: string;
  campaign_name: string;
  normalSpend: number;
  anomalousSpend: number;
  sessions: number;
}

export interface ErrorBucket {
  range: string;
  minError: number;
  maxError: number;
  normalCount: number;
  anomalousCount: number;
}

export interface HeroActivityPoint {
  time: string;
  sessions: number;
  reconstructionError: number;
  anomalies: number;
}

export interface WorkflowStage {
  id: string;
  step: string;
  title: string;
  shortLabel: string;
  summary: string;
  details: string;
  inputSample: string;
  outputSample: string;
}

export interface TechnicalStep {
  number: string;
  title: string;
  subtitle: string;
  description: string;
  highlights: string[];
  codeHint: string;
}

export interface TechStackItem {
  name: string;
  category: string;
  role: string;
  status: 'Implemented (Frontend)' | 'ML Pipeline Architecture' | 'Backend Integration Target';
  detail: string;
}

export interface ProjectObjective {
  id: string;
  title: string;
  description: string;
  bloomLevel: 'Understand' | 'Apply' | 'Create' | 'Evaluate';
  bloomRationale: string;
}

export interface RoadmapWeek {
  week: string;
  title: string;
  summary: string;
  deliverable: string;
  tasks: string[];
}

export interface EvaluationCriterion {
  name: string;
  weight: number;
  description: string;
  color: string;
}
