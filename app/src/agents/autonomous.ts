import { decide, type AgentAction, type AgentState } from "./policy.js";
import { act, type ActionResult } from "./actuators.js";
import { readState } from "./sensors.js";
import { guard } from "./guardrails.js";

export type TickResult = {
  state: AgentState;
  proposal: AgentAction;
  result: ActionResult;
};

export async function tick(): Promise<TickResult> {
  const state = await readState();
  const proposal = await decide(state);
  const safeProposal = guard(state, proposal);
  const result = await act(safeProposal);

  return { state, proposal: safeProposal, result };
}
