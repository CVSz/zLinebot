type Candidate = { id: string; features: number[]; [key: string]: unknown };

async function retrieve(_input: unknown): Promise<Candidate[]> {
  return [];
}

async function rankBatch(vectors: number[][]): Promise<number[]> {
  return vectors.map(() => 0);
}

export async function recommend(input: unknown): Promise<Array<Candidate & { s: number }>> {
  const candidates = await retrieve(input);
  const scores = await rankBatch(candidates.map((c) => c.features));

  return candidates
    .map((c, i) => ({ ...c, s: scores[i] }))
    .sort((a, b) => b.s - a.s)
    .slice(0, 5);
}
