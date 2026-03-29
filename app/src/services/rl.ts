import type { CandidateItem } from "../agents/policy.js";

export async function rankRL(_stateVector: number[], items: CandidateItem[]): Promise<string | null> {
  return items[0]?.id ?? null;
}
