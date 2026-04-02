const MIN_SECRET_LENGTH = 32;

const requiredSecrets = ["LINE_CHANNEL_SECRET", "REDIS_PASSWORD", "JWT_SECRET", "ML_GRPC_SECRET"] as const;
const optionalSecrets = ["KAFKA_PASSWORD"] as const;

function hasStrongComposition(secret: string): boolean {
  const checks = [/[a-z]/.test(secret), /[A-Z]/.test(secret), /\d/.test(secret), /[^A-Za-z0-9]/.test(secret)];
  return checks.filter(Boolean).length >= 3;
}

export default function validateEnv(): void {
  for (const key of requiredSecrets) {
    const value = process.env[key]?.trim();
    if (!value || value.length < MIN_SECRET_LENGTH) {
      throw new Error(
        `Critical secret ${key} is missing or too weak. Re-run: bash scripts/deploy.sh zlinebot.zeaz.dev`
      );
    }

    if (!hasStrongComposition(value)) {
      console.warn(`⚠️ ${key} may be weak (low character variety). Consider regenerating.`);
    }
  }

  for (const key of optionalSecrets) {
    const value = process.env[key]?.trim();
    if (value && value.length < MIN_SECRET_LENGTH) {
      throw new Error(
        `Optional secret ${key} is configured but too weak. Re-run: bash scripts/deploy.sh zlinebot.zeaz.dev`
      );
    }

    if (value && !hasStrongComposition(value)) {
      console.warn(`⚠️ ${key} may be weak (low character variety). Consider regenerating.`);
    }
  }

  console.log("✅ All configured secrets validated – secure .env loaded");
}
