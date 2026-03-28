import { db } from "../db.js";
import { embed } from "./embed.js";

export async function updateUserEmbedding(userId: string, text: string) {
  const vec = await embed(text);

  await db.query(
    `INSERT INTO user_embeddings (user_id, vector)
     VALUES ($1, $2)
     ON CONFLICT (user_id)
     DO UPDATE SET vector = (
       SELECT ARRAY(
         SELECT (u + v) / 2
         FROM unnest(user_embeddings.vector, $2::float[]) AS t(u, v)
       )
     )`,
    [userId, vec]
  );
}
