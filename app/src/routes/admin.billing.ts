import { Router } from "express";
import { db } from "../db.js";

const router = Router();

router.get("/admin/billing", async (req, res) => {
  const tenantId = req.header("x-tenant-id") ?? "demo";
  const result = await db.query(
    "SELECT * FROM invoices WHERE tenant_id = $1 ORDER BY created_at DESC",
    [tenantId]
  );

  res.json(result.rows);
});

export default router;
