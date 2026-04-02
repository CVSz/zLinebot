import dotenv from "dotenv";
import { env } from "./utils/env.js";
import { startAutomationWorker } from "./queue/automation.js";

dotenv.config();

const worker = startAutomationWorker();
worker.on("completed", (job) => {
  console.log("automation job completed", job.id);
});

worker.on("failed", (job, error) => {
  console.error("automation job failed", job?.id, error);
});

console.log(`automation worker started (mode=${env.automationWorkerMode})`);

const shutdown = async (signal: NodeJS.Signals) => {
  console.log(`${signal} received, closing worker`);
  await worker.close();
  process.exit(0);
};

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});
process.on("SIGINT", () => {
  void shutdown("SIGINT");
});
