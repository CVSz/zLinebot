import Fastify from "fastify";
import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";

import { authRoutes } from "./routes/auth";
import { automationRoutes } from "./routes/automation";
import { webhookRoutes } from "./routes/webhook";
import { rateLimitPlugin } from "./plugins/rateLimit";

const app = Fastify();

app.register(cors, {
  origin: true,
  credentials: true
});

app.register(cookie);
app.register(helmet);
app.register(rateLimitPlugin);

app.register(authRoutes, { prefix: "/auth" });
app.register(automationRoutes, { prefix: "/automation" });
app.register(webhookRoutes, { prefix: "/webhook" });

app.listen({ port: 3000, host: "0.0.0.0" });
