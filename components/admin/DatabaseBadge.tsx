"use client"

import * as React from "react"
import { useDatabaseStore } from "@/store/useDatabaseStore"
import { Database, Cloud, RefreshCw } from "lucide-react"

interface DatabaseBadgeProps {
  className?: string
  showLatency?: boolean
}

export function DatabaseBadge({ className = "", showLatency = true }: DatabaseBadgeProps) {
  const { status, isLoading, isSwitching } = useDatabaseStore()

  if (isLoading) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/[0.03] border border-white/5 rounded-lg text-[11px] font-mono text-white/40 ${className}`}>
        <RefreshCw className="size-3 animate-spin text-lume-primary" />
        <span>Resolving DB...</span>
      </div>
    )
  }

  const active = status?.activeProvider || "sqlite"
  const isSupabase = active === "supabase"
  const latency = status?.latencyMs

  return (
    <div
      className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-lg text-[11px] font-mono border transition-all ${
        isSupabase
          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.1)]"
          : "bg-blue-500/10 border-blue-500/30 text-blue-300 shadow-[0_0_10px_rgba(59,130,246,0.1)]"
      } ${className}`}
      title={
        isSupabase
          ? `Connected to Supabase PostgreSQL${latency ? ` (${latency}ms)` : ""}`
          : "Connected to Local SQLite (data/portfolio.db)"
      }
    >
      <span className="relative flex size-2">
        <span
          className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
            isSupabase ? "bg-emerald-400" : "bg-blue-400"
          }`}
        />
        <span
          className={`relative inline-flex rounded-full size-2 ${
            isSupabase ? "bg-emerald-500" : "bg-blue-500"
          }`}
        />
      </span>

      {isSupabase ? (
        <Cloud className="size-3 text-emerald-400 shrink-0" />
      ) : (
        <Database className="size-3 text-blue-400 shrink-0" />
      )}

      <span className="font-semibold tracking-wide">
        {isSupabase ? "Supabase" : "SQLite"}
      </span>

      {showLatency && isSupabase && latency !== undefined && (
        <span className="text-[10px] text-emerald-400/70 border-l border-emerald-500/20 pl-1.5">
          {latency}ms
        </span>
      )}

      {isSwitching && (
        <RefreshCw className="size-2.5 animate-spin text-white/50 ml-0.5" />
      )}
    </div>
  )
}
