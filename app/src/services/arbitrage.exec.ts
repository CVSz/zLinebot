import type { ArbitrageOpportunity } from "./arbitrage.js";

async function reserve(_venue: string): Promise<void> {
  return;
}

async function placeSell(venue: string, size: number): Promise<string> {
  return `sell:${venue}:${size}:${Date.now()}`;
}

async function placeBuy(venue: string, size: number): Promise<string> {
  return `buy:${venue}:${size}:${Date.now()}`;
}

function assertOpportunity(op: ArbitrageOpportunity): void {
  if (op.spread <= 0 || op.spreadPct <= 0) {
    throw new Error("invalid arbitrage spread");
  }

  if (op.minExecutableSize <= 0) {
    throw new Error("insufficient depth for execution");
  }
}

export async function executeArb(op: ArbitrageOpportunity): Promise<{ buyId: string; sellId: string; size: number }> {
  assertOpportunity(op);

  const size = Number(process.env.ARB_ORDER_SIZE ?? Math.max(1, Math.floor(op.minExecutableSize)));

  await reserve(op.buy.venue);
  const sellId = await placeSell(op.sell.venue, size);
  const buyId = await placeBuy(op.buy.venue, size);

  return { buyId, sellId, size };
}
