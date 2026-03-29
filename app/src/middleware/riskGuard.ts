import type { NextFunction, Request, Response } from "express";

type RiskRequest = Request & { riskScore?: number };

export function riskGuard(req: RiskRequest, res: Response, next: NextFunction): void {
  if ((req.riskScore ?? 0) > 0.8) {
    res.status(403).send("High risk blocked");
    return;
  }
  next();
}
