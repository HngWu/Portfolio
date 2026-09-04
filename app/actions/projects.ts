"use server"

import { revalidatePath } from "next/cache"
import { getTilesByType, getTileById, updateTile, deleteTile, createTile } from "@/lib/db"

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
  const tiles = await getTilesByType("project")
  
  return tiles.map(tile => {
    const content = (tile.content || {}) as unknown as ProjectContent
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
  const tile = await getTileById(id)
  if (!tile) throw new Error("Tile not found")

  const newContent = {
    ...(tile.content as object),
    ...updates
  }

  await updateTile(id, {
    content: newContent as any,
    order_val: updates.order_val !== undefined ? updates.order_val : tile.order_val
  })
    
  revalidatePath("/")
  revalidatePath("/admin/projects")
  revalidatePath("/admin/tiles")
}

export async function deleteProject(id: string) {
  await deleteTile(id)
  revalidatePath("/")
  revalidatePath("/admin/projects")
  revalidatePath("/admin/tiles")
}

export async function createProject(project: ProjectContent & { order_val?: number }) {
  const content = {
    name: project.name,
    description: project.description,
    tech_stack: project.tech_stack,
    github_url: project.github_url,
    live_url: project.live_url,
    featured: project.featured
  }

  await createTile({
    type: "project",
    size: "4x3",
    content: content as any,
    order_val: project.order_val || 0
  })

  revalidatePath("/")
  revalidatePath("/admin/projects")
  revalidatePath("/admin/tiles")
}
