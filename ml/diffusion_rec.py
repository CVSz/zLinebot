from __future__ import annotations

import torch
import torch.nn as nn


class DiffusionRec(nn.Module):
    """Tiny denoising backbone for recommendation embedding generation."""

    def __init__(self, d: int = 128, hidden: int = 256):
        super().__init__()
        self.time_mlp = nn.Sequential(
            nn.Linear(1, hidden),
            nn.SiLU(),
            nn.Linear(hidden, d),
        )
        self.net = nn.Sequential(
            nn.Linear(d, hidden),
            nn.ReLU(),
            nn.Linear(hidden, hidden),
            nn.ReLU(),
            nn.Linear(hidden, d),
        )

    def forward(self, x: torch.Tensor, t: torch.Tensor) -> torch.Tensor:
        t_emb = self.time_mlp(t)
        return self.net(x + t_emb)


def sample(model: DiffusionRec, d: int = 128, steps: int = 12, device: str = "cpu") -> torch.Tensor:
    model.eval()

    with torch.no_grad():
        x = torch.randn(1, d, device=device)

        for i in range(steps, 0, -1):
            t = torch.full((1, 1), i / steps, device=device)
            pred = model(x, t)
            x = 0.85 * x + 0.15 * pred

    return x


if __name__ == "__main__":
    m = DiffusionRec(d=128)
    out = sample(m)
    print(out.shape)
