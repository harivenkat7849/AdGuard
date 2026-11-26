import { DEMO_CAMPAIGNS, DEMO_SESSIONS } from '../data/demoSessions';
import {
  BatchPredictResponse,
  DataMode,
  HealthResponse,
  PredictRequest,
  PredictResponse,
  SessionRecord,
} from '../types/anomaly';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, '') || 'http://localhost:8000';

export const MAX_BATCH_SESSIONS = 500;

export class ApiUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiUnavailableError';
  }
}

export function getApiBaseUrl(): string {
  return API_BASE_URL;
}

function computeDemoHeuristicScore(payload: PredictRequest): number {
  const clickRate = payload.clicks / Math.max(payload.session_duration, 1);
  const spendPerClick = payload.ad_spend / Math.max(payload.clicks, 1);
  const rawHeuristic =
    Math.min(0.45, clickRate * 0.28) +
    Math.min(0.35, payload.ad_spend / 260) +
    (payload.session_duration < 25 && payload.clicks > 15 ? 0.25 : 0.05) +
    (spendPerClick > 12 ? 0.12 : 0);

  return Number(Math.min(0.98, Math.max(0.06, rawHeuristic)).toFixed(2));
}

/**
 * Checks FastAPI backend availability.
 * Never falls back silently to fake "live" status.
 */
export async function checkBackendHealth(signal?: AbortSignal): Promise<HealthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal,
    });

    if (!response.ok) {
      throw new ApiUnavailableError(
        `Backend responded with HTTP ${response.status} at ${API_BASE_URL}/health`
      );
    }

    return (await response.json()) as HealthResponse;
  } catch (err) {
    if (err instanceof ApiUnavailableError) throw err;
    throw new ApiUnavailableError(
      `Unable to reach FastAPI backend at ${API_BASE_URL}. Ensure the server is running and CORS is configured.`
    );
  }
}

/**
 * Fetches paginated sessions from FastAPI in LIVE MODE, or returns illustrative DEMO_SESSIONS in DEMO MODE.
 */
export async function fetchSessions(
  mode: DataMode,
  limit = 500,
  offset = 0
): Promise<{
  sessions: SessionRecord[];
  source: DataMode;
  fallbackReason?: string;
}> {
  if (mode === 'demo') {
    return { sessions: DEMO_SESSIONS, source: 'demo' };
  }

  try {
    const controller = new AbortController();
    // Allow up to 35s for Render free-tier cold start wake-up
    const timeout = window.setTimeout(() => controller.abort(), 35000);

    const response = await fetch(
      `${API_BASE_URL}/sessions?limit=${encodeURIComponent(limit)}&offset=${encodeURIComponent(offset)}`,
      {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      }
    );

    window.clearTimeout(timeout);

    if (!response.ok) {
      throw new ApiUnavailableError(
        `FastAPI /sessions endpoint returned HTTP ${response.status}.`
      );
    }

    const payload = (await response.json()) as SessionRecord[];
    if (!Array.isArray(payload)) {
      throw new ApiUnavailableError('Unexpected response shape from /sessions.');
    }

    return { sessions: payload, source: 'live' };
  } catch (err) {
    const baseDetail =
      err instanceof Error
        ? err.message
        : `FastAPI backend unavailable at ${API_BASE_URL}.`;

    const hint =
      API_BASE_URL.includes('localhost') &&
      typeof window !== 'undefined' &&
      window.location.hostname !== 'localhost'
        ? ` (Vercel is still pointing to ${API_BASE_URL} — set VITE_API_BASE_URL in Vercel and Redeploy.)`
        : ` (Endpoint: ${API_BASE_URL} — verify Render is awake and CORS allows ${typeof window !== 'undefined' ? window.location.origin : 'this origin'}.)`;

    // Clean explicit fallback: returned source is explicitly marked 'demo' so UI warns the user.
    return {
      sessions: DEMO_SESSIONS,
      source: 'demo',
      fallbackReason: `${baseDetail}${hint} Showing clearly labelled DEMO DATA fallback instead.`,
    };
  }
}

/**
 * Sends a single session payload to FastAPI POST /predict in LIVE MODE,
 * or computes an illustrative deterministic heuristic score in DEMO MODE.
 */
export async function predictSession(
  payload: PredictRequest,
  mode: DataMode,
  threshold: number
): Promise<PredictResponse> {
  if (mode === 'demo') {
    const simulatedError = computeDemoHeuristicScore(payload);
    const isAnomalous = simulatedError >= threshold;

    return {
      session_id: payload.session_id,
      anomaly_score: simulatedError,
      reconstruction_error: simulatedError,
      status: isAnomalous ? 'anomalous' : 'normal',
      message: isAnomalous
        ? 'DEMO SIMULATION: Input deviates from illustrative normal baseline'
        : 'DEMO SIMULATION: Input falls within illustrative normal baseline',
      source: 'demo',
      model_mode: 'demo_simulation',
    };
  }

  try {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 35000);

    const response = await fetch(`${API_BASE_URL}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    window.clearTimeout(timeout);

    if (!response.ok) {
      throw new ApiUnavailableError(
        `FastAPI /predict returned HTTP ${response.status}`
      );
    }

    const data = (await response.json()) as PredictResponse;
    return {
      ...data,
      source: 'live',
    };
  } catch (err) {
    if (err instanceof ApiUnavailableError) throw err;
    throw new ApiUnavailableError(
      `Cannot connect to FastAPI POST ${API_BASE_URL}/predict. Switch to DEMO MODE or start the backend server.`
    );
  }
}

/**
 * Sends up to MAX_BATCH_SESSIONS (500) sessions in one vectorized FastAPI request,
 * or scores them locally as clearly labelled DEMO SIMULATION records.
 */
export async function predictBatch(
  sessions: PredictRequest[],
  mode: DataMode,
  threshold: number
): Promise<BatchPredictResponse> {
  const bounded = sessions.slice(0, MAX_BATCH_SESSIONS);

  if (mode === 'demo') {
    const results: PredictResponse[] = bounded.map((item) => {
      const score = computeDemoHeuristicScore(item);
      const isAnomalous = score >= threshold;
      return {
        session_id: item.session_id,
        anomaly_score: score,
        reconstruction_error: score,
        status: isAnomalous ? 'anomalous' : 'normal',
        message: isAnomalous
          ? 'DEMO SIMULATION: Deviates from illustrative normal baseline'
          : 'DEMO SIMULATION: Within illustrative normal baseline',
        source: 'demo',
        model_mode: 'demo_simulation',
      };
    });

    const anomalousCount = results.filter((r) => r.status === 'anomalous').length;
    return {
      processed: results.length,
      anomalous_count: anomalousCount,
      normal_count: results.length - anomalousCount,
      threshold,
      model_mode: 'demo_simulation',
      source: 'demo',
      results,
    };
  }

  try {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 45000);

    const response = await fetch(`${API_BASE_URL}/predict/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ sessions: bounded }),
      signal: controller.signal,
    });

    window.clearTimeout(timeout);

    if (!response.ok) {
      throw new ApiUnavailableError(
        `FastAPI /predict/batch returned HTTP ${response.status}`
      );
    }

    const data = (await response.json()) as Omit<BatchPredictResponse, 'source'>;
    return {
      ...data,
      source: 'live',
    };
  } catch (err) {
    if (err instanceof ApiUnavailableError) throw err;
    throw new ApiUnavailableError(
      `Cannot connect to FastAPI POST ${API_BASE_URL}/predict/batch. Ensure the backend is running.`
    );
  }
}

/**
 * Generates synthetic PredictRequest items for stress-testing batch storage (clearly labelled DEMO).
 */
export function generateSyntheticBatch(count = 250): PredictRequest[] {
  const safeCount = Math.min(Math.max(1, count), MAX_BATCH_SESSIONS);
  return Array.from({ length: safeCount }, (_, idx) => {
    const campaign = DEMO_CAMPAIGNS[idx % DEMO_CAMPAIGNS.length];
    const isBurst = idx % 7 === 0;
    const clicks = isBurst ? 28 + (idx % 45) : 2 + (idx % 7);
    const duration = isBurst ? 8 + (idx % 18) : 110 + ((idx * 13) % 130);
    const spend = Number(
      (isBurst ? 78 + (idx % 140) : clicks * 2.1 + (idx % 5)).toFixed(2)
    );

    return {
      session_id: `BATCH_SESS_${String(idx + 1).padStart(3, '0')}`,
      campaign_id: campaign.id,
      clicks,
      session_duration: duration,
      ad_spend: spend,
    };
  });
}

/**
 * Parses CSV lines with header: session_id,campaign_id,clicks,session_duration,ad_spend
 */
export function parseBatchCsv(csvText: string): PredictRequest[] {
  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) return [];

  const startIndex = lines[0].toLowerCase().includes('session_id') ? 1 : 0;
  const parsed: PredictRequest[] = [];

  for (let i = startIndex; i < lines.length && parsed.length < MAX_BATCH_SESSIONS; i++) {
    const cols = lines[i].split(',').map((c) => c.trim());
    if (cols.length < 5) continue;

    const [session_id, campaign_id, clicksStr, durStr, spendStr] = cols;
    const clicks = Number(clicksStr);
    const session_duration = Number(durStr);
    const ad_spend = Number(spendStr);

    if (
      !session_id ||
      !campaign_id ||
      Number.isNaN(clicks) ||
      Number.isNaN(session_duration) ||
      Number.isNaN(ad_spend) ||
      session_duration <= 0
    ) {
      continue;
    }

    parsed.push({
      session_id,
      campaign_id,
      clicks: Math.max(0, Math.round(clicks)),
      session_duration,
      ad_spend: Math.max(0, ad_spend),
    });
  }

  return parsed;
}
