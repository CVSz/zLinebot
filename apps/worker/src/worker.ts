import { Worker } from "bullmq";
import { consumer } from "@zlinebot/automation/kafka";
import { executeAutomation } from "./executor";
import { initWorkerTracer } from "./tracing";

const redisUrl = new URL(process.env.REDIS_URL ?? "redis://redis:6379");
const queueBackend = (process.env.AUTOMATION_QUEUE_BACKEND ?? "bullmq").toLowerCase();
const tracer = initWorkerTracer();

async function executeWithTrace(job: any) {
  const span = tracer.startSpan("automation.execute");
  try {
    await executeAutomation(job);
  } finally {
    span.finish();
  }
}

async function runKafkaWorker() {
  await consumer.connect();

  const topics = (process.env.KAFKA_AUTOMATION_TOPICS ?? "tiktok.message")
    .split(",")
    .map(v => v.trim())
    .filter(Boolean);

  for (const topic of topics) {
    await consumer.subscribe({ topic });
  }

  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      if (!message.value) return;

      const payload = JSON.parse(message.value.toString());
      const job = {
        data: {
          automationId: payload.automationId,
          payload: payload.payload,
          topic
        }
      };

      await executeWithTrace(job);
    }
  });
}

if (queueBackend === "kafka") {
  void runKafkaWorker();
} else {
  new Worker(
    "automation",
    async job => {
      if (job.name === "execute") {
        await executeWithTrace(job);
      }
    },
    {
      connection: { host: redisUrl.hostname, port: Number(redisUrl.port || 6379) }
    }
  );
}
