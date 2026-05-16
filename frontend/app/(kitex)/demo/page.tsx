"use client"

import { useState } from "react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { triggerDivergence, triggerVolume, triggerRebalance, runCycle, getDemoInfo } from "@/lib/api"
import { getLatestEvents } from "@/lib/goldsky"
import { resolveAgentType, relativeTime } from "@/lib/agents"
import { Button } from "@/components/ui/button"
import { ArrowUp, ArrowDown, Activity, RefreshCw, Play } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function DemoPage() {
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const { data: demoInfo } = useQuery({
    queryKey: ["demo-info"],
    queryFn: getDemoInfo,
  })

  const { data: events = [] } = useQuery({
    queryKey: ["latest-demo-events"],
    queryFn: () => getLatestEvents(0),
    refetchInterval: 3000,
  })

  const divergenceMutation = useMutation({
    mutationFn: ({ direction }: { direction: "up" | "down" }) =>
      triggerDivergence(direction, "0.1"),
    onSuccess: () => {
      setMessage({ type: "success", text: "Price divergence triggered successfully!" })
      setTimeout(() => setMessage(null), 5000)
    },
    onError: (error: any) => {
      setMessage({ type: "error", text: error.message || "Failed to trigger divergence" })
      setTimeout(() => setMessage(null), 5000)
    },
  })

  const volumeMutation = useMutation({
    mutationFn: () => triggerVolume(5, "0.05"),
    onSuccess: () => {
      setMessage({ type: "success", text: "High volume swaps triggered successfully!" })
      setTimeout(() => setMessage(null), 5000)
    },
    onError: (error: any) => {
      setMessage({ type: "error", text: error.message || "Failed to trigger volume" })
      setTimeout(() => setMessage(null), 5000)
    },
  })

  const rebalanceMutation = useMutation({
    mutationFn: triggerRebalance,
    onSuccess: () => {
      setMessage({ type: "success", text: "Rebalance triggered successfully!" })
      setTimeout(() => setMessage(null), 5000)
    },
    onError: (error: any) => {
      setMessage({ type: "error", text: error.message || "Failed to trigger rebalance" })
      setTimeout(() => setMessage(null), 5000)
    },
  })

  const cycleMutation = useMutation({
    mutationFn: () => runCycle(false),
    onSuccess: () => {
      setMessage({ type: "success", text: "Orchestrator cycle completed successfully!" })
      setTimeout(() => setMessage(null), 5000)
    },
    onError: (error: any) => {
      setMessage({ type: "error", text: error.message || "Failed to run cycle" })
      setTimeout(() => setMessage(null), 5000)
    },
  })

  return (
    <div className="relative min-h-screen">
      <div className="grid-bg fixed inset-0 opacity-30" aria-hidden="true" />

      <div className="relative z-10 max-w-[1800px] mx-auto p-8 md:p-12">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-2 flex-wrap gap-4">
            <h1 className="font-[var(--font-bebas)] text-5xl text-foreground tracking-wide">
              DEMO CONTROLS
            </h1>
            <div className="flex items-center gap-6 font-mono text-[10px] uppercase tracking-widest text-foreground/80">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Kite Mainnet · Live</span>
              </div>
              <div>
                Chain <span className="text-foreground">2368</span>
              </div>
            </div>
          </div>
          <p className="font-mono text-sm text-foreground/70 mb-8">
            All actions below execute real transactions on Kite mainnet.
          </p>

          {/* Status Message */}
          {message && (
            <div
              className={cn(
                "border-l-2 bg-background px-4 py-3 mb-6 font-mono text-xs",
                message.type === "success" ? "border-emerald-500 text-emerald-400" : "border-destructive text-destructive"
              )}
            >
              {message.text}
            </div>
          )}

          {/* Demo Info — refined address cards */}
          {demoInfo && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <AddressCard
                label="CapitalRouter"
                address={demoInfo.capitalRouter}
                href={`https://kitescan.ai/address/${demoInfo.capitalRouter}`}
              />
              <AddressCard
                label="KitexAuditLog"
                address={demoInfo.auditLog}
                href={`https://kitescan.ai/address/${demoInfo.auditLog}`}
              />
              {(() => {
                const url = demoInfo.goldskyEndpoint || ""
                const match = url.match(/subgraphs\/([^/]+)\/([^/]+)/)
                const label = match ? `${match[1]} · v${match[2]}` : "subgraph"
                return (
                  <div className="border border-border bg-background p-4 hover:border-accent/40 transition-colors">
                    <div className="font-mono text-[10px] uppercase tracking-widest text-foreground/70 mb-2">
                      Goldsky Subgraph
                    </div>
                    <Link
                      href={url}
                      target="_blank"
                      className="group inline-flex items-center gap-2 font-mono text-xs text-foreground hover:text-accent transition-colors"
                    >
                      <span>{label}</span>
                      <span className="text-muted-foreground/60 group-hover:text-accent">↗</span>
                    </Link>
                  </div>
                )
              })()}
            </div>
          )}
        </div>

        {/* Control Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Panel 1: Price Divergence */}
          <div className="border border-border bg-background p-6 flex flex-col">
            <div className="font-mono text-[10px] uppercase tracking-widest text-foreground/70 mb-4">
              1. Trigger Price Divergence
            </div>
            <p className="font-mono text-xs text-foreground/60 mb-6 flex-1">
              Executes a real swap that pushes pool price outside LP range. ArbitrageAgent will detect and self-arb within 1-2 cycles.
            </p>

            <div className="flex gap-3 mt-auto">
              <Button
                onClick={() => divergenceMutation.mutate({ direction: "up" })}
                disabled={divergenceMutation.isPending}
                className="flex-1 bg-background border border-border hover:border-green-400/60 text-green-400/90 hover:text-green-400 hover:bg-green-400/5 font-mono text-xs uppercase tracking-widest h-12 transition-colors"
              >
                <ArrowUp className="w-4 h-4 mr-2" />
                Push Up
              </Button>
              <Button
                onClick={() => divergenceMutation.mutate({ direction: "down" })}
                disabled={divergenceMutation.isPending}
                className="flex-1 bg-background border border-border hover:border-destructive/60 text-destructive/90 hover:text-destructive hover:bg-destructive/5 font-mono text-xs uppercase tracking-widest h-12 transition-colors"
              >
                <ArrowDown className="w-4 h-4 mr-2" />
                Push Down
              </Button>
            </div>
          </div>

          {/* Panel 2: High Volume */}
          <div className="border border-border bg-background p-6 flex flex-col">
            <div className="font-mono text-[10px] uppercase tracking-widest text-foreground/70 mb-4">
              2. Simulate High Volume
            </div>
            <p className="font-mono text-xs text-foreground/60 mb-6 flex-1">
              Executes 5 consecutive swaps to accumulate delta exposure. RiskAgent will detect and log a hedge intent.
            </p>

            <Button
              onClick={() => volumeMutation.mutate()}
              disabled={volumeMutation.isPending}
              className="w-full mt-auto bg-background border border-border hover:border-accent/60 text-accent/90 hover:text-accent hover:bg-accent/5 font-mono text-xs uppercase tracking-widest h-12 transition-colors"
            >
              <Activity className="w-4 h-4 mr-2" />
              {volumeMutation.isPending ? "Executing..." : "Trigger Volume"}
            </Button>
          </div>

          {/* Panel 3: Force Rebalance */}
          <div className="border border-border bg-background p-6 flex flex-col">
            <div className="font-mono text-[10px] uppercase tracking-widest text-foreground/70 mb-4">
              3. Force Rebalance
            </div>
            <p className="font-mono text-xs text-foreground/60 mb-6 flex-1">
              Forces LiquidityAgent to remove current LP position and place a new one immediately, ignoring cooldown.
            </p>

            <Button
              onClick={() => rebalanceMutation.mutate()}
              disabled={rebalanceMutation.isPending}
              className="w-full mt-auto bg-background border border-border hover:border-blue-400/60 text-blue-400/90 hover:text-blue-400 hover:bg-blue-400/5 font-mono text-xs uppercase tracking-widest h-12 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {rebalanceMutation.isPending ? "Rebalancing..." : "Force Rebalance"}
            </Button>
          </div>
        </div>

        {/* Run Cycle Button */}
        <div className="border border-border bg-background p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-foreground/70 mb-2">
                Manual Cycle Trigger
              </div>
              <p className="font-mono text-xs text-foreground/60">
                Run one full orchestrator cycle on demand (useful if 15s interval feels too slow during demo).
              </p>
            </div>
            <Button
              onClick={() => cycleMutation.mutate()}
              disabled={cycleMutation.isPending}
              className="bg-background border border-border hover:border-accent/60 text-accent/90 hover:text-accent hover:bg-accent/5 font-mono text-xs uppercase tracking-widest h-12 px-8 transition-colors"
            >
              <Play className="w-4 h-4 mr-2" />
              {cycleMutation.isPending ? "Running..." : "Run Cycle Now"}
            </Button>
          </div>
        </div>

        {/* Live Transaction Feed */}
        <div className="border border-border bg-background p-6">
          <div className="font-mono text-[10px] uppercase tracking-widest text-foreground/70 mb-4">
            Live Transaction Feed (Last 10 Events)
          </div>

          {events.length > 0 ? (
            <div className="space-y-2">
              {events.slice(0, 10).map((event) => {
                const agentName = resolveAgentType(event.agent.did, event.agent.agentType)
                const profit = event.profit ? parseFloat(event.profit) : null
                return (
                  <div key={event.id} className="border-l-2 border-border bg-background p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-mono text-xs text-foreground mb-1">
                          {agentName} — {event.eventType}
                        </div>
                        <Link
                          href={`https://kitescan.ai/tx/${event.txHash}`}
                          target="_blank"
                          className="font-mono text-[10px] text-accent hover:underline"
                        >
                          {event.txHash.slice(0, 14)}…{event.txHash.slice(-6)}
                        </Link>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-[10px] text-muted-foreground">
                          {relativeTime(event.timestamp)}
                        </div>
                        {profit !== null && profit > 0 && profit < 100 && (
                          <div className="font-mono text-[10px] text-green-400 mt-1">
                            +${profit.toFixed(4)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="py-12 text-center font-mono text-xs text-muted-foreground">
              No transactions yet. Trigger an action above to see live events appear here.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function AddressCard({
  label,
  address,
  href,
}: {
  label: string
  address: string
  href: string
}) {
  const short = `${address.slice(0, 8)}…${address.slice(-6)}`
  return (
    <Link
      href={href}
      target="_blank"
      className="group block border border-border bg-background p-4 hover:border-accent/40 transition-colors"
    >
      <div className="font-mono text-[10px] uppercase tracking-widest text-foreground/70 mb-2">
        {label}
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-xs text-foreground group-hover:text-accent transition-colors">
          {short}
        </span>
        <span className="font-mono text-[10px] text-muted-foreground/60 group-hover:text-accent transition-colors">
          ↗ Kitescan
        </span>
      </div>
    </Link>
  )
}
