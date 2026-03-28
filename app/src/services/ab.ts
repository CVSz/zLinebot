import crypto from "node:crypto";

import { db } from "../db.js";

type ExperimentRecord = {
  id: string;
  variants: string[];
  traffic: number;
};

function getBucket(userId: string, experimentId: string) {
  const hash = crypto.createHash("md5").update(`${userId}:${experimentId}`).digest("hex");
  return parseInt(hash.slice(0, 8), 16) % 100;
}

export async function assignExperiment(userId: string, experimentId: string) {
  const existing = await db.query<{ variant: string }>(
    `SELECT variant
     FROM assignments
     WHERE user_id = $1 AND experiment_id = $2
     LIMIT 1`,
    [userId, experimentId]
  );

  if (existing.rowCount && existing.rows[0]) {
    return existing.rows[0].variant;
  }

  const experimentResult = await db.query<ExperimentRecord>(
    `SELECT id, variants, traffic
     FROM experiments
     WHERE id = $1
     LIMIT 1`,
    [experimentId]
  );

  const experiment = experimentResult.rows[0];
  if (!experiment) {
    throw new Error(`Experiment not found: ${experimentId}`);
  }

  if (!Array.isArray(experiment.variants) || experiment.variants.length === 0) {
    throw new Error(`Experiment ${experimentId} has no configured variants`);
  }

  const traffic = Number.isFinite(experiment.traffic) ? Math.max(0, Math.min(100, experiment.traffic)) : 100;
  const bucket = getBucket(userId, experimentId);

  const variant =
    bucket >= traffic
      ? "control"
      : experiment.variants[Math.min(Math.floor((bucket / Math.max(traffic, 1)) * experiment.variants.length), experiment.variants.length - 1)];

  await db.query(
    `INSERT INTO assignments (user_id, experiment_id, variant)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, experiment_id)
     DO UPDATE SET variant = EXCLUDED.variant`,
    [userId, experimentId, variant]
  );

  return variant;
}
