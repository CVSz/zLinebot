export function aggregate(updates: number[][]): number[] {
  if (updates.length === 0) return [];
  const first = updates[0];
  if (!first) return [];
  const d = first.length;
  const out = new Array<number>(d).fill(0);
  for (const u of updates) {
    for (let i = 0; i < d; i += 1) out[i] = (out[i] ?? 0) + (u[i] ?? 0);
  }
  return out.map((v) => v / updates.length);
}
