import type { AgentAction, AgentState } from "./policy.js";

const MAX_DISCOUNT = 0.3;
const MIN_MARGIN = 0.1;
const MAX_ACTIONS_PER_MINUTE = 20;

export function guard(state: AgentState, action: AgentAction): AgentAction {
  const safe = { ...action };

  if (safe.discount > MAX_DISCOUNT) {
    safe.discount = MAX_DISCOUNT;
  }

  if (state.marginAfter(safe) < MIN_MARGIN || state.actionsLastMin > MAX_ACTIONS_PER_MINUTE) {
    safe.reject = true;
  }

  return safe;
}
