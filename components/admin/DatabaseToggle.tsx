"use client"

import * as React from "react"
import { 
  getDatabaseStatusAction, 
  switchDatabaseProviderAction,
  resetDatabaseProviderAction 
} from "@/app/actions/database"
import type { DatabaseProvider, DatabaseStatus } from "@/lib/db/types"
import { useToastStore } from "@/store/useToastStore"
import { Database, Cloud, Loader2, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react"

export function DatabaseToggle() {
  const { addToast } = useToastStore()
  const [status, setStatus] = React.useState<DatabaseStatus | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [isSwitching, setIsSwitching] = React.useState(false)

  const loadStatus = React.useCallback(async () => {
    try {
      const data = await getDatabaseStatusAction()
      setStatus(data)
    } catch {
      // Ignore if session not ready
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadStatus()
  }, [loadStatus])

  const handleSwitch = async (target: DatabaseProvider) => {
    if (isSwitching || status?.activeProvider === target) return

    setIsSwitching(true)
    try {
      const result = await switchDatabaseProviderAction(target)
      if (result.success) {
        addToast(
          target === "supabase" 
            ? `Connected to Supabase (${result.latencyMs ?? 0}ms roundtrip)` 
            : "Switched active database to local SQLite",
          "success"
        )
        await loadStatus()
      } else {
        addToast(result.error || `Failed to switch to ${target}`, "error", 5000)
      }
    } catch (e) {
      addToast((e as Error).message || "An unexpected error occurred", "error")
    } finally {
      setIsSwitching(false)
    }
  }

  const handleReset = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isSwitching) return

    setIsSwitching(true)
    try {
      const result = await resetDatabaseProviderAction()
      if (result.success) {
        addToast(`Reverted database to env default (${status?.defaultProvider})`, "info")
        await loadStatus()
      }
    } catch (e) {
      addToast((e as Error).message, "error")
    } finally {
      setIsSwitching(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.03] border border-white/5 rounded-xl text-[11px] font-mono text-white/40">
        <Loader2 className="size-3 animate-spin text-lume-primary" />
        <span>DB</span>
      </div>
    )
  }

  const active = status?.activeProvider || "sqlite"
  const isOverridden = Boolean(status?.isOverridden)

  return (
    <div className="flex items-center gap-1">
      {/* Dual-Pill Container */}
      <div 
        className="flex items-center p-0.5 bg-black/40 border border-white/10 rounded-xl text-xs font-mono backdrop-blur-md shadow-inner"
        role="group"
        aria-label="Database Provider Selector"
      >
        {/* SQLite Option */}
        <button
          type="button"
          disabled={isSwitching}
          onClick={() => handleSwitch("sqlite")}
          title="Connect to local SQLite database (data/portfolio.db)"
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all text-[11px] font-medium ${
            active === "sqlite"
              ? "bg-white/[0.12] text-white shadow-[0_0_12px_rgba(255,255,255,0.06)] border border-white/10"
              : "text-white/40 hover:text-white/80 hover:bg-white/[0.04]"
          } disabled:opacity-50`}
        >
          <Database className={`size-3 ${active === "sqlite" ? "text-lume-primary" : "text-white/40"}`} />
          <span>SQLite</span>
          {active === "sqlite" && (
            <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
          )}
        </button>

        {/* Supabase Option */}
        <button
          type="button"
          disabled={isSwitching}
          onClick={() => handleSwitch("supabase")}
          title={
            status?.isSupabaseConfigured
              ? status.error
                ? `Supabase Error: ${status.error}`
                : `Connect to Supabase Cloud (${status.latencyMs ?? 0}ms)`
              : "Supabase not configured (missing URL or keys)"
          }
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all text-[11px] font-medium ${
            active === "supabase"
              ? "bg-emerald-500/20 text-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.15)] border border-emerald-500/30"
              : "text-white/40 hover:text-white/80 hover:bg-white/[0.04]"
          } disabled:opacity-50`}
        >
          {isSwitching && active !== "supabase" ? (
            <Loader2 className="size-3 animate-spin text-emerald-400" />
          ) : (
            <Cloud className={`size-3 ${active === "supabase" ? "text-emerald-400" : "text-white/40"}`} />
          )}
          <span>Supabase</span>
          {active === "supabase" && (
            <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399] animate-pulse" />
          )}
        </button>
      </div>

      {/* Override Reset Indicator */}
      {isOverridden && (
        <button
          type="button"
          onClick={handleReset}
          disabled={isSwitching}
          title={`Reset to env default (${status?.defaultProvider})`}
          className="p-1.5 text-white/30 hover:text-amber-400 bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-amber-500/20 rounded-lg transition-all text-[10px]"
          aria-label="Reset database to environment default"
        >
          <RefreshCw className="size-3" />
        </button>
      )}
    </div>
  )
}
