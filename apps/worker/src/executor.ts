import { prisma } from "@zlinebot/db";
import { trackUsage } from "@zlinebot/billing/usage";
import { log } from "@zlinebot/automation/logger";

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

  await trackUsage(automation.tenantId, "automation_run");
  await log(automation.tenantId, "Automation executed", job.data);
}

function resolveValue(value: any, ctx: any) {
  if (typeof value === "string" && value.startsWith("$")) {
    return ctx[value.replace("$", "")];
  }
  return value;
}

function evalCondition(step: any, ctx: any) {
  const left = resolveValue(step.field, ctx);
  const right = resolveValue(step.value, ctx);

  switch (step.operator) {
    case "equals":
      return left === right;
    case "contains":
      return String(left ?? "").includes(String(right ?? ""));
    default:
      return false;
  }
}

async function runAction(step: any, _ctx: any) {
  if (step.action === "delay") {
    await new Promise(r => setTimeout(r, Number(step.ms) || 0));
  }

  if (step.action === "auto_reply") {
    console.log("Reply:", resolveValue(step.message, _ctx));
    // integrate TikTok send message API
  }
}
