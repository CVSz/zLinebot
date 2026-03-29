import type { KPIState } from "../sensors/kpi.js";

export async function supplyAgent(_state: KPIState): Promise<{ restock: boolean }> {
  return { restock: true };
}
