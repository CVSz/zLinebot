import { db } from "../db.js";

export async function createOrder(userId: string, total: number, paymentQr: string) {
  const result = await db.query(
    "INSERT INTO orders (user_id, total, payment_qr) VALUES ($1, $2, $3) RETURNING *",
    [userId, total, paymentQr]
  );
  return result.rows[0];
}
