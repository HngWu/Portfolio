"use client"

import React, { useEffect, useState, useRef, useMemo } from "react"
import { useHoverStore, TileRect } from "@/store/useHoverStore"
import { useViewModeStore } from "@/store/useViewModeStore"

// 24 Elder Futhark runes for the Astrolabe Outer Ring
const ELDER_FUTHARK = [
  "ᚠ", "ᚢ", "ᚦ", "ᚨ", "ᚱ", "ᚲ", "ᚷ", "ᚹ",
  "ᚺ", "ᚾ", "ᛁ", "ᛃ", "ᛇ", "ᛈ", "ᛉ", "ᛊ",
  "ᛏ", "ᛒ", "ᛖ", "ᛗ", "ᛚ", "ᛜ", "ᛞ", "ᛟ",
] as const

// Sacred Alchemical Glyphs for Astrolabe Middle Ring
const MIDDLE_GLYPHS = ["⚝", "☉", "☽", "⊕", "☿", "△", "▽", "⚚"] as const

// Precomputed 8-pointed alchemical star geometry for Middle Ring (r=170)
const STAR_8_POINTS = (() => {
  const pts: string[] = []
  for (let i = 0; i < 16; i++) {
    const deg = (i * 360) / 16
    const rad = (deg * Math.PI) / 180
    const r = i % 2 === 0 ? 180 : 142
    pts.push(`${(Math.cos(rad) * r).toFixed(1)},${(Math.sin(rad) * r).toFixed(1)}`)
  }
  return pts.join(" ")
})()

const SQUARE_1_POINTS = [0, 90, 180, 270]
  .map((deg) => {
    const r = (deg * Math.PI) / 180
    return `${(Math.cos(r) * 170).toFixed(1)},${(Math.sin(r) * 170).toFixed(1)}`
  })
  .join(" ")

const SQUARE_2_POINTS = [45, 135, 225, 315]
  .map((deg) => {
    const r = (deg * Math.PI) / 180
    return `${(Math.cos(r) * 170).toFixed(1)},${(Math.sin(r) * 170).toFixed(1)}`
  })
  .join(" ")

// Accurate spur gear tooth profile generator
function generateGearPath(teeth: number, pitchRadius: number, toothHeight: number): string {
  const points: string[] = []
  const step = (Math.PI * 2) / teeth
  const toothWidthAngle = step * 0.25
  const rootWidthAngle = step * 0.25

  for (let i = 0; i < teeth; i++) {
    const angle = i * step
    const aRoot1 = angle - step * 0.5 + rootWidthAngle * 0.5
    const aTip1 = angle - toothWidthAngle * 0.5
    const aTip2 = angle + toothWidthAngle * 0.5
    const aRoot2 = angle + step * 0.5 - rootWidthAngle * 0.5

    const rRoot = pitchRadius - toothHeight * 0.5
    const rTip = pitchRadius + toothHeight * 0.5

    const x0 = Math.cos(aRoot1) * rRoot
    const y0 = Math.sin(aRoot1) * rRoot
    const x1 = Math.cos(aTip1) * rTip
    const y1 = Math.sin(aTip1) * rTip
    const x2 = Math.cos(aTip2) * rTip
    const y2 = Math.sin(aTip2) * rTip
    const x3 = Math.cos(aRoot2) * rRoot
    const y3 = Math.sin(aRoot2) * rRoot

    if (i === 0) {
      points.push(`M ${x0.toFixed(2)} ${y0.toFixed(2)}`)
    } else {
      points.push(`L ${x0.toFixed(2)} ${y0.toFixed(2)}`)
    }
    points.push(`L ${x1.toFixed(2)} ${y1.toFixed(2)}`)
    points.push(`L ${x2.toFixed(2)} ${y2.toFixed(2)}`)
    points.push(`L ${x3.toFixed(2)} ${y3.toFixed(2)}`)
  }
  points.push("Z")
  return points.join(" ")
}

// Gear 1: Burnished brass gear (18 teeth, pitch radius 90px, tooth height 16px)
const GEAR_1_PATH = generateGearPath(18, 90, 16)
// Gear 2: Titanium gear (12 teeth, pitch radius 54px, tooth height 16px, identical circular pitch ~28.27px)
const GEAR_2_PATH = generateGearPath(12, 54, 16)

// Caliper Vernier rail tick path helpers
function generateHorizontalTicksPath(x1: number, x2: number, y: number, dir: 1 | -1): string {
  const p: string[] = []
  const minX = Math.min(x1, x2)
  const maxX = Math.max(x1, x2)
  if (maxX <= minX) return ""
  const start = Math.ceil(minX / 8) * 8
  const end = Math.floor(maxX / 8) * 8
  for (let x = start; x <= end; x += 8) {
    const isMajor = x % 32 === 0
    const len = isMajor ? 6 : 3
    p.push(`M ${x} ${y} L ${x} ${y + dir * len}`)
  }
  return p.join(" ")
}

function generateVerticalTicksPath(y1: number, y2: number, x: number, dir: 1 | -1): string {
  const p: string[] = []
  const minY = Math.min(y1, y2)
  const maxY = Math.max(y1, y2)
  if (maxY <= minY) return ""
  const start = Math.ceil(minY / 8) * 8
  const end = Math.floor(maxY / 8) * 8
  for (let y = start; y <= end; y += 8) {
    const isMajor = y % 32 === 0
    const len = isMajor ? 6 : 3
    p.push(`M ${x} ${y} L ${x + dir * len} ${y}`)
  }
  return p.join(" ")
}

export function ArcaneBackground() {
  const mode = useViewModeStore((s) => s.mode)
  const hoveredTileId = useHoverStore((s) => s.hoveredTileId)
  const storeHoveredRect = useHoverStore((s) => s.hoveredRect)

  const [rect, setRect] = useState<TileRect | null>(null)
  const [windowSize, setWindowSize] = useState({ width: 1920, height: 1080 })
  const [isCoarsePointer, setIsCoarsePointer] = useState(false)

  // Sync storeHoveredRect to local state
  useEffect(() => {
    setRect(storeHoveredRect)
  }, [storeHoveredRect])

  // Track window resize and fine vs coarse pointer
  useEffect(() => {
    if (typeof window === "undefined") return

    const updateWindowSize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight })
    }
    updateWindowSize()

    const mq = window.matchMedia("(pointer: coarse)")
    setIsCoarsePointer(mq.matches)
    const handlePointerChange = (e: MediaQueryListEvent) => setIsCoarsePointer(e.matches)

    window.addEventListener("resize", updateWindowSize)
    mq.addEventListener("change", handlePointerChange)

    return () => {
      window.removeEventListener("resize", updateWindowSize)
      mq.removeEventListener("change", handlePointerChange)
    }
  }, [])

  // Keep rect accurately anchored during scrolling or layout shifts while hovered
  useEffect(() => {
    if (!hoveredTileId) return

    let rafId: number | null = null

    const updateHoveredPosition = () => {
      if (rafId !== null) return
      rafId = window.requestAnimationFrame(() => {
        rafId = null
        const el = document.querySelector(`[data-id="${hoveredTileId}"]`)
        if (el) {
          const domRect = el.getBoundingClientRect()
          setRect({
            left: domRect.left,
            top: domRect.top,
            width: domRect.width,
            height: domRect.height,
          })
        }
      })
    }

    window.addEventListener("scroll", updateHoveredPosition, { passive: true })
    window.addEventListener("resize", updateHoveredPosition, { passive: true })

    return () => {
      if (rafId !== null) window.cancelAnimationFrame(rafId)
      window.removeEventListener("scroll", updateHoveredPosition)
      window.removeEventListener("resize", updateHoveredPosition)
    }
  }, [hoveredTileId])

  // Retain last known card coordinates for a smooth exit fade without jumping to (0,0)
  const lastRectRef = useRef<TileRect>({ left: 960, top: 540, width: 300, height: 300 })
  if (rect) {
    lastRectRef.current = rect
  }
  const activeRect = rect || lastRectRef.current

  const isHoverActive = Boolean(rect && hoveredTileId && !isCoarsePointer)

  // Card center coordinates
  const cx = activeRect.left + activeRect.width / 2
  const cy = activeRect.top + activeRect.height / 2

  // Precompute Vernier Caliper rail ticks for Deep Dive
  const vernierTicks = useMemo(() => {
    if (!activeRect) return { horizontal: "", vertical: "" }
    const hParts: string[] = []
    const vParts: string[] = []

    // Top rail: 0 to left and right to windowWidth
    hParts.push(generateHorizontalTicksPath(0, activeRect.left, activeRect.top, -1))
    hParts.push(generateHorizontalTicksPath(activeRect.left + activeRect.width, windowSize.width, activeRect.top, -1))

    // Bottom rail: 0 to left and right to windowWidth
    hParts.push(generateHorizontalTicksPath(0, activeRect.left, activeRect.top + activeRect.height, 1))
    hParts.push(generateHorizontalTicksPath(activeRect.left + activeRect.width, windowSize.width, activeRect.top + activeRect.height, 1))

    // Left rail: 0 to top and bottom to windowHeight
    vParts.push(generateVerticalTicksPath(0, activeRect.top, activeRect.left, -1))
    vParts.push(generateVerticalTicksPath(activeRect.top + activeRect.height, windowSize.height, activeRect.left, -1))

    // Right rail: 0 to top and bottom to windowHeight
    vParts.push(generateVerticalTicksPath(0, activeRect.top, activeRect.left + activeRect.width, 1))
    vParts.push(generateVerticalTicksPath(activeRect.top + activeRect.height, windowSize.height, activeRect.left + activeRect.width, 1))

    return {
      horizontal: hParts.filter(Boolean).join(" "),
      vertical: vParts.filter(Boolean).join(" "),
    }
  }, [activeRect, windowSize.width, windowSize.height])

  // Floating Sigils around Quick Pitch hovered card
  const floatingSigils = useMemo(() => {
    return [
      {
        char: "ᛗ",
        x: activeRect.left - 26,
        y: activeRect.top + activeRect.height * 0.22,
        drift: "-6px",
        delay: "0s",
      },
      {
        char: "ᚲ",
        x: activeRect.left + activeRect.width + 16,
        y: activeRect.top + activeRect.height * 0.38,
        drift: "8px",
        delay: "0.6s",
      },
      {
        char: "ᛞ",
        x: activeRect.left - 22,
        y: activeRect.top + activeRect.height * 0.72,
        drift: "-5px",
        delay: "1.2s",
      },
      {
        char: "ᚱ",
        x: activeRect.left + activeRect.width + 18,
        y: activeRect.top + activeRect.height * 0.84,
        drift: "6px",
        delay: "1.8s",
      },
    ]
  }, [activeRect])

  // Hex-rivet anchors at the 4 card corners
  const hexCorners = useMemo(() => {
    return [
      { x: activeRect.left, y: activeRect.top },
      { x: activeRect.left + activeRect.width, y: activeRect.top },
      { x: activeRect.left, y: activeRect.top + activeRect.height },
      { x: activeRect.left + activeRect.width, y: activeRect.top + activeRect.height },
    ]
  }, [activeRect])

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 pointer-events-none z-[-10] overflow-hidden select-none transition-colors duration-700 ${
        mode === "quick" ? "bg-[#060608]" : "bg-[#08090d]"
      }`}
    >
      {/* =========================================================================
          RESTING STATE: Pure Dark Background Patterns
          Zero aggressive blur blobs or distracting movement at rest
          ========================================================================= */}

      {/* Quick Pitch Resting Pattern: Microscopic golden runic star-nodes at 48px pitch (opacity ~2.5%) */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 ${
          mode === "quick" ? "opacity-100" : "opacity-0"
        }`}
      >
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="arcane-stars-pattern" width="48" height="48" patternUnits="userSpaceOnUse">
              <circle cx="24" cy="24" r="0.8" fill="#FFD95A" opacity="0.6" />
              <path d="M 24 22 L 24 26 M 22 24 L 26 24" stroke="#E8A838" strokeWidth="0.5" opacity="0.35" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#arcane-stars-pattern)" opacity="0.025" />
        </svg>
      </div>

      {/* Deep Dive Resting Pattern: Dark obsidian hairline grid at 36px pitch with micro-screws (+) (opacity ~2%) */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 ${
          mode === "deep" ? "opacity-100" : "opacity-0"
        }`}
      >
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="machined-grid-pattern" width="36" height="36" patternUnits="userSpaceOnUse">
              <path d="M 36 0 L 0 0 0 36" fill="none" stroke="#94A3B8" strokeWidth="0.5" opacity="0.45" />
              <path d="M -2 0 L 2 0 M 0 -2 L 0 2" stroke="#CBD5E1" strokeWidth="0.5" opacity="0.65" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#machined-grid-pattern)" opacity="0.02" />
        </svg>
      </div>

      {/* =========================================================================
          QUICK PITCH HOVER STATE: The Arcane Astrolabe
          Triple-ring runic astrolabe, floating sigils, and golden filigree ley-lines
          ========================================================================= */}
      {mode === "quick" && (
        <div
          className={`absolute inset-0 transition-opacity duration-500 ${
            isHoverActive ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* 1. Golden Filigree Ley-Lines extending outward from tile perimeter */}
          <svg className="w-full h-full absolute inset-0" xmlns="http://www.w3.org/2000/svg">
            <g opacity="0.12">
              {/* Horizontal Ley-Lines */}
              <line
                x1="0"
                y1={activeRect.top}
                x2={windowSize.width}
                y2={activeRect.top}
                stroke="#E8A838"
                strokeWidth="0.75"
                strokeDasharray="4 8"
              />
              <line
                x1="0"
                y1={activeRect.top + activeRect.height}
                x2={windowSize.width}
                y2={activeRect.top + activeRect.height}
                stroke="#E8A838"
                strokeWidth="0.75"
                strokeDasharray="4 8"
              />
              {/* Vertical Ley-Lines */}
              <line
                x1={activeRect.left}
                y1="0"
                x2={activeRect.left}
                y2={windowSize.height}
                stroke="#E8A838"
                strokeWidth="0.75"
                strokeDasharray="4 8"
              />
              <line
                x1={activeRect.left + activeRect.width}
                y1="0"
                x2={activeRect.left + activeRect.width}
                y2={windowSize.height}
                stroke="#E8A838"
                strokeWidth="0.75"
                strokeDasharray="4 8"
              />

              {/* Delicate Corner Filigree Brackets */}
              {/* Top-Left */}
              <path
                d={`M ${activeRect.left - 16} ${activeRect.top} L ${activeRect.left} ${activeRect.top} L ${activeRect.left} ${activeRect.top - 16}`}
                fill="none"
                stroke="#FFD95A"
                strokeWidth="1.2"
              />
              <polygon
                points={`${activeRect.left},${activeRect.top - 3} ${activeRect.left + 3},${activeRect.top} ${activeRect.left},${activeRect.top + 3} ${activeRect.left - 3},${activeRect.top}`}
                fill="#FFD95A"
              />

              {/* Top-Right */}
              <path
                d={`M ${activeRect.left + activeRect.width + 16} ${activeRect.top} L ${activeRect.left + activeRect.width} ${activeRect.top} L ${activeRect.left + activeRect.width} ${activeRect.top - 16}`}
                fill="none"
                stroke="#FFD95A"
                strokeWidth="1.2"
              />
              <polygon
                points={`${activeRect.left + activeRect.width},${activeRect.top - 3} ${activeRect.left + activeRect.width + 3},${activeRect.top} ${activeRect.left + activeRect.width},${activeRect.top + 3} ${activeRect.left + activeRect.width - 3},${activeRect.top}`}
                fill="#FFD95A"
              />

              {/* Bottom-Left */}
              <path
                d={`M ${activeRect.left - 16} ${activeRect.top + activeRect.height} L ${activeRect.left} ${activeRect.top + activeRect.height} L ${activeRect.left} ${activeRect.top + activeRect.height + 16}`}
                fill="none"
                stroke="#FFD95A"
                strokeWidth="1.2"
              />
              <polygon
                points={`${activeRect.left},${activeRect.top + activeRect.height - 3} ${activeRect.left + 3},${activeRect.top + activeRect.height} ${activeRect.left},${activeRect.top + activeRect.height + 3} ${activeRect.left - 3},${activeRect.top + activeRect.height}`}
                fill="#FFD95A"
              />

              {/* Bottom-Right */}
              <path
                d={`M ${activeRect.left + activeRect.width + 16} ${activeRect.top + activeRect.height} L ${activeRect.left + activeRect.width} ${activeRect.top + activeRect.height} L ${activeRect.left + activeRect.width} ${activeRect.top + activeRect.height + 16}`}
                fill="none"
                stroke="#FFD95A"
                strokeWidth="1.2"
              />
              <polygon
                points={`${activeRect.left + activeRect.width},${activeRect.top + activeRect.height - 3} ${activeRect.left + activeRect.width + 3},${activeRect.top + activeRect.height} ${activeRect.left + activeRect.width},${activeRect.top + activeRect.height + 3} ${activeRect.left + activeRect.width - 3},${activeRect.top + activeRect.height}`}
                fill="#FFD95A"
              />
            </g>
          </svg>

          {/* 2. Floating Sigil Glyphs drifting upward around card perimeter */}
          {floatingSigils.map((sigil, idx) => (
            <div
              key={`sigil-${idx}`}
              className="absolute pointer-events-none select-none font-serif text-[18px] text-[#FFD95A] drop-shadow-[0_0_8px_rgba(255,217,90,0.6)] animate-ember-float"
              style={{
                left: sigil.x,
                top: sigil.y,
                animationDelay: sigil.delay,
                // @ts-expect-error custom CSS variable for ember drift
                "--drift": sigil.drift,
              }}
            >
              {sigil.char}
            </div>
          ))}

          {/* 3. Triple-Ring Runic Astrolabe SVG positioned at card center (opacity ~10%) */}
          <div
            className="absolute top-0 left-0 transition-transform duration-300 ease-out"
            style={{
              transform: `translate3d(${cx}px, ${cy}px, 0)`,
            }}
          >
            <svg
              width="600"
              height="600"
              viewBox="-300 -300 600 600"
              className="opacity-[0.11] transform-gpu will-change-transform"
              style={{ transform: "translate(-50%, -50%)" }}
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* Radial mana glow halo */}
                <radialGradient id="astrolabe-halo" cx="0%" cy="0%" r="50%">
                  <stop offset="0%" stopColor="#FFD95A" stopOpacity="0.3" />
                  <stop offset="50%" stopColor="#E8A838" stopOpacity="0.1" />
                  <stop offset="85%" stopColor="#8E44AD" stopOpacity="0.05" />
                  <stop offset="100%" stopColor="#060608" stopOpacity="0" />
                </radialGradient>
              </defs>

              <circle r="260" fill="url(#astrolabe-halo)" />

              {/* ---------------- Outer Ring (Radius ~240px) ----------------
                  Elder Futhark runes rotating with animate-astrolabe-outer (80s CW) */}
              <g
                className="animate-astrolabe-outer origin-center transform-gpu will-change-transform"
                style={{ transformOrigin: "center", transformBox: "fill-box" }}
              >
                {/* Concentric Guide Tracks */}
                <circle r="254" fill="none" stroke="#FFD95A" strokeWidth="0.8" strokeDasharray="3 6" opacity="0.4" />
                <circle r="248" fill="none" stroke="#E8A838" strokeWidth="1" opacity="0.5" />
                <circle r="232" fill="none" stroke="#8E44AD" strokeWidth="0.8" strokeDasharray="6 6" opacity="0.4" />
                <circle r="226" fill="none" stroke="#E8A838" strokeWidth="0.75" opacity="0.5" />

                {/* Outer Tick Marks */}
                {Array.from({ length: 48 }).map((_, i) => {
                  const angle = (i * 360) / 48
                  return (
                    <line
                      key={`otick-${i}`}
                      x1="0"
                      y1="-248"
                      x2="0"
                      y2="-253"
                      transform={`rotate(${angle})`}
                      stroke="#FFD95A"
                      strokeWidth={i % 2 === 0 ? "1" : "0.5"}
                      opacity={i % 2 === 0 ? "0.6" : "0.3"}
                    />
                  )
                })}

                {/* 24 Elder Futhark Runes */}
                {ELDER_FUTHARK.map((rune, i) => {
                  const angle = (i * 360) / 24
                  return (
                    <text
                      key={`rune-${i}`}
                      transform={`rotate(${angle}) translate(0, -240)`}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill="#FFD95A"
                      fontSize="14"
                      fontFamily="'NotoSansRunic-Regular', serif"
                      fontWeight="600"
                      opacity="0.85"
                    >
                      {rune}
                    </text>
                  )
                })}
              </g>

              {/* ---------------- Middle Ring (Radius ~170px) ----------------
                  Alchemical Star & Sacred Glyphs counter-rotating with animate-astrolabe-middle (55s CCW) */}
              <g
                className="animate-astrolabe-middle origin-center transform-gpu will-change-transform"
                style={{ transformOrigin: "center", transformBox: "fill-box" }}
              >
                {/* Guide Circles */}
                <circle r="188" fill="none" stroke="#FFD95A" strokeWidth="0.75" opacity="0.4" />
                <circle r="170" fill="none" stroke="#E8A838" strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />
                <circle r="152" fill="none" stroke="#8E44AD" strokeWidth="0.8" opacity="0.4" />

                {/* Overlapping Squares (Sacred Geometry) */}
                <polygon points={SQUARE_1_POINTS} fill="none" stroke="#FFD95A" strokeWidth="0.8" opacity="0.45" />
                <polygon points={SQUARE_2_POINTS} fill="none" stroke="#8E44AD" strokeWidth="0.8" opacity="0.45" />

                {/* 8-Pointed Alchemical Starburst */}
                <polygon points={STAR_8_POINTS} fill="#8E44AD" fillOpacity="0.04" stroke="#FFD95A" strokeWidth="0.8" opacity="0.5" />

                {/* 8 Arcane Glyph Nodes */}
                {MIDDLE_GLYPHS.map((glyph, i) => {
                  const angle = (i * 360) / 8
                  const rad = (angle * Math.PI) / 180
                  const gx = Math.cos(rad) * 170
                  const gy = Math.sin(rad) * 170
                  return (
                    <g key={`mglyph-${i}`}>
                      <circle cx={gx} cy={gy} r="7" fill="#060608" stroke="#FFD95A" strokeWidth="1" opacity="0.95" />
                      <circle cx={gx} cy={gy} r="3.5" fill="#8E44AD" opacity="0.8" />
                      <text
                        x={gx}
                        y={gy}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill="#FFD95A"
                        fontSize="8.5"
                        fontWeight="bold"
                        opacity="0.9"
                      >
                        {glyph}
                      </text>
                    </g>
                  )
                })}
              </g>

              {/* ---------------- Inner Ring (Radius ~110px) ----------------
                  Concentric celestial rings rotating with animate-astrolabe-inner (35s CW) */}
              <g
                className="animate-astrolabe-inner origin-center transform-gpu will-change-transform"
                style={{ transformOrigin: "center", transformBox: "fill-box" }}
              >
                {/* Celestial Rings */}
                <circle r="115" fill="none" stroke="#FFD95A" strokeWidth="1.2" opacity="0.65" />
                <circle r="102" fill="none" stroke="#8E44AD" strokeWidth="0.75" strokeDasharray="3 3" opacity="0.4" />
                <circle r="88" fill="none" stroke="#E8A838" strokeWidth="1" opacity="0.55" />
                <circle r="68" fill="none" stroke="#FFD95A" strokeWidth="0.75" strokeDasharray="6 4" opacity="0.5" />
                <circle r="46" fill="none" stroke="#8E44AD" strokeWidth="0.75" opacity="0.4" />
                <circle r="26" fill="none" stroke="#FFD95A" strokeWidth="1" opacity="0.65" />

                {/* 12 Celestial Ray Ticks */}
                {Array.from({ length: 12 }).map((_, i) => {
                  const angle = (i * 360) / 12
                  return (
                    <line
                      key={`ray-${i}`}
                      x1="0"
                      y1="-68"
                      x2="0"
                      y2="-88"
                      transform={`rotate(${angle})`}
                      stroke="#FFD95A"
                      strokeWidth="1"
                      opacity="0.7"
                    />
                  )
                })}

                {/* Central 4-Point Radiant Compass Star */}
                <polygon
                  points="0,-18 4.5,-4.5 18,0 4.5,4.5 0,18 -4.5,4.5 -18,0 -4.5,-4.5"
                  fill="#FFD95A"
                  opacity="0.8"
                />
                <circle r="3" fill="#8E44AD" />
              </g>
            </svg>
          </div>
        </div>
      )}

      {/* =========================================================================
          DEEP DIVE HOVER STATE: The Machined Clockwork Matrix
          Interlocking gears, Vernier caliper rails, telemetry badges, hex-rivet anchors
          ========================================================================= */}
      {mode === "deep" && (
        <div
          className={`absolute inset-0 transition-opacity duration-500 ${
            isHoverActive ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* 1. Directional Metallic Specular Sheen behind active card */}
          <svg className="w-full h-full absolute inset-0" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="metallic-specular-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.12" />
                <stop offset="35%" stopColor="#2563EB" stopOpacity="0.06" />
                <stop offset="70%" stopColor="#0F172A" stopOpacity="0.02" />
                <stop offset="100%" stopColor="#08090D" stopOpacity="0" />
              </radialGradient>
            </defs>
            <ellipse
              cx={cx}
              cy={cy}
              rx={Math.max(activeRect.width, 280) * 0.75}
              ry={Math.max(activeRect.height, 240) * 0.75}
              fill="url(#metallic-specular-glow)"
            />
          </svg>

          {/* 2. Sliding Vernier Caliper Rails & Laser-Etched Sub-Millimeter Ticks */}
          <svg className="w-full h-full absolute inset-0" xmlns="http://www.w3.org/2000/svg">
            <g opacity="0.45">
              {/* Rail Lines */}
              {/* Top Rail */}
              <line x1="0" y1={activeRect.top} x2={activeRect.left} y2={activeRect.top} stroke="#2563EB" strokeWidth="0.8" />
              <line x1={activeRect.left + activeRect.width} y1={activeRect.top} x2={windowSize.width} y2={activeRect.top} stroke="#2563EB" strokeWidth="0.8" />

              {/* Bottom Rail */}
              <line x1="0" y1={activeRect.top + activeRect.height} x2={activeRect.left} y2={activeRect.top + activeRect.height} stroke="#2563EB" strokeWidth="0.8" />
              <line x1={activeRect.left + activeRect.width} y1={activeRect.top + activeRect.height} x2={windowSize.width} y2={activeRect.top + activeRect.height} stroke="#2563EB" strokeWidth="0.8" />

              {/* Left Rail */}
              <line x1={activeRect.left} y1="0" x2={activeRect.left} y2={activeRect.top} stroke="#2563EB" strokeWidth="0.8" />
              <line x1={activeRect.left} y1={activeRect.top + activeRect.height} x2={activeRect.left} y2={windowSize.height} stroke="#2563EB" strokeWidth="0.8" />

              {/* Right Rail */}
              <line x1={activeRect.left + activeRect.width} y1="0" x2={activeRect.left + activeRect.width} y2={activeRect.top} stroke="#2563EB" strokeWidth="0.8" />
              <line x1={activeRect.left + activeRect.width} y1={activeRect.top + activeRect.height} x2={activeRect.left + activeRect.width} y2={windowSize.height} stroke="#2563EB" strokeWidth="0.8" />

              {/* Sub-millimeter Tick Paths */}
              <path d={vernierTicks.horizontal} stroke="#38BDF8" strokeWidth="0.6" opacity="0.65" />
              <path d={vernierTicks.vertical} stroke="#38BDF8" strokeWidth="0.6" opacity="0.65" />
            </g>

            {/* Precision Hex-Rivet Anchors at card corners */}
            {hexCorners.map((pt, i) => (
              <g key={`hex-${i}`} transform={`translate(${pt.x}, ${pt.y})`}>
                <polygon
                  points="0,-7 6.06,-3.5 6.06,3.5 0,7 -6.06,3.5 -6.06,-3.5"
                  fill="#0B132B"
                  stroke="#60A5FA"
                  strokeWidth="1"
                  opacity="0.85"
                />
                <line x1="-3" y1="0" x2="3" y2="0" stroke="#93C5FD" strokeWidth="0.8" opacity="0.9" />
                <line x1="0" y1="-3" x2="0" y2="3" stroke="#93C5FD" strokeWidth="0.8" opacity="0.9" />
                <circle cx="-2" cy="-2" r="0.8" fill="#FFFFFF" opacity="0.95" />
              </g>
            ))}

            {/* Telemetry Badges */}
            {/* 1. Top Rail Badge */}
            <g transform={`translate(${activeRect.left + 24}, ${activeRect.top - 18})`}>
              <rect x="0" y="0" width="138" height="15" rx="3" fill="#08090D" fillOpacity="0.9" stroke="#2563EB" strokeWidth="0.75" strokeOpacity="0.6" />
              <text x="6" y="11" fill="#38BDF8" fontSize="8.5" fontFamily="var(--font-mono), monospace" letterSpacing="0.05em" opacity="0.85">
                [SEC.04 // 42.18° N]
              </text>
            </g>

            {/* 2. Bottom Rail Badge */}
            <g transform={`translate(${Math.max(10, activeRect.left + activeRect.width - 124)}, ${activeRect.top + activeRect.height + 4})`}>
              <rect x="0" y="0" width="114" height="15" rx="3" fill="#08090D" fillOpacity="0.9" stroke="#2563EB" strokeWidth="0.75" strokeOpacity="0.6" />
              <text x="6" y="11" fill="#38BDF8" fontSize="8.5" fontFamily="var(--font-mono), monospace" letterSpacing="0.05em" opacity="0.85">
                [CAL.84 // 135°]
              </text>
            </g>

            {/* 3. Left Rail Badge */}
            <g transform={`translate(${Math.max(10, activeRect.left - 138)}, ${activeRect.top + 24})`}>
              <rect x="0" y="0" width="128" height="15" rx="3" fill="#08090D" fillOpacity="0.9" stroke="#2563EB" strokeWidth="0.75" strokeOpacity="0.6" />
              <text x="6" y="11" fill="#38BDF8" fontSize="8.5" fontFamily="var(--font-mono), monospace" letterSpacing="0.05em" opacity="0.85">
                {`[AXIS.X // +${Math.round(activeRect.left)}px]`}
              </text>
            </g>

            {/* 4. Right Rail Badge */}
            <g transform={`translate(${Math.min(windowSize.width - 138, activeRect.left + activeRect.width + 10)}, ${activeRect.top + activeRect.height - 24})`}>
              <rect x="0" y="0" width="128" height="15" rx="3" fill="#08090D" fillOpacity="0.9" stroke="#2563EB" strokeWidth="0.75" strokeOpacity="0.6" />
              <text x="6" y="11" fill="#38BDF8" fontSize="8.5" fontFamily="var(--font-mono), monospace" letterSpacing="0.05em" opacity="0.85">
                {`[AXIS.Y // +${Math.round(activeRect.top)}px]`}
              </text>
            </g>
          </svg>

          {/* 3. Interlocking Machined Gear Calipers positioned behind card */}
          <div
            className="absolute top-0 left-0 transition-transform duration-300 ease-out"
            style={{
              transform: `translate3d(${cx}px, ${cy}px, 0)`,
            }}
          >
            <svg
              width="500"
              height="300"
              viewBox="-250 -150 500 300"
              className="opacity-[0.16] transform-gpu will-change-transform"
              style={{ transform: "translate(-50%, -50%)" }}
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Machined connecting caliper bridge */}
              <g opacity="0.6">
                <line x1="-55" y1="-8" x2="89" y2="-8" stroke="#475569" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="-55" y1="8" x2="89" y2="8" stroke="#475569" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="35" y1="-30" x2="35" y2="30" stroke="#38BDF8" strokeWidth="0.75" strokeDasharray="2 2" />
              </g>

              {/* Gear 1: Burnished brass gear ring (#F97316) rotating CW with animate-clockwork-gear-1 (40s CW) */}
              <g transform="translate(-55, 0)">
                <g
                  className="animate-clockwork-gear-1 origin-center transform-gpu will-change-transform"
                  style={{ transformOrigin: "center", transformBox: "fill-box" }}
                >
                  {/* Outer Gear Teeth Path */}
                  <path d={GEAR_1_PATH} fill="#F97316" fillOpacity="0.06" stroke="#F97316" strokeWidth="1.2" />

                  {/* Inner Rim Tracks */}
                  <circle r="80" fill="none" stroke="#F97316" strokeWidth="0.8" opacity="0.6" />
                  <circle r="74" fill="none" stroke="#F97316" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.4" />
                  <circle r="44" fill="none" stroke="#F97316" strokeWidth="0.8" opacity="0.5" />

                  {/* 6 Spoke Lightening Holes */}
                  {[0, 60, 120, 180, 240, 300].map((deg, i) => {
                    const rad = (deg * Math.PI) / 180
                    const hx = Math.cos(rad) * 60
                    const hy = Math.sin(rad) * 60
                    return (
                      <circle
                        key={`g1-hole-${i}`}
                        cx={hx}
                        cy={hy}
                        r="11"
                        fill="#08090D"
                        stroke="#F97316"
                        strokeWidth="0.8"
                        opacity="0.8"
                      />
                    )
                  })}

                  {/* Center Brass Bearing Hub & Rivets */}
                  <circle r="26" fill="#F97316" fillOpacity="0.12" stroke="#F97316" strokeWidth="1" />
                  <circle r="12" fill="#08090D" stroke="#F97316" strokeWidth="1" />
                  {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => {
                    const rad = (deg * Math.PI) / 180
                    return (
                      <circle
                        key={`g1-rivet-${i}`}
                        cx={Math.cos(rad) * 20}
                        cy={Math.sin(rad) * 20}
                        r="1.4"
                        fill="#F97316"
                        opacity="0.9"
                      />
                    )
                  })}
                </g>
              </g>

              {/* Gear 2: Titanium gear ring (#2563EB) rotating CCW with animate-clockwork-gear-2 (28s CCW) */}
              <g transform="translate(89, 0)">
                <g
                  className="animate-clockwork-gear-2 origin-center transform-gpu will-change-transform"
                  style={{ transformOrigin: "center", transformBox: "fill-box" }}
                >
                  {/* Outer Gear Teeth Path */}
                  <path d={GEAR_2_PATH} fill="#2563EB" fillOpacity="0.06" stroke="#2563EB" strokeWidth="1.2" />

                  {/* Inner Rim Tracks */}
                  <circle r="46" fill="none" stroke="#2563EB" strokeWidth="0.8" opacity="0.6" />
                  <circle r="42" fill="none" stroke="#38BDF8" strokeWidth="0.5" strokeDasharray="2 3" opacity="0.4" />
                  <circle r="26" fill="none" stroke="#2563EB" strokeWidth="0.8" opacity="0.5" />

                  {/* 4 Spoke Lightening Holes */}
                  {[0, 90, 180, 270].map((deg, i) => {
                    const rad = (deg * Math.PI) / 180
                    const hx = Math.cos(rad) * 35
                    const hy = Math.sin(rad) * 35
                    return (
                      <circle
                        key={`g2-hole-${i}`}
                        cx={hx}
                        cy={hy}
                        r="7"
                        fill="#08090D"
                        stroke="#2563EB"
                        strokeWidth="0.8"
                        opacity="0.8"
                      />
                    )
                  })}

                  {/* Center Titanium Hex Nut Hub */}
                  <circle r="18" fill="#2563EB" fillOpacity="0.12" stroke="#2563EB" strokeWidth="1" />
                  <polygon
                    points="0,-10 8.66,-5 8.66,5 0,10 -8.66,5 -8.66,-5"
                    fill="#08090D"
                    stroke="#60A5FA"
                    strokeWidth="0.9"
                  />
                  <circle r="4.5" fill="#1E293B" stroke="#38BDF8" strokeWidth="0.75" />
                </g>
              </g>
            </svg>
          </div>
        </div>
      )}
    </div>
  )
}
