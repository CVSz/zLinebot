export function mixture(preds: number[], weights: number[]) {
  if (preds.length === 0 || weights.length === 0 || preds.length !== weights.length) {
    return 0;
  }

  const weightedSum = preds.reduce((acc, pred, i) => acc + pred * (weights[i] ?? 0), 0);
  const totalWeight = weights.reduce((acc, weight) => acc + weight, 0) || 1;
  return weightedSum / totalWeight;
}
