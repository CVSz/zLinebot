import express, { Router } from "express";
import type { LineReplyMessage } from "./handler.js";
import { handleMessage, handlePostback } from "./handler.js";
import { env } from "../utils/env.js";
import { verifyLineSignature } from "../security/signature.js";

type LineTextMessageEvent = {
  type: "message";
  replyToken: string;
  source?: { userId?: string };
  message: {
    type: "text";
    text: string;
  };
};

type LinePostbackEvent = {
  type: "postback";
  replyToken: string;
  source?: { userId?: string };
  postback: { data: string };
};

type LineWebhookEvent = LineTextMessageEvent | LinePostbackEvent;

type LineWebhookBody = {
  events?: LineWebhookEvent[];
};

type RawRequest = {
  rawBody?: string;
};

const lineApiReplyEndpoint = "https://api.line.me/v2/bot/message/reply";
const defaultTimeoutReply: LineReplyMessage[] = [{ type: "text", text: "System is processing your request. Please retry shortly." }];

export const webhookRouter = Router();

webhookRouter.post(
  "/line",
  express.json({
    verify: (req, _res, buf) => {
      (req as RawRequest).rawBody = buf.toString("utf8");
    }
  }),
  async (req, res) => {
    if (!env.lineChannelSecret || !env.lineChannelAccessToken) {
      return res.status(500).json({ error: "line credentials are not configured" });
    }

    const signature = req.header("x-line-signature");

    if (!signature) {
      return res.status(401).send("missing signature");
    }

    const rawBody = (req as RawRequest).rawBody ?? JSON.stringify(req.body);

    if (
      !verifyLineSignature({
        requestBody: rawBody,
        secret: env.lineChannelSecret,
        signature
      })
    ) {
      return res.status(401).send("invalid signature");
    }

    const body = (req.body ?? {}) as LineWebhookBody;
    const events = body.events ?? [];

    res.sendStatus(200);

    const token = env.lineChannelAccessToken;

    void Promise.all(events.map((event) => handleEvent(event, token))).catch((error) => {
      // eslint-disable-next-line no-console
      console.error("line webhook processing failed", error);
    });
  }
);

async function handleEvent(event: LineWebhookEvent, channelAccessToken: string) {
  const tenantId = env.lineDefaultTenantId;
  const userId = event.source?.userId ?? "anonymous";

  if (event.type === "message" && event.message.type === "text") {
    const messages = await withTimeout<LineReplyMessage[]>(
      handleMessage(event.message.text, tenantId, userId),
      800,
      defaultTimeoutReply
    );
    await sendReply(event.replyToken, messages, channelAccessToken);
    return;
  }

  if (event.type === "postback") {
    const messages = await withTimeout<LineReplyMessage[]>(
      handlePostback(event.postback.data, tenantId, userId),
      800,
      defaultTimeoutReply
    );
    await sendReply(event.replyToken, messages, channelAccessToken);
  }
}

async function sendReply(replyToken: string, messages: LineReplyMessage[], channelAccessToken: string): Promise<void> {
  const response = await fetch(lineApiReplyEndpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${channelAccessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      replyToken,
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
