"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export interface ProjectContent {
  name: string
  description: string
  tech_stack: string[]
  github_url: string
  live_url: string
  featured: boolean
}

export interface Project extends ProjectContent {
  id: string
  order_val: number
}

export async function getProjects(): Promise<Project[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("tiles")
    .select("*")
    .eq("type", "project")
    .order("order_val", { ascending: true })
  
  if (error) throw error
  
  // Transform tile row to project-like structure for the admin UI
  return (data || []).map(tile => {
    const content = tile.content as unknown as ProjectContent
    return {
      id: tile.id,
      name: content.name || "Untitled Project",
      description: content.description || "",
      tech_stack: content.tech_stack || [],
      github_url: content.github_url || "",
      live_url: content.live_url || "",
      featured: content.featured || false,
      order_val: tile.order_val
    }
  })
}

export async function updateProject(id: string, updates: Partial<ProjectContent> & { order_val?: number }) {
  const supabase = await createClient()
  
  // Fetch existing tile to get current content
  const { data: tile } = await supabase.from("tiles").select("content").eq("id", id).single()
  if (!tile) throw new Error("Tile not found")

  const newContent = {
    ...(tile.content as object),
    ...updates
  }

  const { error } = await supabase
    .from("tiles")
    .update({ 
      content: newContent,
      order_val: updates.order_val 
    })
    .eq("id", id)
    
  if (error) throw error
  
  revalidatePath("/")
  revalidatePath("/admin/projects")
  revalidatePath("/admin/tiles")
}

export async function deleteProject(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("tiles").delete().eq("id", id)
  if (error) throw error
  revalidatePath("/")
  revalidatePath("/admin/projects")
  revalidatePath("/admin/tiles")
}

export async function createProject(project: ProjectContent & { order_val?: number }) {
  const supabase = await createClient()
  
  const content = {
    name: project.name,
    description: project.description,
    tech_stack: project.tech_stack,
    github_url: project.github_url,
    live_url: project.live_url,
    featured: project.featured
  }

  const { error } = await supabase.from("tiles").insert({
    type: "project",
    size: "4x3",
    content,
    order_val: project.order_val || 0
  })

  if (error) throw error
  
  revalidatePath("/")
  revalidatePath("/admin/projects")
  revalidatePath("/admin/tiles")
}
