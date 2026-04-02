import pino from "pino";
import { prisma } from "@zlinebot/db";

const lokiHost = process.env.LOKI_HOST ?? "http://loki.observability:3100";
const useLoki = process.env.ENABLE_LOKI_LOGGER === "true";

export const logger = useLoki
  ? pino({
      transport: {
        target: "pino-loki",
        options: {
          host: lokiHost,
          labels: { app: "zlinebot" }
        }
      }
    })
  : pino();

export async function log(tenantId: string, message: string, metadata: any = {}) {
  logger.info({ tenantId, ...metadata }, message);

  await prisma.log.create({
    data: {
      tenantId,
      level: "info",
      message,
      metadata
    }
  });
}
