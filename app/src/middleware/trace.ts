import { randomUUID } from "crypto";
import type { NextFunction, Request, Response } from "express";

export type TraceRequest = Request & { traceId?: string };

export function trace(req: TraceRequest, res: Response, next: NextFunction): void {
  const incoming = req.header("x-trace-id");
  req.traceId = incoming ?? randomUUID();
  res.setHeader("x-trace-id", req.traceId);
  next();
}
