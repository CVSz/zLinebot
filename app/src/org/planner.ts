import { salesAgent } from "../agents/sales.js";
import { pricingAgent } from "../agents/pricing.js";
import { supplyAgent } from "../agents/supply.js";
import { riskAgent } from "../agents/risk.js";
import type { KPIState } from "../sensors/kpi.js";

export async function plan(state: KPIState) {
  const [sales, pricing, supply, risk] = await Promise.all([
    salesAgent(state),
    pricingAgent(state),
    supplyAgent(state),
    riskAgent(state)
  ]);

  return { sales, pricing, supply, risk };
}
