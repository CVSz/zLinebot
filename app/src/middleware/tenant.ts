import type { NextFunction, Request, Response } from "express";
import { env } from "../utils/env.js";
import type { TenantRequestExtras } from "../types.js";

type TenantRequest = Request & TenantRequestExtras;

export function tenant(req: TenantRequest, res: Response, next: NextFunction) {
  const key = req.header("x-api-key");
  if (!key || key !== env.tenantApiKey) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const tenantId = req.header("x-tenant-id") ?? "demo";
  req.tenant = { id: tenantId };

  return next();
}
