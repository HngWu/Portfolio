"use client"

import * as React from "react"
import { DetailShell } from "@/components/detail/DetailShell"
import { ProjectCarousel } from "./ProjectCarousel"

interface Project {
  id: string
  slug: string
  name: string
  description: string
  techStack: string[]
  githubUrl: string
  liveUrl: string
  featured: boolean
  notes?: string
}

interface ProjectDetailClientProps {
  projects: Project[]
  initialSlug: string
}

export function ProjectDetailClient({ projects, initialSlug }: ProjectDetailClientProps) {
  const [activeId, setActiveId] = React.useState<string>(() => {
    const project = projects.find(p => p.slug === initialSlug || p.id === initialSlug)
    return project ? project.id : (projects[0]?.id || "")
  })

  // Synchronize URL change smoothly without trigger server-side re-render/re-fetch
  React.useEffect(() => {
    const project = projects.find(p => p.id === activeId)
    if (project) {
      window.history.pushState(null, "", `/projects/${project.slug}`)
    }
  }, [activeId, projects])

  return (
    <DetailShell
      typeLabel="WORK"
      title="Projects Showcase"
      descriptor="A selection of high-performance systems, real-time engines, and cinematic experiences built by me."
      hideHero
    >
      <div className="w-full mt-4 overflow-visible">
        <ProjectCarousel 
          projects={projects} 
          currentId={activeId} 
          onChangeActiveId={setActiveId}
        />
      </div>
    </DetailShell>
  )
}
