import { Router, Request, Response } from "express";
import { ALL_AGENT_DIDS, didToAgentType } from "../config";
import { getAgentConfig, getAllocation } from "../lib/contracts";
import { recentDecisions } from "../lib/mongo";
import { reputationHistory, arbHistory, lpHistory } from "../lib/goldsky";

const router = Router();

router.get("/agents", async (_req: Request, res: Response) => {
  try {
    const agents = await Promise.all(
      ALL_AGENT_DIDS().map(async (a) => {
        const cfg = await getAgentConfig(a.did);
        const alloc = await getAllocation(a.did);
        const recent = await recentDecisions(1, a.did).catch(() => []);
        const last = recent[0];
        return {
          did: a.did,
          agentType: a.type,
          reputation: Number(cfg.reputationScore),
          allocationBps: Number(cfg.currentAllocationBps),
          allocationUsd: Number(alloc) / 1e6,
          isActive: cfg.isActive,
          status: last ? "ACTIVE" : "IDLE",
          lastAction: last
            ? {
                type: last.action,
                timestamp: last.timestamp,
                txHash: last.txHash,
                profit: last.netPnL ?? null,
              }
            : null,
        };
      })
    );
    res.json({ agents });
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

router.get("/agents/:did", async (req: Request, res: Response) => {
  try {
    const did = req.params.did;
    const cfg = await getAgentConfig(did);
    const alloc = await getAllocation(did);

    const [reputation, arb, lp, history] = await Promise.all([
      reputationHistory(did),
      arbHistory(did),
      lpHistory(did),
      recentDecisions(50, did).catch(() => []),
    ]);

    res.json({
      did,
      agentType: didToAgentType(did),
      reputation: Number(cfg.reputationScore),
      allocationBps: Number(cfg.currentAllocationBps),
      allocationUsd: Number(alloc) / 1e6,
      isActive: cfg.isActive,
      reputationHistory: reputation,
      arbHistory: arb,
      lpHistory: lp,
      decisionHistory: history,
    });
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

export default router;
