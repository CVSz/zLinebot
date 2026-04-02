import { prisma } from "@zlinebot/db";

export async function automationRoutes(app: any) {
  app.post("/", async (req: any) => {
    const { trigger, config } = req.body;

    return prisma.automation.create({
      data: {
        trigger,
        config,
        tenantId: req.user.tenantId
      }
    });
  });
}
