export type Task = Record<string, unknown>;

export type Offer = {
  utility: number;
  agent: {
    counter: (task: Task, offer: Offer) => Promise<CounterOffer>;
  };
};

export type CounterOffer = {
  ev: number;
  latency?: number;
  errorRate?: number;
};

export type NegotiatingAgent = {
  propose: (task: Task) => Promise<Offer>;
};

export async function negotiate(task: Task, agents: NegotiatingAgent[]): Promise<CounterOffer> {
  if (agents.length === 0) {
    throw new Error("agents must not be empty");
  }

  let offers = await Promise.all(agents.map((agent) => agent.propose(task)));
  offers = offers.sort((a, b) => b.utility - a.utility).slice(0, 3);

  const counter = await Promise.all(offers.map((offer) => offer.agent.counter(task, offer)));
  return counter.sort((a, b) => b.ev - a.ev)[0];
}
