function parsePort(value: string | undefined): number {
  const fallbackPort = 3000;
  if (!value) {
    return fallbackPort;
  }

  if (!/^\d+$/.test(value)) {
    return fallbackPort;
  }

  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 1 || parsed > 65535) {
    return fallbackPort;
  }

  return parsed;
}

export const env = Object.freeze({
  port: parsePort(process.env.PORT),
  tenantApiKey: process.env.TENANT_API_KEY ?? "demo"
});
