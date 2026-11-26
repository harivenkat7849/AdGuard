"""Train and export the AdGuard AI PyTorch autoencoder and feature scaler."""

from __future__ import annotations

import argparse
from pathlib import Path
import joblib
import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset

from model import AdGuardAutoencoder, FEATURE_COLUMNS


def generate_synthetic_normal_sessions(count: int = 1200, seed: int = 42) -> pd.DataFrame:
    """Generate synthetic normal ad traffic solely for prototype training tests."""
    rng = np.random.default_rng(seed)
    clicks = rng.integers(1, 10, size=count)
    duration = rng.normal(loc=155.0, scale=35.0, size=count).clip(45.0, 320.0)
    spend = (clicks * rng.uniform(1.6, 2.8, size=count)).round(2)
    return pd.DataFrame(
        {
            "clicks": clicks,
            "session_duration": duration,
            "ad_spend": spend,
        }
    )


def train_model(csv_path: str | None, epochs: int, batch_size: int, out_dir: Path) -> None:
    if csv_path:
        df = pd.read_csv(csv_path)
        missing = [c for c in FEATURE_COLUMNS if c not in df.columns]
        if missing:
            raise ValueError(f"CSV is missing required columns: {missing}")
        df = df[FEATURE_COLUMNS].dropna()
    else:
        print("No --csv supplied; generating synthetic baseline normal sessions for prototype training.")
        df = generate_synthetic_normal_sessions()

    scaler = MinMaxScaler()
    scaled = scaler.fit_transform(df[FEATURE_COLUMNS].to_numpy(dtype=np.float32))

    dataset = TensorDataset(torch.tensor(scaled, dtype=torch.float32))
    loader = DataLoader(dataset, batch_size=batch_size, shuffle=True)

    model = AdGuardAutoencoder(input_dim=len(FEATURE_COLUMNS))
    optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)
    criterion = nn.MSELoss()

    model.train()
    for epoch in range(1, epochs + 1):
        epoch_loss = 0.0
        for (batch_x,) in loader:
            optimizer.zero_grad()
            recon = model(batch_x)
            loss = criterion(recon, batch_x)
            loss.backward()
            optimizer.step()
            epoch_loss += loss.item() * len(batch_x)
        avg_loss = epoch_loss / len(dataset)
        if epoch % 10 == 0 or epoch == 1:
            print(f"Epoch {epoch:03d}/{epochs} — MSE Loss: {avg_loss:.6f}")

    out_dir.mkdir(parents=True, exist_ok=True)
    torch.save(model.state_dict(), out_dir / "autoencoder.pt")
    joblib.dump(scaler, out_dir / "scaler.joblib")
    print(f"Saved model and scaler to {out_dir.resolve()}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train AdGuard AI Autoencoder")
    parser.add_argument("--csv", type=str, default=None, help="Path to normal training CSV")
    parser.add_argument("--epochs", type=int, default=40)
    parser.add_argument("--batch-size", type=int, default=64)
    parser.add_argument("--out-dir", type=Path, default=Path("artifacts"))
    args = parser.parse_args()

    train_model(args.csv, args.epochs, args.batch_size, args.out_dir)
