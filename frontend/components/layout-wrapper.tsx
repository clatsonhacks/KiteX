"use client"

import { usePathname } from "next/navigation"
import type React from "react"

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // No padding on landing page (root)
  const isLandingPage = pathname === '/'

  return (
    <div className={isLandingPage ? '' : 'pl-48 md:pl-56'}>
      {children}
    </div>
  )
}
