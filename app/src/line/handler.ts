import { tick } from "../agents/autonomous.js";
import { recommend } from "../agi/index.js";
import { emitEvent } from "../services/analytics.js";
import { salesAgent } from "../services/agent.js";
import { agentActionText, productFlex, recommendationFlex, textMessage } from "./flex.js";

type LineTextMessage = { type: "text"; text: string };
type LineFlexMessage = { type: "flex"; altText: string; contents: unknown };
export type LineReplyMessage = LineTextMessage | LineFlexMessage;

export async function handleMessage(text: string, tenantId: string, userId: string): Promise<LineReplyMessage[]> {
  await emitEvent({ type: "message", tenantId, userId, ts: Date.now() });

  const response = await salesAgent({ tenantId, userId, text });

  if (response.type === "products") {
    return [productFlex(response.data)];
  }

  const messages: LineReplyMessage[] = [textMessage(response.data)];
  const wantsRecommendations = /(recommend|แนะนำ|suggest|deal|โปร)/i.test(text);

  if (!wantsRecommendations) {
    return messages;
  }

  const [recommendations, tickResult] = await Promise.all([
    recommend({ tenantId, userId, text }),
    tick().catch(() => null)
  ]);

  if (recommendations.length > 0) {
    messages.push(recommendationFlex(recommendations));
  }

  if (tickResult?.proposal) {
    messages.push(agentActionText(tickResult.proposal));
  }

  return messages;
}
