"use client"

import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { getDashboard } from "@/lib/api"

const AGENTS = [
  {
    type: "LiquidityAgent",
    role: "Concentrated liquidity",
    detail: "Opens & rebalances Algebra V3 positions inside ±2% of pool price. Captures swap fees.",
    color: "oklch(0.55 0.8 250)",
  },
  {
    type: "ArbitrageAgent",
    role: "Price divergence",
    detail: "Detects >0.3% divergence vs. reference price from recent swaps. Executes profitable arbs.",
    color: "oklch(0.7 0.2 45)",
  },
  {
    type: "RiskAgent",
    role: "Delta exposure",
    detail: "Monitors composition drift. Signals rebalance when sustained delta crosses 15%.",
    color: "oklch(0.55 0.8 140)",
  },
]

export default function LandingPage() {
  const { data: dashboard } = useQuery({
    queryKey: ["dashboard-preview"],
    queryFn: getDashboard,
    refetchInterval: 10000,
    retry: false,
  })

  const treasuryValue = parseFloat(dashboard?.treasuryValue || "0").toFixed(2)
  const backendUp = !!dashboard

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="grid-bg fixed inset-0 opacity-30" aria-hidden="true" />

      <div className="relative z-10 max-w-[1800px] mx-auto px-8 md:px-16 pt-16 md:pt-24 pb-16">
        {/* Hero */}
        <div className="mb-24">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-6">
            v.01 / Kite AI Mainnet · Chain 2368
          </div>

          <h1 className="font-[var(--font-bebas)] text-[clamp(3rem,9vw,8rem)] leading-none tracking-wide text-foreground">
            KITEX
          </h1>
          <h2 className="font-[var(--font-bebas)] text-[clamp(1.5rem,3vw,2.5rem)] leading-tight tracking-wide text-muted-foreground/70 mt-2 max-w-3xl">
            Autonomous market making.<br />
            Three agents. One treasury. Zero human intervention.
          </h2>

          <p className="mt-10 max-w-xl font-mono text-sm text-muted-foreground leading-relaxed">
            Three autonomous agents — registered as Kite Agent Passports — coordinate liquidity,
            arbitrage, and risk on the Algebra Integral DEX. Capital flows are weighted by on-chain
            reputation, updated every cycle by realized PnL.
          </p>

          <div className="mt-12 flex flex-wrap items-center gap-6">
            <Link
              href="/dashboard"
              className="group inline-flex items-center gap-3 border border-accent bg-accent/10 px-6 py-3 font-mono text-xs uppercase tracking-widest text-accent hover:bg-accent hover:text-background transition-all duration-200"
            >
              Open Dashboard
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
            <Link
              href="/how-it-works"
              className="font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
            >
              How It Works
            </Link>
            <Link
              href="/demo"
              className="font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
            >
              Live Demo
            </Link>
          </div>

          {/* Live status pill */}
          <div className="mt-10 inline-flex items-center gap-3 border border-border bg-card/40 px-4 py-2">
            <span className={`h-2 w-2 rounded-full ${backendUp ? "bg-emerald-500 animate-pulse" : "bg-destructive"}`} />
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {backendUp ? `Treasury Live · $${treasuryValue} USDC.e` : "Backend offline"}
            </span>
          </div>
        </div>

        {/* Three agents preview */}
        <div className="mb-16">
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-6">
            Agent Roster
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {AGENTS.map((agent) => (
              <Link
                key={agent.type}
                href="/agents"
                className="group block border border-border bg-card/40 p-6 hover:border-accent transition-colors"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: agent.color }} />
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    {agent.role}
                  </span>
                </div>
                <div className="font-[var(--font-bebas)] text-2xl tracking-wide text-foreground mb-3">
                  {agent.type}
                </div>
                <p className="font-mono text-xs text-muted-foreground leading-relaxed">
                  {agent.detail}
                </p>
                <div className="mt-6 font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60 group-hover:text-accent transition-colors">
                  View detail →
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Three pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-border pt-12">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
              On-chain reputation
            </div>
            <p className="font-mono text-xs text-muted-foreground leading-relaxed">
              Every action updates an agent's reputation score in CapitalRouter. Allocation is
              proportional to score — bad agents starve, good agents scale.
            </p>
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
              Indexed by Goldsky
            </div>
            <p className="font-mono text-xs text-muted-foreground leading-relaxed">
              All decisions are logged to KitexAuditLog and indexed in real-time. The dashboard
              reads directly from the subgraph for sub-second latency.
            </p>
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
              Kite Agent Passport
            </div>
            <p className="font-mono text-xs text-muted-foreground leading-relaxed">
              Agents are identified by DIDs and bound to the operator wallet via cryptographic
              delegation. Session keys enable gasless execution.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
