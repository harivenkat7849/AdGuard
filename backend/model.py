"""PyTorch autoencoder architecture for AdGuard AI."""

from __future__ import annotations

import numpy as np
import torch
import torch.nn as nn


FEATURE_COLUMNS = ["clicks", "session_duration", "ad_spend"]


class AdGuardAutoencoder(nn.Module):
    """Symmetric MLP autoencoder for unsupervised ad-session reconstruction."""

    def __init__(self, input_dim: int = 3) -> None:
        super().__init__()
        self.encoder = nn.Sequential(
            nn.Linear(input_dim, 16),
            nn.ReLU(),
            nn.Linear(16, 8),
            nn.ReLU(),
            nn.Linear(8, 4),
        )
        self.decoder = nn.Sequential(
            nn.Linear(4, 8),
            nn.ReLU(),
            nn.Linear(8, 16),
            nn.ReLU(),
            nn.Linear(16, input_dim),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        latent = self.encoder(x)
        return self.decoder(latent)


def extract_feature_matrix(records: list[dict]) -> np.ndarray:
    """Convert raw session dicts into an ordered float32 feature matrix."""
    return np.array(
        [
            [
                float(item["clicks"]),
                float(item["session_duration"]),
                float(item["ad_spend"]),
            ]
            for item in records
        ],
        dtype=np.float32,
    )
