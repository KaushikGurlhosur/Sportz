import express from "express";
import { matchRouter } from "./routes/matches.js";
import http from "http";
import { attachWebSocketServer } from "./ws/server.js";

const app = express();

const PORT = Number(process.env.PORT || 8000);
const HOST = process.env.HOST || "0.0.0.0";

const server = http.createServer(app); // Create HTTP server for WebSocket integration

app.use(express.json()); // Middleware to parse JSON bodies

app.get("/", (req, res) => {
  res.send("Hello from express server!");
});

app.use("/matches", matchRouter);

const { broadcastMatchCreated } = attachWebSocketServer(server); // Attach WebSocket server to the HTTP server

app.locals.broadcastMatchCreated = broadcastMatchCreated; // Make the broadcast function available in route handlers

server.listen(PORT, HOST, () => {
  const baseUrl =
    HOST === "0.0.0.0" ? `http://localhost:${PORT}` : `http://${HOST}:${PORT}`;
  console.log(`Server is running on ${baseUrl}`);
  console.log(`WebSocket is running on ${baseUrl.replace("http", "ws")}/ws`);
});
