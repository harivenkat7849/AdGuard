# AdGuard AI — Ad Spend Anomaly Detector

> **Detect the unusual. Protect the budget.**  
> *Academic project — machine learning-based anomaly detection prototype.*

AdGuard AI is a modern SaaS web application built with React, TypeScript, Tailwind CSS, GSAP, and Recharts to present, explain, and operationalize an unsupervised **PyTorch Autoencoder** anomaly detector for advertising traffic, click activity, and ad spend patterns.

---

## Key Features

- **Interactive Analytics Console**: Dynamic reconstruction-error threshold slider (`τ`), KPI counters, campaign spend charts, error distribution charts, campaign & status filters, and Session ID search.
- **Dual Data Modes (`DEMO MODE` / `LIVE MODE`)**:
  - **DEMO MODE**: Uses clearly labelled synthetic `DEMO DATA` for interactive exploration without requiring a running backend.
  - **LIVE MODE**: Connects to a FastAPI service via `VITE_API_BASE_URL` (`GET /health`, `GET /sessions`, `POST /predict`), with explicit fallback warnings if the backend is offline.
- **Interactive ML Explainers**: Clickable 6-stage detection pipeline, normal vs. suspicious feature reconstruction error comparison, 6-step technical walkthrough, system architecture diagram, Bloom's Taxonomy alignment, 4-week roadmap, evaluation rubric breakdown, and FastAPI contract documentation.
- **GSAP Motion & Accessibility**: ScrollTrigger section reveals, hero staggered animations, and smooth numeric counters respecting `prefers-reduced-motion`.

---

## Project Folder Structure

```text
.
├── .env.example              # Frontend environment variable template (VITE_API_BASE_URL)
├── index.html                # Entry HTML with fonts and dark-theme shell
├── package.json              # Scripts & dependencies
├── render.yaml               # Render Blueprint for one-click FastAPI backend deploy
├── vercel.json               # SPA fallback rewrite rule for Vercel
├── vite.config.ts            # Vite + React + Tailwind CSS v4 plugin config
├── backend/
│   ├── .env.example          # Backend environment variables (DATABASE_URL, FRONTEND_ORIGIN)
│   ├── Procfile              # Railway / Procfile start command
│   ├── main.py               # Crash-safe FastAPI service (/health, /sessions, /predict, /predict/batch)
│   ├── model.py              # PyTorch AdGuardAutoencoder architecture
│   ├── requirements.txt      # CPU-only PyTorch + FastAPI + SQLAlchemy dependencies
│   └── train.py              # Training script exporting artifacts/autoencoder.pt & scaler.joblib
├── src/
│   ├── components/           # Reusable UI primitives (Navbar, Footer, Logo, DemoBadge, etc.)
│   ├── data/                 # Illustrative DEMO DATA & structured academic content
│   ├── hooks/                # Custom hooks (useDashboardData, useActiveSection, useGsapAnimations)
│   ├── pages/                # Route pages (HomePage, DashboardPage)
│   ├── sections/             # All modular landing & analytics sections
│   ├── services/             # Decoupled FastAPI REST client (src/services/api.ts)
│   ├── types/                # TypeScript interfaces & API contracts
│   ├── App.tsx               # React Router setup
│   ├── index.css             # Tailwind CSS v4 & custom utility styles
│   ├── main.tsx              # Application mount
│   └── vite-env.d.ts         # Vite client type declarations
└── README.md
```

---

## 1. Install Dependencies

```bash
npm install
```

*(On Windows PowerShell if `npm.ps1` execution policy is restricted, run `npm.cmd install`.)*

---

## 2. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Default `.env`:

```env
VITE_API_BASE_URL=http://localhost:8000
```

---

## 3. Run Locally (Development Server)

```bash
npm run dev
```

Open the local URL printed by Vite (typically `http://localhost:5173`).

---

## 4. Build for Production

```bash
npm run build
```

To preview the production bundle locally:

```bash
npm run preview
```

---

## 5. Deploy Frontend on Vercel

1. Push this repository to GitHub/GitLab/Bitbucket.
2. Import the project in **Vercel** (`vercel.com`).
3. Keep the auto-detected settings:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add your production environment variable in **Vercel Project Settings → Environment Variables**:
   - `VITE_API_BASE_URL` = `https://your-fastapi-service.onrender.com` (no trailing slash)
5. Deploy. The included `vercel.json` handles client-side routing for `/dashboard`.

Or deploy via Vercel CLI:

```bash
npm i -g vercel
vercel --prod
```

---

## 6. Deploy FastAPI Backend Separately

Host your Python/FastAPI service on **Render**, **Railway**, or **Fly.io** with `uvicorn`:

1. Create a `requirements.txt` in your backend repo:
   ```txt
   fastapi
   uvicorn[standard]
   torch
   numpy
   scikit-learn
   joblib
   pydantic
   ```
2. Start command for production hosting:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port $PORT
   ```

---

## 7. FastAPI CORS Configuration

Allow your local Vite origin and production Vercel domain in FastAPI:

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="AdGuard AI Inference API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://your-vercel-app.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 8. Connecting the Actual PyTorch Autoencoder Model

Example FastAPI integration loading a saved `autoencoder.pt` model and `scaler.joblib`:

```python
import joblib
import numpy as np
import torch
import torch.nn as nn
from fastapi import FastAPI
from pydantic import BaseModel

class Autoencoder(nn.Module):
    def __init__(self, input_dim: int):
        super().__init__()
        self.encoder = nn.Sequential(
            nn.Linear(input_dim, 16),
            nn.ReLU(),
            nn.Linear(16, 6),
        )
        self.decoder = nn.Sequential(
            nn.Linear(6, 16),
            nn.ReLU(),
            nn.Linear(16, input_dim),
        )

    def forward(self, x):
        return self.decoder(self.encoder(x))

class PredictRequest(BaseModel):
    session_id: str
    clicks: int
    session_duration: float
    campaign_id: str
    ad_spend: float

# Load artifacts once at startup
scaler = joblib.load("artifacts/scaler.joblib")
model = Autoencoder(input_dim=3)
model.load_state_dict(torch.load("artifacts/autoencoder.pt", map_location="cpu"))
model.eval()

THRESHOLD = 0.55

@app.get("/health")
def health():
    return {"status": "ok", "model_loaded": True}

@app.post("/predict")
def predict(req: PredictRequest):
    features = np.array([[req.clicks, req.session_duration, req.ad_spend]], dtype=np.float32)
    scaled = scaler.transform(features)
    tensor_x = torch.tensor(scaled, dtype=torch.float32)

    with torch.no_grad():
        reconstructed = model(tensor_x)
        mse = float(torch.mean((tensor_x - reconstructed) ** 2).item())

    is_anomalous = mse >= THRESHOLD
    return {
        "session_id": req.session_id,
        "anomaly_score": round(mse, 4),
        "reconstruction_error": round(mse, 4),
        "status": "anomalous" if is_anomalous else "normal",
        "message": (
            "Potentially unusual session detected"
            if is_anomalous
            else "Session falls within learned normal behavior"
        ),
    }
```

---

## 9. Switching Between DEMO MODE and LIVE MODE

1. Start your FastAPI backend on `http://localhost:8000` (or set `VITE_API_BASE_URL` to your deployed backend URL).
2. Open the **Interactive Analytics** section (or `/dashboard`).
3. Click **`LIVE MODE`** in the **Data Source Mode** toggle at the top of the dashboard.
4. Click **`Ping /health`** or submit a payload in the **Session Anomaly Inference Tester (`POST /predict`)** to inspect live responses.
5. If FastAPI is unreachable, AdGuard AI explicitly notifies you and falls back to clearly labelled `DEMO DATA` rather than silently misrepresenting mock values as real model predictions.
