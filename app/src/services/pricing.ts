export function optimalPrice(currentPrice: number, elasticity: number, cost: number): number {
  const boundedElasticity = Math.max(1.1, Math.abs(elasticity));
  const target = cost / (1 - 1 / boundedElasticity);
  return Math.max(0.7 * currentPrice, Math.min(1.3 * currentPrice, target));
}
