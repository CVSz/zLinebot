export type DrSample = {
  reward: number;
  pi_new: number;
  pi_old: number;
  q_hat: number;
};

export function dr(samples: DrSample[], weightClip = 20) {
  if (samples.length === 0) {
    return 0;
  }

  const total = samples.reduce((sum, x) => {
    if (x.pi_old <= 0) {
      return sum + x.q_hat;
    }

    const weight = Math.min(weightClip, x.pi_new / x.pi_old);
    const correction = weight * (x.reward - x.q_hat);
    return sum + x.q_hat + correction;
  }, 0);

  return total / samples.length;
}
