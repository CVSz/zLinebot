import { generateReply } from "../services/ai.js";

export async function handleMessage(text: string) {
  return generateReply(`User: ${text}`);
}
