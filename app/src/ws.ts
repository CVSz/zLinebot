import { WebSocketServer } from "ws";
import type WebSocket from "ws";
import type { IncomingMessage } from "http";
import type { Server as HttpServer } from "http";
import { snapshot } from "./services/analytics.js";

export function startWS(server: HttpServer, getTenantIdFromReq: (req: IncomingMessage) => string | undefined) {
  const wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (ws: WebSocket, req: IncomingMessage) => {
    const tenantId = getTenantIdFromReq(req) ?? "demo";

    const interval = setInterval(() => {
      ws.send(
        JSON.stringify({
          type: "metrics",
          data: snapshot(tenantId)
        })
      );
    }, 1000);

    ws.on("close", () => {
      clearInterval(interval);
    });
  });

  return wss;
}
