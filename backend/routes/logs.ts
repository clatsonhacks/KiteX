import { Router, Request, Response } from "express";
import { getLogsSince } from "../lib/logger";

const router = Router();

router.get("/logs", (req: Request, res: Response) => {
  const sinceId = Number(req.query.since) || 0;
  const limit = Math.min(200, Number(req.query.limit) || 100);
  res.json({ logs: getLogsSince(sinceId, limit) });
});

export default router;
