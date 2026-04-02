import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import express, { Router } from "express";
import helmet from "helmet";
import { env } from "./utils/env.js";
import { rateLimit, rateLimitByIp } from "./middleware/rateLimit.js";
import { isAuthorizedTenantKey, readHeader, resolveTenantId, tenant } from "./middleware/tenant.js";
import { setTenantSchema } from "./middleware/schema.js";
import { productsRouter } from "./routes/products.js";
import { cartRouter } from "./routes/cart.js";
import { ordersRouter } from "./routes/orders.js";
import { adminRouter } from "./routes/admin.js";
import { webhookRouter } from "./line/webhook.js";
import stripeWebhookRouter from "./routes/webhook.stripe.js";
import promptpayWebhookRouter from "./routes/webhook.promptpay.js";
import adminBillingRouter from "./routes/admin.billing.js";
import { startAggregator } from "./services/analytics.js";
import { startWS } from "./ws.js";
import { startFeatureSyncConsumer } from "./services/feature.sync.js";
import { feedbackRouter } from "./routes/feedback.js";
import { automationRouter } from "./routes/automation.js";
import { trace } from "./middleware/trace.js";
import { dsrRouter } from "./routes/dsr.js";
import { auditRouter } from "./routes/audit.js";
import { health } from "./health.js";
import { tiktokRouter } from "./routes/tiktok.js";
import { adminTikTokRouter } from "./routes/admin.tiktok.js";
import { configureDQN } from "./rl/dqn.js";
import { initializeRewardSystem } from "./rl/reward.js";
import { initializeMultiAgentRewardSystem } from "./rl/multi-agent-reward.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { startAutomationWorker } from "./queue/automation.js";

dotenv.config();

const app = express();

initializeRewardSystem();
initializeMultiAgentRewardSystem();
configureDQN({ stateDim: 256 });

app.use(helmet());
app.use(cors({ origin: env.corsOrigin === "*" ? true : env.corsOrigin }));
app.use(trace);
app.use(rateLimit);

const webhookRouterCombined = Router();
webhookRouterCombined.use(stripeWebhookRouter);
webhookRouterCombined.use(promptpayWebhookRouter);
app.use("/webhook", webhookRouterCombined);
app.use("/webhook", webhookRouter);

app.use(express.json({ limit: "10mb" }));

app.get("/health", health);

app.use("/", rateLimitByIp(60), feedbackRouter);
app.use("/", rateLimitByIp(45), tiktokRouter);

const tenantRouter = Router();
tenantRouter.use(rateLimitByIp(90), tenant, setTenantSchema);
tenantRouter.use(productsRouter);
tenantRouter.use(cartRouter);
tenantRouter.use(ordersRouter);
tenantRouter.use(adminRouter);
tenantRouter.use(adminBillingRouter);
tenantRouter.use(adminTikTokRouter);
tenantRouter.use(automationRouter);
tenantRouter.use(dsrRouter);
tenantRouter.use(auditRouter);
app.use("/", tenantRouter);

app.use(errorHandler);

const server = http.createServer(app);
let shuttingDown = false;

startAggregator();
const automationWorker = startAutomationWorker();
automationWorker.on("failed", (job, error) => {
  console.error("automation job failed", job?.id, error);
});

if (env.featureSyncEnabled) {
  startFeatureSyncConsumer().catch((error: unknown) => {
    // eslint-disable-next-line no-console
    console.error("failed to start feature sync consumer", error);
  });
}

startWS(server, (req) => {
  const apiKey = readHeader(req.headers["x-api-key"]);
  if (!isAuthorizedTenantKey(apiKey)) {
    return undefined;
  }

  return resolveTenantId(readHeader(req.headers["x-tenant-id"]));
});

server.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(`app listening on ${env.port}`);
});

function shutdown(signal: NodeJS.Signals): void {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  // eslint-disable-next-line no-console
  console.log(`${signal} received, shutting down gracefully`);

  void automationWorker.close();

  server.close(() => {
    process.exit(0);
  });

  setTimeout(() => {
    process.exit(1);
  }, 10_000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
