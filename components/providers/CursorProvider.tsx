"use client"

import dynamic from "next/dynamic"
import { usePathname } from "next/navigation"

const ArcaneCursorImpl = dynamic(
  () => import("../cursor/ArcaneCursor").then(m => m.ArcaneCursor),
  { ssr: false }
)

export function CursorProvider() {
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith("/admin")

  if (isAdmin) {
    return null
  }

  return <ArcaneCursorImpl />
}
