import { db } from "../db.js";

export type ProductRecord = {
  id: number;
  name: string;
  price: string;
  stock: number;
  tenant_id: string;
};

export async function recommendProducts(tenantId: string, query: string) {
  const result = await db.query<ProductRecord>(
    `SELECT *
     FROM products
     WHERE (tenant_id = $1 OR tenant_id IS NULL)
       AND name ILIKE $2
     ORDER BY id DESC
     LIMIT 5`,
    [tenantId, `%${query}%`]
  );

  return result.rows;
}
