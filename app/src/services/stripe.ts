import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_KEY ?? "", {
  apiVersion: "2025-02-24.acacia"
});

export async function createCheckout(amount: number, metadata: Record<string, string>) {
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "thb",
          product_data: { name: "Order" },
          unit_amount: Math.round(amount * 100)
        },
        quantity: 1
      }
    ],
    success_url: process.env.SUCCESS_URL ?? "http://localhost:5173/success",
    cancel_url: process.env.CANCEL_URL ?? "http://localhost:5173/cancel",
    metadata
  });

  return session.url;
}
