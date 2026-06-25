import { DetailShell } from "@/components/detail/DetailShell"
import { getPortfolioContent } from "@/lib/content/portfolio"

export default async function ExperiencePage() {
  const { experience } = await getPortfolioContent()

  return (
    <DetailShell typeLabel="CAREER" title="Experience" descriptor="How I've contributed in professional settings.">
      <div className="space-y-12">
        {experience.map((exp, idx) => (
          <div key={exp.id || idx} className="pl-6 border-l border-white/10 relative">
            <div className="absolute w-3 h-3 rounded-full bg-[var(--lume-primary)] -left-[6.5px] top-2" />
            <h3 className="text-lg font-medium text-white/90">{exp.role}</h3>
            <p className="text-sm font-mono text-white/40 mt-1">{exp.company} · {exp.date}</p>
            
            {/* Front-face highlights */}
            <ul className="mt-4 text-white/60 text-sm list-disc pl-4 space-y-2">
              {exp.highlights.map((highlight, hIdx) => (
                <li key={hIdx}>{highlight}</li>
              ))}
            </ul>

            {/* Deep-dive highlights if available */}
            {exp.deepDiveHighlights && exp.deepDiveHighlights.length > 0 && (
              <div className="mt-6 pt-6 border-t border-white/5">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--lume-primary)] block mb-3">Deep-Dive Technical Details</span>
                <ul className="text-white/40 text-xs list-disc pl-4 space-y-2">
                  {exp.deepDiveHighlights.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </DetailShell>
  )
}

