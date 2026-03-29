export function finalRisk(rule: number, ml: number): number {
  return 0.5 * rule + 0.5 * ml;
}
