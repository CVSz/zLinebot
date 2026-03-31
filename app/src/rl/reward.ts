import type { AgentAction, AgentState } from "../agents/policy.js";

export function computeReward(state: AgentState, action: AgentAction): number {
  const margin = state.marginAfter(action);
  const marginScore = margin * 100;
  const discountPenalty = action.discount > 0.3 ? -5 : 2;
  const rejectPenalty = action.reject ? -20 : 0;

  return marginScore + discountPenalty + rejectPenalty;
}
