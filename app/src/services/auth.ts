import crypto from "crypto";

type JwtPayload = Record<string, unknown> & { exp?: number };

type RequestUser = { role?: string };

export function sign(user: Record<string, unknown>): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is required");
  }

  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({ ...user, exp: Math.floor(Date.now() / 1000) + 60 * 60 })
  ).toString("base64url");
  const signature = crypto.createHmac("sha256", secret).update(`${header}.${payload}`).digest("base64url");
  return `${header}.${payload}.${signature}`;
}

export function verifyToken(token: string): JwtPayload {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is required");
  }

  const [header, payload, signature] = token.split(".");
  if (!header || !payload || !signature) {
    throw new Error("Invalid token format");
  }

  const expected = crypto.createHmac("sha256", secret).update(`${header}.${payload}`).digest("base64url");
  if (signature !== expected) {
    throw new Error("Invalid token signature");
  }

  const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as JwtPayload;
  if ((decoded.exp ?? 0) < Math.floor(Date.now() / 1000)) {
    throw new Error("Token expired");
  }
  return decoded;
}

export function authorize(role: string) {
  return (req: { user?: RequestUser }, res: { sendStatus: (code: number) => void }, next: () => void): void => {
    if (req.user?.role !== role) {
      res.sendStatus(403);
      return;
    }
    next();
  };
}
