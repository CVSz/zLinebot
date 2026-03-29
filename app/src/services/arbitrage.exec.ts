import type { ArbitrageOpportunity } from "./arbitrage.js";

async function reserve(_venue: string): Promise<void> {
  return;
}

async function placeSell(venue: string): Promise<string> {
  return `sell:${venue}:${Date.now()}`;
}

async function placeBuy(venue: string): Promise<string> {
  return `buy:${venue}:${Date.now()}`;
}

export async function executeArb(op: ArbitrageOpportunity): Promise<{ buyId: string; sellId: string }> {
  await reserve(op.buy.venue);
  const sellId = await placeSell(op.sell.venue);
  const buyId = await placeBuy(op.buy.venue);
  return { buyId, sellId };
}
