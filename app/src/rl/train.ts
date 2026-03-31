import type { AgentState } from "../agents/policy.js";
import type { RLEnvironment } from "./env.js";
import { computeReward } from "./reward.js";
import { selectAction, updateQTable } from "./qlearning.js";

export async function trainEpisode(env: RLEnvironment, maxSteps = 10): Promise<number> {
  let totalReward = 0;
  let state: AgentState = await env.reset();

  for (let step = 0; step < maxSteps; step += 1) {
    const action = await selectAction(state);
    const { nextState, done } = await env.step(state);
    const reward = computeReward(state, action);

    updateQTable(state, action, nextState, reward);
    totalReward += reward;
    state = nextState;

    if (done) {
      break;
    }
  }

  return totalReward;
}
