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
"[project]/components/kitex/stat-card.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "StatCard",
    ()=>StatCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-client] (ecmascript)");
;
;
function StatCard({ label, value, trend, subtitle, className }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("border border-border bg-card p-6 transition-colors hover:border-accent/50", className),
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3",
                children: label
            }, void 0, false, {
                fileName: "[project]/components/kitex/stat-card.tsx",
                lineNumber: 19,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("font-mono text-3xl font-medium", trend === "up" && "text-green-400", trend === "down" && "text-destructive", !trend && "text-foreground"),
                children: value
            }, void 0, false, {
                fileName: "[project]/components/kitex/stat-card.tsx",
                lineNumber: 22,
                columnNumber: 7
            }, this),
            subtitle && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "font-mono text-xs text-muted-foreground mt-2",
                children: subtitle
            }, void 0, false, {
                fileName: "[project]/components/kitex/stat-card.tsx",
                lineNumber: 33,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/kitex/stat-card.tsx",
        lineNumber: 13,
        columnNumber: 5
    }, this);
}
_c = StatCard;
var _c;
__turbopack_context__.k.register(_c, "StatCard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/kitex/agent-card.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AgentCard",
    ()=>AgentCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-client] (ecmascript)");
;
;
;
const AGENT_COLORS = {
    LiquidityAgent: "text-blue-400 border-blue-400/50",
    ArbitrageAgent: "text-accent border-accent/50",
    RiskAgent: "text-emerald-400 border-emerald-400/50"
};
function AgentCard({ agent, className }) {
    const colorClass = AGENT_COLORS[agent.agentType] || "text-foreground border-border";
    // Calculate reputation trend (simplified for now)
    const reputationTrend = agent.reputationScore > 100 ? "up" : agent.reputationScore < 100 ? "down" : "neutral";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
        href: `/agent/${agent.did}`,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("border bg-card p-6 transition-all duration-200 hover:border-accent/70 hover:shadow-lg hover:shadow-accent/10", colorClass, className),
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center justify-between mb-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "font-mono text-xs uppercase tracking-widest text-muted-foreground mb-1",
                                    children: agent.agentType
                                }, void 0, false, {
                                    fileName: "[project]/components/kitex/agent-card.tsx",
                                    lineNumber: 34,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "font-mono text-[10px] text-muted-foreground/60 truncate max-w-[200px]",
                                    children: [
                                        agent.did.slice(0, 20),
                                        "..."
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/kitex/agent-card.tsx",
                                    lineNumber: 37,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/kitex/agent-card.tsx",
                            lineNumber: 33,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("px-2 py-1 border text-[9px] font-mono uppercase tracking-widest", agent.status === "ACTIVE" && "border-green-400 text-green-400", agent.status === "IDLE" && "border-muted-foreground/50 text-muted-foreground", agent.status === "REBALANCING" && "border-accent text-accent"),
                            children: agent.status
                        }, void 0, false, {
                            fileName: "[project]/components/kitex/agent-card.tsx",
                            lineNumber: 41,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/kitex/agent-card.tsx",
                    lineNumber: 32,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mb-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2",
                            children: "Reputation"
                        }, void 0, false, {
                            fileName: "[project]/components/kitex/agent-card.tsx",
                            lineNumber: 55,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("font-mono text-4xl font-medium", reputationTrend === "up" && "text-green-400", reputationTrend === "down" && "text-destructive", reputationTrend === "neutral" && "text-foreground"),
                            children: agent.reputationScore
                        }, void 0, false, {
                            fileName: "[project]/components/kitex/agent-card.tsx",
                            lineNumber: 58,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/kitex/agent-card.tsx",
                    lineNumber: 54,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mb-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2",
                            children: "Capital Allocation"
                        }, void 0, false, {
                            fileName: "[project]/components/kitex/agent-card.tsx",
                            lineNumber: 72,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "font-mono text-lg text-foreground",
                            children: [
                                agent.currentAllocation,
                                " USDC.e"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/kitex/agent-card.tsx",
                            lineNumber: 75,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "font-mono text-xs text-muted-foreground",
                            children: [
                                (agent.currentAllocationBps / 100).toFixed(1),
                                "% of treasury"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/kitex/agent-card.tsx",
                            lineNumber: 78,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/kitex/agent-card.tsx",
                    lineNumber: 71,
                    columnNumber: 9
                }, this),
                agent.lastAction && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "border-t border-border/30 pt-4 mt-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1",
                            children: "Last Action"
                        }, void 0, false, {
                            fileName: "[project]/components/kitex/agent-card.tsx",
                            lineNumber: 86,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "font-mono text-xs text-foreground",
                            children: agent.lastAction.type
                        }, void 0, false, {
                            fileName: "[project]/components/kitex/agent-card.tsx",
                            lineNumber: 89,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "font-mono text-[10px] text-muted-foreground mt-1",
                            children: new Date(agent.lastAction.timestamp * 1000).toLocaleString()
                        }, void 0, false, {
                            fileName: "[project]/components/kitex/agent-card.tsx",
                            lineNumber: 90,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/kitex/agent-card.tsx",
                    lineNumber: 85,
                    columnNumber: 11
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/kitex/agent-card.tsx",
            lineNumber: 24,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/kitex/agent-card.tsx",
        lineNumber: 23,
        columnNumber: 5
    }, this);
}
_c = AgentCard;
var _c;
__turbopack_context__.k.register(_c, "AgentCard");
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
"[project]/components/kitex/live-feed.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LiveFeed",
    ()=>LiveFeed
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/useQuery.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$goldsky$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/goldsky.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
const AGENT_COLORS = {
    LiquidityAgent: "border-l-blue-400 text-blue-300",
    ArbitrageAgent: "border-l-accent text-accent",
    RiskAgent: "border-l-emerald-400 text-emerald-300"
};
function LiveFeed() {
    _s();
    const { data: events = [], isLoading } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: [
            "latest-events"
        ],
        queryFn: {
            "LiveFeed.useQuery": ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$goldsky$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getLatestEvents"])(0)
        }["LiveFeed.useQuery"],
        refetchInterval: 3000
    });
    if (isLoading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "border border-border bg-card/50 p-6",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-4",
                    children: "Live Activity Feed"
                }, void 0, false, {
                    fileName: "[project]/components/kitex/live-feed.tsx",
                    lineNumber: 24,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "font-mono text-xs text-muted-foreground",
                    children: "Loading events..."
                }, void 0, false, {
                    fileName: "[project]/components/kitex/live-feed.tsx",
                    lineNumber: 27,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/kitex/live-feed.tsx",
            lineNumber: 23,
            columnNumber: 7
        }, this);
    }
    if (events.length === 0) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "border border-border bg-card/50 p-6",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-4",
                    children: "Live Activity Feed"
                }, void 0, false, {
                    fileName: "[project]/components/kitex/live-feed.tsx",
                    lineNumber: 35,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "font-mono text-xs text-muted-foreground",
                    children: "No events yet. Waiting for orchestrator to run..."
                }, void 0, false, {
                    fileName: "[project]/components/kitex/live-feed.tsx",
                    lineNumber: 38,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/kitex/live-feed.tsx",
            lineNumber: 34,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "border border-border bg-card/50 p-6",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-4",
                children: "Live Activity Feed"
            }, void 0, false, {
                fileName: "[project]/components/kitex/live-feed.tsx",
                lineNumber: 47,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "space-y-3 max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-background",
                children: events.map((event)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(EventRow, {
                        event: event
                    }, event.id, false, {
                        fileName: "[project]/components/kitex/live-feed.tsx",
                        lineNumber: 53,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/components/kitex/live-feed.tsx",
                lineNumber: 51,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/kitex/live-feed.tsx",
        lineNumber: 46,
        columnNumber: 5
    }, this);
}
_s(LiveFeed, "RqB8HmEN2iIwtEwv9Rk8g8JDe0A=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"]
    ];
});
_c = LiveFeed;
function EventRow({ event }) {
    const colorClass = AGENT_COLORS[event.agent.agentType] || "border-l-foreground text-foreground";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
        href: `https://kitescan.ai/tx/${event.txHash}`,
        target: "_blank",
        className: "block border-l-4 border-border bg-background/50 p-3 hover:border-l-accent hover:bg-background/80 transition-all",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-start justify-between gap-4",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex-1",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-2 mb-1",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("font-mono text-xs uppercase tracking-wide", colorClass),
                                    children: event.agent.agentType
                                }, void 0, false, {
                                    fileName: "[project]/components/kitex/live-feed.tsx",
                                    lineNumber: 73,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "font-mono text-[10px] text-muted-foreground",
                                    children: event.eventType
                                }, void 0, false, {
                                    fileName: "[project]/components/kitex/live-feed.tsx",
                                    lineNumber: 76,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/kitex/live-feed.tsx",
                            lineNumber: 72,
                            columnNumber: 11
                        }, this),
                        event.profit && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "font-mono text-xs text-green-400 mb-1",
                            children: [
                                "Profit: $",
                                parseFloat(event.profit).toFixed(4)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/kitex/live-feed.tsx",
                            lineNumber: 82,
                            columnNumber: 13
                        }, this),
                        event.metricValue && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "font-mono text-xs text-muted-foreground mb-1",
                            children: [
                                "Value: ",
                                parseFloat(event.metricValue).toFixed(4)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/kitex/live-feed.tsx",
                            lineNumber: 88,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "font-mono text-[10px] text-muted-foreground/60",
                            children: [
                                event.txHash.slice(0, 16),
                                "...",
                                event.txHash.slice(-8)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/kitex/live-feed.tsx",
                            lineNumber: 93,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/kitex/live-feed.tsx",
                    lineNumber: 71,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-right",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "font-mono text-[10px] text-muted-foreground",
                        children: new Date(parseInt(event.timestamp) * 1000).toLocaleTimeString()
                    }, void 0, false, {
                        fileName: "[project]/components/kitex/live-feed.tsx",
                        lineNumber: 99,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/components/kitex/live-feed.tsx",
                    lineNumber: 98,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/kitex/live-feed.tsx",
            lineNumber: 70,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/kitex/live-feed.tsx",
        lineNumber: 65,
        columnNumber: 5
    }, this);
}
_c1 = EventRow;
var _c, _c1;
__turbopack_context__.k.register(_c, "LiveFeed");
__turbopack_context__.k.register(_c1, "EventRow");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>HomePage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/useQuery.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$kitex$2f$stat$2d$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/kitex/stat-card.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$kitex$2f$agent$2d$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/kitex/agent-card.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$kitex$2f$live$2d$feed$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/kitex/live-feed.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$chart$2f$PieChart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/chart/PieChart.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$polar$2f$Pie$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/polar/Pie.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Cell$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/component/Cell.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$ResponsiveContainer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/component/ResponsiveContainer.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Legend$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/component/Legend.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Tooltip$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/component/Tooltip.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
const COLORS = {
    LiquidityAgent: "oklch(0.55 0.8 250)",
    ArbitrageAgent: "oklch(0.7 0.2 45)",
    RiskAgent: "oklch(0.55 0.8 140)"
};
function HomePage() {
    _s();
    const { data: dashboard, isLoading, error } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: [
            "dashboard"
        ],
        queryFn: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDashboard"],
        refetchInterval: 3000
    });
    if (isLoading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center justify-center min-h-screen",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "font-mono text-sm text-muted-foreground",
                children: "Loading dashboard..."
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 26,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/app/page.tsx",
            lineNumber: 25,
            columnNumber: 7
        }, this);
    }
    if (error || !dashboard) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center justify-center min-h-screen",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "border border-destructive/50 bg-destructive/10 p-6 max-w-md",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "font-mono text-sm text-destructive mb-4",
                        children: "Failed to load dashboard. Ensure backend is running."
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 35,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "font-mono text-xs text-muted-foreground",
                        children: [
                            "Backend URL: ",
                            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 38,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 34,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/app/page.tsx",
            lineNumber: 33,
            columnNumber: 7
        }, this);
    }
    // Prepare data for pie chart
    const allocationData = dashboard.agents?.map((agent)=>({
            name: agent.agentType,
            value: agent.currentAllocationBps / 100
        })) || [];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "relative min-h-screen",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid-bg fixed inset-0 opacity-30",
                "aria-hidden": "true"
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 54,
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
                                children: "KITEX DASHBOARD"
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 59,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "font-mono text-sm text-muted-foreground",
                                children: "Autonomous market making on Kite AI — three agents, one treasury, zero human intervention"
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 62,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 58,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$kitex$2f$stat$2d$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["StatCard"], {
                                label: "Total Treasury",
                                value: `$${parseFloat(dashboard.treasuryValue || "0").toFixed(2)}`,
                                subtitle: "USDC.e"
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 69,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$kitex$2f$stat$2d$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["StatCard"], {
                                label: "Fees Today",
                                value: `$${parseFloat(dashboard.feesToday || "0").toFixed(4)}`,
                                trend: "up"
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 74,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$kitex$2f$stat$2d$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["StatCard"], {
                                label: "Arb Profit Today",
                                value: `$${parseFloat(dashboard.arbProfitToday || "0").toFixed(4)}`,
                                trend: "up"
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 79,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$kitex$2f$stat$2d$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["StatCard"], {
                                label: "Net PnL Today",
                                value: `$${parseFloat(dashboard.netPnLToday || "0").toFixed(4)}`,
                                trend: parseFloat(dashboard.netPnLToday || "0") > 0 ? "up" : parseFloat(dashboard.netPnLToday || "0") < 0 ? "down" : "neutral"
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 84,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 68,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mb-8",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-4",
                                children: "Active Agents"
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 93,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",
                                children: dashboard.agents?.map((agent)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$kitex$2f$agent$2d$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AgentCard"], {
                                        agent: agent
                                    }, agent.did, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 98,
                                        columnNumber: 15
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 96,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 92,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-1 lg:grid-cols-5 gap-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "lg:col-span-3",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$kitex$2f$live$2d$feed$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LiveFeed"], {}, void 0, false, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 107,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 106,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "lg:col-span-2",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "border border-border bg-card/50 p-6 h-full",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-4",
                                            children: "Treasury Allocation"
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 113,
                                            columnNumber: 15
                                        }, this),
                                        allocationData.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$ResponsiveContainer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ResponsiveContainer"], {
                                            width: "100%",
                                            height: 300,
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$chart$2f$PieChart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PieChart"], {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$polar$2f$Pie$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Pie"], {
                                                        data: allocationData,
                                                        cx: "50%",
                                                        cy: "50%",
                                                        labelLine: false,
                                                        label: (entry)=>`${entry.value.toFixed(1)}%`,
                                                        outerRadius: 80,
                                                        fill: "#8884d8",
                                                        dataKey: "value",
                                                        children: allocationData.map((entry, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Cell$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Cell"], {
                                                                fill: COLORS[entry.name] || "oklch(0.5 0 0)"
                                                            }, `cell-${index}`, false, {
                                                                fileName: "[project]/app/page.tsx",
                                                                lineNumber: 131,
                                                                columnNumber: 25
                                                            }, this))
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/page.tsx",
                                                        lineNumber: 120,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Tooltip$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Tooltip"], {
                                                        contentStyle: {
                                                            backgroundColor: "oklch(0.1 0 0)",
                                                            border: "1px solid oklch(0.25 0 0)",
                                                            borderRadius: 0,
                                                            fontFamily: "var(--font-ibm-plex-mono)",
                                                            fontSize: 11
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/page.tsx",
                                                        lineNumber: 137,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Legend$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Legend"], {
                                                        wrapperStyle: {
                                                            fontFamily: "var(--font-ibm-plex-mono)",
                                                            fontSize: 10
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/page.tsx",
                                                        lineNumber: 146,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 119,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 118,
                                            columnNumber: 17
                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center justify-center h-[300px]",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "font-mono text-xs text-muted-foreground",
                                                children: "No allocation data"
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 156,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 155,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 112,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 111,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 104,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 56,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/page.tsx",
        lineNumber: 53,
        columnNumber: 5
    }, this);
}
_s(HomePage, "EM2K3Hi6KQHndI5IdZUmciKC6dw=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"]
    ];
});
_c = HomePage;
var _c;
__turbopack_context__.k.register(_c, "HomePage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_fdb272ad._.js.map