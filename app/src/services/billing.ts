import { randomUUID } from "crypto";
import { db } from "../db.js";

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
