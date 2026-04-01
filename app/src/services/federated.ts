export function mask(weights: number[]): number[] {
  const noise = weights.map(() => Math.random() * 0.01);
  return weights.map((w, i) => w + (noise[i] ?? 0));
}
