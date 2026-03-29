import { readKPIs } from "../sensors/kpi.js";
import { plan } from "./planner.js";
import { enforce } from "./guardrails.js";
import { execute } from "./executor.js";
import { auditLog } from "../services/audit.js";

export async function controlTick() {
  const state = await readKPIs();
  const planDraft = await plan(state);
  const safePlan = enforce(state, planDraft);
  const result = await execute(safePlan);

  await auditLog({
    tenantId: state.tenantId,
    actor: "control-plane",
    action: "plan_execute",
    resource: "org",
    before: { state },
    after: { plan: safePlan, result },
    traceId: state.traceId
  });

  return result;
}
