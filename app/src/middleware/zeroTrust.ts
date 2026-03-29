import crypto from "crypto";
import type { NextFunction, Request, Response } from "express";

export function verify(req: Request, res: Response, next: NextFunction): void {
  const sig = req.headers["x-signature"];
  const signature = Array.isArray(sig) ? sig[0] : sig;
  const body = JSON.stringify(req.body);

  const secret = process.env.API_SECRET;
  if (!secret) {
    res.status(500).send("API secret is not configured");
    return;
  }

  const h = crypto.createHmac("sha256", secret).update(body).digest("hex");

  if (signature !== h) {
    res.status(401).send("Unauthorized");
    return;
  }

  next();
}
