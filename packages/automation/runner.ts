import { prisma } from "@zlinebot/db";
import { Queue } from "bullmq";

const redisUrl = new URL(process.env.REDIS_URL ?? "redis://redis:6379");
const queue = new Queue("automation", {
  connection: { host: redisUrl.hostname, port: Number(redisUrl.port || 6379) }
});

export async function processEvent(event: string, payload: any) {
  const automations = await prisma.automation.findMany({
    where: {
      trigger: event,
      active: true
    }
  });

  for (const auto of automations) {
    await queue.add("execute", {
      automationId: auto.id,
      payload
    });
  }
}
