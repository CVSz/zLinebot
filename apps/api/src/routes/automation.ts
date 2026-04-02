import { prisma } from "@zlinebot/db";
import { compileFlow } from "@zlinebot/automation/compiler";

export async function automationRoutes(app: any) {
  app.post("/", async (req: any) => {
    const { trigger, config } = req.body;
    const compiledConfig = config?.nodes ? compileFlow(config) : config;

    return prisma.automation.create({
      data: {
        trigger,
        config: compiledConfig,
        tenantId: req.user.tenantId
      }
    });
  });
}
