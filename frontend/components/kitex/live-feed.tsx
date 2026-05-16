"use client"

import { useQuery } from "@tanstack/react-query"
import { getLatestEvents, type AgentEvent } from "@/lib/goldsky"
import { resolveAgentType, relativeTime } from "@/lib/agents"
import { cn } from "@/lib/utils"
import Link from "next/link"

const AGENT_COLORS: Record<string, string> = {
  LiquidityAgent: "border-l-blue-400 text-blue-300",
  ArbitrageAgent: "border-l-accent text-accent",
  RiskAgent: "border-l-emerald-400 text-emerald-300",
}

export function LiveFeed() {
  const { data: events = [], isLoading } = useQuery({
    queryKey: ["latest-events"],
    queryFn: () => getLatestEvents(0),
    refetchInterval: 3000, // Poll every 3 seconds
  })

  if (isLoading) {
    return (
      <div className="border border-border bg-card/50 p-6">
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-4">
          Live Activity Feed
        </div>
        <div className="font-mono text-xs text-muted-foreground">Loading events...</div>
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="border border-border bg-card/50 p-6">
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-4">
          Live Activity Feed
        </div>
        <div className="font-mono text-xs text-muted-foreground">
          No events yet. Waiting for orchestrator to run...
        </div>
      </div>
    )
  }

  return (
    <div className="border border-border bg-card/50 p-6">
      <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-4">
        Live Activity Feed
      </div>

      <div className="space-y-3 max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-background">
        {events.map((event) => (
          <EventRow key={event.id} event={event} />
        ))}
      </div>
    </div>
  )
}

function EventRow({ event }: { event: AgentEvent }) {
  const agentName = resolveAgentType(event.agent.did, event.agent.agentType)
  const colorClass = AGENT_COLORS[agentName] || "border-l-foreground text-foreground"
  const profit = event.profit ? parseFloat(event.profit) : null
  // Filter out the absurd stub-era profits (>$100 is impossible at our sizes).
  const showProfit = profit !== null && profit > 0 && profit < 100

  return (
    <Link
      href={`https://kitescan.ai/tx/${event.txHash}`}
      target="_blank"
      className="block border-l-4 border-border bg-background/50 p-3 hover:border-l-accent hover:bg-background/80 transition-all"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn("font-mono text-xs uppercase tracking-wide", colorClass)}>
              {agentName}
            </span>
            <span className="font-mono text-[10px] text-muted-foreground">
              {event.eventType}
            </span>
          </div>

          {showProfit && (
            <div className="font-mono text-xs text-green-400 mb-1">
              Profit: ${profit!.toFixed(4)}
            </div>
          )}

          {event.metricValue && (
            <div className="font-mono text-xs text-muted-foreground mb-1">
              Value: {parseFloat(event.metricValue).toFixed(4)}
            </div>
          )}

          <div className="font-mono text-[10px] text-muted-foreground/60">
            {event.txHash.slice(0, 16)}...{event.txHash.slice(-8)}
          </div>
        </div>

        <div className="text-right">
          <div className="font-mono text-[10px] text-muted-foreground">
            {relativeTime(event.timestamp)}
          </div>
        </div>
      </div>
    </Link>
  )
}
