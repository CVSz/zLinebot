export async function search(vec: number[]): Promise<unknown> {
  const res = await fetch("http://localhost:6333/collections/main/points/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ vector: vec, limit: 5 })
  });

  if (!res.ok) {
    throw new Error(`vector search failed with status ${res.status}`);
  }

  return res.json();
}
