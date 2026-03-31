import { act, type ActionResult } from "./actuators.js";
import { guard } from "./guardrails.js";
import { shouldHalt, type KPI } from "./killswitch.js";
import { decide, type AgentAction, type AgentState } from "./policy.js";
import { readState } from "./sensors.js";

export type TickResult = {
  state: AgentState;
  proposal: AgentAction;
  result: ActionResult;
};

export async function tick(kpi?: KPI): Promise<TickResult> {
  try {
    const state = await readState();

    if (kpi && shouldHalt(kpi)) {
      const blockedAction: AgentAction = {
        type: "rank",
        pick: null,
        discount: 0,
        reject: true
      };

      return {
        state,
        proposal: blockedAction,
        result: { applied: false, reason: "killswitch_halt" }
      };
    }

    const proposal = await decide(state);
    const safeProposal = guard(state, proposal);
    const result = await act(safeProposal);

    return { state, proposal: safeProposal, result };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[agents] tick failed", error);
    throw error;
  }
}
