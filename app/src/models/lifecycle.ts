import { evaluateCandidate } from "../agents/modelManager.js";
import { setTrafficSplit } from "../services/traffic.js";

type EvalLog = {
  reward: number;
  pi_old: number;
  q_hat?: number;
  [key: string]: unknown;
};

type PolicyCandidate = {
  pi: (log: EvalLog) => number;
};

export async function evolve(current: PolicyCandidate, candidate: PolicyCandidate, logs: EvalLog[]): Promise<void> {
  const ok = (await evaluateCandidate(logs, candidate)) > (await evaluateCandidate(logs, current)) + 0.01;

  if (ok) await setTrafficSplit({ candidate: 0.1 });
}
