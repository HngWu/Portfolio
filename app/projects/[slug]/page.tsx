import { DetailShell } from "@/components/detail/DetailShell"
import { GlassCard } from "@/components/ui/GlassCard"
import { getPortfolioContent } from "@/lib/content/portfolio"
import { notFound } from "next/navigation"
import { Github, ExternalLink } from "lucide-react"

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { projects } = await getPortfolioContent()
  
  const project = projects.find(p => p.slug === slug)
  if (!project) {
    notFound()
  }

  return (
    <DetailShell 
      typeLabel="PROJECT" 
      title={project.name} 
      descriptor={project.description}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-2 space-y-4">
          <h3 className="text-lg font-medium text-white/90">Tech Stack</h3>
          <div className="flex flex-wrap gap-2">
            {project.techStack.map(tech => (
              <span key={tech} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-mono text-[var(--lume-primary)]">
                {tech}
              </span>
            ))}
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white/90">Links</h3>
          <div className="flex gap-4">
            {project.githubUrl && (
              <a 
                href={project.githubUrl} 
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
              >
                <Github className="size-4" /> GitHub
              </a>
            )}
            {project.liveUrl && (
              <a 
                href={project.liveUrl} 
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
              >
                <ExternalLink className="size-4" /> Live Demo
              </a>
            )}
          </div>
        </div>
      </div>

      {project.notes && (
        <>
          <h3 className="text-lg font-medium text-white/90 mb-4">Implementation Notes</h3>
          <GlassCard className="p-6">
            <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">{project.notes}</p>
          </GlassCard>
        </>
      )}
    </DetailShell>
  )
}