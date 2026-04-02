import { Queue, Worker, type Job } from "bullmq";
import { Redis } from "ioredis";
import { env } from "../utils/env.js";
import { db } from "../db.js";
import type { CompiledStep } from "../automation/compiler.js";
import { generateReply } from "../automation/ai.js";
import { runPlugin } from "../automation/plugins.js";

export type AutomationJobData = {
  tenantId: string;
  ruleId: string;
  payload: Record<string, unknown>;
};

const connection = new Redis(env.redisUrl, { maxRetriesPerRequest: null });

export const automationQueue = new Queue<AutomationJobData>("automation", { connection });

export async function enqueueAutomationJob(job: AutomationJobData): Promise<void> {
  await automationQueue.add("execute-rule", job, {
    attempts: 3,
    removeOnComplete: true,
    backoff: {
      type: "exponential",
      delay: 500
    }
  });
}

function parseCompiledSteps(action: string): CompiledStep[] {
  if (!action.startsWith("flow:")) {
    return [];
  }

  const parsed = JSON.parse(action.slice(5)) as { steps?: CompiledStep[] };
  return parsed.steps ?? [];
}

function matchesCondition(step: Extract<CompiledStep, { type: "condition" }>, payload: Record<string, unknown>): boolean {
  const fieldValue = String(payload[step.field] ?? "");
  if (step.operator === "equals") {
    return fieldValue === step.value;
  }

  return fieldValue.toLowerCase().includes(step.value.toLowerCase());
}

async function executeCompiledFlow(action: string, payload: Record<string, unknown>): Promise<void> {
  const steps = parseCompiledSteps(action);
  for (const step of steps) {
    if (step.type === "condition" && !matchesCondition(step, payload)) {
      return;
    }

    if (step.type === "action") {
      if (step.action === "ai_reply") {
        const reply = await generateReply(String(payload.text ?? payload.message ?? ""));
        // eslint-disable-next-line no-console
        console.log("AI Reply:", reply);
      }

      if (step.action === "webhook") {
        await runPlugin("webhook", payload);
      }
    }
  }
}

async function processAutomation(job: Job<AutomationJobData>): Promise<void> {
  const { tenantId, ruleId, payload } = job.data;

  const ruleResult = await db.query(
    "SELECT action FROM automation_rules WHERE id = $1 AND tenant_id = $2 LIMIT 1",
    [ruleId, tenantId]
  );

  const action = String(ruleResult.rows[0]?.action ?? "");

  if (action.startsWith("flow:")) {
    await executeCompiledFlow(action, payload);
  }

  await db.query(
    `INSERT INTO automation_runs (tenant_id, rule_id, status, payload)
     VALUES ($1, $2, 'processed', $3::jsonb)`,
    [tenantId, ruleId, JSON.stringify(payload)]
  );
}

export function startAutomationWorker(): Worker<AutomationJobData> {
  return new Worker<AutomationJobData>("automation", processAutomation, {
    connection,
    concurrency: env.queueConcurrency
  });
}
