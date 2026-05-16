import { DetailShell } from "@/components/detail/DetailShell"
import { GlassCard } from "@/components/ui/GlassCard"

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  return (
    <DetailShell 
      typeLabel="PROJECT" 
      title={slug.charAt(0).toUpperCase() + slug.slice(1)} 
      descriptor="Detailed implementation notes and architecture overview for this project."
    >
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
      
      {/* We can add a back link specifically for projects here if needed, but DetailShell already has one */}
    </DetailShell>
  )
}