import { QdrantClient } from "@qdrant/js-client-rest";

const client = new QdrantClient({ url: process.env.QDRANT_URL ?? "http://qdrant:6333" });

export async function saveMemory(userId: string, text: string, vector: number[]) {
  await client.upsert("memory", {
    points: [
      {
        id: Date.now(),
        vector,
        payload: { userId, text }
      }
    ]
  });
}

export async function searchMemory(vector: number[]) {
  return client.search("memory", { vector, limit: 5 });
}
