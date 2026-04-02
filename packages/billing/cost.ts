import { prisma } from "@zlinebot/db";

export async function trackCost(tenantId: string, cost: number): Promise<void> {
  await prisma.usage.create({
    data: {
      tenantId,
      metric: "cost",
      count: cost
    }
  });
}
