import WebSocket, { WebSocketServer } from "ws";
import { UsageEvent } from "..";
import logger from "./logger";

export type IBroadcast = (message: UsageEvent) => void;

export function startSocket(port: number): IBroadcast {
  const wss = new WebSocketServer({ port });

  wss.on("listening", () => logger.info("WS_SERVER_STARTED", { port }));

  wss.on("connection", function connection(ws) {
    logger.info("WS_NEW_CONNECTION", { connections: wss.clients.size });
    ws.send(JSON.stringify({ message: "Connection successful" }));

    let timeout: NodeJS.Timeout;
    const heartbeat = () => {
      ws.ping();
      timeout = setTimeout(() => ws.terminate(), 5000);
    };
    const interval = setInterval(heartbeat, 30000);

    ws.on("pong", () => clearTimeout(timeout));
    ws.on("close", () => {
      clearInterval(interval);
      logger.info("WS_CONNECTION_CLOSED", { connections: wss.clients.size });
    });
  });

  return function broadcast(message) {
    wss.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  };
}
