import { Kafka } from "kafkajs";

const clickhouseUrl = process.env.CLICKHOUSE_HTTP_URL ?? "http://clickhouse:8123";

export async function startWarehouseConsumer() {
  const kafka = new Kafka({ brokers: [process.env.KAFKA_BROKER ?? "kafka:9092"] });
  const consumer = kafka.consumer({ groupId: process.env.WAREHOUSE_GROUP_ID ?? "warehouse" });

  await consumer.connect();
  await consumer.subscribe({ topic: process.env.KAFKA_TOPIC ?? "events" });

  await consumer.run({
    eachMessage: async ({ message }: { message: { value: Buffer | null } }) => {
      if (!message.value) {
        return;
      }

      const event = JSON.parse(message.value.toString());
      const payload = JSON.stringify(event);

      await fetch(`${clickhouseUrl}/?query=INSERT INTO events FORMAT JSONEachRow`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: `${payload}\n`
      });
    }
  });

  return consumer;
}
