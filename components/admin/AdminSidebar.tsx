"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutGrid, Briefcase, Settings, Globe, LogOut } from "lucide-react"
import { logout } from "@/app/actions/auth"

const NAV_ITEMS = [
  { label: "Tiles", href: "/admin/tiles", icon: LayoutGrid },
  { label: "Projects", href: "/admin/projects", icon: Briefcase },
  { label: "Config", href: "/admin/config", icon: Settings },
  { label: "Site Preview", href: "/", icon: Globe },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-60 border-r border-white/5 bg-[#0d0d0d] flex flex-col">
      <div className="p-6">
        <div className="text-sm font-mono text-lume-primary tracking-widest uppercase">Admin Panel</div>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive 
                  ? "bg-white/5 text-white" 
                  : "text-white/40 hover:text-white hover:bg-white/[0.02]"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-white/5">
        <button
          onClick={() => logout()}
          className="flex items-center gap-3 px-3 py-2 w-full text-left text-sm font-medium text-white/40 hover:text-red-400 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  )
}
