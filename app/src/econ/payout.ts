export async function payoutOnChain(agent: string, amount: number) {
  return fetch("http://chain/tx", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ agent, amount })
  });
}
