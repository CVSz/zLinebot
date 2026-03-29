export function shouldFailover(h: { primaryOk: boolean; errorRate: number }): boolean {
  return !h.primaryOk || h.errorRate > 0.02;
}
