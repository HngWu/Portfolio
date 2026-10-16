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
  const results: Project[] = []

  for (const tile of tiles) {
    const content = (tile.content || {}) as any
    if (Array.isArray(content.items) && content.items.length > 0) {
      content.items.forEach((item: any, idx: number) => {
        results.push({
          id: item.id || `${tile.id}-${idx}`,
          name: item.name || "Untitled Project",
          description: item.description || "",
          tech_stack: item.techStack || item.tech_stack || [],
          github_url: item.githubUrl || item.github_url || "",
          live_url: item.liveUrl || item.live_url || "",
          featured: item.featured ?? false,
          order_val: idx + 1
        })
      })
    } else {
      results.push({
        id: tile.id,
        name: content.name || "Untitled Project",
        description: content.description || "",
        tech_stack: content.tech_stack || content.techStack || [],
        github_url: content.github_url || content.githubUrl || "",
        live_url: content.live_url || content.liveUrl || "",
        featured: content.featured || false,
        order_val: tile.order_val
      })
    }
  }

  return results
}

export async function updateProject(id: string, updates: Partial<ProjectContent> & { order_val?: number }) {
  const tiles = await getTilesByType("project")
  const directTile = tiles.find(t => t.id === id)

  if (directTile) {
    const newContent = {
      ...(directTile.content as object),
      ...updates
    }

    await updateTile(id, {
      content: newContent as any,
      order_val: updates.order_val !== undefined ? updates.order_val : directTile.order_val
    })
  } else {
    let foundTile: any = null
    for (const t of tiles) {
      const content = (t.content || {}) as any
      if (Array.isArray(content.items) && content.items.some((i: any) => i.id === id)) {
        foundTile = t
        break
      }
    }

    if (foundTile) {
      const content = (foundTile.content || {}) as any
      const updatedItems = content.items.map((i: any) => {
        if (i.id === id) {
          return {
            ...i,
            name: updates.name !== undefined ? updates.name : i.name,
            description: updates.description !== undefined ? updates.description : i.description,
            techStack: updates.tech_stack !== undefined ? updates.tech_stack : (i.techStack || i.tech_stack),
            githubUrl: updates.github_url !== undefined ? updates.github_url : (i.githubUrl || i.github_url),
            liveUrl: updates.live_url !== undefined ? updates.live_url : (i.liveUrl || i.live_url),
            featured: updates.featured !== undefined ? updates.featured : i.featured,
          }
        }
        return i
      })

      await updateTile(foundTile.id, {
        content: {
          ...content,
          items: updatedItems
        } as any
      })
    } else {
      throw new Error(`Project with id ${id} not found`)
    }
  }
    
  revalidatePath("/")
  revalidatePath("/admin/projects")
  revalidatePath("/admin/tiles")
  revalidatePath("/admin", "layout")
}

export async function deleteProject(id: string) {
  const tiles = await getTilesByType("project")
  const directTile = tiles.find(t => t.id === id)

  if (directTile) {
    await deleteTile(id)
  } else {
    let foundTile: any = null
    for (const t of tiles) {
      const content = (t.content || {}) as any
      if (Array.isArray(content.items) && content.items.some((i: any) => i.id === id)) {
        foundTile = t
        break
      }
    }

    if (foundTile) {
      const content = (foundTile.content || {}) as any
      const remainingItems = content.items.filter((i: any) => i.id !== id)
      await updateTile(foundTile.id, {
        content: {
          ...content,
          items: remainingItems
        } as any
      })
    } else {
      throw new Error(`Project with id ${id} not found`)
    }
  }

  revalidatePath("/")
  revalidatePath("/admin/projects")
  revalidatePath("/admin/tiles")
  revalidatePath("/admin", "layout")
}

export async function createProject(project: ProjectContent & { order_val?: number }) {
  const tiles = await getTilesByType("project")
  const mainProjectTile = tiles.find(t => {
    const c = (t.content || {}) as any
    return Array.isArray(c.items)
  })

  if (mainProjectTile) {
    const content = (mainProjectTile.content || {}) as any
    const newItem = {
      id: "project-" + Date.now().toString(36),
      name: project.name,
      description: project.description,
      techStack: project.tech_stack,
      githubUrl: project.github_url,
      liveUrl: project.live_url,
      featured: project.featured,
      year: new Date().getFullYear().toString(),
      category: "Web Application"
    }
    const updatedItems = [...(content.items || []), newItem]

    await updateTile(mainProjectTile.id, {
      content: {
        ...content,
        items: updatedItems
      } as any
    })
  } else {
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
  }

  revalidatePath("/")
  revalidatePath("/admin/projects")
  revalidatePath("/admin/tiles")
  revalidatePath("/admin", "layout")
}
