export type KPI = {
  revenueDropPct: number;
  errorRate: number;
};

export function shouldHalt(kpi: KPI): boolean {
  return kpi.revenueDropPct < -0.1 || kpi.errorRate > 0.02;
}
