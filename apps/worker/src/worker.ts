import { Worker } from "bullmq";
import { executeAutomation } from "./executor";

new Worker(
  "automation",
  async job => {
    if (job.name === "execute") {
      await executeAutomation(job);
    }
  },
  {
    connection: { host: "redis", port: 6379 }
  }
);
