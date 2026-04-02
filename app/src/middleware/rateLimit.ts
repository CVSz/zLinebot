import type { RequestHandler } from "express";
import { rateLimit as expressRateLimit } from "express-rate-limit";

type RateLimitOptions = {
  windowMs?: number;
  max?: number;
  key?: (ip: string) => string;
};

function buildRateLimit(options: RateLimitOptions = {}) {
  const windowMs = options.windowMs ?? 60_000;
  const max = options.max ?? 120;
  const keyFn = options.key ?? ((ip: string) => ip);

  return expressRateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => keyFn(req.ip ?? "unknown")
  });
}

export const rateLimit = buildRateLimit();

export function routeRateLimit(options: RateLimitOptions = {}): RequestHandler {
  return buildRateLimit(options);
}

export function rateLimitByIp(max: number, windowMs = 60_000): RequestHandler {
  return buildRateLimit({ max, windowMs });
}
