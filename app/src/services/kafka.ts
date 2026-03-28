import { Kafka, type Producer } from "kafkajs";

const kafka = new Kafka({
  brokers: [process.env.KAFKA_BROKER ?? "kafka:9092"]
});

let producerPromise: Promise<Producer> | undefined;

async function getProducer() {
  if (!producerPromise) {
    producerPromise = (async () => {
      const producer = kafka.producer();
      await producer.connect();
      return producer;
    })();
  }

  return producerPromise;
}

export async function publish(topic: string, data: unknown) {
  const producer = await getProducer();

  await producer.send({
    topic,
    messages: [{ value: JSON.stringify(data) }]
  });
}
