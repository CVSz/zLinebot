import type { AgentAction, AgentState } from "../agents/policy.js";
import { DQN, encodeState, type DqnConfig } from "./dqn.js";
import { selectAction as selectQAction } from "./qlearning.js";

export type PolicyEvent<TState, TAction> = {
  state: TState;
  action: TAction;
  reward: number;
  baseline: number;
  pi: number;
  mu: number;
};

export type TrainablePolicy<TState, TAction> = {
  learn: (input: { state: TState; action: TAction; grad: number }) => Promise<void>;
};

let dqn: DQN | null = null;

export function configureDQN(config: DqnConfig): DQN {
  dqn = new DQN(config);
  return dqn;
}

export function hasDQN(): boolean {
  return dqn !== null;
}

export async function update<TState, TAction>(
  policy: TrainablePolicy<TState, TAction>,
  batch: Array<PolicyEvent<TState, TAction>>
) {
  for (const event of batch) {
    const w = event.mu > 0 ? event.pi / event.mu : 0;
    const adv = event.reward - event.baseline;

    await policy.learn({
      state: event.state,
      action: event.action,
      grad: w * adv
    });
  }
}

export async function getRLAction(state: AgentState): Promise<AgentAction> {
  try {
    if (dqn) {
      return dqn.toAgentAction(state);
    }

    return await selectQAction(state);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[rl] policy fallback", error);
    return {
      type: "rank",
      pick: state.candidates[0]?.id ?? null,
      discount: 0,
      reject: false
    };
  }
}

export function observeTransition(
  state: AgentState,
  action: AgentAction,
  reward: number,
  nextState: AgentState,
  done: boolean
): void {
  if (!dqn) {
    return;
  }

  const encodedState = encodeState(state);
  const encodedNextState = encodeState(nextState);
  const actionIndex = action.reject ? 3 : action.discount >= 0.2 ? 2 : action.discount >= 0.1 ? 1 : 0;

  dqn.storeTransition({
    state: encodedState,
    action: actionIndex,
    reward,
    nextState: encodedNextState,
    done
  });

  dqn.trainStep();
}
