"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Shield, Zap, TrendingUp, ChevronDown, ExternalLink } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Grid Background */}
      <div className="grid-bg fixed inset-0 opacity-20" aria-hidden="true" />

      {/* Gradient Orbs */}
      <div className="fixed top-[-20%] right-[-10%] w-[600px] h-[600px] bg-accent/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between px-8 md:px-16 py-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 border-2 border-accent flex items-center justify-center">
            <span className="font-[var(--font-bebas)] text-accent text-xl">K</span>
          </div>
          <span className="font-[var(--font-bebas)] text-2xl tracking-wider text-foreground">KITEX</span>
        </div>
        <div className="flex items-center gap-6">
          <Link
            href="/how-it-works"
            className="font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-accent transition-colors hidden md:block"
          >
            How It Works
          </Link>
          <Link
            href="/dashboard"
            className="group flex items-center gap-2 px-5 py-2.5 bg-accent text-accent-foreground font-mono text-xs uppercase tracking-widest hover:bg-accent/90 transition-colors"
          >
            Launch App
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 min-h-[90vh] flex flex-col items-center justify-center px-8 md:px-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 border border-accent/30 bg-accent/5 mb-8">
            <div className="w-2 h-2 bg-accent animate-pulse" />
            <span className="font-mono text-xs uppercase tracking-widest text-accent">Live on Kite AI Mainnet</span>
          </div>

          {/* Main Headline */}
          <h1 className="font-[var(--font-bebas)] text-6xl md:text-8xl lg:text-9xl text-foreground tracking-wide leading-[0.9] mb-6">
            YOUR LP IS THE
            <br />
            <span className="text-accent">ARBITRAGEUR</span>
          </h1>

          {/* Subheadline */}
          <p className="font-mono text-sm md:text-base text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
            Three autonomous agents. One shared treasury. Zero human intervention.
            <br className="hidden md:block" />
            Reputation-weighted capital allocation that adapts in real-time.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="group flex items-center gap-3 px-8 py-4 bg-accent text-accent-foreground font-mono text-sm uppercase tracking-widest hover:bg-accent/90 transition-all"
            >
              Enter Dashboard
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/how-it-works"
              className="flex items-center gap-3 px-8 py-4 border border-border text-foreground font-mono text-sm uppercase tracking-widest hover:border-accent/50 hover:text-accent transition-all"
            >
              Learn More
            </Link>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-8 mt-20 pt-12 border-t border-border/50 max-w-3xl mx-auto">
            <div>
              <div className="font-mono text-3xl md:text-4xl font-medium text-foreground">3</div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mt-2">Autonomous Agents</div>
            </div>
            <div>
              <div className="font-mono text-3xl md:text-4xl font-medium text-accent">24/7</div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mt-2">Always Operating</div>
            </div>
            <div>
              <div className="font-mono text-3xl md:text-4xl font-medium text-foreground">0</div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mt-2">Human Intervention</div>
            </div>
          </div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDown className="w-6 h-6 text-muted-foreground" />
        </motion.div>
      </section>

      {/* Problem Section */}
      <section className="relative z-10 py-32 px-8 md:px-16">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <span className="font-mono text-xs uppercase tracking-widest text-accent mb-4 block">The Problem</span>
            <h2 className="font-[var(--font-bebas)] text-5xl md:text-6xl text-foreground tracking-wide">
              WHY LPs KEEP LOSING
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Problem 1 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="border border-destructive/30 bg-destructive/5 p-8 md:p-10"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 border border-destructive/50 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-destructive" />
                </div>
                <h3 className="font-[var(--font-bebas)] text-2xl text-destructive tracking-wide">TOXIC ORDERFLOW</h3>
              </div>
              <p className="font-mono text-sm text-muted-foreground leading-relaxed">
                When the market price moves, arbitrageurs immediately trade against your stale LP price.
                They profit from the difference. You absorb every loss. This is called toxic flow because
                every swap in this condition extracts value from your position.
              </p>
            </motion.div>

            {/* Problem 2 */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="border border-destructive/30 bg-destructive/5 p-8 md:p-10"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 border border-destructive/50 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-destructive" />
                </div>
                <h3 className="font-[var(--font-bebas)] text-2xl text-destructive tracking-wide">IMPERMANENT LOSS</h3>
              </div>
              <p className="font-mono text-sm text-muted-foreground leading-relaxed">
                As price moves through your range, you accumulate the depreciating token and lose the
                appreciating one. In concentrated liquidity, this effect is amplified. Small price moves
                cause massive composition shifts.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Solution Section - The Three Agents */}
      <section className="relative z-10 py-32 px-8 md:px-16 bg-card/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <span className="font-mono text-xs uppercase tracking-widest text-accent mb-4 block">The Solution</span>
            <h2 className="font-[var(--font-bebas)] text-5xl md:text-6xl text-foreground tracking-wide mb-4">
              THREE AGENTS, ONE MISSION
            </h2>
            <p className="font-mono text-sm text-muted-foreground max-w-2xl mx-auto">
              Each agent has a specialized role. Together, they form an autonomous market making system
              that captures value instead of leaking it.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* LiquidityAgent */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0 }}
              className="group border border-blue-400/30 bg-blue-400/5 p-8 hover:border-blue-400/60 transition-all"
            >
              <div className="w-16 h-16 border border-blue-400/50 flex items-center justify-center mb-6 group-hover:bg-blue-400/10 transition-colors">
                <span className="font-[var(--font-bebas)] text-3xl text-blue-400">L</span>
              </div>
              <h3 className="font-[var(--font-bebas)] text-2xl text-blue-400 tracking-wide mb-2">LIQUIDITY AGENT</h3>
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-4">50% Base Allocation</div>
              <p className="font-mono text-xs text-muted-foreground leading-relaxed">
                Places and rebalances concentrated liquidity positions on Algebra Integral DEX.
                Monitors price boundaries and adjusts ranges before going out of position.
              </p>
            </motion.div>

            {/* ArbitrageAgent */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="group border border-accent/30 bg-accent/5 p-8 hover:border-accent/60 transition-all"
            >
              <div className="w-16 h-16 border border-accent/50 flex items-center justify-center mb-6 group-hover:bg-accent/10 transition-colors">
                <span className="font-[var(--font-bebas)] text-3xl text-accent">A</span>
              </div>
              <h3 className="font-[var(--font-bebas)] text-2xl text-accent tracking-wide mb-2">ARBITRAGE AGENT</h3>
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-4">20% Base Allocation</div>
              <p className="font-mono text-xs text-muted-foreground leading-relaxed">
                Watches for price divergence and captures toxic flow before external arbitrageurs.
                When your LP offers a stale price, this agent takes the profit instead of losing it.
              </p>
            </motion.div>

            {/* RiskAgent */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="group border border-emerald-400/30 bg-emerald-400/5 p-8 hover:border-emerald-400/60 transition-all"
            >
              <div className="w-16 h-16 border border-emerald-400/50 flex items-center justify-center mb-6 group-hover:bg-emerald-400/10 transition-colors">
                <span className="font-[var(--font-bebas)] text-3xl text-emerald-400">R</span>
              </div>
              <h3 className="font-[var(--font-bebas)] text-2xl text-emerald-400 tracking-wide mb-2">RISK AGENT</h3>
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-4">30% Base Allocation</div>
              <p className="font-mono text-xs text-muted-foreground leading-relaxed">
                Monitors directional delta exposure across all positions. When risk exceeds thresholds,
                it triggers rebalancing or hedging to protect the treasury from large directional losses.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Reputation System */}
      <section className="relative z-10 py-32 px-8 md:px-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="font-mono text-xs uppercase tracking-widest text-accent mb-4 block">Dynamic Allocation</span>
              <h2 className="font-[var(--font-bebas)] text-5xl md:text-6xl text-foreground tracking-wide mb-6">
                REPUTATION WEIGHTED CAPITAL
              </h2>
              <p className="font-mono text-sm text-muted-foreground leading-relaxed mb-8">
                Every agent action is logged on-chain. Every decision updates the agent's reputation score.
                Capital allocation shifts dynamically based on performance. Agents that perform well earn
                more capital. Agents that underperform get defunded automatically.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 border border-border/50 bg-card/30">
                  <div className="w-10 h-10 bg-green-400/10 border border-green-400/30 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <div className="font-mono text-sm text-foreground">Session Keys</div>
                    <div className="font-mono text-xs text-muted-foreground">Cryptographic spending limits per agent</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 border border-border/50 bg-card/30">
                  <div className="w-10 h-10 bg-accent/10 border border-accent/30 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <div className="font-mono text-sm text-foreground">On-Chain Audit Log</div>
                    <div className="font-mono text-xs text-muted-foreground">Every decision permanently recorded</div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              {/* Reputation Visualization */}
              <div className="border border-border bg-card/50 p-8">
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-6">
                  Live Capital Allocation
                </div>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-mono text-xs text-blue-400">LiquidityAgent</span>
                      <span className="font-mono text-xs text-foreground">50%</span>
                    </div>
                    <div className="h-3 bg-secondary">
                      <div className="h-full bg-blue-400 w-[50%]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-mono text-xs text-accent">ArbitrageAgent</span>
                      <span className="font-mono text-xs text-foreground">20%</span>
                    </div>
                    <div className="h-3 bg-secondary">
                      <div className="h-full bg-accent w-[20%]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-mono text-xs text-emerald-400">RiskAgent</span>
                      <span className="font-mono text-xs text-foreground">30%</span>
                    </div>
                    <div className="h-3 bg-secondary">
                      <div className="h-full bg-emerald-400 w-[30%]" />
                    </div>
                  </div>
                </div>
                <div className="mt-8 pt-6 border-t border-border/50">
                  <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                    Total Treasury
                  </div>
                  <div className="font-mono text-3xl text-foreground">$10,000.00</div>
                  <div className="font-mono text-xs text-muted-foreground">USDC.e</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="relative z-10 py-32 px-8 md:px-16 bg-card/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="font-mono text-xs uppercase tracking-widest text-accent mb-4 block">Built On</span>
            <h2 className="font-[var(--font-bebas)] text-5xl md:text-6xl text-foreground tracking-wide">
              KITE AI INFRASTRUCTURE
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "Kite AI", desc: "Avalanche L1" },
              { name: "Algebra Integral", desc: "DEX Protocol" },
              { name: "Agent Passport", desc: "Verifiable Identity" },
              { name: "Session Keys", desc: "Spending Limits" },
              { name: "Goldsky", desc: "Event Indexing" },
              { name: "Gasless Txs", desc: "Bundler Service" },
              { name: "Next.js", desc: "Dashboard" },
              { name: "TypeScript", desc: "Type Safety" },
            ].map((tech, i) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="border border-border/50 bg-card/50 p-4 text-center hover:border-accent/30 transition-colors"
              >
                <div className="font-mono text-sm text-foreground">{tech.name}</div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mt-1">{tech.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 py-32 px-8 md:px-16">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-[var(--font-bebas)] text-5xl md:text-7xl text-foreground tracking-wide mb-6">
              STOP BLEEDING TO
              <br />
              <span className="text-accent">ARBITRAGEURS</span>
            </h2>
            <p className="font-mono text-sm text-muted-foreground max-w-xl mx-auto mb-12">
              On a standard DEX, your LP bleeds value to external traders.
              On Kitex, your LP captures that value for itself.
            </p>
            <Link
              href="/dashboard"
              className="group inline-flex items-center gap-3 px-10 py-5 bg-accent text-accent-foreground font-mono text-sm uppercase tracking-widest hover:bg-accent/90 transition-all"
            >
              Launch Dashboard
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50 py-12 px-8 md:px-16">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border border-accent/50 flex items-center justify-center">
              <span className="font-[var(--font-bebas)] text-accent text-sm">K</span>
            </div>
            <span className="font-mono text-xs text-muted-foreground">
              Kitex — Autonomous Market Making on Kite AI
            </span>
          </div>
          <div className="flex items-center gap-6">
            <Link
              href="https://github.com/clatsonhacks/KiteX"
              target="_blank"
              className="font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-accent transition-colors flex items-center gap-1"
            >
              GitHub
              <ExternalLink className="w-3 h-3" />
            </Link>
            <Link
              href="/how-it-works"
              className="font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-accent transition-colors"
            >
              Docs
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
