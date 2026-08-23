"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { cn, getSizeClasses } from "@/lib/utils"
import { getTiles, updateTiles } from "@/app/actions/tiles"
import { 
  Plus, 
  Save, 
  RotateCcw, 
  Check, 
  Loader2, 
  MousePointer2, 
  Settings2, 
  EyeOff, 
  Eye,
  Monitor, 
  Smartphone, 
  LayoutGrid, 
  ListOrdered, 
  Search, 
  ArrowUp, 
  ArrowDown, 
  Sparkles,
  Layers,
  Filter,
  X
} from "lucide-react"
import { Database } from "@/types/supabase"
import { BentoGrid } from "@/components/bento/BentoGrid"
import { TileRenderer } from "@/components/bento/TileRenderer"
import { ForceMobileContext } from "@/components/bento/ForceMobileContext"
import { GlassCard } from "@/components/ui/GlassCard"
import { useToastStore } from "@/store/useToastStore"
import { useConfirmStore } from "@/store/useConfirmStore"

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  defaultDropAnimationSideEffects,
  DragStartEvent,
  UniqueIdentifier,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'

type TileRowType = Database['public']['Tables']['tiles']['Row']

const CATEGORIES = [
  "all",
  "hero",
  "project",
  "experience",
  "education",
  "skill",
  "stat",
  "contact",
  "award",
  "terminal",
  "3d",
  "easter_egg"
]

export default function TilesPage() {
  const router = useRouter()
  const { addToast } = useToastStore()
  const { confirm } = useConfirmStore()

  const [tiles, setTiles] = React.useState<TileRowType[]>([])
  const [initialTiles, setInitialTiles] = React.useState<TileRowType[]>([])
  const [viewType, setViewType] = React.useState<'canvas' | 'list'>('canvas')
  const [layoutMode, setLayoutMode] = React.useState<'desktop' | 'mobile'>('desktop')
  const [activeId, setActiveId] = React.useState<UniqueIdentifier | null>(null)
  const [isSaving, setIsSaving] = React.useState(false)
  const [saveStatus, setSaveStatus] = React.useState<'idle' | 'saving' | 'success'>('idle')
  
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedCategory, setSelectedCategory] = React.useState("all")

  const sensors = useSensors(
    useSensor(PointerSensor, { 
      activationConstraint: { 
        distance: 8,
      } 
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const load = React.useCallback(async (isMounted: boolean) => {
    try {
      const data = await getTiles()
      const filtered = (data || []).filter(t => t.type !== 'config')
      if (isMounted) {
        setTiles(filtered)
        setInitialTiles(JSON.parse(JSON.stringify(filtered)))
      }
    } catch (e) {
      addToast("Failed to load tiles: " + (e as Error).message, "error")
    }
  }, [addToast])

  React.useEffect(() => {
    let isMounted = true
    const timer = setTimeout(() => {
      load(isMounted)
    }, 0)
    return () => { 
      isMounted = false
      clearTimeout(timer)
    }
  }, [load])

  React.useEffect(() => {
    if (layoutMode === 'mobile') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [layoutMode])

  const sortedTiles = React.useMemo(() => {
    return [...tiles].sort((a, b) => {
      if (layoutMode === 'mobile') {
        const valA = a.order_val_mobile ?? a.order_val
        const valB = b.order_val_mobile ?? b.order_val
        if (valA === valB) {
          return a.order_val - b.order_val
        }
        return valA - valB
      } else {
        return a.order_val - b.order_val
      }
    })
  }, [tiles, layoutMode])

  // Filtered list for search and category filtering
  const displayedTiles = React.useMemo(() => {
    return sortedTiles.filter(tile => {
      const matchesCategory = selectedCategory === "all" || tile.type === selectedCategory
      const q = searchQuery.toLowerCase().trim()
      if (!q) return matchesCategory

      const contentStr = typeof tile.content === 'string' ? tile.content : JSON.stringify(tile.content || {})
      const matchesSearch = tile.id.toLowerCase().includes(q) || 
                            tile.type.toLowerCase().includes(q) || 
                            contentStr.toLowerCase().includes(q)

      return matchesCategory && matchesSearch
    })
  }, [sortedTiles, selectedCategory, searchQuery])

  const hasChanges = React.useMemo(() => {
    if (tiles.length !== initialTiles.length) return true
    const initialTilesMap = new Map(initialTiles.map(t => [t.id, t]))
    
    return tiles.some(tile => {
      const initial = initialTilesMap.get(tile.id)
      if (!initial) return true
      return (
        tile.order_val !== initial.order_val ||
        tile.order_val_mobile !== initial.order_val_mobile ||
        tile.is_hidden !== initial.is_hidden
      )
    })
  }, [tiles, initialTiles])

  const handleSaveLayout = async () => {
    setSaveStatus('saving')
    setIsSaving(true)
    try {
      const desktopSorted = [...tiles].sort((a, b) => a.order_val - b.order_val)
      const desktopOrder = new Map(desktopSorted.map((t, idx) => [t.id, idx + 1]))

      const mobileSorted = [...tiles].sort((a, b) => {
        const valA = a.order_val_mobile ?? a.order_val
        const valB = b.order_val_mobile ?? b.order_val
        if (valA === valB) {
          return a.order_val - b.order_val
        }
        return valA - valB
      })
      const mobileOrder = new Map(mobileSorted.map((t, idx) => [t.id, idx + 1]))

      const updatedTiles = tiles.map(tile => ({
        ...tile,
        order_val: desktopOrder.get(tile.id)!,
        order_val_mobile: mobileOrder.get(tile.id)!
      }))

      await updateTiles(updatedTiles)
      
      const refreshedTiles = await getTiles()
      const data = (refreshedTiles || []).filter(t => t.type !== 'config')
      setTiles(data)
      setInitialTiles(JSON.parse(JSON.stringify(data)))
      
      setSaveStatus('success')
      addToast("Grid layout synchronized and saved", "success")
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch (e) {
      addToast("Failed to save layout: " + (e as Error).message, "error")
      setSaveStatus('idle')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDiscardChanges = async () => {
    const shouldDiscard = await confirm({
      title: "Discard Grid Layout Changes?",
      message: "Are you sure you want to revert all unsaved ordering and visibility changes?",
      confirmText: "Discard Changes",
      cancelText: "Keep Editing",
      isDestructive: true
    })

    if (shouldDiscard) {
      setTiles(JSON.parse(JSON.stringify(initialTiles)))
      addToast("Changes discarded", "info")
    }
  }

  const handleToggleHidden = (tileId: string) => {
    setTiles(prev => prev.map(t => {
      if (t.id === tileId) {
        return { ...t, is_hidden: !t.is_hidden }
      }
      return t
    }))
  }

  const handleMoveItem = (tileId: string, direction: 'up' | 'down') => {
    const currentIndex = sortedTiles.findIndex(t => t.id === tileId)
    if (currentIndex === -1) return
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (targetIndex < 0 || targetIndex >= sortedTiles.length) return

    const newSorted = arrayMove(sortedTiles, currentIndex, targetIndex)
    const updatedTiles = tiles.map(tile => {
      const sortedIdx = newSorted.findIndex(t => t.id === tile.id)
      if (sortedIdx !== -1) {
        return {
          ...tile,
          order_val: layoutMode === 'desktop' ? sortedIdx + 1 : tile.order_val,
          order_val_mobile: layoutMode === 'mobile' ? sortedIdx + 1 : tile.order_val_mobile
        }
      }
      return tile
    })
    setTiles(updatedTiles)
  }

  const handleDragStart = (event: DragStartEvent) => setActiveId(event.active.id)
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)
    if (over && active.id !== over.id) {
      const oldIndex = sortedTiles.findIndex((t) => t.id === active.id)
      const newIndex = sortedTiles.findIndex((t) => t.id === over.id)
      
      const newSorted = arrayMove(sortedTiles, oldIndex, newIndex)
      
      const updatedTiles = tiles.map(tile => {
        const sortedIdx = newSorted.findIndex(t => t.id === tile.id)
        if (sortedIdx !== -1) {
          return {
            ...tile,
            order_val: layoutMode === 'desktop' ? sortedIdx + 1 : tile.order_val,
            order_val_mobile: layoutMode === 'mobile' ? sortedIdx + 1 : tile.order_val_mobile
          }
        }
        return tile
      })
      setTiles(updatedTiles)
    }
  }

  const activeTile = activeId ? tiles.find(t => t.id === activeId) : null

  return (
    <div className="space-y-6 pb-36 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-display text-white">Layout Orchestrator</h1>
            <span className="text-xs font-mono text-white/40 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/5">
              {tiles.length} Tiles
            </span>
          </div>
          <p className="text-xs sm:text-sm text-white/50 mt-1">
            Drag tiles on the canvas or use the reorder list to customize Desktop and Mobile grids.
          </p>
        </div>

        <button 
          onClick={() => router.push('/admin/tiles/new')}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white/5 text-white/90 border border-white/10 rounded-xl hover:bg-white/10 hover:border-lume-primary/30 transition-all active:scale-95 shadow-lg group text-xs font-semibold"
        >
          <Plus className="size-4 text-lume-primary group-hover:rotate-90 transition-transform duration-300" />
          <span>Add New Tile</span>
        </button>
      </div>

      {/* Control Bar: View Switcher, Layout Switcher, Search */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center p-2 bg-white/[0.02] border border-white/5 rounded-2xl backdrop-blur-xl">
        <div className="flex flex-wrap items-center gap-2">
          {/* Mode 1: Canvas vs List View */}
          <div className="flex p-1 bg-black/40 border border-white/10 rounded-xl">
            <button
              type="button"
              onClick={() => setViewType('canvas')}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 text-xs font-mono font-medium rounded-lg transition-all",
                viewType === 'canvas'
                  ? "bg-white/10 text-white shadow-sm border border-white/10"
                  : "text-white/40 hover:text-white"
              )}
            >
              <LayoutGrid className="size-3.5" />
              <span>Canvas Grid</span>
            </button>
            <button
              type="button"
              onClick={() => setViewType('list')}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 text-xs font-mono font-medium rounded-lg transition-all",
                viewType === 'list'
                  ? "bg-white/10 text-white shadow-sm border border-white/10"
                  : "text-white/40 hover:text-white"
              )}
            >
              <ListOrdered className="size-3.5" />
              <span>Reorder List</span>
            </button>
          </div>

          {/* Mode 2: Desktop vs Mobile Simulation */}
          <div className="flex p-1 bg-black/40 border border-white/10 rounded-xl">
            <button
              type="button"
              onClick={() => setLayoutMode('desktop')}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 text-xs font-mono font-medium rounded-lg transition-all",
                layoutMode === 'desktop'
                  ? "bg-white/10 text-white shadow-sm border border-white/10"
                  : "text-white/40 hover:text-white"
              )}
            >
              <Monitor className="size-3.5 text-blue-400" />
              <span className="hidden sm:inline">Desktop</span>
            </button>
            <button
              type="button"
              onClick={() => setLayoutMode('mobile')}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 text-xs font-mono font-medium rounded-lg transition-all",
                layoutMode === 'mobile'
                  ? "bg-white/10 text-white shadow-sm border border-white/10"
                  : "text-white/40 hover:text-white"
              )}
            >
              <Smartphone className="size-3.5 text-lume-primary" />
              <span className="hidden sm:inline">Mobile</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative min-w-[220px]">
          <Search className="size-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tiles by ID or type..."
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

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest px-2 shrink-0">
          Filter:
        </span>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              "px-3 py-1 text-xs font-mono uppercase tracking-wider rounded-lg transition-all whitespace-nowrap shrink-0",
              selectedCategory === cat
                ? "bg-lume-primary/15 text-lume-primary border border-lume-primary/30 font-semibold"
                : "text-white/40 hover:text-white bg-white/[0.02] border border-white/5 hover:bg-white/5"
            )}
          >
            {cat.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* View 1: Canvas Grid Editor */}
      {viewType === 'canvas' ? (
        <section className="space-y-4">
          <div className="relative w-full border border-white/5 rounded-3xl bg-[#050505] min-h-[850px] overflow-visible p-4 sm:p-8 md:p-12 shadow-[0_0_100px_rgba(0,0,0,0.8)]">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <div className={cn(
                "w-full transition-all duration-500",
                layoutMode === 'mobile' 
                  ? "max-w-[480px] mx-auto border border-white/10 p-5 rounded-[40px] bg-black/60 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative ring-8 ring-white/5 min-h-[750px]" 
                  : "h-fit"
              )}>
                <ForceMobileContext.Provider value={layoutMode === 'mobile'}>
                  <SortableContext items={displayedTiles.map(t => t.id)} strategy={rectSortingStrategy}>
                    <BentoGrid className={cn(layoutMode === 'mobile' && "max-w-[480px]")}>
                      {displayedTiles.map((tile, index) => (
                        <SortablePreviewTile 
                          key={tile.id} 
                          tile={{ 
                            ...tile, 
                            order_val: layoutMode === 'desktop' ? index + 1 : tile.order_val,
                            order_val_mobile: layoutMode === 'mobile' ? index + 1 : tile.order_val_mobile
                          }} 
                          onClick={() => router.push(`/admin/tiles/${tile.id}`)}
                        />
                      ))}
                    </BentoGrid>
                  </SortableContext>
                </ForceMobileContext.Provider>
              </div>

              <DragOverlay dropAnimation={{
                sideEffects: defaultDropAnimationSideEffects({
                  styles: { active: { opacity: '0.4' } },
                }),
              }}>
                {activeTile ? (
                  <div className={cn("opacity-90 cursor-grabbing h-full w-full shadow-2xl", getSizeClasses(activeTile.size, false, layoutMode === 'mobile'))}>
                    <TileRenderer tile={activeTile} isDragging={true} />
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          </div>
        </section>
      ) : (
        /* View 2: Compact Touch-Friendly Reorder List */
        <section className="space-y-3">
          {displayedTiles.map((tile, index) => (
            <GlassCard
              key={tile.id}
              className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:border-lume-primary/30 transition-all duration-300"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                {/* Stepper Buttons (Up/Down) for Touch Reordering */}
                <div className="flex flex-col gap-1 shrink-0">
                  <button
                    onClick={() => handleMoveItem(tile.id, 'up')}
                    disabled={index === 0}
                    className="p-1 rounded-md bg-white/5 hover:bg-white/10 text-white/50 hover:text-white disabled:opacity-20 transition-all"
                    title="Move Up"
                  >
                    <ArrowUp className="size-3" />
                  </button>
                  <button
                    onClick={() => handleMoveItem(tile.id, 'down')}
                    disabled={index === displayedTiles.length - 1}
                    className="p-1 rounded-md bg-white/5 hover:bg-white/10 text-white/50 hover:text-white disabled:opacity-20 transition-all"
                    title="Move Down"
                  >
                    <ArrowDown className="size-3" />
                  </button>
                </div>

                {/* Order Number Badge */}
                <div className="size-9 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center font-mono text-xs font-bold text-white/70 shrink-0">
                  #{layoutMode === 'mobile' ? (tile.order_val_mobile || index + 1) : (tile.order_val || index + 1)}
                </div>

                {/* Tile Info */}
                <div className="overflow-hidden space-y-1 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      {tile.type}
                    </span>
                    <span className="text-[10px] font-mono text-white/40 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                      {tile.size}
                    </span>
                    {tile.is_hidden ? (
                      <span className="text-[9px] font-mono text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                        Hidden
                      </span>
                    ) : (
                      <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        Visible
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] font-mono text-white/40 truncate">
                    ID: {tile.id}
                  </div>
                </div>
              </div>

              {/* Action Buttons: Toggle Visibility + Edit */}
              <div className="flex items-center justify-end gap-2 border-t sm:border-t-0 border-white/5 pt-2 sm:pt-0">
                <button
                  type="button"
                  onClick={() => handleToggleHidden(tile.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono transition-all border",
                    tile.is_hidden 
                      ? "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20" 
                      : "bg-white/5 text-white/60 border-white/10 hover:text-white hover:bg-white/10"
                  )}
                  title={tile.is_hidden ? "Make Visible" : "Hide from Grid"}
                >
                  {tile.is_hidden ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5 text-lume-primary" />}
                  <span>{tile.is_hidden ? "Hidden" : "Visible"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => router.push(`/admin/tiles/${tile.id}`)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-lume-primary/10 hover:bg-lume-primary/20 text-lume-primary border border-lume-primary/20 rounded-xl text-xs font-semibold transition-all"
                >
                  <Settings2 className="size-3.5" />
                  <span>Edit Content</span>
                </button>
              </div>
            </GlassCard>
          ))}

          {displayedTiles.length === 0 && (
            <div className="text-center py-20 bg-white/[0.01] rounded-3xl border border-dashed border-white/10">
              <Layers className="size-8 text-white/20 mx-auto mb-2" />
              <p className="text-xs font-mono text-white/40">No matching tiles found for the current query.</p>
            </div>
          )}
        </section>
      )}

      {/* Floating Action Bar */}
      <div className={cn(
        "fixed bottom-6 left-1/2 -translate-x-1/2 z-[90] transition-all duration-500 flex flex-wrap items-center justify-center gap-2 sm:gap-3 p-2 sm:p-2.5 bg-black/80 border border-white/15 backdrop-blur-3xl rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] max-w-[95vw] w-fit",
        (hasChanges || saveStatus !== 'idle') ? "translate-y-0 opacity-100" : "translate-y-32 opacity-0 pointer-events-none"
      )}>
        <div className="flex items-center gap-2.5 px-3 sm:px-4 py-1.5 border-r border-white/10">
          <div className={cn(
            "size-2 rounded-full animate-pulse shadow-[0_0_10px_currentColor]",
            saveStatus === 'success' ? "bg-green-400 text-green-400" : "bg-lume-primary text-lume-primary"
          )} />
          <span className="text-[10px] text-white/80 font-mono font-bold uppercase tracking-widest whitespace-nowrap">
            {saveStatus === 'saving' ? 'Saving...' : 
             saveStatus === 'success' ? 'Persisted' : 
             'Layout Modified'}
          </span>
        </div>
        
        {saveStatus === 'idle' && (
          <button 
            onClick={handleDiscardChanges}
            className="flex items-center gap-1.5 px-3 py-2 text-xs text-white/50 hover:text-white hover:bg-white/5 rounded-xl transition-all font-semibold uppercase tracking-wider"
          >
            <RotateCcw className="size-3.5" />
            <span className="hidden sm:inline">Discard</span>
          </button>
        )}
        
        <button 
          disabled={isSaving || saveStatus === 'success'}
          onClick={handleSaveLayout}
          className={cn(
            "flex items-center gap-2 px-5 sm:px-8 py-2.5 text-xs font-bold rounded-2xl transition-all shadow-xl active:scale-95 disabled:opacity-50 uppercase tracking-wider",
            saveStatus === 'success' 
              ? "bg-green-500 text-black shadow-green-500/30" 
              : "bg-lume-primary text-black shadow-lume-primary/30 hover:shadow-lume-primary/50"
          )}
        >
          {saveStatus === 'saving' ? (
            <Loader2 className="size-3.5 animate-spin text-black" />
          ) : saveStatus === 'success' ? (
            <Check className="size-3.5 text-black" />
          ) : (
            <Save className="size-3.5 text-black" />
          )}
          <span>
            {saveStatus === 'saving' ? "Saving..." : 
             saveStatus === 'success' ? "Saved" : 
             "Save Grid Layout"}
          </span>
        </button>
      </div>
    </div>
  )
}

interface SortablePreviewTileProps {
  tile: TileRowType;
  onClick: () => void;
}

function SortablePreviewTile({ tile, onClick }: SortablePreviewTileProps) {
  const forceMobile = React.useContext(ForceMobileContext)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: tile.id })
  const sortableProps = {
    ref: setNodeRef, ...attributes, ...listeners,
    style: {
      transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
      transition, zIndex: isDragging ? 100 : undefined,
    },
    onClick: () => {
      onClick()
    }
  }

  return (
    <div className={cn(
      "relative group/tile h-full cursor-pointer", 
      getSizeClasses(tile.size, false, forceMobile),
      tile.is_hidden && "opacity-40 grayscale-[0.5]"
    )}>
      <TileRenderer tile={tile} isDragging={isDragging} sortableProps={sortableProps} />
      
      {/* Hidden Indicator */}
      {tile.is_hidden && (
        <div className="absolute top-4 left-4 p-1.5 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg backdrop-blur-md z-20 flex items-center gap-1.5 px-2.5">
          <EyeOff className="size-3" />
          <span className="text-[10px] font-mono font-bold uppercase tracking-tighter">Hidden</span>
        </div>
      )}

      {/* Edit Hint */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/tile:opacity-100 transition-opacity pointer-events-none z-10 bg-lume-primary/[0.03]">
        <div className="px-4 py-2 bg-black/70 border border-white/15 rounded-full backdrop-blur-xl flex items-center gap-2 text-white/90 shadow-2xl">
          <Settings2 className="size-3.5 text-lume-primary" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Edit Details</span>
        </div>
      </div>
    </div>
  )
}
