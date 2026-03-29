import { ips } from "../services/eval.ips.js";
import { dr } from "../services/eval.dr.js";
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

export async function evaluateCandidate(logs: EvalLog[], cand: PolicyCandidate): Promise<number> {
  const ipsScore = ips(
    logs.map((log) => ({
      reward: log.reward,
      pi_new: cand.pi(log),
      pi_old: log.pi_old
    }))
  );

  const drScore = dr(
    logs.map((log) => ({
      reward: log.reward,
      pi_new: cand.pi(log),
      pi_old: log.pi_old,
      q_hat: log.q_hat ?? 0
    }))
  );

  return 0.5 * ipsScore + 0.5 * drScore;
}

export async function deployIfBetter(
  curr: PolicyCandidate,
  cand: PolicyCandidate,
  logs: EvalLog[]
): Promise<boolean> {
  const candidateScore = await evaluateCandidate(logs, cand);
  const baselineScore = await evaluateCandidate(logs, curr);

  if (candidateScore > baselineScore + 0.01) {
    await setTrafficSplit({ candidate: 0.1 });
    return true;
  }

  return false;
}
