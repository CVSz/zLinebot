export type FederatedMatch = {
  score: number;
  [key: string]: unknown;
};

export async function federatedResolve(
  vector: number[],
  peers = ["https://node1", "https://node2"]
): Promise<FederatedMatch | undefined> {
  const responses = await Promise.all(
    peers.map(async (peer) => {
      const res = await fetch(`${peer}/vector/search`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ vector })
      });

      if (!res.ok) {
        return [] as FederatedMatch[];
      }

      return (await res.json()) as FederatedMatch[];
    })
  );

  return responses.flat().sort((a, b) => b.score - a.score)[0];
}
