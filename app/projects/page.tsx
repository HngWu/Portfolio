import { DetailShell } from "@/components/detail/DetailShell"
import { GlassCard } from "@/components/ui/GlassCard"
import Link from "next/link"

export default function ProjectsPage() {
  // Mock data for Phase 3
  const projects = [
    { slug: "triviaduel", name: "TriviaDuel", desc: "Real-time multiplayer trivia platform." },
    { slug: "secureasset", name: "SecureAsset", desc: "Blockchain asset tracking system." }
  ]

  return (
    <DetailShell typeLabel="WORK" title="Projects" descriptor="Things I've built — real-time, full-stack, and thoughtfully crafted.">
      {projects.map(p => (
        <Link key={p.slug} href={`/projects/${p.slug}`}>
          <GlassCard className="p-6 cursor-pointer border-l-2 border-l-[var(--lume-secondary)] hover:-translate-y-1">
            <h3 className="text-xl font-medium text-white/90">{p.name}</h3>
            <p className="text-white/60 mt-2">{p.desc}</p>
          </GlassCard>
        </Link>
      ))}
    </DetailShell>
  )
}
