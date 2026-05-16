import { DetailShell } from "@/components/detail/DetailShell"
import { GlassCard } from "@/components/ui/GlassCard"
import { Badge } from "@/components/ui/Badge"

export default function SkillsPage() {
  return (
    <DetailShell typeLabel="CAPABILITIES" title="Skills & Technologies" descriptor="Languages, frameworks, tools, and methodologies.">
      <GlassCard className="p-6">
        <h3 className="text-lg font-medium text-white/90 mb-4">Frameworks & Libraries</h3>
        <div className="flex flex-wrap gap-2">
          <Badge variant="lume">Next.js</Badge>
          <Badge variant="lume">React</Badge>
          <Badge variant="lume">TailwindCSS</Badge>
        </div>
      </GlassCard>
    </DetailShell>
  )
}
