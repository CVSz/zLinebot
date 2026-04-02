import crypto from "crypto";

const key = Buffer.from(process.env.ENCRYPTION_KEY!, "hex");

export function encrypt(text: string) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);

  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
}
