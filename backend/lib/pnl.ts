import { writeReputation } from "./passport";
import { recordDecision } from "./mongo";
import type { DecisionDoc } from "./mongo";

/**
 * PnL & reputation update logic.
 *
 * Each agent's reputation is a non-negative integer. Successful actions add a multiple
 * of profit-in-dollars; failures subtract a fixed slash. The score is bounded below by
 * zero so a streak of losses can't make it go negative. CapitalRouter computes each
 * agent's allocation share as (its score / sum of all scores).
 */

export interface ArbResult {
  agentDID: string;
  reputationBefore: number;
  amountInUsd: number;
  amountOutUsd: number;
  gasCostUsd: number;
  txHash: string;
  tokenIn: string;
  tokenOut: string;
}

export interface LPRebalanceResult {
  agentDID: string;
  reputationBefore: number;
  feesCapturedDeltaUsd: number; // observed fee uplift vs prior range over evaluation window
  gasCostUsd: number;
  txHash: string;
  oldTickRange: [number, number];
  newTickRange: [number, number];
}

export interface RiskResult {
  agentDID: string;
  reputationBefore: number;
  exposureBefore: number;
  exposureAfter: number;
  txHash: string;
  action: "REBALANCE_SIGNAL" | "HEDGE_LOGGED";
}

export interface ReputationDecision {
  newScore: number;
  netPnL: number;
  reason: string;
}

const ARB_MULT = 5; // +5 reputation per $1 of net profit
const ARB_FAIL_PENALTY = 3;
const LP_REBAL_MULT = 4;
const LP_REBAL_PENALTY = 2;
const RISK_SUCCESS_BONUS = 6;
const RISK_FAILURE_PENALTY = 4;

export function computeArbReputation(r: ArbResult): ReputationDecision {
  const netPnL = r.amountOutUsd - r.amountInUsd - r.gasCostUsd;
  const success = netPnL > 0;
  const delta = success
    ? Math.round(netPnL * ARB_MULT)
    : -ARB_FAIL_PENALTY;
  const newScore = Math.max(0, r.reputationBefore + delta);
  return {
    newScore,
    netPnL,
    reason: success ? `arb_profit_${netPnL.toFixed(4)}` : `arb_loss_${netPnL.toFixed(4)}`,
  };
}

export function computeLPReputation(r: LPRebalanceResult): ReputationDecision {
  const netPnL = r.feesCapturedDeltaUsd - r.gasCostUsd;
  const positive = netPnL > 0;
  const delta = positive
    ? Math.round(netPnL * LP_REBAL_MULT)
    : -LP_REBAL_PENALTY;
  const newScore = Math.max(0, r.reputationBefore + delta);
  return {
    newScore,
    netPnL,
    reason: positive ? `rebal_fee_uplift_${netPnL.toFixed(4)}` : `rebal_no_uplift`,
  };
}

export function computeRiskReputation(r: RiskResult): ReputationDecision {
  const reduced = Math.abs(r.exposureAfter) < Math.abs(r.exposureBefore);
  const delta = reduced ? RISK_SUCCESS_BONUS : -RISK_FAILURE_PENALTY;
  const newScore = Math.max(0, r.reputationBefore + delta);
  return {
    newScore,
    netPnL: 0,
    reason: reduced ? "risk_exposure_reduced" : "risk_exposure_unchanged",
  };
}

/**
 * Persists a decision row + writes the new reputation score to Passport API and on-chain.
 * Returns the on-chain reputation update tx hash.
 */
export async function applyArbDecision(r: ArbResult, success: boolean): Promise<string> {
  const decision = computeArbReputation(r);
  const { txHash: repTx } = await writeReputation(r.agentDID, decision.newScore, decision.reason);
  const doc: DecisionDoc = {
    agentDID: r.agentDID,
    action: success ? "ARB_EXECUTED" : "ARB_FAILED",
    txHash: r.txHash,
    inputAmount: r.amountInUsd,
    outputAmount: r.amountOutUsd,
    profit: decision.netPnL,
    gasUsed: r.gasCostUsd,
    netPnL: decision.netPnL,
    reputationBefore: r.reputationBefore,
    reputationAfter: decision.newScore,
    reason: decision.reason,
    timestamp: Date.now(),
  };
  try { await recordDecision(doc); } catch {}
  return repTx;
}

export async function applyLPRebalanceDecision(r: LPRebalanceResult): Promise<string> {
  const decision = computeLPReputation(r);
  const { txHash: repTx } = await writeReputation(r.agentDID, decision.newScore, decision.reason);
  const doc: DecisionDoc = {
    agentDID: r.agentDID,
    action: "LP_REBALANCE",
    txHash: r.txHash,
    profit: decision.netPnL,
    gasUsed: r.gasCostUsd,
    netPnL: decision.netPnL,
    reputationBefore: r.reputationBefore,
    reputationAfter: decision.newScore,
    reason: decision.reason,
    timestamp: Date.now(),
  };
  try { await recordDecision(doc); } catch {}
  return repTx;
}

export async function applyRiskDecision(r: RiskResult): Promise<string> {
  const decision = computeRiskReputation(r);
  const { txHash: repTx } = await writeReputation(r.agentDID, decision.newScore, decision.reason);
  const doc: DecisionDoc = {
    agentDID: r.agentDID,
    action: "HEDGE_LOGGED",
    txHash: r.txHash,
    reputationBefore: r.reputationBefore,
    reputationAfter: decision.newScore,
    reason: decision.reason,
    timestamp: Date.now(),
  };
  try { await recordDecision(doc); } catch {}
  return repTx;
}
