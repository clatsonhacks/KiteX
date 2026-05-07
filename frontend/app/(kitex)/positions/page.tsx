"use client"

import { useQuery } from "@tanstack/react-query"
import { getPositions } from "@/lib/api"
import { getAllLPEvents } from "@/lib/goldsky"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function PositionsPage() {
  const { data: positions, isLoading } = useQuery({
    queryKey: ["positions"],
    queryFn: getPositions,
  })

  const { data: lpEvents = [] } = useQuery({
    queryKey: ["all-lp-events"],
    queryFn: getAllLPEvents,
    refetchInterval: 3000,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="font-mono text-sm text-muted-foreground">Loading positions...</div>
      </div>
    )
  }

  const activePositions = positions?.active || []
  const historicalPositions = positions?.historical || []

  return (
    <div className="relative min-h-screen">
      <div className="grid-bg fixed inset-0 opacity-30" aria-hidden="true" />

      <div className="relative z-10 max-w-[1800px] mx-auto p-8 md:p-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="font-[var(--font-bebas)] text-5xl text-foreground tracking-wide mb-2">
            LP POSITIONS
          </h1>
          <p className="font-mono text-sm text-muted-foreground">
            All active and historical liquidity positions managed by LiquidityAgent
          </p>
        </div>

        {/* Active Positions */}
        <div className="mb-12">
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-4">
            Active Positions ({activePositions.length})
          </div>

          {activePositions.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {activePositions.map((position) => (
                <PositionCard key={position.tokenId} position={position} />
              ))}
            </div>
          ) : (
            <div className="border border-border bg-card/50 p-12 text-center">
              <div className="font-mono text-sm text-muted-foreground">
                No active positions. Waiting for LiquidityAgent to place first position...
              </div>
            </div>
          )}
        </div>

        {/* Historical Positions */}
        <div className="mb-12">
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-4">
            Historical Positions ({historicalPositions.length})
          </div>

          {historicalPositions.length > 0 ? (
            <div className="border border-border bg-card/50 overflow-hidden">
              <table className="w-full font-mono text-xs">
                <thead>
                  <tr className="border-b border-border/50 bg-background/50">
                    <th className="text-left py-3 px-4 text-muted-foreground font-normal">Token ID</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-normal">Pool Pair</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-normal">Opened</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-normal">Closed</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-normal">Fees Earned</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-normal">Final PnL</th>
                  </tr>
                </thead>
                <tbody>
                  {historicalPositions.map((position) => (
                    <tr key={position.tokenId} className="border-b border-border/30 hover:bg-background/50">
                      <td className="py-3 px-4 text-foreground">#{position.tokenId}</td>
                      <td className="py-3 px-4 text-foreground">{position.poolPair}</td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {new Date(position.timeOpen * 1000).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {new Date(position.timeOpen * 1000).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-green-400">${position.feesEarned}</td>
                      <td className={cn(
                        "py-3 px-4",
                        parseFloat(position.feesEarned) > 0 ? "text-green-400" : "text-muted-foreground"
                      )}>
                        ${position.feesEarned}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="border border-border bg-card/50 p-12 text-center">
              <div className="font-mono text-sm text-muted-foreground">
                No historical positions yet
              </div>
            </div>
          )}
        </div>

        {/* LP Events Feed from Goldsky */}
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-4">
            Recent LP Events ({lpEvents.length})
          </div>

          {lpEvents.length > 0 ? (
            <div className="border border-border bg-card/50 p-6">
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {lpEvents.map((event) => (
                  <div key={event.id} className="border-l-2 border-blue-400 bg-background/50 p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-mono text-xs text-foreground mb-1 uppercase">
                          {event.action}
                        </div>
                        <div className="font-mono text-[10px] text-muted-foreground mb-2">
                          Range: Tick {event.tickLower} → {event.tickUpper}
                        </div>
                        <div className="font-mono text-[10px] text-muted-foreground">
                          Liquidity: {parseFloat(event.liquidity).toFixed(2)}
                        </div>
                        {event.feesCollected && (
                          <div className="font-mono text-[10px] text-green-400 mt-1">
                            Fees: ${parseFloat(event.feesCollected).toFixed(4)}
                          </div>
                        )}
                        <Link
                          href={`https://kitescan.ai/tx/${event.txHash}`}
                          target="_blank"
                          className="font-mono text-[10px] text-accent hover:underline mt-2 inline-block"
                        >
                          {event.txHash.slice(0, 16)}...{event.txHash.slice(-8)}
                        </Link>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-[10px] text-muted-foreground">
                          {new Date(parseInt(event.timestamp) * 1000).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="border border-border bg-card/50 p-12 text-center">
              <div className="font-mono text-sm text-muted-foreground">
                No LP events indexed yet
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function PositionCard({ position }: { position: any }) {
  const inRange = position.inRange
  const pricePercentage = 50 // Simplified for now

  return (
    <div className={cn(
      "border bg-card p-6",
      inRange ? "border-green-400/50" : "border-destructive/50"
    )}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-1">
            Position #{position.tokenId}
          </div>
          <div className="font-mono text-lg text-foreground">{position.poolPair}</div>
        </div>
        <div className={cn(
          "px-2 py-1 border text-[9px] font-mono uppercase tracking-widest",
          inRange ? "border-green-400 text-green-400" : "border-destructive text-destructive"
        )}>
          {inRange ? "IN RANGE" : "OUT OF RANGE"}
        </div>
      </div>

      {/* Price Range Visualization */}
      <div className="mb-4">
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
          Price Range
        </div>
        <div className="relative h-8 bg-background border border-border">
          <div
            className={cn(
              "absolute top-0 h-full",
              inRange ? "bg-green-400/20" : "bg-muted/20"
            )}
            style={{ left: "20%", width: "60%" }}
          />
          <div
            className="absolute top-0 h-full w-1 bg-accent"
            style={{ left: `${pricePercentage}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 font-mono text-[10px] text-muted-foreground">
          <span>Tick {position.tickLower}</span>
          <span className="text-accent">Current: {position.currentPrice.toFixed(4)}</span>
          <span>Tick {position.tickUpper}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
            Liquidity
          </div>
          <div className="font-mono text-sm text-foreground">{position.liquidity}</div>
        </div>
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
            Fees Earned
          </div>
          <div className="font-mono text-sm text-green-400">${position.feesEarned}</div>
        </div>
      </div>

      {/* Time Open */}
      <div className="mt-4 pt-4 border-t border-border/30">
        <div className="font-mono text-[10px] text-muted-foreground">
          Opened {new Date(position.timeOpen * 1000).toLocaleString()}
        </div>
      </div>
    </div>
  )
}
