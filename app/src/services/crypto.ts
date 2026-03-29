import crypto from "crypto";

type EncryptedPayload = {
  iv: string;
  data: string;
  tag: string;
};

function getKey() {
  const key = process.env.DATA_KEY;
  if (!key) {
    throw new Error("DATA_KEY is required");
  }

  const keyBuffer = Buffer.from(key, "hex");
  if (keyBuffer.length !== 32) {
    throw new Error("DATA_KEY must be 32 bytes (64 hex chars)");
  }

  return keyBuffer;
}

export function encrypt(text: string): EncryptedPayload {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-gcm", getKey(), iv);
  const enc = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  return {
    iv: iv.toString("hex"),
    data: enc.toString("hex"),
    tag: cipher.getAuthTag().toString("hex")
  };
}

export function decrypt(payload: EncryptedPayload) {
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    getKey(),
    Buffer.from(payload.iv, "hex")
  );

  decipher.setAuthTag(Buffer.from(payload.tag, "hex"));
  const dec = Buffer.concat([
    decipher.update(Buffer.from(payload.data, "hex")),
    decipher.final()
  ]);

  return dec.toString("utf8");
}
