"use client"

import * as React from "react"
import { getConfig, updateConfig, type ConfigItem as ConfigItemType } from "@/app/actions/config"
import { GlassCard } from "@/components/ui/GlassCard"
import { Save, Wand2, Copy, Check, Settings2, Sparkles, CheckCircle2, AlertCircle } from "lucide-react"
import { useToastStore } from "@/store/useToastStore"
import CodeMirror from '@uiw/react-codemirror'
import { json } from '@codemirror/lang-json'
import { vscodeDark } from '@uiw/codemirror-theme-vscode'

export default function ConfigPage() {
  const { addToast } = useToastStore()
  const [config, setConfig] = React.useState<ConfigItemType[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    let isMounted = true
    async function load() {
      try {
        const data = await getConfig()
        if (isMounted) {
          setConfig(data || [])
          setIsLoading(false)
        }
      } catch (e) {
        addToast("Failed to load config: " + (e as Error).message, "error")
        if (isMounted) setIsLoading(false)
      }
    }
    load()
    return () => { isMounted = false }
  }, [addToast])

  const handleSave = async (key: string, value: string) => {
    try {
      const parsed = JSON.parse(value)
      await updateConfig(key, parsed)
      const data = await getConfig()
      setConfig(data || [])
      addToast(`Configuration for "${key}" saved successfully`, "success")
    } catch {
      addToast(`Invalid JSON format in "${key}"`, "error")
    }
  }

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-display text-white">Global Site Configuration</h1>
          <span className="text-xs font-mono text-white/40 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/5">
            {config.length} Keys
          </span>
        </div>
        <p className="text-xs sm:text-sm text-white/50 mt-1">
          Fine-tune global theme palettes, identity meta, and application-wide settings.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="size-8 border-2 border-lume-primary/20 border-t-lume-primary rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid gap-6">
          {config.map((item) => (
            <ConfigItemCard key={item.key} item={item} onSave={handleSave} />
          ))}
        </div>
      )}
    </div>
  )
}

function ConfigItemCard({ 
  item, 
  onSave 
}: { 
  item: ConfigItemType; 
  onSave: (key: string, value: string) => Promise<void> 
}) {
  const { addToast } = useToastStore()
  const [value, setValue] = React.useState(JSON.stringify(item.value, null, 2))
  const [isSaving, setIsSaving] = React.useState(false)
  const [hasCopied, setHasCopied] = React.useState(false)

  const isValidJson = React.useMemo(() => {
    try {
      JSON.parse(value)
      return true
    } catch {
      return false
    }
  }, [value])

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(value)
      setValue(JSON.stringify(parsed, null, 2))
      addToast("JSON formatted cleanly", "success")
    } catch {
      addToast("Cannot format invalid JSON", "error")
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setHasCopied(true)
      addToast("Copied config payload to clipboard", "info")
      setTimeout(() => setHasCopied(false), 2000)
    } catch {
      addToast("Failed to copy", "error")
    }
  }

  const handleSaveClick = async () => {
    setIsSaving(true)
    await onSave(item.key, value)
    setIsSaving(false)
  }

  return (
    <GlassCard className="p-5 sm:p-6 space-y-4 bg-white/[0.01]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3.5">
        <div className="flex items-center gap-2.5">
          <Settings2 className="size-4 text-lume-primary" />
          <div>
            <span className="text-sm font-mono font-bold text-white uppercase tracking-wider">
              {item.key}
            </span>
          </div>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border flex items-center gap-1 ${
            isValidJson 
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
              : "bg-red-500/10 text-red-400 border-red-500/20"
          }`}>
            {isValidJson ? <CheckCircle2 className="size-2.5" /> : <AlertCircle className="size-2.5" />}
            <span>{isValidJson ? "Valid JSON" : "Syntax Error"}</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-xl text-xs font-mono transition-all border border-white/5"
            title="Copy JSON"
          >
            {hasCopied ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
            <span className="hidden sm:inline">Copy</span>
          </button>

          <button
            type="button"
            onClick={handleFormat}
            className="flex items-center gap-1 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-xl text-xs font-mono transition-all border border-white/5"
            title="Format / Beautify"
          >
            <Wand2 className="size-3 text-blue-400" />
            <span className="hidden sm:inline">Beautify</span>
          </button>

          <button 
            type="button"
            disabled={isSaving || !isValidJson}
            onClick={handleSaveClick}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-lume-primary text-black rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50 uppercase tracking-wider"
          >
            <Save className="size-3.5" />
            <span>{isSaving ? "Saving..." : "Save"}</span>
          </button>
        </div>
      </div>

      {/* CodeMirror JSON Editor */}
      <div className="border border-white/10 rounded-2xl overflow-hidden bg-black/60">
        <CodeMirror 
          value={value} 
          height="180px" 
          theme={vscodeDark} 
          extensions={[json()]}
          onChange={(val) => setValue(val)}
        />
      </div>
    </GlassCard>
  )
}
