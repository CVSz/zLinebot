import { Router } from "express";
import { db } from "../db.js";
import { indexProduct } from "../services/reco.index.js";
import { onClick, onView } from "../services/events.reward.js";
import { routeRateLimit } from "../middleware/rateLimit.js";

export const productsRouter = Router();
productsRouter.use(routeRateLimit({ max: 90, windowMs: 60_000 }));

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


productsRouter.post("/events/view", async (req, res) => {
  const tenantId = req.header("x-tenant-id") ?? "demo";
  const { productId } = req.body as { productId?: string | number };

  if (!productId) {
    res.status(400).json({ error: "productId is required" });
    return;
  }

  await onView(tenantId, String(productId));
  res.status(202).json({ status: "accepted" });
});

productsRouter.post("/events/click", async (req, res) => {
  const tenantId = req.header("x-tenant-id") ?? "demo";
  const { productId } = req.body as { productId?: string | number };

  if (!productId) {
    res.status(400).json({ error: "productId is required" });
    return;
  }

  await onClick(tenantId, String(productId));
  res.status(202).json({ status: "accepted" });
});
