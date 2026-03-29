import gym
import numpy as np
from gym import spaces


class MarketEnv(gym.Env):
    """Simple multi-agent market simulator.

    Agents:
      - User: latent preference + budget dynamics
      - Seller: item prices/promotions (sampled at reset and updated over time)
      - Recommender: chooses an item id to recommend
    """

    metadata = {"render.modes": []}

    def __init__(self, n_items: int = 100, user_dim: int = 64, seed: int | None = None):
        super().__init__()
        self.n_items = n_items
        self.user_dim = user_dim
        self.rng = np.random.default_rng(seed)

        self.action_space = spaces.Discrete(self.n_items)
        self.observation_space = spaces.Dict(
            {
                "user": spaces.Box(-np.inf, np.inf, shape=(self.user_dim,), dtype=np.float32),
                "item_embeddings": spaces.Box(
                    -np.inf, np.inf, shape=(self.n_items, self.user_dim), dtype=np.float32
                ),
                "prices": spaces.Box(0.0, np.inf, shape=(self.n_items,), dtype=np.float32),
                "promos": spaces.Box(0.0, 1.0, shape=(self.n_items,), dtype=np.float32),
                "budget": spaces.Box(0.0, np.inf, shape=(1,), dtype=np.float32),
            }
        )

        self.user = np.zeros(self.user_dim, dtype=np.float32)
        self.item_embeddings = np.zeros((self.n_items, self.user_dim), dtype=np.float32)
        self.prices = np.ones(self.n_items, dtype=np.float32)
        self.promos = np.zeros(self.n_items, dtype=np.float32)
        self.budget = 0.0
        self.t = 0

    def _sample_seller_state(self):
        base_prices = self.rng.uniform(0.1, 2.0, size=self.n_items)
        demand_shock = self.rng.normal(0.0, 0.1, size=self.n_items)
        promos = self.rng.uniform(0.0, 0.4, size=self.n_items)

        self.prices = np.maximum(0.05, base_prices + demand_shock).astype(np.float32)
        self.promos = promos.astype(np.float32)

    def _obs(self):
        return {
            "user": self.user.astype(np.float32),
            "item_embeddings": self.item_embeddings.astype(np.float32),
            "prices": self.prices.astype(np.float32),
            "promos": self.promos.astype(np.float32),
            "budget": np.array([self.budget], dtype=np.float32),
        }

    def reset(self, *, seed: int | None = None, options=None):
        if seed is not None:
            self.rng = np.random.default_rng(seed)

        self.user = self.rng.normal(0, 1, size=self.user_dim).astype(np.float32)
        self.item_embeddings = self.rng.normal(
            0, 1, size=(self.n_items, self.user_dim)
        ).astype(np.float32)
        self._sample_seller_state()
        self.budget = float(self.rng.uniform(1.0, 5.0))
        self.t = 0
        return self._obs()

    def step(self, action: int):
        item = int(action)
        item = max(0, min(item, self.n_items - 1))

        relevance = float(np.dot(self.user, self.item_embeddings[item]) / np.sqrt(self.user_dim))
        effective_price = float(self.prices[item] * (1.0 - self.promos[item]))

        utility = relevance - effective_price
        can_afford = effective_price <= self.budget
        purchase = utility > 0 and can_afford

        reward = effective_price if purchase else 0.0
        if purchase:
            self.budget = max(0.0, self.budget - effective_price)

        self.user = (0.97 * self.user + 0.03 * self.item_embeddings[item]).astype(np.float32)
        self._sample_seller_state()

        self.t += 1
        done = self.t >= 50 or self.budget <= 0

        info = {
            "purchase": int(purchase),
            "utility": utility,
            "effective_price": effective_price,
            "remaining_budget": self.budget,
        }

        return self._obs(), float(reward), done, info
