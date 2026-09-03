"use client"

import * as React from "react"
import {
  Folder,
  FileText,
  ShieldCheck,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Save,
  RotateCcw,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Trophy,
  Award,
  Star,
  Layers,
  FolderOpen,
} from "lucide-react"
import { GlassCard } from "@/components/ui/GlassCard"
import { useToastStore } from "@/store/useToastStore"
import { useConfirmStore } from "@/store/useConfirmStore"
import {
  VAULT_FOLDERS,
  VAULT_DOCUMENTS,
  type VaultConfig,
  type VaultFolderSetting,
  type VaultFileSetting,
  getDefaultVaultConfig,
} from "@/lib/cv/documents"
import {
  getVaultConfigAction,
  saveVaultConfigAction,
  resetVaultConfigAction,
} from "@/app/actions/vault"

export default function AdminVaultPage() {
  const { addToast } = useToastStore()
  const { confirm } = useConfirmStore()

  const [config, setConfig] = React.useState<VaultConfig | null>(null)
  const [initialConfigJson, setInitialConfigJson] = React.useState<string>("")
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [expandedFolders, setExpandedFolders] = React.useState<Record<string, boolean>>({
    resume: true,
    hackathons: true,
    scholarships: true,
    honours: true,
    grades: true,
  })

  // Load vault configuration from database
  React.useEffect(() => {
    let active = true
    getVaultConfigAction()
      .then((loaded) => {
        if (!active) return
        setConfig(loaded)
        setInitialConfigJson(JSON.stringify(loaded))
        setLoading(false)
      })
      .catch((err) => {
        console.error("Failed to load vault config:", err)
        if (!active) return
        const def = getDefaultVaultConfig()
        setConfig(def)
        setInitialConfigJson(JSON.stringify(def))
        setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const hasUnsavedChanges = React.useMemo(() => {
    if (!config) return false
    return JSON.stringify(config) !== initialConfigJson
  }, [config, initialConfigJson])

  const toggleFolderExpand = (folderId: string) => {
    setExpandedFolders((prev) => ({ ...prev, [folderId]: !prev[folderId] }))
  }

  // Folder ordering
  const moveFolder = (index: number, direction: "up" | "down") => {
    if (!config) return
    const targetIndex = direction === "up" ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= config.folders.length) return

    const newFolders = [...config.folders]
    const temp = newFolders[index]
    newFolders[index] = newFolders[targetIndex]
    newFolders[targetIndex] = temp

    // Update order values
    const updated = newFolders.map((f, idx) => ({ ...f, order: idx + 1 }))
    setConfig({ folders: updated })
  }

  // Folder visibility toggle
  const toggleFolderVisibility = (folderId: string) => {
    if (!config) return
    const updated = config.folders.map((f) =>
      f.id === folderId ? { ...f, visible: !f.visible } : f
    )
    setConfig({ folders: updated })
  }

  // File ordering within folder
  const moveFile = (folderId: string, fileIndex: number, direction: "up" | "down") => {
    if (!config) return
    const folder = config.folders.find((f) => f.id === folderId)
    if (!folder) return

    const targetIndex = direction === "up" ? fileIndex - 1 : fileIndex + 1
    if (targetIndex < 0 || targetIndex >= folder.files.length) return

    const newFiles = [...folder.files]
    const temp = newFiles[fileIndex]
    newFiles[fileIndex] = newFiles[targetIndex]
    newFiles[targetIndex] = temp

    const updatedFiles = newFiles.map((f, idx) => ({ ...f, order: idx + 1 }))

    const updatedFolders = config.folders.map((f) =>
      f.id === folderId ? { ...f, files: updatedFiles } : f
    )
    setConfig({ folders: updatedFolders })
  }

  // File visibility toggle
  const toggleFileVisibility = (folderId: string, fileId: string) => {
    if (!config) return
    const updatedFolders = config.folders.map((f) => {
      if (f.id !== folderId) return f
      return {
        ...f,
        files: f.files.map((file) =>
          file.id === fileId ? { ...file, visible: !file.visible } : file
        ),
      }
    })
    setConfig({ folders: updatedFolders })
  }

  const handleSave = async () => {
    if (!config) return
    setSaving(true)
    try {
      const res = await saveVaultConfigAction(config)
      if (res.success) {
        setInitialConfigJson(JSON.stringify(config))
        addToast("Document Vault configuration saved successfully!", "success")
      } else {
        addToast(res.message || "Failed to save configuration", "error")
      }
    } catch (err) {
      addToast((err as Error).message, "error")
    } finally {
      setSaving(false)
    }
  }

  const handleReset = async () => {
    const shouldReset = await confirm({
      title: "Reset Vault Configuration",
      message:
        "Are you sure you want to reset all document and folder orders and visibility to default?",
      confirmText: "Reset to Defaults",
      cancelText: "Cancel",
      isDestructive: true,
    })

    if (!shouldReset) return

    setSaving(true)
    try {
      await resetVaultConfigAction()
      const def = getDefaultVaultConfig()
      setConfig(def)
      setInitialConfigJson(JSON.stringify(def))
      addToast("Vault configuration reset to defaults.", "info")
    } catch (err) {
      addToast((err as Error).message, "error")
    } finally {
      setSaving(false)
    }
  }

  if (loading || !config) {
    return (
      <div className="w-full h-96 flex flex-col items-center justify-center text-white/50 font-mono text-sm gap-3">
        <div className="w-6 h-6 border-2 border-lume-primary/20 border-t-lume-primary rounded-full animate-spin" />
        <span>Loading Document Vault settings...</span>
      </div>
    )
  }

  const folderMetaMap = new Map(VAULT_FOLDERS.map((f) => [f.id, f]))
  const docMetaMap = new Map(VAULT_DOCUMENTS.map((d) => [d.id, d]))

  const totalFolders = config.folders.length
  const visibleFolders = config.folders.filter((f) => f.visible).length
  const totalFiles = config.folders.reduce((acc, f) => acc + f.files.length, 0)
  const visibleFiles = config.folders.reduce(
    (acc, f) => acc + f.files.filter((file) => file.visible && f.visible).length,
    0
  )

  const getFolderIcon = (id: string) => {
    switch (id) {
      case "hackathons":
        return <Trophy className="w-4 h-4 text-[#4AFFB4]" />
      case "scholarships":
        return <Award className="w-4 h-4 text-amber-300" />
      case "honours":
        return <Star className="w-4 h-4 text-cyan-300" />
      case "grades":
        return <ShieldCheck className="w-4 h-4 text-[#4AFFB4]" />
      case "resume":
      default:
        return <Sparkles className="w-4 h-4 text-[#4AFFB4]" />
    }
  }

  return (
    <div className="space-y-6 pb-32 animate-in fade-in duration-300">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-display text-white">Document Vault Orchestrator</h1>
            <span className="text-xs font-mono text-white/40 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/5">
              {visibleFiles}/{totalFiles} Documents Active
            </span>
          </div>
          <p className="text-xs sm:text-sm text-white/50 mt-1">
            Reorder categories, toggle file visibility, and customize the live visitor document vault.
          </p>
        </div>

        {/* Global Actions */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <a
            href="/cv"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-medium text-white/70 hover:text-white transition-all font-mono"
            title="Preview live CV & Document Vault"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#4AFFB4]" />
            <span>View /cv Live</span>
          </a>

          <button
            type="button"
            onClick={handleReset}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-medium text-white/70 hover:text-white transition-all font-mono cursor-pointer disabled:opacity-50"
            title="Reset to default orders and visibility"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !hasUnsavedChanges}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold font-mono transition-all cursor-pointer ${
              hasUnsavedChanges
                ? "bg-[#4AFFB4] text-black hover:scale-105 shadow-[0_0_20px_rgba(74,255,180,0.25)]"
                : "bg-white/10 text-white/40 cursor-not-allowed"
            }`}
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving..." : hasUnsavedChanges ? "Save Changes" : "Saved"}</span>
          </button>
        </div>
      </div>

      {/* Unsaved changes alert bar */}
      {hasUnsavedChanges && (
        <div className="p-3 rounded-xl bg-[#4AFFB4]/10 border border-[#4AFFB4]/30 flex items-center justify-between text-xs font-mono text-[#4AFFB4] animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#4AFFB4] animate-pulse" />
            <span>You have unsaved changes to document order and visibility.</span>
          </div>
          <button
            type="button"
            onClick={handleSave}
            className="underline hover:text-white cursor-pointer font-bold"
          >
            Save now
          </button>
        </div>
      )}

      {/* Folders Accordion List */}
      <div className="space-y-4">
        {config.folders.map((folderSetting, folderIdx) => {
          const baseFolder = folderMetaMap.get(folderSetting.id)
          const isExpanded = expandedFolders[folderSetting.id]
          const isFirst = folderIdx === 0
          const isLast = folderIdx === config.folders.length - 1

          return (
            <div
              key={folderSetting.id}
              className={`rounded-2xl border transition-all overflow-hidden ${
                folderSetting.visible
                  ? "bg-white/[0.02] border-white/10"
                  : "bg-white/[0.01] border-white/5 opacity-65"
              }`}
            >
              {/* Folder Row */}
              <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3 bg-white/[0.01] hover:bg-white/[0.03] transition-colors">
                {/* Left: Reorder & Title */}
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  {/* Order controls */}
                  <div className="flex items-center gap-0.5 bg-white/[0.03] border border-white/10 rounded-lg p-0.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => moveFolder(folderIdx, "up")}
                      disabled={isFirst}
                      className="p-1 rounded hover:bg-white/10 disabled:opacity-20 text-white/60 hover:text-white transition-colors cursor-pointer"
                      title="Move Folder Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveFolder(folderIdx, "down")}
                      disabled={isLast}
                      className="p-1 rounded hover:bg-white/10 disabled:opacity-20 text-white/60 hover:text-white transition-colors cursor-pointer"
                      title="Move Folder Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Expand toggle */}
                  <button
                    type="button"
                    onClick={() => toggleFolderExpand(folderSetting.id)}
                    className="p-1 text-white/40 hover:text-white cursor-pointer"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>

                  <div className="shrink-0">{getFolderIcon(folderSetting.id)}</div>

                  <div className="truncate">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white tracking-wide truncate">
                        {baseFolder?.name || folderSetting.id}
                      </span>
                      <span className="text-[10px] font-mono text-white/40 px-1.5 py-0.5 rounded bg-white/5 border border-white/5">
                        {folderSetting.files.length} Files
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Visibility Toggle Button */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => toggleFolderVisibility(folderSetting.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono transition-all cursor-pointer ${
                      folderSetting.visible
                        ? "bg-[#4AFFB4]/15 border-[#4AFFB4]/40 text-[#4AFFB4]"
                        : "bg-white/5 border-white/10 text-white/40 hover:text-white"
                    }`}
                    title={
                      folderSetting.visible
                        ? "Click to hide entire folder on /cv"
                        : "Click to show folder on /cv"
                    }
                  >
                    {folderSetting.visible ? (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Visible</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Hidden</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Nested Files List */}
              {isExpanded && (
                <div className="p-3 sm:p-4 pt-1 border-t border-white/5 bg-black/20 space-y-2">
                  {folderSetting.files.map((fileSetting, fileIdx) => {
                    const doc = docMetaMap.get(fileSetting.id)
                    const isFileFirst = fileIdx === 0
                    const isFileLast = fileIdx === folderSetting.files.length - 1

                    return (
                      <div
                        key={fileSetting.id}
                        className={`p-2.5 sm:p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                          fileSetting.visible && folderSetting.visible
                            ? "bg-white/[0.02] border-white/5 hover:border-white/10"
                            : "bg-white/[0.005] border-white/5 opacity-50"
                        }`}
                      >
                        {/* Reorder & File Details */}
                        <div className="flex items-center gap-2.5 min-w-0">
                          {/* File up/down controls */}
                          <div className="flex items-center gap-0.5 bg-white/[0.02] border border-white/10 rounded-lg p-0.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => moveFile(folderSetting.id, fileIdx, "up")}
                              disabled={isFileFirst}
                              className="p-1 rounded hover:bg-white/10 disabled:opacity-20 text-white/50 hover:text-white transition-colors cursor-pointer"
                              title="Move File Up"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveFile(folderSetting.id, fileIdx, "down")}
                              disabled={isFileLast}
                              className="p-1 rounded hover:bg-white/10 disabled:opacity-20 text-white/50 hover:text-white transition-colors cursor-pointer"
                              title="Move File Down"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                          </div>

                          {/* File Icon */}
                          <div className="shrink-0">
                            <FileText className="w-4 h-4 text-white/60" />
                          </div>

                          {/* File Title & Subtitle */}
                          <div className="truncate">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-white/90 truncate">
                                {doc?.title || fileSetting.id}
                              </span>
                              <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded border bg-white/5 border-white/10 text-white/60">
                                {doc?.format || "FILE"}
                              </span>
                            </div>
                            <p className="text-[10px] text-white/40 truncate font-mono mt-0.5">
                              {doc?.filename} • {doc?.sizeLabel}
                            </p>
                          </div>
                        </div>

                        {/* File Visibility Toggle */}
                        <div className="shrink-0">
                          <button
                            type="button"
                            onClick={() => toggleFileVisibility(folderSetting.id, fileSetting.id)}
                            className={`p-1.5 sm:px-2.5 sm:py-1 rounded-lg border text-xs font-mono transition-all cursor-pointer ${
                              fileSetting.visible
                                ? "bg-white/[0.04] border-white/10 text-[#4AFFB4] hover:bg-white/[0.08]"
                                : "bg-white/[0.01] border-white/5 text-white/30 hover:text-white"
                            }`}
                            title={
                              fileSetting.visible
                                ? "Click to hide document on /cv"
                                : "Click to show document on /cv"
                            }
                          >
                            {fileSetting.visible ? (
                              <div className="flex items-center gap-1">
                                <Eye className="w-3.5 h-3.5 text-[#4AFFB4]" />
                                <span className="hidden sm:inline text-[11px]">Show</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <EyeOff className="w-3.5 h-3.5 text-white/40" />
                                <span className="hidden sm:inline text-[11px]">Hidden</span>
                              </div>
                            )}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
