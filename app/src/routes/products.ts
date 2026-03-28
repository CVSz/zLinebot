import { Router } from "express";
import { db } from "../db.js";
import { indexProduct } from "../services/reco.index.js";

export const productsRouter = Router();

productsRouter.get("/products", async (req, res) => {
  const tenantId = req.header("x-tenant-id") ?? "demo";
  const result = await db.query(
    "SELECT * FROM products WHERE tenant_id = $1 ORDER BY id DESC",
    [tenantId]
  );
  res.json(result.rows);
});

productsRouter.post("/products", async (req, res) => {
  const { name, price, stock = 0, desc = "" } = req.body;
  const tenantId = req.header("x-tenant-id") ?? "demo";
  const result = await db.query(
    `INSERT INTO products (name, price, stock, tenant_id, description)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [name, price, stock, tenantId, desc]
  );

  await indexProduct({
    id: result.rows[0].id,
    name: result.rows[0].name,
    desc: result.rows[0].description,
    tenantId
  });

  res.status(201).json(result.rows[0]);
});
