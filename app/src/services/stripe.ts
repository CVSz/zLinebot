import Stripe from "stripe";
import { env } from "../utils/env.js";

const stripeSecretKey = env.stripeSecretKey ?? process.env.STRIPE_KEY?.trim();

function getStripeClient(): Stripe {
  if (!stripeSecretKey) {
    throw new Error("Stripe is not configured. Set STRIPE_SECRET_KEY.");
  }

  return new Stripe(stripeSecretKey, {
    apiVersion: "2025-02-24.acacia"
  });
}

export async function createCheckout(amount: number, metadata: Record<string, string>) {
  const stripe = getStripeClient();

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
