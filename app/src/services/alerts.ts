export type KPIAlertSnapshot = {
  revenueDrop: number;
  riskHigh: boolean;
};

export function checkAlerts(kpi: KPIAlertSnapshot): string[] {
  const alerts: string[] = [];
  if (kpi.revenueDrop < -0.1) alerts.push("Revenue drop");
  if (kpi.riskHigh) alerts.push("High fraud risk");
  return alerts;
}
