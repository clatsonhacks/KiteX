import { config } from "../config";
import { getPoolState, sqrtPriceX96ToPrice } from "../lib/algebra";
import {
  getAgentConfig,
  getTreasuryBalance,
} from "../lib/contracts";
import { recordCycleState, nextCycleNumber } from "../lib/mongo";
import {
  decideLiquidityAction,
  estimateRebalanceUplift,
  recordLPRebalance,
  PAIR,
  PoolSnapshot,
  LiquidityAgentState,
} from "./liquidityAgent";
import {
  decideArbAction,
  recordArbExecution,
  recordArbFailure,
} from "./arbitrageAgent";
import {
  decideRiskAction,
  recordHedgeIntent,
  recordRebalanceSignal,
  CompositionDelta,
} from "./riskAgent";

export interface CycleSummary {
  cycleNumber: number;
  poolPrice: number;
  poolTick: number;
  decisions: Array<{
    agent: "Liquidity" | "Arbitrage" | "Risk";
    action: string;
    reason?: string;
    txHash?: string;
  }>;
  durationMs: number;
}

const STATE: { liquidity: LiquidityAgentState } = {
  liquidity: {
    hasActivePosition: false,
    tickLower: null,
    tickUpper: null,
    lastRebalanceUnix: 0,
  },
};

function priceFromSnapshot(p: PoolSnapshot): number {
  return sqrtPriceX96ToPrice(p.sqrtPriceX96, PAIR.decimals0, PAIR.decimals1);
}

/**
 * Approximates the LP's current composition delta from pool state.
 * In a single LP position centred on opening price, drift in pool tick away from the
 * centre tick implies one side has been bought out of the position. We use distance
 * from centre tick as a first-order proxy for delta exposure.
 */
function approximateCompositionDelta(
  pool: PoolSnapshot,
  state: LiquidityAgentState,
  treasuryUsd: number
): CompositionDelta {
  if (
    !state.hasActivePosition ||
    state.tickLower === null ||
    state.tickUpper === null ||
    treasuryUsd <= 0
  ) {
    return { deltaUsd: 0, positionValueUsd: 0 };
  }
  const center = (state.tickLower + state.tickUpper) / 2;
  const halfRange = (state.tickUpper - state.tickLower) / 2;
  const drift = (pool.tick - center) / Math.max(1, halfRange);
  const positionValueUsd = treasuryUsd * 0.5; // LiquidityAgent's nominal share
  // Sign convention: positive drift => price up => LP holding more USDC.e (short WKITE).
  const deltaUsd = -drift * positionValueUsd * 0.5;
  return { deltaUsd, positionValueUsd };
}

/**
 * Runs one full orchestrator cycle: read state, run all three agents, log decisions.
 * Returns a summary that can be inspected by tests or the demo page.
 */
export async function runCycle(opts?: { dryRun?: boolean }): Promise<CycleSummary> {
  const start = Date.now();
  const cycleNumber = await nextCycleNumber().catch(() => 0);

  // 1. Read pool + treasury + agent reputations
  const pool = await getPoolState(config.algebraPoolAddress);
  const poolPrice = priceFromSnapshot(pool);
  const treasuryRaw = await getTreasuryBalance().catch(() => 0n);
  const treasuryUsd = Number(treasuryRaw) / 1e6;

  const [liqCfg, arbCfg, riskCfg] = await Promise.all([
    getAgentConfig(config.liquidityAgentDID),
    getAgentConfig(config.arbAgentDID),
    getAgentConfig(config.riskAgentDID),
  ]);

  const decisions: CycleSummary["decisions"] = [];
  const nowUnix = Math.floor(Date.now() / 1000);

  // 2. LiquidityAgent
  const liqAction = decideLiquidityAction(pool, STATE.liquidity, nowUnix);
  decisions.push({
    agent: "Liquidity",
    action: liqAction.kind,
    reason: liqAction.kind === "SKIP" ? liqAction.reason : undefined,
  });

  if (liqAction.kind === "OPEN" && !opts?.dryRun) {
    STATE.liquidity = {
      hasActivePosition: true,
      tickLower: liqAction.tickLower,
      tickUpper: liqAction.tickUpper,
      lastRebalanceUnix: nowUnix,
    };
  } else if (liqAction.kind === "REBALANCE" && !opts?.dryRun) {
    const uplift = await estimateRebalanceUplift();
    try {
      const txHash = await recordLPRebalance({
        reputationBefore: Number(liqCfg.reputationScore),
        oldTickLower: liqAction.oldTickLower,
        oldTickUpper: liqAction.oldTickUpper,
        newTickLower: liqAction.newTickLower,
        newTickUpper: liqAction.newTickUpper,
        feesUpliftUsd: uplift,
        gasCostUsd: 0.005,
        txHash: "",
      });
      STATE.liquidity = {
        hasActivePosition: true,
        tickLower: liqAction.newTickLower,
        tickUpper: liqAction.newTickUpper,
        lastRebalanceUnix: nowUnix,
      };
      decisions[decisions.length - 1].txHash = txHash;
    } catch (e) {
      console.warn("[orchestrator] LP rebalance record failed:", (e as Error).message);
    }
  }

  // 3. ArbitrageAgent
  const arbAllocationUsd = Number(arbCfg.currentAllocationBps) / 10000 * treasuryUsd;
  const swapAmountUsd = Math.max(1, arbAllocationUsd * 0.1); // size each arb at 10% of allocation
  const arbAction = await decideArbAction(pool, swapAmountUsd);
  decisions.push({
    agent: "Arbitrage",
    action: arbAction.kind,
    reason: arbAction.kind === "SKIP" ? arbAction.reason : undefined,
  });

  if (arbAction.kind === "EXECUTE" && !opts?.dryRun) {
    try {
      // The actual SwapRouter call is performed via session key (lib/sessionKey.ts).
      // For now we record the expected outcome — when the AA SDK is wired we replace
      // this block with the real swap and use the actual amountOut.
      const txHash = await recordArbExecution({
        reputationBefore: Number(arbCfg.reputationScore),
        tokenIn: arbAction.tokenIn,
        tokenOut: arbAction.tokenOut,
        amountInUsd: swapAmountUsd,
        amountOutUsd: swapAmountUsd + arbAction.expectedProfitUsd,
        gasCostUsd: 0.002,
        txHash: "",
      });
      decisions[decisions.length - 1].txHash = txHash;
    } catch (e) {
      console.warn("[orchestrator] arb execution record failed:", (e as Error).message);
      try {
        await recordArbFailure({
          reputationBefore: Number(arbCfg.reputationScore),
          reason: (e as Error).message,
          tokenIn: arbAction.tokenIn,
          tokenOut: arbAction.tokenOut,
          amountInUsd: swapAmountUsd,
          gasCostUsd: 0.002,
          txHash: "",
        });
      } catch {}
    }
  }

  // 4. RiskAgent
  const composition = approximateCompositionDelta(pool, STATE.liquidity, treasuryUsd);
  const rebalanceAvailable = STATE.liquidity.hasActivePosition;
  const rebalanceCostEfficient = treasuryUsd > 5; // avoid burning gas on tiny positions
  const riskAction = await decideRiskAction(
    composition,
    rebalanceAvailable,
    rebalanceCostEfficient
  );
  decisions.push({
    agent: "Risk",
    action: riskAction.kind,
    reason: riskAction.kind === "SKIP" ? riskAction.reason : undefined,
  });

  if (riskAction.kind === "LOG_HEDGE" && !opts?.dryRun) {
    try {
      const txHash = await recordHedgeIntent({
        reputationBefore: Number(riskCfg.reputationScore),
        exposureBefore: composition.deltaUsd,
        exposureAfter: composition.deltaUsd, // unchanged because we only logged intent
        deltaBps: riskAction.deltaBps,
        direction: riskAction.direction,
      });
      decisions[decisions.length - 1].txHash = txHash;
    } catch (e) {
      console.warn("[orchestrator] hedge intent failed:", (e as Error).message);
    }
  } else if (riskAction.kind === "SIGNAL_REBALANCE" && !opts?.dryRun) {
    try {
      const txHash = await recordRebalanceSignal({
        reputationBefore: Number(riskCfg.reputationScore),
        exposureBefore: composition.deltaUsd,
        exposureAfter: composition.deltaUsd / 2, // assume rebalance halves exposure
        txHash: "",
      });
      decisions[decisions.length - 1].txHash = txHash;
    } catch (e) {
      console.warn("[orchestrator] rebalance signal failed:", (e as Error).message);
    }
  }

  // 5. Persist cycle state
  try {
    await recordCycleState({
      cycleNumber,
      poolPrice,
      poolTick: pool.tick,
      activeLPTokenId: null,
      positionTickLower: STATE.liquidity.tickLower,
      positionTickUpper: STATE.liquidity.tickUpper,
      deltaExposure: composition.deltaUsd,
      lastUpdated: Date.now(),
    });
  } catch {}

  return {
    cycleNumber,
    poolPrice,
    poolTick: pool.tick,
    decisions,
    durationMs: Date.now() - start,
  };
}

let timer: NodeJS.Timeout | null = null;
let running = false;

export function startOrchestrator(): void {
  if (timer) return;
  const tick = async () => {
    if (running) return;
    running = true;
    try {
      const summary = await runCycle();
      console.log(
        `[cycle ${summary.cycleNumber}] price=${summary.poolPrice.toFixed(6)} tick=${summary.poolTick} ` +
          summary.decisions.map((d) => `${d.agent}:${d.action}`).join(" ")
      );
    } catch (e) {
      console.error("[orchestrator] cycle error:", (e as Error).message);
    } finally {
      running = false;
    }
  };
  // Kick once immediately, then on interval
  void tick();
  timer = setInterval(tick, config.cycleIntervalMs);
  console.log(`[orchestrator] started, interval=${config.cycleIntervalMs}ms`);
}

export function stopOrchestrator(): void {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

// Read-only state inspection for routes.
export function getLiquidityState(): LiquidityAgentState {
  return STATE.liquidity;
}
