export default function HowItWorksPage() {
  return (
    <div className="relative min-h-screen">
      <div className="grid-bg fixed inset-0 opacity-30" aria-hidden="true" />

      <div className="relative z-10 max-w-[1200px] mx-auto p-8 md:p-12">
        {/* Header */}
        <div className="mb-16">
          <h1 className="font-[var(--font-bebas)] text-6xl text-foreground tracking-wide mb-4">
            HOW IT WORKS
          </h1>
          <p className="font-mono text-sm text-muted-foreground max-w-2xl">
            Kitex solves the two reasons liquidity providers keep losing money on concentrated liquidity DEXs
          </p>
        </div>

        {/* Section 1: The Problem */}
        <section className="mb-16">
          <h2 className="font-[var(--font-bebas)] text-3xl text-accent tracking-wide mb-6">
            1. THE PROBLEM
          </h2>

          <div className="border border-border bg-card/50 p-8 mb-6">
            <h3 className="font-mono text-sm uppercase tracking-widest text-foreground mb-4">
              Problem 1 — Toxic Orderflow
            </h3>
            <p className="font-mono text-xs text-muted-foreground leading-relaxed mb-4">
              When the real market price moves away from what your LP is offering, arbitrageurs immediately trade against your stale price. They buy cheap from your LP and sell at the higher real price elsewhere.
            </p>
            <p className="font-mono text-xs text-muted-foreground leading-relaxed">
              You are the counterparty to every one of those trades. The arbitrageur profits. You lose. This is called toxic flow because every swap against your LP in this condition is a loss for you.
            </p>
          </div>

          <div className="border border-border bg-card/50 p-8">
            <h3 className="font-mono text-sm uppercase tracking-widest text-foreground mb-4">
              Problem 2 — Impermanent Loss
            </h3>
            <p className="font-mono text-xs text-muted-foreground leading-relaxed mb-4">
              As price moves through your LP range, you accumulate more of the token that is going down in price and less of the token going up. When you withdraw, you have less total value than if you had just held the tokens.
            </p>
            <p className="font-mono text-xs text-muted-foreground leading-relaxed">
              In a concentrated range, the effect is amplified because your capital is dense — small price moves cause large shifts in your position composition.
            </p>
          </div>
        </section>

        {/* Section 2: The Three Agents */}
        <section className="mb-16">
          <h2 className="font-[var(--font-bebas)] text-3xl text-accent tracking-wide mb-6">
            2. THE THREE AGENTS
          </h2>

          <div className="space-y-4">
            {/* LiquidityAgent */}
            <div className="border border-blue-400/50 bg-card/50 p-8">
              <div className="flex items-start justify-between mb-4">
                <h3 className="font-mono text-sm uppercase tracking-widest text-blue-400">
                  LiquidityAgent
                </h3>
                <div className="px-3 py-1 border border-blue-400 text-blue-400 font-mono text-[9px] uppercase tracking-widest">
                  50% Base Allocation
                </div>
              </div>
              <p className="font-mono text-xs text-muted-foreground leading-relaxed">
                Places concentrated liquidity positions on Kite's Algebra Integral DEX. Monitors price and rebalances ranges when price approaches the boundary. Every add/remove LP action uses a session key capped to the allocation it has earned through reputation.
              </p>
            </div>

            {/* ArbitrageAgent */}
            <div className="border border-accent/50 bg-card/50 p-8">
              <div className="flex items-start justify-between mb-4">
                <h3 className="font-mono text-sm uppercase tracking-widest text-accent">
                  ArbitrageAgent
                </h3>
                <div className="px-3 py-1 border border-accent text-accent font-mono text-[9px] uppercase tracking-widest">
                  20% Base Allocation
                </div>
              </div>
              <p className="font-mono text-xs text-muted-foreground leading-relaxed">
                Watches the LP positions for price divergence against external reference prices. The moment the LP is offering a stale price, it executes a swap through Algebra's SwapRouter against its own LP — capturing the toxic flow itself before external arbitrageurs can. Every arb that generates profit increases the agent's reputation.
              </p>
            </div>

            {/* RiskAgent */}
            <div className="border border-emerald-400/50 bg-card/50 p-8">
              <div className="flex items-start justify-between mb-4">
                <h3 className="font-mono text-sm uppercase tracking-widest text-emerald-400">
                  RiskAgent
                </h3>
                <div className="px-3 py-1 border border-emerald-400 text-emerald-400 font-mono text-[9px] uppercase tracking-widest">
                  30% Base Allocation
                </div>
              </div>
              <p className="font-mono text-xs text-muted-foreground leading-relaxed">
                Monitors the directional delta accumulating in the LP positions from retail swaps. When exposure exceeds a threshold, it either triggers a range rebalance or logs a hedge intent on-chain. Its decisions are the slowest and most conservative — it requires the highest reputation to operate because it is the last line of defense against large directional losses.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: The Reputation System */}
        <section className="mb-16">
          <h2 className="font-[var(--font-bebas)] text-3xl text-accent tracking-wide mb-6">
            3. THE REPUTATION SYSTEM
          </h2>

          <div className="border border-border bg-card/50 p-8">
            <div className="font-mono text-xs text-muted-foreground leading-relaxed space-y-4">
              <p>
                A CapitalRouter contract holds the shared treasury in USDC.e. It reads each agent's reputation score and allocates capital proportionally.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
                <div className="border border-border/50 bg-background/50 p-4">
                  <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                    New Agent
                  </div>
                  <div className="font-mono text-xl text-foreground">Minimal Capital</div>
                </div>
                <div className="border border-border/50 bg-background/50 p-4">
                  <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                    Proven Agent
                  </div>
                  <div className="font-mono text-xl text-green-400">More Capital</div>
                </div>
                <div className="border border-border/50 bg-background/50 p-4">
                  <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                    Failing Agent
                  </div>
                  <div className="font-mono text-xl text-destructive">Auto-Defunded</div>
                </div>
              </div>

              <p>
                Every agent action is logged permanently on-chain via KitexAuditLog. Every decision updates the agent's reputation score. Capital allocation shifts dynamically based on performance. No human touches a configuration file.
              </p>
            </div>
          </div>
        </section>

        {/* Section 4: Technical Stack */}
        <section>
          <h2 className="font-[var(--font-bebas)] text-3xl text-accent tracking-wide mb-6">
            4. TECH STACK
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-border bg-card/50 p-6">
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
                On-Chain
              </div>
              <ul className="font-mono text-xs text-muted-foreground space-y-2">
                <li>• Kite AI mainnet (Avalanche L1)</li>
                <li>• Algebra Integral DEX (Uniswap V3 compatible)</li>
                <li>• Kite Agent Passport (verifiable identity)</li>
                <li>• Session Keys (cryptographic spending limits)</li>
                <li>• Gasless transactions via Kite bundler</li>
              </ul>
            </div>

            <div className="border border-border bg-card/50 p-6">
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
                Off-Chain
              </div>
              <ul className="font-mono text-xs text-muted-foreground space-y-2">
                <li>• Node.js backend orchestrator</li>
                <li>• Three specialized agent logic modules</li>
                <li>• Goldsky subgraph (historical indexing)</li>
                <li>• MongoDB (decision persistence)</li>
                <li>• Next.js frontend (this dashboard)</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Footer CTA */}
        <div className="border border-accent/50 bg-accent/5 p-8 mt-16 text-center">
          <p className="font-[var(--font-bebas)] text-2xl text-accent tracking-wide mb-4">
            On a standard DEX, your LP bleeds to arbitrageurs.
          </p>
          <p className="font-[var(--font-bebas)] text-2xl text-foreground tracking-wide">
            On Kitex, your LP IS the arbitrageur — and the better it performs, the more capital it earns to protect.
          </p>
        </div>
      </div>
    </div>
  )
}
