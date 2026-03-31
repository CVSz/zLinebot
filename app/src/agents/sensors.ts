import type { AgentState } from "./policy.js";

export async function readState(): Promise<AgentState> {
  return {
    tenantId: "default",
    vector: [0, 0, 0],
    candidates: [],
    actionsLastMin: 0,
    marginAfter: () => 1,
    marginAfterGlobal: (actions) => Object.values(actions).length,
    evaluate: () => ({ revenue: 0, retention: 0, churn: 0, invRisk: 0 })
  };
}
