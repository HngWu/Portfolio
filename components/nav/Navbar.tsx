"use client"

import * as React from "react"
import Link from "next/link"
import { ViewModeToggle } from "./ViewModeToggle"
import { SearchButton } from "./SearchButton"

export function Navbar() {
  return (
    <header className="fixed top-6 left-6 right-6 z-50 flex justify-between items-center pointer-events-none select-none">
      {/* Brand Logo / Home Link */}
      <div className="pointer-events-auto">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-white/[0.03] border border-white/10 rounded-xl flex items-center justify-center font-display text-sm font-bold text-white transition-all duration-300 hover:bg-white/[0.08] hover:border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl group-hover:scale-105 active:scale-95">
            HW
          </div>
        </Link>
      </div>

      {/* Global Actions: Mode Toggle & Search */}
      <div className="flex items-center gap-3 pointer-events-auto">
        <ViewModeToggle />
        <SearchButton />
      </div>
    </header>
  )
}
