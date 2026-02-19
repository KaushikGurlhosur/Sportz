import { Router } from "express";

export const matchRouter = Router();

matchRouter.get("/", (req, res, next) => {
  res.status(200).json({ message: "Matches List" });
});
