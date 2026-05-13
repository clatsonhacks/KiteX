"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const navItems = [
  { id: "home", label: "Home", href: "/" },
  { id: "dashboard", label: "Dashboard", href: "/dashboard" },
  { id: "agents", label: "Agents", href: "/agents" },
  { id: "positions", label: "Positions", href: "/positions" },
  { id: "demo", label: "Demo", href: "/demo" },
  { id: "how-it-works", label: "How It Works", href: "/how-it-works" },
]

export function KitexNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed left-0 top-0 z-50 h-screen w-48 md:w-56 flex flex-col border-r border-border/30 bg-background/80 backdrop-blur-sm">
      {/* Logo */}
      <div className="px-6 pt-8 pb-12">
        <Link href="/" className="block">
          <div className="font-[var(--font-bebas)] text-2xl text-accent tracking-wide">
            KITEX
          </div>
          <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/60 mt-1">
            Autonomous MM
          </div>
        </Link>
      </div>

      {/* Navigation items */}
      <div className="flex flex-col gap-1 px-3 flex-1">
        {navItems.map(({ id, label, href }) => {
          const isActive = pathname === href || (href !== "/" && pathname?.startsWith(`${href}/`))

          return (
            <Link
              key={id}
              href={href}
              className={cn(
                "group relative flex items-center gap-3 px-3 py-2.5 transition-colors",
                isActive ? "bg-accent/10" : "hover:bg-card/50"
              )}
            >
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full transition-all duration-200",
                  isActive
                    ? "bg-accent scale-125"
                    : "bg-muted-foreground/40 group-hover:bg-foreground/60"
                )}
              />
              <span
                className={cn(
                  "font-mono text-[11px] uppercase tracking-widest transition-colors",
                  isActive
                    ? "text-accent"
                    : "text-muted-foreground group-hover:text-foreground"
                )}
              >
                {label}
              </span>
            </Link>
          )
        })}
      </div>

      {/* Version tag */}
      <div className="px-6 pb-6">
        <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/60">
          v1.0.0 · Mainnet
        </div>
      </div>
    </nav>
  )
}
