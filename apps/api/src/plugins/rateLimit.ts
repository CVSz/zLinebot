import rateLimit from "@fastify/rate-limit";

export async function rateLimitPlugin(app: any) {
  app.register(rateLimit, {
    max: 100,
    timeWindow: "1 minute"
  });
}
