import { cn } from "@/lib/utils"

interface StatCardProps {
  label: string
  value: string
  trend?: "up" | "down" | "neutral"
  subtitle?: string
  className?: string
}

export function StatCard({ label, value, trend, subtitle, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "border border-border bg-card p-6 transition-colors hover:border-accent/50",
        className
      )}
    >
      <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
        {label}
      </div>
      <div
        className={cn(
          "font-mono text-3xl font-medium",
          trend === "up" && "text-green-400",
          trend === "down" && "text-destructive",
          !trend && "text-foreground"
        )}
      >
        {value}
      </div>
      {subtitle && (
        <div className="font-mono text-xs text-muted-foreground mt-2">{subtitle}</div>
      )}
    </div>
  )
}
