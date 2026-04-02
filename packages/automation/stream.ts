import { Kafka } from "kafkajs";

export type StreamEvent = {
  tenantId?: string;
  type: string;
  [key: string]: unknown;
};

const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID ?? "zlinebot-stream",
  brokers: (process.env.KAFKA_BROKERS ?? "kafka:9092")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
});

const consumer = kafka.consumer({
  groupId: process.env.KAFKA_STREAM_GROUP_ID ?? "stream-group"
});

export async function startStream(onEvent?: (event: StreamEvent) => Promise<void> | void): Promise<void> {
  await consumer.connect();
  await consumer.subscribe({
    topic: process.env.KAFKA_STREAM_TOPIC ?? "events",
    fromBeginning: false
  });

  await consumer.run({
    eachMessage: async ({ message }) => {
      if (!message.value) {
        return;
      }

      const event = JSON.parse(message.value.toString()) as StreamEvent;

      if (event.type === "user_spam") {
        // eslint-disable-next-line no-console
        console.log("🚫 Auto-block triggered", { tenantId: event.tenantId });
      }

      await onEvent?.(event);
    }
  });
}

export async function stopStream(): Promise<void> {
  await consumer.disconnect();
}
