"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  X,
  CheckCircle2,
  Sparkles,
  Lock,
  ArrowUpRight,
  ArrowLeft,
  ArrowRight,
  Compass,
} from "lucide-react"
import type { PositionedSkillNode, CelestialHouseDef, SkillCategoryDef } from "@/types/skill-tree"
import { usePageTransition } from "@/hooks/usePageTransition"
import { playBrassClick, playStarChime } from "@/lib/skills/astrolabeAudio"

export interface AstrolabeInspectorProps {
  node: PositionedSkillNode | null
  houses: (CelestialHouseDef | SkillCategoryDef)[]
  onClose: () => void
  onSelectNode: (nodeId: string) => void
  parents: string[]
  childrenNodes: string[]
  nodeMap: Map<string, PositionedSkillNode>
  isMuted?: boolean
}

function getMagnitudeDescriptor(magnitude?: 1 | 2 | 3): { stars: string; label: string } {
  switch (magnitude) {
    case 1:
      return { stars: "★", label: "Magnitude 1 // Polaris Anchor" }
    case 2:
      return { stars: "★★", label: "Magnitude 2 // Major Luminary" }
    case 3:
      return { stars: "★★★", label: "Magnitude 3 // Satellite Star" }
    default:
      return { stars: "★", label: "Magnitude 1 // Polaris Anchor" }
  }
}

export function AstrolabeInspector({
  node,
  houses,
  onClose,
  onSelectNode,
  parents,
  childrenNodes,
  nodeMap,
  isMuted = false,
}: AstrolabeInspectorProps) {
  const { navigateWithTransition } = usePageTransition()
  const drawerRef = React.useRef<HTMLDivElement>(null)
  const previousFocusRef = React.useRef<HTMLElement | null>(null)
  const prevNodeIdRef = React.useRef<string | null>(null)

  // Body scroll lock & focus management
  React.useEffect(() => {
    if (node) {
      previousFocusRef.current = document.activeElement as HTMLElement
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = "hidden"

      // Focus drawer on open
      const timer = setTimeout(() => {
        drawerRef.current?.focus()
      }, 50)

      return () => {
        clearTimeout(timer)
        document.body.style.overflow = originalOverflow
        previousFocusRef.current?.focus?.()
      }
    }
  }, [Boolean(node)])

  // Resonate celestial chime ONLY when node id changes
  React.useEffect(() => {
    if (node && node.id !== prevNodeIdRef.current) {
      prevNodeIdRef.current = node.id
      playStarChime(isMuted)
    } else if (!node) {
      prevNodeIdRef.current = null
    }
  }, [node?.id, isMuted])

  const handleClose = React.useCallback(() => {
    playBrassClick(isMuted)
    onClose()
  }, [isMuted, onClose])

  const handleSelectNode = React.useCallback(
    (nodeId: string) => {
      playStarChime(isMuted)
      onSelectNode(nodeId)
    },
    [isMuted, onSelectNode]
  )

  // ESC key listener & focus trapping
  React.useEffect(() => {
    if (!node) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose()
        return
      }

      if (e.key === "Tab" && drawerRef.current) {
        const focusableElements = drawerRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        if (focusableElements.length === 0) return

        const firstElement = focusableElements[0]
        const lastElement = focusableElements[focusableElements.length - 1]

        if (e.shiftKey) {
          if (document.activeElement === firstElement || document.activeElement === drawerRef.current) {
            e.preventDefault()
            lastElement.focus()
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault()
            firstElement.focus()
          }
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [node, handleClose])

  const houseDef = node ? houses.find((h) => h.id === node.category) : undefined
  const houseColor = houseDef?.color || "#4AFFB4"
  const houseElement = houseDef?.element || "Aether"
  const magInfo = node ? getMagnitudeDescriptor(node.magnitude) : null

  const statusConfig = node
    ? {
        mastered: {
          label: "Mastered",
          icon: <CheckCircle2 className="size-3.5 text-emerald-400" />,
          badgeClass: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.2)]",
        },
        "in-progress": {
          label: "In Progress",
          icon: <Sparkles className="size-3.5 text-amber-400" />,
          badgeClass: "bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.2)]",
        },
        locked: {
          label: "Locked",
          icon: <Lock className="size-3.5 text-white/40" />,
          badgeClass: "bg-white/5 border-white/10 text-white/40",
        },
      }[node.status]
    : null

  return (
    <AnimatePresence>
      {node && statusConfig && magInfo && (
        <motion.div
          key="astrolabe-inspector-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="astrolabe-lens-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 pointer-events-auto flex justify-end"
        >
          {/* Backdrop with celestial blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-hidden="true"
            onClick={handleClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-md cursor-pointer"
          />

          {/* Observation Lens Drawer Panel */}
          <motion.div
            ref={drawerRef}
            tabIndex={-1}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="relative w-full max-w-md h-full bg-[#08080c]/95 border-l border-white/10 p-6 md:p-8 flex flex-col justify-between overflow-y-auto shadow-2xl backdrop-blur-2xl outline-none"
          >
            <div className="space-y-6">
              {/* Header: House Element & Magnitude Indicators */}
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  {/* House Element Indicator with Glowing Dot */}
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block size-2.5 rounded-full"
                      style={{
                        backgroundColor: houseColor,
                        boxShadow: `0 0 10px ${houseColor}, 0 0 16px ${houseColor}`,
                      }}
                      aria-hidden="true"
                    />
                    <span className="text-[10px] font-mono tracking-widest uppercase text-white/60">
                      Tier {node.tier} // {houseDef?.label || node.category} • {houseElement}
                    </span>
                  </div>

                  {/* Magnitude Stars Indicator */}
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-white/[0.04] border border-white/10 text-xs font-mono text-amber-300">
                    <span className="text-amber-400 font-bold">{magInfo.stars}</span>
                    <span className="text-white/80">{magInfo.label}</span>
                  </div>

                  <h2
                    id="astrolabe-lens-title"
                    className="text-xl md:text-2xl font-bold text-white tracking-tight pt-1"
                  >
                    {node.label}
                  </h2>
                </div>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={handleClose}
                  aria-label="Close observation lens"
                  className="p-2 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer border border-white/10"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Status Badge & Resonance Percentage */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <div
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider border ${statusConfig.badgeClass}`}
                >
                  {statusConfig.icon}
                  <span>{statusConfig.label}</span>
                </div>

                {node.masteryPercentage !== undefined && (
                  <span className="text-xs font-mono text-white/60 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/10">
                    {node.masteryPercentage}% Celestial Resonance
                  </span>
                )}
              </div>

              {/* Competency Overview Narrative */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono tracking-wider uppercase text-white/40 block">
                  Observation Narrative // Competency Overview
                </span>
                <p className="text-sm text-white/80 leading-relaxed font-sans">
                  {node.description}
                </p>
              </div>

              {/* Core Technologies & Methodologies Pills */}
              {node.skills && node.skills.length > 0 && (
                <div className="space-y-2.5">
                  <span className="text-[10px] font-mono tracking-wider uppercase text-white/40 block">
                    Core Technologies & Methodologies
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {node.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2.5 py-1 text-xs font-mono rounded-md bg-white/[0.04] border border-white/10 text-white/80 hover:border-white/20 transition-colors"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Linked Project Sigil Card */}
              {node.linkedProject && (
                <div className="space-y-2.5 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono tracking-wider uppercase text-amber-300/80 block">
                      Linked Project Sigil
                    </span>
                    <span className="text-[9px] font-mono tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {node.linkedProject.badge || "Shipped Project Sigil"}
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:border-amber-400/30 transition-all duration-300 group shadow-lg">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <h3 className="font-semibold text-white group-hover:text-amber-300 transition-colors text-sm">
                        {node.linkedProject.title}
                      </h3>
                    </div>
                    <p className="text-xs text-white/60 mb-3.5 leading-relaxed">
                      {node.linkedProject.description}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        playBrassClick(isMuted)
                        navigateWithTransition(node.linkedProject!.url)
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-mono text-amber-300 hover:text-amber-200 hover:underline cursor-pointer transition-colors"
                    >
                      <span>Engage Project Sigil</span>
                      <ArrowUpRight className="size-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Prerequisites & Unlocks Navigation */}
              {(parents.length > 0 || childrenNodes.length > 0) && (
                <div className="pt-4 border-t border-white/10 space-y-4">
                  {parents.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[10px] font-mono tracking-wider uppercase text-white/40 block">
                        Prerequisites (Unlocks This Star)
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {parents.map((pId) => {
                          const pNode = nodeMap.get(pId)
                          if (!pNode) return null
                          return (
                            <button
                              key={pId}
                              type="button"
                              onClick={() => handleSelectNode(pId)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[32px] rounded-lg text-xs font-mono bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all cursor-pointer"
                            >
                              <ArrowLeft className="size-3 text-white/40" />
                              <span>{pNode.label}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {childrenNodes.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[10px] font-mono tracking-wider uppercase text-white/40 block">
                        Directly Unlocks (Descendant Stars)
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {childrenNodes.map((cId) => {
                          const cNode = nodeMap.get(cId)
                          if (!cNode) return null
                          return (
                            <button
                              key={cId}
                              type="button"
                              onClick={() => handleSelectNode(cId)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[32px] rounded-lg text-xs font-mono bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all cursor-pointer"
                            >
                              <span>{cNode.label}</span>
                              <ArrowRight className="size-3 text-white/40" />
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Footer Telemetry */}
            <div className="pt-6 border-t border-white/10 flex justify-between items-center text-[10px] font-mono text-white/40">
              <span className="flex items-center gap-1.5">
                <Compass className="size-3 text-white/30" />
                <span>ESC TO CLOSE LENS</span>
              </span>
              <span>NODE: #{node.id}</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
