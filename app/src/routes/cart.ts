import { Router } from "express";
import { db } from "../db.js";

export const cartRouter = Router();

cartRouter.get("/cart/:userId", async (req, res) => {
  const result = await db.query("SELECT * FROM carts WHERE user_id = $1", [req.params.userId]);
  res.json(result.rows);
});

cartRouter.post("/cart", async (req, res) => {
  const { userId, productId, qty = 1 } = req.body;
  const result = await db.query(
    "INSERT INTO carts (user_id, product_id, qty) VALUES ($1, $2, $3) RETURNING *",
    [userId, productId, qty]
  );
  res.status(201).json(result.rows[0]);
});
