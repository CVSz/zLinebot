import { randomUUID } from "crypto";
import { db } from "../db.js";
import { enqueueAutomationJob } from "../queue/automation.js";

export type CreateAutomationRuleInput = {
  tenantId: string;
  trigger: string;
  action: string;
  condition?: string;
};

export async function createAutomationRule(input: CreateAutomationRuleInput): Promise<string> {
  const id = randomUUID();

  await db.query(
    `INSERT INTO automation_rules (id, tenant_id, trigger, action, condition)
     VALUES ($1, $2, $3, $4, $5)`,
    [id, input.tenantId, input.trigger, input.action, input.condition ?? null]
  );

  return id;
}

export async function listAutomationRules(tenantId: string) {
  const result = await db.query(
    `SELECT id, trigger, action, condition, created_at
     FROM automation_rules
     WHERE tenant_id = $1
     ORDER BY created_at DESC`,
    [tenantId]
  );

  return result.rows;
}

function matchesCondition(condition: string | null, payload: Record<string, unknown>): boolean {
  if (!condition) {
    return true;
  }

  const containsMatch = /^contains\('(.*)'\)$/.exec(condition.trim());
  if (!containsMatch) {
    return false;
  }

  const target = String(payload.message ?? "");
  const keyword = containsMatch[1] ?? "";
  return target.toLowerCase().includes(keyword.toLowerCase());
}

export async function triggerAutomations(
  tenantId: string,
  trigger: string,
  payload: Record<string, unknown>
): Promise<number> {
  const result = await db.query(
    `SELECT id, condition
     FROM automation_rules
     WHERE tenant_id = $1 AND trigger = $2`,
    [tenantId, trigger]
  );

  let queued = 0;
  for (const row of result.rows as Array<{ id: string; condition: string | null }>) {
    if (!matchesCondition(row.condition, payload)) {
      continue;
    }

    await enqueueAutomationJob({
      tenantId,
      ruleId: row.id,
      payload
    });
    queued += 1;
  }

  return queued;
}
