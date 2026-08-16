"use client"

import * as React from "react"
import { getProjects, deleteProject } from "@/app/actions/projects"
import { GlassCard } from "@/components/ui/GlassCard"
import { Plus, Trash2, Settings2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface Project {
  id: string
  name: string
  description: string
  tech_stack: string[]
  github_url: string
  live_url: string
  featured: boolean
  order_val: number
}

export default function ProjectsAdminPage() {
  const router = useRouter()
  const [projects, setProjects] = React.useState<Project[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  const load = React.useCallback(async (isMounted: boolean) => {
    const data = await getProjects()
    if (isMounted) {
      setProjects(data || [])
      setIsLoading(false)
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

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-display text-white/90">Projects Manager</h1>
          <p className="text-sm text-white/50">High-level project content stored within bento tiles.</p>
        </div>
        <button 
          onClick={() => router.push('/admin/tiles/new')}
          className="flex items-center gap-2 px-4 py-2 bg-lume-primary/20 text-lume-primary rounded-xl hover:bg-lume-primary/30 transition-all active:scale-95 shadow-lg shadow-lume-primary/5"
        >
          <Plus className="w-4 h-4" />
          Add Project Tile
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="size-8 border-2 border-lume-primary/20 border-t-lume-primary rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid gap-4">
          {projects.map((project) => (
            <GlassCard key={project.id} className="p-4 flex items-center justify-between group hover:border-lume-primary/30 transition-all duration-500">
              <div className="flex items-center gap-6 overflow-hidden">
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-xs font-mono text-white/30 flex-shrink-0 group-hover:bg-lume-primary/10 group-hover:text-lume-primary transition-colors">
                  {project.order_val}
                </div>
                <div className="overflow-hidden">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-white/90">{project.name}</span>
                    {project.featured && (
                      <span className="text-[9px] font-mono text-lume-primary bg-lume-primary/10 px-1.5 py-0.5 rounded uppercase tracking-tighter border border-lume-primary/20">
                        Featured
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-white/40 mt-1 truncate max-w-md italic">
                    {project.description}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                <button 
                  onClick={() => router.push(`/admin/tiles/${project.id}`)}
                  className="p-2.5 bg-white/5 hover:bg-white/10 text-white/60 rounded-xl transition-all"
                  title="Edit Content"
                >
                  <Settings2 className="size-4" />
                </button>
                <button 
                  onClick={async () => {
                    if (confirm("Delete this project tile?")) {
                      await deleteProject(project.id)
                      load(true)
                    }
                  }}
                  className="p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400/60 hover:text-red-400 rounded-xl transition-all"
                  title="Delete"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </GlassCard>
          ))}
          
          {projects.length === 0 && (
            <div className="text-center py-20 bg-white/[0.02] rounded-3xl border border-dashed border-white/10">
              <p className="text-sm text-white/20 italic font-mono">No project tiles found in the grid.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
