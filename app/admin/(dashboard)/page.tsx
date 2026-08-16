import { getTilesDb, getTilesByTypeDb } from "@/lib/db"
import { GlassCard } from "@/components/ui/GlassCard"
import { LayoutGrid, Briefcase, Settings2, Activity } from "lucide-react"

export default async function AdminDashboard() {
  const tiles = getTilesDb()
  const configTiles = getTilesByTypeDb("config")
  
  const totalTiles = tiles.filter(t => t.type !== 'config').length
  const visibleTiles = tiles.filter(t => !t.is_hidden && t.type !== 'config').length
  const totalProjects = tiles.filter(t => t.type === 'project').length
  const configCount = configTiles.length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display text-white/90">Dashboard</h1>
        <p className="text-sm text-white/50">Overview of your portfolio content.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            <div className="text-xs text-white/40 mt-1">Enterprise & Side projects</div>
          </div>
        </GlassCard>

        <GlassCard className="p-6 flex items-center gap-4">
          <div className="p-3 bg-amber-500/20 rounded-lg text-amber-400">
            <Settings2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm font-mono text-white/50 uppercase">System Config</div>
            <div className="text-2xl font-medium text-white/90">{configCount}</div>
            <div className="text-xs text-white/40 mt-1">Active global variables</div>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-8 border-l-4 border-l-lume-primary/50">
          <div className="flex items-center gap-3 mb-6">
            <Activity className="size-5 text-lume-primary" />
            <h2 className="text-lg font-display text-white/90">System Status</h2>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-white/[0.02] rounded-xl border border-white/5">
              <span className="text-sm text-white/60">Database Connection</span>
              <span className="text-xs font-mono text-lume-primary">Local SQLite (Operational)</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-white/[0.02] rounded-xl border border-white/5">
              <span className="text-sm text-white/60">Engine Mode</span>
              <span className="text-xs font-mono text-lume-primary">Embedded Node</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-white/[0.02] rounded-xl border border-white/5">
              <span className="text-sm text-white/60">Data Store Path</span>
              <span className="text-xs font-mono text-white/40">data/portfolio.db</span>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-8 border-l-4 border-l-blue-500/50">
          <div className="flex items-center gap-3 mb-6">
            <LayoutGrid className="size-5 text-blue-400" />
            <h2 className="text-lg font-display text-white/90">Bento Grid Stats</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white/[0.02] rounded-xl border border-white/5">
              <div className="text-[10px] text-white/30 uppercase font-mono mb-1">Interactive</div>
              <div className="text-xl text-white/80">92%</div>
            </div>
            <div className="p-4 bg-white/[0.02] rounded-xl border border-white/5">
              <div className="text-[10px] text-white/30 uppercase font-mono mb-1">Deep Dives</div>
              <div className="text-xl text-white/80">8</div>
            </div>
            <div className="p-4 bg-white/[0.02] rounded-xl border border-white/5">
              <div className="text-[10px] text-white/30 uppercase font-mono mb-1">Avg Load</div>
              <div className="text-xl text-white/80">142ms</div>
            </div>
            <div className="p-4 bg-white/[0.02] rounded-xl border border-white/5">
              <div className="text-[10px] text-white/30 uppercase font-mono mb-1">Transitions</div>
              <div className="text-xl text-white/80">GSAP v3</div>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
