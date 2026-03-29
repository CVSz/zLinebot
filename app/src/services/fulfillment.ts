import { chooseWarehouse, type WarehouseCandidate } from "./routing.js";

export type Order = {
  id: string;
};

export function allocate(_order: Order, warehouses: WarehouseCandidate[]): WarehouseCandidate | null {
  return chooseWarehouse(warehouses);
}
