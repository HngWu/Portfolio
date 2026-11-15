"use client"

import * as React from "react"
import type {
  SkillTreeData,
  CelestialHouse,
  PositionedSkillNode,
} from "@/types/skill-tree"
import {
  computeSkillTreeLayout,
  getAncestorNodeIds,
  getDescendantNodeIds,
} from "@/lib/skills/layout"
import { AstrolabeHud } from "./AstrolabeHud"
import { AstrolabeInspector } from "./AstrolabeInspector"
import { AstrolabeRoadmapAccordion } from "./AstrolabeRoadmapAccordion"
import { playStarChime, playBrassClick } from "@/lib/skills/astrolabeAudio"
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

export interface CelestialAstrolabeProps {
  data: SkillTreeData
}

// 72 Azimuth graduation tick marks (every 5 degrees around 360°)
const AZIMUTH_TICKS = Array.from({ length: 72 }, (_, i) => {
  const deg = i * 5
  const rad = (deg * Math.PI) / 180
  const isCardinal = deg % 90 === 0
  const isMajor = deg % 30 === 0
  const rIn = isCardinal ? 366 : isMajor ? 370 : 374
  const rOut = 380
  return {
    deg,
    x1: rIn * Math.cos(rad),
    y1: rIn * Math.sin(rad),
    x2: rOut * Math.cos(rad),
    y2: rOut * Math.sin(rad),
    isMajor,
    isCardinal,
  }
})

// Cardinal degree markers on the outer azimuth rim
const CARDINAL_MARKERS = [
  { label: "000° N", x: 0, y: -392 },
  { label: "090° E", x: 396, y: 3 },
  { label: "180° S", x: 0, y: 398 },
  { label: "270° W", x: -396, y: 3 },
]

// Ambient celestial stardust coordinates
const STARDUST = [
  { x: 110, y: 90, r: 1.1 },
  { x: 240, y: 150, r: 0.8 },
  { x: 760, y: 130, r: 1.2 },
  { x: 890, y: 95, r: 0.9 },
  { x: 80, y: 440, r: 0.8 },
  { x: 920, y: 430, r: 1.0 },
  { x: 130, y: 690, r: 1.1 },
  { x: 290, y: 770, r: 0.8 },
  { x: 710, y: 760, r: 0.9 },
  { x: 870, y: 700, r: 1.0 },
  { x: 320, y: 310, r: 0.7 },
  { x: 680, y: 330, r: 0.8 },
  { x: 500, y: 170, r: 1.0 },
  { x: 500, y: 690, r: 1.0 },
  { x: 210, y: 550, r: 0.8 },
  { x: 790, y: 540, r: 0.8 },
]

function renderStarIcon(iconName: string, className: string) {
  switch (iconName.toLowerCase()) {
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

export function CelestialAstrolabe({ data }: CelestialAstrolabeProps) {
  const layout = React.useMemo(() => computeSkillTreeLayout(data), [data])

  // Component State
  const [selectedNodeId, setSelectedNodeId] = React.useState<string | null>(null)
  const [hoveredNodeId, setHoveredNodeId] = React.useState<string | null>(null)
  const [selectedHouse, setSelectedHouse] = React.useState<CelestialHouse | "all">("all")
  const [activeView, setActiveView] = React.useState<"astrolabe" | "grimoire">("astrolabe")
  const [isMuted, setIsMuted] = React.useState(false)

  // Pan & Zoom Matrix State
  const [transform, setTransform] = React.useState({ x: 0, y: 0, scale: 1 })
  const [isPanning, setIsPanning] = React.useState(false)
  const panStartRef = React.useRef({ x: 0, y: 0, startX: 0, startY: 0 })
  const containerRef = React.useRef<HTMLDivElement>(null)

  // Center coordinate of the celestial astrolabe coordinate dial
  const cx = layout.width / 2
  const cy = layout.height / 2

  // Sync isMutedRef to avoid re-binding native wheel listener on sound toggle
  const isMutedRef = React.useRef(isMuted)
  React.useEffect(() => {
    isMutedRef.current = isMuted
  }, [isMuted])

  // Auto-detect mobile viewport on mount: default to grimoire accordion
  React.useEffect(() => {
    const checkMobile = () => {
      if (typeof window !== "undefined" && window.innerWidth < 768) {
        setActiveView("grimoire")
      }
    }
    checkMobile()
  }, [])

  // Non-passive wheel listener for smooth astrolabe zoom without page scroll jitter
  React.useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleWheelNative = (e: WheelEvent) => {
      if (activeView !== "astrolabe") return
      e.preventDefault()
      const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92
      playBrassClick(isMutedRef.current)
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
  const handleZoomIn = React.useCallback(() => {
    setTransform((prev) => ({ ...prev, scale: Math.min(1.8, prev.scale + 0.15) }))
  }, [])

  const handleZoomOut = React.useCallback(() => {
    setTransform((prev) => ({ ...prev, scale: Math.max(0.6, prev.scale - 0.15) }))
  }, [])

  const handleResetView = React.useCallback(() => {
    setTransform({ x: 0, y: 0, scale: 1 })
  }, [])

  // Mouse Pan Handlers with boundary clamping
  const MAX_PAN = 650
  const handleMouseDown = (e: React.MouseEvent) => {
    if (activeView !== "astrolabe") return
    if ((e.target as HTMLElement).closest("[data-interactive-node]")) return
    setIsPanning(true)
    playBrassClick(isMutedRef.current)
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
    const nextX = Math.max(-MAX_PAN, Math.min(MAX_PAN, panStartRef.current.startX + dx))
    const nextY = Math.max(-MAX_PAN, Math.min(MAX_PAN, panStartRef.current.startY + dy))
    setTransform((prev) => ({
      ...prev,
      x: nextX,
      y: nextY,
    }))
  }

  const handleMouseUp = () => {
    setIsPanning(false)
  }

  // Touch Pan Handlers with boundary clamping
  const handleTouchStart = (e: React.TouchEvent) => {
    if (activeView !== "astrolabe" || e.touches.length !== 1) return
    if ((e.target as HTMLElement).closest("[data-interactive-node]")) return
    setIsPanning(true)
    playBrassClick(isMutedRef.current)
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
    const nextX = Math.max(-MAX_PAN, Math.min(MAX_PAN, panStartRef.current.startX + dx))
    const nextY = Math.max(-MAX_PAN, Math.min(MAX_PAN, panStartRef.current.startY + dy))
    setTransform((prev) => ({
      ...prev,
      x: nextX,
      y: nextY,
    }))
  }

  const handleTouchEnd = () => {
    setIsPanning(false)
  }

  // Selected Node & Adjacency Hierarchy for Observation Lens
  const selectedNode = selectedNodeId ? layout.nodeMap.get(selectedNodeId) || null : null
  const parents = selectedNodeId ? layout.parentsMap.get(selectedNodeId) || [] : []
  const childrenNodes = selectedNodeId ? layout.childrenMap.get(selectedNodeId) || [] : []

  // Ancestor & Descendant sets for hovered node highlighting
  const ancestorNodeIds = React.useMemo(() => {
    return hoveredNodeId ? getAncestorNodeIds(hoveredNodeId, layout.parentsMap) : new Set<string>()
  }, [hoveredNodeId, layout.parentsMap])

  const descendantNodeIds = React.useMemo(() => {
    return hoveredNodeId ? getDescendantNodeIds(hoveredNodeId, layout.childrenMap) : new Set<string>()
  }, [hoveredNodeId, layout.childrenMap])

  // Select node action with audio chime
  const handleSelectNode = React.useCallback(
    (nodeId: string) => {
      playStarChime(isMutedRef.current)
      setSelectedNodeId(nodeId)
    },
    []
  )

  // Star hover handler with tactile click (suppressed during panning drag)
  const handleHoverNode = React.useCallback(
    (nodeId: string | null) => {
      if (isPanning) return
      if (nodeId && nodeId !== hoveredNodeId) {
        playBrassClick(isMutedRef.current)
      }
      setHoveredNodeId(nodeId)
    },
    [hoveredNodeId, isPanning]
  )

  return (
    <div className="w-full flex flex-col gap-6 relative">
      {/* Floating Astrolabe HUD Controller */}
      <AstrolabeHud
        zoom={transform.scale}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetView={handleResetView}
        selectedHouse={selectedHouse}
        onSelectHouse={setSelectedHouse}
        houses={data.categories}
        activeView={activeView}
        onToggleView={setActiveView}
        isMuted={isMuted}
        onToggleMute={() => setIsMuted((prev) => !prev)}
      />

      {/* Screen Reader Semantic Fallback for WCAG AAA Accessibility */}
      <ol className="sr-only" aria-label="Celestial Astrolabe Hierarchy">
        {layout.nodes.map((node) => (
          <li key={node.id}>
            <h4>
              {node.label} (Tier {node.tier}, House: {node.category}, Status: {node.status}
              {node.magnitude ? `, Magnitude: ${node.magnitude}` : ""})
            </h4>
            <p>{node.description}</p>
            {node.skills && <p>Skills: {node.skills.join(", ")}</p>}
            {node.linkedProject && (
              <p>
                Linked Project Sigil: {node.linkedProject.title} ({node.linkedProject.url})
              </p>
            )}
          </li>
        ))}
      </ol>

      {/* Viewport: Interactive 2.5D Celestial Astrolabe Canvas */}
      {activeView === "astrolabe" ? (
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
          className={`relative w-full h-[680px] md:h-[760px] rounded-2xl bg-black/60 border border-white/10 overflow-hidden select-none backdrop-blur-md shadow-2xl transition-colors ${
            isPanning ? "cursor-grabbing" : "cursor-grab"
          }`}
          role="region"
          aria-label="Celestial Astrolabe Canvas"
        >
          {/* Radial Center Starlight Vignette */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at center, rgba(74, 143, 255, 0.08) 0%, rgba(229, 184, 105, 0.03) 45%, rgba(0, 0, 0, 0.75) 100%)",
            }}
          />

          {/* Coordinate Grid Matrix Backdrop */}
          <div
            className="absolute inset-0 opacity-[0.035] pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(229,184,105,0.6) 1px, transparent 0)",
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
              {/* Conduit Traveling Pulse Keyframe Animation */}
              <style>
                {`
                  @keyframes celestialConduitFlow {
                    from { stroke-dashoffset: 40; }
                    to { stroke-dashoffset: 0; }
                  }
                  .animate-celestial-flow {
                    animation: celestialConduitFlow 2.8s linear infinite;
                  }
                  @media (prefers-reduced-motion: reduce) {
                    .animate-celestial-flow {
                      animation: none;
                    }
                  }
                `}
              </style>

              {/* Filament Conduit Glow Filter */}
              <filter id="astrolabe-filament-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Radial Center Glow */}
              <radialGradient id="astrolabe-central-aether" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#4A8FFF" stopOpacity="0.14" />
                <stop offset="60%" stopColor="#FFD95A" stopOpacity="0.04" />
                <stop offset="100%" stopColor="transparent" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Ambient Background Stardust Points */}
            <g className="astrolabe-stardust pointer-events-none">
              {STARDUST.map((dot, idx) => (
                <circle
                  key={idx}
                  cx={dot.x}
                  cy={dot.y}
                  r={dot.r}
                  fill="#FFF3B0"
                  opacity="0.35"
                />
              ))}
            </g>

            {/* --- Celestial Astrolabe Dial Backdrop (cx: 500, cy: 420) --- */}
            <g transform={`translate(${cx}, ${cy})`} className="pointer-events-none select-none">
              {/* Radial Center Aether Fill */}
              <circle r="380" fill="url(#astrolabe-central-aether)" />

              {/* Outer Azimuth Degree Border Rings */}
              <circle
                r="380"
                fill="none"
                stroke="#E5B869"
                strokeWidth="1.2"
                opacity="0.45"
              />
              <circle
                r="374"
                fill="none"
                stroke="#E5B869"
                strokeWidth="0.75"
                strokeDasharray="2 4"
                opacity="0.3"
              />
              <circle
                r="366"
                fill="none"
                stroke="#E5B869"
                strokeWidth="0.5"
                opacity="0.2"
              />

              {/* 72 Azimuth Graduation Tick Marks */}
              {AZIMUTH_TICKS.map((t) => (
                <line
                  key={t.deg}
                  x1={t.x1}
                  y1={t.y1}
                  x2={t.x2}
                  y2={t.y2}
                  stroke="#E5B869"
                  strokeWidth={t.isCardinal ? "1.5" : t.isMajor ? "1.0" : "0.6"}
                  opacity={t.isCardinal ? 0.75 : t.isMajor ? 0.5 : 0.3}
                />
              ))}

              {/* Cardinal Azimuth Degree Labels */}
              {CARDINAL_MARKERS.map((m) => (
                <text
                  key={m.label}
                  x={m.x}
                  y={m.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#E5B869"
                  opacity="0.5"
                  className="text-[9px] font-mono tracking-widest uppercase"
                >
                  {m.label}
                </text>
              ))}

              {/* Meridian Arm & Equinoctial Coordinate Axes */}
              <line
                x1="0"
                y1="-380"
                x2="0"
                y2="380"
                stroke="#E5B869"
                strokeWidth="0.75"
                strokeDasharray="4 6"
                opacity="0.2"
              />
              <line
                x1="-380"
                y1="0"
                x2="380"
                y2="0"
                stroke="#E5B869"
                strokeWidth="0.75"
                strokeDasharray="4 6"
                opacity="0.2"
              />

              {/* --- Counter-Rotating Reticle Rings --- */}
              {/* Ring 1: Clockwise Outer Reticle (32s infinite rotation) */}
              <g
                className="animate-astrolabe-orbit-cw motion-reduce:animate-none"
                style={{ transformOrigin: "0 0", transformBox: "view-box" }}
              >
                <circle
                  r="300"
                  fill="none"
                  stroke="#E5B869"
                  strokeWidth="1"
                  strokeDasharray="6 10"
                  opacity="0.3"
                />
                <circle
                  r="230"
                  fill="none"
                  stroke="#E5B869"
                  strokeWidth="0.75"
                  strokeDasharray="16 8 4 8"
                  opacity="0.22"
                />
                {/* 4 Quadrant astrolabe pointers */}
                <polygon points="0,-300 -6,-288 6,-288" fill="#E5B869" opacity="0.6" />
                <polygon points="300,0 288,-6 288,6" fill="#E5B869" opacity="0.6" />
                <polygon points="0,300 -6,288 6,288" fill="#E5B869" opacity="0.6" />
                <polygon points="-300,0 -288,-6 -288,6" fill="#E5B869" opacity="0.6" />
                {/* Tilted celestial coordinate ellipse */}
                <ellipse
                  rx="240"
                  ry="205"
                  fill="none"
                  stroke="#4A8FFF"
                  strokeWidth="0.75"
                  strokeDasharray="10 8"
                  opacity="0.2"
                />
              </g>

              {/* Ring 2: Counter-Clockwise Inner Reticle (24s infinite rotation) */}
              <g
                className="animate-astrolabe-orbit-ccw motion-reduce:animate-none"
                style={{ transformOrigin: "0 0", transformBox: "view-box" }}
              >
                <circle
                  r="160"
                  fill="none"
                  stroke="#E5B869"
                  strokeWidth="0.8"
                  strokeDasharray="8 6"
                  opacity="0.3"
                />
                <circle
                  r="100"
                  fill="none"
                  stroke="#4AFFB4"
                  strokeWidth="0.75"
                  strokeDasharray="4 6"
                  opacity="0.25"
                />
                {/* Inner rete sighting crosshair */}
                <line
                  x1="-160"
                  y1="0"
                  x2="160"
                  y2="0"
                  stroke="#E5B869"
                  strokeWidth="0.75"
                  strokeDasharray="4 4"
                  opacity="0.25"
                />
                <line
                  x1="0"
                  y1="-160"
                  x2="0"
                  y2="160"
                  stroke="#E5B869"
                  strokeWidth="0.75"
                  strokeDasharray="4 4"
                  opacity="0.25"
                />
                {/* Solstice & Equinox sighting diamond jewels */}
                <polygon
                  points="0,-160 -4,-152 0,-144 4,-152"
                  fill="#FFD95A"
                  opacity="0.5"
                />
                <polygon
                  points="0,160 -4,152 0,144 4,152"
                  fill="#FFD95A"
                  opacity="0.5"
                />
                <polygon
                  points="-160,0 -152,-4 -144,0 -152,4"
                  fill="#4AFFB4"
                  opacity="0.5"
                />
                <polygon
                  points="160,0 152,-4 144,0 152,4"
                  fill="#4AFFB4"
                  opacity="0.5"
                />
              </g>

              {/* Center Axle / Sighting Pivot */}
              <circle
                r="10"
                fill="#0a0a0f"
                stroke="#E5B869"
                strokeWidth="1.5"
                opacity="0.85"
              />
              <circle
                r="3.5"
                fill="#4AFFB4"
                opacity="0.9"
                style={{ filter: "drop-shadow(0 0 6px #4AFFB4)" }}
              />
            </g>

            {/* --- Conduit Paths Layer --- */}
            <g className="conduits-layer">
              {layout.edges.map((edge) => {
                const isAncestor =
                  hoveredNodeId !== null &&
                  ancestorNodeIds.has(edge.from) &&
                  (ancestorNodeIds.has(edge.to) || edge.to === hoveredNodeId)

                const isDescendant =
                  hoveredNodeId !== null &&
                  (edge.from === hoveredNodeId || descendantNodeIds.has(edge.from)) &&
                  descendantNodeIds.has(edge.to)

                const isHighlighted = isAncestor || isDescendant

                const isDimmed =
                  (hoveredNodeId !== null && !isHighlighted) ||
                  (selectedHouse !== "all" &&
                    edge.fromNode.category !== selectedHouse &&
                    edge.toNode.category !== selectedHouse)

                const isMasteredPath = edge.status === "mastered"
                const isInProgressPath = edge.status === "in-progress"

                const strokeColor = isAncestor
                  ? "#4AFFB4"
                  : isDescendant
                  ? "#FFD95A"
                  : isMasteredPath
                  ? "#4AFFB4"
                  : isInProgressPath
                  ? "rgba(255, 217, 90, 0.7)"
                  : "rgba(255, 255, 255, 0.12)"

                const glowColor = isAncestor
                  ? "#4AFFB4"
                  : isDescendant
                  ? "#FFD95A"
                  : isMasteredPath
                  ? "#4AFFB4"
                  : "#FFD95A"

                const hasDualLayer = isMasteredPath || isInProgressPath || isHighlighted

                return (
                  <g
                    key={`${edge.from}->${edge.to}`}
                    className={`transition-opacity duration-300 ${
                      isDimmed ? "opacity-15" : "opacity-100"
                    }`}
                  >
                    {/* Underlying Ambient Glow Path */}
                    {hasDualLayer && (
                      <path
                        d={edge.path}
                        fill="none"
                        stroke={glowColor}
                        strokeWidth={isHighlighted ? 6 : isMasteredPath ? 4 : 3}
                        strokeLinecap="round"
                        opacity={isHighlighted ? 0.5 : isMasteredPath ? 0.3 : 0.18}
                        filter="url(#astrolabe-filament-glow)"
                      />
                    )}

                    {/* Glowing Starlight Pulse Path */}
                    <path
                      d={edge.path}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth={isHighlighted ? 2.5 : isMasteredPath ? 2 : 1.25}
                      strokeLinecap="round"
                      strokeDasharray={
                        isMasteredPath || isHighlighted
                          ? "8 12"
                          : isInProgressPath
                          ? "4 6"
                          : undefined
                      }
                      className={`transition-all duration-300 ${
                        isMasteredPath || isHighlighted ? "animate-celestial-flow" : ""
                      }`}
                    />
                  </g>
                )
              })}
            </g>

            {/* --- Star Nodes Layer --- */}
            <g className="stars-layer">
              {layout.nodes.map((node) => {
                const isSelected = selectedNodeId === node.id
                const isHovered = hoveredNodeId === node.id
                const houseDef = data.categories.find((c) => c.id === node.category)
                const houseColor = houseDef?.color || "#4AFFB4"
                const radius = node.radius || 36

                const isDimmed =
                  selectedHouse !== "all" && node.category !== selectedHouse

                return (
                  <g
                    key={node.id}
                    data-interactive-node="true"
                    transform={`translate(${node.x}, ${node.y})`}
                    onClick={() => handleSelectNode(node.id)}
                    onMouseEnter={() => handleHoverNode(node.id)}
                    onMouseLeave={() => handleHoverNode(null)}
                    onFocus={() => handleHoverNode(node.id)}
                    onBlur={() => handleHoverNode(null)}
                    tabIndex={0}
                    role="button"
                    aria-label={`${node.label}, Tier ${node.tier}, House: ${
                      houseDef?.label || node.category
                    }, Status: ${node.status}${
                      node.linkedProject
                        ? `, Linked Project Sigil: ${node.linkedProject.title}`
                        : ""
                    }`}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        handleSelectNode(node.id)
                      }
                    }}
                    className={`cursor-pointer transition-all duration-300 outline-none ${
                      isDimmed ? "opacity-20" : "opacity-100"
                    }`}
                  >
                    {/* Halo Rings Scaled by Magnitude */}
                    {(node.status === "mastered" || isHovered || isSelected) && (
                      <circle
                        r={radius + 10}
                        fill="none"
                        stroke={houseColor}
                        strokeWidth={isHovered || isSelected ? 1.5 : 1}
                        strokeDasharray={isHovered ? "4 4" : undefined}
                        opacity={isHovered || isSelected ? 0.8 : 0.3}
                        className="transition-all duration-300"
                      />
                    )}

                    {(isHovered || isSelected) && (
                      <circle
                        r={radius + 18}
                        fill="none"
                        stroke={houseColor}
                        strokeWidth="0.75"
                        strokeDasharray="2 4"
                        opacity="0.45"
                        className="animate-pulse"
                      />
                    )}

                    {/* Main Star Body Circle */}
                    <circle
                      r={radius}
                      fill={
                        node.status === "mastered"
                          ? "#071210"
                          : node.status === "in-progress"
                          ? "#141006"
                          : "#0d0d12"
                      }
                      stroke={
                        isSelected
                          ? "#FFFFFF"
                          : isHovered
                          ? houseColor
                          : node.status === "mastered"
                          ? houseColor
                          : node.status === "in-progress"
                          ? "rgba(255, 217, 90, 0.6)"
                          : "rgba(255, 255, 255, 0.15)"
                      }
                      strokeWidth={isSelected ? 2.5 : isHovered ? 2 : 1.5}
                      className="transition-all duration-300"
                      style={{
                        filter:
                          isHovered || isSelected || node.status === "mastered"
                            ? `drop-shadow(0 0 12px ${houseColor}88)`
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
                        {renderStarIcon(
                          node.icon,
                          `size-5 ${
                            node.status === "mastered"
                              ? "text-white"
                              : node.status === "in-progress"
                              ? "text-amber-300"
                              : "text-white/35"
                          }`
                        )}
                      </div>
                    </foreignObject>

                    {/* Status Badge in Upper-Right */}
                    {node.status === "mastered" && (
                      <g transform={`translate(${radius * 0.65}, ${-radius * 0.65})`}>
                        <circle
                          r="9"
                          fill="#071210"
                          stroke="#4AFFB4"
                          strokeWidth="1"
                        />
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
                      <g transform={`translate(${radius * 0.65}, ${-radius * 0.65})`}>
                        <circle
                          r="9"
                          fill="#141006"
                          stroke="#FFD95A"
                          strokeWidth="1"
                        />
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
                      <g transform={`translate(${radius * 0.65}, ${-radius * 0.65})`}>
                        <circle
                          r="9"
                          fill="#0d0d12"
                          stroke="rgba(255, 255, 255, 0.2)"
                          strokeWidth="1"
                        />
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

                    {/* Project Sigil Marker Jewel on Nodes with linkedProject */}
                    {node.linkedProject && (
                      <g
                        transform={`translate(${-radius * 0.65}, ${-radius * 0.65})`}
                        aria-label={`Project Sigil: ${node.linkedProject.title}`}
                      >
                        <title>{`Project Sigil: ${node.linkedProject.title}`}</title>
                        <polygon
                          points="0,-7 6,0 0,7 -6,0"
                          fill="#1c1608"
                          stroke="#FFD95A"
                          strokeWidth="1.2"
                          style={{ filter: "drop-shadow(0 0 5px #FFD95A)" }}
                        />
                        <circle r="2" fill="#FFF3B0" />
                      </g>
                    )}

                    {/* Star Title Label */}
                    <text
                      y={radius + 18}
                      textAnchor="middle"
                      className={`text-[11px] font-sans font-medium tracking-wide transition-colors ${
                        isSelected || isHovered
                          ? "fill-white font-semibold"
                          : "fill-white/80"
                      }`}
                    >
                      {node.label}
                    </text>

                    {/* Celestial House Subtitle */}
                    <text
                      y={radius + 32}
                      textAnchor="middle"
                      fill={houseColor}
                      opacity="0.8"
                      className="text-[9px] font-mono uppercase tracking-widest"
                    >
                      {houseDef?.label || node.category}
                    </text>
                  </g>
                )
              })}
            </g>
          </svg>

          {/* Bottom Telemetry Overlay */}
          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[10px] font-mono text-white/40 pointer-events-none select-none">
            <span className="hidden sm:inline">
              CELESTIAL ASTROLABE // AZIMUTH 360° • DRAG TO PAN • SCROLL TO ZOOM
            </span>
            <span className="sm:hidden">DRAG // PINCH TO PAN & ZOOM</span>
            <span>POLARIS ALIGNMENT: 0.00°</span>
          </div>
        </div>
      ) : (
        /* Grimoire Accordion View (Mobile / Reading View) */
        <AstrolabeRoadmapAccordion
          nodes={layout.nodes}
          houses={data.categories}
          onSelectNode={handleSelectNode}
          isMuted={isMuted}
        />
      )}

      {/* Observation Lens Slide-over Inspector */}
      <AstrolabeInspector
        node={selectedNode}
        houses={data.categories}
        onClose={() => setSelectedNodeId(null)}
        onSelectNode={handleSelectNode}
        parents={parents}
        childrenNodes={childrenNodes}
        nodeMap={layout.nodeMap}
        isMuted={isMuted}
      />
    </div>
  )
}
