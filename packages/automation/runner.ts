import { prisma } from "@zlinebot/db";
import { Queue } from "bullmq";

const queue = new Queue("automation", {
  connection: { host: "redis", port: 6379 }
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
