import { randomUUID } from "crypto";
import { db } from "../db.js";

export async function applyAffiliate(code: string, orderId: string, total: number) {
  const aff = await db.query<{ id: string }>("SELECT id FROM affiliates WHERE code = $1", [code]);

  if (!aff.rowCount) {
    return;
  }

  const affiliateId = aff.rows[0]?.id;
  if (!affiliateId) {
    return;
  }

  const commission = total * 0.1;

  await db.query(
    `INSERT INTO affiliate_events (id, affiliate_id, order_id, commission)
     VALUES ($1, $2, $3, $4)`,
    [randomUUID(), affiliateId, orderId, commission]
  );

  await db.query(
    "UPDATE affiliates SET balance = balance + $1 WHERE id = $2",
    [commission, affiliateId]
  );
}
