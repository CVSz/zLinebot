import http from "http";
import express, { type NextFunction, type Request, Router, type Response } from "express";
import { env } from "./utils/env.js";
import { rateLimit } from "./middleware/rateLimit.js";
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
import { trace } from "./middleware/trace.js";
import { dsrRouter } from "./routes/dsr.js";
import { auditRouter } from "./routes/audit.js";
import { health } from "./health.js";
import { configureDQN } from "./rl/dqn.js";
import { initializeRewardSystem } from "./rl/reward.js";
import { initializeMultiAgentRewardSystem } from "./rl/multi-agent-reward.js";

const app = express();

initializeRewardSystem();
initializeMultiAgentRewardSystem();
configureDQN({ stateDim: 256 });

app.use(trace);
app.use(rateLimit);

const webhookRouterCombined = Router();
webhookRouterCombined.use(stripeWebhookRouter);
webhookRouterCombined.use(promptpayWebhookRouter);
app.use("/webhook", webhookRouterCombined);
app.use("/webhook", webhookRouter);

app.use(express.json({ limit: "10mb" }));

app.get("/health", health);

app.use("/", feedbackRouter);

const tenantRouter = Router();
tenantRouter.use(tenant, setTenantSchema);
tenantRouter.use(productsRouter);
tenantRouter.use(cartRouter);
tenantRouter.use(ordersRouter);
tenantRouter.use(adminRouter);
tenantRouter.use(adminBillingRouter);
tenantRouter.use(dsrRouter);
tenantRouter.use(auditRouter);
app.use("/", tenantRouter);

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  // eslint-disable-next-line no-console
  console.error("unhandled error", error);
  res.status(500).json({ error: "Internal server error" });
});

const server = http.createServer(app);

startAggregator();

if ((process.env.FEATURE_SYNC_ENABLED ?? "false") === "true") {
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
