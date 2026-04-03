import { stripe } from "./index";
import { prisma } from "@zlinebot/db";

export async function createCustomer(userId: string, email: string, tenantId?: string) {
  const customer = await stripe.customers.create({
    email,
    metadata: tenantId ? { tenantId } : undefined
  });

  await prisma.user.update({
    where: { id: userId },
    data: {
      stripeCustomerId: customer.id,
      billingStatus: "PENDING"
    }
  });

  return customer;
}

export async function createSubscription(customerId: string) {
  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: process.env.STRIPE_PRICE_PRO! }],
    payment_behavior: "default_incomplete",
    expand: ["latest_invoice.payment_intent"]
  });

  await prisma.user.updateMany({
    where: { stripeCustomerId: customerId },
    data: {
      plan: "PRO",
      billingStatus: "INCOMPLETE"
    }
  });

  return subscription;
}
