"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAdminNavStore } from "@/store/useAdminNavStore"
import { Menu, Globe, ChevronRight, Sparkles, ShieldCheck, RefreshCw } from "lucide-react"
import { DatabaseToggle } from "@/components/admin/DatabaseToggle"
import { DatabaseSyncModal } from "@/components/admin/DatabaseSyncModal"

export function AdminHeader() {
  const pathname = usePathname()
  const { toggleMobile } = useAdminNavStore()
  const [isSyncModalOpen, setIsSyncModalOpen] = React.useState(false)

  // Generate breadcrumb items
  const breadcrumbs = React.useMemo(() => {
    const segments = pathname.split("/").filter(Boolean)
    if (segments.length <= 1) {
      return [{ label: "Overview", href: "/admin" }]
    }

    return segments.map((seg, idx) => {
      const href = "/" + segments.slice(0, idx + 1).join("/")
      let label = seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, " ")
      if (seg === "admin") label = "Admin"
      if (seg === "detailed-items") label = "Detailed Items"
      if (seg === "new") label = "New Entry"
      return { label, href }
    })
  }, [pathname])

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Menu */}
        <button
          type="button"
          onClick={toggleMobile}
          className="p-2 -ml-1 text-white/60 hover:text-white hover:bg-white/5 rounded-xl lg:hidden transition-colors"
          aria-label="Toggle navigation menu"
        >
          <Menu className="size-5" />
        </button>

        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-white/40">
            <span className="hidden sm:inline-block">System</span>
            <ChevronRight className="size-3 hidden sm:inline-block text-white/20" />
          </div>
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1
            return (
              <React.Fragment key={crumb.href}>
                {idx > 0 && <ChevronRight className="size-3 text-white/20" />}
                {isLast ? (
                  <span className="text-white/90 font-medium truncate max-w-[140px] sm:max-w-[200px]">
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    href={crumb.href}
                    className="text-white/50 hover:text-white transition-colors truncate max-w-[120px]"
                  >
                    {crumb.label}
                  </Link>
                )}
              </React.Fragment>
            )
          })}
        </nav>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Database Connection Selector */}
        <DatabaseToggle />

        {/* Database Synchronization Trigger */}
        <button
          type="button"
          onClick={() => setIsSyncModalOpen(true)}
          title="Synchronize SQLite and Supabase databases"
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all shadow-sm group"
        >
          <RefreshCw className="size-3.5 text-white/50 group-hover:text-lume-primary group-hover:rotate-180 transition-transform duration-500" />
          <span className="hidden sm:inline">Sync</span>
        </button>

        {/* Live Site Preview Link */}
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-white/60 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
        >
          <Globe className="size-3.5 text-lume-primary" />
          <span className="hidden sm:inline">Live Site</span>
          <span className="text-[10px] text-white/30">↗</span>
        </Link>

        {/* System Online Badge */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-emerald-500/5 border border-emerald-500/20 rounded-xl text-[11px] font-mono text-emerald-400">
          <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
          <span>Active Session</span>
        </div>
      </div>

      {/* Sync Modal Dialog */}
      <DatabaseSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
      />
    </header>
  )
}
