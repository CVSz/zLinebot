import { db } from "../db.js";
import { embed } from "./embed.js";
import { inferScore, isModelLoaded } from "./infer.js";
import { getSessionVec } from "./session.js";
import { selectArm } from "./bandit.js";

function dot(a: number[], b: number[]) {
  const size = Math.max(a.length, b.length);
  let score = 0;

  for (let i = 0; i < size; i += 1) {
    score += (a[i] ?? 0) * (b[i] ?? 0);
  }

  return score;
}

type Candidate = {
  id: number;
  name: string;
  price: string;
  stock: number;
  description: string | null;
};

async function resolveUserVec(userId: string, fallback: number[]) {
  const result = await db.query<{ vector: number[] }>(
    "SELECT vector FROM user_embeddings WHERE user_id = $1",
    [userId]
  );

  return result.rows[0]?.vector ?? fallback;
}

export async function rankProducts(tenantId: string, userId: string, query: string, limit = 5) {
  const queryVec = await embed(query);

  const { rows } = await db.query<Candidate>(
    `SELECT id, name, price, stock, description
     FROM products
     WHERE tenant_id = $1
     ORDER BY id DESC
     LIMIT 50`,
    [tenantId]
  );

  if (rows.length === 0) {
    return [];
  }

  const sessionVec = (await getSessionVec(tenantId, userId)) ?? queryVec;
  const userVec = await resolveUserVec(userId, queryVec);

  const ranked = await Promise.all(
    rows.map(async (row: Candidate) => {
      const productVec = await embed(`${row.name} ${row.description ?? ""}`);
      const fallbackScore =
        0.5 * dot(queryVec, productVec) +
        0.3 * dot(sessionVec, productVec) +
        0.15 * dot(userVec, productVec) +
        0.05 * (1 / Math.max(1, Number(row.price)));

      const modelScore =
        isModelLoaded() && queryVec.length > 0
          ? await inferScore(queryVec, userVec, sessionVec)
          : fallbackScore;

      return {
        ...row,
        score: modelScore
      };
    })
  );

  const sorted = ranked
    .sort((a: { score: number }, b: { score: number }) => b.score - a.score)
    .slice(0, limit);

  const candidateIds = sorted.map((item: Candidate & { score: number }) => String(item.id));
  const chosenId = await selectArm(tenantId, candidateIds);

  if (chosenId) {
    sorted.sort(
      (a: Candidate & { score: number }, b: Candidate & { score: number }) =>
        (String(a.id) === chosenId ? -1 : 0) - (String(b.id) === chosenId ? -1 : 0)
    );
  }

  return sorted;
}
