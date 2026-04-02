import express, { Router } from "express";
import { routeRateLimit } from "../middleware/rateLimit.js";
import { env } from "../utils/env.js";
import {
  buildAuthorizationUrl,
  createState,
  exchangeCodeForToken,
  fetchUserInfo,
  verifyWebhookSignature
} from "../services/tiktok.js";

type RawRequest = {
  rawBody?: string;
};

type TikTokWebhookBody = {
  challenge?: string;
  event?: string;
  type?: string;
  data?: unknown;
};

export const tiktokRouter = Router();
tiktokRouter.use(routeRateLimit({ max: 45, windowMs: 60_000 }));

const rawBodyJson = express.json({
  verify: (req, _res, buf) => {
    (req as RawRequest).rawBody = buf.toString("utf8");
  }
});

tiktokRouter.get("/auth/tiktok/url", (req, res) => {
  if (!env.tiktokClientKey || !env.tiktokRedirectUri) {
    return res.status(500).json({ error: "tiktok oauth is not configured" });
  }

  const state = createState();
  const scope = typeof req.query.scope === "string" ? req.query.scope : env.tiktokScope;

  const authorizeUrl = buildAuthorizationUrl({
    clientKey: env.tiktokClientKey,
    redirectUri: env.tiktokRedirectUri,
    scope,
    state
  });

  return res.status(200).json({
    state,
    authorizeUrl
  });
});

tiktokRouter.get("/auth/tiktok/callback", async (req, res) => {
  if (!env.tiktokClientKey || !env.tiktokClientSecret || !env.tiktokRedirectUri) {
    return res.status(500).json({ error: "tiktok oauth is not configured" });
  }

  const code = typeof req.query.code === "string" ? req.query.code : "";

  if (!code) {
    return res.status(400).json({ error: "missing code" });
  }

  try {
    const token = await exchangeCodeForToken({
      clientKey: env.tiktokClientKey,
      clientSecret: env.tiktokClientSecret,
      code,
      redirectUri: env.tiktokRedirectUri
    });

    const user = await fetchUserInfo(token.access_token);

    return res.status(200).json({
      token,
      user
    });
  } catch (error) {
    return res.status(400).json({
      error: error instanceof Error ? error.message : "tiktok oauth callback failed"
    });
  }
});

tiktokRouter.post("/webhook/tiktok", rawBodyJson, async (req, res) => {
  if (!env.tiktokWebhookSecret) {
    return res.status(500).json({ error: "tiktok webhook secret is not configured" });
  }

  const signatureHeader = req.header("x-tiktok-signature") ?? req.header("tiktok-signature");
  const timestampHeader = req.header("x-tiktok-timestamp") ?? req.header("tiktok-timestamp");

  if (!signatureHeader || !timestampHeader) {
    return res.status(401).json({ error: "missing signature headers" });
  }

  const rawBody = (req as RawRequest).rawBody ?? JSON.stringify(req.body ?? {});
  const verified = verifyWebhookSignature({
    requestBody: rawBody,
    secret: env.tiktokWebhookSecret,
    signature: signatureHeader,
    timestamp: timestampHeader
  });

  if (!verified) {
    return res.status(401).json({ error: "invalid tiktok signature" });
  }

  const body = (req.body ?? {}) as TikTokWebhookBody;

  if (typeof body.challenge === "string" && body.challenge.length > 0) {
    return res.status(200).json({ challenge: body.challenge });
  }

  // eslint-disable-next-line no-console
  console.log("tiktok webhook event", {
    event: body.event ?? body.type ?? "unknown",
    data: body.data ?? null
  });

  return res.sendStatus(200);
});
