import { Router } from "express";
import { createMatchSchema } from "../validation/matches";

export const matchRouter = Router();

matchRouter.get("/", (req, res, next) => {
  res.status(200).json({ message: "Matches List" });
});

matchRouter.post("/", (req, res, next) => {
  const parsed = createMatchSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid payload.",
      details: JSON.stringify(parsed.error),
    });
  }

  try {
  } catch (error) {
    res.status(500).json({
      error: "Failed to create match.",
      details: JSON.stringify(error),
    });
  }
});
