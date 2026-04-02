import { Router } from "express";
import { db } from "../db.js";
import { promptpayQR } from "../services/payment.js";
import { createOrder } from "../services/order.js";
import { createCheckout } from "../services/stripe.js";
import { routeRateLimit } from "../middleware/rateLimit.js";

export const ordersRouter = Router();
ordersRouter.use(routeRateLimit({ max: 60, windowMs: 60_000 }));

ordersRouter.get("/orders", async (req, res) => {
  const tenantId = req.header("x-tenant-id") ?? "demo";
  const result = await db.query(
    "SELECT * FROM orders WHERE tenant_id = $1 ORDER BY id DESC",
    [tenantId]
  );
  res.json(result.rows);
});

ordersRouter.post("/orders", async (req, res) => {
  const { userId, total, paymentMethod = "promptpay" } = req.body;
  const tenantId = req.header("x-tenant-id") ?? "demo";
  const paymentQr = await promptpayQR(total);
  const order = await createOrder(userId, total, paymentQr, tenantId);

  let checkoutUrl: string | null = null;
  if (paymentMethod === "stripe") {
    checkoutUrl =
      (await createCheckout(total, {
        orderId: String(order.id),
        tenantId
      })) ?? null;
  }

  res.status(201).json({ ...order, checkoutUrl });
});
