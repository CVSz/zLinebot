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
    const schemaLookup = await db.query<{ nspname: string }>(
      "SELECT nspname FROM pg_namespace WHERE nspname = $1 LIMIT 1",
      [schema]
    );
    const resolvedSchema = schemaLookup.rows[0]?.nspname;
    if (!resolvedSchema) {
      return res.status(400).json({ error: "Invalid tenant schema" });
    }

    req.schema = resolvedSchema;
    req.db = db;

    await db.query("SELECT set_config('search_path', format('%I,public', $1), false)", [resolvedSchema]);
    return next();
  } catch (error) {
    return next(error);
  }
}
