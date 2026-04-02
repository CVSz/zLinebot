import { prisma } from "@zlinebot/db";

export async function trackUsage(tenantId: string, metric: string) {
  await prisma.usage.create({
    data: { tenantId, metric, count: 1 }
  });
}
