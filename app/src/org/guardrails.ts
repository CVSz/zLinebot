import type { KPIState } from "../sensors/kpi.js";

export type PlanDraft = { sales: unknown; pricing: unknown; supply: unknown; risk: unknown };

export function enforce(_state: KPIState, planDraft: PlanDraft): PlanDraft {
  return planDraft;
}
