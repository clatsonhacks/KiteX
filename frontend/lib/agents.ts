/**
 * Known agent DIDs registered on Kite mainnet CapitalRouter.
 * Used as a fallback when Goldsky returns 'unknown' for agentType (e.g. for
 * historical events emitted before the subgraph properly indexed the Agent entity).
 */
export const AGENT_DIDS = {
  LIQUIDITY: "0x4c69717569646974794167656e74000000000000000000000000000000000000",
  ARBITRAGE: "0x4172626974726167654167656e74000000000000000000000000000000000000",
  RISK: "0x5269736b4167656e740000000000000000000000000000000000000000000000",
} as const;

const DID_TO_TYPE: Record<string, string> = {
  [AGENT_DIDS.LIQUIDITY]: "LiquidityAgent",
  [AGENT_DIDS.ARBITRAGE]: "ArbitrageAgent",
  [AGENT_DIDS.RISK]: "RiskAgent",
};

export function resolveAgentType(did?: string, fallback?: string): string {
  if (fallback && fallback !== "unknown" && fallback !== "Unknown") return fallback;
  if (!did) return "Unknown";
  return DID_TO_TYPE[did.toLowerCase()] ?? DID_TO_TYPE[did] ?? "Unknown";
}

/** Human-friendly relative time string ("just now", "12s ago", "3m ago", "1w ago"). */
export function relativeTime(timestampSec: number | string): string {
  const ts = typeof timestampSec === "string" ? parseInt(timestampSec) : timestampSec;
  if (!ts || Number.isNaN(ts)) return "—";
  const diffSec = Math.max(0, Math.floor(Date.now() / 1000 - ts));
  if (diffSec < 5) return "just now";
  if (diffSec < 60) return `${diffSec}s ago`;
  const mins = Math.floor(diffSec / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
}
