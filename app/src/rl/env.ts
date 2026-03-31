import type { AgentState } from "../agents/policy.js";

export type EpisodeStep = {
  state: AgentState;
  nextState: AgentState;
  done: boolean;
};

export type RLEnvironment = {
  reset: () => Promise<AgentState>;
  step: (state: AgentState) => Promise<EpisodeStep>;
};

export function createStaticEnvironment(seedState: AgentState): RLEnvironment {
  return {
    async reset() {
      return seedState;
    },
    async step(state) {
      return {
        state,
        nextState: state,
        done: true
      };
    }
  };
}
