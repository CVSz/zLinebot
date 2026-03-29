import crypto from "crypto";

let candidateTrafficShare = 0.1;

export function variant(userId: string, p = candidateTrafficShare): "candidate" | "baseline" {
  const hash = crypto.createHash("md5").update(userId).digest("hex");
  const bucket = parseInt(hash.slice(0, 8), 16) / 0xffffffff;
  return bucket < p ? "candidate" : "baseline";
}

export async function setTrafficSplit(split: { candidate: number }): Promise<void> {
  candidateTrafficShare = Math.max(0, Math.min(1, split.candidate));
}
