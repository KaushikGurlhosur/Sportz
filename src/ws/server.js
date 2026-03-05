import { WebSocket, WebSocketServer } from "ws";

function sendJson(socket, payload) {
  if (socket.readyState !== WebSocket.OPEN) return;

  socket.send(JSON.stringify(payload));
}

function broadcast(wss, payload) {
  const message = JSON.stringify(payload);

  for (const client of wss.clients) {
    if (client.readyState !== WebSocket.OPEN) return;

    client.send(message);
  }
}

export function attachWebSocketServer(server) {
  const wss = new WebSocketServer({
    server,
    path: "/ws", // Only accepts connections on /ws path
    maxPayload: 1024 * 1024, // Limit payload to 1MB
  });

  wss.on("connection", (socket) => {
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
