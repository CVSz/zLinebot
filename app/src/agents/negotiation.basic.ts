export type Bid = {
  agentId: string;
  price: number;
  eta: number;
  score: number;
};

export function select(bids: Bid[]) {
  if (bids.length === 0) {
    throw new Error("bids must not be empty");
  }

  return [...bids].sort((a, b) => b.score - a.score)[0];
}
