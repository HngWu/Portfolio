"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { getDetailedItems, deleteDetailedItem, DetailedItemRow } from "@/app/actions/detailed-items"
import { GlassCard } from "@/components/ui/GlassCard"
import { Plus, Trash2, Edit3, Search, Layers, X, Calendar, Sparkles } from "lucide-react"
import { useToastStore } from "@/store/useToastStore"
import { useConfirmStore } from "@/store/useConfirmStore"
import { cn } from "@/lib/utils"

const CATEGORY_TABS = [
  { id: "all", label: "All Entries" },
  { id: "experience", label: "Experience" },
  { id: "education", label: "Education" },
  { id: "project", label: "Projects" },
  { id: "custom", label: "Custom" },
]

export default function DetailedItemsAdminPage() {
  const router = useRouter()
  const { addToast } = useToastStore()
  const { confirm } = useConfirmStore()

  const [items, setItems] = React.useState<DetailedItemRow[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [activeTab, setActiveTab] = React.useState("all")
  const [searchQuery, setSearchQuery] = React.useState("")

  const loadData = React.useCallback(async (isMounted: boolean) => {
    setIsLoading(true)
    try {
      const data = await getDetailedItems(activeTab === "custom" ? undefined : activeTab)
      if (isMounted) {
        let filtered = data || []
        if (activeTab === "custom") {
          filtered = filtered.filter(item => !["project", "experience", "education"].includes(item.type))
        }
        setItems(filtered)
        setIsLoading(false)
      }
    } catch (e) {
      addToast("Failed to load items: " + (e as Error).message, "error")
      if (isMounted) setIsLoading(false)
    }
  }, [activeTab, addToast])

  React.useEffect(() => {
    let isMounted = true
    loadData(isMounted)
    return () => {
      isMounted = false
    }
  }, [loadData])

  const handleDelete = async (id: string, title: string) => {
    const shouldDelete = await confirm({
      title: "Delete Entry?",
      message: `Are you sure you want to delete "${title}"? This cannot be undone.`,
      confirmText: "Delete Entry",
      cancelText: "Cancel",
      isDestructive: true
    })

    if (shouldDelete) {
      try {
        await deleteDetailedItem(id)
        addToast(`"${title}" deleted successfully`, "success")
        loadData(true)
      } catch (e) {
        addToast("Failed to delete: " + (e as Error).message, "error")
      }
    }
  }

  const displayedItems = items.filter(item => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return true
    return item.title.toLowerCase().includes(q) || (item.subtitle && item.subtitle.toLowerCase().includes(q))
  })

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-display text-white">Detailed Items Manager</h1>
            <span className="text-xs font-mono text-white/40 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/5">
              {items.length} Total
            </span>
          </div>
          <p className="text-xs sm:text-sm text-white/50 mt-1">
            Manage resume experience, education history, and projects stored in SQLite.
          </p>
        </div>
        <button
          onClick={() => router.push("/admin/detailed-items/new")}
          className="flex items-center gap-2 px-5 py-2.5 bg-lume-primary text-black rounded-xl hover:bg-lume-primary/90 transition-all active:scale-95 shadow-[0_0_20px_rgba(74,255,180,0.25)] text-xs font-bold uppercase tracking-wider"
        >
          <Plus className="size-3.5" />
          <span>Add Entry</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center p-2 bg-white/[0.02] border border-white/5 rounded-2xl backdrop-blur-xl">
        <div className="flex bg-black/40 p-1 rounded-xl border border-white/10 gap-1 overflow-x-auto scrollbar-none">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-3.5 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all whitespace-nowrap",
                activeTab === tab.id
                  ? "bg-lume-primary/15 text-lume-primary border border-lume-primary/30 font-semibold"
                  : "text-white/40 hover:text-white"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="size-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search entries by title or organization..."
            className="w-full bg-black/50 border border-white/10 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-lume-primary/50 transition-colors font-mono"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-white/30 hover:text-white"
            >
              <X className="size-3" />
            </button>
          )}
        </div>
      </div>

      {/* Items List */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="size-8 border-2 border-lume-primary/20 border-t-lume-primary rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid gap-3">
          {displayedItems.map((item) => (
            <GlassCard 
              key={item.id} 
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:border-lume-primary/30 transition-all duration-300 bg-white/[0.01]"
            >
              <div className="flex items-start sm:items-center gap-3.5 overflow-hidden">
                <div className="size-9 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-xs font-mono text-white/40 shrink-0 group-hover:bg-lume-primary/10 group-hover:text-lume-primary transition-colors">
                  #{item.order_val}
                </div>
                <div className="overflow-hidden space-y-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-sm font-semibold text-white/95">{item.title}</span>
                    <span className="text-[10px] font-mono text-lume-primary bg-lume-primary/10 px-2 py-0.5 rounded border border-lume-primary/20 uppercase tracking-wider">
                      {item.type}
                    </span>
                    {item.date_range && (
                      <span className="text-[11px] text-white/40 font-mono flex items-center gap-1">
                        <Calendar className="size-3 text-white/30" />
                        <span>{item.date_range}</span>
                      </span>
                    )}
                  </div>
                  {item.subtitle && (
                    <div className="text-xs text-white/50 truncate max-w-lg">
                      {item.subtitle}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons - Always touch-visible on mobile, sleek on desktop */}
              <div className="flex items-center justify-end gap-2 border-t sm:border-t-0 border-white/5 pt-2 sm:pt-0 shrink-0">
                <button
                  type="button"
                  onClick={() => router.push(`/admin/detailed-items/${item.id}`)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-xl text-xs font-semibold transition-all border border-white/5"
                  title="Edit Entry"
                >
                  <Edit3 className="size-3.5 text-lume-primary" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id, item.title)}
                  className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400/70 hover:text-red-400 rounded-xl transition-all border border-red-500/20"
                  title="Delete Entry"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </GlassCard>
          ))}

          {displayedItems.length === 0 && (
            <div className="text-center py-20 bg-white/[0.01] rounded-3xl border border-dashed border-white/10">
              <Layers className="size-8 text-white/20 mx-auto mb-2" />
              <p className="text-xs font-mono text-white/40">No entries match the selected filter or query.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
