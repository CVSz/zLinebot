import { publish } from "./kafka.js";

export type AbEvent = {
  userId: string;
  experimentId: string;
  variant: string;
  event: string;
  value?: number;
  timestamp?: string;
  metadata?: Record<string, unknown>;
};

export async function trackAbEvent(event: AbEvent) {
  await publish("ab-events", {
    ...event,
    timestamp: event.timestamp ?? new Date().toISOString()
  });
}
