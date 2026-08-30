"use client"

import * as React from "react"
import { getProjects, deleteProject } from "@/app/actions/projects"
import { GlassCard } from "@/components/ui/GlassCard"
import { Plus, Trash2, Settings2, Search, X, Globe, Github, Star, Layers, ExternalLink } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToastStore } from "@/store/useToastStore"
import { useConfirmStore } from "@/store/useConfirmStore"

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
  const { addToast } = useToastStore()
  const { confirm } = useConfirmStore()

  const [projects, setProjects] = React.useState<Project[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState("")

  const load = React.useCallback(async (isMounted: boolean) => {
    try {
      const data = await getProjects()
      if (isMounted) {
        setProjects(data || [])
        setIsLoading(false)
      }
    } catch (e) {
      addToast("Failed to load projects: " + (e as Error).message, "error")
      if (isMounted) setIsLoading(false)
    }
  }, [addToast])

  React.useEffect(() => {
    let isMounted = true
    load(isMounted)
    return () => { 
      isMounted = false
    }
  }, [load])

  const handleDelete = async (project: Project) => {
    const shouldDelete = await confirm({
      title: "Delete Project?",
      message: `Are you sure you want to delete project tile "${project.name}"?`,
      confirmText: "Delete Project",
      cancelText: "Cancel",
      isDestructive: true
    })

    if (shouldDelete) {
      try {
        await deleteProject(project.id)
        addToast(`Project "${project.name}" deleted`, "success")
        load(true)
      } catch (e) {
        addToast("Failed to delete: " + (e as Error).message, "error")
      }
    }
  }

  const displayedProjects = projects.filter(p => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return true
    return p.name.toLowerCase().includes(q) || 
           p.description.toLowerCase().includes(q) || 
           p.tech_stack?.some(t => t.toLowerCase().includes(q))
  })

  return (
    <div className="space-y-6 pb-36 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-display text-white">Projects Manager</h1>
            <span className="text-xs font-mono text-white/40 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/5">
              {projects.length} Total
            </span>
          </div>
          <p className="text-xs sm:text-sm text-white/50 mt-1">
            Overview and configuration for all showcase projects in the portfolio grid.
          </p>
        </div>

        <button 
          onClick={() => router.push('/admin/tiles/new')}
          aria-label="Add new project tile"
          className="flex items-center gap-2 px-5 py-2.5 bg-lume-primary text-black rounded-xl hover:bg-lume-primary/90 transition-all active:scale-95 shadow-[0_0_20px_rgba(74,255,180,0.25)] text-xs font-bold uppercase tracking-wider"
        >
          <Plus className="size-3.5" />
          <span>Add Project Tile</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between p-2 bg-white/[0.02] border border-white/5 rounded-2xl backdrop-blur-xl">
        <div className="relative w-full max-w-md">
          <Search className="size-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            id="search-projects"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects by name, description, or tech stack..."
            aria-label="Search projects by name, description, or tech stack"
            className="w-full h-[42px] bg-black/50 border border-white/10 rounded-xl pl-9 pr-8 py-2.5 text-xs text-white placeholder:text-white/25 focus:outline-none focus:border-lume-primary/60 focus:ring-1 focus:ring-lume-primary/20 transition-all font-mono"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              aria-label="Clear search query"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-white/30 hover:text-white transition-colors"
            >
              <X className="size-3" />
            </button>
          )}
        </div>
      </div>

      {/* Projects List */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="size-8 border-2 border-lume-primary/20 border-t-lume-primary rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid gap-3">
          {displayedProjects.map((project) => (
            <GlassCard 
              key={project.id} 
              className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:border-lume-primary/30 transition-all duration-300 bg-white/[0.01] border-white/5 rounded-2xl"
            >
              <div className="flex items-start sm:items-center gap-4 overflow-hidden">
                <div className="size-9 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-xs font-mono text-white/40 shrink-0 group-hover:bg-lume-primary/10 group-hover:text-lume-primary transition-colors">
                  #{project.order_val}
                </div>

                <div className="overflow-hidden space-y-1.5 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-sm font-semibold text-white/95">{project.name}</span>
                    {project.featured && (
                      <span className="text-[10px] font-mono text-lume-primary bg-lume-primary/10 px-2 py-0.5 rounded border border-lume-primary/20 uppercase tracking-wider flex items-center gap-1">
                        <Star className="size-2.5 fill-lume-primary" />
                        <span>Featured</span>
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-white/50 line-clamp-1 max-w-xl">
                    {project.description}
                  </div>

                  {project.tech_stack && project.tech_stack.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                      {project.tech_stack.map((tech) => (
                        <span 
                          key={tech}
                          className="text-[10px] font-mono text-white/40 bg-white/5 px-2 py-0.5 rounded border border-white/5"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Touch-First Action Buttons */}
              <div className="flex items-center justify-end gap-2 border-t sm:border-t-0 border-white/5 pt-2 sm:pt-0 shrink-0">
                {project.live_url && (
                  <a
                    href={project.live_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`View live demo for ${project.name}`}
                    className="p-2 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white rounded-xl transition-all border border-white/5"
                    title="Live Demo"
                  >
                    <ExternalLink className="size-3.5" />
                  </a>
                )}
                {project.github_url && (
                  <a
                    href={project.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`View source code repository for ${project.name}`}
                    className="p-2 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white rounded-xl transition-all border border-white/5"
                    title="GitHub Repo"
                  >
                    <Github className="size-3.5" />
                  </a>
                )}
                <button 
                  onClick={() => router.push(`/admin/tiles/${project.id}`)}
                  aria-label={`Edit project tile ${project.name}`}
                  className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-xl text-xs font-semibold transition-all border border-white/5"
                  title="Edit Tile Content"
                >
                  <Settings2 className="size-3.5 text-lume-primary" />
                  <span>Edit</span>
                </button>
                <button 
                  onClick={() => handleDelete(project)}
                  aria-label={`Delete project ${project.name}`}
                  className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400/70 hover:text-red-400 rounded-xl transition-all border border-red-500/20"
                  title="Delete Project"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </GlassCard>
          ))}
          
          {displayedProjects.length === 0 && (
            <div className="text-center py-20 bg-white/[0.01] rounded-3xl border border-dashed border-white/10 p-6 sm:p-8">
              <Layers className="size-8 text-white/20 mx-auto mb-2" />
              <p className="text-xs font-mono text-white/40">No project tiles found in the grid.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
