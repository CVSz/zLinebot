import type { NextFunction, Request, Response } from "express";

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction): void {
  // eslint-disable-next-line no-console
  console.error("unhandled error", error);

  if (res.headersSent) {
    return;
  }

  res.status(500).json({ error: "Internal server error" });
}
