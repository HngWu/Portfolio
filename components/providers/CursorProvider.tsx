"use client"

import dynamic from "next/dynamic"

const ArcaneCursorImpl = dynamic(
  () => import("../cursor/ArcaneCursor").then(m => m.ArcaneCursor),
  { ssr: false }
)

export function CursorProvider() {
  return <ArcaneCursorImpl />
}
