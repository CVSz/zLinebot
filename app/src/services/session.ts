import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL;
const redis = redisUrl ? new Redis(redisUrl) : null;
const DEFAULT_TTL_SECONDS = 60 * 30;

const keyFor = (tenantId: string, userId: string) => `sess:${tenantId}:${userId}`;

export async function getSessionVec(tenantId: string, userId: string): Promise<number[] | null> {
  if (!redis) {
    return null;
  }

  const payload = await redis.get(keyFor(tenantId, userId));
  if (!payload) {
    return null;
  }

  return JSON.parse(payload) as number[];
}

export async function setSessionVec(
  tenantId: string,
  userId: string,
  vec: number[],
  ttlSeconds = DEFAULT_TTL_SECONDS
) {
  if (!redis) {
    return;
  }

  await redis.set(keyFor(tenantId, userId), JSON.stringify(vec), "EX", ttlSeconds);
}
