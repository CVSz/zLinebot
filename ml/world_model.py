import torch
import torch.nn as nn


class WorldModel(nn.Module):
    def __init__(self, state_dim: int, action_dim: int):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(state_dim + action_dim, 256),
            nn.ReLU(),
            nn.Linear(256, state_dim),
        )

    def forward(self, state: torch.Tensor, action: torch.Tensor) -> torch.Tensor:
        x = torch.cat([state, action], dim=-1)
        return self.net(x)


class SequenceWorldModel(nn.Module):
    """Enterprise world model for sequence-based rollout prediction."""

    def __init__(self, dim: int = 64):
        super().__init__()
        self.rnn = nn.GRU(input_size=dim, hidden_size=dim, batch_first=True)
        self.head = nn.Linear(dim, dim)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        hidden, _ = self.rnn(x)
        return self.head(hidden[:, -1])
