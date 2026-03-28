import http from "http";
import express from "express";
import { env } from "./utils/env.js";
import { rateLimit } from "./middleware/rateLimit.js";
import { tenant } from "./middleware/tenant.js";
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

const app = express();

app.use("/webhook", stripeWebhookRouter);

app.use(express.json());
app.use(rateLimit);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/webhook", promptpayWebhookRouter);
app.use("/", webhookRouter);
app.use("/", tenant, productsRouter);
app.use("/", tenant, cartRouter);
app.use("/", tenant, ordersRouter);
app.use("/", tenant, adminRouter);
app.use("/", tenant, adminBillingRouter);

const server = http.createServer(app);

startAggregator();
startWS(server, (req) => {
  const hostTenant = req.headers["x-tenant-id"];
  return Array.isArray(hostTenant) ? hostTenant[0] : hostTenant;
});

server.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(`app listening on ${env.port}`);
});
