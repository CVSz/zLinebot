import { QdrantClient } from "@qdrant/js-client-rest";
import { db } from "../db.js";
import { embed } from "./embed.js";

const client = new QdrantClient({ url: process.env.QDRANT_URL ?? "http://qdrant:6333" });

type QdrantPoint = {
  id: string | number;
};

export async function recommendVector(tenantId: string, query: string, vectorOverride?: number[]) {
  const vector = vectorOverride ?? (await embed(query));

  const result = await client.search("products", {
    vector,
    limit: 5,
    filter: {
      must: [{ key: "tenantId", match: { value: tenantId } }]
    }
  });

  const ids = (result as QdrantPoint[]).map((item) => Number(item.id)).filter((id) => !Number.isNaN(id));
  if (ids.length === 0) {
    return [];
  }

  const dbResult = await db.query(
    "SELECT * FROM products WHERE id = ANY($1::int[])",
    [ids]
  );

  const byId = new Map(dbResult.rows.map((row) => [row.id, row]));
  return ids.map((id) => byId.get(id)).filter(Boolean);
}
