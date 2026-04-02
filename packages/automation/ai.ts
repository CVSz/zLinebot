import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function generateReply(message: string) {
  const res = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are a helpful TikTok chatbot." },
      { role: "user", content: message }
    ]
  });

  return res.choices[0].message.content;
}
