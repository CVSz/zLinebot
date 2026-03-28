export type IpsSample = {
  reward: number;
  pi_new: number;
  pi_old: number;
};

export function ips(samples: IpsSample[], weightClip = 20) {
  if (samples.length === 0) {
    return 0;
  }

  const total = samples.reduce((sum, x) => {
    if (x.pi_old <= 0) {
      return sum;
    }

    const weight = Math.min(weightClip, x.pi_new / x.pi_old);
    return sum + weight * x.reward;
  }, 0);

  return total / samples.length;
}
