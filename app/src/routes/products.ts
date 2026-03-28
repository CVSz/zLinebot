import { Router } from "express";
import { db } from "../db.js";

export const productsRouter = Router();

productsRouter.get("/products", async (_req, res) => {
  const result = await db.query("SELECT * FROM products ORDER BY id DESC");
  res.json(result.rows);
});

productsRouter.post("/products", async (req, res) => {
  const { name, price, stock = 0 } = req.body;
  const result = await db.query(
    "INSERT INTO products (name, price, stock) VALUES ($1, $2, $3) RETURNING *",
    [name, price, stock]
  );
  res.status(201).json(result.rows[0]);
});
