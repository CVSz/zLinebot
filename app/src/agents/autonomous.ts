import { act, type ActionResult } from "./actuators.js";
import { guard } from "./guardrails.js";
import { shouldHalt, type KPI } from "./killswitch.js";
import { decide, type AgentAction, type AgentState } from "./policy.js";
import { readState } from "./sensors.js";
import { getRLAction, observeTransition } from "../rl/policy.js";
import { computeReward } from "../rl/reward.js";

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

    await decide(state);
    const rlProposal = await getRLAction(state);
    const safeProposal = guard(state, rlProposal);
    const result = await act(safeProposal);

    const nextState = await readState();
    const reward = computeReward(state, safeProposal);
    observeTransition(state, safeProposal, reward, nextState, !result.applied);

    return { state, proposal: safeProposal, result };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[agents] tick failed", error);
    throw error;
  }
}
