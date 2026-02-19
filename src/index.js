import express from "express";
import { matchRouter } from "./routes/matches.js";

const app = express();

const PORT = 8000;

app.use(express.json()); // Middleware to parse JSON bodies

app.get("/", (req, res) => {
  res.send("Hello from express server!");
});

app.use("/matches", matchRouter);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
