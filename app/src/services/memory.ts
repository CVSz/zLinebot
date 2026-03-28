import { QdrantClient } from "@qdrant/js-client-rest";

const client = new QdrantClient({ url: "http://qdrant:6333" });

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
