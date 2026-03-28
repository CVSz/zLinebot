import torch
import torch.nn as nn


class RewardModel(nn.Module):
    def __init__(self, dim: int):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(dim, 128),
            nn.ReLU(),
            nn.Linear(128, 1),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.net(x)


def train_reward_model(data, dim: int = 384, lr: float = 1e-4, epochs: int = 1):
    model = RewardModel(dim)
    optimizer = torch.optim.Adam(model.parameters(), lr=lr)

    for _ in range(epochs):
        for x, reward in data:
            prediction = model(x)
            loss = ((prediction - reward) ** 2).mean()
            loss.backward()
            optimizer.step()
            optimizer.zero_grad()

    return model
