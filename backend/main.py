"""Crash-safe FastAPI service for AdGuard AI — Ad Spend Anomaly Detector."""

from __future__ import annotations

from contextlib import asynccontextmanager
from datetime import datetime, timezone
import os
from pathlib import Path
from typing import Literal

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from pydantic import BaseModel, Field
from sqlalchemy import Column, Float, Integer, String, create_engine, desc, event, func
from sqlalchemy.orm import declarative_base, sessionmaker

try:
    import joblib
    import numpy as np
    import torch
    from model import AdGuardAutoencoder, extract_feature_matrix

    ML_DEPS_AVAILABLE = True
except ImportError:
    ML_DEPS_AVAILABLE = False

BASE_DIR = Path(__file__).resolve().parent
ARTIFACTS_DIR = BASE_DIR / "artifacts"
MODEL_PATH = ARTIFACTS_DIR / "autoencoder.pt"
SCALER_PATH = ARTIFACTS_DIR / "scaler.joblib"

if ML_DEPS_AVAILABLE:
    # Keep CPU thread count bounded so small containers stay responsive under concurrency.
    torch.set_num_threads(int(os.getenv("TORCH_NUM_THREADS", "2")))


def normalize_database_url(raw_url: str) -> str:
    if raw_url.startswith("postgres://"):
        return raw_url.replace("postgres://", "postgresql+psycopg://", 1)
    if raw_url.startswith("postgresql://") and "+psycopg" not in raw_url:
        return raw_url.replace("postgresql://", "postgresql+psycopg://", 1)
    return raw_url


DATABASE_URL = normalize_database_url(
    os.getenv("DATABASE_URL", f"sqlite:///{(BASE_DIR / 'adguard.db').as_posix()}")
)
IS_SQLITE = DATABASE_URL.startswith("sqlite")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if IS_SQLITE else {},
    pool_pre_ping=True,
    pool_size=5 if not IS_SQLITE else 1,
    max_overflow=10 if not IS_SQLITE else 0,
)

if IS_SQLITE:
    @event.listens_for(engine, "connect")
    def set_sqlite_wal(dbapi_connection, _connection_record) -> None:
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA journal_mode=WAL;")
        cursor.execute("PRAGMA synchronous=NORMAL;")
        cursor.close()


SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()


class SessionLog(Base):
    __tablename__ = "session_logs"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(64), index=True, nullable=False)
    campaign_id = Column(String(64), index=True, nullable=False)
    campaign_name = Column(String(128), nullable=False, default="Campaign")
    clicks = Column(Integer, nullable=False)
    session_duration = Column(Float, nullable=False)
    ad_spend = Column(Float, nullable=False)
    ctr = Column(Float, nullable=False, default=0.0)
    reconstruction_error = Column(Float, nullable=False)
    anomaly_score = Column(Float, nullable=False)
    timestamp = Column(String(32), nullable=False)
    signal_note = Column(String(255), nullable=True)


Base.metadata.create_all(bind=engine)

THRESHOLD = float(os.getenv("ANOMALY_THRESHOLD", "0.55"))
MAX_BATCH_SIZE = 500
ml_state: dict[str, object] = {
    "model": None,
    "scaler": None,
    "model_loaded": False,
}


@asynccontextmanager
async def lifespan(_app: FastAPI):
    if ML_DEPS_AVAILABLE and MODEL_PATH.exists() and SCALER_PATH.exists():
        scaler = joblib.load(SCALER_PATH)
        model = AdGuardAutoencoder(input_dim=3)
        model.load_state_dict(torch.load(MODEL_PATH, map_location="cpu"))
        model.eval()
        ml_state["scaler"] = scaler
        ml_state["model"] = model
        ml_state["model_loaded"] = True
    yield
    ml_state["model"] = None
    ml_state["scaler"] = None
    ml_state["model_loaded"] = False


app = FastAPI(
    title="AdGuard AI — Ad Spend Anomaly Detector API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(GZipMiddleware, minimum_size=1000)

allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
frontend_origin = os.getenv("FRONTEND_ORIGIN", "").strip()
if frontend_origin:
    allowed_origins.extend([o.strip() for o in frontend_origin.split(",") if o.strip()])

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PredictRequest(BaseModel):
    session_id: str = Field(..., min_length=1, max_length=64)
    clicks: int = Field(..., ge=0, le=100000)
    session_duration: float = Field(..., gt=0, le=86400)
    campaign_id: str = Field(..., min_length=1, max_length=64)
    ad_spend: float = Field(..., ge=0, le=1000000)
    campaign_name: str | None = Field(default=None, max_length=128)


class BatchPredictRequest(BaseModel):
    sessions: list[PredictRequest] = Field(..., min_length=1, max_length=MAX_BATCH_SIZE)


class PredictResponse(BaseModel):
    session_id: str
    anomaly_score: float
    reconstruction_error: float
    status: Literal["normal", "anomalous"]
    message: str
    model_mode: str


class BatchPredictResponse(BaseModel):
    processed: int
    anomalous_count: int
    normal_count: int
    threshold: float
    model_mode: str
    results: list[PredictResponse]


def score_requests(items: list[PredictRequest]) -> tuple[list[float], str]:
    """Compute reconstruction error in a single vectorized pass when PyTorch weights are loaded."""
    if ml_state.get("model_loaded") and ML_DEPS_AVAILABLE:
        scaler = ml_state["scaler"]
        model = ml_state["model"]
        matrix = extract_feature_matrix([item.model_dump() for item in items])
        scaled = scaler.transform(matrix).astype(np.float32)
        tensor_x = torch.tensor(scaled, dtype=torch.float32)
        with torch.no_grad():
            recon = model(tensor_x)
            # Normalize MSE into a bounded 0-1 score for threshold slider consistency
            mse_per_row = torch.mean((tensor_x - recon) ** 2, dim=1)
            scores = torch.clamp(mse_per_row * 4.0, min=0.0, max=1.0).tolist()
        return [round(float(s), 4) for s in scores], "pytorch_autoencoder"

    # Explicit fallback when trained artifacts/autoencoder.pt is not present yet
    fallback_scores: list[float] = []
    for item in items:
        click_rate = item.clicks / max(item.session_duration, 1.0)
        spend_per_click = item.ad_spend / max(item.clicks, 1)
        heuristic = (
            min(0.45, click_rate * 0.28)
            + min(0.35, item.ad_spend / 260.0)
            + (0.25 if item.session_duration < 25 and item.clicks > 15 else 0.05)
            + (0.12 if spend_per_click > 12 else 0.0)
        )
        fallback_scores.append(round(min(0.98, max(0.06, heuristic)), 4))
    return fallback_scores, "untrained_baseline_fallback"


def persist_scored_sessions(
    items: list[PredictRequest], scores: list[float], model_mode: str
) -> list[PredictResponse]:
    now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
    rows: list[SessionLog] = []
    responses: list[PredictResponse] = []

    for item, score in zip(items, scores):
        is_anomalous = score >= THRESHOLD
        status: Literal["normal", "anomalous"] = "anomalous" if is_anomalous else "normal"
        note = (
            "Potentially unusual session detected"
            if is_anomalous
            else "Session falls within baseline distribution"
        )
        if model_mode != "pytorch_autoencoder":
            note = f"[Baseline fallback — train.py not run] {note}"

        est_ctr = round(min(99.0, (item.clicks / max(item.session_duration, 1.0)) * 20.0), 2)
        rows.append(
            SessionLog(
                session_id=item.session_id,
                campaign_id=item.campaign_id,
                campaign_name=item.campaign_name or item.campaign_id,
                clicks=item.clicks,
                session_duration=item.session_duration,
                ad_spend=item.ad_spend,
                ctr=est_ctr,
                reconstruction_error=score,
                anomaly_score=score,
                timestamp=now_str,
                signal_note=note,
            )
        )
        responses.append(
            PredictResponse(
                session_id=item.session_id,
                anomaly_score=score,
                reconstruction_error=score,
                status=status,
                message=note,
                model_mode=model_mode,
            )
        )

    with SessionLocal() as db:
        db.bulk_save_objects(rows)
        db.commit()

    return responses


@app.get("/health")
def health():
    with SessionLocal() as db:
        stored_count = db.query(func.count(SessionLog.id)).scalar() or 0
    return {
        "status": "ok",
        "model_loaded": bool(ml_state.get("model_loaded")),
        "model_mode": (
            "pytorch_autoencoder"
            if ml_state.get("model_loaded")
            else "untrained_baseline_fallback"
        ),
        "database": "sqlite" if IS_SQLITE else "postgresql",
        "stored_sessions": int(stored_count),
        "version": "1.0.0",
    }


@app.get("/sessions")
def get_sessions(
    limit: int = Query(default=200, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    campaign_id: str | None = Query(default=None),
):
    with SessionLocal() as db:
        query = db.query(SessionLog)
        if campaign_id and campaign_id != "ALL":
            query = query.filter(SessionLog.campaign_id == campaign_id)
        rows = (
            query.order_by(desc(SessionLog.id)).offset(offset).limit(limit).all()
        )
        return [
            {
                "session_id": row.session_id,
                "campaign_id": row.campaign_id,
                "campaign_name": row.campaign_name,
                "clicks": row.clicks,
                "session_duration": row.session_duration,
                "ad_spend": row.ad_spend,
                "ctr": row.ctr,
                "reconstruction_error": row.reconstruction_error,
                "anomaly_score": row.anomaly_score,
                "timestamp": row.timestamp,
                "signal_note": row.signal_note,
            }
            for row in rows
        ]


@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
    scores, model_mode = score_requests([req])
    responses = persist_scored_sessions([req], scores, model_mode)
    return responses[0]


@app.post("/predict/batch", response_model=BatchPredictResponse)
def predict_batch(payload: BatchPredictRequest):
    scores, model_mode = score_requests(payload.sessions)
    responses = persist_scored_sessions(payload.sessions, scores, model_mode)
    anomalous_count = sum(1 for r in responses if r.status == "anomalous")
    return BatchPredictResponse(
        processed=len(responses),
        anomalous_count=anomalous_count,
        normal_count=len(responses) - anomalous_count,
        threshold=THRESHOLD,
        model_mode=model_mode,
        results=responses,
    )
