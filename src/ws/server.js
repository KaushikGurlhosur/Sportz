import { WebSocket, WebSocketServer } from "ws";
import { wsArcjet } from "../arcjet.js";

function sendJson(socket, payload) {
  if (socket.readyState !== WebSocket.OPEN) return;

  socket.send(JSON.stringify(payload));
}

function broadcast(wss, payload) {
  const message = JSON.stringify(payload);

  for (const client of wss.clients) {
    if (client.readyState !== WebSocket.OPEN) continue;

    client.send(message);
  }
}

export function attachWebSocketServer(server) {
  const wss = new WebSocketServer({
    server,
    path: "/ws", // Only accepts connections on /ws path
    maxPayload: 1024 * 1024, // Limit payload to 1MB
  });

  wss.on("connection", async (socket, req) => {
    if (wsArcjet) {
      try {
        const decision = await wsArcjet.protect(req);

        if (decision.isDenied()) {
          const code = decision.reason.isRateLimit() ? 1013 : 1008; // 1013: Try Again Later, 1008: Policy Violation
          const reason = decision.reason.isRateLimit()
            ? "Rate limit exceeded"
            : "Access denied";

          socket.close(code, reason);
        }
      } catch (error) {
        console.error("Arcjet WebSocket protection error: ", error);
        socket.close(code, reason);
        return;
      }
    }

    socket.isAlive = true;

    socket.on("pong", () => {
      socket.isAlive = true; // Mark connection as alive on pong
    });

    sendJson(socket, { type: "welcome" });

    socket.on("error", console.error);
  });

  const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) {
        return ws.terminate(); // Terminate dead connections
      }

      ws.isAlive = false; // Mark connection as potentially dead
      ws.ping(); // Send ping to check if connection is alive
    });
  }, 30000); // Check every 30 seconds

  wss.on("close", () => clearInterval(interval)); // Clean up interval on server close

  function broadcastMatchCreated(match) {
    broadcast(wss, { type: "match_created", data: match });
  }

  return { broadcastMatchCreated };
}
