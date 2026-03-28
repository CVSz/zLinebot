import type { NextFunction, Request, Response } from "express";

const bucket = new Map<string, { count: number; ts: number }>();

export function rateLimit(req: Request, res: Response, next: NextFunction) {
  const key = req.ip ?? "unknown";
  const now = Date.now();
  const windowMs = 60_000;
  const max = 120;
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
}
