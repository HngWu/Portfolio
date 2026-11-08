"use client"

import dynamic from "next/dynamic"
import { usePathname } from "next/navigation"
import { usePerformanceStore } from "@/store/usePerformanceStore"

const ArcaneCursorImpl = dynamic(
  () => import("../cursor/ArcaneCursor").then(m => m.ArcaneCursor),
  { ssr: false }
)

export function CursorProvider() {
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith("/admin")
  const enableCustomCursor = usePerformanceStore((s) => s.enableCustomCursor)

  if (isAdmin || !enableCustomCursor) {
    return null
  }

  return <ArcaneCursorImpl />
}
