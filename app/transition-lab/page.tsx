"use client"

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Play, Pause, RotateCcw, Sliders, Zap, Sparkles, Layers, Eye, Compass, Info, CheckCircle2, ChevronRight, Bookmark } from "lucide-react"
import { GlassCard } from "@/components/ui/GlassCard"
import { useSiteLoaderStore } from "@/store/useSiteLoaderStore"

type ConceptId = "concept-1" | "concept-2" | "concept-3"

interface ConceptDef {
  id: ConceptId
  number: number
  title: string
  subtitle: string
  tag: string
  isRecommended?: boolean
  description: string
  keyMoments: { time: number; label: string; desc: string }[]
}

const CONCEPTS: ConceptDef[] = [
  {
    id: "concept-1",
    number: 1,
    title: "Singularity Implosion & Arcane Handoff",
    subtitle: "Inward singularity collapse → directed energy beam → 3D HexCore magnetic assembly",
    tag: "RECOMMENDED DIRECTION",
    isRecommended: true,
    description: "The 2D runic rings collapse into an ultra-dense photon point at the preloader center, then fire a high-voltage particle arc directly into the 3D Hero tile. The HexCore plasma heart flares with bloom, magnetically snapping the 54 pyramids together and sending a radial ripple across the Bento grid.",
    keyMoments: [
      { time: 0, label: "Implosion Trigger", desc: "2D runic rings accelerate and collapse inward (0-240ms)" },
      { time: 220, label: "Handoff Beam", desc: "High-energy particle beam connects center to 3D Hero tile (200-420ms)" },
      { time: 320, label: "Core Flare", desc: "HexCore plasma heart blooms from 1.4 to 4.5 glow intensity (300-600ms)" },
      { time: 420, label: "54 Pyramids Fly-In", desc: "Pyramids magnetically snap into 3x3 Rubik shell via expo.out (350-750ms)" },
      { time: 520, label: "Bento Radial Wave", desc: "Surrounding glass tiles ignite borders and lift into place (440-800ms)" }
    ]
  },
  {
    id: "concept-2",
    number: 2,
    title: "Planar Runic Shockwave & Bento Ripple",
    subtitle: "Superheated rune burst → expanding circular blast front → per-tile spatial wake-up",
    tag: "HIGH ENERGY / IMPACT",
    description: "The inscribed runes burst into superheated plasma; a planar refractive shockwave detonates radially outwards from the center. Each Bento tile detects when the expanding wavefront crosses its bounding box, instantly popping upward and illuminating its emerald border.",
    keyMoments: [
      { time: 0, label: "Glyph Overcharge", desc: "Orbit track runes flash to peak white-gold luminance (0-180ms)" },
      { time: 200, label: "Shockwave Detonation", desc: "Planar refractive ring expands radially across screen (180-600ms)" },
      { time: 300, label: "Hero Center Strike", desc: "Front crosses 3D core, triggering 4x rapid Rubik spin (260-580ms)" },
      { time: 420, label: "Bento Tile Intersects", desc: "Tiles pop (scale: 1.05) and scanlines trigger as wave passes (300-700ms)" },
      { time: 600, label: "Wave Dissipation", desc: "Shockwave reaches edges and dissolves into ambient glow (600-800ms)" }
    ]
  },
  {
    id: "concept-3",
    number: 3,
    title: "Dimensional Phase-In / Holographic Unfold",
    subtitle: "2D-to-3D gimbal alignment → depth fog dissolve → origami blooming flower unfold",
    tag: "ARCHITECTURAL & SERENE",
    description: "The 2D gyroscope gimbals tilt to align with the 3D camera Euler angles. The dark canvas dissolves through radial depth-slicing fog, revealing the 54 pyramids unfolding like an origami lotus from the core while bento tiles crystallize from liquid glass.",
    keyMoments: [
      { time: 0, label: "Gimbal Slerp", desc: "2D pitch/yaw tilts to match 3D concentric ring orientation (0-300ms)" },
      { time: 240, label: "Depth Fog Dissolve", desc: "Background dissolves via radial depth gradient (240-550ms)" },
      { time: 380, label: "Origami Lotus Unfold", desc: "54 pyramids blossom outwards from core center (360-750ms)" },
      { time: 500, label: "Glass Crystallization", desc: "Bento cards de-blur from 12px blur with gentle gravitational settle (450-800ms)" },
      { time: 700, label: "Harmonic Lock", desc: "Pyramid seams lock into place with acoustic dampening (650-800ms)" }
    ]
  }
]

interface MockTile {
  id: string
  title: string
  subtitle: string
  category: string
  colSpan: string
  rowSpan: string
  isHero?: boolean
}

const MOCK_TILES: MockTile[] = [
  { id: "hero-3d", title: "HexCore 3D Engine", subtitle: "54-Pyramid Rubik Matrix", category: "CORE ARTIFACT", colSpan: "col-span-12 md:col-span-6 xl:col-span-5", rowSpan: "row-span-4", isHero: true },
  { id: "exp", title: "Lead Creative Technologist", subtitle: "Autonomous & Spatial Systems", category: "EXPERIENCE", colSpan: "col-span-12 md:col-span-6 xl:col-span-4", rowSpan: "row-span-2" },
  { id: "proj-1", title: "Arcane Neural Shader", subtitle: "WebGL 2.0 PBR Engine", category: "PROJECT", colSpan: "col-span-6 md:col-span-3 xl:col-span-3", rowSpan: "row-span-2" },
  { id: "skills", title: "GPU Shaders / R3F / GSAP", subtitle: "Full-Stack Animation Matrix", category: "ARSENAL", colSpan: "col-span-6 md:col-span-3 xl:col-span-4", rowSpan: "row-span-2" },
  { id: "stats", title: "99.8% 60FPS Benchmark", subtitle: "Zero-GC Frame Allocations", category: "METRICS", colSpan: "col-span-6 md:col-span-3 xl:col-span-3", rowSpan: "row-span-2" },
  { id: "terminal", title: "Arcane Command CLI", subtitle: "Type 'ignite' or 'shatter'", category: "INTERACTIVE", colSpan: "col-span-12 md:col-span-6 xl:col-span-5", rowSpan: "row-span-2" },
]

export default function TransitionLabPage() {
  const [activeConcept, setActiveConcept] = useState<ConceptId>("concept-1")
  const [progressMs, setProgressMs] = useState<number>(0) // 0 to 800ms
  const [isPlaying, setIsPlaying] = useState<boolean>(true)
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1.0)
  const [showTelemetry, setShowTelemetry] = useState<boolean>(true)

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const heroCardRef = useRef<HTMLDivElement | null>(null)
  const gridContainerRef = useRef<HTMLDivElement | null>(null)
  const animFrameRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number | null>(null)

  // Force bypass global site loader store on lab mount
  useEffect(() => {
    useSiteLoaderStore.getState().forceComplete()
  }, [])

  const currentConceptDef = useMemo(() => {
    return CONCEPTS.find(c => c.id === activeConcept) || CONCEPTS[0]
  }, [activeConcept])

  // Reset and play transition
  const handleReplay = useCallback(() => {
    setProgressMs(0)
    setIsPlaying(true)
    lastTimeRef.current = performance.now()
  }, [])

  const jumpToTime = useCallback((ms: number) => {
    setProgressMs(ms)
    setIsPlaying(false)
  }, [])

  // Animation Loop
  useEffect(() => {
    const loop = (now: number) => {
      if (lastTimeRef.current === null) lastTimeRef.current = now
      const delta = (now - lastTimeRef.current) * speedMultiplier
      lastTimeRef.current = now

      if (isPlaying) {
        setProgressMs((prev) => {
          const next = prev + delta
          if (next >= 850) {
            setIsPlaying(false)
            return 850
          }
          return next
        })
      }

      animFrameRef.current = requestAnimationFrame(loop)
    }

    animFrameRef.current = requestAnimationFrame(loop)
    return () => {
      if (animFrameRef.current !== null) cancelAnimationFrame(animFrameRef.current)
    }
  }, [isPlaying, speedMultiplier])

  // Canvas Drawing for the 3 Concepts
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const rect = canvas.getBoundingClientRect()
    const w = rect.width
    const h = rect.height
    if (w === 0 || h === 0) return

    if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, w, h)

    const cx = w / 2
    const cy = h / 2
    const timeSec = progressMs / 1000

    // Get exact Hero Tile screen coordinates for directed trajectory beam
    let heroX = w * 0.22
    let heroY = h * 0.35
    if (heroCardRef.current && gridContainerRef.current) {
      const heroRect = heroCardRef.current.getBoundingClientRect()
      const containerRect = gridContainerRef.current.getBoundingClientRect()
      heroX = heroRect.left + heroRect.width / 2 - containerRect.left
      heroY = heroRect.top + heroRect.height / 2 - containerRect.top
    }

    if (activeConcept === "concept-1") {
      // ══════════════════════════════════════════════════════════════
      // CONCEPT 1: SINGULARITY IMPLOSION & ARCANE HANDOFF
      // ══════════════════════════════════════════════════════════════
      
      // 1. Inward collapsing runic rings (0 - 280ms)
      const collapseP = Math.min(1, progressMs / 280)
      const ringScale = Math.max(0.01, 1 - Math.pow(collapseP, 2.2))
      const ringAlpha = Math.max(0, 1 - collapseP * 1.05)

      if (ringAlpha > 0.01) {
        ctx.save()
        ctx.translate(cx, cy)
        ctx.rotate(timeSec * 10.0) // Hyper-spin
        
        // Counter-rotating outer emerald ring
        ctx.beginPath()
        ctx.arc(0, 0, 140 * ringScale, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(74, 255, 180, ${ringAlpha * 0.9})`
        ctx.lineWidth = 3 * ringScale
        ctx.shadowColor = "#4AFFB4"
        ctx.shadowBlur = 20 * ringScale
        ctx.stroke()

        // Inner gold ring
        ctx.beginPath()
        ctx.arc(0, 0, 95 * ringScale, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(255, 232, 117, ${ringAlpha * 0.95})`
        ctx.lineWidth = 2.5 * ringScale
        ctx.shadowColor = "#FFE875"
        ctx.shadowBlur = 18 * ringScale
        ctx.stroke()

        // Inward suction particles
        const pCount = 36
        for (let i = 0; i < pCount; i++) {
          const ang = (i / pCount) * Math.PI * 2 + timeSec * 6
          const dist = (100 + Math.sin(ang * 4 + timeSec * 12) * 40) * ringScale
          const px = Math.cos(ang) * dist
          const py = Math.sin(ang) * dist
          ctx.beginPath()
          ctx.arc(px, py, 2.5 * ringScale, 0, Math.PI * 2)
          ctx.fillStyle = i % 2 === 0 ? "#FFE875" : "#4AFFB4"
          ctx.shadowColor = i % 2 === 0 ? "#FFE875" : "#4AFFB4"
          ctx.shadowBlur = 8
          ctx.fill()
        }
        ctx.restore()
      }

      // 2. Ultra-Dense Photon Singularity Diamond (0 - 340ms)
      const diamondAlpha = Math.max(0, 1 - (progressMs - 160) / 160)
      if (diamondAlpha > 0) {
        const dScale = progressMs < 200 ? 1 + (progressMs / 200) * 1.5 : Math.max(0.1, 2.5 - (progressMs - 200) / 50)
        ctx.save()
        ctx.translate(cx, cy)
        ctx.rotate(Math.PI / 4 + timeSec * 10)
        ctx.fillStyle = "#FFFFFF"
        ctx.shadowColor = "#FFE875"
        ctx.shadowBlur = 35
        ctx.fillRect(-14 * dScale, -14 * dScale, 28 * dScale, 28 * dScale)
        ctx.restore()
      }

      // 3. High-Velocity Directed Energy Beam (180 - 480ms)
      if (progressMs >= 180 && progressMs <= 500) {
        const beamP = Math.min(1, (progressMs - 180) / 240)
        const beamAlpha = beamP < 0.25 ? beamP / 0.25 : Math.max(0, 1 - (beamP - 0.25) / 0.75)

        // Arc with electric jitter
        const midX = (cx + heroX) / 2 + Math.sin(timeSec * 45) * 35
        const midY = Math.min(cy, heroY) - 70 + Math.cos(timeSec * 40) * 30

        const currentHeadX = (1 - beamP) * (1 - beamP) * cx + 2 * (1 - beamP) * beamP * midX + beamP * beamP * heroX
        const currentHeadY = (1 - beamP) * (1 - beamP) * cy + 2 * (1 - beamP) * beamP * midY + beamP * beamP * heroY

        // Cyan Outer Glow Arc
        ctx.save()
        ctx.beginPath()
        ctx.moveTo(cx, cy)
        ctx.quadraticCurveTo(midX, midY, currentHeadX, currentHeadY)
        ctx.strokeStyle = `rgba(74, 255, 180, ${beamAlpha * 0.95})`
        ctx.lineWidth = 6
        ctx.shadowColor = "#4AFFB4"
        ctx.shadowBlur = 30
        ctx.stroke()

        // Secondary Gold Electrical Core
        ctx.beginPath()
        ctx.moveTo(cx, cy)
        ctx.quadraticCurveTo(midX, midY, currentHeadX, currentHeadY)
        ctx.strokeStyle = `rgba(255, 232, 117, ${beamAlpha * 0.9})`
        ctx.lineWidth = 3
        ctx.shadowColor = "#FFE875"
        ctx.shadowBlur = 20
        ctx.stroke()

        // White Central Lightning Filament
        ctx.beginPath()
        ctx.moveTo(cx, cy)
        ctx.quadraticCurveTo(midX, midY, currentHeadX, currentHeadY)
        ctx.strokeStyle = `rgba(255, 255, 255, ${beamAlpha})`
        ctx.lineWidth = 1.8
        ctx.stroke()

        // Impact spark cluster at beam head
        ctx.beginPath()
        ctx.arc(currentHeadX, currentHeadY, 12 + Math.sin(timeSec * 60) * 6, 0, Math.PI * 2)
        ctx.fillStyle = "#FFE875"
        ctx.shadowColor = "#FFE875"
        ctx.shadowBlur = 35
        ctx.fill()
        ctx.restore()
      }

      // 4. HexCore Impact Shockwave Corona (280 - 720ms)
      if (progressMs >= 280 && progressMs <= 720) {
        const impactP = (progressMs - 280) / 440
        const impactR = impactP * 280
        const impactAlpha = Math.max(0, 1 - impactP)

        ctx.save()
        ctx.beginPath()
        ctx.arc(heroX, heroY, impactR, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(74, 255, 180, ${impactAlpha * 0.85})`
        ctx.lineWidth = Math.max(1.5, (1 - impactP) * 12)
        ctx.shadowColor = "#4AFFB4"
        ctx.shadowBlur = 30
        ctx.stroke()
        ctx.restore()
      }

    } else if (activeConcept === "concept-2") {
      // ══════════════════════════════════════════════════════════════
      // CONCEPT 2: PLANAR RUNIC SHOCKWAVE & BENTO RIPPLE
      // ══════════════════════════════════════════════════════════════

      // 1. Glyph Overcharge Flash (0 - 200ms)
      if (progressMs <= 220) {
        const flashP = progressMs / 180
        const flashAlpha = flashP < 0.6 ? flashP / 0.6 : 1 - (flashP - 0.6) / 0.4
        ctx.save()
        ctx.translate(cx, cy)
        ctx.beginPath()
        ctx.arc(0, 0, 120, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(255, 232, 117, ${flashAlpha * 0.95})`
        ctx.lineWidth = 6 + flashAlpha * 6
        ctx.shadowColor = "#FFE875"
        ctx.shadowBlur = 40
        ctx.stroke()
        ctx.restore()
      }

      // 2. Expanding Refractive Planar Shockwave Front (180 - 750ms)
      if (progressMs >= 180) {
        const shockP = (progressMs - 180) / 570
        const maxR = Math.hypot(w, h) * 0.85
        const currentR = Math.pow(shockP, 0.7) * maxR
        const waveAlpha = Math.max(0, 1 - shockP)

        // Primary Emerald Shock Wavefront
        ctx.save()
        ctx.beginPath()
        ctx.arc(cx, cy, currentR, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(74, 255, 180, ${waveAlpha * 0.95})`
        ctx.lineWidth = Math.max(2, (1 - shockP) * 14)
        ctx.shadowColor = "#4AFFB4"
        ctx.shadowBlur = 35
        ctx.stroke()

        // Secondary Cyan Refractive Offset Ring
        ctx.beginPath()
        ctx.arc(cx, cy, Math.max(0, currentR - 30), 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(74, 143, 255, ${waveAlpha * 0.7})`
        ctx.lineWidth = 4
        ctx.shadowColor = "#4A8FFF"
        ctx.shadowBlur = 20
        ctx.stroke()

        // Ejected Sparks Along Front
        const sparkN = 45
        for (let i = 0; i < sparkN; i++) {
          const ang = (i / sparkN) * Math.PI * 2 + Math.sin(i * 12)
          const spR = currentR + Math.sin(ang * 8 + timeSec * 15) * 12
          const sx = cx + Math.cos(ang) * spR
          const sy = cy + Math.sin(ang) * spR
          ctx.beginPath()
          ctx.arc(sx, sy, 2 + Math.random() * 2, 0, Math.PI * 2)
          ctx.fillStyle = i % 2 === 0 ? "#4AFFB4" : "#FFE875"
          ctx.globalAlpha = waveAlpha
          ctx.fill()
        }
        ctx.restore()
      }

    } else if (activeConcept === "concept-3") {
      // ══════════════════════════════════════════════════════════════
      // CONCEPT 3: DIMENSIONAL PHASE-IN & HOLOGRAPHIC UNFOLD
      // ══════════════════════════════════════════════════════════════

      // 1. 2D Gimbal Rings Slerp to 3D Pitch/Yaw (0 - 350ms)
      const slerpP = Math.min(1, progressMs / 350)
      const fadeOut = Math.max(0, 1 - (progressMs - 200) / 300)

      if (fadeOut > 0) {
        ctx.save()
        ctx.translate(cx, cy)
        
        const pitch = (1 - slerpP) * 0.9 + slerpP * 0.35
        const yaw = (1 - slerpP) * 0.1 + slerpP * 0.65

        // Ring 1 (Gold/Mint)
        ctx.save()
        ctx.scale(1, Math.max(0.1, Math.cos(timeSec * 2 + pitch)))
        ctx.rotate(timeSec * 1.5)
        ctx.beginPath()
        ctx.arc(0, 0, 110, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(201, 162, 39, ${fadeOut * 0.8})`
        ctx.lineWidth = 2.5
        ctx.shadowColor = "#C9A227"
        ctx.shadowBlur = 15
        ctx.stroke()
        ctx.restore()

        // Ring 2 (Cyan/Blue)
        ctx.save()
        ctx.scale(Math.max(0.1, Math.sin(timeSec * 2 + yaw)), 1)
        ctx.rotate(-timeSec * 1.2)
        ctx.beginPath()
        ctx.arc(0, 0, 75, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(74, 255, 180, ${fadeOut * 0.9})`
        ctx.lineWidth = 2.5
        ctx.shadowColor = "#4AFFB4"
        ctx.shadowBlur = 18
        ctx.stroke()
        ctx.restore()

        ctx.restore()
      }

      // 2. Depth Slicing Radial Fog Dissolve (240 - 650ms)
      if (progressMs >= 240 && progressMs <= 700) {
        const fogP = (progressMs - 240) / 460
        const fogR = fogP * Math.hypot(w, h) * 0.75
        const fogAlpha = Math.max(0, 1 - fogP)

        ctx.save()
        const fogGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, fogR)
        fogGrad.addColorStop(0, `rgba(74, 143, 255, ${fogAlpha * 0.3})`)
        fogGrad.addColorStop(0.5, `rgba(74, 255, 180, ${fogAlpha * 0.2})`)
        fogGrad.addColorStop(1, "rgba(5, 5, 5, 0)")
        ctx.fillStyle = fogGrad
        ctx.fillRect(0, 0, w, h)
        ctx.restore()
      }
    }
  }, [progressMs, activeConcept])

  // Calculate live phase status
  const currentPhaseName = useMemo(() => {
    if (progressMs < 220) return "IMPLOSION / OVERCHARGE"
    if (progressMs < 360) return "ENERGY HANDOFF / FRONT EXPANSION"
    if (progressMs < 500) return "3D HEXCORE DETONATION"
    if (progressMs < 750) return "BENTO RADIAL INDUCTION"
    return "SETTLED / FULLY BOOTED"
  }, [progressMs])

  return (
    <div className="min-h-screen bg-[#050505] text-white font-mono flex flex-col items-center select-none overflow-x-hidden pt-24 pb-16 px-4 md:px-8">
      
      {/* ─────────────────────────────────────────────────────────────
          1. LAB HEADER & CONCEPT SELECTOR MATRIX
          ───────────────────────────────────────────────────────────── */}
      <div className="w-full max-w-[1400px] flex flex-col gap-4 mb-4">
        
        {/* Top Branding & Status */}
        <div className="flex flex-wrap items-center justify-between border-b border-white/10 pb-3 gap-3">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-lume-primary/10 border border-lume-primary/30 flex items-center justify-center text-lume-primary shadow-[0_0_20px_rgba(74,255,180,0.2)]">
              <Zap className="size-5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-sm md:text-base font-bold tracking-wider uppercase text-white/95 flex items-center gap-2">
                Transition Matrix Lab <span className="text-xs text-lume-primary font-normal">// Interactive Preloader ⇄ Bento Simulation</span>
              </h1>
              <p className="text-[10px] text-white/40 tracking-widest uppercase">Lume-Glass Cinematic Engine // R3F + GSAP Choreography</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] tracking-wider px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-white/80">
              TIME: <span className="text-lume-primary font-bold">{Math.round(progressMs)}ms</span> / 800ms
            </span>
            <span className="text-[11px] tracking-wider px-3 py-1 rounded-lg bg-lume-primary/15 border border-lume-primary/40 text-lume-primary font-bold shadow-[0_0_15px_rgba(74,255,180,0.25)]">
              {currentPhaseName}
            </span>
          </div>
        </div>

        {/* 3 Concept Switcher Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {CONCEPTS.map((concept) => {
            const isActive = activeConcept === concept.id
            return (
              <button
                key={concept.id}
                onClick={() => {
                  setActiveConcept(concept.id)
                  handleReplay()
                }}
                className={`p-3.5 rounded-xl text-left border transition-all duration-300 relative overflow-hidden flex flex-col justify-between cursor-pointer ${
                  isActive
                    ? "bg-white/[0.08] border-lume-primary shadow-[0_0_30px_rgba(74,255,180,0.18)] ring-1 ring-lume-primary/60 scale-[1.01]"
                    : "bg-white/[0.02] border-white/10 hover:bg-white/[0.05] hover:border-white/20"
                }`}
              >
                {/* Glow bar for active */}
                {isActive && (
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-lume-primary via-[#FFE875] to-lume-secondary" />
                )}

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-[10px] font-bold tracking-widest px-2 py-0.5 rounded uppercase ${
                      concept.isRecommended
                        ? "bg-lume-primary/20 text-lume-primary border border-lume-primary/40"
                        : "bg-white/10 text-white/70"
                    }`}>
                      Concept 0{concept.number} {concept.isRecommended && "★ RECOMMENDED"}
                    </span>
                    {isActive && <CheckCircle2 className="size-4 text-lume-primary" />}
                  </div>

                  <h3 className="text-xs md:text-sm font-bold text-white mb-1">{concept.title}</h3>
                  <p className="text-[10px] text-white/50 leading-relaxed line-clamp-2">{concept.subtitle}</p>
                </div>
              </button>
            )
          })}
        </div>

        {/* Control Bar: Play / Scrub / Speed / Jump Milestones */}
        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-3 flex flex-col gap-3 backdrop-blur-md">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={handleReplay}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-lume-primary text-black font-bold text-xs hover:brightness-110 active:scale-95 transition-all shadow-[0_0_15px_rgba(74,255,180,0.4)] cursor-pointer"
              >
                <RotateCcw className="size-3.5" />
                Replay Transition
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 text-white text-xs hover:bg-white/15 active:scale-95 transition-all border border-white/10 cursor-pointer"
              >
                {isPlaying ? <Pause className="size-3.5 text-amber-400" /> : <Play className="size-3.5 text-lume-primary" />}
                {isPlaying ? "Pause" : "Resume"}
              </button>

              {/* Speed Multiplier */}
              <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/5 text-[10px]">
                {[
                  { label: "0.25x", val: 0.25 },
                  { label: "0.5x", val: 0.5 },
                  { label: "1.0x", val: 1.0 },
                  { label: "2.0x", val: 2.0 }
                ].map((s) => (
                  <button
                    key={s.label}
                    onClick={() => setSpeedMultiplier(s.val)}
                    className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                      speedMultiplier === s.val
                        ? "bg-white/20 text-white font-bold"
                        : "text-white/40 hover:text-white/80"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Direct Milestone Jump Shortcuts */}
            <div className="flex items-center gap-1.5 text-[10px]">
              <span className="text-white/40 mr-1 flex items-center gap-1">
                <Bookmark className="size-3" /> Jump:
              </span>
              {[
                { label: "0ms (Start)", t: 0 },
                { label: "240ms (Handoff)", t: 240 },
                { label: "360ms (Core Flare)", t: 360 },
                { label: "500ms (Ripple)", t: 500 },
                { label: "800ms (Settled)", t: 800 }
              ].map((m) => (
                <button
                  key={m.label}
                  onClick={() => jumpToTime(m.t)}
                  className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white transition-all cursor-pointer"
                >
                  {m.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowTelemetry(!showTelemetry)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs border transition-all cursor-pointer ${
                showTelemetry ? "bg-lume-primary/10 border-lume-primary/30 text-lume-primary" : "bg-white/5 border-white/10 text-white/50"
              }`}
            >
              <Sliders className="size-3.5" />
              Telemetry HUD
            </button>
          </div>

          {/* Timeline Scrubber Slider */}
          <div className="flex items-center gap-3 w-full">
            <span className="text-[10px] text-white/50 font-mono w-10">0ms</span>
            <input
              type="range"
              min={0}
              max={800}
              value={progressMs}
              onChange={(e) => jumpToTime(Number(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-lume-primary"
            />
            <span className="text-[10px] text-white/50 font-mono w-12 text-right">800ms</span>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. SIMULATION VIEWPORT & BENTO GRID
          ───────────────────────────────────────────────────────────── */}
      <div 
        ref={gridContainerRef}
        className="w-full max-w-[1400px] relative rounded-2xl border border-white/10 bg-black/60 backdrop-blur-2xl p-4 md:p-6 overflow-hidden min-h-[620px] shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
      >
        
        {/* Dynamic Transition Canvas Overlay (Singularity, Beam, Shockwaves) */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none z-30 w-full h-full"
        />

        {/* 2D Loader Dissolving Backdrop (Synchronized to Progress) */}
        {progressMs < 500 && (
          <div
            className="absolute inset-0 bg-[#050505] z-20 pointer-events-none flex flex-col items-center justify-center transition-opacity"
            style={{
              opacity: activeConcept === "concept-1" 
                ? Math.max(0, 1 - (progressMs - 160) / 280)
                : activeConcept === "concept-2"
                ? Math.max(0, 1 - (progressMs - 180) / 320)
                : Math.max(0, 1 - (progressMs - 200) / 300),
              filter: `blur(${Math.min(8, (progressMs / 300) * 8)}px)`
            }}
          >
            {/* Center Gyroscope Preloader Placeholder indicator */}
            <div className="relative flex flex-col items-center gap-3">
              <div className="size-24 rounded-full border border-dashed border-lume-primary/40 animate-spin" />
              <div className="text-[10px] text-white/50 tracking-widest font-mono">
                INITIALIZING RUNIC ENGINE // {Math.min(100, Math.round((progressMs / 250) * 100))}%
              </div>
            </div>
          </div>
        )}

        {/* Simulated Bento Grid */}
        <div className="grid grid-cols-12 auto-rows-[minmax(100px,auto)] gap-3 md:gap-4 relative z-10">
          {MOCK_TILES.map((tile, idx) => {
            let tileOpacity = 1
            let tileY = 0
            let tileScale = 1
            let tileGlow = false

            if (activeConcept === "concept-1") {
              // Hero tile wakes first at 320ms, others radiate out staggered
              if (tile.isHero) {
                if (progressMs < 280) {
                  tileOpacity = 0.2
                  tileScale = 0.90
                  tileY = 20
                } else {
                  const p = Math.min(1, (progressMs - 280) / 320)
                  tileOpacity = 0.2 + p * 0.8
                  tileScale = 0.90 + p * 0.10
                  tileY = 20 * (1 - p)
                  tileGlow = progressMs >= 300 && progressMs <= 620
                }
              } else {
                const staggerDelay = 380 + idx * 45
                if (progressMs < staggerDelay) {
                  tileOpacity = 0
                  tileScale = 0.92
                  tileY = 25
                } else {
                  const p = Math.min(1, (progressMs - staggerDelay) / 350)
                  tileOpacity = p
                  tileScale = 0.92 + p * 0.08
                  tileY = 25 * (1 - p)
                  tileGlow = progressMs >= staggerDelay && progressMs <= staggerDelay + 250
                }
              }
            } else if (activeConcept === "concept-2") {
              // Shockwave intersects: distance from screen center
              const shockwaveArrival = 240 + idx * 55
              if (progressMs < shockwaveArrival) {
                tileOpacity = 0.1
                tileScale = 0.94
                tileY = 15
              } else {
                const p = Math.min(1, (progressMs - shockwaveArrival) / 280)
                tileOpacity = 0.1 + p * 0.9
                tileScale = p < 0.3 ? 0.94 + (p / 0.3) * 0.12 : 1.06 - ((p - 0.3) / 0.7) * 0.06 // Physical Pop
                tileY = 15 * (1 - p)
                tileGlow = progressMs >= shockwaveArrival && progressMs <= shockwaveArrival + 200
              }
            } else if (activeConcept === "concept-3") {
              // Smooth liquid crystallization drop-in
              const crystallizeArrival = 320 + idx * 40
              if (progressMs < crystallizeArrival) {
                tileOpacity = 0
                tileScale = 0.96
                tileY = 12
              } else {
                const p = Math.min(1, (progressMs - crystallizeArrival) / 400)
                tileOpacity = p
                tileScale = 0.96 + p * 0.04
                tileY = 12 * (1 - p)
              }
            }

            return (
              <div
                key={tile.id}
                ref={tile.isHero ? heroCardRef : undefined}
                className={`${tile.colSpan} ${tile.rowSpan} transition-transform duration-75`}
                style={{
                  opacity: tileOpacity,
                  transform: `translateY(${tileY}px) scale(${tileScale})`,
                }}
              >
                <GlassCard
                  className={`h-full p-4 flex flex-col justify-between border transition-all duration-300 ${
                    tileGlow
                      ? "border-lume-primary shadow-[0_0_35px_rgba(74,255,180,0.35)] ring-1 ring-lume-primary/60"
                      : "border-white/10"
                  } ${tile.isHero ? "bg-gradient-to-br from-black/90 via-[#0a0718]/90 to-black/95 min-h-[300px]" : "bg-white/[0.03]"}`}
                >
                  {tile.isHero ? (
                    /* 3D Hero Artifact Simulated Assembly Representation */
                    <div className="h-full flex flex-col justify-between relative overflow-hidden">
                      <div className="flex items-center justify-between z-10">
                        <span className="text-[9px] uppercase tracking-widest text-lume-primary font-bold px-2 py-0.5 rounded bg-lume-primary/10 border border-lume-primary/30">
                          {tile.category}
                        </span>
                        <span className="text-[10px] text-white/60 font-mono">
                          BLOOM: {progressMs >= 300 && progressMs <= 600 ? "4.50 [PEAK FLARE]" : "1.40 [NOMINAL]"}
                        </span>
                      </div>

                      {/* 3D HexCore 54-Pyramid Assembly Visualizer */}
                      <div className="my-auto flex flex-col items-center justify-center relative py-6">
                        {/* Concentric Gimbal Rings */}
                        <div
                          className="size-40 rounded-full border-2 border-lume-primary/40 relative flex items-center justify-center transition-transform duration-100"
                          style={{
                            transform: `rotate(${progressMs * 0.4}deg) scale(${
                              tileGlow ? 1.15 : 1.0
                            })`,
                            boxShadow: tileGlow ? "0 0 45px rgba(74, 255, 180, 0.65)" : "none"
                          }}
                        >
                          <div
                            className="size-28 rounded-full border border-dashed border-[#FFE875]/70 flex items-center justify-center"
                            style={{ transform: `rotate(${-progressMs * 0.6}deg)` }}
                          >
                            {/* Plasma Heart */}
                            <div
                              className="size-12 rounded-xl bg-gradient-to-br from-[#FFE875] to-lume-primary transition-all flex items-center justify-center font-bold text-black text-sm shadow-xl"
                              style={{
                                transform: `rotate(${progressMs * 0.8}deg) scale(${
                                  tileGlow ? 1.35 : 1.0
                                })`,
                                filter: tileGlow ? "drop-shadow(0 0 25px #4AFFB4)" : "none"
                              }}
                            >
                              ᛟ
                            </div>
                          </div>
                        </div>

                        {/* Simulated 54 Pyramids Scattered-to-Assembled Indicators */}
                        <div className="text-[10px] text-white/70 mt-3 font-mono">
                          ASSEMBLY PROGRESS:{" "}
                          <span className="text-lume-primary font-bold">
                            {progressMs < 320
                              ? "0.00 (Zero-G Dispersal)"
                              : `${Math.min(1, ((progressMs - 320) / 400)).toFixed(2)} (Magnetic Lock)`}
                          </span>
                        </div>
                      </div>

                      <div className="z-10">
                        <h4 className="text-sm font-bold text-white">{tile.title}</h4>
                        <p className="text-[11px] text-white/50">{tile.subtitle}</p>
                      </div>
                    </div>
                  ) : (
                    /* Standard Bento Tile Mock */
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] uppercase tracking-widest text-white/40">
                          {tile.category}
                        </span>
                        <div className="size-2 rounded-full bg-white/20" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white/90 mb-0.5">{tile.title}</h4>
                        <p className="text-[10px] text-white/40">{tile.subtitle}</p>
                      </div>
                    </>
                  )}
                </GlassCard>
              </div>
            )
          })}
        </div>

        {/* ─────────────────────────────────────────────────────────────
            3. LIVE TELEMETRY & CHOREOGRAPHY INSPECTOR HUD
            ───────────────────────────────────────────────────────────── */}
        {showTelemetry && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute top-4 right-4 z-40 bg-black/95 border border-white/15 backdrop-blur-2xl rounded-xl p-4 max-w-xs w-full shadow-2xl font-mono text-[10px] space-y-3 pointer-events-auto"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="font-bold text-lume-primary uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="size-3.5" /> Physics Telemetry
              </span>
              <span className="text-white/50">{Math.round(progressMs)}ms</span>
            </div>

            {/* Live Parameter Matrix */}
            <div className="grid grid-cols-2 gap-2 text-[9px] bg-white/[0.03] p-2.5 rounded-lg border border-white/5">
              <div>
                <span className="text-white/40 block">STAGE:</span>
                <span className="text-[#FFE875] font-bold">{currentPhaseName.split(" ")[0]}</span>
              </div>
              <div>
                <span className="text-white/40 block">BLOOM FLARE:</span>
                <span className="text-lume-primary font-bold">
                  {progressMs >= 300 && progressMs <= 600 ? "4.50 PEAK" : "1.40 NOMINAL"}
                </span>
              </div>
              <div>
                <span className="text-white/40 block">3D ASSEMBLY:</span>
                <span className="text-white/90">
                  {progressMs < 320 ? "0.00" : `${Math.min(1, ((progressMs - 320) / 400)).toFixed(2)}`}
                </span>
              </div>
              <div>
                <span className="text-white/40 block">EASING:</span>
                <span className="text-white/90">expo.out</span>
              </div>
            </div>

            {/* Keyframe Timeline Breakdown */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[9px] text-white/50 tracking-wider block font-bold uppercase">
                Active Keyframes (0ms - 800ms)
              </span>
              {currentConceptDef.keyMoments.map((km, i) => {
                const isPassed = progressMs >= km.time
                const isCurrent = progressMs >= km.time && (i === currentConceptDef.keyMoments.length - 1 || progressMs < currentConceptDef.keyMoments[i + 1].time)
                return (
                  <div
                    key={km.label}
                    onClick={() => jumpToTime(km.time)}
                    className={`flex items-start gap-2 p-1.5 rounded-lg transition-all cursor-pointer ${
                      isCurrent
                        ? "bg-lume-primary/15 border border-lume-primary/40 text-white shadow-[0_0_12px_rgba(74,255,180,0.15)]"
                        : isPassed
                        ? "text-white/70 hover:bg-white/5"
                        : "text-white/25 hover:text-white/50"
                    }`}
                  >
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${isCurrent ? "bg-lume-primary text-black" : "bg-white/10"}`}>
                      {km.time}ms
                    </span>
                    <div className="flex-1">
                      <div className="font-bold text-[9px]">{km.label}</div>
                      <div className="text-[8px] text-white/50 leading-tight">{km.desc}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. CONCEPT COMPARISON & RECOMMENDATION SUMMARY
          ───────────────────────────────────────────────────────────── */}
      <div className="w-full max-w-[1400px] mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        {CONCEPTS.map((c) => (
          <div
            key={c.id}
            onClick={() => {
              setActiveConcept(c.id)
              handleReplay()
            }}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              activeConcept === c.id
                ? "bg-white/[0.06] border-lume-primary shadow-[0_0_20px_rgba(74,255,180,0.1)] ring-1 ring-lume-primary/40"
                : "bg-white/[0.02] border-white/10 opacity-70 hover:opacity-100 hover:border-white/20"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold tracking-widest text-lume-primary uppercase">
                Concept 0{c.number}
              </span>
              <span className="text-[9px] text-white/40 tracking-wider font-mono">{c.tag}</span>
            </div>
            <h4 className="text-xs font-bold text-white mb-1.5">{c.title}</h4>
            <p className="text-[11px] text-white/60 leading-relaxed">{c.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
