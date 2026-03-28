import type { NextFunction, Request, Response } from "express";
import { env } from "../utils/env.js";

export function tenant(req: Request, res: Response, next: NextFunction) {
  const key = req.header("x-api-key");
  if (!key || key !== env.tenantApiKey) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  return next();
}
