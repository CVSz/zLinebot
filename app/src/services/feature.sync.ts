import { Kafka } from "kafkajs";
import { setItemFeatures, setUserFeatures } from "./featureStore.js";

type UserFeatureEvent = {
  type: "user";
  t: string;
  u: string;
  f: Record<string, unknown>;
};

type ItemFeatureEvent = {
  type: "item";
  t: string;
  p: string;
  f: Record<string, unknown>;
};

type FeatureEvent = UserFeatureEvent | ItemFeatureEvent;

function parseFeatureEvent(value: Buffer | null): FeatureEvent | null {
  if (!value) {
    return null;
  }

  const parsed = JSON.parse(value.toString()) as Partial<FeatureEvent>;
  if (parsed.type === "user" && parsed.t && parsed.u && parsed.f) {
    return parsed as UserFeatureEvent;
  }

  if (parsed.type === "item" && parsed.t && parsed.p && parsed.f) {
    return parsed as ItemFeatureEvent;
  }

  return null;
}

export async function startFeatureSyncConsumer() {
  const kafka = new Kafka({ brokers: [process.env.KAFKA_BROKER ?? "kafka:9092"] });
  const consumer = kafka.consumer({ groupId: process.env.FEATURE_SYNC_GROUP_ID ?? "feature-sync" });

  await consumer.connect();
  await consumer.subscribe({ topic: process.env.FEATURES_TOPIC ?? "features" });

  await consumer.run({
    eachMessage: async ({ message }: { message: { value: Buffer | null } }) => {
      const event = parseFeatureEvent(message.value);
      if (!event) {
        return;
      }

      if (event.type === "user") {
        await setUserFeatures(event.t, event.u, event.f);
        return;
      }

      await setItemFeatures(event.t, event.p, event.f);
    }
  });

  return consumer;
}
