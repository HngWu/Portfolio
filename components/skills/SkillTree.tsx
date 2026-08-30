"use client"

import * as React from "react"
import { computeSkillTreeLayout } from "@/lib/skills/layout"
import type { SkillTreeData, SkillCategory, PositionedSkillNode } from "@/types/skill-tree"
import { SkillTreeHud } from "./SkillTreeHud"
import { SkillInspectorDrawer } from "./SkillInspectorDrawer"
import { SkillTreeMobileAccordion } from "./SkillTreeMobileAccordion"
import {
  Terminal,
  Layers,
  Server,
  Cloud,
  Sparkles,
  Cpu,
  Brain,
  Lock,
  CheckCircle2,
} from "lucide-react"

export interface SkillTreeProps {
  data: SkillTreeData
}

export function SkillTree({ data }: SkillTreeProps) {
  const layout = React.useMemo(() => computeSkillTreeLayout(data), [data])

  // Component State
  const [selectedNodeId, setSelectedNodeId] = React.useState<string | null>(null)
  const [hoveredNodeId, setHoveredNodeId] = React.useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = React.useState<SkillCategory | "all">("all")
  const [activeView, setActiveView] = React.useState<"graph" | "roadmap">("graph")

  // Pan & Zoom Matrix State
  const [transform, setTransform] = React.useState({ x: 0, y: 0, scale: 1 })
  const [isPanning, setIsPanning] = React.useState(false)
  const panStartRef = React.useRef({ x: 0, y: 0, startX: 0, startY: 0 })
  const containerRef = React.useRef<HTMLDivElement>(null)

  // Auto-detect mobile viewport on mount
  React.useEffect(() => {
    const checkMobile = () => {
      if (typeof window !== "undefined" && window.innerWidth < 768) {
        setActiveView("roadmap")
      }
    }
    checkMobile()
  }, [])

  // Non-passive wheel listener for smooth zoom without page scroll jitter
  React.useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleWheelNative = (e: WheelEvent) => {
      if (activeView !== "graph") return
      e.preventDefault()
      const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92
      setTransform((prev) => ({
        ...prev,
        scale: Math.min(1.8, Math.max(0.6, prev.scale * zoomFactor)),
      }))
    }

    container.addEventListener("wheel", handleWheelNative, { passive: false })
    return () => {
      container.removeEventListener("wheel", handleWheelNative)
    }
  }, [activeView])

  // Zoom button handlers
  const handleZoomIn = () => {
    setTransform((prev) => ({ ...prev, scale: Math.min(1.8, prev.scale + 0.15) }))
  }

  const handleZoomOut = () => {
    setTransform((prev) => ({ ...prev, scale: Math.max(0.6, prev.scale - 0.15) }))
  }

  const handleResetView = () => {
    setTransform({ x: 0, y: 0, scale: 1 })
  }

  // Mouse Pan Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (activeView !== "graph") return
    if ((e.target as HTMLElement).closest("[data-interactive-node]")) return
    setIsPanning(true)
    panStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startX: transform.x,
      startY: transform.y,
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return
    const dx = e.clientX - panStartRef.current.x
    const dy = e.clientY - panStartRef.current.y
    setTransform((prev) => ({
      ...prev,
      x: panStartRef.current.startX + dx,
      y: panStartRef.current.startY + dy,
    }))
  }

  const handleMouseUp = () => {
    setIsPanning(false)
  }

  // Touch Pan Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (activeView !== "graph" || e.touches.length !== 1) return
    if ((e.target as HTMLElement).closest("[data-interactive-node]")) return
    setIsPanning(true)
    const touch = e.touches[0]
    panStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      startX: transform.x,
      startY: transform.y,
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPanning || e.touches.length !== 1) return
    const touch = e.touches[0]
    const dx = touch.clientX - panStartRef.current.x
    const dy = touch.clientY - panStartRef.current.y
    setTransform((prev) => ({
      ...prev,
      x: panStartRef.current.startX + dx,
      y: panStartRef.current.startY + dy,
    }))
  }

  const handleTouchEnd = () => {
    setIsPanning(false)
  }

  // Selected Node & Adjacencies for Drawer
  const selectedNode = selectedNodeId ? layout.nodeMap.get(selectedNodeId) || null : null
  const parents = selectedNodeId ? layout.parentsMap.get(selectedNodeId) || [] : []
  const childrenNodes = selectedNodeId ? layout.childrenMap.get(selectedNodeId) || [] : []

  // Hover connections check
  const isEdgeHighlighted = (fromId: string, toId: string) => {
    if (!hoveredNodeId) return false
    return (
      (hoveredNodeId === fromId && layout.childrenMap.get(hoveredNodeId)?.includes(toId)) ||
      (hoveredNodeId === toId && layout.parentsMap.get(hoveredNodeId)?.includes(fromId))
    )
  }

  // Helper to render icon component inside node
  const renderIcon = (iconName: string, className: string) => {
    switch (iconName) {
      case "terminal":
        return <Terminal className={className} />
      case "layers":
        return <Layers className={className} />
      case "server":
        return <Server className={className} />
      case "cloud":
        return <Cloud className={className} />
      case "sparkles":
        return <Sparkles className={className} />
      case "cpu":
        return <Cpu className={className} />
      case "brain":
        return <Brain className={className} />
      case "lock":
        return <Lock className={className} />
      default:
        return <Sparkles className={className} />
    }
  }

  return (
    <div className="w-full flex flex-col gap-6 relative">
      {/* Floating HUD Controller */}
      <SkillTreeHud
        zoom={transform.scale}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetView={handleResetView}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        categories={data.categories}
        activeView={activeView}
        onToggleView={setActiveView}
      />

      {/* Screen Reader Semantic Fallback */}
      <ol className="sr-only" aria-label="Skill Tree Hierarchy">
        {layout.nodes.map((node) => (
          <li key={node.id}>
            <h4>
              {node.label} (Tier {node.tier}, Category: {node.category}, Status: {node.status})
            </h4>
            <p>{node.description}</p>
            {node.skills && <p>Skills: {node.skills.join(", ")}</p>}
            {node.linkedProject && (
              <p>
                Linked Project: {node.linkedProject.title} ({node.linkedProject.url})
              </p>
            )}
          </li>
        ))}
      </ol>

      {/* Graph Viewport */}
      {activeView === "graph" ? (
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className={`relative w-full h-[680px] rounded-2xl bg-black/40 border border-white/10 overflow-hidden select-none backdrop-blur-md transition-colors ${
            isPanning ? "cursor-grabbing" : "cursor-grab"
          }`}
        >
          {/* Subtle Grid Matrix Background */}
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)`,
              backgroundSize: "32px 32px",
            }}
          />

          <svg
            viewBox={`0 0 ${layout.width} ${layout.height}`}
            className="w-full h-full"
            style={{
              transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
              transformOrigin: "center center",
              transition: isPanning ? "none" : "transform 0.2s ease-out",
            }}
          >
            <defs>
              <filter id="glow-mastered" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Conduit Edges Layer */}
            <g className="edges-layer">
              {layout.edges.map((edge) => {
                const isHighlighted = isEdgeHighlighted(edge.from, edge.to)
                const isDimmed =
                  (selectedCategory !== "all" &&
                    edge.fromNode.category !== selectedCategory &&
                    edge.toNode.category !== selectedCategory) ||
                  (hoveredNodeId !== null &&
                    !isHighlighted &&
                    hoveredNodeId !== edge.from &&
                    hoveredNodeId !== edge.to)

                const isMasteredPath = edge.status === "mastered"

                return (
                  <path
                    key={`${edge.from}->${edge.to}`}
                    d={edge.path}
                    fill="none"
                    stroke={
                      isHighlighted
                        ? "#4AFFB4"
                        : isMasteredPath
                        ? "rgba(74, 255, 180, 0.45)"
                        : edge.status === "in-progress"
                        ? "rgba(201, 162, 39, 0.35)"
                        : "rgba(255, 255, 255, 0.08)"
                    }
                    strokeWidth={isHighlighted ? 3 : isMasteredPath ? 2 : 1.5}
                    strokeDasharray={isMasteredPath ? "6 4" : undefined}
                    className={`transition-all duration-300 ${
                      isDimmed ? "opacity-15" : "opacity-100"
                    } ${isMasteredPath ? "animate-pulse" : ""}`}
                  />
                )
              })}
            </g>

            {/* Nodes Layer */}
            <g className="nodes-layer">
              {layout.nodes.map((node) => {
                const isSelected = selectedNodeId === node.id
                const isHovered = hoveredNodeId === node.id
                const catDef = data.categories.find((c) => c.id === node.category)
                const catColor = catDef?.color || "#4AFFB4"

                const isDimmed =
                  selectedCategory !== "all" && node.category !== selectedCategory

                return (
                  <g
                    key={node.id}
                    data-interactive-node="true"
                    transform={`translate(${node.x}, ${node.y})`}
                    onClick={() => setSelectedNodeId(node.id)}
                    onMouseEnter={() => setHoveredNodeId(node.id)}
                    onMouseLeave={() => setHoveredNodeId(null)}
                    tabIndex={0}
                    role="button"
                    aria-label={`${node.label}, Tier ${node.tier}, ${node.status}`}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        setSelectedNodeId(node.id)
                      }
                    }}
                    className={`cursor-pointer transition-all duration-300 outline-none ${
                      isDimmed ? "opacity-20" : "opacity-100"
                    }`}
                  >
                    {/* Mastered / Hover Aura Ring */}
                    {(node.status === "mastered" || isHovered || isSelected) && (
                      <circle
                        r="44"
                        fill="none"
                        stroke={catColor}
                        strokeWidth="1"
                        opacity={isHovered || isSelected ? "0.6" : "0.2"}
                        className="transition-opacity duration-300"
                      />
                    )}

                    {/* Main Node Base */}
                    <circle
                      r="36"
                      fill={
                        node.status === "mastered"
                          ? "#0c1514"
                          : node.status === "in-progress"
                          ? "#15130c"
                          : "#101012"
                      }
                      stroke={
                        isSelected
                          ? "#FFFFFF"
                          : isHovered
                          ? catColor
                          : node.status === "mastered"
                          ? catColor
                          : node.status === "in-progress"
                          ? "rgba(201, 162, 39, 0.5)"
                          : "rgba(255, 255, 255, 0.12)"
                      }
                      strokeWidth={isSelected ? "2.5" : isHovered ? "2" : "1.5"}
                      className="transition-all duration-300"
                      style={{
                        filter:
                          (isHovered || isSelected) && node.status === "mastered"
                            ? `drop-shadow(0 0 12px ${catColor}88)`
                            : undefined,
                      }}
                    />

                    {/* Center Icon */}
                    <foreignObject
                      x="-14"
                      y="-14"
                      width="28"
                      height="28"
                      className="pointer-events-none"
                    >
                      <div className="w-full h-full flex items-center justify-center">
                        {renderIcon(
                          node.icon,
                          `size-5 ${
                            node.status === "mastered"
                              ? "text-white"
                              : node.status === "in-progress"
                              ? "text-amber-300"
                              : "text-white/30"
                          }`
                        )}
                      </div>
                    </foreignObject>

                    {/* Status Badge in upper-right corner */}
                    {node.status === "mastered" && (
                      <g transform="translate(20, -20)">
                        <circle r="9" fill="#0c1514" stroke="#4AFFB4" strokeWidth="1" />
                        <foreignObject
                          x="-6"
                          y="-6"
                          width="12"
                          height="12"
                          className="pointer-events-none"
                        >
                          <CheckCircle2 className="size-3 text-emerald-400" />
                        </foreignObject>
                      </g>
                    )}

                    {node.status === "in-progress" && (
                      <g transform="translate(20, -20)">
                        <circle r="9" fill="#15130c" stroke="#C9A227" strokeWidth="1" />
                        <foreignObject
                          x="-6"
                          y="-6"
                          width="12"
                          height="12"
                          className="pointer-events-none"
                        >
                          <Sparkles className="size-3 text-amber-400" />
                        </foreignObject>
                      </g>
                    )}

                    {node.status === "locked" && (
                      <g transform="translate(20, -20)">
                        <circle r="9" fill="#101012" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                        <foreignObject
                          x="-6"
                          y="-6"
                          width="12"
                          height="12"
                          className="pointer-events-none"
                        >
                          <Lock className="size-3 text-white/40" />
                        </foreignObject>
                      </g>
                    )}

                    {/* Node Title Label */}
                    <text
                      y="54"
                      textAnchor="middle"
                      className={`text-[11px] font-sans font-medium tracking-wide transition-colors ${
                        isSelected || isHovered
                          ? "fill-white font-semibold"
                          : "fill-white/80"
                      }`}
                    >
                      {node.label}
                    </text>

                    {/* Category Label Subtitle */}
                    <text
                      y="68"
                      textAnchor="middle"
                      fill={catColor}
                      opacity="0.75"
                      className="text-[9px] font-mono uppercase tracking-widest"
                    >
                      {catDef?.label || node.category}
                    </text>
                  </g>
                )
              })}
            </g>
          </svg>
        </div>
      ) : (
        /* Roadmap Accordion Fallback View */
        <SkillTreeMobileAccordion
          nodes={layout.nodes}
          categories={data.categories}
          onSelectNode={setSelectedNodeId}
        />
      )}

      {/* Slide-over Inspector Drawer */}
      <SkillInspectorDrawer
        node={selectedNode}
        categories={data.categories}
        onClose={() => setSelectedNodeId(null)}
        onSelectNode={setSelectedNodeId}
        parents={parents}
        childrenNodes={childrenNodes}
        nodeMap={layout.nodeMap}
      />
    </div>
  )
}
