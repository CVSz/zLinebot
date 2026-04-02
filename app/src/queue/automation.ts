import { Queue, Worker, type Job } from "bullmq";
import IORedis from "ioredis";
import { env } from "../utils/env.js";
import { db } from "../db.js";

export type AutomationJobData = {
  tenantId: string;
  ruleId: string;
  payload: Record<string, unknown>;
};

const connection = new IORedis(env.redisUrl, { maxRetriesPerRequest: null });

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

async function processAutomation(job: Job<AutomationJobData>): Promise<void> {
  const { tenantId, ruleId, payload } = job.data;

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
