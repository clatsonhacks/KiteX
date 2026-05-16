"use client"

import { useQuery } from "@tanstack/react-query"
import { getDashboard, type DashboardData } from "@/lib/api"
import Link from "next/link"

function StatCard({ label, value, subtext }: { label: string; value: string; subtext?: string }) {
  return (
    <div className="border border-border bg-card/50 p-6">
      <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
        {label}
      </div>
      <div className="font-[var(--font-bebas)] text-3xl text-foreground tracking-wide">
        {value}
      </div>
      {subtext && (
        <div className="font-mono text-xs text-muted-foreground mt-1">{subtext}</div>
      )}
    </div>
  )
}

function AgentRow({ agent }: { agent: DashboardData["agents"][0] }) {
  const statusColor = agent.status === "ACTIVE" ? "bg-accent" : "bg-muted-foreground/40"

  return (
    <Link
      href={`/agent/${encodeURIComponent(agent.did)}`}
      className="flex items-center justify-between p-4 border border-border bg-card/30 hover:bg-card/50 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className={`h-2 w-2 rounded-full ${statusColor}`} />
        <div>
          <div className="font-mono text-sm text-foreground">{agent.agentType}</div>
          <div className="font-mono text-[10px] text-muted-foreground truncate max-w-[200px]">
            {agent.did}
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className="font-mono text-sm text-foreground">${agent.currentAllocation}</div>
        <div className="font-mono text-[10px] text-muted-foreground">
          Rep: {agent.reputationScore}
        </div>
      </div>
    </Link>
  )
}

function EventRow({ event }: { event: DashboardData["recentEvents"][0] }) {
  const time = new Date(event.timestamp * 1000).toLocaleTimeString()
  const profitColor = (event.profitUsd ?? 0) >= 0 ? "text-accent" : "text-destructive"

  return (
    <div className="flex items-center justify-between p-3 border-b border-border/30 last:border-0">
      <div className="flex items-center gap-3">
        <div className="font-mono text-[10px] text-muted-foreground w-20">{time}</div>
        <div>
          <div className="font-mono text-xs text-foreground">{event.action}</div>
          <div className="font-mono text-[10px] text-muted-foreground">{event.agent}</div>
        </div>
      </div>
      <div className="text-right">
        <div className="font-mono text-xs text-foreground">${event.amountUsd.toFixed(2)}</div>
        {event.profitUsd !== null && (
          <div className={`font-mono text-[10px] ${profitColor}`}>
            {event.profitUsd >= 0 ? "+" : ""}{event.profitUsd.toFixed(4)}
          </div>
        )}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard"],
    queryFn: getDashboard,
    refetchInterval: 5000,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="font-mono text-sm text-muted-foreground">Loading dashboard...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="border border-destructive/50 bg-destructive/10 p-6 max-w-md">
          <div className="font-mono text-sm text-destructive mb-2">
            Failed to load dashboard
          </div>
          <div className="font-mono text-xs text-muted-foreground">
            Ensure backend is running at {process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001"}
          </div>
        </div>
      </div>
    )
  }

  const dashboard = data!

  return (
    <div className="relative min-h-screen">
      <div className="grid-bg fixed inset-0 opacity-30" aria-hidden="true" />

      <div className="relative z-10 max-w-[1800px] mx-auto p-8 md:p-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="font-[var(--font-bebas)] text-5xl text-foreground tracking-wide mb-2">
            DASHBOARD
          </h1>
          <p className="font-mono text-sm text-muted-foreground">
            Real-time overview of KiteX autonomous market making system
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Treasury"
            value={`$${dashboard.treasuryValue}`}
          />
          <StatCard
            label="Fees Today"
            value={`$${dashboard.feesToday}`}
          />
          <StatCard
            label="Arb Profit"
            value={`$${dashboard.arbProfitToday}`}
          />
          <StatCard
            label="Net PnL"
            value={`$${dashboard.netPnLToday}`}
            subtext={parseFloat(dashboard.netPnLToday) >= 0 ? "Profitable" : "Loss"}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Agents Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-[var(--font-bebas)] text-2xl text-foreground tracking-wide">
                AGENTS
              </h2>
              <Link
                href="/agents"
                className="font-mono text-[10px] uppercase tracking-widest text-accent hover:underline"
              >
                View All
              </Link>
            </div>
            <div className="space-y-2">
              {dashboard.agents.map((agent) => (
                <AgentRow key={agent.did} agent={agent} />
              ))}
              {dashboard.agents.length === 0 && (
                <div className="border border-border bg-card/30 p-6 text-center">
                  <div className="font-mono text-sm text-muted-foreground">No agents found</div>
                </div>
              )}
            </div>
          </div>

          {/* Recent Events Section */}
          <div>
            <h2 className="font-[var(--font-bebas)] text-2xl text-foreground tracking-wide mb-4">
              RECENT ACTIVITY
            </h2>
            <div className="border border-border bg-card/30">
              {dashboard.recentEvents.slice(0, 10).map((event, i) => (
                <EventRow key={`${event.txHash}-${i}`} event={event} />
              ))}
              {dashboard.recentEvents.length === 0 && (
                <div className="p-6 text-center">
                  <div className="font-mono text-sm text-muted-foreground">No recent activity</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pool Info */}
        {dashboard.pool && (
          <div className="mt-8 border border-border bg-card/30 p-4">
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
              Pool Contract
            </div>
            <div className="font-mono text-xs text-foreground break-all">
              {dashboard.pool.address}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
