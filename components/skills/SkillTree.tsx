"use client"

import { CelestialAstrolabe } from "./CelestialAstrolabe"
import type { SkillTreeData } from "@/types/skill-tree"

export interface SkillTreeProps {
  data: SkillTreeData
}

export function SkillTree({ data }: SkillTreeProps) {
  return <CelestialAstrolabe data={data} />
}

export { CelestialAstrolabe }
