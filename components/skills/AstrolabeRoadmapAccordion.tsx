"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ChevronDown,
  CheckCircle2,
  Sparkles,
  Lock,
  ArrowUpRight,
  Star,
} from "lucide-react"
import type { PositionedSkillNode, CelestialHouseDef, SkillCategoryDef } from "@/types/skill-tree"
import { GlassCard } from "@/components/ui/GlassCard"
import { playBrassClick, playStarChime } from "@/lib/skills/astrolabeAudio"

export interface AstrolabeRoadmapAccordionProps {
  nodes: PositionedSkillNode[]
  houses: (CelestialHouseDef | SkillCategoryDef)[]
  onSelectNode: (nodeId: string) => void
  isMuted?: boolean
}

const TIER_TITLES: Record<number, string> = {
  1: "Foundational Core (Transmutation)",
  2: "Modern Architecture & Enterprise Systems (Thaumaturgy & Alchemy)",
  3: "Cloud Infrastructure & Creative 3D (Alchemy & Thaumaturgy)",
  4: "Distributed Systems & Agentic AI (Divination)",
  5: "Post-Quantum Cryptography & Frontier Research",
}

export function AstrolabeRoadmapAccordion({
  nodes,
  houses,
  onSelectNode,
  isMuted = false,
}: AstrolabeRoadmapAccordionProps) {
  // Memoized grouping of nodes by tier
  const { tiersMap, sortedTiers } = React.useMemo(() => {
    const map = new Map<number, PositionedSkillNode[]>()
    for (const node of nodes) {
      if (!map.has(node.tier)) {
        map.set(node.tier, [])
      }
      map.get(node.tier)!.push(node)
    }
    const sorted = Array.from(map.keys()).sort((a, b) => a - b)
    return { tiersMap: map, sortedTiers: sorted }
  }, [nodes])

  // Default all tiers to open for seamless reading
  const [openTiers, setOpenTiers] = React.useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: true,
    4: true,
    5: true,
  })

  const toggleTier = (tier: number) => {
    playBrassClick(isMuted)
    setOpenTiers((prev) => ({ ...prev, [tier]: !prev[tier] }))
  }

  const handleNodeClick = (nodeId: string) => {
    playStarChime(isMuted)
    onSelectNode(nodeId)
  }

  return (
    <div className="w-full space-y-4">
      {/* Screen-reader accessible semantic <ol> structure for WCAG AAA compliance */}
      <ol className="sr-only" aria-label="Celestial skill progression roadmap">
        {sortedTiers.map((tier) => {
          const tierNodes = tiersMap.get(tier) || []
          const tierTitle = TIER_TITLES[tier] || `Tier ${tier} Constellations`
          return (
            <li key={`sr-tier-${tier}`}>
              <h3>
                Tier {tier}: {tierTitle}
              </h3>
              <ol>
                {tierNodes.map((node) => (
                  <li key={`sr-node-${node.id}`}>
                    <span>
                      {node.label} - Status: {node.status}
                      {node.masteryPercentage !== undefined ? ` (${node.masteryPercentage}% resonance)` : ""}
                    </span>
                    <p>{node.description}</p>
                  </li>
                ))}
              </ol>
            </li>
          )
        })}
      </ol>

      {/* Visual Expandable Glass Accordions */}
      <div className="space-y-4" role="list" aria-label="Celestial Constellation Tiers">
        {sortedTiers.map((tier) => {
          const tierNodes = tiersMap.get(tier)!
          const isOpen = openTiers[tier] ?? true
          const masteredCount = tierNodes.filter((n) => n.status === "mastered").length
          const tierTitle = TIER_TITLES[tier] || `Tier ${tier} Competencies`
          const headerId = `tier-${tier}-header`
          const panelId = `tier-${tier}-panel`

          return (
            <div key={tier} role="listitem">
              <GlassCard className="overflow-hidden border border-white/10 shadow-lg">
                {/* Tier Header Accordion Toggle with 48px touch target */}
                <button
                  type="button"
                  id={headerId}
                  onClick={() => toggleTier(tier)}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  className="w-full p-4 md:p-5 min-h-[48px] flex items-center justify-between text-left cursor-pointer hover:bg-white/[0.03] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono px-2.5 py-1 rounded bg-white/10 text-white/90 border border-white/10 shadow-sm">
                      TIER {tier}
                    </span>
                    <span className="text-sm md:text-base font-semibold text-white tracking-tight">
                      {tierTitle}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-mono text-white/50 shrink-0">
                    <span className="hidden sm:inline">
                      {masteredCount} / {tierNodes.length} Mastered
                    </span>
                    <ChevronDown
                      className={`size-4 text-white/60 transition-transform duration-300 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                      aria-hidden="true"
                    />
                  </div>
                </button>

                {/* Collapsible Accordion Content */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={panelId}
                      role="region"
                      aria-labelledby={headerId}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 pt-0 md:p-5 md:pt-0 grid grid-cols-1 gap-3 border-t border-white/5">
                        {tierNodes.map((node) => {
                          const houseDef = houses.find((h) => h.id === node.category)
                          const houseColor = houseDef?.color || "#4AFFB4"

                          return (
                            <div
                              key={node.id}
                              role="button"
                              tabIndex={0}
                              onClick={() => handleNodeClick(node.id)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault()
                                  handleNodeClick(node.id)
                                }
                              }}
                              className="p-4 min-h-[48px] rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.08] hover:border-white/20 transition-all duration-200 cursor-pointer space-y-3 focus:outline-none focus:ring-1 focus:ring-amber-400/60"
                              aria-label={`Inspect ${node.label}, ${node.status}`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span
                                      className="size-2 rounded-full inline-block shrink-0"
                                      style={{
                                        backgroundColor: houseColor,
                                        boxShadow: `0 0 6px ${houseColor}`,
                                      }}
                                      aria-hidden="true"
                                    />
                                    <span className="text-[10px] font-mono uppercase tracking-wider text-white/60">
                                      {houseDef?.label || node.category}
                                    </span>
                                    {node.magnitude && (
                                      <span className="inline-flex items-center gap-0.5 text-[9px] font-mono text-amber-300/80 px-1.5 py-0.5 rounded bg-amber-500/10">
                                        <Star className="size-2.5 fill-amber-400 text-amber-400" />
                                        <span>Mag {node.magnitude}</span>
                                      </span>
                                    )}
                                  </div>
                                  <h4 className="text-base font-semibold text-white">
                                    {node.label}
                                  </h4>
                                </div>

                                <div className="shrink-0">
                                  {node.status === "mastered" && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.2)]">
                                      <CheckCircle2 className="size-3" /> Mastered
                                    </span>
                                  )}
                                  {node.status === "in-progress" && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-[0_0_8px_rgba(245,158,11,0.2)]">
                                      <Sparkles className="size-3" /> In Progress
                                    </span>
                                  )}
                                  {node.status === "locked" && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-white/5 text-white/40 border border-white/10">
                                      <Lock className="size-3" /> Locked
                                    </span>
                                  )}
                                </div>
                              </div>

                              <p className="text-xs text-white/70 leading-relaxed line-clamp-2">
                                {node.description}
                              </p>

                              {node.linkedProject && (
                                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs font-mono text-amber-300">
                                  <span>Project Sigil: {node.linkedProject.title}</span>
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
            </div>
          )
        })}
      </div>
    </div>
  )
}
