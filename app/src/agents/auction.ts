export function scoreBid(bid: { price: number; eta: number; rep: number }) {
  const cost = bid.price;
  const speed = 1 / Math.max(1, bid.eta);
  return 0.5 * speed + 0.3 * bid.rep - 0.2 * cost;
}
