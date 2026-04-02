import { prisma } from "@zlinebot/db";

export async function executeAutomation(job: any) {
  const { automationId, payload } = job.data;

  const automation = await prisma.automation.findUnique({
    where: { id: automationId }
  });

  if (!automation) return;

  const { steps } = automation.config as any;
  if (!Array.isArray(steps)) return;

  const context = payload;

  for (const step of steps) {
    if (step.type === "condition") {
      if (!evalCondition(step, context)) return;
    }

    if (step.type === "action") {
      await runAction(step, context);
    }
  }
}

function evalCondition(step: any, ctx: any) {
  if (!step?.field) return false;
  return ctx[step.field] === step.value;
}

async function runAction(step: any, _ctx: any) {
  if (step.action === "auto_reply") {
    console.log("Reply:", step.message);
    // integrate TikTok send message API
  }
}
