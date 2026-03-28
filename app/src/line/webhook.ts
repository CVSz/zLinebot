import { Router } from "express";
import { handleMessage } from "./handler.js";

export const webhookRouter = Router();

webhookRouter.post("/webhook", async (req, res) => {
  const text = req.body?.text ?? "";
  const reply = await handleMessage(text);
  res.json({ reply });
});
