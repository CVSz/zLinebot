import { Kafka } from "kafkajs";

const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID ?? "zlinebot",
  brokers: (process.env.KAFKA_BROKERS ?? "kafka:9092")
    .split(",")
    .map(v => v.trim())
    .filter(Boolean)
});

export const producer = kafka.producer();
export const consumer = kafka.consumer({
  groupId: process.env.KAFKA_AUTOMATION_GROUP_ID ?? "automation-group"
});

let producerConnected = false;

export async function emitEvent(topic: string, payload: unknown) {
  if (!producerConnected) {
    await producer.connect();
    producerConnected = true;
  }

  await producer.send({
    topic,
    messages: [{ value: JSON.stringify(payload) }]
  });
}
