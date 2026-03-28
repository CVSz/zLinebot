import { Kafka } from "kafkajs";

export async function startKafkaConsumer() {
  const kafka = new Kafka({
    brokers: [process.env.KAFKA_BROKER ?? "kafka:9092"]
  });

  const consumer = kafka.consumer({ groupId: "zlinebot" });

  await consumer.connect();
  await consumer.subscribe({ topic: process.env.KAFKA_TOPIC ?? "events" });

  await consumer.run({
    eachMessage: async ({ message }) => {
      if (!message.value) {
        return;
      }

      const data = JSON.parse(message.value.toString());
      // eslint-disable-next-line no-console
      console.log("EVENT:", data);
    }
  });

  return consumer;
}
