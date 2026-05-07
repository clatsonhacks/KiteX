"use client"

import { useState } from "react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { triggerDivergence, triggerVolume, triggerRebalance, runCycle, getDemoInfo } from "@/lib/api"
import { getLatestEvents } from "@/lib/goldsky"
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
        <div className="mb-12">
          <h1 className="font-[var(--font-bebas)] text-5xl text-foreground tracking-wide mb-2">
            DEMO CONTROLS
          </h1>
          <p className="font-mono text-sm text-muted-foreground mb-4">
            Hackathon demonstration controls — all actions execute real mainnet transactions
          </p>

          {/* Warning Banner */}
          <div className="border border-accent/50 bg-accent/10 p-4 mb-4">
            <div className="font-mono text-xs text-accent">
              ⚠️ WARNING: These buttons trigger REAL on-chain transactions on Kite mainnet. Use sparingly during demo.
            </div>
          </div>

          {/* Status Message */}
          {message && (
            <div
              className={cn(
                "border p-4 mb-4",
                message.type === "success" ? "border-green-400/50 bg-green-400/10 text-green-400" : "border-destructive/50 bg-destructive/10 text-destructive"
              )}
            >
              <div className="font-mono text-xs">{message.text}</div>
            </div>
          )}

          {/* Demo Info */}
          {demoInfo && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="border border-border bg-card p-4">
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                  CapitalRouter
                </div>
                <Link
                  href={`https://kitescan.ai/address/${demoInfo.capitalRouter}`}
                  target="_blank"
                  className="font-mono text-xs text-accent hover:underline break-all"
                >
                  {demoInfo.capitalRouter}
                </Link>
              </div>
              <div className="border border-border bg-card p-4">
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                  KitexAuditLog
                </div>
                <Link
                  href={`https://kitescan.ai/address/${demoInfo.auditLog}`}
                  target="_blank"
                  className="font-mono text-xs text-accent hover:underline break-all"
                >
                  {demoInfo.auditLog}
                </Link>
              </div>
              <div className="border border-border bg-card p-4">
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                  Goldsky Endpoint
                </div>
                <div className="font-mono text-xs text-muted-foreground truncate">
                  {demoInfo.goldskyEndpoint?.split("/").pop()}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Control Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Panel 1: Price Divergence */}
          <div className="border border-border bg-card p-6">
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-4">
              1. Trigger Price Divergence
            </div>
            <p className="font-mono text-xs text-muted-foreground mb-6">
              Executes a real swap that pushes pool price outside LP range. ArbitrageAgent will detect and self-arb within 1-2 cycles.
            </p>

            <div className="flex gap-3">
              <Button
                onClick={() => divergenceMutation.mutate({ direction: "up" })}
                disabled={divergenceMutation.isPending}
                className="flex-1 bg-background border border-green-400 text-green-400 hover:bg-green-400/10 font-mono text-xs uppercase tracking-widest h-12"
              >
                <ArrowUp className="w-4 h-4 mr-2" />
                Push Up
              </Button>
              <Button
                onClick={() => divergenceMutation.mutate({ direction: "down" })}
                disabled={divergenceMutation.isPending}
                className="flex-1 bg-background border border-destructive text-destructive hover:bg-destructive/10 font-mono text-xs uppercase tracking-widest h-12"
              >
                <ArrowDown className="w-4 h-4 mr-2" />
                Push Down
              </Button>
            </div>
          </div>

          {/* Panel 2: High Volume */}
          <div className="border border-border bg-card p-6">
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-4">
              2. Simulate High Volume
            </div>
            <p className="font-mono text-xs text-muted-foreground mb-6">
              Executes 5 consecutive swaps to accumulate delta exposure. RiskAgent will detect and log a hedge intent.
            </p>

            <Button
              onClick={() => volumeMutation.mutate()}
              disabled={volumeMutation.isPending}
              className="w-full bg-background border border-accent text-accent hover:bg-accent/10 font-mono text-xs uppercase tracking-widest h-12"
            >
              <Activity className="w-4 h-4 mr-2" />
              {volumeMutation.isPending ? "Executing..." : "Trigger Volume"}
            </Button>
          </div>

          {/* Panel 3: Force Rebalance */}
          <div className="border border-border bg-card p-6">
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-4">
              3. Force Rebalance
            </div>
            <p className="font-mono text-xs text-muted-foreground mb-6">
              Forces LiquidityAgent to remove current LP position and place a new one immediately, ignoring cooldown.
            </p>

            <Button
              onClick={() => rebalanceMutation.mutate()}
              disabled={rebalanceMutation.isPending}
              className="w-full bg-background border border-blue-400 text-blue-400 hover:bg-blue-400/10 font-mono text-xs uppercase tracking-widest h-12"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {rebalanceMutation.isPending ? "Rebalancing..." : "Force Rebalance"}
            </Button>
          </div>
        </div>

        {/* Run Cycle Button */}
        <div className="border border-accent/50 bg-accent/5 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                Manual Cycle Trigger
              </div>
              <p className="font-mono text-xs text-muted-foreground">
                Run one full orchestrator cycle on demand (useful if 15s interval feels too slow during demo)
              </p>
            </div>
            <Button
              onClick={() => cycleMutation.mutate()}
              disabled={cycleMutation.isPending}
              className="bg-accent text-accent-foreground hover:bg-accent/90 font-mono text-xs uppercase tracking-widest h-12 px-8"
            >
              <Play className="w-4 h-4 mr-2" />
              {cycleMutation.isPending ? "Running..." : "Run Cycle Now"}
            </Button>
          </div>
        </div>

        {/* Live Transaction Feed */}
        <div className="border border-border bg-card/50 p-6">
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-4">
            Live Transaction Feed (Last 10 Events)
          </div>

          {events.length > 0 ? (
            <div className="space-y-2">
              {events.slice(0, 10).map((event) => (
                <div key={event.id} className="border-l-2 border-accent bg-background/50 p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-mono text-xs text-foreground mb-1">
                        {event.agent.agentType} — {event.eventType}
                      </div>
                      <Link
                        href={`https://kitescan.ai/tx/${event.txHash}`}
                        target="_blank"
                        className="font-mono text-[10px] text-accent hover:underline"
                      >
                        {event.txHash}
                      </Link>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-[10px] text-muted-foreground">
                        {new Date(parseInt(event.timestamp) * 1000).toLocaleTimeString()}
                      </div>
                      {event.profit && (
                        <div className="font-mono text-[10px] text-green-400 mt-1">
                          +${parseFloat(event.profit).toFixed(4)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
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
