import { DetailShell } from "@/components/detail/DetailShell"
import { GlassCard } from "@/components/ui/GlassCard"

export default function AwardsPage() {
  return (
    <DetailShell typeLabel="RECOGNITION" title="Awards & Honours" descriptor="Competitions, scholarships, and milestones.">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlassCard className="p-6 border-l-2 border-l-[var(--lume-warm)]">
          <h3 className="text-lg font-medium text-white/90">WorldSkills Singapore</h3>
          <p className="text-sm font-mono text-white/40 mt-1">2025 · Silver Medal</p>
        </GlassCard>
      </div>
    </DetailShell>
  )
}
