import crypto from "crypto";

function requireSalt() {
  const salt = process.env.PII_SALT;
  if (!salt) {
    throw new Error("PII_SALT is required");
  }
  return salt;
}

export function pseudo(id: string) {
  return crypto.createHmac("sha256", requireSalt()).update(id).digest("hex");
}

export function anonymizeEmail(email: string) {
  const [localPart, domain = ""] = email.split("@");
  const hidden = localPart.length <= 2 ? "**" : `${localPart.slice(0, 2)}***`;
  return `${hidden}@${domain}`;
}
