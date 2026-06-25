import { DetailShell } from "@/components/detail/DetailShell"
import { GlassCard } from "@/components/ui/GlassCard"
import Link from "next/link"
import { getPortfolioContent } from "@/lib/content/portfolio"

export default async function ProjectsPage() {
  const { projects } = await getPortfolioContent()

  return (
    <DetailShell typeLabel="WORK" title="Projects" descriptor="Things I've built — real-time, full-stack, and thoughtfully crafted.">
      {projects.map(p => (
        <Link key={p.slug} href={`/projects/${p.slug}`}>
          <GlassCard className="p-6 cursor-pointer border-l-2 border-l-[var(--lume-secondary)] hover:-translate-y-1">
            <h3 className="text-xl font-medium text-white/90">{p.name}</h3>
            <p className="text-white/60 mt-2">{p.description}</p>
          </GlassCard>
        </Link>
      ))}
    </DetailShell>
  )
}

