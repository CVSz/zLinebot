import type { AgentState } from "../agents/policy.js";

export type DqnScore = {
  action: "hold" | "discount_10" | "discount_20";
  value: number;
};

export async function scoreActions(state: AgentState): Promise<DqnScore[]> {
  const signal = state.vector[0] ?? 0;

  return [
    { action: "hold", value: signal },
    { action: "discount_10", value: signal - 0.1 },
    { action: "discount_20", value: signal - 0.2 }
  ];
}
