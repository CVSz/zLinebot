export type Quote = {
  venue: string;
  price: number;
  fee: number;
  latencyMs: number;
  depth?: number;
};

export type ArbitrageOpportunity = {
  buy: Quote & { eff: number };
  sell: Quote & { eff: number };
  spread: number;
  spreadPct: number;
  minExecutableSize: number;
};

const MIN_SPREAD_PCT = Number(process.env.ARB_MIN_SPREAD_PCT ?? 0.02);
const MAX_LATENCY_MS = Number(process.env.ARB_MAX_LATENCY_MS ?? 1500);

export function findArb(quotes: Quote[]): ArbitrageOpportunity | null {
  if (quotes.length < 2) {
    return null;
  }

  const effective = quotes
    .map((quote) => ({ ...quote, eff: quote.price * (1 + quote.fee) }))
    .sort((a, b) => a.eff - b.eff);

  const buy = effective[0];
  const sell = effective[effective.length - 1];
  if (!buy || !sell) {
    return null;
  }

  const spread = sell.eff - buy.eff;
  const spreadPct = spread / buy.eff;
  const acceptableLatency = sell.latencyMs < MAX_LATENCY_MS && buy.latencyMs < MAX_LATENCY_MS;
  const minExecutableSize = Math.min(buy.depth ?? Number.POSITIVE_INFINITY, sell.depth ?? Number.POSITIVE_INFINITY);

  if (spreadPct < MIN_SPREAD_PCT || !acceptableLatency || minExecutableSize <= 0) {
    return null;
  }

  return {
    buy,
    sell,
    spread,
    spreadPct,
    minExecutableSize: Number.isFinite(minExecutableSize) ? minExecutableSize : 0
  };
}
