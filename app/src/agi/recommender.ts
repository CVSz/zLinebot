import type { RecommendationCandidate } from "../types.js";

const TOP_K = 5;

async function retrieve(_input: unknown): Promise<RecommendationCandidate[]> {
  return [];
}

async function rankBatch(vectors: number[][]): Promise<number[]> {
  return vectors.map((vector) => vector.reduce((sum, value) => sum + value, 0));
}

export type Recommendation = RecommendationCandidate & { score: number };

function toFeatures(candidate: RecommendationCandidate): number[] {
  return Array.isArray(candidate.features) ? candidate.features : [];
}

export async function recommend(input: unknown): Promise<Recommendation[]> {
  try {
    const candidates = await retrieve(input);
    if (!candidates.length) {
      return [];
    }

    const scores = await rankBatch(candidates.map(toFeatures));

    return candidates
      .map((candidate, index) => ({ ...candidate, score: scores[index] ?? 0 }))
      .sort((left, right) => right.score - left.score)
      .slice(0, TOP_K);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[agi] recommend failed", error);
    return [];
  }
}
