import torch


@torch.no_grad()
def simulate(model, state: torch.Tensor, steps: int = 10) -> list[torch.Tensor]:
    trajectory = []
    current = state

    for _ in range(steps):
        action = torch.randn_like(current)
        current = model(current, action)
        trajectory.append(current)

    return trajectory
