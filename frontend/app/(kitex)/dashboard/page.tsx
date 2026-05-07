"use client"

import { useQuery } from "@tanstack/react-query"
import { getDashboard } from "@/lib/api"
import { StatCard } from "@/components/kitex/stat-card"
import { AgentCard } from "@/components/kitex/agent-card"
import { LiveFeed } from "@/components/kitex/live-feed"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

const COLORS = {
  LiquidityAgent: "oklch(0.55 0.8 250)", // Blue
  ArbitrageAgent: "oklch(0.7 0.2 45)", // Orange/Accent
  RiskAgent: "oklch(0.55 0.8 140)", // Emerald
}

export default function DashboardPage() {
  const { data: dashboard, isLoading, error } = useQuery({
    queryKey: ["dashboard"],
    queryFn: getDashboard,
    refetchInterval: 3000,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="font-mono text-sm text-muted-foreground">Loading dashboard...</div>
      </div>
    )
  }

  if (error || !dashboard) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="border border-destructive/50 bg-destructive/10 p-6">
          <div className="font-mono text-sm text-destructive">
            Failed to load dashboard. Ensure backend is running at{" "}
            {process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001"}
          </div>
        </div>
      </div>
    )
  }

  // Prepare data for pie chart
  const allocationData = dashboard.agents.map((agent) => ({
    name: agent.agentType,
    value: agent.currentAllocationBps / 100, // Convert basis points to percentage
  }))

  return (
    <div className="relative min-h-screen">
      <div className="grid-bg fixed inset-0 opacity-30" aria-hidden="true" />

      <div className="relative z-10 max-w-[1800px] mx-auto p-8 md:p-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="font-[var(--font-bebas)] text-5xl text-foreground tracking-wide mb-2">
            KITEX DASHBOARD
          </h1>
          <p className="font-mono text-sm text-muted-foreground">
            Autonomous market making on Kite AI — three agents, one treasury, zero human intervention
          </p>
        </div>

        {/* Top Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Total Treasury"
            value={`$${parseFloat(dashboard.treasuryValue).toFixed(2)}`}
            subtitle="USDC.e"
          />
          <StatCard
            label="Fees Today"
            value={`$${parseFloat(dashboard.feesToday).toFixed(4)}`}
            trend="up"
          />
          <StatCard
            label="Arb Profit Today"
            value={`$${parseFloat(dashboard.arbProfitToday).toFixed(4)}`}
            trend="up"
          />
          <StatCard
            label="Net PnL Today"
            value={`$${parseFloat(dashboard.netPnLToday).toFixed(4)}`}
            trend={parseFloat(dashboard.netPnLToday) > 0 ? "up" : parseFloat(dashboard.netPnLToday) < 0 ? "down" : "neutral"}
          />
        </div>

        {/* Agent Cards Row */}
        <div className="mb-8">
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-4">
            Active Agents
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dashboard.agents.map((agent) => (
              <AgentCard key={agent.did} agent={agent} />
            ))}
          </div>
        </div>

        {/* Bottom Row: Live Feed + Allocation Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Live Feed (60% width) */}
          <div className="lg:col-span-3">
            <LiveFeed />
          </div>

          {/* Allocation Pie Chart (40% width) */}
          <div className="lg:col-span-2">
            <div className="border border-border bg-card/50 p-6 h-full">
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-4">
                Treasury Allocation
              </div>

              {allocationData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={allocationData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.value.toFixed(1)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {allocationData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[entry.name as keyof typeof COLORS] || "oklch(0.5 0 0)"}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "oklch(0.1 0 0)",
                        border: "1px solid oklch(0.25 0 0)",
                        borderRadius: 0,
                        fontFamily: "var(--font-ibm-plex-mono)",
                        fontSize: 11,
                      }}
                    />
                    <Legend
                      wrapperStyle={{
                        fontFamily: "var(--font-ibm-plex-mono)",
                        fontSize: 10,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px]">
                  <div className="font-mono text-xs text-muted-foreground">No allocation data</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
