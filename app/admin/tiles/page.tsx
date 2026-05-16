"use client"

import * as React from "react"
import { getTiles, updateTile, deleteTile } from "@/app/actions/tiles"
import { GlassCard } from "@/components/ui/GlassCard"
import { Plus, Trash2, Edit2, Save, X } from "lucide-react"
import { Database } from "@/types/supabase"

type TileRowType = Database['public']['Tables']['tiles']['Row']

export default function TilesPage() {
  const [tiles, setTiles] = React.useState<TileRowType[]>([])
  const [editingId, setEditingId] = React.useState<string | null>(null)

  React.useEffect(() => {
    let isMounted = true
    async function load() {
      const data = await getTiles()
      if (isMounted) setTiles(data || [])
    }
    load()
    return () => { isMounted = false }
  }, [])

  const handleSave = async (id: string, updates: Partial<TileRowType>) => {
    try {
      await updateTile(id, updates)
      setEditingId(null)
      const data = await getTiles()
      setTiles(data || [])
    } catch {
      alert("Failed to save")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return
    await deleteTile(id)
    const data = await getTiles()
    setTiles(data || [])
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-display text-white/90">Tiles Manager</h1>
        <button 
          className="flex items-center gap-2 px-4 py-2 bg-lume-primary/20 text-lume-primary rounded-lg hover:bg-lume-primary/30 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Tile
        </button>
      </div>

      <div className="grid gap-4">
        {tiles.map((tile) => (
          <TileRow 
            key={tile.id} 
            tile={tile} 
            isEditing={editingId === tile.id}
            onEdit={() => setEditingId(tile.id)}
            onCancel={() => setEditingId(null)}
            onSave={(updates: Partial<TileRowType>) => handleSave(tile.id, updates)}
            onDelete={() => handleDelete(tile.id)}
          />
        ))}
      </div>
    </div>
  )
}

function TileRow({ 
  tile, 
  isEditing, 
  onEdit, 
  onCancel, 
  onSave, 
  onDelete 
}: { 
  tile: TileRowType; 
  isEditing: boolean; 
  onEdit: () => void; 
  onCancel: () => void; 
  onSave: (updates: Partial<TileRowType>) => void; 
  onDelete: () => void 
}) {
  const [formData, setFormData] = React.useState({
    type: tile.type,
    size: tile.size,
    order_val: tile.order_val,
    content: JSON.stringify(tile.content, null, 2)
  })

  if (isEditing) {
    return (
      <GlassCard className="p-6 space-y-4 border-lume-primary/30">
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-white/30 uppercase">Type</label>
            <input 
              className="w-full bg-white/5 border border-white/10 rounded p-2 text-sm text-white"
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value as TileRowType['type']})}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-white/30 uppercase">Size</label>
            <input 
              className="w-full bg-white/5 border border-white/10 rounded p-2 text-sm text-white"
              value={formData.size}
              onChange={(e) => setFormData({...formData, size: e.target.value})}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-white/30 uppercase">Order</label>
            <input 
              type="number"
              className="w-full bg-white/5 border border-white/10 rounded p-2 text-sm text-white"
              value={formData.order_val}
              onChange={(e) => setFormData({...formData, order_val: parseInt(e.target.value)})}
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-mono text-white/30 uppercase">Content (JSON)</label>
          <textarea 
            rows={6}
            className="w-full bg-white/5 border border-white/10 rounded p-3 text-xs font-mono text-white/70"
            value={formData.content}
            onChange={(e) => setFormData({...formData, content: e.target.value})}
          />
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="px-3 py-1.5 text-xs text-white/40 hover:text-white transition-colors flex items-center gap-1">
            <X className="w-3 h-3" /> Cancel
          </button>
          <button 
            onClick={() => onSave({ ...formData, content: JSON.parse(formData.content) })}
            className="px-4 py-1.5 text-xs bg-lume-primary/20 text-lume-primary rounded hover:bg-lume-primary/30 transition-colors flex items-center gap-1"
          >
            <Save className="w-3 h-3" /> Save Changes
          </button>
        </div>
      </GlassCard>
    )
  }

  return (
    <GlassCard className="p-4 flex items-center justify-between group">
      <div className="flex items-center gap-6">
        <div className="w-8 h-8 bg-white/5 rounded flex items-center justify-center text-xs font-mono text-white/30">
          {tile.order_val}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-white/90">{tile.type}</span>
            <span className="text-[10px] font-mono text-white/30 px-1.5 py-0.5 bg-white/5 rounded">{tile.size}</span>
          </div>
          <div className="text-[10px] text-white/40 mt-1 truncate max-w-md">
            {JSON.stringify(tile.content).substring(0, 100)}...
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={onEdit} className="p-2 text-white/40 hover:text-white transition-colors">
          <Edit2 className="w-4 h-4" />
        </button>
        <button onClick={onDelete} className="p-2 text-white/40 hover:text-red-400 transition-colors">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </GlassCard>
  )
}
