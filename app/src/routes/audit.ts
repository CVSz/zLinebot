import { Router } from "express";
import { exportLedger } from "../services/export.js";

export const auditRouter = Router();

auditRouter.post("/admin/audit/ledger-export", async (req, res) => {
  const tenantId = req.tenant?.id ?? req.body?.tenantId;
  if (!tenantId) {
    return res.status(400).json({ error: "tenant is required" });
  }

  const filePath = await exportLedger(tenantId);
  return res.json({ ok: true, filePath });
});
