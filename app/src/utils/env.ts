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

export const env = Object.freeze({
  port: parsePort(process.env.PORT),
  tenantApiKey: process.env.TENANT_API_KEY ?? "demo",
  databaseUrl: requireNonEmpty("DATABASE_URL", process.env.DATABASE_URL),
  lineChannelSecret: lineChannelSecret && lineChannelSecret.length > 0 ? lineChannelSecret : undefined,
  lineChannelAccessToken: lineChannelAccessToken && lineChannelAccessToken.length > 0 ? lineChannelAccessToken : undefined,
  lineDefaultTenantId: defaultTenantId,
  featureSyncEnabled: parseBoolean(process.env.FEATURE_SYNC_ENABLED, false)
});
