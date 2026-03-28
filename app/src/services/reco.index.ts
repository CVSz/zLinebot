import { QdrantClient } from "@qdrant/js-client-rest";
import { embed } from "./embed.js";

const client = new QdrantClient({ url: process.env.QDRANT_URL ?? "http://qdrant:6333" });

export async function indexProduct(input: {
  id: number;
  name: string;
  desc?: string;
  tenantId: string;
}) {
  const vector = await embed(`${input.name} ${input.desc ?? ""}`);

  await client.upsert("products", {
    points: [
      {
        id: input.id,
        vector,
        payload: {
          tenantId: input.tenantId
        }
      }
    ]
  });
}
