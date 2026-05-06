import "dotenv/config";

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

function optional(name: string, fallback: string): string {
  return process.env[name] || fallback;
}

export const config = {
  rpcUrl: optional("KITE_RPC_URL", "https://rpc.gokite.ai/"),
  chainId: Number(optional("KITE_CHAIN_ID", "2366")),
  bundlerRpc: optional("BUNDLER_RPC", "https://bundler-service.staging.gokite.ai/rpc/"),

  privateKey: process.env.PRIVATE_KEY || "",

  capitalRouterAddress: required("CAPITAL_ROUTER_ADDRESS"),
  auditLogAddress: required("AUDIT_LOG_ADDRESS"),
  algebraPoolAddress: required("ALGEBRA_POOL_ADDRESS"),

  liquidityAgentDID: required("LIQUIDITY_AGENT_DID"),
  arbAgentDID: required("ARB_AGENT_DID"),
  riskAgentDID: required("RISK_AGENT_DID"),

  passportAgentId: process.env.PASSPORT_AGENT_ID || "",
  passportOwnerId: process.env.PASSPORT_OWNER_ID || "",
  passportApiBase: optional("PASSPORT_API_BASE", "https://api.gokite.ai"),

  goldskyEndpoint: required("GOLDSKY_ENDPOINT"),

  mongoUri: optional("MONGO_URI", "mongodb://localhost:27017/kitex"),

  port: Number(optional("PORT", "3001")),

  // Orchestrator tuning
  cycleIntervalMs: Number(optional("CYCLE_INTERVAL_MS", "15000")),
  arbDivergenceThresholdBps: Number(optional("ARB_DIVERGENCE_BPS", "30")), // 0.3%
  riskDeltaThresholdBps: Number(optional("RISK_DELTA_BPS", "1500")), // 15%
  rebalanceCooldownSec: Number(optional("REBALANCE_COOLDOWN_SEC", "120")),
  lpRangeWidthBps: Number(optional("LP_RANGE_WIDTH_BPS", "200")), // ±2%
};

export const AGENT_TYPES = {
  Liquidity: "LiquidityAgent",
  Arbitrage: "ArbitrageAgent",
  Risk: "RiskAgent",
} as const;

export function didToAgentType(did: string): string {
  if (did === config.liquidityAgentDID) return AGENT_TYPES.Liquidity;
  if (did === config.arbAgentDID) return AGENT_TYPES.Arbitrage;
  if (did === config.riskAgentDID) return AGENT_TYPES.Risk;
  return "Unknown";
}

export const ALL_AGENT_DIDS = () => [
  { did: config.liquidityAgentDID, type: AGENT_TYPES.Liquidity },
  { did: config.arbAgentDID, type: AGENT_TYPES.Arbitrage },
  { did: config.riskAgentDID, type: AGENT_TYPES.Risk },
];
