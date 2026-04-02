import Fastify from "fastify";
import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rawBody from "@fastify/raw-body";

import { authRoutes } from "./routes/auth";
import { automationRoutes } from "./routes/automation";
import { webhookRoutes } from "./routes/webhook";
import { analyticsRoutes } from "./routes/analytics";
import { stripeWebhook } from "./routes/stripeWebhook";
import { logsRoutes } from "./routes/logs";
import { rateLimitPlugin } from "./plugins/rateLimit";
import { authMiddleware } from "./middleware/auth";

const app = Fastify();

app.register(cors, {
  origin: true,
  credentials: true
});

app.register(cookie);
app.register(helmet);
app.register(rateLimitPlugin);
app.register(rawBody, { global: false, runFirst: true });

app.register(authRoutes, { prefix: "/auth" });
app.register(automationRoutes, {
  prefix: "/automation",
  preHandler: authMiddleware
});
app.register(webhookRoutes, { prefix: "/webhook" });
app.register(analyticsRoutes, {
  prefix: "/analytics",
  preHandler: authMiddleware
});
app.register(logsRoutes, {
  prefix: "/logs",
  preHandler: authMiddleware
});
app.register(stripeWebhook);

app.listen({ port: 3000, host: "0.0.0.0" });
