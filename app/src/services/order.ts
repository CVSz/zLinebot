import { db } from "../db.js";
import { emitEvent } from "./analytics.js";
import { addPoints } from "./loyalty.js";

export async function createOrder(
  userId: string,
  total: number,
  paymentQr: string,
  tenantId: string
) {
  const result = await db.query(
    `INSERT INTO orders (user_id, total, payment_qr, tenant_id)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [userId, total, paymentQr, tenantId]
  );

  await emitEvent({
    type: "order",
    tenantId,
    userId,
    value: total,
    ts: Date.now()
  });

  await addPoints(userId, Math.floor(total / 10));

  return result.rows[0];
}
