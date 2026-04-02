import { stripe } from "@zlinebot/billing";
import { prisma } from "@zlinebot/db";

export async function stripeWebhook(app: any) {
  app.post("/stripe/webhook", { config: { rawBody: true } }, async (req: any) => {
    const sig = req.headers["stripe-signature"];
    if (!sig) return { received: false, error: "missing_signature" };

    const event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    if (event.type === "customer.subscription.updated") {
      const sub = event.data.object as any;

      await prisma.user.updateMany({
        where: { stripeCustomerId: sub.customer },
        data: {
          plan: sub.status === "active" ? "PRO" : "FREE"
        }
      });
    }

    return { received: true };
  });
}
