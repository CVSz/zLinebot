import type { AgentAction } from "./policy.js";

export type ActionResult = {
  applied: boolean;
  reason?: string;
};

export async function act(action: AgentAction): Promise<ActionResult> {
  if (action.reject) {
    return { applied: false, reason: "rejected_by_guardrails" };
  }

  return { applied: true };
}
