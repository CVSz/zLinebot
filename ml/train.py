import torch
import torch.nn as nn


class RankNet(nn.Module):
    def __init__(self, d: int):
        super().__init__()
        self.mlp = nn.Sequential(
            nn.Linear(d * 3, 128),
            nn.ReLU(),
            nn.Linear(128, 1),
        )

    def forward(self, q, u, s):
        x = torch.cat([q, u, s], dim=-1)
        return self.mlp(x)


def train():
    d = 384
    model = RankNet(d)
    optimizer = torch.optim.Adam(model.parameters(), 1e-3)

    for step in range(1000):
        q = torch.randn(32, d)
        u = torch.randn(32, d)
        s = torch.randn(32, d)
        y = torch.rand(32, 1)

        prediction = model(q, u, s)
        loss = ((prediction - y) ** 2).mean()

        loss.backward()
        optimizer.step()
        optimizer.zero_grad()

        if step % 100 == 0:
            print(f"step={step} loss={loss.item():.6f}")

    torch.save(model.state_dict(), "model.pt")


if __name__ == "__main__":
    train()
