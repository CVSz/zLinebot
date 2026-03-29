export type WarehouseCandidate = {
  id: string;
  dist: number;
  cost: number;
  stock: number;
};

export function chooseWarehouse(candidates: WarehouseCandidate[]): WarehouseCandidate | null {
  if (candidates.length === 0) {
    return null;
  }

  const scored = candidates.map((warehouse) => ({
    ...warehouse,
    score:
      0.5 * (1 / Math.max(warehouse.dist, 1e-6)) +
      0.3 * (1 / Math.max(warehouse.cost, 1e-6)) +
      0.2 * (warehouse.stock > 0 ? 1 : 0)
  }));

  return scored.sort((a, b) => b.score - a.score)[0];
}
