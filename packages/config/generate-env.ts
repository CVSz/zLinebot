import crypto from "crypto";
import fs from "fs";

function generateSecret(length = 64) {
  return crypto.randomBytes(length).toString("hex");
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

APP_URL=https://zlinebot.zeaz.dev
`;

fs.writeFileSync(".env", env.trim());

console.log("✅ Secure .env generated");
