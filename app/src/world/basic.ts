export type State = { demand: number; price: number; budget: number };

export function step(state: State, action: { price: number }) {
  const elasticity = -0.8;
  const noise = (Math.random() - 0.5) * 0.05;

  const demand = state.demand * (1 + elasticity * (action.price - state.price)) * (1 + noise);
  const revenue = Math.max(0, demand * action.price);
  const next: State = { ...state, demand, price: action.price };

  return { next, revenue };
}
