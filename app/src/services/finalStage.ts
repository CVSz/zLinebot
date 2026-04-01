import { isHalted } from "./killswitch.js";
import { remainingBudget, spend } from "./budget.js";
import { pseudo } from "./privacy.js";
import { rankRL } from "./rl.js";
import { ips } from "./eval.ips.js";
import { dr } from "./eval.dr.js";
import { predict, update, guard, type WorldModel, type MarketState } from "../world/self_improve.basic.js";
import { buildGraph } from "../causal/pc_lite.js";
import { select, type Bid } from "../agents/negotiation.basic.js";
import { scoreBid } from "../agents/auction.js";
import { enforceSLA } from "../agents/sla.js";
import { credit } from "../econ/ledger.js";

export type FinalStageInput = {
  tenantId: string;
  userId: string;
  state: MarketState;
  actionPrice: number;
  actualDemand: number;
  wm: WorldModel;
  kpiDelta: number;
  candidateItems: Array<{ id: string; x: number[] }>;
  bids: Array<{ agentId: string; price: number; eta: number; rep: number }>;
  dailyBudgetCost: number;
  consent: boolean;
};

export type FinalStageResult = {
  userKey: string;
  chosenItemId: string | null;
  predictedDemand: number;
  updatedWorldModel: WorldModel;
  skeletonEdges: Array<[string, string]>;
  winningBid: Bid;
  ipsEstimate: number;
  drEstimate: number;
};

export async function runFinalStage(input: FinalStageInput): Promise<FinalStageResult> {
  if (isHalted()) {
    throw new Error("Global kill-switch enabled");
  }

  if (!input.consent) {
    throw new Error("Consent required");
  }

  if (input.dailyBudgetCost > remainingBudget()) {
    throw new Error("Budget cap reached");
  }

  spend(input.dailyBudgetCost);

  const userKey = pseudo(`${input.tenantId}:${input.userId}`);
  const predictedDemand = predict(input.wm, input.state, { price: input.actionPrice });
  const calibrated = update(input.wm, predictedDemand, input.actualDemand);
  const updatedWorldModel = guard(input.wm, calibrated, input.kpiDelta);

  const skeletonEdges = buildGraph(["demand", "price", "budget"], (a, b) => {
    if ((a === "demand" && b === "price") || (a === "price" && b === "demand")) {
      return -0.5;
    }
    if ((a === "demand" && b === "budget") || (a === "budget" && b === "demand")) {
      return 0.35;
    }
    return 0.1;
  });

  const chosenItemId = await rankRL([predictedDemand, input.state.price], input.candidateItems);

  const scoredBids: Bid[] = input.bids.map((bid) => ({
    agentId: bid.agentId,
    price: bid.price,
    eta: bid.eta,
    score: scoreBid({ price: bid.price, eta: bid.eta, rep: bid.rep })
  }));

  const winningBid = select(scoredBids);
  if (!winningBid) {
    throw new Error("No winning bid available");
  }

  enforceSLA({ latency: winningBid.eta * 1000, errorRate: 0.01 });

  const ipsEstimate = ips([{ reward: winningBid.score, pi_new: 0.6, pi_old: 0.5 }]);
  const drEstimate = dr([{ reward: winningBid.score, pi_new: 0.6, pi_old: 0.5, q_hat: winningBid.score * 0.9 }]);

  await credit(winningBid.agentId, winningBid.score, "final-stage-payout");

  return {
    userKey,
    chosenItemId,
    predictedDemand,
    updatedWorldModel,
    skeletonEdges,
    winningBid,
    ipsEstimate,
    drEstimate
  };
}
