async function computeLineSignature(body, secret) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const digest = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  return btoa(String.fromCharCode(...new Uint8Array(digest)));
}

async function verifyLineSignature(request, secret) {
  const signature = request.headers.get("x-line-signature");
  if (!signature || !secret) {
    return false;
  }

  const body = await request.text();
  const computed = await computeLineSignature(body, secret);
  return signature === computed;
}

async function forwardLineWebhook(request, env, traceId) {
  const webhookUrl = env.BACKEND_WEBHOOK_URL;
  if (!webhookUrl) {
    return new Response("Missing BACKEND_WEBHOOK_URL", { status: 500 });
  }

  const requestBody = await request.text();
  const headers = new Headers(request.headers);
  headers.set("x-trace-id", traceId);

  return fetch(webhookUrl, {
    method: "POST",
    headers,
    body: requestBody
  });
}

export default {
  async fetch(req, env) {
    const traceId = req.headers.get("x-trace-id") ?? crypto.randomUUID();

    if (req.method === "POST" && req.headers.get("x-line-signature")) {
      const valid = await verifyLineSignature(req.clone(), env.LINE_CHANNEL_SECRET);
      if (!valid) {
        return new Response("Invalid signature", { status: 401 });
      }

      return forwardLineWebhook(req, env, traceId);
    }

    const { prompt } = await req.json();
    const res = await env.AI.run("@cf/meta/llama-2-7b-chat-int8", { prompt });
    return new Response(JSON.stringify(res), {
      headers: {
        "content-type": "application/json",
        "x-trace-id": traceId
      }
    });
  }
};
