import { tick } from "../agents/autonomous.js";
import { recommend } from "../agi/index.js";
import { emitEvent } from "../services/analytics.js";
import { salesAgent } from "../services/agent.js";
import { buildAgentActionFlex, buildRecommendationFlex, productFlex, textMessage } from "./flex.js";

type LineTextMessage = { type: "text"; text: string };
type LineFlexMessage = { type: "flex"; altText: string; contents: unknown };
export type LineReplyMessage = LineTextMessage | LineFlexMessage;

const commerceIntentPattern = /(recommend|แนะนำ|suggest|deal|โปร|buy|price|discount|cart|checkout)/i;

export async function handleMessage(text: string, tenantId: string, userId: string): Promise<LineReplyMessage[]> {
  await emitEvent({ type: "message", tenantId, userId, ts: Date.now() });

  const response = await salesAgent({ tenantId, userId, text });

  if (response.type === "products") {
    return [productFlex(response.data)];
  }

  const messages: LineReplyMessage[] = [textMessage(response.data)];

  if (!commerceIntentPattern.test(text)) {
    return messages;
  }

  const [recommendations, tickResult] = await Promise.all([
    recommend({ tenantId, userId, query: text }),
    tick().catch(() => null)
  ]);

  if (recommendations.length > 0) {
    messages.push(buildRecommendationFlex(recommendations));
  }

  if (tickResult?.proposal) {
    messages.push(buildAgentActionFlex(tickResult.proposal));
  }

  return messages;
}

export async function handlePostback(data: string, tenantId: string, userId: string): Promise<LineReplyMessage[]> {
  await emitEvent({ type: "message", tenantId, userId, ts: Date.now() });

  const [recommendations, tickResult] = await Promise.all([
    recommend({ tenantId, userId, postback: data }),
    tick().catch(() => null)
  ]);

  const messages: LineReplyMessage[] = [textMessage(`Received action: ${data}`)];

  if (recommendations.length > 0) {
    messages.push(buildRecommendationFlex(recommendations));
  }

  if (tickResult?.proposal) {
    messages.push(buildAgentActionFlex(tickResult.proposal));
  }

  return messages;
}
