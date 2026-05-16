import { DetailShell } from "@/components/detail/DetailShell"
import { GlassCard } from "@/components/ui/GlassCard"

export default function EducationPage() {
  return (
    <DetailShell typeLabel="ACADEMIC" title="Education" descriptor="Foundations built through structured learning.">
      <GlassCard className="p-8">
        <h3 className="text-2xl font-display text-white/90">Nanyang Polytechnic</h3>
        <p className="text-white/60 mt-1">Diploma in Information Technology</p>
        <p className="text-sm font-mono text-white/40 mt-2">Apr 2023 - Apr 2026</p>
        
        <div className="mt-8">
          <div className="text-5xl font-mono text-[var(--lume-primary)]">3.91</div>
          <div className="text-xs tracking-widest text-white/40 uppercase mt-2">Cumulative GPA</div>
        </div>
      </GlassCard>
    </DetailShell>
  )
}
