import { Router } from "express";
import { handleMessage } from "./handler.js";

export const webhookRouter = Router();

webhookRouter.post("/webhook", async (req, res) => {
  const text = req.body?.text ?? "";
  const userId = req.body?.userId ?? "anonymous";
  const tenantId = req.header("x-tenant-id") ?? req.body?.tenantId ?? "demo";
  const reply = await handleMessage(text, tenantId, userId);
  res.json({ reply });
});
