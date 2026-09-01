import * as React from "react"
import Link from "next/link"
import { getTilesDb, getDetailedItemsDb, getTilesByTypeDb } from "@/lib/db"
import { GlassCard } from "@/components/ui/GlassCard"
import { 
  LayoutGrid, 
  Briefcase, 
  Settings2, 
  Activity, 
  Plus, 
  ListTree, 
  ShieldCheck, 
  Globe, 
  ArrowRight,
  Database,
  CheckCircle2,
  Sparkles,
  Layers,
  Edit3
} from "lucide-react"

export default async function AdminDashboard() {
  const tiles = getTilesDb()
  const detailedItems = getDetailedItemsDb()
  const configTiles = getTilesByTypeDb("config")
  
  const contentTiles = tiles.filter(t => t.type !== "config")
  const totalTiles = contentTiles.length
  const visibleTiles = contentTiles.filter(t => !t.is_hidden).length
  const hiddenTiles = contentTiles.filter(t => t.is_hidden).length
  
  const totalProjects = contentTiles.filter(t => t.type === "project").length
  const totalExperience = detailedItems.filter(t => t.type === "experience").length
  const totalEducation = detailedItems.filter(t => t.type === "education").length
  const configCount = configTiles.length

  const quickActions = [
    {
      title: "Add Bento Tile",
      desc: "Create and place a new tile on the grid",
      href: "/admin/tiles/new",
      icon: Plus,
      color: "text-lume-primary bg-lume-primary/10 border-lume-primary/20",
    },
    {
      title: "Add Detailed Item",
      desc: "Insert new resume, project or custom entry",
      href: "/admin/detailed-items/new",
      icon: ListTree,
      color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    },
    {
      title: "Site Configuration",
      desc: "Modify global themes, links & metadata",
      href: "/admin/config",
      icon: Settings2,
      color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    },
    {
      title: "Manage Admins",
      desc: "Configure security & admin credentials",
      href: "/admin/users",
      icon: ShieldCheck,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 bg-gradient-to-r from-lume-primary/[0.04] via-transparent to-blue-500/[0.04] border border-white/5 rounded-3xl backdrop-blur-xl">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-widest text-lume-primary bg-lume-primary/10 border border-lume-primary/20 rounded-full">
              System Command Center
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display text-white tracking-tight">
            Portfolio Management Hub
          </h1>
          <p className="text-xs sm:text-sm text-white/50 max-w-xl">
            Real-time control over Bento Grid layouts, resume experiences, and system configuration.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/admin/tiles"
            className="flex items-center gap-2 px-5 py-2.5 bg-lume-primary text-black text-xs font-bold rounded-xl hover:bg-lume-primary/90 transition-all shadow-[0_0_20px_rgba(74,255,180,0.2)] active:scale-95 uppercase tracking-wider"
          >
            <LayoutGrid className="size-3.5" />
            <span>Open Orchestrator</span>
          </Link>
        </div>
      </div>

      {/* Quick Actions Hub */}
      <div>
        <div className="flex items-center justify-between mb-4 px-1">
          <h2 className="text-xs font-mono uppercase tracking-widest text-white/40 flex items-center gap-2">
            <Sparkles className="size-3 text-lume-primary" />
            <span>Quick Actions</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              href={action.href}
              className="group p-5 sm:p-6 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-white/15 rounded-2xl transition-all duration-300 flex flex-col justify-between space-y-5"
            >
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-xl border ${action.color}`}>
                  <action.icon className="size-4" />
                </div>
                <ArrowRight className="size-4 text-white/20 group-hover:text-white/80 group-hover:translate-x-1 transition-all" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-sm font-semibold text-white/90 group-hover:text-white transition-colors">
                  {action.title}
                </h3>
                <p className="text-xs text-white/40 leading-relaxed line-clamp-2">
                  {action.desc}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div>
        <div className="flex items-center justify-between mb-4 px-1">
          <h2 className="text-xs font-mono uppercase tracking-widest text-white/40">
            Content Breakdown
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <GlassCard className="p-5 sm:p-6 flex flex-col justify-between bg-white/[0.01] hover:bg-white/[0.03] transition-all">
            <div className="text-lume-primary mb-4">
              <LayoutGrid className="size-6" />
            </div>
            <div className="space-y-1">
              <div className="text-[10px] font-mono text-white/40 uppercase tracking-widest truncate">Bento Tiles</div>
              <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{totalTiles}</div>
              <div className="text-[11px] text-white/40 truncate">
                <span className="text-lume-primary font-medium">{visibleTiles}</span> active • {hiddenTiles} hidden
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-5 sm:p-6 flex flex-col justify-between bg-white/[0.01] hover:bg-white/[0.03] transition-all">
            <div className="text-blue-400 mb-4">
              <Briefcase className="size-6" />
            </div>
            <div className="space-y-1">
              <div className="text-[10px] font-mono text-white/40 uppercase tracking-widest truncate">Projects</div>
              <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{totalProjects}</div>
              <div className="text-[11px] text-white/40 truncate">
                Interactive showcases
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-5 sm:p-6 flex flex-col justify-between bg-white/[0.01] hover:bg-white/[0.03] transition-all">
            <div className="text-purple-400 mb-4">
              <ListTree className="size-6" />
            </div>
            <div className="space-y-1">
              <div className="text-[10px] font-mono text-white/40 uppercase tracking-widest truncate">Detailed Items</div>
              <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{detailedItems.length}</div>
              <div className="text-[11px] text-white/40 truncate">
                {totalExperience} exp • {totalEducation} edu
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-5 sm:p-6 flex flex-col justify-between bg-white/[0.01] hover:bg-white/[0.03] transition-all">
            <div className="text-amber-400 mb-4">
              <Settings2 className="size-6" />
            </div>
            <div className="space-y-1">
              <div className="text-[10px] font-mono text-white/40 uppercase tracking-widest truncate">Config Registry</div>
              <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{configCount}</div>
              <div className="text-[11px] text-white/40 truncate">
                Global variables
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* System Infrastructure & Active Tiles Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Status Card */}
        <GlassCard className="p-6 border-white/5 space-y-6 lg:col-span-1">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div className="flex items-center gap-2.5">
              <Activity className="size-4 text-lume-primary" />
              <h2 className="text-sm font-semibold text-white/90">Infrastructure</h2>
            </div>
            <span className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-ping" />
              Healthy
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="flex justify-between items-center p-3 bg-white/[0.02] rounded-xl border border-white/5">
              <span className="text-white/50 text-[11px]">Database Engine</span>
              <span className="text-lume-primary text-[11px]">SQLite (WAL Mode)</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/[0.02] rounded-xl border border-white/5">
              <span className="text-white/50 text-[11px]">App Framework</span>
              <span className="text-white/90 text-[11px]">Next.js 16 App Router</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/[0.02] rounded-xl border border-white/5">
              <span className="text-white/50 text-[11px]">Animation Core</span>
              <span className="text-white/90 text-[11px]">GSAP 3.12+ / R3F</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/[0.02] rounded-xl border border-white/5">
              <span className="text-white/50 text-[11px]">Data Store Location</span>
              <span className="text-white/40 text-[11px] truncate max-w-[140px]">data/portfolio.db</span>
            </div>
          </div>
        </GlassCard>

        {/* Active Tiles Snapshot */}
        <GlassCard className="p-6 border-white/5 space-y-6 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div className="flex items-center gap-2.5">
              <Layers className="size-4 text-blue-400" />
              <h2 className="text-sm font-semibold text-white/90">Bento Grid Active Stream</h2>
            </div>
            <Link
              href="/admin/tiles"
              className="text-xs font-mono text-lume-primary hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="size-3" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {contentTiles.slice(0, 5).map((tile, idx) => (
              <div
                key={tile.id}
                className="flex items-center justify-between p-3 bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 rounded-xl transition-all group"
              >
                <div className="flex items-center gap-3.5 overflow-hidden">
                  <div className="size-7 rounded-lg bg-white/5 flex items-center justify-center text-[10px] font-mono text-white/40 shrink-0">
                    #{idx + 1}
                  </div>
                  <div className="overflow-hidden">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-white/90 uppercase tracking-wider">
                        {tile.type}
                      </span>
                      <span className="text-[10px] font-mono text-white/30 bg-white/5 px-1.5 py-0.2 rounded border border-white/5">
                        {tile.size}
                      </span>
                      {tile.is_hidden && (
                        <span className="text-[9px] font-mono text-red-400/80 bg-red-500/10 px-1.5 py-0.2 rounded border border-red-500/20">
                          Hidden
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-white/40 truncate mt-0.5 font-mono max-w-sm">
                      {tile.id}
                    </div>
                  </div>
                </div>

                <Link
                  href={`/admin/tiles/${tile.id}`}
                  className="p-2 text-white/40 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all shrink-0"
                  title="Edit Tile"
                >
                  <Edit3 className="size-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
