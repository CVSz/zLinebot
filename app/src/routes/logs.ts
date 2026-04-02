import { Router } from "express";
import { db } from "../db.js";

export const logsRouter = Router();

logsRouter.get("/logs", async (req, res, next) => {
  try {
    const tenantId = String(req.headers["x-tenant-id"] ?? "demo");
    const result = await db.query(
      `SELECT id, status, payload, created_at
       FROM automation_runs
       WHERE tenant_id = $1
       ORDER BY created_at DESC
       LIMIT 200`,
      [tenantId]
    );

    const logs = result.rows.map((row) => ({
      id: row.id,
      message: `${row.status} • ${JSON.stringify(row.payload)}`,
      createdAt: row.created_at
    }));

    res.json(logs);
  } catch (error) {
    next(error);
  }
});
