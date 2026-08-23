"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { getTiles, updateTile, deleteTile, createTile } from "@/app/actions/tiles"
import { GlassCard } from "@/components/ui/GlassCard"
import { 
  Save, 
  Trash2, 
  ArrowLeft, 
  Type, 
  Maximize, 
  Settings2, 
  Code, 
  SlidersHorizontal, 
  Sparkles, 
  Eye, 
  Layers,
  Wand2
} from "lucide-react"
import CodeMirror from '@uiw/react-codemirror'
import { json } from '@codemirror/lang-json'
import { vscodeDark } from '@uiw/codemirror-theme-vscode'
import { Database, Json } from "@/types/supabase"
import Link from "next/link"
import { cn, getSizeClasses } from "@/lib/utils"
import { TileTypeForm } from "@/components/admin/form/TileTypeForm"
import { TileRenderer } from "@/components/bento/TileRenderer"
import { useToastStore } from "@/store/useToastStore"
import { useConfirmStore } from "@/store/useConfirmStore"

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
  "6x6": "Large Square Block",
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
  
  const { addToast } = useToastStore()
  const { confirm } = useConfirmStore()

  const [isLoading, setIsLoading] = React.useState(!isNew)
  const [isSaving, setIsSaving] = React.useState(false)

  const [isCustomSize, setIsCustomSize] = React.useState(false)
  const [editorTab, setEditorTab] = React.useState<'form' | 'json'>('form')
  const [mobileViewTab, setMobileViewTab] = React.useState<'editor' | 'preview'>('editor')
  const [previewMode, setPreviewMode] = React.useState<'quick' | 'deep'>('quick')

  const [formData, setFormData] = React.useState({
    type: 'project',
    size: '4x3',
    content: '{}',
    deep_dive: '{}',
    is_hidden: false
  })

  // Parsed object state for visual forms
  const parsedContent = React.useMemo(() => {
    try {
      return JSON.parse(formData.content || '{}')
    } catch {
      return {}
    }
  }, [formData.content])

  const parsedDeepDive = React.useMemo(() => {
    try {
      return JSON.parse(formData.deep_dive || '{}')
    } catch {
      return {}
    }
  }, [formData.deep_dive])

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
        } else {
          addToast("Tile not found", "error")
        }
        setIsLoading(false)
      })
    }
  }, [id, isNew, addToast])

  const handleUpdateParsedContent = (newContent: Record<string, any>) => {
    setFormData(prev => ({
      ...prev,
      content: JSON.stringify(newContent, null, 2)
    }))
  }

  const handleUpdateParsedDeepDive = (newDeepDive: Record<string, any>) => {
    setFormData(prev => ({
      ...prev,
      deep_dive: JSON.stringify(newDeepDive, null, 2)
    }))
  }

  const handleFormatJson = () => {
    try {
      const c = JSON.parse(formData.content || '{}')
      const d = JSON.parse(formData.deep_dive || '{}')
      setFormData(prev => ({
        ...prev,
        content: JSON.stringify(c, null, 2),
        deep_dive: JSON.stringify(d, null, 2)
      }))
      addToast("JSON formatted cleanly", "success")
    } catch (e) {
      addToast("Failed to format: Check JSON syntax", "error")
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      let parsedC: Json
      let parsedD: Json

      try {
        parsedC = JSON.parse(formData.content) as Json
      } catch {
        addToast("Quick Pitch JSON syntax is invalid", "error")
        setIsSaving(false)
        return
      }

      try {
        parsedD = JSON.parse(formData.deep_dive) as Json
      } catch {
        addToast("Deep Dive JSON syntax is invalid", "error")
        setIsSaving(false)
        return
      }

      const payload = {
        type: formData.type,
        size: formData.size,
        content: parsedC,
        deep_dive: parsedD,
        is_hidden: formData.is_hidden
      }

      if (isNew) {
        await createTile(payload as TileInsert)
        addToast("New tile created successfully", "success")
      } else {
        await updateTile(id as string, payload as Partial<TileRowType>)
        addToast("Tile updated successfully", "success")
      }

      router.push('/admin/tiles')
      router.refresh()
    } catch (e) {
      addToast("Failed to save tile: " + (e as Error).message, "error")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    const shouldDelete = await confirm({
      title: "Delete Tile?",
      message: `Are you sure you want to permanently delete tile "${id}"? This action cannot be undone.`,
      confirmText: "Delete Tile",
      cancelText: "Cancel",
      isDestructive: true
    })

    if (shouldDelete) {
      try {
        await deleteTile(id as string)
        addToast("Tile deleted successfully", "success")
        router.push('/admin/tiles')
        router.refresh()
      } catch (e) {
        addToast("Failed to delete: " + (e as Error).message, "error")
      }
    }
  }

  // Mock tile representation for live preview
  const livePreviewTile: TileRowType = {
    id: (id as string) || "preview-tile",
    type: formData.type,
    size: formData.size,
    col_start: null,
    row_start: null,
    order_val: 1,
    order_val_mobile: 1,
    is_hidden: formData.is_hidden,
    is_active: true,
    content: parsedContent,
    deep_dive: parsedDeepDive,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-8 h-8 border-2 border-lume-primary/30 border-t-lume-primary rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <Link 
            href="/admin/tiles"
            className="p-2.5 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white rounded-xl transition-all"
            title="Back to Tiles"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-display text-white">
                {isNew ? 'Create New Tile' : `Edit Tile`}
              </h1>
              <span className="text-[11px] font-mono text-lume-primary bg-lume-primary/10 px-2.5 py-0.5 rounded-full border border-lume-primary/20 uppercase">
                {formData.type}
              </span>
            </div>
            <p className="text-xs text-white/40 font-mono mt-0.5 truncate max-w-sm sm:max-w-md">
              {isNew ? 'Configure attributes and place on grid' : `ID: ${id}`}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {!isNew && (
            <button 
              onClick={handleDelete}
              className="flex items-center gap-2 px-3.5 py-2 text-red-400/80 hover:text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-all text-xs font-semibold"
            >
              <Trash2 className="size-3.5" />
              <span>Delete</span>
            </button>
          )}

          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 bg-lume-primary text-black text-xs font-bold rounded-xl hover:bg-lume-primary/90 transition-all shadow-[0_0_20px_rgba(74,255,180,0.25)] active:scale-95 disabled:opacity-50 uppercase tracking-wider"
          >
            {isSaving ? (
              <div className="size-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
              <Save className="size-3.5" />
            )}
            <span>{isNew ? 'Create Tile' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Mobile-Only Tabs (Editor vs Live Preview) */}
      <div className="flex lg:hidden p-1 bg-white/[0.03] border border-white/10 rounded-2xl">
        <button
          type="button"
          onClick={() => setMobileViewTab('editor')}
          className={cn(
            "flex-1 py-2 text-xs font-mono font-medium rounded-xl transition-all text-center",
            mobileViewTab === 'editor'
              ? "bg-white/10 text-white shadow-sm font-bold"
              : "text-white/40 hover:text-white"
          )}
        >
          Tile Configuration
        </button>
        <button
          type="button"
          onClick={() => setMobileViewTab('preview')}
          className={cn(
            "flex-1 py-2 text-xs font-mono font-medium rounded-xl transition-all text-center flex items-center justify-center gap-1.5",
            mobileViewTab === 'preview'
              ? "bg-white/10 text-white shadow-sm font-bold"
              : "text-white/40 hover:text-white"
          )}
        >
          <Eye className="size-3.5 text-lume-primary" />
          <span>Live Preview</span>
        </button>
      </div>

      {/* Main Content: Split Grid on Desktop, Tabs on Mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Form & Meta Configuration */}
        <div className={cn(
          "lg:col-span-7 space-y-6",
          mobileViewTab === 'preview' && "hidden lg:block"
        )}>
          
          {/* Metadata Card (Category, Dimensions, Hidden Toggle) */}
          <GlassCard className="p-5 sm:p-6 space-y-5 bg-white/[0.01]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Category Selector */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[10px] font-mono text-white/40 uppercase tracking-widest">
                  <Type className="size-3 text-lume-primary" />
                  <span>Tile Category</span>
                </div>
                <select 
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:ring-2 focus:ring-lume-primary/50 outline-none transition-all cursor-pointer font-mono"
                  value={formData.type} 
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                >
                  {['hero', 'project', 'experience', 'education', 'terminal', 'stat', 'skill', 'award', 'contact', '3d', 'easter_egg'].map(t => (
                    <option key={t} value={t} className="bg-[#0f0f0f]">{t.replace('_', ' ').toUpperCase()}</option>
                  ))}
                </select>
              </div>

              {/* Grid Size Dimensions */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[10px] font-mono text-white/40 uppercase tracking-widest">
                  <Maximize className="size-3 text-blue-400" />
                  <span>Grid Dimensions</span>
                </div>
                <select 
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:ring-2 focus:ring-lume-primary/50 outline-none transition-all cursor-pointer font-mono"
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
                  <optgroup label="Standard" className="bg-[#0a0a0a]">
                    <option value="1x1">1x1 (Small Square)</option>
                    <option value="2x1">2x1 (Small Wide)</option>
                    <option value="2x2">2x2 (Standard Square)</option>
                    <option value="3x2">3x2 (Card)</option>
                    <option value="3x3">3x3 (Balanced Square)</option>
                    <option value="4x2">4x2 (Primary Row)</option>
                    <option value="4x3">4x3 (Deep Card)</option>
                    <option value="4x4">4x4 (Large Square)</option>
                    <option value="4x5">4x5 (Portrait Hero)</option>
                  </optgroup>
                  <optgroup label="Large / Cinematic" className="bg-[#0a0a0a]">
                    <option value="6x2">6x2 (Half Width Row)</option>
                    <option value="6x4">6x4 (Hero Block)</option>
                    <option value="6x6">6x6 (Large Square Block)</option>
                    <option value="8x4">8x4 (Cinematic Focus)</option>
                    <option value="12x2">12x2 (Full Width Banner)</option>
                    <option value="12x4">12x4 (Ultra Hero)</option>
                    <option value="custom">-- Custom Size --</option>
                  </optgroup>
                </select>
              </div>
            </div>

            {/* Custom Size Input if selected */}
            {isCustomSize && (
              <div className="pt-2 animate-in fade-in duration-200">
                <label className="block text-[10px] font-mono text-white/50 uppercase tracking-widest mb-1.5">
                  Custom Dimension String (Columns x Rows)
                </label>
                <input 
                  type="text"
                  className="w-full bg-black/50 border border-lume-primary/30 rounded-xl p-2.5 text-xs text-lume-primary focus:ring-1 focus:ring-lume-primary outline-none font-mono"
                  placeholder="e.g. 4x3"
                  value={formData.size} 
                  onChange={(e) => setFormData({...formData, size: e.target.value})}
                />
              </div>
            )}

            {/* Hidden from public toggle */}
            <div className="pt-3 border-t border-white/5 flex items-center justify-between">
              <div>
                <span className="text-xs text-white/80 font-medium">Public Grid Visibility</span>
                <p className="text-[11px] text-white/40 mt-0.5">Toggle whether this tile appears to public portfolio visitors.</p>
              </div>
              <button
                type="button"
                onClick={() => setFormData({...formData, is_hidden: !formData.is_hidden})}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-mono transition-all border font-semibold",
                  formData.is_hidden 
                    ? "bg-red-500/10 text-red-400 border-red-500/20" 
                    : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                )}
              >
                {formData.is_hidden ? "Hidden" : "Visible"}
              </button>
            </div>
          </GlassCard>

          {/* Content Editor Card with Form vs JSON Switcher */}
          <GlassCard className="p-5 sm:p-6 space-y-5 bg-white/[0.01]">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-widest text-white/40">
                  Content Configuration
                </span>
              </div>

              {/* Form vs Raw JSON Switch */}
              <div className="flex items-center gap-2">
                <div className="flex p-0.5 bg-black/50 border border-white/10 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setEditorTab('form')}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-lg transition-all",
                      editorTab === 'form'
                        ? "bg-white/10 text-white font-semibold"
                        : "text-white/40 hover:text-white"
                    )}
                  >
                    <SlidersHorizontal className="size-3.5" />
                    <span>Visual Form</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorTab('json')}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-lg transition-all",
                      editorTab === 'json'
                        ? "bg-white/10 text-white font-semibold"
                        : "text-white/40 hover:text-white"
                    )}
                  >
                    <Code className="size-3.5" />
                    <span>Raw JSON</span>
                  </button>
                </div>

                {editorTab === 'json' && (
                  <button
                    type="button"
                    onClick={handleFormatJson}
                    className="p-1.5 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-xl border border-white/10 transition-colors"
                    title="Format / Beautify JSON"
                  >
                    <Wand2 className="size-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Mode 1: Visual Form */}
            {editorTab === 'form' ? (
              <TileTypeForm
                type={formData.type}
                content={parsedContent}
                deepDive={parsedDeepDive}
                onChangeContent={handleUpdateParsedContent}
                onChangeDeepDive={handleUpdateParsedDeepDive}
              />
            ) : (
              /* Mode 2: Raw CodeMirror JSON Editor */
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">
                      Quick Pitch JSON Payload
                    </span>
                  </div>
                  <div className="border border-white/10 rounded-2xl overflow-hidden bg-black/60">
                    <CodeMirror 
                      value={formData.content} 
                      height="240px" 
                      theme={vscodeDark} 
                      extensions={[json()]}
                      onChange={(value) => setFormData({...formData, content: value})}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">
                      Deep Dive JSON Payload
                    </span>
                  </div>
                  <div className="border border-white/10 rounded-2xl overflow-hidden bg-black/60">
                    <CodeMirror 
                      value={formData.deep_dive} 
                      height="240px" 
                      theme={vscodeDark} 
                      extensions={[json()]}
                      onChange={(value) => setFormData({...formData, deep_dive: value})}
                    />
                  </div>
                </div>
              </div>
            )}
          </GlassCard>
        </div>

        {/* Right Column: Live Interactive Tile Preview */}
        <div className={cn(
          "lg:col-span-5 space-y-4",
          mobileViewTab === 'editor' && "hidden lg:block"
        )}>
          <div className="sticky top-24 space-y-4">
            <GlassCard className="p-5 space-y-4 bg-white/[0.01] border-white/10 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <Eye className="size-4 text-lume-primary" />
                  <h2 className="text-xs font-mono uppercase tracking-widest text-white/90">
                    Live Tile Render
                  </h2>
                </div>

                {/* Quick Pitch vs Deep Dive Toggle */}
                <div className="flex p-0.5 bg-black/50 border border-white/10 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setPreviewMode('quick')}
                    className={cn(
                      "px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider rounded-lg transition-all",
                      previewMode === 'quick'
                        ? "bg-lume-primary/20 text-lume-primary font-bold border border-lume-primary/30"
                        : "text-white/40 hover:text-white"
                    )}
                  >
                    Quick Pitch
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode('deep')}
                    className={cn(
                      "px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider rounded-lg transition-all",
                      previewMode === 'deep'
                        ? "bg-lume-primary/20 text-lume-primary font-bold border border-lume-primary/30"
                        : "text-white/40 hover:text-white"
                    )}
                  >
                    Deep Dive
                  </button>
                </div>
              </div>

              {/* Rendered Tile Box */}
              <div className="p-4 sm:p-6 bg-black/60 border border-white/5 rounded-2xl flex items-center justify-center min-h-[300px] overflow-hidden">
                <div className={cn(
                  "w-full transition-all duration-300",
                  getSizeClasses(formData.size, false, false)
                )}>
                  <TileRenderer 
                    tile={livePreviewTile} 
                    isDragging={false} 
                  />
                </div>
              </div>

              <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-between text-[11px] font-mono text-white/40">
                <span>Scale: 100% (Real Dimensions)</span>
                <span className="text-lume-primary">{formData.size}</span>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  )
}
