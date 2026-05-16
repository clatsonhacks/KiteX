const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

// Types - matches backend response formats with frontend compatibility aliases

// Agent config returned by /api/agents
export interface AgentConfig {
  did: string;
  agentType: 'LiquidityAgent' | 'ArbitrageAgent' | 'RiskAgent';
  reputation: number;
  allocationBps: number;
  allocationUsd: number;
  isActive: boolean;
  status: 'ACTIVE' | 'IDLE' | 'REBALANCING' | 'ERROR';
  lastAction?: {
    type: string;
    timestamp: number;
    txHash?: string;
    profit?: number | null;
  } | null;
  // Frontend compatibility aliases
  reputationScore: number;
  currentAllocationBps: number;
  currentAllocation: string;
}

// Dashboard agent type with compatibility fields
export interface DashboardAgent {
  did: string;
  agentType: 'LiquidityAgent' | 'ArbitrageAgent' | 'RiskAgent';
  reputation: number;
  allocationBps: number;
  allocationUsd: number;
  isActive: boolean;
  // Frontend compatibility aliases (added by getDashboard)
  reputationScore: number;
  currentAllocationBps: number;
  currentAllocation: string;
  status: 'ACTIVE' | 'IDLE' | 'REBALANCING' | 'ERROR';
}

// Dashboard response from /api/dashboard
export interface DashboardData {
  treasury: { usd: number };
  stats: {
    treasuryUsd: number;
    feesEarnedTodayUsd: number;
    arbProfitTodayUsd: number;
    netPnLTodayUsd: number;
  };
  agents: DashboardAgent[];
  recentEvents: Array<{
    timestamp: number;
    agent: string;
    agentDID: string;
    action: string;
    amountUsd: number;
    profitUsd: number | null;
    txHash: string;
  }>;
  pool: {
    address: string;
    chainId: number;
  };
  // Frontend compatibility fields
  treasuryValue: string;
  feesToday: string;
  arbProfitToday: string;
  netPnLToday: string;
}

// Position from /api/positions
export interface Position {
  tokenId: string;
  token0: string;
  token1: string;
  tickLower: number;
  tickUpper: number;
  liquidity: string;
  tokensOwed0: string;
  tokensOwed1: string;
  inRange: boolean;
  currentTick: number;
  // Frontend display fields
  poolPair?: string;
  currentPrice?: number;
  feesEarned?: string;
  timeOpen?: number;
}

export interface PositionsResponse {
  pool: {
    address: string;
    currentTick: number;
    currentPrice: number;
    liquidity: string;
  };
  active: Position[];
  historical: any[];
}

export interface DemoAction {
  action: 'deposit' | 'allocate' | 'rebalance' | 'arb' | 'hedge';
  params?: Record<string, unknown>;
}

export interface DemoResult {
  success: boolean;
  txHash?: string;
  message: string;
  data?: Record<string, unknown>;
}

// API Functions

export async function getDashboard(): Promise<DashboardData> {
  const res = await fetch(`${BACKEND_URL}/api/dashboard`);
  if (!res.ok) throw new Error('Failed to fetch dashboard');
  const data = await res.json();

  // Add frontend compatibility fields
  return {
    ...data,
    treasuryValue: data.stats?.treasuryUsd?.toFixed(2) || '0',
    feesToday: data.stats?.feesEarnedTodayUsd?.toFixed(4) || '0',
    arbProfitToday: data.stats?.arbProfitTodayUsd?.toFixed(4) || '0',
    netPnLToday: data.stats?.netPnLTodayUsd?.toFixed(4) || '0',
    agents: (data.agents || []).map((a: any) => ({
      ...a,
      reputationScore: a.reputation,
      currentAllocationBps: a.allocationBps,
      currentAllocation: a.allocationUsd?.toFixed(2) || '0',
      status: a.isActive ? 'ACTIVE' : 'IDLE',
    })),
  };
}

export async function getAgents(): Promise<AgentConfig[]> {
  const res = await fetch(`${BACKEND_URL}/api/agents`);
  if (!res.ok) throw new Error('Failed to fetch agents');
  const data = await res.json();

  // Handle response format
  const agents = Array.isArray(data) ? data : (data?.agents || []);

  // Add frontend compatibility fields
  return agents.map((a: any) => ({
    ...a,
    reputationScore: a.reputation,
    currentAllocationBps: a.allocationBps,
    currentAllocation: a.allocationUsd?.toFixed(2) || '0',
    status: a.status || (a.isActive ? 'ACTIVE' : 'IDLE'),
  }));
}

export async function getAgent(did: string): Promise<AgentConfig> {
  const res = await fetch(`${BACKEND_URL}/api/agents/${encodeURIComponent(did)}`);
  if (!res.ok) throw new Error('Failed to fetch agent');
  const data = await res.json();

  return {
    ...data,
    reputationScore: data.reputation,
    currentAllocationBps: data.allocationBps,
    currentAllocation: data.allocationUsd?.toFixed(2) || '0',
    status: data.isActive ? 'ACTIVE' : 'IDLE',
  };
}

export async function getPositions(): Promise<PositionsResponse> {
  const res = await fetch(`${BACKEND_URL}/api/positions`);
  if (!res.ok) throw new Error('Failed to fetch positions');
  const data = await res.json();

  return {
    pool: data.pool || { address: '', currentTick: 0, currentPrice: 0, liquidity: '0' },
    active: (data.active || []).map((p: any) => ({
      ...p,
      poolPair: `${p.token0?.slice(0, 6) || 'Token0'}/${p.token1?.slice(0, 6) || 'Token1'}`,
      currentPrice: data.pool?.currentPrice || 0,
      feesEarned: '0', // Would need to calculate from tokensOwed
      timeOpen: Date.now() / 1000, // Would need actual timestamp from events
    })),
    historical: data.historical || [],
  };
}

export async function executeDemoAction(action: DemoAction): Promise<DemoResult> {
  const res = await fetch(`${BACKEND_URL}/api/demo/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(action),
  });
  if (!res.ok) throw new Error('Failed to execute demo action');
  return res.json();
}

export async function getTreasuryBalance(): Promise<{ balance: string; token: string }> {
  const res = await fetch(`${BACKEND_URL}/api/treasury/balance`);
  if (!res.ok) throw new Error('Failed to fetch treasury balance');
  return res.json();
}

export async function getRecentTransactions(limit: number = 20): Promise<{
  txHash: string;
  type: string;
  agent: string;
  amount: string;
  timestamp: string;
}[]> {
  const res = await fetch(`${BACKEND_URL}/api/transactions?limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch transactions');
  const data = await res.json();
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.transactions)) return data.transactions;
  return [];
}

// Agent Detail API
export interface AgentDecision {
  action: string;
  timestamp: number;
  profit?: string;
  netPnL?: number;
  txHash: string;
  inputAmount?: number;
}

export interface AgentDetail {
  config: AgentConfig;
  decisions: AgentDecision[];
  reputationHistory?: any[];
  arbHistory?: any[];
  lpHistory?: any[];
}

export async function getAgentDetail(did: string): Promise<AgentDetail> {
  const res = await fetch(`${BACKEND_URL}/api/agents/${encodeURIComponent(did)}`);
  if (!res.ok) throw new Error('Failed to fetch agent detail');
  const data = await res.json();

  return {
    config: {
      did: data.did,
      agentType: data.agentType,
      reputation: data.reputation,
      allocationBps: data.allocationBps,
      allocationUsd: data.allocationUsd,
      isActive: data.isActive,
      status: data.isActive ? 'ACTIVE' : 'IDLE',
      reputationScore: data.reputation,
      currentAllocationBps: data.allocationBps,
      currentAllocation: data.allocationUsd?.toFixed(2) || '0',
    },
    decisions: (data.decisionHistory || []).map((d: any) => ({
      action: d.action,
      timestamp: d.timestamp,
      profit: d.netPnL?.toString(),
      txHash: d.txHash,
    })),
    reputationHistory: data.reputationHistory,
    arbHistory: data.arbHistory,
    lpHistory: data.lpHistory,
  };
}

// Demo API Functions
export interface DemoInfo {
  capitalRouter: string;
  auditLog: string;
  goldskyEndpoint: string;
}

export async function getDemoInfo(): Promise<DemoInfo> {
  const res = await fetch(`${BACKEND_URL}/api/demo/info`);
  if (!res.ok) throw new Error('Failed to fetch demo info');
  return res.json();
}

export async function triggerDivergence(direction: 'up' | 'down', amount: string): Promise<{ success: boolean; txHash?: string }> {
  // Frontend uses up/down for UX clarity; backend expects buy_wkite (push price up) / sell_wkite (push price down).
  const backendDirection = direction === 'up' ? 'buy_wkite' : 'sell_wkite';
  const res = await fetch(`${BACKEND_URL}/api/demo/trigger-divergence`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ direction: backendDirection, amountUsdc: parseFloat(amount) }),
  });
  if (!res.ok) throw new Error('Failed to trigger divergence');
  return res.json();
}

export async function triggerVolume(swapCount: number, amount: string): Promise<{ success: boolean; txHashes?: string[] }> {
  const res = await fetch(`${BACKEND_URL}/api/demo/trigger-volume`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ swaps: swapCount, amountUsdc: parseFloat(amount) }),
  });
  if (!res.ok) throw new Error('Failed to trigger volume');
  return res.json();
}

export async function triggerRebalance(): Promise<{ success: boolean; txHash?: string }> {
  const res = await fetch(`${BACKEND_URL}/api/demo/trigger-rebalance`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to trigger rebalance');
  return res.json();
}

export async function runCycle(_dryRun: boolean = false): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${BACKEND_URL}/api/demo/run-cycle`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dryRun: _dryRun }),
  });
  if (!res.ok) throw new Error('Failed to run cycle');
  return res.json();
}
