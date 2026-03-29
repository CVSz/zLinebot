import type { KPIState } from "../sensors/kpi.js";

export async function pricingAgent(_state: KPIState): Promise<{ strategy: string }> {
  return { strategy: "balanced" };
}
