import { prisma } from "@zlinebot/db";

export async function log(tenantId: string, message: string, metadata: any = {}) {
  await prisma.log.create({
    data: {
      tenantId,
      level: "info",
      message,
      metadata
    }
  });
}
