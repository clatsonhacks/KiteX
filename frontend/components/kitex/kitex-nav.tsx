"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const navItems = [
  { id: "dashboard", label: "Dashboard", href: "/dashboard" },
  { id: "agents", label: "Agents", href: "/agents" },
  { id: "positions", label: "Positions", href: "/positions" },
  { id: "demo", label: "Demo", href: "/demo" },
  { id: "how-it-works", label: "How It Works", href: "/how-it-works" },
]

export function KitexNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed left-0 top-0 z-50 h-screen w-16 md:w-20 flex flex-col justify-center border-r border-border/30 bg-background/80 backdrop-blur-sm">
      {/* Logo */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2">
        <Link href="/dashboard" className="block">
          <div className="font-[var(--font-bebas)] text-xl text-accent tracking-wide rotate-90 whitespace-nowrap">
            KITEX
          </div>
        </Link>
      </div>

      {/* Navigation items */}
      <div className="flex flex-col gap-6 px-4">
        {navItems.map(({ id, label, href }) => {
          const isActive = pathname === href || pathname?.startsWith(`${href}/`)

          return (
            <Link
              key={id}
              href={href}
              className="group relative flex items-center gap-3"
            >
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full transition-all duration-300",
                  isActive ? "bg-accent scale-125" : "bg-muted-foreground/40 group-hover:bg-foreground/60"
                )}
              />
              <span
                className={cn(
                  "absolute left-6 font-mono text-[10px] uppercase tracking-widest opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:left-8 whitespace-nowrap",
                  isActive ? "text-accent" : "text-muted-foreground"
                )}
              >
                {label}
              </span>
            </Link>
          )
        })}
      </div>

      {/* Version tag */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
        <div className="font-mono text-[8px] text-muted-foreground/60 -rotate-90 whitespace-nowrap">
          v1.0.0
        </div>
      </div>
    </nav>
  )
}
