import torch
import torch.nn as nn


class Tower(nn.Module):
    def __init__(self, in_dim: int, out_dim: int = 128):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(in_dim, 256),
            nn.ReLU(),
            nn.Linear(256, out_dim),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.net(x)


class TwoTower(nn.Module):
    def __init__(self, feature_dim: int, embedding_dim: int = 128):
        super().__init__()
        self.user_tower = Tower(feature_dim, embedding_dim)
        self.item_tower = Tower(feature_dim, embedding_dim)

    def forward(self, user_x: torch.Tensor, item_x: torch.Tensor) -> torch.Tensor:
        user_emb = self.user_tower(user_x)
        item_emb = self.item_tower(item_x)
        return (user_emb * item_emb).sum(dim=1)


def train() -> None:
    feature_dim = 128
    model = TwoTower(feature_dim)
    optimizer = torch.optim.Adam(model.parameters(), 1e-3)
    criterion = nn.BCEWithLogitsLoss()

    model.train()
    for step in range(500):
        user_x = torch.randn(64, feature_dim)
        item_x = torch.randn(64, feature_dim)
        label = torch.randint(0, 2, (64,), dtype=torch.float32)

        logits = model(user_x, item_x)
        loss = criterion(logits, label)

        optimizer.zero_grad()
        loss.backward()
        optimizer.step()

        if step % 100 == 0:
            print(f"step={step} loss={loss.item():.6f}")

    torch.save(model.state_dict(), "two_tower.pt")


if __name__ == "__main__":
    train()
