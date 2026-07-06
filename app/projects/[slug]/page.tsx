import { getPortfolioContent } from "@/lib/content/portfolio"
import { ProjectDetailClient } from "@/components/projects/ProjectDetailClient"
import { notFound } from "next/navigation"

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { projects } = await getPortfolioContent()
  
  // Verify the project exists for this slug or ID, otherwise fail fast with notFound
  const projectExists = projects.some(p => p.slug === slug || p.id === slug)
  if (!projectExists && projects.length > 0) {
    notFound()
  }

  return (
    <ProjectDetailClient 
      projects={projects} 
      initialSlug={slug} 
    />
  )
}