export type PolicyLog = {
  action: string;
  pi_new: number;
  pi_old: number;
};

export function updatePolicy(logs: PolicyLog[], ratioClip = 10) {
  return logs.map((log) => {
    const safeOld = log.pi_old > 0 ? log.pi_old : 1e-6;
    const ratio = log.pi_new / safeOld;

    return {
      action: log.action,
      weight: Math.min(ratioClip, Math.max(0, ratio))
    };
  });
}
