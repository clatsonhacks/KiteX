import { Router, Request, Response } from "express";
import { config, ALL_AGENT_DIDS, didToAgentType } from "../config";
import {
  getAgentConfig,
  getTreasuryBalance,
  getAllocation,
} from "../lib/contracts";
import { recentDecisions } from "../lib/mongo";

const router = Router();

router.get("/dashboard", async (_req: Request, res: Response) => {
  try {
    const treasuryRaw = await getTreasuryBalance();
    const treasuryUsd = Number(treasuryRaw) / 1e6;

    const agents = await Promise.all(
      ALL_AGENT_DIDS().map(async (a) => {
        const cfg = await getAgentConfig(a.did);
        const alloc = await getAllocation(a.did);
        return {
          did: a.did,
          agentType: a.type,
          reputation: Number(cfg.reputationScore),
          allocationBps: Number(cfg.currentAllocationBps),
          allocationUsd: Number(alloc) / 1e6,
          isActive: cfg.isActive,
        };
      })
    );

    const recent = await recentDecisions(20).catch(() => []);

    const todayUnix = Date.now() - 24 * 60 * 60 * 1000;
    const todayDecisions = recent.filter((d) => d.timestamp >= todayUnix);
    const arbProfitToday = todayDecisions
      .filter((d) => d.action === "ARB_EXECUTED")
      .reduce((sum, d) => sum + (d.netPnL ?? 0), 0);
    const lpFeesToday = 0; // populated once Algebra position read is wired
    const netPnLToday = todayDecisions.reduce((sum, d) => sum + (d.netPnL ?? 0), 0);

    res.json({
      treasury: { usd: treasuryUsd },
      stats: {
        treasuryUsd,
        feesEarnedTodayUsd: lpFeesToday,
        arbProfitTodayUsd: arbProfitToday,
        netPnLTodayUsd: netPnLToday,
      },
      agents,
      recentEvents: recent.map((d) => ({
        timestamp: d.timestamp,
        agent: didToAgentType(d.agentDID),
        agentDID: d.agentDID,
        action: d.action,
        amountUsd: d.inputAmount ?? 0,
        profitUsd: d.netPnL ?? null,
        txHash: d.txHash,
      })),
      pool: {
        address: config.algebraPoolAddress,
        chainId: config.chainId,
      },
    });
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

export default router;
