import { GraphQLClient, gql } from "graphql-request";
import { config } from "../config";

let _client: GraphQLClient | null = null;

function client(): GraphQLClient {
  if (!_client) _client = new GraphQLClient(config.goldskyEndpoint);
  return _client;
}

// ─── Schema-aligned types ────────────────────────────────────────────────

export interface PoolSwap {
  amount0: string;
  amount1: string;
  sqrtPriceX96: string;
  tick: number;
  timestamp: string;
  txHash: string;
}

export interface ReputationEvent {
  oldScore: string;
  newScore: string;
  reason: string;
  timestamp: string;
  txHash: string;
}

export interface ArbEvent {
  success: boolean;
  amountIn: string;
  amountOut: string;
  profit: string;
  timestamp: string;
  txHash: string;
}

export interface HedgeEvent {
  deltaExposure: string;
  direction: string;
  timestamp: string;
  txHash: string;
}

export interface LPEvent {
  action: string;
  tickLower: number;
  tickUpper: number;
  liquidity: string;
  feesCollected: string | null;
  timestamp: string;
  txHash: string;
}

export interface AgentEventLite {
  agent: { did: string; agentType: string };
  eventType: string;
  profit: string | null;
  metricValue: string | null;
  timestamp: string;
  txHash: string;
}

// ─── Queries ─────────────────────────────────────────────────────────────

const RECENT_SWAPS = gql`
  query RecentSwaps($limit: Int!) {
    poolSwaps(orderBy: timestamp, orderDirection: desc, first: $limit) {
      sqrtPriceX96
      tick
      timestamp
      amount0
      amount1
      txHash
    }
  }
`;

const REPUTATION_HISTORY = gql`
  query ReputationHistory($did: String!) {
    reputationEvents(
      where: { agentDID: $did }
      orderBy: timestamp
      orderDirection: asc
      first: 50
    ) {
      oldScore
      newScore
      reason
      timestamp
      txHash
    }
  }
`;

const ARB_HISTORY = gql`
  query ArbHistory($did: String!) {
    arbEvents(
      where: { agentDID: $did }
      orderBy: timestamp
      orderDirection: asc
      first: 50
    ) {
      success
      profit
      amountIn
      amountOut
      timestamp
      txHash
    }
  }
`;

const LP_HISTORY = gql`
  query LPHistory($did: String!) {
    lpEvents(
      where: { agentDID: $did }
      orderBy: timestamp
      orderDirection: desc
      first: 50
    ) {
      action
      tickLower
      tickUpper
      liquidity
      feesCollected
      timestamp
      txHash
    }
  }
`;

const DELTA_HISTORY = gql`
  query DeltaHistory($did: String!, $limit: Int!) {
    hedgeEvents(
      where: { agentDID: $did }
      orderBy: timestamp
      orderDirection: desc
      first: $limit
    ) {
      deltaExposure
      direction
      timestamp
      txHash
    }
  }
`;

const LATEST_EVENTS = gql`
  query LatestEvents($since: BigInt!) {
    agentEvents(
      where: { timestamp_gt: $since }
      orderBy: timestamp
      orderDirection: desc
      first: 50
    ) {
      agent {
        did
        agentType
      }
      eventType
      profit
      metricValue
      timestamp
      txHash
    }
  }
`;

// ─── Wrapper functions ───────────────────────────────────────────────────

/** Pulls the last N pool swaps. Used by ArbitrageAgent to compute reference price. */
export async function recentSwaps(limit = 20): Promise<PoolSwap[]> {
  try {
    const data = await client().request<{ poolSwaps: PoolSwap[] }>(RECENT_SWAPS, { limit });
    return data.poolSwaps;
  } catch (e) {
    console.warn("[goldsky] recentSwaps failed:", (e as Error).message);
    return [];
  }
}

export async function reputationHistory(did: string): Promise<ReputationEvent[]> {
  try {
    const data = await client().request<{ reputationEvents: ReputationEvent[] }>(
      REPUTATION_HISTORY,
      { did }
    );
    return data.reputationEvents;
  } catch (e) {
    console.warn("[goldsky] reputationHistory failed:", (e as Error).message);
    return [];
  }
}

export async function arbHistory(did: string): Promise<ArbEvent[]> {
  try {
    const data = await client().request<{ arbEvents: ArbEvent[] }>(ARB_HISTORY, { did });
    return data.arbEvents;
  } catch (e) {
    console.warn("[goldsky] arbHistory failed:", (e as Error).message);
    return [];
  }
}

export async function lpHistory(did: string): Promise<LPEvent[]> {
  try {
    const data = await client().request<{ lpEvents: LPEvent[] }>(LP_HISTORY, { did });
    return data.lpEvents;
  } catch (e) {
    console.warn("[goldsky] lpHistory failed:", (e as Error).message);
    return [];
  }
}

export async function deltaHistory(did: string, limit = 20): Promise<HedgeEvent[]> {
  try {
    const data = await client().request<{ hedgeEvents: HedgeEvent[] }>(DELTA_HISTORY, {
      did,
      limit,
    });
    return data.hedgeEvents;
  } catch (e) {
    console.warn("[goldsky] deltaHistory failed:", (e as Error).message);
    return [];
  }
}

export async function latestEvents(sinceUnix = 0): Promise<AgentEventLite[]> {
  try {
    const data = await client().request<{ agentEvents: AgentEventLite[] }>(LATEST_EVENTS, {
      since: String(sinceUnix),
    });
    return data.agentEvents;
  } catch (e) {
    console.warn("[goldsky] latestEvents failed:", (e as Error).message);
    return [];
  }
}

/**
 * Computes a rolling reference price from recent pool swaps.
 * The reference is the median of the last N swap prices — this is what
 * ArbitrageAgent compares against the current pool price to detect divergence.
 */
export function computeReferencePrice(
  swaps: PoolSwap[],
  token0Decimals: number,
  token1Decimals: number
): number | null {
  if (swaps.length === 0) return null;
  const Q96 = 2n ** 96n;
  const prices = swaps
    .map((s) => {
      const sp = BigInt(s.sqrtPriceX96);
      const ratioX192 = sp * sp;
      const raw = Number(ratioX192) / Number(Q96 * Q96);
      return raw * 10 ** (token0Decimals - token1Decimals);
    })
    .filter((p) => Number.isFinite(p) && p > 0)
    .sort((a, b) => a - b);
  if (prices.length === 0) return null;
  const mid = Math.floor(prices.length / 2);
  return prices.length % 2 === 0 ? (prices[mid - 1] + prices[mid]) / 2 : prices[mid];
}

/**
 * RiskAgent helper: returns true if recent hedge events show sustained drift in one
 * direction rather than a temporary spike. We require ≥3 of the last 5 events to be
 * in the same direction.
 */
export function isSustainedDrift(events: HedgeEvent[]): boolean {
  if (events.length < 3) return false;
  const recent = events.slice(0, 5);
  const longCount = recent.filter((e) => e.direction === "LONG").length;
  const shortCount = recent.filter((e) => e.direction === "SHORT").length;
  return longCount >= 3 || shortCount >= 3;
}
