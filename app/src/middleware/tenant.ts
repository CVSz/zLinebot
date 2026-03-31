import type { NextFunction, Request, Response } from "express";
import { env } from "../utils/env.js";
import type { TenantRequestExtras } from "../types.js";

type TenantRequest = Request & TenantRequestExtras;
type HeaderValue = string | string[] | undefined;

export function readHeader(value: HeaderValue): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function isAuthorizedTenantKey(apiKey: string | undefined): boolean {
  return Boolean(apiKey && apiKey === env.tenantApiKey);
}

export function resolveTenantId(tenantId: string | undefined): string {
  const normalized = (tenantId ?? "demo").trim();
  return normalized.length > 0 ? normalized : "demo";
}

export function tenant(req: TenantRequest, res: Response, next: NextFunction) {
  const key = readHeader(req.header("x-api-key"));
  if (!isAuthorizedTenantKey(key)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const tenantId = resolveTenantId(readHeader(req.header("x-tenant-id")));
  req.tenant = { id: tenantId };

  return next();
}
