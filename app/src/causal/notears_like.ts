export function h(adjacency: number[][]) {
  const d = adjacency.length;
  let trace = 0;

  for (let i = 0; i < d; i += 1) {
    const diag = adjacency[i]?.[i] ?? 0;
    trace += Math.exp(diag * diag);
  }

  return trace - d;
}

export function score(data: number[][], adjacency: number[][]) {
  const reconstruction = data.reduce(
    (sum, row) => sum + row.reduce((innerSum, value) => innerSum + value * value, 0),
    0
  );

  return reconstruction + 10 * h(adjacency);
}
