import type { NextFunction, Request, Response } from "express";

const bucket = new Map<string, { count: number; ts: number }>();

type RateLimitOptions = {
  windowMs?: number;
  max?: number;
  key?: (req: Request) => string;
};

function buildRateLimit(options: RateLimitOptions = {}) {
  const windowMs = options.windowMs ?? 60_000;
  const max = options.max ?? 120;
  const keyFn = options.key ?? ((req: Request) => req.ip ?? "unknown");

  return (req: Request, res: Response, next: NextFunction) => {
    const key = keyFn(req);
    const now = Date.now();
    const state = bucket.get(key);

    if (!state || now - state.ts > windowMs) {
      bucket.set(key, { count: 1, ts: now });
      return next();
    }

    if (state.count >= max) {
      return res.status(429).json({ error: "Too many requests" });
    }

    state.count += 1;
    return next();
  };
}

export const rateLimit = buildRateLimit();

export function routeRateLimit(options: RateLimitOptions = {}) {
  return buildRateLimit(options);
}

export function rateLimitByIp(max: number, windowMs = 60_000) {
  return buildRateLimit({ max, windowMs });
}
