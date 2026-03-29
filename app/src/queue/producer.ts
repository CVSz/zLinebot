import { Redis } from "ioredis";

const redis = new Redis(process.env.REDIS_URL ?? "redis://127.0.0.1:6379");

export async function pushTask(task: unknown): Promise<void> {
  await redis.lpush("ai_tasks", JSON.stringify(task));
}
