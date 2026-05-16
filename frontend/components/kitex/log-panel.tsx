"use client"

import { useEffect, useRef, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { cn } from "@/lib/utils"
import { Terminal, ChevronDown, ChevronUp, Trash2 } from "lucide-react"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001"

export interface LogEntry {
  id: number
  timestamp: number
  category:
    | "ORCHESTRATOR"
    | "AGENT"
    | "CHAIN"
    | "GOLDSKY"
    | "API"
    | "TX"
    | "DEMO"
    | "SYSTEM"
  level: "info" | "success" | "warn" | "error"
  message: string
  meta?: Record<string, unknown>
}

const CATEGORY_COLOR: Record<LogEntry["category"], string> = {
  ORCHESTRATOR: "text-fuchsia-400",
  AGENT: "text-cyan-400",
  CHAIN: "text-blue-400",
  GOLDSKY: "text-yellow-400",
  API: "text-emerald-400",
  TX: "text-emerald-300 font-bold",
  DEMO: "text-fuchsia-300 font-bold",
  SYSTEM: "text-muted-foreground",
}

const LEVEL_COLOR: Record<LogEntry["level"], string> = {
  info: "text-foreground/90",
  success: "text-emerald-400",
  warn: "text-yellow-400",
  error: "text-red-400",
}

export function LogPanel({ floating = false }: { floating?: boolean }) {
  const [open, setOpen] = useState(true)
  const [entries, setEntries] = useState<LogEntry[]>([])
  const lastIdRef = useRef(0)
  const scrollRef = useRef<HTMLDivElement>(null)
  const autoScrollRef = useRef(true)

  const { data } = useQuery({
    queryKey: ["logs", lastIdRef.current],
    queryFn: async () => {
      const res = await fetch(`${BACKEND_URL}/api/logs?since=${lastIdRef.current}&limit=50`)
      if (!res.ok) throw new Error("logs unavailable")
      return res.json() as Promise<{ logs: LogEntry[] }>
    },
    refetchInterval: 1500,
    retry: false,
  })

  useEffect(() => {
    if (!data?.logs?.length) return
    setEntries((prev) => {
      const merged = [...prev, ...data.logs]
      const trimmed = merged.slice(-200)
      lastIdRef.current = trimmed[trimmed.length - 1].id
      return trimmed
    })
  }, [data])

  useEffect(() => {
    if (!autoScrollRef.current || !scrollRef.current) return
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [entries])

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    autoScrollRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 40
  }

  const fmt = (ts: number) => new Date(ts).toISOString().slice(11, 23)

  const renderMeta = (meta?: Record<string, unknown>) => {
    if (!meta) return null
    return Object.entries(meta).map(([k, v]) => {
      const str = String(v)
      const isKitescan = k === "kitescan" && str.startsWith("http")
      const isTx = (k === "tx" || k === "txHash") && str.startsWith("0x")
      if (isKitescan) {
        return (
          <a
            key={k}
            href={str}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline ml-2"
          >
            ↗ kitescan
          </a>
        )
      }
      if (isTx) {
        return (
          <a
            key={k}
            href={`https://kitescan.ai/tx/${str}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline ml-2"
          >
            {k}={str.slice(0, 10)}…
          </a>
        )
      }
      return (
        <span key={k} className="ml-2">
          <span className="text-muted-foreground/60">{k}=</span>
          <span className="text-muted-foreground">{str}</span>
        </span>
      )
    })
  }

  const containerCls = floating
    ? cn(
        "fixed bottom-0 left-48 md:left-56 right-0 z-40 bg-background/95 backdrop-blur border-t border-border transition-all",
        open ? "h-72" : "h-10"
      )
    : "border border-border bg-card/40 h-full min-h-[300px]"

  return (
    <div className={containerCls}>
      {/* Header */}
      <div
        className={cn(
          "flex items-center justify-between px-4 py-2 border-b border-border bg-background/50",
          floating ? "h-10" : "h-10",
        )}
      >
        <button
          onClick={() => floating && setOpen((v) => !v)}
          className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
        >
          <Terminal className="w-3 h-3" />
          System Log
          <span className="text-accent">·</span>
          <span className="text-accent">{entries.length}</span>
          {floating && (open ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />)}
        </button>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
              live · polling 1.5s
            </span>
          </div>
          <button
            onClick={() => {
              setEntries([])
              lastIdRef.current = 0
            }}
            className="text-muted-foreground/60 hover:text-foreground"
            title="Clear log"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Log lines */}
      {(open || !floating) && (
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="overflow-y-auto font-mono text-[11px] leading-relaxed p-3 h-[calc(100%-2.5rem)]"
        >
          {entries.length === 0 ? (
            <div className="text-muted-foreground/60 italic">
              Waiting for backend activity... (start the backend with <span className="text-foreground">npm run dev</span>)
            </div>
          ) : (
            entries.map((e) => (
              <div key={e.id} className="flex flex-wrap items-baseline gap-x-2 py-0.5">
                <span className="text-muted-foreground/60 shrink-0">{fmt(e.timestamp)}</span>
                <span className={cn("shrink-0", CATEGORY_COLOR[e.category])}>
                  [{e.category}]
                </span>
                <span className={LEVEL_COLOR[e.level]}>{e.message}</span>
                <span className="text-[10px]">{renderMeta(e.meta)}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
