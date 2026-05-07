"use client"

import { useQuery } from "@tanstack/react-query"
import { getAgents } from "@/lib/api"
import { AgentCard } from "@/components/kitex/agent-card"

export default function AgentsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["agents"],
    queryFn: getAgents,
    refetchInterval: 3000,
  })

  // Handle different response formats - backend might return array or object with agents property
  const agents = Array.isArray(data) ? data : (data as any)?.agents || []

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="font-mono text-sm text-muted-foreground">Loading agents...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="border border-destructive/50 bg-destructive/10 p-6">
          <div className="font-mono text-sm text-destructive">
            Failed to load agents. Ensure backend is running at {process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001"}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen">
      <div className="grid-bg fixed inset-0 opacity-30" aria-hidden="true" />

      <div className="relative z-10 max-w-[1800px] mx-auto p-8 md:p-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="font-[var(--font-bebas)] text-5xl text-foreground tracking-wide mb-2">
            AGENTS
          </h1>
          <p className="font-mono text-sm text-muted-foreground">
            Three specialized autonomous agents with reputation-weighted capital delegation
          </p>
        </div>

        {/* Agent Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <AgentCard key={agent.did} agent={agent} />
          ))}
        </div>

        {agents.length === 0 && (
          <div className="border border-border bg-card/50 p-12 text-center">
            <div className="font-mono text-sm text-muted-foreground">
              No agents found. Ensure backend is running.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
