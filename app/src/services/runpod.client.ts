import crypto from "crypto";

const endpoint = process.env.RUNPOD_URL;
const apiKey = process.env.RUNPOD_API_KEY;

function assertEnv(value: string | undefined, name: string): string {
  if (!value) throw new Error(`${name} is not set`);
  return value;
}

function sign(body: string): string {
  return crypto.createHmac("sha256", assertEnv(apiKey, "RUNPOD_API_KEY")).update(body).digest("hex");
}

export async function runpodInfer(payload: unknown): Promise<unknown> {
  const body = JSON.stringify(payload);
  const target = assertEnv(endpoint, "RUNPOD_URL");

  const res = await fetch(target, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${assertEnv(apiKey, "RUNPOD_API_KEY")}`,
      "X-Signature": sign(body)
    },
    body,
    signal: AbortSignal.timeout(8_000)
  });

  if (!res.ok) {
    throw new Error(`RunPod failed with status ${res.status}`);
  }

  return res.json();
}
