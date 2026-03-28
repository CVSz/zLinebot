import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL;

const pub = redisUrl ? new Redis(redisUrl) : null;
const sub = redisUrl ? new Redis(redisUrl) : null;

export type EventPayload = {
  type: "message" | "order" | "payment";
  tenantId: string;
  userId?: string;
  value?: number;
  ts: number;
};

export async function emitEvent(e: EventPayload) {
  if (!pub) {
    const key = `${e.tenantId}:${e.type}`;
    counters.set(key, (counters.get(key) || 0) + 1);
    return;
  }
  await pub.publish("events", JSON.stringify(e));
}

const counters = new Map<string, number>();
let aggregatorStarted = false;

export function startAggregator() {
  if (!sub || aggregatorStarted) {
    return;
  }

  aggregatorStarted = true;

  sub.subscribe("events").catch((error: unknown) => {
    // eslint-disable-next-line no-console
    console.error("failed to subscribe events", error);
  });

  sub.on("message", (_ch, msg) => {
    const e: EventPayload = JSON.parse(msg);
    const key = `${e.tenantId}:${e.type}`;
    counters.set(key, (counters.get(key) || 0) + 1);
  });
}

export function snapshot(tenantId: string) {
  return {
    messages: counters.get(`${tenantId}:message`) || 0,
    orders: counters.get(`${tenantId}:order`) || 0,
    payments: counters.get(`${tenantId}:payment`) || 0
  };
}
