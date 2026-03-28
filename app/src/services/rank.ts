import { db } from "../db.js";
import { embed } from "./embed.js";
import { inferScore, isModelLoaded } from "./infer.js";
import { getSessionVec } from "./session.js";
import { selectArm } from "./bandit.js";
import { isFoundationLoaded, rankBatch } from "./foundation.js";

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

type HybridSignals = {
  foundationScore: number;
  transformerScore: number;
  banditScore: number;
  upliftScore: number;
  rlScore: number;
};

function normalizeScore(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return 1 / (1 + Math.exp(-value));
}

export function hybridRankScore({
  foundationScore,
  transformerScore,
  banditScore,
  upliftScore,
  rlScore
}: HybridSignals) {
  return (
    0.4 * foundationScore +
    0.2 * transformerScore +
    0.15 * banditScore +
    0.15 * upliftScore +
    0.1 * rlScore
  );
}

async function resolveUserVec(userId: string, fallback: number[]) {
  const result = await db.query<{ vector: number[] }>(
    "SELECT vector FROM user_embeddings WHERE user_id = $1",
    [userId]
  );

  return result.rows[0]?.vector ?? fallback;
}

function estimateRlScore(sessionVec: number[], productVec: number[], stock: number) {
  const affinity = normalizeScore(dot(sessionVec, productVec));
  const inventoryPressure = stock <= 0 ? -1 : Math.min(1, Math.log1p(stock) / 4);
  return normalizeScore(0.8 * affinity + 0.2 * inventoryPressure);
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

  const embeddedRows: Array<{ row: Candidate; productVec: number[] }> = await Promise.all(
    rows.map(async (row: Candidate) => {
      const productVec = await embed(`${row.name} ${row.description ?? ""}`);
      return { row, productVec };
    })
  );

  let foundationScores: number[] = embeddedRows.map(() => 0);
  if (isFoundationLoaded()) {
    try {
      const foundationFeatures = embeddedRows.map(({ productVec }: { row: Candidate; productVec: number[] }) => {
        const fused: number[] = [];
        const size = Math.max(queryVec.length, userVec.length, sessionVec.length, productVec.length);
        for (let i = 0; i < size; i += 1) {
          fused.push(
            (queryVec[i] ?? 0) * 0.25 +
              (userVec[i] ?? 0) * 0.35 +
              (sessionVec[i] ?? 0) * 0.25 +
              (productVec[i] ?? 0) * 0.15
          );
        }
        return fused;
      });

      foundationScores = (await rankBatch(foundationFeatures)).map((v) => normalizeScore(v));
    } catch {
      foundationScores = embeddedRows.map(() => 0);
    }
  }

  const ranked = await Promise.all(
    embeddedRows.map(async ({ row, productVec }: { row: Candidate; productVec: number[] }, idx: number) => {
      const transformerScore = normalizeScore(dot(queryVec, productVec));
      const banditScore = normalizeScore(dot(sessionVec, productVec));

      const upliftBase =
        0.7 * dot(userVec, productVec) + 0.3 * (1 / Math.max(1, Number(row.price)));
      const upliftScore =
        isModelLoaded() && queryVec.length > 0
          ? normalizeScore(await inferScore(queryVec, userVec, sessionVec))
          : normalizeScore(upliftBase);

      const rlScore = estimateRlScore(sessionVec, productVec, row.stock);

      return {
        ...row,
        score: hybridRankScore({
          foundationScore: foundationScores[idx] ?? 0,
          transformerScore,
          banditScore,
          upliftScore,
          rlScore
        })
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
