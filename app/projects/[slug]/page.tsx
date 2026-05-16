import { GlassCard } from "@/components/ui/GlassCard"
import Link from "next/link"

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  return (
    <main className="min-h-screen pt-24 pb-24 px-4 md:px-8 max-w-3xl mx-auto">
      <div className="mb-12">
        <Link href="/projects" className="text-white/50 hover:text-white/90 text-sm">← Projects</Link>
      </div>
      
      <div className="text-[0.6875rem] font-mono text-[var(--lume-primary)] uppercase mb-4">PROJECT</div>
      <h1 className="text-4xl font-display text-white/90 mb-4 capitalize">{slug}</h1>
      <p className="text-white/60 mb-12">Detailed implementation notes and architecture overview will go here.</p>

      <h2 className="text-xl font-medium text-white/90 mb-4">Key Features</h2>
      <GlassCard className="p-6">
        <div className="flex gap-4">
          <div className="text-[var(--lume-primary)]">▸</div>
          <div>
            <h4 className="text-white/90 font-medium">Real-Time Sync</h4>
            <p className="text-white/60 text-sm mt-1">WebSockets via Supabase Realtime.</p>
          </div>
        </div>
      </GlassCard>
    </main>
  )
}
