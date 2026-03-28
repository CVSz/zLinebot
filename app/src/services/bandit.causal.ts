export type CausalBanditSample = {
  reward: number;
  pi_new: number;
  pi_old: number;
  q_hat: number;
};

export function causalScore(sample: CausalBanditSample, weightClip = 10) {
  if (!Number.isFinite(sample.pi_old) || sample.pi_old <= 0) {
    return sample.q_hat;
  }

  const ratio = sample.pi_new / sample.pi_old;
  const weight = Math.min(weightClip, Math.max(0, ratio));
  const ips = weight * (sample.reward - sample.q_hat);

  return sample.q_hat + ips;
}

export function meanCausalScore(samples: CausalBanditSample[], weightClip = 10) {
  if (samples.length === 0) {
    return 0;
  }

  const total = samples.reduce((sum, row) => sum + causalScore(row, weightClip), 0);
  return total / samples.length;
}
