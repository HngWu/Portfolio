"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { playMultiPageFlutterSound } from "@/lib/experience/bookAudio"
import { Terminal, Shield, Cpu, Layers } from "lucide-react"

export interface MultiPageFlutterProps {
  mode: "opening" | "closing"
  onComplete: () => void
  audioEnabled?: boolean
}

interface FlutterLeafSpec {
  id: number
  delay: number
  duration: number
  title: string
  subtitle: string
  icon: React.ElementType
  classification: string
}

const FLUTTER_LEAVES: FlutterLeafSpec[] = [
  {
    id: 1,
    delay: 0,
    duration: 0.44,
    title: "RUNTIME ARCHITECTURE",
    subtitle: "Full-Stack Distributed Systems & Microservices",
    icon: Terminal,
    classification: "SECURITY CLEARANCE: L1",
  },
  {
    id: 2,
    delay: 0.12,
    duration: 0.44,
    title: "TECHNICAL SPECIFICATIONS",
    subtitle: "Enterprise Database Governance & Event Pipelines",
    icon: Cpu,
    classification: "SECURITY CLEARANCE: L2",
  },
  {
    id: 3,
    delay: 0.24,
    duration: 0.46,
    title: "APPLICATION ENGAGEMENT",
    subtitle: "IT Application Support & Mission-Critical Reliability",
    icon: Shield,
    classification: "SECURITY CLEARANCE: L3",
  },
]

export function MultiPageFlutter({
  mode,
  onComplete,
  audioEnabled = false,
}: MultiPageFlutterProps) {
  const completedCountRef = React.useRef(0)
  const isOpening = mode === "opening"

  // Audio flutter trigger
  React.useEffect(() => {
    playMultiPageFlutterSound(audioEnabled)
  }, [audioEnabled])

  // Safety fallback watchdog: Ensure onComplete always fires even if animation frames are throttled
  React.useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      onComplete()
    }, 950)
    return () => clearTimeout(fallbackTimer)
  }, [onComplete])

  const handleLeafComplete = React.useCallback(
    (leafId: number) => {
      completedCountRef.current += 1
      if (completedCountRef.current >= FLUTTER_LEAVES.length) {
        onComplete()
      }
    },
    [onComplete]
  )

  return (
    <div
      className="absolute inset-0 pointer-events-none z-30 overflow-visible"
      style={{
        perspective: "2600px",
        transformStyle: "preserve-3d",
      }}
      aria-hidden="true"
    >
      {FLUTTER_LEAVES.map((leaf, index) => {
        const Icon = leaf.icon
        // Leaves hinge at center spine (left-1/2 right-0) and flip to the left (-180deg)
        return (
          <div
            key={leaf.id}
            className="absolute top-0 bottom-0 left-1/2 right-0 pointer-events-none"
            style={{
              perspective: "2600px",
              transformStyle: "preserve-3d",
              zIndex: 35 + index,
            }}
          >
            <motion.div
              className="relative w-full h-full"
              style={{
                transformOrigin: "left center",
                transformStyle: "preserve-3d",
              }}
              initial={{
                rotateY: 0,
                scaleX: 1,
                skewY: 0,
                rotateZ: 0,
              }}
              animate={{
                rotateY: -180,
                scaleX: [1, 0.92, 0.97, 1],
                skewY: [0, -2.4, 0],
                rotateZ: [0, -3.2, 0],
              }}
              transition={{
                delay: leaf.delay,
                duration: leaf.duration,
                ease: [0.25, 0.85, 0.35, 1],
              }}
              onAnimationComplete={() => handleLeafComplete(leaf.id)}
            >
              {/* FRONT FACE (Before flipping, faces right) */}
              <div
                className="absolute inset-0 w-full h-full overflow-hidden bg-[#070a14] rounded-r-3xl border-r border-y border-white/20 shadow-[-15px_0_35px_rgba(0,0,0,0.85)]"
                style={{
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  transform: "rotateY(0deg) translateZ(1px)",
                  transformStyle: "preserve-3d",
                }}
              >
                {/* Parchment Grid Watermark */}
                <div
                  className="absolute inset-0 opacity-[0.04] pointer-events-none"
                  style={{
                    backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.12) 1px, transparent 1px),
                                      linear-gradient(to bottom, rgba(255,255,255,0.12) 1px, transparent 1px)`,
                    backgroundSize: "20px 20px",
                  }}
                />

                {/* Inner Deckle Edge Line */}
                <div className="absolute inset-2.5 border border-white/10 rounded-2xl pointer-events-none" />

                {/* Spine shadow gradient along the inner hinge */}
                <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black/80 to-transparent pointer-events-none" />

                {/* Card Header & Content */}
                <div className="relative z-10 p-6 flex flex-col justify-between h-full font-mono">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <span className="text-[10px] text-[var(--lume-primary,#4affb4)] flex items-center gap-1.5 uppercase tracking-wider font-semibold">
                      <Icon className="size-3.5 text-[var(--lume-primary)]" />
                      Folio // 0{leaf.id}
                    </span>
                    <span className="text-[9px] text-white/50 tracking-widest uppercase">
                      {leaf.classification}
                    </span>
                  </div>

                  <div className="my-auto space-y-2">
                    <div className="size-10 rounded-xl bg-white/[0.04] border border-white/15 flex items-center justify-center text-[var(--lume-primary,#4affb4)] mb-3">
                      <Icon className="size-5" />
                    </div>
                    <h4 className="text-sm font-bold text-white tracking-wide font-sans">
                      {leaf.title}
                    </h4>
                    <p className="text-[11px] text-white/60 leading-relaxed font-sans">
                      {leaf.subtitle}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-white/10 pt-3 text-[10px] text-white/40">
                    <span className="flex items-center gap-1">
                      <Layers className="size-3 text-[var(--lume-primary)]" />
                      Index {leaf.id} of 3
                    </span>
                    <span className="text-[9px] font-mono tracking-widest text-white/40">
                      TAN HNG WU // EXP
                    </span>
                  </div>
                </div>

                {/* Dynamic Specular Sheen sweeping across curvature */}
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(to right, transparent 0%, rgba(74,255,180,0.22) 50%, transparent 100%)",
                  }}
                  initial={{ opacity: 0, x: "-60%" }}
                  animate={{
                    opacity: [0, 0.85, 0],
                    x: ["-60%", "25%", "120%"],
                  }}
                  transition={{
                    delay: leaf.delay,
                    duration: leaf.duration,
                    ease: "easeInOut",
                  }}
                />

                {/* Dynamic Traveling Shadow along folding crest */}
                <motion.div
                  className="absolute inset-0 pointer-events-none bg-gradient-to-r from-black/80 via-black/40 to-transparent"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.65, 0.9] }}
                  transition={{
                    delay: leaf.delay,
                    duration: leaf.duration,
                    ease: "easeInOut",
                  }}
                />
              </div>

              {/* BACK FACE (After flipping -180deg, lands on left side) */}
              <div
                className="absolute inset-0 w-full h-full overflow-hidden bg-[#070a14] rounded-l-3xl border-l border-y border-white/20 shadow-[15px_0_35px_rgba(0,0,0,0.85)]"
                style={{
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  transform: "rotateY(180deg) translateZ(1px)",
                  transformStyle: "preserve-3d",
                }}
              >
                {/* Parchment Grid Watermark */}
                <div
                  className="absolute inset-0 opacity-[0.04] pointer-events-none"
                  style={{
                    backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.12) 1px, transparent 1px),
                                      linear-gradient(to bottom, rgba(255,255,255,0.12) 1px, transparent 1px)`,
                    backgroundSize: "20px 20px",
                  }}
                />

                {/* Inner Deckle Edge Line */}
                <div className="absolute inset-2.5 border border-white/10 rounded-2xl pointer-events-none" />

                {/* Spine shadow gradient along the inner hinge (right edge on flipped leaf) */}
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-black/80 to-transparent pointer-events-none" />

                {/* Card Back Content */}
                <div className="relative z-10 p-6 flex flex-col justify-between h-full font-mono">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <span className="text-[10px] text-white/50 tracking-wider">
                      PAGE REGISTER // 0{leaf.id}
                    </span>
                    <span className="text-[9px] text-[var(--lume-primary,#4affb4)] uppercase">
                      VERIFIED
                    </span>
                  </div>

                  <div className="my-auto space-y-2 opacity-80">
                    <div className="h-1.5 w-16 bg-[var(--lume-primary,#4affb4)]/50 rounded-full mb-3" />
                    <div className="space-y-1 text-[11px] text-white/50 font-mono">
                      <p>• RECORD ID: SPELL-0{leaf.id}-ARCHIVE</p>
                      <p>• COMPILED FOR PORTFOLIO REVIEW</p>
                      <p>• DEEP DIVE CREDENTIALS ACTIVE</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-white/10 pt-3 text-[10px] text-white/40">
                    <span>SECTION A-{leaf.id}</span>
                    <span className="text-[9px] tracking-widest text-[var(--lume-primary)]">
                      DBS & TTP CHAPTERS
                    </span>
                  </div>
                </div>

                {/* Settle sheen dispersing as back face lands flat */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--lume-primary,#4affb4)]/20 to-transparent pointer-events-none"
                  initial={{ opacity: 0.8, x: "100%" }}
                  animate={{ opacity: 0, x: "-100%" }}
                  transition={{
                    delay: leaf.delay + 0.15,
                    duration: 0.35,
                    ease: "easeOut",
                  }}
                />
              </div>
            </motion.div>
          </div>
        )
      })}
    </div>
  )
}
