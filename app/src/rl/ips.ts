export function ips(reward: number, pi: number, mu: number) {
  if (mu <= 0) {
    return 0;
  }

  return reward * (pi / mu);
}
