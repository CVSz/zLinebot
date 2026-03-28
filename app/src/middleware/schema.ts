import type { NextFunction, Request, Response } from "express";
import { db } from "../db.js";
import type { TenantRequestExtras } from "../types.js";

function safeTenantSchema(tenantId: string): string {
  return `tenant_${tenantId.replace(/[^a-zA-Z0-9_]/g, "_")}`;
}

type SchemaRequest = Request & TenantRequestExtras;

export async function setTenantSchema(req: SchemaRequest, res: Response, next: NextFunction) {
  try {
    const tenantId = req.tenant?.id;
    if (!tenantId) {
      return res.status(400).json({ error: "Missing tenant context" });
    }

    const schema = safeTenantSchema(tenantId);
    req.schema = schema;
    req.db = db;

    await db.query(`SET search_path TO ${schema}, public`);
    return next();
  } catch (error) {
    return next(error);
  }
}
