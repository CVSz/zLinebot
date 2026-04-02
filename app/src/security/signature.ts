import crypto from "crypto";

function timingSafeEqualStrings(a: Buffer, b: Buffer): boolean {
  if (a.length !== b.length) {
    return false;
  }

  return crypto.timingSafeEqual(a, b);
}

export function verifyLineSignature(options: {
  requestBody: string;
  secret: string;
  signature: string;
}): boolean {
  try {
    const expected = crypto.createHmac("sha256", options.secret).update(options.requestBody).digest("base64");
    const expectedBuffer = Buffer.from(expected, "base64");
    const signatureBuffer = Buffer.from(options.signature, "base64");
    return timingSafeEqualStrings(expectedBuffer, signatureBuffer);
  } catch {
    return false;
  }
}

export function verifyTikTokSignature(options: {
  requestBody: string;
  secret: string;
  signature: string;
  timestamp: string;
  maxAgeSeconds?: number;
}): boolean {
  try {
    const timestampSeconds = Number(options.timestamp);
    if (!Number.isFinite(timestampSeconds)) {
      return false;
    }

    const maxAgeSeconds = options.maxAgeSeconds ?? 300;
    const nowSeconds = Math.floor(Date.now() / 1000);
    if (Math.abs(nowSeconds - timestampSeconds) > maxAgeSeconds) {
      return false;
    }

    const expected = crypto
      .createHmac("sha256", options.secret)
      .update(`${options.timestamp}.${options.requestBody}`)
      .digest("hex");

    const expectedBuffer = Buffer.from(expected, "hex");
    const signatureBuffer = Buffer.from(options.signature, "hex");
    return timingSafeEqualStrings(expectedBuffer, signatureBuffer);
  } catch {
    return false;
  }
}
