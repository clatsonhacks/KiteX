import { config } from "../config";
import { recentSwaps, computeReferencePrice } from "../lib/goldsky";
import { logArb, logArbFailed } from "../lib/contracts";
import { applyArbDecision } from "../lib/pnl";
import { PoolSnapshot, priceFromPool, PAIR } from "./liquidityAgent";

export type ArbAction =
  | { kind: "EXECUTE"; tokenIn: string; tokenOut: string; expectedProfitUsd: number; divergenceBps: number }
  | { kind: "SKIP"; reason: string };

const ESTIMATED_GAS_USD = 0.002;

/**
 * Decides whether an arb opportunity exists.
 *
 *   divergence = (algebraPrice - referencePrice) / referencePrice
 *
 * If |divergence| > threshold and the expected swap profit > gas, we arb.
 * tokenIn / tokenOut depend on direction:
 *   - Algebra > Reference  → pool is overpaying for token1 (WKITE). Sell WKITE into pool.
 *   - Algebra < Reference  → pool is underpricing token1. Buy WKITE from pool.
 */
export async function decideArbAction(pool: PoolSnapshot, swapAmountUsd: number): Promise<ArbAction> {
  const swaps = await recentSwaps(20);
  if (swaps.length < 5) return { kind: "SKIP", reason: "insufficient_swap_history" };

  const reference = computeReferencePrice(swaps, PAIR.decimals0, PAIR.decimals1);
  if (reference === null || reference <= 0) return { kind: "SKIP", reason: "no_reference_price" };

  const algebraPrice = priceFromPool(pool);
  if (!Number.isFinite(algebraPrice) || algebraPrice <= 0) {
    return { kind: "SKIP", reason: "invalid_algebra_price" };
  }

  const divergence = (algebraPrice - reference) / reference;
  const divergenceBps = Math.round(divergence * 10000);
  if (Math.abs(divergenceBps) < config.arbDivergenceThresholdBps) {
    return { kind: "SKIP", reason: `divergence_${divergenceBps}bps_below_${config.arbDivergenceThresholdBps}` };
  }

  const expectedProfitUsd = Math.abs(divergence) * swapAmountUsd - ESTIMATED_GAS_USD;
  if (expectedProfitUsd <= 0) return { kind: "SKIP", reason: "expected_profit_negative" };

  // divergence > 0: pool is paying too much in token0 (USDC.e) per token1 (WKITE)
  //   → sell WKITE into pool, receive USDC.e. tokenIn = WKITE, tokenOut = USDC.e.
  // divergence < 0: pool is paying too little in token0
  //   → buy WKITE from pool. tokenIn = USDC.e, tokenOut = WKITE.
  const tokenIn = divergence > 0 ? PAIR.token1 : PAIR.token0;
  const tokenOut = divergence > 0 ? PAIR.token0 : PAIR.token1;

  return {
    kind: "EXECUTE",
    tokenIn,
    tokenOut,
    expectedProfitUsd,
    divergenceBps,
  };
}

export async function recordArbExecution(args: {
  reputationBefore: number;
  tokenIn: string;
  tokenOut: string;
  amountInUsd: number;
  amountOutUsd: number;
  gasCostUsd: number;
  txHash: string;
}): Promise<string> {
  const profitInt = BigInt(Math.round((args.amountOutUsd - args.amountInUsd) * 1e6));
  const amountInRaw = BigInt(Math.round(args.amountInUsd * 1e6));
  const amountOutRaw = BigInt(Math.round(args.amountOutUsd * 1e6));
  await logArb(
    config.arbAgentDID,
    args.tokenIn,
    args.tokenOut,
    amountInRaw,
    amountOutRaw,
    profitInt
  );
  return applyArbDecision(
    {
      agentDID: config.arbAgentDID,
      reputationBefore: args.reputationBefore,
      amountInUsd: args.amountInUsd,
      amountOutUsd: args.amountOutUsd,
      gasCostUsd: args.gasCostUsd,
      txHash: args.txHash,
      tokenIn: args.tokenIn,
      tokenOut: args.tokenOut,
    },
    args.amountOutUsd > args.amountInUsd + args.gasCostUsd
  );
}

export async function recordArbFailure(args: {
  reputationBefore: number;
  reason: string;
  tokenIn: string;
  tokenOut: string;
  amountInUsd: number;
  gasCostUsd: number;
  txHash: string;
}): Promise<string> {
  await logArbFailed(config.arbAgentDID, args.reason);
  return applyArbDecision(
    {
      agentDID: config.arbAgentDID,
      reputationBefore: args.reputationBefore,
      amountInUsd: args.amountInUsd,
      amountOutUsd: 0,
      gasCostUsd: args.gasCostUsd,
      txHash: args.txHash,
      tokenIn: args.tokenIn,
      tokenOut: args.tokenOut,
    },
    false
  );
}
