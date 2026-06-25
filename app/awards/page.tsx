import { DetailShell } from "@/components/detail/DetailShell"
import { GlassCard } from "@/components/ui/GlassCard"
import { getPortfolioContent } from "@/lib/content/portfolio"

export default async function AwardsPage() {
  const { awards } = await getPortfolioContent()

  return (
    <DetailShell typeLabel="RECOGNITION" title="Awards & Honours" descriptor="Competitions, scholarships, and milestones.">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {awards.map((award, idx) => (
          <GlassCard key={award.id || idx} className="p-6 border-l-2 border-l-[var(--lume-warm)]">
            <h3 className="text-lg font-medium text-white/90">{award.name}</h3>
            <p className="text-sm font-mono text-white/40 mt-1">{award.issuer} · {award.date}</p>
            {award.desc && <p className="text-white/60 text-xs mt-3 leading-relaxed">{award.desc}</p>}
          </GlassCard>
        ))}
      </div>
    </DetailShell>
  )
}

