"use client"

import * as React from "react"
import { syncDatabasesAction, getLastSyncStatusAction } from "@/app/actions/database-sync"
import type { SyncStatus, SyncSummary } from "@/lib/db/types"
import { useToastStore } from "@/store/useToastStore"
import { GlassCard } from "@/components/ui/GlassCard"
import {
  RefreshCw,
  ArrowUpRight,
  ArrowDownLeft,
  X,
  AlertTriangle,
  CheckCircle2,
  HardDrive,
  Cloud,
  Loader2,
  Clock
} from "lucide-react"

interface DatabaseSyncModalProps {
  isOpen: boolean
  onClose: () => void
  onSyncSuccess?: () => void
}

export function DatabaseSyncModal({ isOpen, onClose, onSyncSuccess }: DatabaseSyncModalProps) {
  const { addToast } = useToastStore()
  const [syncStatus, setSyncStatus] = React.useState<SyncStatus | null>(null)
  const [isSyncing, setIsSyncing] = React.useState(false)
  const [selectedDirection, setSelectedDirection] = React.useState<"push" | "pull" | null>(null)
  const [confirmStep, setConfirmStep] = React.useState(false)

  const loadStatus = React.useCallback(async () => {
    try {
      const status = await getLastSyncStatusAction()
      setSyncStatus(status)
    } catch {
      // Session or network error
    }
  }, [])

  React.useEffect(() => {
    if (isOpen) {
      loadStatus()
      setSelectedDirection(null)
      setConfirmStep(false)
    }
  }, [isOpen, loadStatus])

  if (!isOpen) return null

  const handleSelect = (direction: "push" | "pull") => {
    setSelectedDirection(direction)
    setConfirmStep(true)
  }

  const handleCancelConfirm = () => {
    setConfirmStep(false)
    setSelectedDirection(null)
  }

  const handleExecuteSync = async () => {
    if (!selectedDirection || isSyncing) return

    setIsSyncing(true)
    try {
      const result = await syncDatabasesAction(selectedDirection)
      if (result.success && result.summary) {
        const actionLabel = selectedDirection === "push" ? "pushed to Supabase" : "pulled from Supabase"
        addToast(
          `Successfully ${actionLabel} (${result.summary.tilesCount} tiles, ${result.summary.detailedItemsCount} items)`,
          "success",
          5000
        )
        await loadStatus()
        onSyncSuccess?.()
        onClose()
      } else {
        addToast(result.error || "Database synchronization failed", "error", 6000)
      }
    } catch (err) {
      addToast((err as Error).message || "An unexpected error occurred", "error", 6000)
    } finally {
      setIsSyncing(false)
    }
  }

  const formatLastSync = (timestamp: string | null) => {
    if (!timestamp) return "Never"
    try {
      const date = new Date(timestamp)
      return date.toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
    } catch {
      return timestamp
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={!isSyncing ? onClose : undefined}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg z-10">
        <GlassCard className="p-6 border-white/10 shadow-2xl relative overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-lume-primary/10 border border-lume-primary/20 text-lume-primary">
                <RefreshCw className="size-4 animate-[spin_4s_linear_infinite]" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white tracking-wide">
                  Database Synchronization
                </h3>
                <p className="text-xs text-white/50">
                  Replicate content between local SQLite and cloud Supabase
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              disabled={isSyncing}
              className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Last sync info banner */}
          <div className="mt-4 px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-white/60">
              <Clock className="size-3.5 text-white/40" />
              <span>Last synchronized:</span>
            </div>
            <div className="flex items-center gap-2 font-mono">
              <span className="text-white/80">{formatLastSync(syncStatus?.lastSyncTimestamp ?? null)}</span>
              {syncStatus?.lastSyncDirection && (
                <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-bold bg-white/10 text-white/70">
                  {syncStatus.lastSyncDirection}
                </span>
              )}
            </div>
          </div>

          {!confirmStep ? (
            /* Option Selection Step */
            <div className="mt-5 space-y-3">
              {/* Option 1: Push */}
              <button
                type="button"
                onClick={() => handleSelect("push")}
                disabled={isSyncing}
                className="w-full text-left p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/10 hover:border-emerald-500/40 transition-all duration-200 group flex items-start gap-4"
              >
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 group-hover:scale-105 transition-transform shrink-0">
                  <ArrowUpRight className="size-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white group-hover:text-emerald-300 transition-colors">
                      Push to Cloud
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      SQLite → Supabase
                    </span>
                  </div>
                  <p className="text-xs text-white/50 mt-1 leading-relaxed">
                    Uploads your local SQLite content (<code className="text-white/70">tiles</code> and <code className="text-white/70">detailed_items</code>) into Supabase, mirroring any added, edited, or pruned records.
                  </p>
                </div>
              </button>

              {/* Option 2: Pull */}
              <button
                type="button"
                onClick={() => handleSelect("pull")}
                disabled={isSyncing}
                className="w-full text-left p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/10 hover:border-sky-500/40 transition-all duration-200 group flex items-start gap-4"
              >
                <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 group-hover:scale-105 transition-transform shrink-0">
                  <ArrowDownLeft className="size-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white group-hover:text-sky-300 transition-colors">
                      Pull to Local
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                      Supabase → SQLite
                    </span>
                  </div>
                  <p className="text-xs text-white/50 mt-1 leading-relaxed">
                    Downloads all records from Supabase into your local SQLite database using a safe rollback transaction.
                  </p>
                </div>
              </button>
            </div>
          ) : (
            /* Confirmation Step */
            <div className="mt-5 space-y-4">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-3">
                <AlertTriangle className="size-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1 leading-relaxed">
                  <span className="font-semibold text-amber-200">Warning: Overwrite Confirmation</span>
                  <p className="text-amber-300/80">
                    {selectedDirection === "push" ? (
                      <>
                        This will overwrite remote <strong>Supabase</strong> content tables with your local SQLite data. Any items unique to Supabase will be pruned.
                      </>
                    ) : (
                      <>
                        This will overwrite your local <strong>SQLite</strong> content tables with the data from Supabase.
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCancelConfirm}
                  disabled={isSyncing}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleExecuteSync}
                  disabled={isSyncing}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium bg-lume-primary text-black font-semibold hover:bg-lume-primary/90 transition-colors disabled:opacity-50 shadow-lg shadow-lume-primary/20"
                >
                  {isSyncing ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      <span>Synchronizing...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="size-3.5" />
                      <span>Confirm & Synchronize</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  )
}
