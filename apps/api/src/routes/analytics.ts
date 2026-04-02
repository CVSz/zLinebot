import { prisma } from "@zlinebot/db";

export async function analyticsRoutes(app: any) {
  app.get("/stats", async (req: any) => {
    const tenantId = req.user.tenantId;

    const automations = await prisma.automation.count({
      where: { tenantId }
    });

    const usage = await prisma.usage.count({
      where: { tenantId }
    });

    return {
      automations,
      usage
    };
  });
}
