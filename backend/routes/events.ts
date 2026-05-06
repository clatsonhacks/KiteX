import { Router, Request, Response } from "express";
import { latestEvents } from "../lib/goldsky";

const router = Router();

router.get("/events", async (req: Request, res: Response) => {
  try {
    const since = req.query.since ? Number(req.query.since) : 0;
    const events = await latestEvents(since);
    res.json({ events });
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

export default router;
