import Link from "next/link"
import { cn } from "@/lib/utils"
import type { AgentConfig } from "@/lib/api"
import { relativeTime } from "@/lib/agents"

interface AgentCardProps {
  agent: AgentConfig
  className?: string
}

const AGENT_COLORS = {
  LiquidityAgent: "text-blue-400 border-blue-400/50",
  ArbitrageAgent: "text-accent border-accent/50",
  RiskAgent: "text-emerald-400 border-emerald-400/50",
}

export function AgentCard({ agent, className }: AgentCardProps) {
  const colorClass = AGENT_COLORS[agent.agentType as keyof typeof AGENT_COLORS] || "text-foreground border-border"

  // Calculate reputation trend (simplified for now)
  const reputationTrend = agent.reputationScore > 100 ? "up" : agent.reputationScore < 100 ? "down" : "neutral"

  return (
    <Link href={`/agent/${agent.did}`}>
      <div
        className={cn(
          "border bg-card p-6 transition-all duration-200 hover:border-accent/70 hover:shadow-lg hover:shadow-accent/10",
          colorClass,
          className
        )}
      >
        {/* Agent Name */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-1">
              {agent.agentType}
            </div>
            <div className="font-mono text-[10px] text-muted-foreground/60 truncate max-w-[200px]">
              {agent.did.slice(0, 20)}...
            </div>
          </div>
          <div
            className={cn(
              "px-2 py-1 border text-[9px] font-mono uppercase tracking-widest",
              agent.status === "ACTIVE" && "border-green-400 text-green-400",
              agent.status === "IDLE" && "border-muted-foreground/50 text-muted-foreground",
              agent.status === "REBALANCING" && "border-accent text-accent"
            )}
          >
            {agent.status}
          </div>
        </div>

        {/* Reputation Score */}
        <div className="mb-4">
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
            Reputation
          </div>
          <div
            className={cn(
              "font-mono text-4xl font-medium",
              reputationTrend === "up" && "text-green-400",
              reputationTrend === "down" && "text-destructive",
              reputationTrend === "neutral" && "text-foreground"
            )}
          >
            {agent.reputationScore}
          </div>
        </div>

        {/* Capital Allocation */}
        <div className="mb-4">
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
            Capital Allocation
          </div>
          <div className="font-mono text-lg text-foreground">
            {agent.currentAllocation} USDC.e
          </div>
          <div className="font-mono text-xs text-muted-foreground">
            {(agent.currentAllocationBps / 100).toFixed(1)}% of treasury
          </div>
        </div>

        {/* Last Action — always rendered so all cards have equal height */}
        <div className="border-t border-border/30 pt-4 mt-4">
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
            Last Action
          </div>
          {agent.lastAction ? (
            <>
              <div className="font-mono text-xs text-foreground">{agent.lastAction.type}</div>
              <div className="font-mono text-[10px] text-muted-foreground mt-1">
                {relativeTime(Math.floor(agent.lastAction.timestamp / 1000))}
              </div>
            </>
          ) : (
            <>
              <div className="font-mono text-xs text-muted-foreground/60">—</div>
              <div className="font-mono text-[10px] text-muted-foreground/40 mt-1">
                awaiting first cycle
              </div>
            </>
          )}
        </div>
      </div>
    </Link>
  )
}
