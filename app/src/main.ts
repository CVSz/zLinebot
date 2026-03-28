import express from "express";
import { env } from "./utils/env.js";
import { rateLimit } from "./middleware/rateLimit.js";
import { tenant } from "./middleware/tenant.js";
import { productsRouter } from "./routes/products.js";
import { cartRouter } from "./routes/cart.js";
import { ordersRouter } from "./routes/orders.js";
import { adminRouter } from "./routes/admin.js";
import { webhookRouter } from "./line/webhook.js";

const app = express();
app.use(express.json());
app.use(rateLimit);

app.use("/", webhookRouter);
app.use("/", tenant, productsRouter);
app.use("/", tenant, cartRouter);
app.use("/", tenant, ordersRouter);
app.use("/", tenant, adminRouter);

app.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(`app listening on ${env.port}`);
});
