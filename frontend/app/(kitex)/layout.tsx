import { QueryProvider } from "@/components/query-provider"
import { KitexNav } from "@/components/kitex/kitex-nav"

export default function KitexLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <div className="relative min-h-screen">
        <KitexNav />
        <div className="md:pl-20">{children}</div>
      </div>
    </QueryProvider>
  )
}
