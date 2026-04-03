import client from "prom-client";

export const register = new client.Registry();

client.collectDefaultMetrics({ register });

export const httpRequests = new client.Counter({
  name: "http_requests_total",
  help: "Total HTTP requests",
  registers: [register]
});

export const webhookEventsTotal = new client.Counter({
  name: "webhook_events_total",
  help: "Total webhook events received",
  labelNames: ["provider", "event", "tenant"] as const,
  registers: [register]
});

export const webhookValidationFailures = new client.Counter({
  name: "webhook_validation_failures_total",
  help: "Webhook payloads rejected due to validation or signature errors",
  labelNames: ["provider", "reason"] as const,
  registers: [register]
});

export const autoReplyLatencyMs = new client.Histogram({
  name: "auto_reply_latency_ms",
  help: "Latency for tenant-aware auto replies",
  labelNames: ["tenant"] as const,
  buckets: [5, 15, 30, 75, 150, 300, 700, 1500, 3000],
  registers: [register]
});
