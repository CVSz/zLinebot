import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL ?? "redis://redis:6379");

export async function getFeatures(userId: string) {
  const raw = await redis.get(`f:${userId}`);
  if (!raw) {
    return {};
  }

  return JSON.parse(raw) as Record<string, unknown>;
}
