"use client"

import * as React from "react"
import { getProjects, updateProject } from "@/app/actions/projects"
import { GlassCard } from "@/components/ui/GlassCard"
import { Plus, Edit2, Save, X } from "lucide-react"
import { Database } from "@/types/supabase"

type ProjectRowType = Database['public']['Tables']['projects']['Row']

export default function ProjectsAdminPage() {
  const [projects, setProjects] = React.useState<ProjectRowType[]>([])
  const [editingId, setEditingId] = React.useState<string | null>(null)

  React.useEffect(() => {
    let isMounted = true
    async function load() {
      const data = await getProjects()
      if (isMounted) setProjects(data || [])
    }
    load()
    return () => { isMounted = false }
  }, [])

  const handleSave = async (id: string, updates: Partial<ProjectRowType>) => {
    try {
      await updateProject(id, updates)
      setEditingId(null)
      const data = await getProjects()
      setProjects(data || [])
    } catch {
      alert("Failed to save")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-display text-white/90">Projects Manager</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-lume-primary/20 text-lume-primary rounded-lg hover:bg-lume-primary/30 transition-colors">
          <Plus className="w-4 h-4" />
          Add Project
        </button>
      </div>

      <div className="grid gap-4">
        {projects.map((project) => (
          <ProjectRow 
            key={project.id} 
            project={project} 
            isEditing={editingId === project.id}
            onEdit={() => setEditingId(project.id)}
            onCancel={() => setEditingId(null)}
            onSave={(updates: Partial<ProjectRowType>) => handleSave(project.id, updates)}
          />
        ))}
      </div>
    </div>
  )
}

function ProjectRow({ 
  project, 
  isEditing, 
  onEdit, 
  onCancel, 
  onSave 
}: { 
  project: ProjectRowType; 
  isEditing: boolean; 
  onEdit: () => void; 
  onCancel: () => void; 
  onSave: (updates: Partial<ProjectRowType>) => void 
}) {
  const [formData, setFormData] = React.useState({
    name: project.name,
    description: project.description || "",
    tech_stack: project.tech_stack.join(", "),
    github_url: project.github_url || "",
    live_url: project.live_url || "",
    featured: project.featured,
    order_val: project.order_val
  })

  if (isEditing) {
    return (
      <GlassCard className="p-6 space-y-4 border-lume-primary/30">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-white/30 uppercase">Name</label>
            <input 
              className="w-full bg-white/5 border border-white/10 rounded p-2 text-sm text-white"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
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
          <label className="text-[10px] font-mono text-white/30 uppercase">Description</label>
          <textarea 
            className="w-full bg-white/5 border border-white/10 rounded p-2 text-sm text-white"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-mono text-white/30 uppercase">Tech Stack (comma separated)</label>
          <input 
            className="w-full bg-white/5 border border-white/10 rounded p-2 text-sm text-white"
            value={formData.tech_stack}
            onChange={(e) => setFormData({...formData, tech_stack: e.target.value})}
          />
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="px-3 py-1.5 text-xs text-white/40 hover:text-white transition-colors flex items-center gap-1">
            <X className="w-3 h-3" /> Cancel
          </button>
          <button 
            onClick={() => onSave({ 
              ...formData, 
              tech_stack: formData.tech_stack.split(",").map((s: string) => s.trim()) 
            })}
            className="px-4 py-1.5 text-xs bg-lume-primary/20 text-lume-primary rounded hover:bg-lume-primary/30 transition-colors flex items-center gap-1"
          >
            <Save className="w-3 h-3" /> Save Project
          </button>
        </div>
      </GlassCard>
    )
  }

  return (
    <GlassCard className="p-4 flex items-center justify-between group">
      <div className="flex items-center gap-6">
        <div className="w-8 h-8 bg-white/5 rounded flex items-center justify-center text-xs font-mono text-white/30">
          {project.order_val}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-white/90">{project.name}</span>
            {project.featured && <span className="text-[8px] font-mono text-lume-primary border border-lume-primary/30 px-1 rounded uppercase">Featured</span>}
          </div>
          <div className="text-[10px] text-white/40 mt-1">
            {project.description}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={onEdit} className="p-2 text-white/40 hover:text-white transition-colors">
          <Edit2 className="w-4 h-4" />
        </button>
      </div>
    </GlassCard>
  )
}
