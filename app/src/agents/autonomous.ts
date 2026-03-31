import { act, type ActionResult } from "./actuators.js";
import { guard } from "./guardrails.js";
import { shouldHalt } from "./killswitch.js";
import { decide, type AgentAction, type AgentState } from "./policy.js";
import { readState } from "./sensors.js";

export type TickResult = {
  state: AgentState;
  proposal: AgentAction;
  result: ActionResult;
};

export async function tick(): Promise<TickResult> {
  try {
    const state = await readState();
    if (shouldHalt({ revenueDropPct: 0, errorRate: 0 })) {
      const haltedProposal: AgentAction = {
        type: "rank",
        pick: null,
        discount: 0,
        reject: true
      };

      return {
        state,
        proposal: haltedProposal,
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
