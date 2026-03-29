export async function resolveIdentity(features: number[], endpoint = "http://vector/search") {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ vector: features })
  });

  if (!res.ok) {
    throw new Error(`resolveIdentity failed: ${res.status}`);
  }

  return res.json();
}
