export function aggregate(updates: number[][]): number[] {
  if (updates.length === 0) return [];
  const d = updates[0].length;
  const out = new Array<number>(d).fill(0);
  for (const u of updates) {
    for (let i = 0; i < d; i += 1) out[i] += u[i];
  }
  return out.map((v) => v / updates.length);
}
