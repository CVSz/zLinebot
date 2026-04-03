import { stripe } from "@zlinebot/billing";
import { prisma } from "@zlinebot/db";

type StripeInvoiceLike = {
  customer?: string;
  amount_paid?: number;
  currency?: string;
};

export async function stripeWebhook(app: any) {
  app.post("/stripe/webhook", { config: { rawBody: true } }, async (req: any) => {
    const sig = req.headers["stripe-signature"];
    if (!sig) {
      return { received: false, error: "missing_signature" };
    }

    const event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as any;
      await prisma.user.updateMany({
        where: { stripeCustomerId: session.customer },
        data: {
          plan: "PRO",
          billingStatus: "ACTIVE",
          billingCycleAnchor: new Date()
        }
      });
    }

    if (event.type === "customer.subscription.updated") {
      const sub = event.data.object as any;

      await prisma.user.updateMany({
        where: { stripeCustomerId: sub.customer },
        data: {
          plan: sub.status === "active" ? "PRO" : "FREE",
          billingStatus: sub.status
        }
      });
    }

    if (event.type === "invoice.paid") {
      const invoice = event.data.object as StripeInvoiceLike;
      if (invoice.customer) {
        await prisma.log.create({
          data: {
            tenantId: String(invoice.customer),
            level: "info",
            message: "Billing payment recorded",
            metadata: {
              amountPaid: invoice.amount_paid ?? 0,
              currency: invoice.currency ?? "usd",
              source: "stripe.invoice.paid"
            }
          }
        });
      }
    }

    return { received: true };
  });
}
