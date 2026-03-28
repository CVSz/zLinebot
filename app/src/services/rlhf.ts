import { db } from "../db.js";

export type FeedbackInput = {
  tenantId?: string | null;
  userId: string;
  itemId: string;
  reward: number;
  rating?: number | null;
  actionProb?: number | null;
  context?: Record<string, unknown> | null;
};

function normalizeReward(reward: number) {
  if (!Number.isFinite(reward)) {
    return 0;
  }

  return Math.max(-1, Math.min(1, reward));
}

export async function saveFeedback(input: FeedbackInput) {
  const payload = {
    id: crypto.randomUUID(),
    tenantId: input.tenantId ?? null,
    userId: input.userId,
    itemId: input.itemId,
    reward: normalizeReward(input.reward),
    rating: input.rating ?? null,
    actionProb: input.actionProb ?? null,
    context: input.context ?? null
  };

  await db.query(
    `INSERT INTO feedback (
      id,
      tenant_id,
      user_id,
      item_id,
      rating,
      reward,
      action_prob,
      context
    ) VALUES ($1, $2, $3, $4::uuid, $5, $6, $7, $8::jsonb)`,
    [
      payload.id,
      payload.tenantId,
      payload.userId,
      payload.itemId,
      payload.rating,
      payload.reward,
      payload.actionProb,
      payload.context ? JSON.stringify(payload.context) : null
    ]
  );

  return payload;
}

export async function logFeedback(userId: string, itemId: string, reward: number) {
  await fetch("/api/feedback", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ userId, itemId, reward })
  });
}
