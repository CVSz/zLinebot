export type SimulatableAgent = {
  step: () => Promise<void>;
};

export async function simulate(agents: SimulatableAgent[], steps = 100) {
  for (let i = 0; i < steps; i += 1) {
    for (const agent of agents) {
      await agent.step();
    }
  }
}
