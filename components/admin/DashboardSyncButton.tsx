"use client"

import * as React from "react"
import { RefreshCw } from "lucide-react"
import { DatabaseSyncModal } from "./DatabaseSyncModal"
import { useRouter } from "next/navigation"

export function DashboardSyncButton() {
  const [isOpen, setIsOpen] = React.useState(false)
  const router = useRouter()

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-lume-primary/30 text-white/80 hover:text-white text-xs font-mono transition-all group"
      >
        <RefreshCw className="size-3.5 text-white/50 group-hover:text-lume-primary group-hover:rotate-180 transition-transform duration-500" />
        <span>Synchronize Databases</span>
      </button>

      <DatabaseSyncModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSyncSuccess={() => router.refresh()}
      />
    </>
  )
}
