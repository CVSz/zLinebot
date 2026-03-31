import type { AgentAction, AgentState } from "../agents/policy.js";
import { clamp, epsilonGreedy } from "./utils.js";

const ALPHA = 0.1;
const GAMMA = 0.9;
const EPSILON = 0.1;

type ActionKey = "hold" | "discount_10" | "discount_20";

const ACTIONS: Record<ActionKey, { discount: number }> = {
  hold: { discount: 0 },
  discount_10: { discount: 0.1 },
  discount_20: { discount: 0.2 }
};

const qTable = new Map<string, Record<ActionKey, number>>();

function getStateKey(state: AgentState): string {
  const vectorPrefix = state.vector.slice(0, 4).map((value) => Math.round(value * 100) / 100);
  const candidatePrefix = state.candidates.slice(0, 3).map((item) => item.id);
  return JSON.stringify({ tenantId: state.tenantId, vectorPrefix, candidatePrefix });
}

function ensureState(key: string): Record<ActionKey, number> {
  const existing = qTable.get(key);
  if (existing) {
    return existing;
  }

  const fresh: Record<ActionKey, number> = {
    hold: 0,
    discount_10: 0,
    discount_20: 0
  };
  qTable.set(key, fresh);
  return fresh;
}

function bestActionKey(values: Record<ActionKey, number>): ActionKey {
  return (Object.entries(values) as Array<[ActionKey, number]>).reduce((best, current) =>
    current[1] > best[1] ? current : best
  )[0];
}

function toAgentAction(key: ActionKey, state: AgentState): AgentAction {
  const pick = state.candidates[0]?.id ?? null;
  return {
    type: "rank",
    pick,
    discount: ACTIONS[key].discount
  };
}

export async function selectAction(state: AgentState): Promise<AgentAction> {
  const key = getStateKey(state);
  const values = ensureState(key);

  if (epsilonGreedy(EPSILON)) {
    const randomKeys = Object.keys(ACTIONS) as ActionKey[];
    const randomKey = randomKeys[Math.floor(Math.random() * randomKeys.length)] ?? "hold";
    return toAgentAction(randomKey, state);
  }

  const selectedKey = bestActionKey(values);
  return toAgentAction(selectedKey, state);
}

export function updateQTable(
  state: AgentState,
  action: AgentAction,
  nextState: AgentState,
  reward: number
): void {
  const stateKey = getStateKey(state);
  const nextStateKey = getStateKey(nextState);

  const stateValues = ensureState(stateKey);
  const nextValues = ensureState(nextStateKey);

  const actionKey: ActionKey = action.discount >= 0.2 ? "discount_20" : action.discount >= 0.1 ? "discount_10" : "hold";
  const currentQ = stateValues[actionKey];
  const nextMaxQ = Math.max(...Object.values(nextValues));
  stateValues[actionKey] = clamp(currentQ + ALPHA * (reward + GAMMA * nextMaxQ - currentQ), -1000, 1000);
}

export function snapshotQTable(): Record<string, Record<ActionKey, number>> {
  return Object.fromEntries(qTable.entries());
}
