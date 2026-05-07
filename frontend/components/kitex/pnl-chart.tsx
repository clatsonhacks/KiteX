"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import type { ArbEvent } from "@/lib/goldsky"

interface PnLChartProps {
  data: ArbEvent[]
}

export function PnLChart({ data }: PnLChartProps) {
  let cumulative = 0
  const chartData = data.map((event, index) => {
    cumulative += parseFloat(event.profit)
    return {
      index: index + 1,
      cumulative: cumulative,
      profit: parseFloat(event.profit),
      timestamp: new Date(parseInt(event.timestamp) * 1000).toLocaleDateString(),
    }
  })

  if (chartData.length === 0) {
    return (
      <div className="border border-border bg-card/50 p-6 h-[300px] flex items-center justify-center">
        <div className="font-mono text-xs text-muted-foreground">No PnL data yet</div>
      </div>
    )
  }

  return (
    <div className="border border-border bg-card/50 p-6">
      <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-4">
        Cumulative PnL History
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.2 0 0)" />
          <XAxis
            dataKey="index"
            stroke="oklch(0.55 0 0)"
            tick={{ fill: "oklch(0.55 0 0)", fontFamily: "var(--font-ibm-plex-mono)", fontSize: 10 }}
            label={{ value: "Arb #", position: "insideBottom", offset: -5, fill: "oklch(0.55 0 0)" }}
          />
          <YAxis
            stroke="oklch(0.55 0 0)"
            tick={{ fill: "oklch(0.55 0 0)", fontFamily: "var(--font-ibm-plex-mono)", fontSize: 10 }}
            label={{ value: "PnL (USD)", angle: -90, position: "insideLeft", fill: "oklch(0.55 0 0)" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "oklch(0.1 0 0)",
              border: "1px solid oklch(0.25 0 0)",
              borderRadius: 0,
              fontFamily: "var(--font-ibm-plex-mono)",
              fontSize: 11,
            }}
            labelStyle={{ color: "oklch(0.95 0 0)" }}
            itemStyle={{ color: "oklch(0.55 0.8 140)" }}
          />
          <Line
            type="monotone"
            dataKey="cumulative"
            stroke="oklch(0.55 0.8 140)"
            strokeWidth={2}
            dot={{ fill: "oklch(0.55 0.8 140)", r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
