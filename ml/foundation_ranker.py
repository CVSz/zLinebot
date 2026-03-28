from __future__ import annotations

import torch
import torch.nn as nn


class FoundationRanker(nn.Module):
    """Transformer encoder ranker over candidate feature tokens.

    Input: [batch, items, d]
    Output: [batch, items] ranking logits
    """

    def __init__(self, d: int = 256, nhead: int = 8, layers: int = 4, dropout: float = 0.1):
        super().__init__()
        encoder_layer = nn.TransformerEncoderLayer(
            d_model=d,
            nhead=nhead,
            dim_feedforward=d * 4,
            dropout=dropout,
            batch_first=True,
            activation="gelu",
        )
        self.encoder = nn.TransformerEncoder(encoder_layer, num_layers=layers)
        self.norm = nn.LayerNorm(d)
        self.head = nn.Linear(d, 1)

    def forward(self, x: torch.Tensor, padding_mask: torch.Tensor | None = None) -> torch.Tensor:
        h = self.encoder(x, src_key_padding_mask=padding_mask)
        h = self.norm(h)
        return self.head(h).squeeze(-1)


if __name__ == "__main__":
    model = FoundationRanker(d=128)
    sample = torch.randn(2, 20, 128)
    logits = model(sample)
    print(logits.shape)
