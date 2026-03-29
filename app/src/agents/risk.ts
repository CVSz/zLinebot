import type { KPIState } from "../sensors/kpi.js";

export async function riskAgent(state: KPIState): Promise<{ riskScore: number }> {
  return { riskScore: Math.min(1, Math.max(0, state.churn)) };
}
