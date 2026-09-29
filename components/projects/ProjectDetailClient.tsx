"use client"

import * as React from "react"
import { DetailShell } from "@/components/detail/DetailShell"
import { Infinite3DCarousel } from "./Infinite3DCarousel"
import type { ProjectItemData } from "@/lib/projects/types"

interface ProjectDetailClientProps {
  initialProjects: ProjectItemData[]
  initialSlug: string
}

export function ProjectDetailClient({
  initialProjects,
  initialSlug,
}: ProjectDetailClientProps) {
  return (
    <DetailShell
      typeLabel="WORK"
      title="Projects Showcase"
      descriptor="An interactive 3D spatial ring of GitHub repositories, real-time architectures, and high-performance systems."
      hideHero
      maxWidth="max-w-[1400px]"
    >
      <div className="w-full overflow-visible">
        <Infinite3DCarousel
          initialProjects={initialProjects}
          initialSlug={initialSlug}
        />
      </div>
    </DetailShell>
  )
}
