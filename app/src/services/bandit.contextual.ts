import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL ?? "redis://redis:6379");

const BANDIT_PREFIX = "linucb:v1";
const DEFAULT_ALPHA = Number(process.env.LINUCB_ALPHA ?? 0.5);
const DEFAULT_LAMBDA = Number(process.env.LINUCB_LAMBDA ?? 1);

export type ContextualItem = {
  id: string;
  x: number[];
};

type ArmState = {
  Ainv: number[][];
  b: number[];
};

const key = (tenantId: string, productId: string) => `${BANDIT_PREFIX}:${tenantId}:${productId}`;

function identity(d: number, value = 1) {
  return Array.from({ length: d }, (_, i) =>
    Array.from({ length: d }, (_, j) => (i === j ? value : 0))
  );
}

function dot(a: number[], b: number[]) {
  let sum = 0;
  for (let i = 0; i < a.length; i += 1) {
    sum += a[i] * (b[i] ?? 0);
  }
  return sum;
}

function matVec(A: number[][], x: number[]) {
  return A.map((row) => dot(row, x));
}

function addVec(a: number[], b: number[]) {
  return a.map((v, i) => v + (b[i] ?? 0));
}

function scaleVec(v: number[], s: number) {
  return v.map((x) => x * s);
}

function normalize(x: number[]) {
  const norm = Math.sqrt(Math.max(dot(x, x), 1e-12));
  return x.map((v) => v / norm);
}

async function getArm(tenantId: string, productId: string, d: number): Promise<ArmState> {
  const raw = await redis.get(key(tenantId, productId));
  if (!raw) {
    return {
      Ainv: identity(d, 1 / DEFAULT_LAMBDA),
      b: Array(d).fill(0)
    };
  }

  return JSON.parse(raw) as ArmState;
}

async function setArm(tenantId: string, productId: string, arm: ArmState) {
  await redis.set(key(tenantId, productId), JSON.stringify(arm));
}

function shermanMorrison(Ainv: number[][], x: number[]) {
  const AinvX = matVec(Ainv, x);
  const denom = 1 + dot(x, AinvX);

  if (denom <= 1e-12) {
    return Ainv;
  }

  const next = Ainv.map((row, i) =>
    row.map((value, j) => value - (AinvX[i] * AinvX[j]) / denom)
  );

  return next;
}

export async function selectContextual(
  tenantId: string,
  items: ContextualItem[],
  alpha = DEFAULT_ALPHA
) {
  if (items.length === 0) {
    return null;
  }

  const d = items[0].x.length;
  let best = { id: items[0].id, score: Number.NEGATIVE_INFINITY };

  for (const item of items) {
    if (item.x.length !== d) {
      continue;
    }

    const x = normalize(item.x);
    const arm = await getArm(tenantId, item.id, d);

    const theta = matVec(arm.Ainv, arm.b);
    const AinvX = matVec(arm.Ainv, x);

    const exploit = dot(theta, x);
    const explore = alpha * Math.sqrt(Math.max(dot(x, AinvX), 0));
    const score = exploit + explore;

    if (score > best.score) {
      best = { id: item.id, score };
    }
  }

  return best.id;
}

export async function updateContextual(
  tenantId: string,
  productId: string,
  x: number[],
  reward: number
) {
  if (x.length === 0) {
    return;
  }

  const normalizedX = normalize(x);
  const arm = await getArm(tenantId, productId, normalizedX.length);

  arm.Ainv = shermanMorrison(arm.Ainv, normalizedX);
  arm.b = addVec(arm.b, scaleVec(normalizedX, reward));

  await setArm(tenantId, productId, arm);
}
