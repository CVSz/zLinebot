import type { AgentAction, AgentState } from "../agents/policy.js";
import { DQN, encodeState, getDQN } from "./dqn.js";
import { selectAction as selectQAction } from "./qlearning.js";
import { computeReward } from "./reward.js";

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

export function hasDQN(): boolean {
  return getDQN() !== null;
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

function dqnActionIndex(action: AgentAction): number {
  if (action.reject) {
    return 4;
  }

  if (action.discount >= 0.14) {
    return 0; // discount
  }

  if (action.discount >= 0.09) {
    return 1; // bundle
  }

  if (action.discount > 0) {
    return 3; // upsell
  }

  return action.pick ? 2 : 5; // hold / escalate
}

export async function getRLAction(state: AgentState): Promise<AgentAction> {
  try {
    const dqn = getDQN();
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
  rewardOrNextState: number | AgentState,
  nextStateOrDone?: AgentState | boolean,
  maybeDone?: boolean
): void {
  const dqn: DQN | null = getDQN();
  if (!dqn) {
    return;
  }

  const hasExternalReward = typeof rewardOrNextState === "number";
  const reward = hasExternalReward ? rewardOrNextState : computeReward(state, action);
  const nextState = (hasExternalReward ? nextStateOrDone : rewardOrNextState) as AgentState;
  const done = (hasExternalReward ? maybeDone : nextStateOrDone) as boolean;

  if (!nextState || typeof done !== "boolean") {
    return;
  }

  const encodedState = encodeState(state);
  const encodedNextState = encodeState(nextState);

  dqn.storeTransition({
    state: encodedState,
    action: dqnActionIndex(action),
    reward,
    nextState: encodedNextState,
    done
  });

  const loss = dqn.trainStep();
  if (loss !== null) {
    // eslint-disable-next-line no-console
    console.debug(`[rl] train_step loss=${loss.toFixed(6)} epsilon=${dqn.getEpsilon().toFixed(4)}`);
  }
}
