import { updateArm } from "./bandit.js";

export async function onClick(tenantId: string, productId: string) {
  await updateArm(tenantId, productId, 1);
}

export async function onView(tenantId: string, productId: string) {
  await updateArm(tenantId, productId, 0);
}
