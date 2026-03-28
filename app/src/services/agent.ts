import { generateReply } from "./ai.js";
import { recommendProducts } from "./recommend.js";

export async function salesAgent(input: { tenantId: string; userId: string; text: string }) {
  const { tenantId, text } = input;
  const wantsBuy = /buy|ราคา|price|มีอะไรบ้าง/i.test(text);

  if (wantsBuy) {
    const items = await recommendProducts(tenantId, text);
    if (items.length > 0) {
      return { type: "products" as const, data: items };
    }
  }

  const reply = await generateReply(
    `You are a sales agent. Be concise, upsell, suggest bundles.\nUser: ${text}`
  );

  return { type: "text" as const, data: reply };
}
