import { db } from "../db.js";
import { embed } from "./embed.js";
import { recommendVector } from "./reco.search.js";

export async function hybridRecommend(userId: string, tenantId: string, query: string) {
  const qVec = await embed(query);

  const userVecRes = await db.query<{ vector: number[] }>(
    "SELECT vector FROM user_embeddings WHERE user_id = $1",
    [userId]
  );

  const userVec = userVecRes.rows[0]?.vector ?? qVec;
  const finalVec = qVec.map((v, i) => (v + (userVec[i] ?? 0)) / 2);

  return recommendVector(tenantId, query, finalVec);
}
