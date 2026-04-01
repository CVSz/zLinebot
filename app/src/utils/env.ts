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

function requireNonEmpty(name: string, value: string | undefined): string {
  if (!value || value.trim().length === 0) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
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

export const env = Object.freeze({
  port: parsePort(process.env.PORT),
  tenantApiKey: process.env.TENANT_API_KEY ?? "demo",
  databaseUrl: requireNonEmpty("DATABASE_URL", process.env.DATABASE_URL),
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
  featureSyncEnabled: parseBoolean(process.env.FEATURE_SYNC_ENABLED, false)
});
