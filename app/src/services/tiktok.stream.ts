import { randomUUID } from "crypto";
import { db } from "../db.js";
import { env } from "../utils/env.js";
import { ensureRedisConnected, redis } from "./redis.js";

const tiktokStream = process.env.TIKTOK_STREAM_KEY?.trim() || "stream:tiktok:webhook";
const tiktokDlqStream = process.env.TIKTOK_STREAM_DLQ_KEY?.trim() || "stream:tiktok:webhook:dlq";
const tiktokGroup = process.env.TIKTOK_STREAM_GROUP?.trim() || "tiktok-workers";
const tiktokConsumer = process.env.TIKTOK_STREAM_CONSUMER?.trim() || `consumer-${process.pid}`;
const maxRetry = 3;

type TikTokNormalizedEvent = {
  eventType: string;
  shopId: string;
  eventId: string;
  userId?: string;
  payload: Record<string, unknown>;
  receivedAt: string;
};

type StreamEntry = [entryId: string, fields: string[]];
type StreamReadResult = Array<[streamName: string, entries: StreamEntry[]]>;

function normalizeString(value: unknown, fallback = ""): string {
  if (typeof value !== "string") {
    return fallback;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

export async function enqueueTikTokWebhookEvent(body: Record<string, unknown>): Promise<string> {
  await ensureRedisConnected();

  const payload = (body.data && typeof body.data === "object" ? body.data : {}) as Record<string, unknown>;
  const shopId = normalizeString(
    body.shop_id ?? body.shopId ?? payload.shop_id ?? payload.shopId,
    env.lineDefaultTenantId
  );

  const normalized: TikTokNormalizedEvent = {
    eventType: normalizeString(body.event ?? body.type, "unknown"),
    shopId,
    eventId: normalizeString(body.event_id ?? body.eventId ?? payload.event_id ?? payload.eventId, randomUUID()),
    userId: normalizeString(payload.user_id ?? payload.userId, ""),
    payload,
    receivedAt: new Date().toISOString()
  };

  const streamEntryId = await redis.xadd(
    tiktokStream,
    "*",
    "eventType",
    normalized.eventType,
    "shopId",
    normalized.shopId,
    "eventId",
    normalized.eventId,
    "userId",
    normalized.userId || "",
    "payload",
    JSON.stringify(normalized.payload),
    "receivedAt",
    normalized.receivedAt
  );

  if (typeof streamEntryId !== "string" || streamEntryId.length === 0) {
    throw new Error("Unable to enqueue TikTok webhook event");
  }

  return streamEntryId;
}

async function ensureConsumerGroup(): Promise<void> {
  await ensureRedisConnected();
  try {
    await redis.xgroup("CREATE", tiktokStream, tiktokGroup, "$", "MKSTREAM");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes("BUSYGROUP")) {
      throw error;
    }
  }
}

function mapFieldsToRecord(fields: string[]): Record<string, string> {
  const result: Record<string, string> = {};
  for (let index = 0; index < fields.length; index += 2) {
    const key = fields[index];
    if (!key) {
      continue;
    }

    const value = fields[index + 1] ?? "";
    result[key] = value;
  }

  return result;
}

function isStreamReadResult(value: unknown): value is StreamReadResult {
  if (!Array.isArray(value)) {
    return false;
  }

  return value.every((streamItem) => {
    if (!Array.isArray(streamItem) || streamItem.length !== 2) {
      return false;
    }

    const [streamName, entries] = streamItem;
    if (typeof streamName !== "string" || !Array.isArray(entries)) {
      return false;
    }

    return entries.every((entry) => {
      if (!Array.isArray(entry) || entry.length !== 2) {
        return false;
      }

      const [entryId, fields] = entry;
      return typeof entryId === "string" && Array.isArray(fields) && fields.every((field) => typeof field === "string");
    });
  });
}

async function persistTikTokEvent(entryId: string, fields: Record<string, string>): Promise<void> {
  const eventType = normalizeString(fields.eventType, "unknown");
  const shopId = normalizeString(fields.shopId, env.lineDefaultTenantId);
  const userId = normalizeString(fields.userId);

  const idempotencyKey = `idempotency:tiktok:event:${fields.eventId || entryId}`;
  const wasSet = await redis.set(idempotencyKey, "1", "EX", 60 * 60 * 24, "NX");
  if (!wasSet) {
    return;
  }

  await db.query(
    `INSERT INTO events (id, tenant_id, user_id, type, value, ts)
     VALUES ($1, $2, $3, $4, NULL, NOW())
     ON CONFLICT (id) DO NOTHING`,
    [randomUUID(), shopId, userId || null, `tiktok:${eventType}`]
  );
}

async function moveToDlq(streamEntryId: string, fields: Record<string, string>, errorMessage: string): Promise<void> {
  await redis.xadd(
    tiktokDlqStream,
    "*",
    "streamEntryId",
    streamEntryId,
    "eventType",
    fields.eventType ?? "unknown",
    "shopId",
    fields.shopId ?? env.lineDefaultTenantId,
    "eventId",
    fields.eventId ?? streamEntryId,
    "payload",
    fields.payload ?? "{}",
    "error",
    errorMessage,
    "failedAt",
    new Date().toISOString()
  );
}

async function processStreamEntry(streamEntryId: string, fields: string[]): Promise<void> {
  const mapped = mapFieldsToRecord(fields);
  try {
    await persistTikTokEvent(streamEntryId, mapped);
    await redis.xack(tiktokStream, tiktokGroup, streamEntryId);
  } catch (error) {
    const retryKey = `retry:tiktok:entry:${streamEntryId}`;
    const retryCount = await redis.incr(retryKey);
    await redis.expire(retryKey, 60 * 60 * 24);

    const errorMessage = error instanceof Error ? error.message : "unknown worker error";
    if (retryCount > maxRetry) {
      await moveToDlq(streamEntryId, mapped, errorMessage);
      await redis.xack(tiktokStream, tiktokGroup, streamEntryId);
    }
  }
}

export async function startTikTokStreamWorker(): Promise<() => Promise<void>> {
  await ensureConsumerGroup();

  let stopped = false;
  const loop = async (): Promise<void> => {
    while (!stopped) {
      const response = await redis.xreadgroup(
        "GROUP",
        tiktokGroup,
        tiktokConsumer,
        "COUNT",
        10,
        "BLOCK",
        1500,
        "STREAMS",
        tiktokStream,
        ">"
      );

      if (!response) {
        continue;
      }

      const streamReadResult = isStreamReadResult(response) ? response : null;
      if (!streamReadResult) {
        continue;
      }

      for (const [, entries] of streamReadResult) {
        for (const [entryId, fields] of entries) {
          await processStreamEntry(entryId, fields);
        }
      }
    }
  };

  void loop().catch((error) => {
    console.error("tiktok stream worker stopped unexpectedly", error);
  });

  return async () => {
    stopped = true;
  };
}
