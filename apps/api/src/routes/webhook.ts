import crypto from "crypto";
import Redis from "ioredis";
import { processEvent } from "@zlinebot/automation/runner";
import { autoReplyLatencyMs, webhookEventsTotal, webhookValidationFailures } from "../metrics";

type TikTokWebhookPayload = {
  type?: string;
  event?: string;
  challenge?: string;
  tenantId?: string;
  message?: {
    text?: string;
    conversation_id?: string;
    sender_id?: string;
  };
  data?: {
    conversation_id?: string;
    sender_id?: string;
    text?: string;
  };
};

const redis = new Redis(process.env.REDIS_URL ?? "redis://redis:6379", {
  lazyConnect: true,
  maxRetriesPerRequest: 1
});

function safeEqual(valueA: string, valueB: string): boolean {
  const a = Buffer.from(valueA, "utf8");
  const b = Buffer.from(valueB, "utf8");
  if (a.length !== b.length) {
    return false;
  }

  return crypto.timingSafeEqual(a, b);
}

function verifyTikTokSignature(options: {
  secret?: string;
  signature?: string;
  timestamp?: string;
  body: string;
}): boolean {
  if (!options.secret) {
    return true;
  }

  if (!options.signature || !options.timestamp) {
    return false;
  }

  const expected = crypto
    .createHmac("sha256", options.secret)
    .update(`${options.timestamp}.${options.body}`)
    .digest("hex");

  return safeEqual(expected, options.signature);
}

function parseTenantId(headers: Record<string, string | undefined>, payload: TikTokWebhookPayload): string {
  return (
    headers["x-tenant-id"] ||
    payload.tenantId ||
    process.env.LINE_DEFAULT_TENANT_ID ||
    "default"
  );
}

function validatePayload(payload: TikTokWebhookPayload): { ok: boolean; reason?: string } {
  if (typeof payload !== "object" || payload === null) {
    return { ok: false, reason: "invalid_json" };
  }

  if (payload.challenge) {
    return { ok: true };
  }

  if (!payload.type && !payload.event) {
    return { ok: false, reason: "missing_event_type" };
  }

  return { ok: true };
}

async function rememberConversation(
  tenantId: string,
  conversationId: string,
  message: string,
  senderId: string
): Promise<void> {
  await redis.connect().catch(() => undefined);
  const key = `conv:${tenantId}:${conversationId}`;
  const entry = JSON.stringify({ senderId, message, at: new Date().toISOString() });
  await redis
    .multi()
    .lpush(key, entry)
    .ltrim(key, 0, 24)
    .expire(key, 60 * 60 * 24 * 7)
    .exec();
}

function buildTenantAutoReply(tenantId: string, payload: TikTokWebhookPayload): string {
  const text = payload.message?.text || payload.data?.text || "";
  if (text.trim().length === 0) {
    return "Thanks for contacting us — we received your message.";
  }

  if (tenantId.startsWith("vip")) {
    return `VIP concierge (${tenantId}) received: ${text.slice(0, 80)}`;
  }

  return `Auto-reply (${tenantId}): We got your message \"${text.slice(0, 80)}\".`;
}

export async function webhookRoutes(app: any) {
  const webhookSecret = process.env.TIKTOK_WEBHOOK_SECRET;

  app.post("/tiktok", async (req: any, reply: any) => {
    const signature = req.headers["x-tiktok-signature"];
    const timestamp = req.headers["x-tiktok-timestamp"];
    const rawBody = req.rawBody?.toString?.("utf8") ?? JSON.stringify(req.body ?? {});

    if (!verifyTikTokSignature({ secret: webhookSecret, signature, timestamp, body: rawBody })) {
      webhookValidationFailures.inc({ provider: "tiktok", reason: "signature" });
      return reply.code(401).send({ success: false, error: "invalid_signature" });
    }

    const event = (req.body ?? {}) as TikTokWebhookPayload;
    const payloadValidation = validatePayload(event);

    if (!payloadValidation.ok) {
      webhookValidationFailures.inc({ provider: "tiktok", reason: payloadValidation.reason ?? "invalid_payload" });
      return reply.code(400).send({ success: false, error: payloadValidation.reason ?? "invalid_event" });
    }

    if (typeof event.challenge === "string" && event.challenge.length > 0) {
      return { challenge: event.challenge };
    }

    const tenantId = parseTenantId(req.headers, event);
    const eventType = event.type ?? event.event ?? "unknown";

    webhookEventsTotal.inc({ provider: "tiktok", event: eventType, tenant: tenantId });

    if (eventType === "message") {
      const timer = autoReplyLatencyMs.startTimer({ tenant: tenantId });
      const conversationId = event.message?.conversation_id ?? event.data?.conversation_id ?? "default";
      const senderId = event.message?.sender_id ?? event.data?.sender_id ?? "unknown";

      await rememberConversation(tenantId, conversationId, event.message?.text ?? event.data?.text ?? "", senderId).catch(() => {
        webhookValidationFailures.inc({ provider: "tiktok", reason: "redis_memory" });
      });

      const autoReply = buildTenantAutoReply(tenantId, event);
      await processEvent("tiktok.message", {
        ...event,
        tenantId,
        autoReply,
        memoryKey: `conv:${tenantId}:${conversationId}`
      });
      timer();
    }

    return { success: true, tenantId };
  });
}
