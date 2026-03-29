export type Quote = {
  venue: string;
  price: number;
  fee: number;
  latencyMs: number;
};

export type ArbitrageOpportunity = {
  buy: Quote & { eff: number };
  sell: Quote & { eff: number };
  spread: number;
};

export function findArb(quotes: Quote[]): ArbitrageOpportunity | null {
  if (quotes.length < 2) {
    return null;
  }

  const effective = quotes
    .map((quote) => ({ ...quote, eff: quote.price * (1 + quote.fee) }))
    .sort((a, b) => a.eff - b.eff);

  const buy = effective[0];
  const sell = effective[effective.length - 1];
  const spread = sell.eff - buy.eff;
  const isGoodSpread = spread > 0.02 * buy.eff;
  const acceptableLatency = sell.latencyMs < 1500;

  return isGoodSpread && acceptableLatency ? { buy, sell, spread } : null;
}
