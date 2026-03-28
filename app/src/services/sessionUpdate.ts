import { embed } from "./embed.js";
import { getSessionVec, setSessionVec } from "./session.js";

function normalizeAlpha(alpha: number) {
  return Math.min(0.95, Math.max(0.05, alpha));
}

function ema(cur: number[], next: number[], alpha: number) {
  const size = Math.max(cur.length, next.length);
  const output = new Array<number>(size);

  for (let i = 0; i < size; i += 1) {
    output[i] = alpha * (cur[i] ?? 0) + (1 - alpha) * (next[i] ?? 0);
  }

  return output;
}

export async function updateSession(
  tenantId: string,
  userId: string,
  text: string,
  alpha = Number(process.env.SESSION_EMA_ALPHA ?? 0.7)
) {
  const alphaClamped = normalizeAlpha(alpha);
  const nextSignal = await embed(text);
  if (nextSignal.length === 0) {
    return;
  }

  const current = (await getSessionVec(tenantId, userId)) ?? nextSignal;
  const merged = ema(current, nextSignal, alphaClamped);

  await setSessionVec(tenantId, userId, merged);
}
