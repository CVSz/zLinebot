import { recommend } from "../agi/index.js";
import { salesAgent } from "../services/agent.js";
import { emitEvent } from "../services/analytics.js";
import { flex } from "./flex.js";

export async function handleMessage(text: string, tenantId: string, userId: string) {
  await emitEvent({ type: "message", tenantId, userId, ts: Date.now() });

  const response = await salesAgent({ tenantId, userId, text });

  if (response.type === "products") {
    return { type: "flex", contents: flex(response.data) };
  }

  const wantsRecommendations = /(recommend|แนะนำ|suggest)/i.test(text);
  if (wantsRecommendations) {
    const recommendations = await recommend({ tenantId, userId, text });
    if (recommendations.length) {
      const ids = recommendations.map((item) => item.id).join(", ");
      return { type: "text", text: `${response.data}\nRecommended: ${ids}` };
    }
  }

  return { type: "text", text: response.data };
}
