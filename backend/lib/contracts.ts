import { ethers } from "ethers";
import CapitalRouterArtifact from "./abis/CapitalRouter.json";
import KitexAuditLogArtifact from "./abis/KitexAuditLog.json";
import { config } from "../config";
import { getProvider } from "./algebra";

export function getSigner(): ethers.Wallet {
  if (!config.privateKey) throw new Error("PRIVATE_KEY not set");
  return new ethers.Wallet(config.privateKey, getProvider());
}

export function getCapitalRouter(signerOrProvider?: ethers.Signer | ethers.Provider) {
  return new ethers.Contract(
    config.capitalRouterAddress,
    CapitalRouterArtifact.abi,
    signerOrProvider || getProvider()
  );
}

export function getAuditLog(signerOrProvider?: ethers.Signer | ethers.Provider) {
  return new ethers.Contract(
    config.auditLogAddress,
    KitexAuditLogArtifact.abi,
    signerOrProvider || getProvider()
  );
}

export interface AgentConfig {
  passportDID: string;
  baseAllocationBps: bigint;
  currentAllocationBps: bigint;
  reputationScore: bigint;
  lastReputationUpdate: bigint;
  isActive: boolean;
}

export async function getAgentConfig(agentDID: string): Promise<AgentConfig> {
  const router = getCapitalRouter();
  const c = await router.getAgentConfig(agentDID);
  return {
    passportDID: c.passportDID,
    baseAllocationBps: c.baseAllocationBps,
    currentAllocationBps: c.currentAllocationBps,
    reputationScore: c.reputationScore,
    lastReputationUpdate: c.lastReputationUpdate,
    isActive: c.isActive,
  };
}

export async function getAllocation(agentDID: string): Promise<bigint> {
  const router = getCapitalRouter();
  return await router.getAllocation(agentDID);
}

export async function getTreasuryBalance(): Promise<bigint> {
  const router = getCapitalRouter();
  return await router.getTreasuryBalance();
}

export async function getAllAgentDIDs(): Promise<string[]> {
  const router = getCapitalRouter();
  return await router.getAllAgentDIDs();
}

export async function updateReputationOnChain(agentDID: string, newScore: bigint): Promise<string> {
  const router = getCapitalRouter(getSigner());
  const tx = await router.updateReputation(agentDID, newScore);
  const receipt = await tx.wait();
  return receipt.hash;
}

// ─── AuditLog writes ──────────────────────────────────────────────────────

export async function logLPOpen(
  agentDID: string,
  poolAddress: string,
  tickLower: number,
  tickUpper: number,
  liquidity: bigint
): Promise<string> {
  const log = getAuditLog(getSigner());
  const tx = await log.logLPOpen(agentDID, poolAddress, tickLower, tickUpper, liquidity);
  const r = await tx.wait();
  return r.hash;
}

export async function logLPClose(
  agentDID: string,
  tokenId: bigint,
  feesCollected: bigint
): Promise<string> {
  const log = getAuditLog(getSigner());
  const tx = await log.logLPClose(agentDID, tokenId, feesCollected);
  const r = await tx.wait();
  return r.hash;
}

export async function logLPRebalance(
  agentDID: string,
  oldTickLower: number,
  oldTickUpper: number,
  newTickLower: number,
  newTickUpper: number
): Promise<string> {
  const log = getAuditLog(getSigner());
  const tx = await log.logLPRebalance(
    agentDID,
    oldTickLower,
    oldTickUpper,
    newTickLower,
    newTickUpper
  );
  const r = await tx.wait();
  return r.hash;
}

export async function logArb(
  agentDID: string,
  tokenIn: string,
  tokenOut: string,
  amountIn: bigint,
  amountOut: bigint,
  profit: bigint
): Promise<string> {
  const log = getAuditLog(getSigner());
  const tx = await log.logArb(agentDID, tokenIn, tokenOut, amountIn, amountOut, profit);
  const r = await tx.wait();
  return r.hash;
}

export async function logArbFailed(agentDID: string, reason: string): Promise<string> {
  const log = getAuditLog(getSigner());
  const tx = await log.logArbFailed(agentDID, reason);
  const r = await tx.wait();
  return r.hash;
}

export async function logHedgeIntent(
  agentDID: string,
  deltaExposure: bigint,
  direction: string
): Promise<string> {
  const log = getAuditLog(getSigner());
  const tx = await log.logHedgeIntent(agentDID, deltaExposure, direction);
  const r = await tx.wait();
  return r.hash;
}

export async function logReputation(
  agentDID: string,
  oldScore: bigint,
  newScore: bigint,
  reason: string
): Promise<string> {
  const log = getAuditLog(getSigner());
  const tx = await log.logReputation(agentDID, oldScore, newScore, reason);
  const r = await tx.wait();
  return r.hash;
}
