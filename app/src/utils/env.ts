export const env = {
  port: Number(process.env.PORT ?? 3000),
  tenantApiKey: process.env.TENANT_API_KEY ?? "demo"
};
