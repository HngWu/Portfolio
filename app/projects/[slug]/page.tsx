import { getInitialProjectItems, enrichProjectsWithLiveGitHub } from "@/lib/projects/data"
import { ProjectDetailClient } from "@/components/projects/ProjectDetailClient"
import { notFound } from "next/navigation"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const initialProjects = getInitialProjectItems()
  const project = initialProjects.find((p) => p.slug === slug || p.id === slug)

  if (!project) {
    return {
      title: "Project Not Found",
    }
  }

  return {
    title: `${project.name} | Projects Showcase`,
    description: project.description,
  }
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const initialProjects = getInitialProjectItems()
  const projects = await enrichProjectsWithLiveGitHub(initialProjects)

  // Verify the project exists for this slug or ID
  const projectExists = projects.some((p) => p.slug === slug || p.id === slug)
  if (!projectExists && projects.length > 0) {
    notFound()
  }

  return (
    <ProjectDetailClient
      initialProjects={projects}
      initialSlug={slug}
    />
  )
}