import { Router } from "express";
import { saveFeedback } from "../services/rlhf.js";

type FeedbackBody = {
  userId?: unknown;
  itemId?: unknown;
  reward?: unknown;
  rating?: unknown;
  actionProb?: unknown;
  context?: unknown;
};

export const feedbackRouter = Router();

feedbackRouter.post("/api/feedback", async (req, res) => {
  try {
    const body = (req.body ?? {}) as FeedbackBody;

    if (typeof body.userId !== "string" || typeof body.itemId !== "string") {
      return res.status(400).json({ error: "userId and itemId must be strings" });
    }

    if (typeof body.reward !== "number") {
      return res.status(400).json({ error: "reward must be a number" });
    }

    const tenantId = req.header("x-tenant-id") ?? null;
    const rating = typeof body.rating === "number" ? Math.round(body.rating) : null;
    const actionProb = typeof body.actionProb === "number" ? body.actionProb : null;
    const context =
      body.context && typeof body.context === "object" && !Array.isArray(body.context)
        ? (body.context as Record<string, unknown>)
        : null;

    const saved = await saveFeedback({
      tenantId,
      userId: body.userId,
      itemId: body.itemId,
      reward: body.reward,
      rating,
      actionProb,
      context
    });

    return res.status(201).json(saved);
  } catch (error) {
    return res.status(500).json({ error: "failed_to_log_feedback", detail: String(error) });
  }
});
