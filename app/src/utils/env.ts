function parsePort(value: string | undefined): number {
  const fallbackPort = 3000;
  if (!value || !/^\d+$/.test(value)) {
    return fallbackPort;
  }

  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 1 || parsed > 65535) {
    return fallbackPort;
  }

  return parsed;
}

function parsePositiveInt(value: string | undefined, fallback: number): number {
  if (!value || !/^\d+$/.test(value)) {
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 1) {
    return fallback;
  }

  return parsed;
}

function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (!value) {
    return fallback;
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === "true") {
    return true;
  }

  if (normalized === "false") {
    return false;
  }

  return fallback;
}


function parseWorkerMode(value: string | undefined): "embedded" | "external" {
  if (!value) {
    return "embedded";
  }

  return value.trim().toLowerCase() === "external" ? "external" : "embedded";
}

function requireNonEmpty(name: string, value: string | undefined): string {
  if (!value || value.trim().length === 0) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}


function ensureSecretStrength(name: string, value: string | undefined, minLength = 32): void {
  if (!value) {
    return;
  }

  if (value.length < minLength) {
    throw new Error(`${name} must be at least ${minLength} characters in production`);
  }
}

const defaultTenantId = process.env.LINE_DEFAULT_TENANT_ID?.trim() || "demo";
const lineChannelSecret = process.env.LINE_CHANNEL_SECRET?.trim();
const lineChannelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN?.trim();
const tiktokClientKey = process.env.TIKTOK_CLIENT_KEY?.trim();
const tiktokClientSecret = process.env.TIKTOK_CLIENT_SECRET?.trim();
const tiktokRedirectUri = process.env.TIKTOK_REDIRECT_URI?.trim();
const tiktokWebhookSecret = process.env.TIKTOK_WEBHOOK_SECRET?.trim();
const tiktokScope = process.env.TIKTOK_SCOPE?.trim() || "user.info.basic";
const tiktokShopApiBaseUrl = process.env.TIKTOK_SHOP_API_BASE_URL?.trim();
const tiktokShopAccessToken = process.env.TIKTOK_SHOP_ACCESS_TOKEN?.trim();
const corsOrigin = process.env.CORS_ORIGIN?.trim();
const openaiApiKey = process.env.OPENAI_API_KEY?.trim();
const openaiModel = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";
const encryptionKey = process.env.ENCRYPTION_KEY?.trim();
const isProduction = (process.env.NODE_ENV?.trim().toLowerCase() ?? "development") === "production";

if (isProduction) {
  ensureSecretStrength("JWT_SECRET", process.env.JWT_SECRET?.trim());
  ensureSecretStrength("SESSION_SECRET", process.env.SESSION_SECRET?.trim());
  ensureSecretStrength("LINE_CHANNEL_SECRET", lineChannelSecret);
}

export const env = Object.freeze({
  port: parsePort(process.env.PORT),
  appUrl: process.env.APP_URL?.trim() || "http://localhost:3000",
  tenantApiKey: process.env.TENANT_API_KEY ?? "demo",
  databaseUrl: requireNonEmpty("DATABASE_URL", process.env.DATABASE_URL),
  redisUrl: process.env.REDIS_URL?.trim() || "redis://127.0.0.1:6379",
  jwtSecret: requireNonEmpty("JWT_SECRET", process.env.JWT_SECRET),
  sessionSecret: requireNonEmpty("SESSION_SECRET", process.env.SESSION_SECRET),
  corsOrigin: corsOrigin && corsOrigin.length > 0 ? corsOrigin : (process.env.APP_URL?.trim() || "http://localhost:3000"),
  rateLimit: parsePositiveInt(process.env.RATE_LIMIT, 100),
  queueConcurrency: parsePositiveInt(process.env.QUEUE_CONCURRENCY, 5),
  stripeSecretKey: process.env.STRIPE_SECRET_KEY?.trim(),
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET?.trim(),
  lineChannelSecret: lineChannelSecret && lineChannelSecret.length > 0 ? lineChannelSecret : undefined,
  lineChannelAccessToken: lineChannelAccessToken && lineChannelAccessToken.length > 0 ? lineChannelAccessToken : undefined,
  lineDefaultTenantId: defaultTenantId,
  tiktokClientKey: tiktokClientKey && tiktokClientKey.length > 0 ? tiktokClientKey : undefined,
  tiktokClientSecret: tiktokClientSecret && tiktokClientSecret.length > 0 ? tiktokClientSecret : undefined,
  tiktokRedirectUri: tiktokRedirectUri && tiktokRedirectUri.length > 0 ? tiktokRedirectUri : undefined,
  tiktokWebhookSecret: tiktokWebhookSecret && tiktokWebhookSecret.length > 0 ? tiktokWebhookSecret : undefined,
  tiktokScope,
  tiktokShopApiBaseUrl: tiktokShopApiBaseUrl && tiktokShopApiBaseUrl.length > 0 ? tiktokShopApiBaseUrl : undefined,
  tiktokShopAccessToken: tiktokShopAccessToken && tiktokShopAccessToken.length > 0 ? tiktokShopAccessToken : undefined,
  featureSyncEnabled: parseBoolean(process.env.FEATURE_SYNC_ENABLED, false),
  openaiApiKey: openaiApiKey && openaiApiKey.length > 0 ? openaiApiKey : undefined,
  openaiModel,
  encryptionKey: encryptionKey && encryptionKey.length > 0 ? encryptionKey : undefined,
  automationWorkerMode: parseWorkerMode(process.env.AUTOMATION_WORKER_MODE)
});
