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

type LineWebhookEvent = {
  type?: string;
  timestamp?: number;
  mode?: string;
  webhookEventId?: string;
  replyToken?: string;
  source?: {
    userId?: string;
    groupId?: string;
    roomId?: string;
    type?: string;
  };
  message?: {
    id?: string;
    type?: string;
    text?: string;
  };
};

type LineWebhookPayload = {
  destination?: string;
  events?: LineWebhookEvent[];
};

type WebhookValidationResult = {
  ok: boolean;
  reason?: string;
};

type TenantAutoReplyProfile = {
  name: "vip" | "enterprise" | "default";
  prefix: string;
  signature?: string;
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
  signatures: string[];
  timestamp?: string;
  body: string;
}): boolean {
  if (!options.secret) {
    return true;
  }

  if (options.signatures.length === 0 || !options.timestamp) {
    return false;
  }

  const expected = crypto
    .createHmac("sha256", options.secret)
    .update(`${options.timestamp}.${options.body}`)
    .digest("hex");

  return options.signatures.some((signature) => safeEqual(expected, signature));
}

function verifyLineSignature(options: { secret?: string; signature?: string; body: string }): boolean {
  if (!options.secret) {
    return true;
  }

  if (!options.signature) {
    return false;
  }

  const expected = crypto.createHmac("sha256", options.secret).update(options.body).digest("base64");
  return safeEqual(expected, options.signature);
}

function parseTikTokSignature(signatureHeader?: string): { signatures: string[]; timestamp?: string } {
  if (!signatureHeader) {
    return { signatures: [] };
  }

  const signatures: string[] = [];
  let timestamp: string | undefined;

  for (const part of signatureHeader.split(",")) {
    const [key, value] = part.trim().split("=");
    if (!key || !value) {
      continue;
    }
    if (key === "s") {
      signatures.push(value.trim());
      continue;
    }
    if (key === "t" && !timestamp) {
      timestamp = value.trim();
    }
  }

  return {
    signatures,
    timestamp
  };
}

function isFreshTimestamp(timestamp?: string, toleranceSeconds = 300): boolean {
  if (!timestamp) {
    return false;
  }
  const ts = Number(timestamp);
  if (!Number.isFinite(ts)) {
    return false;
  }
  return Math.abs(Math.floor(Date.now() / 1000) - ts) <= toleranceSeconds;
}

function parseTenantId(headers: Record<string, string | undefined>, payload: TikTokWebhookPayload): string {
  return (
    headers["x-tenant-id"] ||
    payload.tenantId ||
    process.env.LINE_DEFAULT_TENANT_ID ||
    "default"
  );
}

function validatePayload(payload: TikTokWebhookPayload): WebhookValidationResult {
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

function validateLinePayload(payload: LineWebhookPayload): WebhookValidationResult {
  if (typeof payload !== "object" || payload === null) {
    return { ok: false, reason: "invalid_json" };
  }

  if (!Array.isArray(payload.events)) {
    return { ok: false, reason: "missing_events" };
  }

  const invalidEvent = payload.events.find((event) => !event || typeof event.type !== "string");
  if (invalidEvent) {
    return { ok: false, reason: "invalid_event_type" };
  }

  return { ok: true };
}

function headerValue(value: unknown): string | undefined {
  if (typeof value === "string") {
    return value;
  }
  if (Array.isArray(value)) {
    return value.find((entry): entry is string => typeof entry === "string");
  }
  return undefined;
}

function getRawBody(req: any): string {
  return req.rawBody?.toString?.("utf8") ?? JSON.stringify(req.body ?? {});
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

function parseAutoReplyOverrides(): Record<string, Partial<TenantAutoReplyProfile>> {
  const raw = process.env.TENANT_AUTO_REPLY_OVERRIDES;
  if (!raw) {
    return {};
  }
  try {
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed ? parsed : {};
  } catch {
    return {};
  }
}

const tenantAutoReplyOverrides = parseAutoReplyOverrides();

function tenantAutoReplyProfile(tenantId: string): TenantAutoReplyProfile {
  const normalized = tenantId.toLowerCase();
  const baseProfile: TenantAutoReplyProfile = normalized.startsWith("vip")
    ? { name: "vip", prefix: "VIP concierge", signature: "Priority desk" }
    : normalized.includes("enterprise")
      ? { name: "enterprise", prefix: "Enterprise CRM", signature: "Account success team" }
      : { name: "default", prefix: "Auto-reply", signature: "zLinebot assistant" };

  const override = tenantAutoReplyOverrides[tenantId] ?? tenantAutoReplyOverrides[normalized];
  if (!override) {
    return baseProfile;
  }

  return {
    ...baseProfile,
    ...override
  };
}

function buildTenantAutoReply(tenantId: string, incomingText: string): string {
  const text = incomingText.trim();
  const profile = tenantAutoReplyProfile(tenantId);
  const shortText = text.slice(0, 120);
  const suffix = profile.signature ? ` • ${profile.signature}` : "";

  if (!text) {
    return `${profile.prefix} (${tenantId}): Thanks for contacting us. A specialist will follow up shortly.${suffix}`;
  }

  if (/(refund|cancel|problem|urgent|fail|issue)/i.test(text)) {
    return `${profile.prefix} (${tenantId}): We flagged your request as priority and opened a support workflow for "${shortText}".${suffix}`;
  }

  if (/(price|discount|promo|deal)/i.test(text)) {
    return `${profile.prefix} (${tenantId}): We captured your pricing request for "${shortText}" and will send the best offer shortly.${suffix}`;
  }

  return `${profile.prefix} (${tenantId}): We received "${shortText}" and are preparing the next best action.${suffix}`;
}

export async function webhookRoutes(app: any) {
  const webhookSecret = process.env.TIKTOK_WEBHOOK_SECRET;
  const lineChannelSecret = process.env.LINE_CHANNEL_SECRET;

  app.post("/tiktok", { config: { rawBody: true } }, async (req: any, reply: any) => {
    const compoundSignature = headerValue(req.headers["tiktok-signature"]);
    const parsedTikTokSignature = parseTikTokSignature(compoundSignature);
    const directSignature = headerValue(req.headers["x-tiktok-signature"]);
    const signatures = directSignature ? [directSignature] : parsedTikTokSignature.signatures;
    const timestamp = headerValue(req.headers["x-tiktok-timestamp"]) ?? parsedTikTokSignature.timestamp;
    const rawBody = getRawBody(req);

    if (!verifyTikTokSignature({ secret: webhookSecret, signatures, timestamp, body: rawBody })) {
      webhookValidationFailures.inc({ provider: "tiktok", reason: "signature" });
      return reply.code(401).send({ success: false, error: "invalid_signature" });
    }
    if (webhookSecret && !isFreshTimestamp(timestamp)) {
      webhookValidationFailures.inc({ provider: "tiktok", reason: "stale_timestamp" });
      return reply.code(401).send({ success: false, error: "stale_timestamp" });
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
      const messageText = event.message?.text ?? event.data?.text ?? "";
      const conversationId = event.message?.conversation_id ?? event.data?.conversation_id ?? "default";
      const senderId = event.message?.sender_id ?? event.data?.sender_id ?? "unknown";

      await rememberConversation(tenantId, conversationId, messageText, senderId).catch(() => {
        webhookValidationFailures.inc({ provider: "tiktok", reason: "redis_memory" });
      });

      const autoReply = buildTenantAutoReply(tenantId, messageText);
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

  app.post("/line", { config: { rawBody: true } }, async (req: any, reply: any) => {
    const signature = headerValue(req.headers["x-line-signature"]);
    const rawBody = getRawBody(req);

    if (!verifyLineSignature({ secret: lineChannelSecret, signature, body: rawBody })) {
      webhookValidationFailures.inc({ provider: "line", reason: "signature" });
      return reply.code(401).send({ success: false, error: "invalid_signature" });
    }

    const payload = (req.body ?? {}) as LineWebhookPayload;
    const payloadValidation = validateLinePayload(payload);
    if (!payloadValidation.ok) {
      webhookValidationFailures.inc({ provider: "line", reason: payloadValidation.reason ?? "invalid_payload" });
      return reply.code(400).send({ success: false, error: payloadValidation.reason ?? "invalid_event" });
    }

    const tenantId = headerValue(req.headers["x-tenant-id"]) ?? process.env.LINE_DEFAULT_TENANT_ID ?? "default";
    for (const event of payload.events ?? []) {
      const eventType = event.type ?? "unknown";
      webhookEventsTotal.inc({ provider: "line", event: eventType, tenant: tenantId });

      if (eventType === "message" && event.message?.type === "text") {
        const timer = autoReplyLatencyMs.startTimer({ tenant: tenantId });
        const conversationId = event.source?.userId ?? event.source?.groupId ?? event.source?.roomId ?? "unknown";
        const text = event.message?.text ?? "";
        const autoReply = buildTenantAutoReply(tenantId, text);
        await rememberConversation(tenantId, conversationId, text, conversationId).catch(() => {
          webhookValidationFailures.inc({ provider: "line", reason: "redis_memory" });
        });

        await processEvent("line.message", {
          tenantId,
          destination: payload.destination,
          event,
          autoReply,
          memoryKey: `conv:${tenantId}:${conversationId}`
        });
        timer();
      }
    }

    return reply.code(200).send({ success: true });
  });
}
