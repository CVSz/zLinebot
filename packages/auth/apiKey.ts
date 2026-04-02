import crypto from "crypto";
import { prisma } from "@zlinebot/db";

export async function createApiKey(tenantId: string) {
  const key = crypto.randomBytes(32).toString("hex");

  return prisma.apiKey.create({
    data: {
      key,
      tenantId
    }
  });
}
