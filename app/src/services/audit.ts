import crypto, { randomUUID } from "crypto";
import { db } from "../db.js";
import { collectEvidence } from "../compliance/evidence.js";

type AuditInput = {
  tenantId: string;
  actor: string;
  action: string;
  resource: string;
  before?: unknown;
  after?: unknown;
  traceId: string;
};

async function lastHash(tenantId: string): Promise<string> {
  const result = await db.query(
    "SELECT hash FROM audit_logs WHERE tenant_id = $1 ORDER BY created_at DESC LIMIT 1",
    [tenantId]
  );
  return (result.rows[0]?.hash as string | undefined) ?? "";
}

export async function auditLog(input: AuditInput): Promise<void> {
  const prev = await lastHash(input.tenantId);
  const payload = JSON.stringify({ ...input, prev });
  const hash = crypto.createHash("sha256").update(payload).digest("hex");

  await db.query(
    `INSERT INTO audit_logs (id, tenant_id, actor, action, resource, before, after, trace_id, prev_hash, hash)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
    [
      randomUUID(),
      input.tenantId,
      input.actor,
      input.action,
      input.resource,
      input.before ?? null,
      input.after ?? null,
      input.traceId,
      prev,
      hash
    ]
  );

  await collectEvidence("SOC2-CC7", { action: input.action, traceId: input.traceId });
}
