import crypto from "crypto";
import express, { Router } from "express";
import type { LineReplyMessage } from "./handler.js";
import { handleMessage } from "./handler.js";

type LineTextMessageEvent = {
  type: "message";
  replyToken: string;
  source?: { userId?: string };
  message: {
    type: "text";
    text: string;
  };
};

type LineWebhookBody = {
  events?: LineTextMessageEvent[];
};

type RawRequest = {
  rawBody?: string;
};

const lineApiReplyEndpoint = "https://api.line.me/v2/bot/message/reply";

export const webhookRouter = Router();

webhookRouter.post(
  "/webhook",
  express.json({
    verify: (req, _res, buf) => {
      (req as RawRequest).rawBody = buf.toString("utf8");
    }
  }),
  async (req, res) => {
    const channelSecret = process.env.LINE_CHANNEL_SECRET;
    const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
    const signature = req.header("x-line-signature");

    if (!channelSecret || !channelAccessToken) {
      return res.status(500).json({ error: "line credentials are not configured" });
    }

    if (!signature) {
      return res.status(401).send("missing signature");
    }

    const rawBody = (req as RawRequest).rawBody ?? JSON.stringify(req.body);
    const hash = crypto.createHmac("sha256", channelSecret).update(rawBody).digest("base64");

    if (!isValidLineSignature(hash, signature)) {
      return res.status(401).send("invalid signature");
    }

    const body = (req.body ?? {}) as LineWebhookBody;
    const events = body.events ?? [];

    res.sendStatus(200);

    void Promise.all(events.map((event) => handleEvent(event, channelAccessToken))).catch((error) => {
      // eslint-disable-next-line no-console
      console.error("line webhook processing failed", error);
    });
  }
);

async function handleEvent(event: LineTextMessageEvent, channelAccessToken: string) {
  if (event.type !== "message" || event.message.type !== "text") {
    return;
  }

  const tenantId = "demo";
  const userId = event.source?.userId ?? "anonymous";

  const messages = await withTimeout<LineReplyMessage[]>(
    handleMessage(event.message.text, tenantId, userId),
    800,
    [{ type: "text", text: "ระบบกำลังประมวลผลอยู่ กรุณาลองใหม่อีกครั้งครับ" }]
  );

  const response = await fetch(lineApiReplyEndpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${channelAccessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      replyToken: event.replyToken,
      messages: messages.slice(0, 5)
    })
  });

  if (!response.ok) {
    const responseBody = await response.text();
    throw new Error(`line reply failed: ${response.status} ${responseBody}`);
  }
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, fallback: T): Promise<T> {
  let timeoutHandle: NodeJS.Timeout | undefined;

  const timeoutPromise = new Promise<T>((resolve) => {
    timeoutHandle = setTimeout(() => resolve(fallback), timeoutMs);
  });

  const result = await Promise.race([promise, timeoutPromise]);
  if (timeoutHandle) {
    clearTimeout(timeoutHandle);
  }

  return result;
}

function isValidLineSignature(computedHash: string, signature: string): boolean {
  try {
    const computedBuffer = Buffer.from(computedHash, "base64");
    const signatureBuffer = Buffer.from(signature, "base64");

    if (computedBuffer.length !== signatureBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(computedBuffer, signatureBuffer);
  } catch {
    return false;
  }
}
