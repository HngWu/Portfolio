"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { ViewModeToggle } from "./ViewModeToggle"
import { SearchButton } from "./SearchButton"
import { useSiteLoaderStore } from "@/store/useSiteLoaderStore"

export function Navbar() {
  const pathname = usePathname()
  const isLoaded = useSiteLoaderStore((s) => s.isLoaded)

  if (pathname?.startsWith("/admin") || pathname === "/cv") {
    return null
  }

  return (
    <motion.header
      initial={{ opacity: 0, y: -24 }}
      animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : -24 }}
      transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay: 0.28 }}
      className="fixed top-6 left-6 right-6 z-50 flex justify-between items-center pointer-events-none select-none"
    >
      {/* Brand Logo / Home Link */}
      <div className="pointer-events-auto">
        <Link href="/" className="flex items-center gap-2 group" aria-label="Home">
          <div className="w-10 h-10 bg-white/[0.03] border border-white/10 rounded-xl flex items-center justify-center text-white transition-all duration-300 hover:bg-white/[0.08] hover:border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl group-hover:scale-105 active:scale-95">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="size-5 text-white/85 group-hover:text-lume-primary transition-colors duration-300"
            >
              <path
                d="M12 2L2 12L12 22L22 12L12 2Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 6L6 12L12 18L18 12L12 6Z"
                fill="currentColor"
                fillOpacity="0.2"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </Link>
      </div>

      {/* Global Actions: Mode Toggle & Search */}
      <div className="flex items-center gap-3 pointer-events-auto">
        <ViewModeToggle />
        <SearchButton />
      </div>
    </motion.header>
  )
}
