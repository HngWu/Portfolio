"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft } from "lucide-react"
import { ViewModeToggle } from "./ViewModeToggle"
import { SearchButton } from "./SearchButton"
import { useSiteLoaderStore } from "@/store/useSiteLoaderStore"
import { usePageTransition } from "@/hooks/usePageTransition"

export function Navbar() {
  const pathname = usePathname()
  const isLoaded = useSiteLoaderStore((s) => s.isLoaded)
  const { navigateWithTransition } = usePageTransition()

  if (
    pathname?.startsWith("/admin") ||
    pathname === "/cv" ||
    pathname === "/education" ||
    pathname === "/experience"
  ) {
    return null
  }

  const isHome = pathname === "/"

  return (
    <motion.header
      initial={{ opacity: 0, y: -24 }}
      animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : -24 }}
      transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay: 0.28 }}
      className="fixed top-6 left-6 right-6 z-50 flex justify-between items-center pointer-events-none select-none"
    >
      {/* Brand Logo / Back Button */}
      <div className="pointer-events-auto">
        <Link
          href="/"
          onClick={(e) => {
            if (isHome) {
              window.scrollTo({ top: 0, behavior: "smooth" })
            } else {
              e.preventDefault()
              navigateWithTransition("/")
            }
          }}
          className="flex items-center gap-2 group cursor-pointer"
          aria-label={isHome ? "Home" : "Back to home"}
          title={isHome ? "Home" : "Back to home"}
        >
          <div 
            style={{ viewTransitionName: "brand-logo" }}
            className="w-10 h-10 bg-white/[0.03] border border-white/10 rounded-xl flex items-center justify-center text-white transition-all duration-300 hover:bg-white/[0.08] hover:border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl group-hover:scale-105 active:scale-95"
          >
            <AnimatePresence mode="wait" initial={false}>
              {isHome ? (
                <motion.div
                  key="home-logo"
                  initial={{ opacity: 0, scale: 0.7, rotate: -20 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.7, rotate: 20 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="flex items-center justify-center"
                >
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
                </motion.div>
              ) : (
                <motion.div
                  key="back-icon"
                  initial={{ opacity: 0, scale: 0.7, x: 4 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.7, x: -4 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="flex items-center justify-center"
                >
                  <ArrowLeft className="size-5 text-white/85 group-hover:text-lume-primary transition-all duration-300 group-hover:-translate-x-0.5" />
                </motion.div>
              )}
            </AnimatePresence>
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
