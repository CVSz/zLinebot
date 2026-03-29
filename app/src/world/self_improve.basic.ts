export type WorldModel = {
  elasticity: number;
  bias: number;
};

export type MarketState = {
  demand: number;
  price: number;
};

export type PricingAction = {
  price: number;
};

export function predict(wm: WorldModel, state: MarketState, action: PricingAction) {
  const demand = state.demand * (1 + wm.elasticity * (action.price - state.price)) + wm.bias;
  return Math.max(0, demand);
}

export function update(wm: WorldModel, pred: number, actual: number, lr = 0.01): WorldModel {
  const err = actual - pred;
  return {
    elasticity: wm.elasticity + lr * err * 0.001,
    bias: wm.bias + lr * err
  };
}

export function guard(previousWm: WorldModel, newWm: WorldModel, kpiDelta: number): WorldModel {
  if (kpiDelta < -0.02) {
    return previousWm;
  }

  return newWm;
}
