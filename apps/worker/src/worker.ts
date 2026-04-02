import { Worker } from "bullmq";
import { executeAutomation } from "./executor";

const redisUrl = new URL(process.env.REDIS_URL ?? "redis://redis:6379");

new Worker(
  "automation",
  async job => {
    if (job.name === "execute") {
      await executeAutomation(job);
    }
  },
  {
    connection: { host: redisUrl.hostname, port: Number(redisUrl.port || 6379) }
  }
);
