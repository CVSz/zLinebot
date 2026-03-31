import { getRLAction } from "../rl/policy.js";
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
  marginAfterGlobal?: (actions: Record<string, AgentAction>) => number;
  evaluate: (action: AgentAction) => {
    revenue: number;
    retention: number;
    churn: number;
    invRisk: number;
  };
};

export async function decide(state: AgentState): Promise<AgentAction> {
  const banditPick = await selectContextual(
    state.tenantId,
    state.candidates.map((item) => ({ id: item.id, x: item.x }))
  );

  const rlAction = await getRLAction(state);

  const actions: AgentAction[] = [
    rlAction,
    {
      type: "rank",
      pick: banditPick,
      discount: 0.1
    }
  ];

  return choose(actions, (action) => state.evaluate(action));
}
