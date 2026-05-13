module.exports = [
"[project]/lib/api.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "executeDemoAction",
    ()=>executeDemoAction,
    "getAgent",
    ()=>getAgent,
    "getAgentDetail",
    ()=>getAgentDetail,
    "getAgents",
    ()=>getAgents,
    "getDashboard",
    ()=>getDashboard,
    "getDemoInfo",
    ()=>getDemoInfo,
    "getPositions",
    ()=>getPositions,
    "getRecentTransactions",
    ()=>getRecentTransactions,
    "getTreasuryBalance",
    ()=>getTreasuryBalance,
    "runCycle",
    ()=>runCycle,
    "triggerDivergence",
    ()=>triggerDivergence,
    "triggerRebalance",
    ()=>triggerRebalance,
    "triggerVolume",
    ()=>triggerVolume
]);
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
async function getDashboard() {
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
        agents: (data.agents || []).map((a)=>({
                ...a,
                reputationScore: a.reputation,
                currentAllocationBps: a.allocationBps,
                currentAllocation: a.allocationUsd?.toFixed(2) || '0',
                status: a.isActive ? 'ACTIVE' : 'IDLE'
            }))
    };
}
async function getAgents() {
    const res = await fetch(`${BACKEND_URL}/api/agents`);
    if (!res.ok) throw new Error('Failed to fetch agents');
    const data = await res.json();
    // Handle response format
    const agents = Array.isArray(data) ? data : data?.agents || [];
    // Add frontend compatibility fields
    return agents.map((a)=>({
            ...a,
            reputationScore: a.reputation,
            currentAllocationBps: a.allocationBps,
            currentAllocation: a.allocationUsd?.toFixed(2) || '0',
            status: a.status || (a.isActive ? 'ACTIVE' : 'IDLE')
        }));
}
async function getAgent(did) {
    const res = await fetch(`${BACKEND_URL}/api/agents/${encodeURIComponent(did)}`);
    if (!res.ok) throw new Error('Failed to fetch agent');
    const data = await res.json();
    return {
        ...data,
        reputationScore: data.reputation,
        currentAllocationBps: data.allocationBps,
        currentAllocation: data.allocationUsd?.toFixed(2) || '0',
        status: data.isActive ? 'ACTIVE' : 'IDLE'
    };
}
async function getPositions() {
    const res = await fetch(`${BACKEND_URL}/api/positions`);
    if (!res.ok) throw new Error('Failed to fetch positions');
    const data = await res.json();
    return {
        pool: data.pool || {
            address: '',
            currentTick: 0,
            currentPrice: 0,
            liquidity: '0'
        },
        active: (data.active || []).map((p)=>({
                ...p,
                poolPair: `${p.token0?.slice(0, 6) || 'Token0'}/${p.token1?.slice(0, 6) || 'Token1'}`,
                currentPrice: data.pool?.currentPrice || 0,
                feesEarned: '0',
                timeOpen: Date.now() / 1000
            })),
        historical: data.historical || []
    };
}
async function executeDemoAction(action) {
    const res = await fetch(`${BACKEND_URL}/api/demo/execute`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(action)
    });
    if (!res.ok) throw new Error('Failed to execute demo action');
    return res.json();
}
async function getTreasuryBalance() {
    const res = await fetch(`${BACKEND_URL}/api/treasury/balance`);
    if (!res.ok) throw new Error('Failed to fetch treasury balance');
    return res.json();
}
async function getRecentTransactions(limit = 20) {
    const res = await fetch(`${BACKEND_URL}/api/transactions?limit=${limit}`);
    if (!res.ok) throw new Error('Failed to fetch transactions');
    const data = await res.json();
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.transactions)) return data.transactions;
    return [];
}
async function getAgentDetail(did) {
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
            currentAllocation: data.allocationUsd?.toFixed(2) || '0'
        },
        decisions: (data.decisionHistory || []).map((d)=>({
                action: d.action,
                timestamp: d.timestamp,
                profit: d.netPnL?.toString(),
                txHash: d.txHash
            })),
        reputationHistory: data.reputationHistory,
        arbHistory: data.arbHistory,
        lpHistory: data.lpHistory
    };
}
async function getDemoInfo() {
    const res = await fetch(`${BACKEND_URL}/api/demo/info`);
    if (!res.ok) throw new Error('Failed to fetch demo info');
    return res.json();
}
async function triggerDivergence(direction, amount) {
    const res = await fetch(`${BACKEND_URL}/api/demo/divergence`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            direction,
            amount
        })
    });
    if (!res.ok) throw new Error('Failed to trigger divergence');
    return res.json();
}
async function triggerVolume(swapCount, amount) {
    const res = await fetch(`${BACKEND_URL}/api/demo/volume`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            swapCount,
            amount
        })
    });
    if (!res.ok) throw new Error('Failed to trigger volume');
    return res.json();
}
async function triggerRebalance() {
    const res = await fetch(`${BACKEND_URL}/api/demo/rebalance`, {
        method: 'POST'
    });
    if (!res.ok) throw new Error('Failed to trigger rebalance');
    return res.json();
}
async function runCycle(force = false) {
    const res = await fetch(`${BACKEND_URL}/api/demo/cycle`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            force
        })
    });
    if (!res.ok) throw new Error('Failed to run cycle');
    return res.json();
}
}),
"[project]/lib/goldsky.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ALL_LP_EVENTS_QUERY",
    ()=>ALL_LP_EVENTS_QUERY,
    "ARB_HISTORY_QUERY",
    ()=>ARB_HISTORY_QUERY,
    "DELTA_HISTORY_QUERY",
    ()=>DELTA_HISTORY_QUERY,
    "LATEST_EVENTS_QUERY",
    ()=>LATEST_EVENTS_QUERY,
    "LP_HISTORY_QUERY",
    ()=>LP_HISTORY_QUERY,
    "RECENT_SWAPS_QUERY",
    ()=>RECENT_SWAPS_QUERY,
    "REPUTATION_HISTORY_QUERY",
    ()=>REPUTATION_HISTORY_QUERY,
    "computeReferencePrice",
    ()=>computeReferencePrice,
    "getAllLPEvents",
    ()=>getAllLPEvents,
    "getArbHistory",
    ()=>getArbHistory,
    "getDeltaHistory",
    ()=>getDeltaHistory,
    "getLPHistory",
    ()=>getLPHistory,
    "getLatestEvents",
    ()=>getLatestEvents,
    "getRecentSwaps",
    ()=>getRecentSwaps,
    "getReputationHistory",
    ()=>getReputationHistory
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$graphql$2d$request$2f$build$2f$entrypoints$2f$main$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/graphql-request/build/entrypoints/main.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$graphql$2d$request$2f$build$2f$legacy$2f$classes$2f$GraphQLClient$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/graphql-request/build/legacy/classes/GraphQLClient.js [app-ssr] (ecmascript)");
;
const GOLDSKY_ENDPOINT = process.env.NEXT_PUBLIC_GOLDSKY_ENDPOINT || '';
const client = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$graphql$2d$request$2f$build$2f$legacy$2f$classes$2f$GraphQLClient$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["GraphQLClient"](GOLDSKY_ENDPOINT);
const RECENT_SWAPS_QUERY = `
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
async function getRecentSwaps(limit = 20) {
    try {
        const data = await client.request(RECENT_SWAPS_QUERY, {
            limit
        });
        return data.poolSwaps;
    } catch (error) {
        console.warn('Goldsky: Failed to fetch recent swaps', error);
        return [];
    }
}
const REPUTATION_HISTORY_QUERY = `
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
async function getReputationHistory(did) {
    try {
        const data = await client.request(REPUTATION_HISTORY_QUERY, {
            did
        });
        return data.reputationEvents;
    } catch (error) {
        console.warn('Goldsky: Failed to fetch reputation history', error);
        return [];
    }
}
const ARB_HISTORY_QUERY = `
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
async function getArbHistory(did) {
    try {
        const data = await client.request(ARB_HISTORY_QUERY, {
            did
        });
        return data.arbEvents;
    } catch (error) {
        console.warn('Goldsky: Failed to fetch arb history', error);
        return [];
    }
}
const LATEST_EVENTS_QUERY = `
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
async function getLatestEvents(since = 0) {
    try {
        const data = await client.request(LATEST_EVENTS_QUERY, {
            since: since.toString()
        });
        return data.agentEvents;
    } catch (error) {
        console.warn('Goldsky: Failed to fetch latest events', error);
        return [];
    }
}
const DELTA_HISTORY_QUERY = `
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
async function getDeltaHistory(did, limit = 20) {
    try {
        const data = await client.request(DELTA_HISTORY_QUERY, {
            did,
            limit
        });
        return data.hedgeEvents;
    } catch (error) {
        console.warn('Goldsky: Failed to fetch delta history', error);
        return [];
    }
}
const LP_HISTORY_QUERY = `
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
async function getLPHistory(did) {
    try {
        const data = await client.request(LP_HISTORY_QUERY, {
            did
        });
        return data.lpevents;
    } catch (error) {
        console.warn('Goldsky: Failed to fetch LP history', error);
        return [];
    }
}
const ALL_LP_EVENTS_QUERY = `
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
async function getAllLPEvents() {
    try {
        const data = await client.request(ALL_LP_EVENTS_QUERY);
        return data.lpevents;
    } catch (error) {
        console.warn('Goldsky: Failed to fetch all LP events', error);
        return [];
    }
}
function computeReferencePrice(swaps) {
    if (swaps.length === 0) return 0;
    // Convert sqrtPriceX96 to actual price
    const prices = swaps.map((swap)=>{
        const sqrtPriceX96 = BigInt(swap.sqrtPriceX96);
        const price = Number(sqrtPriceX96) ** 2 / 2 ** 192;
        return price;
    });
    // Return median price
    const sorted = prices.sort((a, b)=>a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}
}),
"[project]/app/(kitex)/positions/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>PositionsPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/useQuery.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$goldsky$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/goldsky.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
function PositionsPage() {
    const { data: positions, isLoading } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: [
            "positions"
        ],
        queryFn: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getPositions"]
    });
    const { data: lpEvents = [] } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: [
            "all-lp-events"
        ],
        queryFn: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$goldsky$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAllLPEvents"],
        refetchInterval: 3000
    });
    if (isLoading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center justify-center min-h-screen",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "font-mono text-sm text-muted-foreground",
                children: "Loading positions..."
            }, void 0, false, {
                fileName: "[project]/app/(kitex)/positions/page.tsx",
                lineNumber: 24,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/app/(kitex)/positions/page.tsx",
            lineNumber: 23,
            columnNumber: 7
        }, this);
    }
    const activePositions = positions?.active || [];
    const historicalPositions = positions?.historical || [];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "relative min-h-screen",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid-bg fixed inset-0 opacity-30",
                "aria-hidden": "true"
            }, void 0, false, {
                fileName: "[project]/app/(kitex)/positions/page.tsx",
                lineNumber: 34,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative z-10 max-w-[1800px] mx-auto p-8 md:p-12",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mb-12",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                className: "font-[var(--font-bebas)] text-5xl text-foreground tracking-wide mb-2",
                                children: "LP POSITIONS"
                            }, void 0, false, {
                                fileName: "[project]/app/(kitex)/positions/page.tsx",
                                lineNumber: 39,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "font-mono text-sm text-muted-foreground",
                                children: "All active and historical liquidity positions managed by LiquidityAgent"
                            }, void 0, false, {
                                fileName: "[project]/app/(kitex)/positions/page.tsx",
                                lineNumber: 42,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/(kitex)/positions/page.tsx",
                        lineNumber: 38,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mb-12",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-4",
                                children: [
                                    "Active Positions (",
                                    activePositions.length,
                                    ")"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/(kitex)/positions/page.tsx",
                                lineNumber: 49,
                                columnNumber: 11
                            }, this),
                            activePositions.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid grid-cols-1 lg:grid-cols-2 gap-4",
                                children: activePositions.map((position)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(PositionCard, {
                                        position: position
                                    }, position.tokenId, false, {
                                        fileName: "[project]/app/(kitex)/positions/page.tsx",
                                        lineNumber: 56,
                                        columnNumber: 17
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/app/(kitex)/positions/page.tsx",
                                lineNumber: 54,
                                columnNumber: 13
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "border border-border bg-card/50 p-12 text-center",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "font-mono text-sm text-muted-foreground",
                                    children: "No active positions. Waiting for LiquidityAgent to place first position..."
                                }, void 0, false, {
                                    fileName: "[project]/app/(kitex)/positions/page.tsx",
                                    lineNumber: 61,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/(kitex)/positions/page.tsx",
                                lineNumber: 60,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/(kitex)/positions/page.tsx",
                        lineNumber: 48,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mb-12",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-4",
                                children: [
                                    "Historical Positions (",
                                    historicalPositions.length,
                                    ")"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/(kitex)/positions/page.tsx",
                                lineNumber: 70,
                                columnNumber: 11
                            }, this),
                            historicalPositions.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "border border-border bg-card/50 overflow-hidden",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                                    className: "w-full font-mono text-xs",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                className: "border-b border-border/50 bg-background/50",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                        className: "text-left py-3 px-4 text-muted-foreground font-normal",
                                                        children: "Token ID"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/(kitex)/positions/page.tsx",
                                                        lineNumber: 79,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                        className: "text-left py-3 px-4 text-muted-foreground font-normal",
                                                        children: "Pool Pair"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/(kitex)/positions/page.tsx",
                                                        lineNumber: 80,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                        className: "text-left py-3 px-4 text-muted-foreground font-normal",
                                                        children: "Opened"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/(kitex)/positions/page.tsx",
                                                        lineNumber: 81,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                        className: "text-left py-3 px-4 text-muted-foreground font-normal",
                                                        children: "Closed"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/(kitex)/positions/page.tsx",
                                                        lineNumber: 82,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                        className: "text-left py-3 px-4 text-muted-foreground font-normal",
                                                        children: "Fees Earned"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/(kitex)/positions/page.tsx",
                                                        lineNumber: 83,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                        className: "text-left py-3 px-4 text-muted-foreground font-normal",
                                                        children: "Final PnL"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/(kitex)/positions/page.tsx",
                                                        lineNumber: 84,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/(kitex)/positions/page.tsx",
                                                lineNumber: 78,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/(kitex)/positions/page.tsx",
                                            lineNumber: 77,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                            children: historicalPositions.map((position)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                    className: "border-b border-border/30 hover:bg-background/50",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            className: "py-3 px-4 text-foreground",
                                                            children: [
                                                                "#",
                                                                position.tokenId
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/(kitex)/positions/page.tsx",
                                                            lineNumber: 90,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            className: "py-3 px-4 text-foreground",
                                                            children: position.poolPair
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/(kitex)/positions/page.tsx",
                                                            lineNumber: 91,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            className: "py-3 px-4 text-muted-foreground",
                                                            children: new Date(position.timeOpen * 1000).toLocaleDateString()
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/(kitex)/positions/page.tsx",
                                                            lineNumber: 92,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            className: "py-3 px-4 text-muted-foreground",
                                                            children: new Date(position.timeOpen * 1000).toLocaleDateString()
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/(kitex)/positions/page.tsx",
                                                            lineNumber: 95,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            className: "py-3 px-4 text-green-400",
                                                            children: [
                                                                "$",
                                                                position.feesEarned
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/(kitex)/positions/page.tsx",
                                                            lineNumber: 98,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("py-3 px-4", parseFloat(position.feesEarned) > 0 ? "text-green-400" : "text-muted-foreground"),
                                                            children: [
                                                                "$",
                                                                position.feesEarned
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/(kitex)/positions/page.tsx",
                                                            lineNumber: 99,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, position.tokenId, true, {
                                                    fileName: "[project]/app/(kitex)/positions/page.tsx",
                                                    lineNumber: 89,
                                                    columnNumber: 21
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/app/(kitex)/positions/page.tsx",
                                            lineNumber: 87,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/(kitex)/positions/page.tsx",
                                    lineNumber: 76,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/(kitex)/positions/page.tsx",
                                lineNumber: 75,
                                columnNumber: 13
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "border border-border bg-card/50 p-12 text-center",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "font-mono text-sm text-muted-foreground",
                                    children: "No historical positions yet"
                                }, void 0, false, {
                                    fileName: "[project]/app/(kitex)/positions/page.tsx",
                                    lineNumber: 112,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/(kitex)/positions/page.tsx",
                                lineNumber: 111,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/(kitex)/positions/page.tsx",
                        lineNumber: 69,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-4",
                                children: [
                                    "Recent LP Events (",
                                    lpEvents.length,
                                    ")"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/(kitex)/positions/page.tsx",
                                lineNumber: 121,
                                columnNumber: 11
                            }, this),
                            lpEvents.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "border border-border bg-card/50 p-6",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "space-y-2 max-h-[500px] overflow-y-auto",
                                    children: lpEvents.map((event)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "border-l-2 border-blue-400 bg-background/50 p-4",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-start justify-between",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex-1",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "font-mono text-xs text-foreground mb-1 uppercase",
                                                                children: event.action
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/(kitex)/positions/page.tsx",
                                                                lineNumber: 132,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "font-mono text-[10px] text-muted-foreground mb-2",
                                                                children: [
                                                                    "Range: Tick ",
                                                                    event.tickLower,
                                                                    " → ",
                                                                    event.tickUpper
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/(kitex)/positions/page.tsx",
                                                                lineNumber: 135,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "font-mono text-[10px] text-muted-foreground",
                                                                children: [
                                                                    "Liquidity: ",
                                                                    parseFloat(event.liquidity).toFixed(2)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/(kitex)/positions/page.tsx",
                                                                lineNumber: 138,
                                                                columnNumber: 25
                                                            }, this),
                                                            event.feesCollected && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "font-mono text-[10px] text-green-400 mt-1",
                                                                children: [
                                                                    "Fees: $",
                                                                    parseFloat(event.feesCollected).toFixed(4)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/(kitex)/positions/page.tsx",
                                                                lineNumber: 142,
                                                                columnNumber: 27
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                                href: `https://kitescan.ai/tx/${event.txHash}`,
                                                                target: "_blank",
                                                                className: "font-mono text-[10px] text-accent hover:underline mt-2 inline-block",
                                                                children: [
                                                                    event.txHash.slice(0, 16),
                                                                    "...",
                                                                    event.txHash.slice(-8)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/(kitex)/positions/page.tsx",
                                                                lineNumber: 146,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/(kitex)/positions/page.tsx",
                                                        lineNumber: 131,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-right",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "font-mono text-[10px] text-muted-foreground",
                                                            children: new Date(parseInt(event.timestamp) * 1000).toLocaleString()
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/(kitex)/positions/page.tsx",
                                                            lineNumber: 155,
                                                            columnNumber: 25
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/(kitex)/positions/page.tsx",
                                                        lineNumber: 154,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/(kitex)/positions/page.tsx",
                                                lineNumber: 130,
                                                columnNumber: 21
                                            }, this)
                                        }, event.id, false, {
                                            fileName: "[project]/app/(kitex)/positions/page.tsx",
                                            lineNumber: 129,
                                            columnNumber: 19
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/app/(kitex)/positions/page.tsx",
                                    lineNumber: 127,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/(kitex)/positions/page.tsx",
                                lineNumber: 126,
                                columnNumber: 13
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "border border-border bg-card/50 p-12 text-center",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "font-mono text-sm text-muted-foreground",
                                    children: "No LP events indexed yet"
                                }, void 0, false, {
                                    fileName: "[project]/app/(kitex)/positions/page.tsx",
                                    lineNumber: 166,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/(kitex)/positions/page.tsx",
                                lineNumber: 165,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/(kitex)/positions/page.tsx",
                        lineNumber: 120,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/(kitex)/positions/page.tsx",
                lineNumber: 36,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/(kitex)/positions/page.tsx",
        lineNumber: 33,
        columnNumber: 5
    }, this);
}
function PositionCard({ position }) {
    const inRange = position.inRange;
    const pricePercentage = 50 // Simplified for now
    ;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("border bg-card p-6", inRange ? "border-green-400/50" : "border-destructive/50"),
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-start justify-between mb-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "font-mono text-xs uppercase tracking-widest text-muted-foreground mb-1",
                                children: [
                                    "Position #",
                                    position.tokenId
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/(kitex)/positions/page.tsx",
                                lineNumber: 188,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "font-mono text-lg text-foreground",
                                children: position.poolPair
                            }, void 0, false, {
                                fileName: "[project]/app/(kitex)/positions/page.tsx",
                                lineNumber: 191,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/(kitex)/positions/page.tsx",
                        lineNumber: 187,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("px-2 py-1 border text-[9px] font-mono uppercase tracking-widest", inRange ? "border-green-400 text-green-400" : "border-destructive text-destructive"),
                        children: inRange ? "IN RANGE" : "OUT OF RANGE"
                    }, void 0, false, {
                        fileName: "[project]/app/(kitex)/positions/page.tsx",
                        lineNumber: 193,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/(kitex)/positions/page.tsx",
                lineNumber: 186,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mb-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2",
                        children: "Price Range"
                    }, void 0, false, {
                        fileName: "[project]/app/(kitex)/positions/page.tsx",
                        lineNumber: 203,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "relative h-8 bg-background border border-border",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("absolute top-0 h-full", inRange ? "bg-green-400/20" : "bg-muted/20"),
                                style: {
                                    left: "20%",
                                    width: "60%"
                                }
                            }, void 0, false, {
                                fileName: "[project]/app/(kitex)/positions/page.tsx",
                                lineNumber: 207,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "absolute top-0 h-full w-1 bg-accent",
                                style: {
                                    left: `${pricePercentage}%`
                                }
                            }, void 0, false, {
                                fileName: "[project]/app/(kitex)/positions/page.tsx",
                                lineNumber: 214,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/(kitex)/positions/page.tsx",
                        lineNumber: 206,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex justify-between mt-2 font-mono text-[10px] text-muted-foreground",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: [
                                    "Tick ",
                                    position.tickLower
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/(kitex)/positions/page.tsx",
                                lineNumber: 220,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-accent",
                                children: [
                                    "Current: ",
                                    position.currentPrice.toFixed(4)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/(kitex)/positions/page.tsx",
                                lineNumber: 221,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: [
                                    "Tick ",
                                    position.tickUpper
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/(kitex)/positions/page.tsx",
                                lineNumber: 222,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/(kitex)/positions/page.tsx",
                        lineNumber: 219,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/(kitex)/positions/page.tsx",
                lineNumber: 202,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-2 gap-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1",
                                children: "Liquidity"
                            }, void 0, false, {
                                fileName: "[project]/app/(kitex)/positions/page.tsx",
                                lineNumber: 229,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "font-mono text-sm text-foreground",
                                children: position.liquidity
                            }, void 0, false, {
                                fileName: "[project]/app/(kitex)/positions/page.tsx",
                                lineNumber: 232,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/(kitex)/positions/page.tsx",
                        lineNumber: 228,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1",
                                children: "Fees Earned"
                            }, void 0, false, {
                                fileName: "[project]/app/(kitex)/positions/page.tsx",
                                lineNumber: 235,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "font-mono text-sm text-green-400",
                                children: [
                                    "$",
                                    position.feesEarned
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/(kitex)/positions/page.tsx",
                                lineNumber: 238,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/(kitex)/positions/page.tsx",
                        lineNumber: 234,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/(kitex)/positions/page.tsx",
                lineNumber: 227,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-4 pt-4 border-t border-border/30",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "font-mono text-[10px] text-muted-foreground",
                    children: [
                        "Opened ",
                        new Date(position.timeOpen * 1000).toLocaleString()
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/(kitex)/positions/page.tsx",
                    lineNumber: 244,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/(kitex)/positions/page.tsx",
                lineNumber: 243,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/(kitex)/positions/page.tsx",
        lineNumber: 182,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=_4f3fa1c2._.js.map