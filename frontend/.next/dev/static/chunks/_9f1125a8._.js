(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/lib/api.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
const BACKEND_URL = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/goldsky.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$graphql$2d$request$2f$build$2f$entrypoints$2f$main$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/graphql-request/build/entrypoints/main.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$graphql$2d$request$2f$build$2f$legacy$2f$classes$2f$GraphQLClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/graphql-request/build/legacy/classes/GraphQLClient.js [app-client] (ecmascript)");
;
const GOLDSKY_ENDPOINT = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_GOLDSKY_ENDPOINT || '';
const client = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$graphql$2d$request$2f$build$2f$legacy$2f$classes$2f$GraphQLClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GraphQLClient"](GOLDSKY_ENDPOINT);
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ui/button.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Button",
    ()=>Button,
    "buttonVariants",
    ()=>buttonVariants
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slot$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-slot/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/class-variance-authority/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-client] (ecmascript)");
;
;
;
;
const buttonVariants = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cva"])("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive", {
    variants: {
        variant: {
            default: 'bg-primary text-primary-foreground hover:bg-primary/90',
            destructive: 'bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
            outline: 'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50',
            secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
            ghost: 'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
            link: 'text-primary underline-offset-4 hover:underline'
        },
        size: {
            default: 'h-9 px-4 py-2 has-[>svg]:px-3',
            sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
            lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
            icon: 'size-9',
            'icon-sm': 'size-8',
            'icon-lg': 'size-10'
        }
    },
    defaultVariants: {
        variant: 'default',
        size: 'default'
    }
});
function Button({ className, variant, size, asChild = false, ...props }) {
    const Comp = asChild ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slot$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Slot"] : 'button';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Comp, {
        "data-slot": "button",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])(buttonVariants({
            variant,
            size,
            className
        })),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/button.tsx",
        lineNumber: 52,
        columnNumber: 5
    }, this);
}
_c = Button;
;
var _c;
__turbopack_context__.k.register(_c, "Button");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/(kitex)/demo/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>DemoPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/useMutation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/useQuery.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$goldsky$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/goldsky.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowUp$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-up.js [app-client] (ecmascript) <export default as ArrowUp>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowDown$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-down.js [app-client] (ecmascript) <export default as ArrowDown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$activity$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Activity$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/activity.js [app-client] (ecmascript) <export default as Activity>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/refresh-cw.js [app-client] (ecmascript) <export default as RefreshCw>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$play$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Play$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/play.js [app-client] (ecmascript) <export default as Play>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
;
function DemoPage() {
    _s();
    const [message, setMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const { data: demoInfo } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: [
            "demo-info"
        ],
        queryFn: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDemoInfo"]
    });
    const { data: events = [] } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: [
            "latest-demo-events"
        ],
        queryFn: {
            "DemoPage.useQuery": ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$goldsky$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getLatestEvents"])(0)
        }["DemoPage.useQuery"],
        refetchInterval: 3000
    });
    const divergenceMutation = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: {
            "DemoPage.useMutation[divergenceMutation]": ({ direction })=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["triggerDivergence"])(direction, "0.1")
        }["DemoPage.useMutation[divergenceMutation]"],
        onSuccess: {
            "DemoPage.useMutation[divergenceMutation]": ()=>{
                setMessage({
                    type: "success",
                    text: "Price divergence triggered successfully!"
                });
                setTimeout({
                    "DemoPage.useMutation[divergenceMutation]": ()=>setMessage(null)
                }["DemoPage.useMutation[divergenceMutation]"], 5000);
            }
        }["DemoPage.useMutation[divergenceMutation]"],
        onError: {
            "DemoPage.useMutation[divergenceMutation]": (error)=>{
                setMessage({
                    type: "error",
                    text: error.message || "Failed to trigger divergence"
                });
                setTimeout({
                    "DemoPage.useMutation[divergenceMutation]": ()=>setMessage(null)
                }["DemoPage.useMutation[divergenceMutation]"], 5000);
            }
        }["DemoPage.useMutation[divergenceMutation]"]
    });
    const volumeMutation = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: {
            "DemoPage.useMutation[volumeMutation]": ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["triggerVolume"])(5, "0.05")
        }["DemoPage.useMutation[volumeMutation]"],
        onSuccess: {
            "DemoPage.useMutation[volumeMutation]": ()=>{
                setMessage({
                    type: "success",
                    text: "High volume swaps triggered successfully!"
                });
                setTimeout({
                    "DemoPage.useMutation[volumeMutation]": ()=>setMessage(null)
                }["DemoPage.useMutation[volumeMutation]"], 5000);
            }
        }["DemoPage.useMutation[volumeMutation]"],
        onError: {
            "DemoPage.useMutation[volumeMutation]": (error)=>{
                setMessage({
                    type: "error",
                    text: error.message || "Failed to trigger volume"
                });
                setTimeout({
                    "DemoPage.useMutation[volumeMutation]": ()=>setMessage(null)
                }["DemoPage.useMutation[volumeMutation]"], 5000);
            }
        }["DemoPage.useMutation[volumeMutation]"]
    });
    const rebalanceMutation = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["triggerRebalance"],
        onSuccess: {
            "DemoPage.useMutation[rebalanceMutation]": ()=>{
                setMessage({
                    type: "success",
                    text: "Rebalance triggered successfully!"
                });
                setTimeout({
                    "DemoPage.useMutation[rebalanceMutation]": ()=>setMessage(null)
                }["DemoPage.useMutation[rebalanceMutation]"], 5000);
            }
        }["DemoPage.useMutation[rebalanceMutation]"],
        onError: {
            "DemoPage.useMutation[rebalanceMutation]": (error)=>{
                setMessage({
                    type: "error",
                    text: error.message || "Failed to trigger rebalance"
                });
                setTimeout({
                    "DemoPage.useMutation[rebalanceMutation]": ()=>setMessage(null)
                }["DemoPage.useMutation[rebalanceMutation]"], 5000);
            }
        }["DemoPage.useMutation[rebalanceMutation]"]
    });
    const cycleMutation = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: {
            "DemoPage.useMutation[cycleMutation]": ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["runCycle"])(false)
        }["DemoPage.useMutation[cycleMutation]"],
        onSuccess: {
            "DemoPage.useMutation[cycleMutation]": ()=>{
                setMessage({
                    type: "success",
                    text: "Orchestrator cycle completed successfully!"
                });
                setTimeout({
                    "DemoPage.useMutation[cycleMutation]": ()=>setMessage(null)
                }["DemoPage.useMutation[cycleMutation]"], 5000);
            }
        }["DemoPage.useMutation[cycleMutation]"],
        onError: {
            "DemoPage.useMutation[cycleMutation]": (error)=>{
                setMessage({
                    type: "error",
                    text: error.message || "Failed to run cycle"
                });
                setTimeout({
                    "DemoPage.useMutation[cycleMutation]": ()=>setMessage(null)
                }["DemoPage.useMutation[cycleMutation]"], 5000);
            }
        }["DemoPage.useMutation[cycleMutation]"]
    });
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "relative min-h-screen",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid-bg fixed inset-0 opacity-30",
                "aria-hidden": "true"
            }, void 0, false, {
                fileName: "[project]/app/(kitex)/demo/page.tsx",
                lineNumber: 77,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative z-10 max-w-[1800px] mx-auto p-8 md:p-12",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mb-12",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                className: "font-[var(--font-bebas)] text-5xl text-foreground tracking-wide mb-2",
                                children: "DEMO CONTROLS"
                            }, void 0, false, {
                                fileName: "[project]/app/(kitex)/demo/page.tsx",
                                lineNumber: 82,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "font-mono text-sm text-muted-foreground mb-4",
                                children: "Hackathon demonstration controls — all actions execute real mainnet transactions"
                            }, void 0, false, {
                                fileName: "[project]/app/(kitex)/demo/page.tsx",
                                lineNumber: 85,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "border border-accent/50 bg-accent/10 p-4 mb-4",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "font-mono text-xs text-accent",
                                    children: "⚠️ WARNING: These buttons trigger REAL on-chain transactions on Kite mainnet. Use sparingly during demo."
                                }, void 0, false, {
                                    fileName: "[project]/app/(kitex)/demo/page.tsx",
                                    lineNumber: 91,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/(kitex)/demo/page.tsx",
                                lineNumber: 90,
                                columnNumber: 11
                            }, this),
                            message && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("border p-4 mb-4", message.type === "success" ? "border-green-400/50 bg-green-400/10 text-green-400" : "border-destructive/50 bg-destructive/10 text-destructive"),
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "font-mono text-xs",
                                    children: message.text
                                }, void 0, false, {
                                    fileName: "[project]/app/(kitex)/demo/page.tsx",
                                    lineNumber: 104,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/(kitex)/demo/page.tsx",
                                lineNumber: 98,
                                columnNumber: 13
                            }, this),
                            demoInfo && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid grid-cols-1 md:grid-cols-3 gap-4 mb-8",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "border border-border bg-card p-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2",
                                                children: "CapitalRouter"
                                            }, void 0, false, {
                                                fileName: "[project]/app/(kitex)/demo/page.tsx",
                                                lineNumber: 112,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                href: `https://kitescan.ai/address/${demoInfo.capitalRouter}`,
                                                target: "_blank",
                                                className: "font-mono text-xs text-accent hover:underline break-all",
                                                children: demoInfo.capitalRouter
                                            }, void 0, false, {
                                                fileName: "[project]/app/(kitex)/demo/page.tsx",
                                                lineNumber: 115,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/(kitex)/demo/page.tsx",
                                        lineNumber: 111,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "border border-border bg-card p-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2",
                                                children: "KitexAuditLog"
                                            }, void 0, false, {
                                                fileName: "[project]/app/(kitex)/demo/page.tsx",
                                                lineNumber: 124,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                href: `https://kitescan.ai/address/${demoInfo.auditLog}`,
                                                target: "_blank",
                                                className: "font-mono text-xs text-accent hover:underline break-all",
                                                children: demoInfo.auditLog
                                            }, void 0, false, {
                                                fileName: "[project]/app/(kitex)/demo/page.tsx",
                                                lineNumber: 127,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/(kitex)/demo/page.tsx",
                                        lineNumber: 123,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "border border-border bg-card p-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2",
                                                children: "Goldsky Endpoint"
                                            }, void 0, false, {
                                                fileName: "[project]/app/(kitex)/demo/page.tsx",
                                                lineNumber: 136,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "font-mono text-xs text-muted-foreground truncate",
                                                children: demoInfo.goldskyEndpoint?.split("/").pop()
                                            }, void 0, false, {
                                                fileName: "[project]/app/(kitex)/demo/page.tsx",
                                                lineNumber: 139,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/(kitex)/demo/page.tsx",
                                        lineNumber: 135,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/(kitex)/demo/page.tsx",
                                lineNumber: 110,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/(kitex)/demo/page.tsx",
                        lineNumber: 81,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "border border-border bg-card p-6",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-4",
                                        children: "1. Trigger Price Divergence"
                                    }, void 0, false, {
                                        fileName: "[project]/app/(kitex)/demo/page.tsx",
                                        lineNumber: 151,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "font-mono text-xs text-muted-foreground mb-6",
                                        children: "Executes a real swap that pushes pool price outside LP range. ArbitrageAgent will detect and self-arb within 1-2 cycles."
                                    }, void 0, false, {
                                        fileName: "[project]/app/(kitex)/demo/page.tsx",
                                        lineNumber: 154,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex gap-3",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                onClick: ()=>divergenceMutation.mutate({
                                                        direction: "up"
                                                    }),
                                                disabled: divergenceMutation.isPending,
                                                className: "flex-1 bg-background border border-green-400 text-green-400 hover:bg-green-400/10 font-mono text-xs uppercase tracking-widest h-12",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowUp$3e$__["ArrowUp"], {
                                                        className: "w-4 h-4 mr-2"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/(kitex)/demo/page.tsx",
                                                        lineNumber: 164,
                                                        columnNumber: 17
                                                    }, this),
                                                    "Push Up"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/(kitex)/demo/page.tsx",
                                                lineNumber: 159,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                onClick: ()=>divergenceMutation.mutate({
                                                        direction: "down"
                                                    }),
                                                disabled: divergenceMutation.isPending,
                                                className: "flex-1 bg-background border border-destructive text-destructive hover:bg-destructive/10 font-mono text-xs uppercase tracking-widest h-12",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowDown$3e$__["ArrowDown"], {
                                                        className: "w-4 h-4 mr-2"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/(kitex)/demo/page.tsx",
                                                        lineNumber: 172,
                                                        columnNumber: 17
                                                    }, this),
                                                    "Push Down"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/(kitex)/demo/page.tsx",
                                                lineNumber: 167,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/(kitex)/demo/page.tsx",
                                        lineNumber: 158,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/(kitex)/demo/page.tsx",
                                lineNumber: 150,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "border border-border bg-card p-6",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-4",
                                        children: "2. Simulate High Volume"
                                    }, void 0, false, {
                                        fileName: "[project]/app/(kitex)/demo/page.tsx",
                                        lineNumber: 180,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "font-mono text-xs text-muted-foreground mb-6",
                                        children: "Executes 5 consecutive swaps to accumulate delta exposure. RiskAgent will detect and log a hedge intent."
                                    }, void 0, false, {
                                        fileName: "[project]/app/(kitex)/demo/page.tsx",
                                        lineNumber: 183,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                        onClick: ()=>volumeMutation.mutate(),
                                        disabled: volumeMutation.isPending,
                                        className: "w-full bg-background border border-accent text-accent hover:bg-accent/10 font-mono text-xs uppercase tracking-widest h-12",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$activity$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Activity$3e$__["Activity"], {
                                                className: "w-4 h-4 mr-2"
                                            }, void 0, false, {
                                                fileName: "[project]/app/(kitex)/demo/page.tsx",
                                                lineNumber: 192,
                                                columnNumber: 15
                                            }, this),
                                            volumeMutation.isPending ? "Executing..." : "Trigger Volume"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/(kitex)/demo/page.tsx",
                                        lineNumber: 187,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/(kitex)/demo/page.tsx",
                                lineNumber: 179,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "border border-border bg-card p-6",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-4",
                                        children: "3. Force Rebalance"
                                    }, void 0, false, {
                                        fileName: "[project]/app/(kitex)/demo/page.tsx",
                                        lineNumber: 199,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "font-mono text-xs text-muted-foreground mb-6",
                                        children: "Forces LiquidityAgent to remove current LP position and place a new one immediately, ignoring cooldown."
                                    }, void 0, false, {
                                        fileName: "[project]/app/(kitex)/demo/page.tsx",
                                        lineNumber: 202,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                        onClick: ()=>rebalanceMutation.mutate(),
                                        disabled: rebalanceMutation.isPending,
                                        className: "w-full bg-background border border-blue-400 text-blue-400 hover:bg-blue-400/10 font-mono text-xs uppercase tracking-widest h-12",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__["RefreshCw"], {
                                                className: "w-4 h-4 mr-2"
                                            }, void 0, false, {
                                                fileName: "[project]/app/(kitex)/demo/page.tsx",
                                                lineNumber: 211,
                                                columnNumber: 15
                                            }, this),
                                            rebalanceMutation.isPending ? "Rebalancing..." : "Force Rebalance"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/(kitex)/demo/page.tsx",
                                        lineNumber: 206,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/(kitex)/demo/page.tsx",
                                lineNumber: 198,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/(kitex)/demo/page.tsx",
                        lineNumber: 148,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "border border-accent/50 bg-accent/5 p-6 mb-8",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center justify-between",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2",
                                            children: "Manual Cycle Trigger"
                                        }, void 0, false, {
                                            fileName: "[project]/app/(kitex)/demo/page.tsx",
                                            lineNumber: 221,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "font-mono text-xs text-muted-foreground",
                                            children: "Run one full orchestrator cycle on demand (useful if 15s interval feels too slow during demo)"
                                        }, void 0, false, {
                                            fileName: "[project]/app/(kitex)/demo/page.tsx",
                                            lineNumber: 224,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/(kitex)/demo/page.tsx",
                                    lineNumber: 220,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                    onClick: ()=>cycleMutation.mutate(),
                                    disabled: cycleMutation.isPending,
                                    className: "bg-accent text-accent-foreground hover:bg-accent/90 font-mono text-xs uppercase tracking-widest h-12 px-8",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$play$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Play$3e$__["Play"], {
                                            className: "w-4 h-4 mr-2"
                                        }, void 0, false, {
                                            fileName: "[project]/app/(kitex)/demo/page.tsx",
                                            lineNumber: 233,
                                            columnNumber: 15
                                        }, this),
                                        cycleMutation.isPending ? "Running..." : "Run Cycle Now"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/(kitex)/demo/page.tsx",
                                    lineNumber: 228,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/(kitex)/demo/page.tsx",
                            lineNumber: 219,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/(kitex)/demo/page.tsx",
                        lineNumber: 218,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "border border-border bg-card/50 p-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-4",
                                children: "Live Transaction Feed (Last 10 Events)"
                            }, void 0, false, {
                                fileName: "[project]/app/(kitex)/demo/page.tsx",
                                lineNumber: 241,
                                columnNumber: 11
                            }, this),
                            events.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-2",
                                children: events.slice(0, 10).map((event)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "border-l-2 border-accent bg-background/50 p-3",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center justify-between",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex-1",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "font-mono text-xs text-foreground mb-1",
                                                            children: [
                                                                event.agent.agentType,
                                                                " — ",
                                                                event.eventType
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/(kitex)/demo/page.tsx",
                                                            lineNumber: 251,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                            href: `https://kitescan.ai/tx/${event.txHash}`,
                                                            target: "_blank",
                                                            className: "font-mono text-[10px] text-accent hover:underline",
                                                            children: event.txHash
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/(kitex)/demo/page.tsx",
                                                            lineNumber: 254,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/(kitex)/demo/page.tsx",
                                                    lineNumber: 250,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-right",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "font-mono text-[10px] text-muted-foreground",
                                                            children: new Date(parseInt(event.timestamp) * 1000).toLocaleTimeString()
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/(kitex)/demo/page.tsx",
                                                            lineNumber: 263,
                                                            columnNumber: 23
                                                        }, this),
                                                        event.profit && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "font-mono text-[10px] text-green-400 mt-1",
                                                            children: [
                                                                "+$",
                                                                parseFloat(event.profit).toFixed(4)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/(kitex)/demo/page.tsx",
                                                            lineNumber: 267,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/(kitex)/demo/page.tsx",
                                                    lineNumber: 262,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/(kitex)/demo/page.tsx",
                                            lineNumber: 249,
                                            columnNumber: 19
                                        }, this)
                                    }, event.id, false, {
                                        fileName: "[project]/app/(kitex)/demo/page.tsx",
                                        lineNumber: 248,
                                        columnNumber: 17
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/app/(kitex)/demo/page.tsx",
                                lineNumber: 246,
                                columnNumber: 13
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "py-12 text-center font-mono text-xs text-muted-foreground",
                                children: "No transactions yet. Trigger an action above to see live events appear here."
                            }, void 0, false, {
                                fileName: "[project]/app/(kitex)/demo/page.tsx",
                                lineNumber: 277,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/(kitex)/demo/page.tsx",
                        lineNumber: 240,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/(kitex)/demo/page.tsx",
                lineNumber: 79,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/(kitex)/demo/page.tsx",
        lineNumber: 76,
        columnNumber: 5
    }, this);
}
_s(DemoPage, "oAFEOg2CIRce4ijbxGJDbH8IW6E=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"]
    ];
});
_c = DemoPage;
var _c;
__turbopack_context__.k.register(_c, "DemoPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_9f1125a8._.js.map