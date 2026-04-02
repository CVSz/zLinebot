import crypto from "crypto";
import fs from "fs";
import path from "path";

function generateSecret(length = 64) {
  return crypto.randomBytes(length).toString("hex");
}

const envPath = path.resolve(process.cwd(), ".env");
const force = process.argv.includes("--force");

if (fs.existsSync(envPath) && !force) {
  console.error("❌ .env already exists. Re-run with --force to overwrite.");
  process.exit(1);
}

const env = `
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/zlinebot

JWT_SECRET=${generateSecret(64)}
API_KEY_SECRET=${generateSecret(64)}
ENCRYPTION_KEY=${generateSecret(32)}

TIKTOK_CLIENT_KEY=
TIKTOK_CLIENT_SECRET=
TIKTOK_REDIRECT_URI=https://zlinebot.zeaz.dev/auth/tiktok/callback

STRIPE_SECRET=
STRIPE_PRICE_PRO=
STRIPE_WEBHOOK_SECRET=

APP_URL=https://zlinebot.zeaz.dev
`;

fs.writeFileSync(envPath, `${env.trim()}\n`, { mode: 0o600 });
fs.chmodSync(envPath, 0o600);

console.log(`✅ Secure .env generated at ${envPath}`);
