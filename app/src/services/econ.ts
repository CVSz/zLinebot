export type EconObjective = {
  revenue: number;
  retention: number;
  churn: number;
  invRisk: number;
};

export function objective(metrics: EconObjective): number {
  const weights = { rev: 0.6, ret: 0.25, churn: 0.1, inv: 0.05 };
  return (
    weights.rev * metrics.revenue +
    weights.ret * metrics.retention -
    weights.churn * metrics.churn -
    weights.inv * metrics.invRisk
  );
}

export function choose<T>(actions: T[], evalFn: (action: T) => EconObjective): T {
  if (actions.length === 0) {
    throw new Error("actions must not be empty");
  }

  let best = actions[0] as T;
  let bestValue = Number.NEGATIVE_INFINITY;

  for (const action of actions) {
    const value = objective(evalFn(action));
    if (value > bestValue) {
      bestValue = value;
      best = action;
    }
  }

  return best;
}
