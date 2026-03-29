import { inferSmart } from "./ai.router.js";

export async function safeInfer(prompt: string, load = 0): Promise<unknown> {
  try {
    return await inferSmart({ prompt }, load);
  } catch {
    return { result: "fallback response" };
  }
}
