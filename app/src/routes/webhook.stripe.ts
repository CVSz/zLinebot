import express from "express";
import Stripe from "stripe";
import { emitEvent } from "../services/analytics.js";
import { markPaid } from "../services/billing.js";

const stripe = new Stripe(process.env.STRIPE_KEY ?? "", {
  apiVersion: "2025-02-24.acacia"
});

const router = express.Router();

router.post("/stripe", express.raw({ type: "application/json" }), async (req, res) => {
  try {
    const signature = req.headers["stripe-signature"] as string;

    const event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET ?? ""
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const tenantId = session.metadata?.tenantId ?? "demo";
      const orderId = session.metadata?.orderId;
      const amountTotal = (session.amount_total ?? 0) / 100;

      if (orderId) {
        await markPaid(orderId);
      }

      await emitEvent({
        type: "payment",
        tenantId,
        value: amountTotal,
        ts: Date.now()
      });
    }

    res.sendStatus(200);
  } catch (_error) {
    res.status(400).json({ error: "invalid stripe webhook" });
  }
});

export default router;
