import { config } from "../config";
import { deltaHistory, isSustainedDrift } from "../lib/goldsky";
import { logHedgeIntent } from "../lib/contracts";
import { applyRiskDecision } from "../lib/pnl";

export type RiskAction =
  | { kind: "SIGNAL_REBALANCE"; deltaBps: number; direction: "LONG" | "SHORT" }
  | { kind: "LOG_HEDGE"; deltaBps: number; direction: "LONG" | "SHORT" }
  | { kind: "SKIP"; reason: string };

/**
 * Composition delta: how much WKITE value (in USD) the LP currently holds vs how much
 * it held when the position was first opened. Positive means LP is long WKITE
 * (accumulated WKITE because retail has been selling), negative means short.
 */
export interface CompositionDelta {
  deltaUsd: number;
  positionValueUsd: number;
}

export async function decideRiskAction(
  delta: CompositionDelta,
  rebalanceAvailable: boolean,
  rebalanceCostEfficient: boolean
): Promise<RiskAction> {
  if (delta.positionValueUsd <= 0) return { kind: "SKIP", reason: "no_position_value" };

  const deltaBps = Math.round((delta.deltaUsd / delta.positionValueUsd) * 10000);
  const direction: "LONG" | "SHORT" = deltaBps >= 0 ? "LONG" : "SHORT";
  const absBps = Math.abs(deltaBps);

  if (absBps < config.riskDeltaThresholdBps) {
    return { kind: "SKIP", reason: `delta_${deltaBps}bps_below_${config.riskDeltaThresholdBps}` };
  }

  // Confirm sustained drift via Goldsky history before signalling.
  const history = await deltaHistory(config.riskAgentDID, 5);
  const sustained = history.length === 0 || isSustainedDrift(history);
  if (!sustained) return { kind: "SKIP", reason: "transient_spike" };

  if (rebalanceAvailable && rebalanceCostEfficient) {
    return { kind: "SIGNAL_REBALANCE", deltaBps, direction };
  }
  return { kind: "LOG_HEDGE", deltaBps, direction };
}

export async function recordHedgeIntent(args: {
  reputationBefore: number;
  exposureBefore: number;
  exposureAfter: number;
  deltaBps: number;
  direction: "LONG" | "SHORT";
}): Promise<string> {
  const txHash = await logHedgeIntent(
    config.riskAgentDID,
    BigInt(args.deltaBps),
    args.direction
  );
  return applyRiskDecision({
    agentDID: config.riskAgentDID,
    reputationBefore: args.reputationBefore,
    exposureBefore: args.exposureBefore,
    exposureAfter: args.exposureAfter,
    txHash,
    action: "HEDGE_LOGGED",
  });
}

export async function recordRebalanceSignal(args: {
  reputationBefore: number;
  exposureBefore: number;
  exposureAfter: number;
  txHash: string;
}): Promise<string> {
  return applyRiskDecision({
    agentDID: config.riskAgentDID,
    reputationBefore: args.reputationBefore,
    exposureBefore: args.exposureBefore,
    exposureAfter: args.exposureAfter,
    txHash: args.txHash,
    action: "REBALANCE_SIGNAL",
  });
}
