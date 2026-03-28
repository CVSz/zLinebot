import type { Pool } from "pg";

export type TenantContext = {
  id: string;
};

export type TenantRequestExtras = {
  tenant?: TenantContext;
  db?: Pool;
  schema?: string;
};
