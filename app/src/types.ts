import type { Pool } from "pg";

export type TenantContext = {
  id: string;
};

export type TenantRequestExtras = {
  tenant?: TenantContext;
  db?: Pool;
  schema?: string;
};

declare module "express-serve-static-core" {
  interface Request {
    tenant?: TenantContext;
  }
}
