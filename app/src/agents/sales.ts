import type { KPIState } from "../sensors/kpi.js";

export async function salesAgent(state: KPIState): Promise<{ targetRevenue: number }> {
  return { targetRevenue: state.revenue * 1.05 };
}
