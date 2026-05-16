"use client"

import * as React from "react"
import { getConfig, updateConfig } from "@/app/actions/config"
import { GlassCard } from "@/components/ui/GlassCard"
import { Save } from "lucide-react"
import { Database } from "@/types/supabase"

type ConfigItemRow = Database['public']['Tables']['site_config']['Row']

export default function ConfigPage() {
  const [config, setConfig] = React.useState<ConfigItemRow[]>([])

  React.useEffect(() => {
    let isMounted = true
    async function load() {
      const data = await getConfig()
      if (isMounted) setConfig(data || [])
    }
    load()
    return () => { isMounted = false }
  }, [])

  const handleSave = async (key: string, value: string) => {
    try {
      await updateConfig(key, JSON.parse(value))
      const data = await getConfig()
      setConfig(data || [])
      alert("Config updated")
    } catch {
      alert("Invalid JSON")
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display text-white/90">Site Configuration</h1>
      
      <div className="grid gap-6">
        {config.map((item) => (
          <ConfigItem key={item.key} item={item} onSave={handleSave} />
        ))}
      </div>
    </div>
  )
}

function ConfigItem({ item, onSave }: { item: ConfigItemRow; onSave: (key: string, value: string) => void }) {
  const [value, setValue] = React.useState(JSON.stringify(item.value, null, 2))

  return (
    <GlassCard className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <label className="text-sm font-mono text-lume-primary uppercase tracking-widest">{item.key}</label>
        <button 
          onClick={() => onSave(item.key, value)}
          className="flex items-center gap-2 px-3 py-1.5 bg-lume-primary/20 text-lume-primary rounded hover:bg-lume-primary/30 transition-colors text-xs"
        >
          <Save className="w-3 h-3" /> Save
        </button>
      </div>
      <textarea 
        rows={4}
        className="w-full bg-white/5 border border-white/10 rounded p-3 text-xs font-mono text-white/70 focus:border-lume-primary outline-none transition-colors"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </GlassCard>
  )
}
