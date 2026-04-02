import { stripe } from "./index";
import { prisma } from "@zlinebot/db";

export async function createCustomer(userId: string, email: string) {
  const customer = await stripe.customers.create({ email });

  await prisma.user.update({
    where: { id: userId },
    data: { stripeCustomerId: customer.id }
  });

  return customer;
}

export async function createSubscription(customerId: string) {
  return stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: process.env.STRIPE_PRICE_PRO! }]
  });
}
