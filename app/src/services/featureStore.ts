import { Redis } from "ioredis";

const redis = new Redis(process.env.REDIS_URL ?? "redis://redis:6379");

const FEATURE_PREFIX = "f:v1";
const DEFAULT_TTL_SECONDS = Number(process.env.FEATURE_TTL_SECONDS ?? 3600);

type FeaturePayload = Record<string, unknown>;

type StoredFeature = {
  version: number;
  updatedAt: string;
  payload: FeaturePayload;
};

const userKey = (tenantId: string, userId: string) => `${FEATURE_PREFIX}:u:${tenantId}:${userId}`;
const itemKey = (tenantId: string, productId: string) => `${FEATURE_PREFIX}:i:${tenantId}:${productId}`;

function wrapFeature(payload: FeaturePayload): StoredFeature {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    payload
  };
}

function unwrapFeature(value: string | null): FeaturePayload | null {
  if (!value) {
    return null;
  }

  const parsed = JSON.parse(value) as Partial<StoredFeature>;
  if (parsed && typeof parsed === "object" && parsed.payload && typeof parsed.payload === "object") {
    return parsed.payload as FeaturePayload;
  }

  return null;
}

export async function setUserFeatures(tenantId: string, userId: string, features: FeaturePayload) {
  await redis.set(
    userKey(tenantId, userId),
    JSON.stringify(wrapFeature(features)),
    "EX",
    DEFAULT_TTL_SECONDS
  );
}

export async function getUserFeatures(tenantId: string, userId: string) {
  const raw = await redis.get(userKey(tenantId, userId));
  return unwrapFeature(raw);
}

export async function setItemFeatures(tenantId: string, productId: string, features: FeaturePayload) {
  await redis.set(
    itemKey(tenantId, productId),
    JSON.stringify(wrapFeature(features)),
    "EX",
    DEFAULT_TTL_SECONDS
  );
}

export async function getItemFeatures(tenantId: string, productId: string) {
  const raw = await redis.get(itemKey(tenantId, productId));
  return unwrapFeature(raw);
}

export async function backfillFeaturesFromOffline(
  tenantId: string,
  users: Array<{ user_id: string; ctr: number; avg_order: number; last_active: string }>,
  items: Array<{ product_id: string; popularity: number; conversion: number }>
) {
  await Promise.all([
    ...users.map((row) =>
      setUserFeatures(tenantId, row.user_id, {
        ctr: row.ctr,
        avg_order: row.avg_order,
        last_active: row.last_active
      })
    ),
    ...items.map((row) =>
      setItemFeatures(tenantId, row.product_id, {
        popularity: row.popularity,
        conversion: row.conversion
      })
    )
  ]);
}
