import { randomUUID } from "crypto";
import { Router } from "express";
import { db } from "../db.js";
import { routeRateLimit } from "../middleware/rateLimit.js";
import { pseudo } from "../services/privacy.js";

export const dsrRouter = Router();
const dsrLimiter = routeRateLimit({ max: 30, windowMs: 60_000 });

dsrRouter.post("/privacy/consent", dsrLimiter, async (req, res) => {
  const { userId, purpose, granted, version } = req.body as {
    userId?: string;
    purpose?: string;
    granted?: boolean;
    version?: string;
  };

  if (!userId || !purpose || typeof granted !== "boolean" || !version) {
    return res.status(400).json({ error: "userId, purpose, granted, version are required" });
  }

  await db.query(
    `INSERT INTO consents (user_id, purpose, granted, version, updated_at)
     VALUES ($1, $2, $3, $4, NOW())
     ON CONFLICT (user_id, purpose)
     DO UPDATE SET granted = EXCLUDED.granted, version = EXCLUDED.version, updated_at = NOW()`,
    [pseudo(userId), purpose, granted, version]
  );

  return res.json({ ok: true });
});

dsrRouter.get("/privacy/consent/:userId", dsrLimiter, async (req, res) => {
  const userId = req.params.userId;
  const result = await db.query(
    "SELECT purpose, granted, version, updated_at FROM consents WHERE user_id = $1 ORDER BY purpose",
    [pseudo(userId)]
  );

  return res.json({ userId: pseudo(userId), consents: result.rows });
});

dsrRouter.post("/privacy/dsr", dsrLimiter, async (req, res) => {
  const { userId, type, payload } = req.body as {
    userId?: string;
    type?: "access" | "delete" | "rectify";
    payload?: Record<string, unknown>;
  };

  if (!userId || !type || !["access", "delete", "rectify"].includes(type)) {
    return res.status(400).json({ error: "Invalid DSR request" });
  }

  const id = randomUUID();
  await db.query(
    `INSERT INTO dsr_requests (id, user_id, type, status, payload)
     VALUES ($1, $2, $3, 'pending', $4)`,
    [id, userId, type, payload ?? null]
  );

  if (type === "access") {
    const [orders, carts] = await Promise.all([
      db.query("SELECT id, total, status, created_at FROM orders WHERE user_id = $1", [userId]),
      db.query("SELECT id, product_id, qty, created_at FROM carts WHERE user_id = $1", [userId])
    ]);

    await db.query("UPDATE dsr_requests SET status = 'done', updated_at = NOW() WHERE id = $1", [id]);
    return res.json({ requestId: id, data: { orders: orders.rows, carts: carts.rows } });
  }

  if (type === "delete") {
    await db.query("BEGIN");
    try {
      await db.query("DELETE FROM carts WHERE user_id = $1", [userId]);
      await db.query("DELETE FROM orders WHERE user_id = $1", [userId]);
      await db.query("DELETE FROM loyalty_points WHERE user_id = $1", [userId]);
      await db.query("UPDATE dsr_requests SET status = 'done', updated_at = NOW() WHERE id = $1", [id]);
      await db.query("COMMIT");
    } catch (error) {
      await db.query("ROLLBACK");
      throw error;
    }

    return res.json({ requestId: id, status: "done" });
  }

  if (type === "rectify") {
    const nextUserId = payload?.newUserId;
    if (typeof nextUserId !== "string" || !nextUserId) {
      return res.status(400).json({ error: "payload.newUserId is required for rectify" });
    }

    await db.query("BEGIN");
    try {
      await db.query("UPDATE orders SET user_id = $1 WHERE user_id = $2", [nextUserId, userId]);
      await db.query("UPDATE carts SET user_id = $1 WHERE user_id = $2", [nextUserId, userId]);
      await db.query(
        "INSERT INTO loyalty_points (user_id, points) SELECT $1, points FROM loyalty_points WHERE user_id = $2 ON CONFLICT (user_id) DO NOTHING",
        [nextUserId, userId]
      );
      await db.query("DELETE FROM loyalty_points WHERE user_id = $1", [userId]);
      await db.query("UPDATE dsr_requests SET status = 'done', updated_at = NOW() WHERE id = $1", [id]);
      await db.query("COMMIT");
    } catch (error) {
      await db.query("ROLLBACK");
      throw error;
    }

    return res.json({ requestId: id, status: "done" });
  }

  return res.status(400).json({ error: "Unsupported DSR type" });
});
