import { Router } from "express";

export const adminRouter = Router();

adminRouter.get("/admin/health", (_req, res) => {
  res.json({ status: "ok" });
});
