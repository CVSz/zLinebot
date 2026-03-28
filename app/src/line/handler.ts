import { salesAgent } from "../services/agent.js";
import { emitEvent } from "../services/analytics.js";
import { flex } from "./flex.js";

export async function handleMessage(text: string, tenantId: string, userId: string) {
  await emitEvent({ type: "message", tenantId, userId, ts: Date.now() });

  const response = await salesAgent({ tenantId, userId, text });

  if (response.type === "products") {
    return { type: "flex", contents: flex(response.data) };
  }

  return { type: "text", text: response.data };
}
