type Kpi = { profit: number; retention: number; risk: number };

export function globalObjective(kpi: Kpi): number {
  const w = { profit: 0.6, retention: 0.25, risk: 0.15 };
  return w.profit * kpi.profit + w.retention * kpi.retention - w.risk * kpi.risk;
}

export function acceptChange(prev: Kpi, next: Kpi): boolean {
  return globalObjective(next) > globalObjective(prev) + 0.01;
}
