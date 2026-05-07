"use client"

import { useParams, useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { getAgentDetail } from "@/lib/api"
import { getReputationHistory, getArbHistory, getLPHistory, getDeltaHistory } from "@/lib/goldsky"
import { ReputationChart } from "@/components/kitex/reputation-chart"
import { PnLChart } from "@/components/kitex/pnl-chart"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function AgentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const did = params.did as string

  const { data: agent, isLoading: agentLoading } = useQuery({
    queryKey: ["agent-detail", did],
    queryFn: () => getAgentDetail(did),
    enabled: !!did,
  })

  const { data: reputationHistory = [] } = useQuery({
    queryKey: ["reputation-history", did],
    queryFn: () => getReputationHistory(did),
    enabled: !!did,
  })

  const { data: arbHistory = [] } = useQuery({
    queryKey: ["arb-history", did],
    queryFn: () => getArbHistory(did),
    enabled: !!did,
  })

  const { data: lpHistory = [] } = useQuery({
    queryKey: ["lp-history", did],
    queryFn: () => getLPHistory(did),
    enabled: !!did,
  })

  const { data: deltaHistory = [] } = useQuery({
    queryKey: ["delta-history", did],
    queryFn: () => getDeltaHistory(did, 20),
    enabled: !!did,
  })

  if (agentLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="font-mono text-sm text-muted-foreground">Loading agent details...</div>
      </div>
    )
  }

  if (!agent) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="border border-destructive/50 bg-destructive/10 p-6">
          <div className="font-mono text-sm text-destructive">Agent not found</div>
        </div>
      </div>
    )
  }

  const isLiquidityAgent = agent.config.agentType === "LiquidityAgent"
  const isArbitrageAgent = agent.config.agentType === "ArbitrageAgent"
  const isRiskAgent = agent.config.agentType === "RiskAgent"

  return (
    <div className="relative min-h-screen">
      <div className="grid-bg fixed inset-0 opacity-30" aria-hidden="true" />

      <div className="relative z-10 max-w-[1800px] mx-auto p-8 md:p-12">
        {/* Back Button */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-accent transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="font-[var(--font-bebas)] text-5xl text-foreground tracking-wide mb-2">
                {agent.config.agentType}
              </h1>
              <p className="font-mono text-xs text-muted-foreground/60 mb-2">
                DID: {agent.config.did}
              </p>
            </div>
            <div
              className={`px-4 py-2 border font-mono text-xs uppercase tracking-widest ${
                agent.config.status === "ACTIVE"
                  ? "border-green-400 text-green-400"
                  : agent.config.status === "IDLE"
                    ? "border-muted-foreground/50 text-muted-foreground"
                    : "border-accent text-accent"
              }`}
            >
              {agent.config.status}
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-border bg-card p-4">
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                Current Reputation
              </div>
              <div className="font-mono text-3xl font-medium text-foreground">
                {agent.config.reputationScore}
              </div>
            </div>
            <div className="border border-border bg-card p-4">
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                Capital Allocation
              </div>
              <div className="font-mono text-3xl font-medium text-foreground">
                {agent.config.currentAllocation}
              </div>
              <div className="font-mono text-xs text-muted-foreground mt-1">
                {(agent.config.currentAllocationBps / 100).toFixed(1)}% of treasury
              </div>
            </div>
            <div className="border border-border bg-card p-4">
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                Total Decisions
              </div>
              <div className="font-mono text-3xl font-medium text-foreground">
                {agent.decisions.length}
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          <ReputationChart data={reputationHistory} />

          {isArbitrageAgent && <PnLChart data={arbHistory} />}

          {isLiquidityAgent && (
            <div className="border border-border bg-card/50 p-6">
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-4">
                LP Position History
              </div>
              {lpHistory.length > 0 ? (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {lpHistory.map((lp) => (
                    <div key={lp.id} className="border-l-2 border-blue-400 bg-background/50 p-3">
                      <div className="font-mono text-xs text-foreground mb-1">{lp.action}</div>
                      <div className="font-mono text-[10px] text-muted-foreground">
                        Range: {lp.tickLower} to {lp.tickUpper}
                      </div>
                      {lp.feesCollected && (
                        <div className="font-mono text-[10px] text-green-400 mt-1">
                          Fees: ${parseFloat(lp.feesCollected).toFixed(4)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-[250px]">
                  <div className="font-mono text-xs text-muted-foreground">No LP events yet</div>
                </div>
              )}
            </div>
          )}

          {isRiskAgent && (
            <div className="border border-border bg-card/50 p-6">
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-4">
                Delta Exposure History
              </div>
              {deltaHistory.length > 0 ? (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {deltaHistory.map((hedge) => (
                    <div key={hedge.id} className="border-l-2 border-emerald-400 bg-background/50 p-3">
                      <div className="font-mono text-xs text-foreground mb-1">
                        {hedge.direction === "long" ? "LONG" : "SHORT"} Exposure
                      </div>
                      <div className="font-mono text-[10px] text-emerald-400">
                        Δ {parseFloat(hedge.deltaExposure).toFixed(2)}%
                      </div>
                      <div className="font-mono text-[10px] text-muted-foreground mt-1">
                        {new Date(parseInt(hedge.timestamp) * 1000).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-[250px]">
                  <div className="font-mono text-xs text-muted-foreground">No hedge events yet</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Decision History Table */}
        <div className="border border-border bg-card/50 p-6">
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-4">
            Full Decision History
          </div>

          {agent.decisions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full font-mono text-xs">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left py-2 px-3 text-muted-foreground font-normal">Action</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-normal">Timestamp</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-normal">Profit</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-normal">Transaction</th>
                  </tr>
                </thead>
                <tbody>
                  {agent.decisions.map((decision, index) => (
                    <tr key={index} className="border-b border-border/30 hover:bg-background/50">
                      <td className="py-3 px-3 text-foreground">{decision.action}</td>
                      <td className="py-3 px-3 text-muted-foreground">
                        {new Date(decision.timestamp * 1000).toLocaleString()}
                      </td>
                      <td className={`py-3 px-3 ${decision.profit && parseFloat(decision.profit) > 0 ? "text-green-400" : "text-muted-foreground"}`}>
                        {decision.profit ? `$${parseFloat(decision.profit).toFixed(4)}` : "—"}
                      </td>
                      <td className="py-3 px-3">
                        <Link
                          href={`https://kitescan.ai/tx/${decision.txHash}`}
                          target="_blank"
                          className="text-accent hover:underline"
                        >
                          {decision.txHash.slice(0, 10)}...{decision.txHash.slice(-8)}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center font-mono text-xs text-muted-foreground">
              No decisions recorded yet
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
