import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";
import { log } from "./vite";

let wss: WebSocketServer;

export function setupWebSocket(server: Server) {
  wss = new WebSocketServer({ server, path: "/ws" });
  wss.on("connection", (ws) => {
    ws.on("error", () => {});
  });
  log("WebSocket server ready");
}

export function broadcast(queryKey: string) {
  if (!wss) return;
  const msg = JSON.stringify({ type: "invalidate", queryKey });
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  });
}
