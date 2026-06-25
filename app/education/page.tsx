import { DetailShell } from "@/components/detail/DetailShell"
import { GlassCard } from "@/components/ui/GlassCard"
import { getPortfolioContent } from "@/lib/content/portfolio"

export default async function EducationPage() {
  const { education } = await getPortfolioContent()

  return (
    <DetailShell typeLabel="ACADEMIC" title="Education" descriptor="Foundations built through structured learning.">
      <div className="grid grid-cols-1 gap-6">
        {education.map((edu, idx) => (
          <GlassCard key={edu.id || idx} className="p-8">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
              <div>
                <h3 className="text-2xl font-display text-white/90">{edu.institution}</h3>
                <p className="text-white/60 mt-1">{edu.degree}</p>
                <p className="text-sm font-mono text-white/40 mt-2">{edu.date}</p>
              </div>
              
              {edu.gpa && (
                <div className="text-left md:text-right">
                  <div className="text-5xl font-mono text-[var(--lume-primary)]">{edu.gpa}</div>
                  <div className="text-xs tracking-widest text-white/40 uppercase mt-2">Cumulative GPA</div>
                </div>
              )}
            </div>
            
            {/* Deep-dive details if available */}
            {(edu.deepDiveDegree || edu.deepDiveInstitution || edu.deepDiveDate || edu.deepDiveGpa || edu.honours) && (
              <div className="mt-6 pt-6 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono text-white/50">
                {edu.honours && (
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-[var(--lume-secondary)] block mb-1">Honours / Awards</span>
                    <span>{edu.honours}</span>
                  </div>
                )}
                {edu.deepDiveDegree && (
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-[var(--lume-secondary)] block mb-1">Official Degree Details</span>
                    <span>{edu.deepDiveDegree}</span>
                  </div>
                )}
              </div>
            )}
          </GlassCard>
        ))}
      </div>
    </DetailShell>
  )
}

