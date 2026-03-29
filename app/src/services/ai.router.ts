import { generateReply } from "./ai.js";
import { runpodInfer } from "./runpod.client.js";

export async function localInfer(input: { prompt: string }): Promise<{ result: string }> {
  const result = await generateReply(input.prompt);
  return { result };
}

export async function inferSmart(input: { prompt: string }, load: number): Promise<unknown> {
  try {
    if (load > 0.7) {
      return await runpodInfer(input);
    }

    return await localInfer(input);
  } catch {
    return localInfer(input);
  }
}
