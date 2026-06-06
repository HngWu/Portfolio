"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { cn, getSizeClasses } from "@/lib/utils"
import { getTiles, updateTiles } from "@/app/actions/tiles"
import { Plus, Save, RotateCcw, Check, Loader2, MousePointer2, Settings2, EyeOff, Monitor, Smartphone } from "lucide-react"
import { Database } from "@/types/supabase"
import { BentoGrid } from "@/components/bento/BentoGrid"
import { TileRenderer } from "@/components/bento/TileRenderer"

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

export default function TilesPage() {
  const router = useRouter()
  const [tiles, setTiles] = React.useState<TileRowType[]>([])
  const [initialTiles, setInitialTiles] = React.useState<TileRowType[]>([])
  const [layoutMode, setLayoutMode] = React.useState<'desktop' | 'mobile'>('desktop')
  const [activeId, setActiveId] = React.useState<UniqueIdentifier | null>(null)
  const [isSaving, setIsSaving] = React.useState(false)
  const [saveStatus, setSaveStatus] = React.useState<'idle' | 'saving' | 'success'>('idle')

  const sensors = useSensors(
    useSensor(PointerSensor, { 
      activationConstraint: { 
        distance: 8, // Threshold to distinguish click from drag
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
      console.error("Failed to load:", e)
    }
  }, [])

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
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch (e) {
      alert("Failed to save layout: " + (e as Error).message)
      setSaveStatus('idle')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDiscardChanges = () => {
    if (confirm("Discard all layout changes?")) {
      setTiles(JSON.parse(JSON.stringify(initialTiles)))
    }
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
    <div className="space-y-8 pb-32">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-display text-white/90">Layout Orchestrator</h1>
          <p className="text-sm text-white/50">Drag tiles to reorder. Click a tile to edit its contents on a new page.</p>
        </div>
        <button 
          onClick={() => router.push('/admin/tiles/new')}
          className="flex items-center gap-2 px-6 py-2.5 bg-white/5 text-white/90 border border-white/10 rounded-xl hover:bg-white/10 transition-all active:scale-95 shadow-lg group"
        >
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
          Add New Tile
        </button>
      </div>

      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-mono text-white/30 uppercase tracking-widest flex items-center gap-2">
              Canvas Editor
            </h2>
            <div className="flex p-0.5 bg-white/5 border border-white/10 rounded-xl backdrop-blur-md">
              <button
                type="button"
                onClick={() => setLayoutMode('desktop')}
                className={cn(
                  "flex items-center gap-2 px-4 py-1.5 text-xs font-mono font-bold uppercase tracking-wider rounded-lg transition-all duration-300",
                  layoutMode === 'desktop'
                    ? "bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)] border border-white/5"
                    : "text-white/40 hover:text-white/80 border border-transparent"
                )}
              >
                <Monitor className="w-3.5 h-3.5" />
                Desktop Layout
              </button>
              <button
                type="button"
                onClick={() => setLayoutMode('mobile')}
                className={cn(
                  "flex items-center gap-2 px-4 py-1.5 text-xs font-mono font-bold uppercase tracking-wider rounded-lg transition-all duration-300",
                  layoutMode === 'mobile'
                    ? "bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)] border border-white/5"
                    : "text-white/40 hover:text-white/80 border border-transparent"
                )}
              >
                <Smartphone className="w-3.5 h-3.5" />
                Mobile Layout
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-[10px] text-white/20 font-mono italic">
            <MousePointer2 className="size-3" />
            <span>{layoutMode === 'mobile' ? 'Mobile Simulation (scrollable)' : 'Actual size (1:1 scale)'}</span>
          </div>
        </div>
        
        <div className="relative w-full border border-white/5 rounded-3xl bg-[#050505] min-h-[950px] overflow-visible p-8 md:p-12 shadow-[0_0_100px_rgba(0,0,0,1)]">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className={cn(
              "w-full h-fit transition-all duration-500",
              layoutMode === 'mobile' && "max-w-[500px] mx-auto border border-white/10 p-6 rounded-[40px] bg-black/40 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative ring-8 ring-white/5 transition-all duration-500"
            )}>
              <SortableContext items={sortedTiles.map(t => t.id)} strategy={rectSortingStrategy}>
                <BentoGrid className={cn(layoutMode === 'mobile' && "grid-cols-2 md:grid-cols-2 xl:grid-cols-2 max-w-[480px]")}>
                  {sortedTiles.map((tile, index) => (
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
            </div>

            <DragOverlay dropAnimation={{
              sideEffects: defaultDropAnimationSideEffects({
                styles: { active: { opacity: '0.4' } },
              }),
            }}>
              {activeTile ? (
                <div className={cn("opacity-90 cursor-grabbing h-full w-full shadow-2xl", getSizeClasses(activeTile.size))}>
                  <TileRenderer tile={activeTile} isDragging={true} />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      </section>

      {/* Floating Action Bar */}
      <div className={cn(
        "fixed bottom-8 left-1/2 -translate-x-1/2 z-[90] transition-all duration-700 flex items-center gap-3 p-3 bg-black/60 border border-white/15 backdrop-blur-3xl rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.8)]",
        (hasChanges || saveStatus !== 'idle') ? "translate-y-0 opacity-100" : "translate-y-32 opacity-0 pointer-events-none"
      )}>
        <div className="flex items-center gap-3 px-6 py-2 border-r border-white/10">
          <div className={cn(
            "w-2 h-2 rounded-full animate-pulse shadow-[0_0_10px_currentColor]",
            saveStatus === 'success' ? "bg-green-400 text-green-400" : "bg-lume-primary text-lume-primary"
          )} />
          <span className="text-[10px] text-white/80 font-mono font-bold uppercase tracking-[0.2em]">
            {saveStatus === 'saving' ? 'Synchronizing...' : 
             saveStatus === 'success' ? 'Persisted' : 
             'Layout Modified'}
          </span>
        </div>
        
        {saveStatus === 'idle' && (
          <button 
            onClick={handleDiscardChanges}
            className="flex items-center gap-2 px-5 py-2.5 text-xs text-white/40 hover:text-white hover:bg-white/5 rounded-2xl transition-all font-bold uppercase tracking-widest"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Discard
          </button>
        )}
        
        <button 
          disabled={isSaving || saveStatus === 'success'}
          onClick={handleSaveLayout}
          className={cn(
            "flex items-center gap-2 px-10 py-3 text-sm font-black rounded-2xl transition-all shadow-2xl active:scale-95 disabled:opacity-50",
            saveStatus === 'success' 
              ? "bg-green-500 text-black shadow-green-500/30" 
              : "bg-lume-primary text-black shadow-lume-primary/30 hover:shadow-lume-primary/50"
          )}
        >
          {saveStatus === 'saving' ? (
            <Loader2 className="w-4 h-4 animate-spin text-black" />
          ) : saveStatus === 'success' ? (
            <Check className="w-4 h-4 text-black" />
          ) : (
            <Save className="w-4 h-4 text-black" />
          )}
          <span className="tracking-tighter uppercase">
            {saveStatus === 'saving' ? "Saving..." : 
             saveStatus === 'success' ? "Saved" : 
             "Commit Grid Layout"}
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
      getSizeClasses(tile.size),
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
        <div className="px-4 py-2 bg-black/60 border border-white/10 rounded-full backdrop-blur-xl flex items-center gap-2 text-white/80">
          <Settings2 className="size-3.5 text-lume-primary" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Edit Details</span>
        </div>
      </div>
    </div>
  )
}
