export type AgentState = Record<string, unknown>;
export type AgentAction = Record<string, unknown>;

export type AgentStepResult = {
  revenue: number;
  cost: number;
};

export type AgentPolicy = (state: AgentState) => Promise<AgentAction>;
export type AgentExecute = (action: AgentAction) => Promise<AgentStepResult>;
export type AgentTrain = (sample: { state: AgentState; action: AgentAction; reward: number }) => Promise<void>;

export async function step(
  state: AgentState,
  deps: {
    policy: AgentPolicy;
    execute: AgentExecute;
    train: AgentTrain;
  }
) {
  const action = await deps.policy(state);
  const result = await deps.execute(action);
  const reward = result.revenue - result.cost;

  await deps.train({ state, action, reward });
  return reward;
}
