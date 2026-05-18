"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { getTiles, updateTile, deleteTile, createTile } from "@/app/actions/tiles"
import { GlassCard } from "@/components/ui/GlassCard"
import { Save, Trash2, ArrowLeft, Type, Maximize, Settings2 } from "lucide-react"
import CodeMirror from '@uiw/react-codemirror'
import { json } from '@codemirror/lang-json'
import { vscodeDark } from '@uiw/codemirror-theme-vscode'
import { Database, Json } from "@/types/supabase"
import Link from "next/link"
import { cn } from "@/lib/utils"

type TileRowType = Database['public']['Tables']['tiles']['Row']
type TileInsert = Database['public']['Tables']['tiles']['Insert']

const PRESET_SIZES: Record<string, string> = {
  "1x1": "Small Square",
  "1x2": "Portrait",
  "2x1": "Small Wide",
  "2x2": "Standard Square",
  "3x1": "Compact Banner",
  "3x2": "Card",
  "3x3": "Balanced Square",
  "4x1": "Wide Slim",
  "4x2": "Primary Row",
  "4x3": "Deep Card",
  "4x4": "Large Square",
  "4x5": "Portrait Hero",
  "4x6": "Extra Deep Card",
  "6x1": "Half Width Slim",
  "6x2": "Half Width Row",
  "6x4": "Hero Block",
  "8x2": "Primary Focus",
  "8x4": "Cinematic Focus",
  "12x2": "Full Width Banner",
  "12x4": "Ultra Hero",
  "2x4": "Slim Tall"
}

export default function TileEditPage() {
  const { id } = useParams()
  const router = useRouter()
  const isNew = id === 'new'
  
  const [isLoading, setIsLoading] = React.useState(!isNew)
  const [isSaving, setIsSaving] = React.useState(false)

  const [isCustomSize, setIsCustomSize] = React.useState(false)
  const [formData, setFormData] = React.useState({
    type: 'project',
    size: '2x2',
    content: '{}',
    deep_dive: '{}',
    is_hidden: false
  })

  React.useEffect(() => {
    if (!isNew) {
      getTiles().then(tiles => {
        const found = tiles?.find(t => t.id === id)
        if (found) {
          const isPreset = Object.keys(PRESET_SIZES).includes(found.size)
          setIsCustomSize(!isPreset)
          setFormData({
            type: found.type,
            size: found.size,
            content: JSON.stringify(found.content, null, 2),
            deep_dive: JSON.stringify(found.deep_dive || {}, null, 2),
            is_hidden: found.is_hidden
          })
        }
        setIsLoading(false)
      })
    }
  }, [id, isNew])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const payload = {
        type: formData.type,
        size: formData.size,
        content: JSON.parse(formData.content) as Json,
        deep_dive: JSON.parse(formData.deep_dive) as Json,
        is_hidden: formData.is_hidden
      }

      if (isNew) {
        await createTile(payload as TileInsert)
      } else {
        await updateTile(id as string, payload as Partial<TileRowType>)
      }
      router.push('/admin/tiles')
      router.refresh()
    } catch (e) {
      alert("Failed to save: " + (e as Error).message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this tile?")) return
    try {
      await deleteTile(id as string)
      router.push('/admin/tiles')
      router.refresh()
    } catch (e) {
      alert("Failed to delete: " + (e as Error).message)
    }
  }

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-8 h-8 border-2 border-lume-primary/30 border-t-lume-primary rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/admin/tiles"
            className="p-2 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white rounded-full transition-all"
          >
            <ArrowLeft className="size-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-display text-white/90">
              {isNew ? 'Create New Tile' : `Edit Tile`}
            </h1>
            <p className="text-sm text-white/40 font-mono uppercase tracking-tighter mt-0.5">
              {isNew ? 'Add a new element to your bento grid' : `ID: ${id}`}
            </p>
          </div>
        </div>
        
        {!isNew && (
          <button 
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 text-red-400/60 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all text-sm font-medium"
          >
            <Trash2 className="size-4" />
            Delete
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Basic Settings */}
        <div className="lg:col-span-1 space-y-6">
          <GlassCard className="p-6 space-y-6 border-white/5 bg-white/[0.02]">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[10px] font-mono text-white/30 uppercase tracking-widest">
                <Type className="size-3" />
                <span>Tile Category</span>
              </div>
              <select 
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:ring-2 focus:ring-lume-primary/50 outline-none appearance-none transition-all cursor-pointer"
                value={formData.type} 
                onChange={(e) => setFormData({...formData, type: e.target.value})}
              >
                {['hero', 'project', 'experience', 'education', 'terminal', 'stat', 'skill', 'award', 'contact', '3d', 'easter_egg'].map(t => (
                  <option key={t} value={t} className="bg-[#0f0f0f]">{t.replace('_', ' ').toUpperCase()}</option>
                ))}
              </select>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[10px] font-mono text-white/30 uppercase tracking-widest">
                <Maximize className="size-3" />
                <span>Grid Dimensions</span>
              </div>
              
              <div className="space-y-3">
                {/* Standard Size Selector */}
                <select 
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:ring-2 focus:ring-lume-primary/50 outline-none appearance-none transition-all cursor-pointer"
                  value={isCustomSize ? 'custom' : (Object.keys(PRESET_SIZES).includes(formData.size) ? formData.size : 'custom')}
                  onChange={(e) => {
                    if (e.target.value === 'custom') {
                      setIsCustomSize(true)
                    } else {
                      setIsCustomSize(false)
                      setFormData({...formData, size: e.target.value})
                    }
                  }}
                >
                  <optgroup label="Small & Standard" className="bg-[#0a0a0a]">
                    <option value="1x1">1x1 (Icon/Square)</option>
                    <option value="1x2">1x2 (Portrait)</option>
                    <option value="2x1">2x1 (Small Wide)</option>
                    <option value="2x2">2x2 (Standard Square)</option>
                  </optgroup>
                  <optgroup label="Medium & Functional" className="bg-[#0a0a0a]">
                    <option value="3x1">3x1 (Compact Banner)</option>
                    <option value="3x2">3x2 (Card)</option>
                    <option value="3x3">3x3 (Balanced Square)</option>
                    <option value="4x1">4x1 (Wide Slim)</option>
                    <option value="4x2">4x2 (Primary Row)</option>
                    <option value="4x3">4x3 (Deep Card)</option>
                    <option value="4x4">4x4 (Large Square)</option>
                    <option value="4x5">4x5 (Portrait Hero)</option>
                    <option value="4x6">4x6 (Extra Deep Card)</option>
                  </optgroup>
                  <optgroup label="Large & Cinematic" className="bg-[#0a0a0a]">
                    <option value="6x1">6x1 (Half Width Slim)</option>
                    <option value="6x2">6x2 (Half Width Row)</option>
                    <option value="6x4">6x4 (Hero Block)</option>
                    <option value="6x6">6x6 (Large Square Block)</option>
                    <option value="8x2">8x2 (Primary Focus)</option>
                    <option value="8x4">8x4 (Cinematic Focus)</option>
                    <option value="12x2">12x2 (Full Width Banner)</option>
                    <option value="12x4">12x4 (Ultra Hero)</option>
                  </optgroup>
                  <optgroup label="Advanced" className="bg-[#0a0a0a]">
                    <option value="2x4">2x4 (Slim Tall)</option>
                    <option value="custom">-- Custom Dimensions --</option>
                  </optgroup>
                </select>

                {/* Custom Input (visible if custom explicitly selected or non-preset value found) */}
                {isCustomSize && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <input 
                      type="text"
                      className="w-full bg-lume-primary/5 border border-lume-primary/20 rounded-xl p-3 text-sm text-lume-primary focus:ring-2 focus:ring-lume-primary outline-none transition-all placeholder:text-lume-primary/30 font-mono"
                      placeholder="Enter W x H (e.g., 2.5x1.5)"
                      value={formData.size} 
                      onChange={(e) => setFormData({...formData, size: e.target.value})}
                    />
                    <p className="text-[9px] text-lume-primary/40 mt-1.5 italic px-1">Using granular decimal positioning mode.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-white/5">
              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-sm text-white/60 group-hover:text-white/80 transition-colors">Hidden from public?</span>
                <div className="relative">
                  <input 
                    type="checkbox" 
                    className="sr-only" 
                    checked={formData.is_hidden}
                    onChange={(e) => setFormData({...formData, is_hidden: e.target.checked})}
                  />
                  <div className={cn(
                    "w-10 h-5 rounded-full transition-colors duration-300",
                    formData.is_hidden ? "bg-red-500/40" : "bg-white/10"
                  )} />
                  <div className={cn(
                    "absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform duration-300 shadow-lg",
                    formData.is_hidden ? "translate-x-5" : "translate-x-0"
                  )} />
                </div>
              </label>
            </div>
          </GlassCard>

          <div className="p-4 bg-lume-primary/5 border border-lume-primary/10 rounded-2xl">
             <div className="flex gap-3">
               <Settings2 className="size-4 text-lume-primary shrink-0 mt-1" />
               <p className="text-xs text-lume-primary/80 leading-relaxed">
                 Changes to category and size will instantly affect the grid layout. Content structure depends on the selected type.
               </p>
             </div>
          </div>
        </div>

        {/* Content Editor */}
        <div className="lg:col-span-2 space-y-8">
          <GlassCard className="border-white/5 bg-white/[0.01] overflow-hidden flex flex-col min-h-[400px]">
            <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest ml-2">Quick Pitch Payload (JSON)</span>
              </div>
            </div>
            
            <div className="flex-1">
              <CodeMirror 
                value={formData.content} 
                height="350px" 
                theme={vscodeDark} 
                extensions={[json()]}
                onChange={(value) => setFormData({...formData, content: value})}
              />
            </div>
          </GlassCard>

          <GlassCard className="border-white/5 bg-white/[0.01] overflow-hidden flex flex-col min-h-[400px]">
            <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest ml-2">Deep Dive Payload (JSON)</span>
              </div>
            </div>
            
            <div className="flex-1">
              <CodeMirror 
                value={formData.deep_dive} 
                height="350px" 
                theme={vscodeDark} 
                extensions={[json()]}
                onChange={(value) => setFormData({...formData, deep_dive: value})}
              />
            </div>
          </GlassCard>

          <div className="flex justify-end items-center gap-4">
            <Link 
              href="/admin/tiles"
              className="px-6 py-2.5 text-sm text-white/40 hover:text-white font-bold uppercase transition-colors"
            >
              Discard
            </Link>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="px-12 py-3 bg-lume-primary text-black font-black rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_20px_rgba(74,255,180,0.3)] shadow-lume-primary/20 uppercase tracking-tight flex items-center gap-3 disabled:opacity-50"
            >
              {isSaving ? (
                <div className="size-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              <span>{isNew ? 'Create Tile' : 'Commit Changes'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
