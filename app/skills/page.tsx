import type { Metadata } from "next"
import { DetailShell } from "@/components/detail/DetailShell"
import { SkillTree } from "@/components/skills/SkillTree"
import skillTreeData from "@/lib/data/skill-tree-data.json"
import type { SkillTreeData } from "@/types/skill-tree"

export const metadata: Metadata = {
  title: "Interactive Skill Tree | Capabilities & Roadmap",
  description:
    "Explorable branching talent tree visualizing core competencies, systems architecture, and shipped projects.",
}

export default function SkillsPage() {
  const data = skillTreeData as SkillTreeData

  return (
    <DetailShell
      typeLabel="CAPABILITIES & ROADMAP"
      title="Interactive Skill Tree"
      descriptor="Explorable branching talent tree visualizing core competencies, systems architecture, and shipped projects."
    >
      <SkillTree data={data} />
    </DetailShell>
  )
}
