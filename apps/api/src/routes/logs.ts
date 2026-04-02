import { prisma } from "@zlinebot/db";

export async function logsRoutes(app: any) {
  app.get("/", async (req: any) => {
    const tenantId = req.user.tenantId;

    return prisma.log.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
      take: 100
    });
  });
}
