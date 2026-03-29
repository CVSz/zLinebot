import crypto from "crypto";

export type KPIState = {
  tenantId: string;
  traceId: string;
  revenue: number;
  cac: number;
  ltv: number;
  churn: number;
};

export async function readKPIs(): Promise<KPIState> {
  return {
    tenantId: "default",
    traceId: crypto.randomUUID(),
    revenue: 0,
    cac: 0,
    ltv: 0,
    churn: 0
  };
}
