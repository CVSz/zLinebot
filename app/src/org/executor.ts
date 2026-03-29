import type { PlanDraft } from "./guardrails.js";

export async function execute(safePlan: PlanDraft): Promise<{ ok: boolean; plan: PlanDraft }> {
  return { ok: true, plan: safePlan };
}
