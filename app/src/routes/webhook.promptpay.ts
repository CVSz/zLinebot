import express from "express";
import { emitEvent } from "../services/analytics.js";

const router = express.Router();

router.post("/promptpay", async (req, res) => {
  const { amount, tenantId = "demo", status } = req.body;

  if (status === "SUCCESS") {
    await emitEvent({
      type: "payment",
      tenantId,
      value: Number(amount ?? 0),
      ts: Date.now()
    });
  }

  res.sendStatus(200);
});

export default router;
