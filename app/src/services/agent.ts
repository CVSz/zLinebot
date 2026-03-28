import { generateReply } from "./ai.js";
import { rankProducts } from "./rank.js";
import { updateSession } from "./sessionUpdate.js";

export async function salesAgent(input: { tenantId: string; userId: string; text: string }) {
  const { tenantId, userId, text } = input;
  const wantsBuy = /buy|ราคา|price|มีอะไรบ้าง/i.test(text);

  await updateSession(tenantId, userId, text);

  if (wantsBuy) {
    const items = await rankProducts(tenantId, userId, text);
    if (items.length > 0) {
      return { type: "products" as const, data: items };
    }
  }

  const reply = await generateReply(
    `You are a sales agent. Be concise, upsell, suggest bundles.\nUser: ${text}`
  );

  return { type: "text" as const, data: reply };
}
