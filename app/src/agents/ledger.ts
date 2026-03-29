export async function record(agentId: string, revenue: number, endpoint = "http://ledger/write") {
  return fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ agentId, revenue })
  });
}
