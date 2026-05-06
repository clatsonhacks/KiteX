import axios from "axios";
import { config } from "../config";
import { getAgentConfig, updateReputationOnChain, logReputation } from "./contracts";

/**
 * Kite Agent Passport integration.
 *
 * Two sources of truth for an agent's reputation:
 *   1. The Kite Passport API (off-chain, the canonical Passport record)
 *   2. The CapitalRouter contract on Kite mainnet (drives capital allocation)
 *
 * We keep both in sync: every PnL-driven update writes to both, with the on-chain
 * write being the authoritative one for capital flow.
 *
 * If the Passport API is unreachable or unconfigured, on-chain reads/writes still work.
 */

const apiBase = () => config.passportApiBase.replace(/\/$/, "");

interface PassportReputationResp {
  agentId?: string;
  did?: string;
  reputation?: number;
  agentType?: string;
}

/** Reads reputation from the Passport API. Falls back to on-chain if unavailable. */
export async function readReputation(agentDID: string): Promise<number> {
  if (config.passportAgentId) {
    try {
      const r = await axios.get<PassportReputationResp>(
        `${apiBase()}/v1/agents/${config.passportAgentId}/reputation`,
        {
          headers: passportAuthHeaders(),
          timeout: 5000,
        }
      );
      if (typeof r.data?.reputation === "number") return r.data.reputation;
    } catch (e) {
      // Fall through to on-chain.
    }
  }
  const cfg = await getAgentConfig(agentDID);
  return Number(cfg.reputationScore);
}

/**
 * Writes a new reputation score to both the Passport API (if configured) and on-chain.
 * Returns the on-chain tx hash that updated CapitalRouter.
 */
export async function writeReputation(
  agentDID: string,
  newScore: number,
  reason: string
): Promise<{ txHash: string; oldScore: number }> {
  const oldScore = await readReputation(agentDID);

  if (config.passportAgentId) {
    try {
      await axios.post(
        `${apiBase()}/v1/agents/${config.passportAgentId}/reputation`,
        { score: newScore, reason },
        { headers: passportAuthHeaders(), timeout: 5000 }
      );
    } catch (e) {
      console.warn("[passport] API write failed, continuing on-chain:", (e as Error).message);
    }
  }

  const txHash = await updateReputationOnChain(agentDID, BigInt(Math.max(0, Math.floor(newScore))));

  // Mirror to AuditLog for the indexer/frontend.
  try {
    await logReputation(agentDID, BigInt(oldScore), BigInt(Math.max(0, Math.floor(newScore))), reason);
  } catch (e) {
    console.warn("[passport] AuditLog reputation write failed:", (e as Error).message);
  }

  return { txHash, oldScore };
}

/** Verifies the agent DID is registered and active in CapitalRouter before issuing transactions. */
export async function verifyAgent(agentDID: string): Promise<boolean> {
  try {
    const cfg = await getAgentConfig(agentDID);
    return cfg.isActive;
  } catch {
    return false;
  }
}

function passportAuthHeaders(): Record<string, string> {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (process.env.PASSPORT_API_KEY) h.Authorization = `Bearer ${process.env.PASSPORT_API_KEY}`;
  if (config.passportOwnerId) h["X-Owner-Id"] = config.passportOwnerId;
  return h;
}
