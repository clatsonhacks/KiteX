import { config } from "../config";
import { sqrtPriceX96ToPrice, TOKENS } from "../lib/algebra";
import { lpHistory } from "../lib/goldsky";
import { logLPRebalance } from "../lib/contracts";
import { applyLPRebalanceDecision } from "../lib/pnl";

export interface PoolSnapshot {
  sqrtPriceX96: bigint;
  tick: number;
  fee: number;
  liquidity: bigint;
}

export interface LiquidityAgentState {
  hasActivePosition: boolean;
  tickLower: number | null;
  tickUpper: number | null;
  lastRebalanceUnix: number;
}

export type LiquidityAction =
  | { kind: "OPEN"; tickLower: number; tickUpper: number }
  | { kind: "REBALANCE"; oldTickLower: number; oldTickUpper: number; newTickLower: number; newTickUpper: number }
  | { kind: "SKIP"; reason: string };

const TICK_STEP = 60; // tick spacing for the Algebra USDC.e/WKITE pool
const REBALANCE_TRIGGER_RATIO = 0.8; // trigger when price is ≥80% across the range

function widthInTicks(): number {
  // ±2% on price ≈ ±200 bps. ln(1.02) ≈ 0.0198, divide by ln(1.0001) ≈ 0.0001 → ~198 ticks.
  const halfWidth = Math.round(Math.log(1 + config.lpRangeWidthBps / 10000) / Math.log(1.0001));
  return Math.max(TICK_STEP, Math.round(halfWidth / TICK_STEP) * TICK_STEP);
}

export function decideLiquidityAction(
  pool: PoolSnapshot,
  state: LiquidityAgentState,
  nowUnix: number
): LiquidityAction {
  const w = widthInTicks();

  if (!state.hasActivePosition) {
    const center = Math.round(pool.tick / TICK_STEP) * TICK_STEP;
    return { kind: "OPEN", tickLower: center - w, tickUpper: center + w };
  }

  if (state.tickLower === null || state.tickUpper === null) {
    return { kind: "SKIP", reason: "missing_tick_range" };
  }

  const since = nowUnix - state.lastRebalanceUnix;
  if (since < config.rebalanceCooldownSec) {
    return { kind: "SKIP", reason: `cooldown_${config.rebalanceCooldownSec - since}s_remaining` };
  }

  const rangeSize = state.tickUpper - state.tickLower;
  const distanceFromCenter = Math.abs(pool.tick - (state.tickLower + state.tickUpper) / 2);
  const ratio = distanceFromCenter / (rangeSize / 2);

  if (ratio < REBALANCE_TRIGGER_RATIO) {
    return { kind: "SKIP", reason: `in_range_ratio_${ratio.toFixed(2)}` };
  }

  const center = Math.round(pool.tick / TICK_STEP) * TICK_STEP;
  return {
    kind: "REBALANCE",
    oldTickLower: state.tickLower,
    oldTickUpper: state.tickUpper,
    newTickLower: center - w,
    newTickUpper: center + w,
  };
}

/**
 * Estimates the fee uplift a rebalance would deliver vs the previous range.
 * Reads recent LPEvents from Goldsky to compare per-block fee accrual rates.
 * Returns a delta in USD; positive means the new range is expected to capture more fees.
 */
export async function estimateRebalanceUplift(): Promise<number> {
  const history = await lpHistory(config.liquidityAgentDID);
  if (history.length < 2) return 0.05; // optimistic small-positive default for cold start
  const latest = history[0];
  const prev = history[1];
  const latestFees = Number(latest.feesCollected ?? 0);
  const prevFees = Number(prev.feesCollected ?? 0);
  return latestFees - prevFees;
}

/**
 * Records an LP rebalance to AuditLog + Mongo + reputation. The actual on-chain mint/burn
 * is performed by sessionKey.ts via gokite-aa-sdk; this records the outcome.
 */
export async function recordLPRebalance(args: {
  reputationBefore: number;
  oldTickLower: number;
  oldTickUpper: number;
  newTickLower: number;
  newTickUpper: number;
  feesUpliftUsd: number;
  gasCostUsd: number;
  txHash: string;
}): Promise<string> {
  await logLPRebalance(
    config.liquidityAgentDID,
    args.oldTickLower,
    args.oldTickUpper,
    args.newTickLower,
    args.newTickUpper
  );
  return applyLPRebalanceDecision({
    agentDID: config.liquidityAgentDID,
    reputationBefore: args.reputationBefore,
    feesCapturedDeltaUsd: args.feesUpliftUsd,
    gasCostUsd: args.gasCostUsd,
    txHash: args.txHash,
    oldTickRange: [args.oldTickLower, args.oldTickUpper],
    newTickRange: [args.newTickLower, args.newTickUpper],
  });
}

export const PAIR = { token0: TOKENS.USDC_E, token1: TOKENS.WKITE, decimals0: 6, decimals1: 18 };

export function priceFromPool(p: PoolSnapshot): number {
  return sqrtPriceX96ToPrice(p.sqrtPriceX96, PAIR.decimals0, PAIR.decimals1);
}
