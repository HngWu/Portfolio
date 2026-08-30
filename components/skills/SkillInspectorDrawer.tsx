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
} from "lucide-react"
import type { PositionedSkillNode, SkillCategoryDef } from "@/types/skill-tree"
import { usePageTransition } from "@/hooks/usePageTransition"

export interface SkillInspectorDrawerProps {
  node: PositionedSkillNode | null
  categories: SkillCategoryDef[]
  onClose: () => void
  onSelectNode: (nodeId: string) => void
  parents: string[]
  childrenNodes: string[]
  nodeMap: Map<string, PositionedSkillNode>
}

export function SkillInspectorDrawer({
  node,
  categories,
  onClose,
  onSelectNode,
  parents,
  childrenNodes,
  nodeMap,
}: SkillInspectorDrawerProps) {
  const { navigateWithTransition } = usePageTransition()
  const drawerRef = React.useRef<HTMLDivElement>(null)

  // ESC key listener & focus trapping
  React.useEffect(() => {
    if (!node) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
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
    drawerRef.current?.focus()

    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [node, onClose])

  const categoryDef = node ? categories.find((c) => c.id === node.category) : undefined
  const categoryColor = categoryDef?.color || "#4AFFB4"

  const statusConfig = node
    ? {
        mastered: {
          label: "Mastered",
          icon: <CheckCircle2 className="size-3.5 text-emerald-400" />,
          badgeClass: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
        },
        "in-progress": {
          label: "In Progress",
          icon: <Sparkles className="size-3.5 text-amber-400" />,
          badgeClass: "bg-amber-500/10 border-amber-500/30 text-amber-400",
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
      {node && statusConfig && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="skill-drawer-title"
          className="fixed inset-0 z-50 pointer-events-auto flex justify-end"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Drawer Panel */}
          <motion.div
            ref={drawerRef}
            tabIndex={-1}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="relative w-full max-w-md h-full bg-[#0d0d0f]/95 border-l border-white/10 p-6 md:p-8 flex flex-col justify-between overflow-y-auto shadow-2xl backdrop-blur-xl outline-none"
          >
            <div className="space-y-6">
              {/* Top Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block size-2 rounded-full"
                      style={{
                        backgroundColor: categoryColor,
                        boxShadow: `0 0 8px ${categoryColor}`,
                      }}
                    />
                    <span className="text-[10px] font-mono tracking-widest uppercase text-white/50">
                      Tier {node.tier} // {categoryDef?.label || node.category}
                    </span>
                  </div>
                  <h2
                    id="skill-drawer-title"
                    className="text-xl md:text-2xl font-bold text-white tracking-tight"
                  >
                    {node.label}
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  aria-label="Close detail panel"
                  className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Status Pill */}
              <div className="flex items-center gap-2">
                <div
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono uppercase tracking-wider border ${statusConfig.badgeClass}`}
                >
                  {statusConfig.icon}
                  <span>{statusConfig.label}</span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono tracking-wider uppercase text-white/40 block">
                  Competency Overview
                </span>
                <p className="text-sm text-white/80 leading-relaxed font-sans">
                  {node.description}
                </p>
              </div>

              {/* Skills & Technologies */}
              {node.skills && node.skills.length > 0 && (
                <div className="space-y-2.5">
                  <span className="text-[10px] font-mono tracking-wider uppercase text-white/40 block">
                    Core Technologies & Methodologies
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {node.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2.5 py-1 text-xs font-mono rounded-md bg-white/5 border border-white/10 text-white/80"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Linked Project Card */}
              {node.linkedProject && (
                <div className="space-y-2.5 pt-2">
                  <span className="text-[10px] font-mono tracking-wider uppercase text-lume-primary block">
                    Linked Portfolio Project
                  </span>
                  <div className="p-4 rounded-xl bg-white/[0.04] border border-lume-primary/20 hover:border-lume-primary/40 transition-colors group">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <h3 className="font-semibold text-white group-hover:text-lume-primary transition-colors text-sm">
                        {node.linkedProject.title}
                      </h3>
                      {node.linkedProject.badge && (
                        <span className="text-[9px] font-mono tracking-wider px-2 py-0.5 rounded-full bg-lume-primary/10 text-lume-primary border border-lume-primary/20">
                          {node.linkedProject.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-white/60 mb-3 leading-relaxed">
                      {node.linkedProject.description}
                    </p>
                    <button
                      onClick={() => navigateWithTransition(node.linkedProject!.url)}
                      className="inline-flex items-center gap-1.5 text-xs font-mono text-lume-primary hover:underline cursor-pointer"
                    >
                      <span>View Project Case Study</span>
                      <ArrowUpRight className="size-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Prerequisites & Unlocks Navigation */}
              {(parents.length > 0 || childrenNodes.length > 0) && (
                <div className="pt-4 border-t border-white/10 space-y-4">
                  {parents.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono tracking-wider uppercase text-white/40 block">
                        Prerequisites (Unlocks This)
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {parents.map((pId) => {
                          const pNode = nodeMap.get(pId)
                          if (!pNode) return null
                          return (
                            <button
                              key={pId}
                              onClick={() => onSelectNode(pId)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
                            >
                              <ArrowLeft className="size-3" />
                              <span>{pNode.label}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {childrenNodes.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono tracking-wider uppercase text-white/40 block">
                        Directly Unlocks
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {childrenNodes.map((cId) => {
                          const cNode = nodeMap.get(cId)
                          if (!cNode) return null
                          return (
                            <button
                              key={cId}
                              onClick={() => onSelectNode(cId)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
                            >
                              <span>{cNode.label}</span>
                              <ArrowRight className="size-3" />
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-white/10 flex justify-between items-center text-[10px] font-mono text-white/40">
              <span>PRESS ESC TO CLOSE</span>
              <span>NODE ID: #{node.id}</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
