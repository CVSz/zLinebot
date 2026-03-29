import { Kafka, type Producer } from "kafkajs";

const kafka = new Kafka({ brokers: [process.env.KAFKA_BROKER ?? "redpanda:9092"] });
const producer: Producer = kafka.producer();
let connected = false;

async function ensureConnected() {
  if (connected) return;
  await producer.connect();
  connected = true;
}

export async function emit(topic: string, data: unknown): Promise<void> {
  await ensureConnected();
  await producer.send({
    topic,
    messages: [{ value: JSON.stringify(data) }]
  });
}
