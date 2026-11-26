"""Train and export the AdGuard AI PyTorch autoencoder and feature scaler."""

from __future__ import annotations

import argparse
import csv
from pathlib import Path
import joblib
import numpy as np
from sklearn.preprocessing import MinMaxScaler
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset

from model import AdGuardAutoencoder, FEATURE_COLUMNS


def generate_synthetic_normal_sessions(count: int = 1200, seed: int = 42) -> np.ndarray:
    """Generate synthetic normal ad traffic solely for prototype training tests."""
    rng = np.random.default_rng(seed)
    clicks = rng.integers(1, 10, size=count).astype(np.float32)
    duration = rng.normal(loc=155.0, scale=35.0, size=count).clip(45.0, 320.0).astype(np.float32)
    spend = np.round(clicks * rng.uniform(1.6, 2.8, size=count), 2).astype(np.float32)
    return np.column_stack([clicks, duration, spend])


def load_csv_features(csv_path: str) -> np.ndarray:
    rows: list[list[float]] = []
    with open(csv_path, mode="r", encoding="utf-8", newline="") as handle:
        reader = csv.DictReader(handle)
        if not reader.fieldnames:
            raise ValueError("CSV file has no header row.")
        missing = [c for c in FEATURE_COLUMNS if c not in reader.fieldnames]
        if missing:
            raise ValueError(f"CSV is missing required columns: {missing}")
        for record in reader:
            try:
                vals = [float(record[col]) for col in FEATURE_COLUMNS]
            except (TypeError, ValueError):
                continue
            rows.append(vals)
    if not rows:
        raise ValueError("No valid numeric training rows found in CSV.")
    return np.array(rows, dtype=np.float32)


def train_model(csv_path: str | None, epochs: int, batch_size: int, out_dir: Path) -> None:
    if csv_path:
        raw_matrix = load_csv_features(csv_path)
    else:
        print("No --csv supplied; generating synthetic baseline normal sessions for prototype training.")
        raw_matrix = generate_synthetic_normal_sessions()

    scaler = MinMaxScaler()
    scaled = scaler.fit_transform(raw_matrix).astype(np.float32)

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
