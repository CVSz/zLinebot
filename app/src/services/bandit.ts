import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL ?? "redis://redis:6379");

const BANDIT_PREFIX = "bandit:v1";
const DEFAULT_ALPHA = Number(process.env.BANDIT_ALPHA_PRIOR ?? 1);
const DEFAULT_BETA = Number(process.env.BANDIT_BETA_PRIOR ?? 1);
const EXPLORATION_RATE = Number(process.env.BANDIT_EXPLORATION_RATE ?? 0.15);

export type Arm = { alpha: number; beta: number };

const key = (tenantId: string, productId: string) => `${BANDIT_PREFIX}:${tenantId}:${productId}`;

async function getArm(tenantId: string, productId: string): Promise<Arm> {
  const value = await redis.get(key(tenantId, productId));
  return value ? (JSON.parse(value) as Arm) : { alpha: DEFAULT_ALPHA, beta: DEFAULT_BETA };
}

async function setArm(tenantId: string, productId: string, arm: Arm) {
  await redis.set(key(tenantId, productId), JSON.stringify(arm));
}

function sampleBeta(alpha: number, beta: number) {
  const x = Math.pow(Math.random(), 1 / alpha);
  const y = Math.pow(Math.random(), 1 / beta);
  return x / (x + y);
}

export async function selectArm(tenantId: string, products: string[]) {
  if (products.length === 0) {
    return null;
  }

  const shouldExplore = Math.random() < EXPLORATION_RATE;
  if (!shouldExplore) {
    return products[0];
  }

  let best = { productId: products[0], score: Number.NEGATIVE_INFINITY };

  for (const productId of products) {
    const { alpha, beta } = await getArm(tenantId, productId);
    const score = sampleBeta(alpha, beta);
    if (score > best.score) {
      best = { productId, score };
    }
  }

  return best.productId;
}

export async function updateArm(tenantId: string, productId: string, reward: 0 | 1) {
  const arm = await getArm(tenantId, productId);
  if (reward === 1) {
    arm.alpha += 1;
  } else {
    arm.beta += 1;
  }

  await setArm(tenantId, productId, arm);
}
