export function argMax(values: number[]): number {
  if (!values.length) {
    return -1;
  }

  let bestIndex = 0;
  let bestValue = values[0] ?? Number.NEGATIVE_INFINITY;
  for (let index = 1; index < values.length; index += 1) {
    if ((values[index] ?? Number.NEGATIVE_INFINITY) > bestValue) {
      bestIndex = index;
      bestValue = values[index] ?? Number.NEGATIVE_INFINITY;
    }
  }

  return bestIndex;
}

export function epsilonGreedy(epsilon: number): boolean {
  return Math.random() < epsilon;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
