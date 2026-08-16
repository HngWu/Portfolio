"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { getDetailedItems, deleteDetailedItem, DetailedItemRow } from "@/app/actions/detailed-items"
import { GlassCard } from "@/components/ui/GlassCard"
import { Plus, Trash2, Edit3, Search, Layers } from "lucide-react"

const CATEGORY_TABS = [
  { id: "all", label: "All Items" },
  { id: "project", label: "Projects" },
  { id: "experience", label: "Experience" },
  { id: "education", label: "Education" },
  { id: "custom", label: "Custom" },
]

export default function DetailedItemsAdminPage() {
  const router = useRouter()
  const [items, setItems] = React.useState<DetailedItemRow[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [activeTab, setActiveTab] = React.useState("all")
  const [searchQuery, setSearchQuery] = React.useState("")

  const loadData = React.useCallback(async (isMounted: boolean) => {
    setIsLoading(true)
    const data = await getDetailedItems(activeTab === "custom" ? undefined : activeTab)
    if (isMounted) {
      let filtered = data || []
      if (activeTab === "custom") {
        filtered = filtered.filter(item => !["project", "experience", "education"].includes(item.type))
      }
      setItems(filtered)
      setIsLoading(false)
    }
  }, [activeTab])

  React.useEffect(() => {
    let isMounted = true
    loadData(isMounted)
    return () => {
      isMounted = false
    }
  }, [loadData])

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      await deleteDetailedItem(id)
      loadData(true)
    }
  }

  const displayedItems = items.filter(item => {
    const q = searchQuery.toLowerCase()
    return item.title.toLowerCase().includes(q) || (item.subtitle && item.subtitle.toLowerCase().includes(q))
  })

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display text-white/90">Detailed Items Manager</h1>
          <p className="text-sm text-white/50">Manage resume experience, education, and project entries stored in SQLite.</p>
        </div>
        <button
          onClick={() => router.push("/admin/detailed-items/new")}
          className="flex items-center gap-2 px-4 py-2 bg-lume-primary/20 text-lume-primary rounded-xl hover:bg-lume-primary/30 transition-all active:scale-95 shadow-lg shadow-lume-primary/5 text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Detailed Item
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/5 gap-1 overflow-x-auto">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-lume-primary/20 text-lume-primary border border-lume-primary/20"
                  : "text-white/40 hover:text-white hover:bg-white/5"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items..."
            className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-lume-primary/50"
          />
        </div>
      </div>

      {/* Items List */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="size-8 border-2 border-lume-primary/20 border-t-lume-primary rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid gap-4">
          {displayedItems.map((item) => (
            <GlassCard key={item.id} className="p-4 flex items-center justify-between group hover:border-lume-primary/30 transition-all duration-500">
              <div className="flex items-center gap-4 overflow-hidden">
                <div className="w-9 h-9 bg-white/5 rounded-xl flex items-center justify-center text-xs font-mono text-white/40 flex-shrink-0 group-hover:bg-lume-primary/10 group-hover:text-lume-primary transition-colors">
                  {item.order_val}
                </div>
                <div className="overflow-hidden">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-white/90">{item.title}</span>
                    <span className="text-[10px] font-mono text-lume-primary bg-lume-primary/10 px-2 py-0.5 rounded uppercase tracking-tighter border border-lume-primary/20">
                      {item.type}
                    </span>
                    {item.date_range && (
                      <span className="text-xs text-white/40 font-mono">
                        {item.date_range}
                      </span>
                    )}
                  </div>
                  {item.subtitle && (
                    <div className="text-xs text-white/50 mt-0.5 truncate max-w-md">
                      {item.subtitle}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                <button
                  onClick={() => router.push(`/admin/detailed-items/${item.id}`)}
                  className="p-2 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-xl transition-all"
                  title="Edit Item"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(item.id, item.title)}
                  className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400/60 hover:text-red-400 rounded-xl transition-all"
                  title="Delete Item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </GlassCard>
          ))}

          {displayedItems.length === 0 && (
            <div className="text-center py-20 bg-white/[0.02] rounded-3xl border border-dashed border-white/10">
              <Layers className="w-8 h-8 text-white/20 mx-auto mb-3" />
              <p className="text-sm text-white/40 font-mono">No detailed items found.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
