"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  LayoutGrid, 
  Briefcase, 
  Settings, 
  Globe, 
  LogOut, 
  LayoutDashboard, 
  ListTree, 
  ShieldCheck, 
  X,
  Layers,
  FolderOpen
} from "lucide-react"
import { logout } from "@/app/actions/auth"
import { useAdminNavStore } from "@/store/useAdminNavStore"
import { useConfirmStore } from "@/store/useConfirmStore"

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard, exact: true },
  { label: "Tiles Orchestrator", href: "/admin/tiles", icon: LayoutGrid },
  { label: "Projects", href: "/admin/projects", icon: Briefcase },
  { label: "Detailed Items", href: "/admin/detailed-items", icon: ListTree },
  { label: "Document Vault", href: "/admin/vault", icon: FolderOpen },
  { label: "Admins", href: "/admin/users", icon: ShieldCheck },
  { label: "Site Config", href: "/admin/config", icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { isMobileOpen, setMobileOpen } = useAdminNavStore()
  const { confirm } = useConfirmStore()

  // Auto-close mobile drawer on route change
  React.useEffect(() => {
    setMobileOpen(false)
  }, [pathname, setMobileOpen])

  // Lock body scroll when mobile drawer is open
  React.useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isMobileOpen])

  const handleLogout = async () => {
    const shouldLogout = await confirm({
      title: "Confirm Logout",
      message: "Are you sure you want to end your administrative session?",
      confirmText: "Log Out",
      cancelText: "Stay Logged In",
      isDestructive: false
    })
    if (shouldLogout) {
      await logout()
    }
  }

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0d0d0d] border-r border-white/5">
      {/* Brand Header */}
      <div className="p-6 flex items-center justify-between border-b border-white/5">
        <Link 
          href="/admin" 
          className="flex items-center gap-2.5 group"
          onClick={() => setMobileOpen(false)}
        >
          <div className="size-8 rounded-xl bg-lume-primary/10 border border-lume-primary/30 flex items-center justify-center text-lume-primary group-hover:bg-lume-primary/20 transition-all shadow-[0_0_15px_rgba(74,255,180,0.15)]">
            <Layers className="size-4" />
          </div>
          <div>
            <div className="text-xs font-mono font-bold text-white tracking-wider uppercase">Lume Studio</div>
            <div className="text-[10px] font-mono text-lume-primary/80 tracking-widest uppercase">Admin Console</div>
          </div>
        </Link>

        {/* Mobile Close Button */}
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="p-2 text-white/40 hover:text-white rounded-xl lg:hidden hover:bg-white/5 transition-colors"
          aria-label="Close navigation menu"
        >
          <X className="size-5" />
        </button>
      </div>

      {/* Nav List */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-mono text-white/30 uppercase tracking-widest">
          Management
        </div>
        {NAV_ITEMS.map((item) => {
          const isActive = item.exact 
            ? pathname === item.href 
            : pathname === item.href || pathname.startsWith(item.href + "/")

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group relative",
                isActive 
                  ? "bg-white/[0.08] text-white border border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.03)]" 
                  : "text-white/50 hover:text-white hover:bg-white/[0.03] border border-transparent"
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-lume-primary rounded-r-full shadow-[0_0_8px_#4ade80]" />
              )}
              <item.icon className={cn(
                "size-4 shrink-0 transition-colors",
                isActive ? "text-lume-primary" : "text-white/40 group-hover:text-white/80"
              )} />
              <span className="truncate">{item.label}</span>
            </Link>
          )
        })}

        <div className="pt-6 px-3 pb-2 text-[10px] font-mono text-white/30 uppercase tracking-widest">
          Shortcuts
        </div>
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-white/50 hover:text-white hover:bg-white/[0.03] transition-all group"
        >
          <Globe className="size-4 text-white/40 group-hover:text-lume-primary transition-colors" />
          <span>View Live Site</span>
          <span className="text-[10px] text-white/30 ml-auto">↗</span>
        </Link>
      </nav>

      {/* Logout & Footer */}
      <div className="p-4 border-t border-white/5 bg-black/20">
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-3 px-3.5 py-2.5 w-full text-left text-xs font-medium text-white/50 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all group"
        >
          <LogOut className="size-4 text-white/40 group-hover:text-red-400 transition-colors" />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar (lg:block) */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 min-h-screen">
        <div className="sticky top-0 h-screen">
          {sidebarContent}
        </div>
      </aside>

      {/* Mobile Slide-Over Drawer (< lg) */}
      <div 
        className={cn(
          "fixed inset-0 z-50 lg:hidden transition-all duration-300",
          isMobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      >
        {/* Backdrop overlay */}
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />

        {/* Drawer container */}
        <div 
          className={cn(
            "fixed inset-y-0 left-0 w-[280px] max-w-[85vw] shadow-2xl transition-transform duration-300 ease-out z-10",
            isMobileOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          {sidebarContent}
        </div>
      </div>
    </>
  )
}
