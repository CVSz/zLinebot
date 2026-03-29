from __future__ import annotations

import json
from dataclasses import asdict, dataclass

import numpy as np
from market_env import MarketEnv


@dataclass
class SyntheticLog:
    step: int
    action: int
    reward: float
    purchase: int
    utility: float
    pi_old: float


class EpsilonGreedyPolicy:
    def __init__(self, n_items: int, epsilon: float = 0.2):
        self.n_items = n_items
        self.epsilon = epsilon

    def score(self, obs: dict) -> np.ndarray:
        user = obs["user"]
        items = obs["item_embeddings"]
        prices = obs["prices"] * (1.0 - obs["promos"])
        relevance = items @ user / np.sqrt(user.shape[0])
        return relevance - prices

    def act(self, obs: dict):
        scores = self.score(obs)
        greedy_action = int(np.argmax(scores))

        if np.random.rand() < self.epsilon:
            action = int(np.random.randint(0, self.n_items))
            pi_old = self.epsilon / self.n_items
        else:
            action = greedy_action
            pi_old = 1.0 - self.epsilon + (self.epsilon / self.n_items)

        return action, max(float(pi_old), 1e-6)


def generate_logs(episodes: int = 200, n_items: int = 100):
    env = MarketEnv(n_items=n_items)
    policy = EpsilonGreedyPolicy(n_items=n_items, epsilon=0.2)

    logs: list[SyntheticLog] = []
    global_step = 0

    for _ in range(episodes):
        obs = env.reset()
        done = False
        while not done:
            action, pi_old = policy.act(obs)
            obs, reward, done, info = env.step(action)
            logs.append(
                SyntheticLog(
                    step=global_step,
                    action=action,
                    reward=float(reward),
                    purchase=int(info["purchase"]),
                    utility=float(info["utility"]),
                    pi_old=pi_old,
                )
            )
            global_step += 1

    return logs


if __name__ == "__main__":
    logs = generate_logs(episodes=100)
    with open("ml/synthetic_market_logs.jsonl", "w", encoding="utf-8") as f:
        for row in logs:
            f.write(json.dumps(asdict(row)) + "\n")

    mean_reward = np.mean([row.reward for row in logs]) if logs else 0.0
    ctr = np.mean([row.purchase for row in logs]) if logs else 0.0
    print(f"generated={len(logs)} mean_reward={mean_reward:.4f} ctr={ctr:.4f}")
