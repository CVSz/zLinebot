import { randomUUID } from "node:crypto";

import { db } from "../db.js";

export type FeatureRegistration = {
  name: string;
  version: string;
  entity: string;
  source: string;
};

export type FeatureLineageRecord = {
  featureName: string;
  upstream: string;
  transformation: string;
};

export async function registerFeature(feature: FeatureRegistration) {
  await db.query(
    `INSERT INTO feature_registry (name, version, entity, source)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (name)
     DO UPDATE SET version = EXCLUDED.version, entity = EXCLUDED.entity, source = EXCLUDED.source`,
    [feature.name, feature.version, feature.entity, feature.source]
  );
}

export async function registerLineage(record: FeatureLineageRecord) {
  await db.query(
    `INSERT INTO feature_lineage (id, feature_name, upstream, transformation)
     VALUES ($1, $2, $3, $4)`,
    [randomUUID(), record.featureName, record.upstream, record.transformation]
  );
}
