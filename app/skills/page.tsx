import type { Metadata } from "next"
import { DetailShell } from "@/components/detail/DetailShell"
import { CelestialAstrolabe } from "@/components/skills/CelestialAstrolabe"
import skillTreeData from "@/lib/data/skill-tree-data.json"
import type { SkillTreeData } from "@/types/skill-tree"

export const revalidate = 3600

export const metadata: Metadata = {
  title: "The Celestial Astrolabe | Capabilities & Architecture",
  description:
    "An interactive celestial map charting technical specializations, system architectures, and shipped project sigils.",
}

export default function SkillsPage() {
  const data = skillTreeData as SkillTreeData

  return (
    <DetailShell
      typeLabel="ASTRONOMER'S CODEX // SYSTEM CAPABILITIES"
      title="The Celestial Astrolabe"
      descriptor="An interactive celestial map charting technical specializations, system architectures, and shipped project sigils."
    >
      <CelestialAstrolabe data={data} />
    </DetailShell>
  )
}
