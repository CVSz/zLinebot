import { Router } from "express";
import { db } from "../db.js";
import { routeRateLimit } from "../middleware/rateLimit.js";

const router = Router();
router.use(routeRateLimit({ max: 30, windowMs: 60_000 }));

router.get("/admin/billing", async (req, res) => {
  const tenantId = req.header("x-tenant-id") ?? "demo";
  const result = await db.query(
    "SELECT * FROM invoices WHERE tenant_id = $1 ORDER BY created_at DESC",
    [tenantId]
  );

  res.json(result.rows);
});

export default router;
