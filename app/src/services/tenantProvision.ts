import { db } from "../db.js";

function safeTenantSchema(id: string): string {
  return `tenant_${id.replace(/[^a-zA-Z0-9_]/g, "_")}`;
}

export async function createTenantSchema(id: string) {
  const schema = safeTenantSchema(id);

  await db.query(`CREATE SCHEMA IF NOT EXISTS ${schema}`);
  await db.query(
    `CREATE TABLE IF NOT EXISTS ${schema}.orders (
      id UUID PRIMARY KEY,
      total NUMERIC
    )`
  );
}
