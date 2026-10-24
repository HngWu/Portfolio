import { getInitialProjectItems, enrichProjectsWithLiveGitHub } from "@/lib/projects/data"
import { ProjectDetailClient } from "@/components/projects/ProjectDetailClient"
import { notFound } from "next/navigation"

export const revalidate = 3600

export async function generateStaticParams() {
  const initialProjects = getInitialProjectItems()
  const params: { slug: string }[] = []
  for (const p of initialProjects) {
    if (p.slug) params.push({ slug: p.slug })
    if (p.id && p.id !== p.slug) params.push({ slug: p.id })
  }
  return params
}

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
