export type RiskEvent = {
  amount: number;
  ipChange: boolean;
  velocity: number;
};

export function ruleScore(event: RiskEvent): number {
  let score = 0;
  if (event.amount > 10000) score += 0.4;
  if (event.ipChange) score += 0.3;
  if (event.velocity > 5) score += 0.3;
  return Math.min(1, score);
}
