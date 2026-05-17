import { createClient } from "@/lib/supabase/server"
import { GlassCard } from "@/components/ui/GlassCard"
import { LayoutGrid, Briefcase } from "lucide-react"

export default async function AdminDashboard() {
  const supabase = await createClient()
  
  const { data: tiles } = await supabase.from("tiles").select("id, type, is_hidden")

  const totalTiles = tiles?.filter(t => t.type !== 'config').length || 0
  const visibleTiles = tiles?.filter(t => !t.is_hidden && t.type !== 'config').length || 0
  const totalProjects = tiles?.filter(t => t.type === 'project').length || 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display text-white/90">Dashboard</h1>
        <p className="text-sm text-white/50">Overview of your portfolio content.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="p-6 flex items-center gap-4">
          <div className="p-3 bg-lume-primary/20 rounded-lg text-lume-primary">
            <LayoutGrid className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm font-mono text-white/50 uppercase">Total Tiles</div>
            <div className="text-2xl font-medium text-white/90">{totalTiles}</div>
            <div className="text-xs text-white/40 mt-1">{visibleTiles} currently visible</div>
          </div>
        </GlassCard>

        <GlassCard className="p-6 flex items-center gap-4">
          <div className="p-3 bg-blue-500/20 rounded-lg text-blue-400">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm font-mono text-white/50 uppercase">Total Projects</div>
            <div className="text-2xl font-medium text-white/90">{totalProjects}</div>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
