import crypto from "crypto";
import { env } from "../utils/env.js";

function loadEncryptionKey(): Buffer {
  if (!env.encryptionKey) {
    throw new Error("ENCRYPTION_KEY is required");
  }

  const key = Buffer.from(env.encryptionKey, "hex");
  if (key.length !== 32) {
    throw new Error("ENCRYPTION_KEY must be 64 hex chars (32 bytes)");
  }

  return key;
}

export function encrypt(text: string): string {
  const key = loadEncryptionKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);

  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
}
