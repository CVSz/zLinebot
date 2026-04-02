import { prisma } from "@zlinebot/db";
import { Queue } from "bullmq";
import { emitEvent } from "./kafka";

const redisUrl = new URL(process.env.REDIS_URL ?? "redis://redis:6379");
const queue = new Queue("automation", {
  connection: { host: redisUrl.hostname, port: Number(redisUrl.port || 6379) }
});

const queueBackend = (process.env.AUTOMATION_QUEUE_BACKEND ?? "bullmq").toLowerCase();

export async function processEvent(event: string, payload: any) {
  const automations = await prisma.automation.findMany({
    where: {
      trigger: event,
      active: true
    }
  });

  for (const auto of automations) {
    const message = {
      event,
      automationId: auto.id,
      payload
    };

    if (queueBackend === "kafka") {
      await emitEvent(event, message);
      continue;
    }

    await queue.add("execute", {
      automationId: auto.id,
      payload
    });
  }
}
