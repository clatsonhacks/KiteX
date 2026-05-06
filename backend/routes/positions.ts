import { Router, Request, Response } from "express";
import { config } from "../config";
import {
  getPoolState,
  getPosition,
  getPositionsForOwner,
  sqrtPriceX96ToPrice,
} from "../lib/algebra";
import { lpHistory } from "../lib/goldsky";
import { PAIR } from "../orchestrator/liquidityAgent";

const router = Router();

router.get("/positions", async (_req: Request, res: Response) => {
  try {
    const poolState = await getPoolState(config.algebraPoolAddress);
    const currentPrice = sqrtPriceX96ToPrice(
      poolState.sqrtPriceX96,
      PAIR.decimals0,
      PAIR.decimals1
    );

    let active: Array<Record<string, any>> = [];
    try {
      const tokenIds = await getPositionsForOwner(config.capitalRouterAddress);
      active = await Promise.all(
        tokenIds.map(async (tokenId) => {
          const p = await getPosition(tokenId);
          const inRange =
            poolState.tick >= p.tickLower && poolState.tick <= p.tickUpper;
          return {
            tokenId: tokenId.toString(),
            token0: p.token0,
            token1: p.token1,
            tickLower: p.tickLower,
            tickUpper: p.tickUpper,
            liquidity: p.liquidity.toString(),
            tokensOwed0: p.tokensOwed0.toString(),
            tokensOwed1: p.tokensOwed1.toString(),
            inRange,
            currentTick: poolState.tick,
          };
        })
      );
    } catch (e) {
      console.warn("[positions] read failed:", (e as Error).message);
    }

    const historical = await lpHistory(config.liquidityAgentDID);

    res.json({
      pool: {
        address: config.algebraPoolAddress,
        currentTick: poolState.tick,
        currentPrice,
        liquidity: poolState.liquidity.toString(),
      },
      active,
      historical,
    });
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

export default router;
