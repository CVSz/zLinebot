import { act, type ActionResult } from "./actuators.js";
import { guard } from "./guardrails.js";
import { shouldHalt, type KPI } from "./killswitch.js";
import { decide, type AgentAction, type AgentState } from "./policy.js";
import { readState } from "./sensors.js";
import { getRLAction, observeTransition } from "../rl/policy.js";
import { computeCoordinatedReward, type CoordinatedReward } from "../rl/multi-agent-reward.js";

export type TickResult = {
  state: AgentState;
  proposal: AgentAction;
  result: ActionResult;
  coordinatedReward?: CoordinatedReward;
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

    const policyProposal = await decide(state);
    const rlProposal = await getRLAction(state);
    const safeProposal = guard(state, rlProposal);
    const proposals: Record<string, AgentAction> = {
      policy: policyProposal,
      rl: safeProposal
    };

    const result = await act(safeProposal);

    const nextState = await readState();
    const coordinated = computeCoordinatedReward(state, proposals);
    observeTransition(state, safeProposal, coordinated.globalReward, nextState, !result.applied);

    return { state, proposal: safeProposal, result, coordinatedReward: coordinated };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[agents] tick failed", error);
    throw error;
  }
}
