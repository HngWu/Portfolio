"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, CheckCircle2, Sparkles, Lock, ArrowUpRight } from "lucide-react"
import type { PositionedSkillNode, SkillCategoryDef } from "@/types/skill-tree"
import { GlassCard } from "@/components/ui/GlassCard"

export interface SkillTreeMobileAccordionProps {
  nodes: PositionedSkillNode[]
  categories: SkillCategoryDef[]
  onSelectNode: (nodeId: string) => void
}

const TIER_TITLES: Record<number, string> = {
  1: "Foundational Core",
  2: "Architecture & Enterprise Systems",
  3: "Cloud & Creative Technologies",
  4: "Distributed Computing & AI",
  5: "Advanced Security & Research",
}

export function SkillTreeMobileAccordion({
  nodes,
  categories,
  onSelectNode,
}: SkillTreeMobileAccordionProps) {
  // Group nodes by tier
  const tiersMap = new Map<number, PositionedSkillNode[]>()
  for (const node of nodes) {
    if (!tiersMap.has(node.tier)) {
      tiersMap.set(node.tier, [])
    }
    tiersMap.get(node.tier)!.push(node)
  }

  const sortedTiers = Array.from(tiersMap.keys()).sort((a, b) => a - b)
  const [openTiers, setOpenTiers] = React.useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: true,
    4: true,
    5: true,
  })

  const toggleTier = (tier: number) => {
    setOpenTiers((prev) => ({ ...prev, [tier]: !prev[tier] }))
  }

  return (
    <div className="w-full space-y-4">
      {sortedTiers.map((tier) => {
        const tierNodes = tiersMap.get(tier)!
        const isOpen = openTiers[tier] ?? true
        const masteredCount = tierNodes.filter((n) => n.status === "mastered").length
        const tierTitle = TIER_TITLES[tier] || `Tier ${tier} Competencies`

        return (
          <GlassCard key={tier} className="overflow-hidden border border-white/10">
            {/* Tier Header Accordion Toggle */}
            <button
              type="button"
              onClick={() => toggleTier(tier)}
              aria-expanded={isOpen}
              className="w-full p-4 md:p-5 min-h-[48px] flex items-center justify-between text-left cursor-pointer hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/10 text-white/80 border border-white/10">
                  TIER {tier}
                </span>
                <span className="text-sm font-semibold text-white">
                  {tierTitle}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono text-white/50">
                <span>
                  {masteredCount} / {tierNodes.length} Unlocked
                </span>
                <ChevronDown
                  className={`size-4 transition-transform duration-300 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </div>
            </button>

            {/* Accordion Content */}
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <div className="p-4 pt-0 md:p-5 md:pt-0 grid grid-cols-1 gap-3 border-t border-white/5">
                    {tierNodes.map((node) => {
                      const catDef = categories.find((c) => c.id === node.category)
                      const catColor = catDef?.color || "#4AFFB4"

                      return (
                        <div
                          key={node.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => onSelectNode(node.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault()
                              onSelectNode(node.id)
                            }
                          }}
                          className="p-4 min-h-[48px] rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.08] hover:border-white/20 transition-all cursor-pointer space-y-3 focus:outline-none focus:ring-1 focus:ring-lume-primary/50"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span
                                  className="size-2 rounded-full inline-block"
                                  style={{
                                    backgroundColor: catColor,
                                    boxShadow: `0 0 6px ${catColor}`,
                                  }}
                                />
                                <span className="text-[10px] font-mono uppercase tracking-wider text-white/50">
                                  {catDef?.label || node.category}
                                </span>
                              </div>
                              <h4 className="text-base font-semibold text-white">
                                {node.label}
                              </h4>
                            </div>

                            <div className="shrink-0">
                              {node.status === "mastered" && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  <CheckCircle2 className="size-3" /> Mastered
                                </span>
                              )}
                              {node.status === "in-progress" && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                  <Sparkles className="size-3" /> In Progress
                                </span>
                              )}
                              {node.status === "locked" && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-white/40 border border-white/10">
                                  <Lock className="size-3" /> Locked
                                </span>
                              )}
                            </div>
                          </div>

                          <p className="text-xs text-white/70 leading-relaxed line-clamp-2">
                            {node.description}
                          </p>

                          {node.linkedProject && (
                            <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs font-mono text-lume-primary">
                              <span>Project: {node.linkedProject.title}</span>
                              <ArrowUpRight className="size-3.5" />
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </GlassCard>
        )
      })}
    </div>
  )
}
