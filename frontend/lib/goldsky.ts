import { GraphQLClient } from 'graphql-request';

const GOLDSKY_ENDPOINT = process.env.NEXT_PUBLIC_GOLDSKY_ENDPOINT || '';

const client = new GraphQLClient(GOLDSKY_ENDPOINT);

// Types based on subgraph schema
export interface PoolSwap {
  id: string;
  amount0: string;
  amount1: string;
  sqrtPriceX96: string;
  tick: number;
  timestamp: string;
  txHash: string;
}

export interface ReputationEvent {
  id: string;
  agentDID: string;
  oldScore: string;
  newScore: string;
  reason: string;
  timestamp: string;
  txHash: string;
}

export interface ArbEvent {
  id: string;
  agentDID: string;
  success: boolean;
  amountIn: string;
  amountOut: string;
  profit: string;
  timestamp: string;
  txHash: string;
}

export interface LPEvent {
  id: string;
  agentDID: string;
  action: string;
  tickLower: number;
  tickUpper: number;
  liquidity: string;
  feesCollected?: string;
  timestamp: string;
  txHash: string;
}

export interface HedgeEvent {
  id: string;
  agentDID: string;
  deltaExposure: string;
  direction: string;
  timestamp: string;
  txHash: string;
}

export interface AgentEvent {
  id: string;
  agent: {
    did: string;
    agentType: string;
  };
  eventType: string;
  profit?: string;
  metricValue?: string;
  timestamp: string;
  txHash: string;
}

// Query 1: Recent swaps for ArbitrageAgent price history
export const RECENT_SWAPS_QUERY = `
  query RecentSwaps($limit: Int!) {
    poolSwaps(
      orderBy: timestamp
      orderDirection: desc
      first: $limit
    ) {
      id
      sqrtPriceX96
      tick
      timestamp
      amount0
      amount1
      txHash
    }
  }
`;

export async function getRecentSwaps(limit: number = 20): Promise<PoolSwap[]> {
  try {
    const data: { poolSwaps: PoolSwap[] } = await client.request(RECENT_SWAPS_QUERY, { limit });
    return data.poolSwaps;
  } catch (error) {
    console.warn('Goldsky: Failed to fetch recent swaps', error);
    return [];
  }
}

// Query 2: Reputation history for agent detail chart
export const REPUTATION_HISTORY_QUERY = `
  query ReputationHistory($did: String!) {
    reputationEvents(
      where: { agentDID: $did }
      orderBy: timestamp
      orderDirection: asc
      first: 50
    ) {
      id
      oldScore
      newScore
      reason
      timestamp
      txHash
    }
  }
`;

export async function getReputationHistory(did: string): Promise<ReputationEvent[]> {
  try {
    const data: { reputationEvents: ReputationEvent[] } = await client.request(
      REPUTATION_HISTORY_QUERY,
      { did }
    );
    return data.reputationEvents;
  } catch (error) {
    console.warn('Goldsky: Failed to fetch reputation history', error);
    return [];
  }
}

// Query 3: Arb PnL history for agent detail chart
export const ARB_HISTORY_QUERY = `
  query ArbHistory($did: String!) {
    arbEvents(
      where: { agentDID: $did }
      orderBy: timestamp
      orderDirection: asc
      first: 50
    ) {
      id
      success
      profit
      amountIn
      amountOut
      timestamp
      txHash
    }
  }
`;

export async function getArbHistory(did: string): Promise<ArbEvent[]> {
  try {
    const data: { arbEvents: ArbEvent[] } = await client.request(ARB_HISTORY_QUERY, { did });
    return data.arbEvents;
  } catch (error) {
    console.warn('Goldsky: Failed to fetch arb history', error);
    return [];
  }
}

// Query 4: Live event feed for dashboard
export const LATEST_EVENTS_QUERY = `
  query LatestEvents($since: BigInt!) {
    agentEvents(
      where: { timestamp_gt: $since }
      orderBy: timestamp
      orderDirection: desc
      first: 20
    ) {
      id
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

export async function getLatestEvents(since: number = 0): Promise<AgentEvent[]> {
  try {
    const data: { agentEvents: AgentEvent[] } = await client.request(LATEST_EVENTS_QUERY, {
      since: since.toString(),
    });
    return data.agentEvents;
  } catch (error) {
    console.warn('Goldsky: Failed to fetch latest events', error);
    return [];
  }
}

// Query 5: RiskAgent delta history
export const DELTA_HISTORY_QUERY = `
  query DeltaHistory($did: String!, $limit: Int!) {
    hedgeEvents(
      where: { agentDID: $did }
      orderBy: timestamp
      orderDirection: desc
      first: $limit
    ) {
      id
      deltaExposure
      direction
      timestamp
      txHash
    }
  }
`;

export async function getDeltaHistory(did: string, limit: number = 20): Promise<HedgeEvent[]> {
  try {
    const data: { hedgeEvents: HedgeEvent[] } = await client.request(DELTA_HISTORY_QUERY, {
      did,
      limit,
    });
    return data.hedgeEvents;
  } catch (error) {
    console.warn('Goldsky: Failed to fetch delta history', error);
    return [];
  }
}

// Query 6: LP history for LiquidityAgent
export const LP_HISTORY_QUERY = `
  query LPHistory($did: String!) {
    lpevents(
      where: { agentDID: $did }
      orderBy: timestamp
      orderDirection: desc
      first: 50
    ) {
      id
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

export async function getLPHistory(did: string): Promise<LPEvent[]> {
  try {
    const data: { lpevents: LPEvent[] } = await client.request(LP_HISTORY_QUERY, { did });
    return data.lpevents;
  } catch (error) {
    console.warn('Goldsky: Failed to fetch LP history', error);
    return [];
  }
}

// Query 7: All LP events for positions page
export const ALL_LP_EVENTS_QUERY = `
  query AllLPEvents {
    lpevents(
      orderBy: timestamp
      orderDirection: desc
      first: 100
    ) {
      id
      agentDID
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

export async function getAllLPEvents(): Promise<LPEvent[]> {
  try {
    const data: { lpevents: LPEvent[] } = await client.request(ALL_LP_EVENTS_QUERY);
    return data.lpevents;
  } catch (error) {
    console.warn('Goldsky: Failed to fetch all LP events', error);
    return [];
  }
}

// Utility: Compute reference price from recent swaps
export function computeReferencePrice(swaps: PoolSwap[]): number {
  if (swaps.length === 0) return 0;

  // Convert sqrtPriceX96 to actual price
  const prices = swaps.map((swap) => {
    const sqrtPriceX96 = BigInt(swap.sqrtPriceX96);
    const price = Number(sqrtPriceX96) ** 2 / 2 ** 192;
    return price;
  });

  // Return median price
  const sorted = prices.sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}
