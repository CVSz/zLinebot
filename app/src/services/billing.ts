import { randomUUID } from "crypto";
import { db } from "../db.js";

export const PLAN_LIMITS = {
  free: { automations: 5, monthlyTasks: 1_000 },
  pro: { automations: 100, monthlyTasks: 50_000 },
  enterprise: { automations: 10_000, monthlyTasks: 1_000_000 }
} as const;

export type BillingPlan = keyof typeof PLAN_LIMITS;

export async function createInvoice(tenantId: string, amount: number) {
  const id = randomUUID();

  await db.query(
    `INSERT INTO invoices (id, tenant_id, amount, status)
     VALUES ($1, $2, $3, 'pending')`,
    [id, tenantId, amount]
  );

  return id;
}

export async function markPaid(invoiceId: string) {
  await db.query("UPDATE invoices SET status='paid' WHERE id=$1", [invoiceId]);
}

export async function setSubscriptionPlan(tenantId: string, plan: BillingPlan): Promise<void> {
  await db.query(
    `INSERT INTO subscriptions (tenant_id, plan, status)
     VALUES ($1, $2, 'active')
     ON CONFLICT (tenant_id)
     DO UPDATE SET plan = EXCLUDED.plan, status = 'active'`,
    [tenantId, plan]
  );
}

export async function getPlanLimits(tenantId: string) {
  const result = await db.query<{ plan: BillingPlan | null }>(
    "SELECT plan FROM subscriptions WHERE tenant_id = $1",
    [tenantId]
  );

  const selectedPlan = result.rows[0]?.plan;
  const plan: BillingPlan = selectedPlan && selectedPlan in PLAN_LIMITS ? selectedPlan : "free";
  return {
    plan,
    limits: PLAN_LIMITS[plan]
  };
}
