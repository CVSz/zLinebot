export type MarketAgent = {
  reputation: number;
  performance: number;
  [key: string]: unknown;
};

export function selectAgent(agents: MarketAgent[]) {
  if (agents.length === 0) {
    return undefined;
  }

  return agents
    .map((a) => ({ ...a, score: a.reputation * a.performance }))
    .sort((a, b) => (b.score as number) - (a.score as number))[0];
}
