import { rankRL } from "../services/rl.js";
import { selectContextual } from "../services/bandit.contextual.js";
import { choose } from "../services/econ.js";

export type CandidateItem = {
  id: string;
  x: number[];
};

export type AgentAction = {
  type: "rank";
  pick: string | null;
  discount: number;
  reject?: boolean;
};

export type AgentState = {
  tenantId: string;
  vector: number[];
  candidates: CandidateItem[];
  actionsLastMin: number;
  marginAfter: (action: AgentAction) => number;
  evaluate: (action: AgentAction) => {
    revenue: number;
    retention: number;
    churn: number;
    invRisk: number;
  };
};

export async function decide(state: AgentState): Promise<AgentAction> {
  const items = state.candidates;
  const rlPick = await rankRL(state.vector, items);
  const banditPick = await selectContextual(
    state.tenantId,
    items.map((i) => ({ id: i.id, x: i.x }))
  );

  const actions: AgentAction[] = [
    { type: "rank", pick: rlPick, discount: 0 },
    { type: "rank", pick: banditPick, discount: 0.1 }
  ];

  return choose(actions, (action) => state.evaluate(action));
}
