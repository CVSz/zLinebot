import crypto from "crypto";

export function hashId(v: string) {
  return crypto.createHash("sha256").update(v).digest("hex");
}

export async function shareLink(a: string, b: string, endpoint = "https://peer/identity") {
  const payload = { a: hashId(a), b: hashId(b) };

  return fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload)
  });
}
