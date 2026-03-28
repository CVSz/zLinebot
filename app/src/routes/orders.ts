import { Router } from "express";
import { db } from "../db.js";
import { promptpayQR } from "../services/payment.js";
import { createOrder } from "../services/order.js";

export const ordersRouter = Router();

ordersRouter.get("/orders", async (_req, res) => {
  const result = await db.query("SELECT * FROM orders ORDER BY id DESC");
  res.json(result.rows);
});

ordersRouter.post("/orders", async (req, res) => {
  const { userId, total } = req.body;
  const paymentQr = await promptpayQR(total);
  const order = await createOrder(userId, total, paymentQr);
  res.status(201).json(order);
});
