"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import type { ReputationEvent } from "@/lib/goldsky"

interface ReputationChartProps {
  data: ReputationEvent[]
}

export function ReputationChart({ data }: ReputationChartProps) {
  const chartData = data.map((event, index) => ({
    index: index + 1,
    score: parseInt(event.newScore),
    timestamp: new Date(parseInt(event.timestamp) * 1000).toLocaleDateString(),
  }))

  if (chartData.length === 0) {
    return (
      <div className="border border-border bg-card/50 p-6 h-[300px] flex items-center justify-center">
        <div className="font-mono text-xs text-muted-foreground">No reputation data yet</div>
      </div>
    )
  }

  return (
    <div className="border border-border bg-card/50 p-6">
      <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-4">
        Reputation History
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.2 0 0)" />
          <XAxis
            dataKey="index"
            stroke="oklch(0.55 0 0)"
            tick={{ fill: "oklch(0.55 0 0)", fontFamily: "var(--font-ibm-plex-mono)", fontSize: 10 }}
            label={{ value: "Decision #", position: "insideBottom", offset: -5, fill: "oklch(0.55 0 0)" }}
          />
          <YAxis
            stroke="oklch(0.55 0 0)"
            tick={{ fill: "oklch(0.55 0 0)", fontFamily: "var(--font-ibm-plex-mono)", fontSize: 10 }}
            label={{ value: "Score", angle: -90, position: "insideLeft", fill: "oklch(0.55 0 0)" }}
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
            itemStyle={{ color: "oklch(0.7 0.2 45)" }}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke="oklch(0.7 0.2 45)"
            strokeWidth={2}
            dot={{ fill: "oklch(0.7 0.2 45)", r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
