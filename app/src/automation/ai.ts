import OpenAI from "openai";
import { env } from "../utils/env.js";

const client = env.openaiApiKey
  ? new OpenAI({
      apiKey: env.openaiApiKey
    })
  : null;

export async function generateReply(message: string): Promise<string> {
  if (!client) {
    throw new Error("OPENAI_API_KEY is required for ai_reply actions");
  }

  const res = await client.chat.completions.create({
    model: env.openaiModel,
    messages: [
      { role: "system", content: "You are a helpful TikTok chatbot." },
      { role: "user", content: message }
    ]
  });

  return res.choices[0]?.message?.content?.trim() ?? "";
}
