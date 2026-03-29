export function dr(reward: number, qHat: number, pi: number, mu: number) {
  if (mu <= 0) {
    return qHat;
  }

  return qHat + (pi / mu) * (reward - qHat);
}
