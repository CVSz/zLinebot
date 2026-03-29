import { Kafka } from "kafkajs";
import type { Stat } from "./causal.online.js";

export type StatsStore = Record<string, Stat>;

export async function startCausalStreamConsumer(stats: StatsStore): Promise<void> {
  const k = new Kafka({ brokers: [process.env.KAFKA_BROKER ?? "kafka:9092"] });
  const c = k.consumer({ groupId: "causal" });

  await c.connect();
  await c.subscribe({ topic: process.env.KAFKA_EVENTS_TOPIC ?? "events" });

  await c.run({
    eachMessage: async ({ message }) => {
      if (!message.value) return;
      const e = JSON.parse(message.value.toString()) as { expId: string; variant: "t" | "c"; conv: boolean };
      const key = e.expId;

      stats[key] = stats[key] ?? { t: 0, c: 0, t_conv: 0, c_conv: 0 };

      if (e.variant === "t") {
        stats[key].t += 1;
        if (e.conv) stats[key].t_conv += 1;
      } else {
        stats[key].c += 1;
        if (e.conv) stats[key].c_conv += 1;
      }
    }
  });
}
