import { Redis } from "ioredis";
import { env } from "../utils/env.js";

export const redis = new Redis(env.redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: true,
  lazyConnect: true
});

redis.on("error", (error) => {
  console.error("redis connection error", error);
});

export async function ensureRedisConnected(): Promise<void> {
  if (redis.status === "ready" || redis.status === "connecting") {
    return;
  }

  await redis.connect();
}
