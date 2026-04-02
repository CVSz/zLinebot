import { createHash } from "crypto";

function anonymizeUserId(userId: string): string {
  return createHash("sha256").update(userId).digest("hex");
}

function sanitizeMeta(meta: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(meta).map(([key, value]) => {
      if (typeof value === "string" && key.toLowerCase().includes("userid")) {
        return [key, anonymizeUserId(value)];
      }

      return [key, value];
    })
  );
}

export function log(level: string, msg: string, meta: Record<string, unknown> = {}): void {
  // eslint-disable-next-line no-console
  console.log(
    JSON.stringify({
      ts: new Date().toISOString(),
      level,
      msg,
      ...sanitizeMeta(meta)
    })
  );
}
