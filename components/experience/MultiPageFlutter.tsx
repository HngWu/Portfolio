"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { BlankRunicPage } from "./BlankRunicPage"
import { SpellPageLeft } from "./SpellPageLeft"
import { playMultiPageFlutterSound } from "@/lib/experience/bookAudio"
import type { SpellData } from "@/lib/content/experienceSpells"

export interface MultiPageFlutterProps {
  direction?: "forward" | "backward"
  currentSpell: SpellData
  totalSpells: number
  onComplete: () => void
  audioEnabled?: boolean
}

interface FlutterLeafSpec {
  id: number
  variant: 1 | 2 | 3
  stagger: number
  duration: number
  scaleXPeak: number
}

// 4 cascading runic leaves for authentic grimoire page riffle
const RIFFLE_LEAVES: FlutterLeafSpec[] = [
  { id: 0, variant: 1, stagger: 0.03, duration: 0.42, scaleXPeak: 0.94 },
  { id: 1, variant: 2, stagger: 0.07, duration: 0.46, scaleXPeak: 0.95 },
  { id: 2, variant: 3, stagger: 0.11, duration: 0.50, scaleXPeak: 0.96 },
  { id: 3, variant: 1, stagger: 0.15, duration: 0.54, scaleXPeak: 0.97 },
]

export function MultiPageFlutter({
  direction = "forward",
  currentSpell,
  totalSpells,
  onComplete,
  audioEnabled = false,
}: MultiPageFlutterProps) {
  const isForward = direction === "forward"

  // Audio flutter trigger on initiation
  React.useEffect(() => {
    playMultiPageFlutterSound(audioEnabled)
  }, [audioEnabled])

  // Safety fallback watchdog
  React.useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      onComplete()
    }, 950)
    return () => clearTimeout(fallbackTimer)
  }, [onComplete])

  return (
    <div
      className="absolute inset-0 pointer-events-none z-30 overflow-visible"
      style={{
        perspective: "2600px",
        transformStyle: "preserve-3d",
      }}
      aria-hidden="true"
    >
      <div
        className="absolute top-0 bottom-0 left-1/2 right-0 pointer-events-none"
        style={{
          perspective: "2600px",
          transformStyle: "preserve-3d",
          zIndex: 36,
        }}
      >
        {RIFFLE_LEAVES.map((leaf, index) => {
          const isFinalLeaf = index === RIFFLE_LEAVES.length - 1

          const initialRot = isForward ? 0 : -180
          const targetRot = isForward ? -180 : 0
          const delay = isForward ? leaf.stagger : (RIFFLE_LEAVES.length - 1 - index) * 0.04

          return (
            <motion.div
              key={`flutter-leaf-${leaf.id}`}
              className="absolute inset-0 w-full h-full"
              style={{
                transformOrigin: "left center",
                transformStyle: "preserve-3d",
                willChange: "transform",
                zIndex: isForward ? index + 1 : RIFFLE_LEAVES.length - index,
              }}
              initial={{
                rotateY: initialRot,
                scaleX: 1,
              }}
              animate={{
                rotateY: targetRot,
                scaleX: [1, leaf.scaleXPeak, 1],
              }}
              transition={{
                delay,
                duration: leaf.duration,
                ease: [0.34, 1.15, 0.64, 1],
              }}
              onAnimationComplete={() => {
                if (isFinalLeaf) {
                  onComplete()
                }
              }}
            >
              {/* FRONT FACE OF RUNIC LEAF */}
              <div
                className="absolute inset-0 w-full h-full overflow-hidden"
                style={{
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  transform: "rotateY(0deg) translateZ(0.5px)",
                }}
              >
                <BlankRunicPage side="right" variant={leaf.variant} />

                {/* Dynamic Specular Sheen line sweeping across leaf curvature crest */}
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(to right, transparent 0%, rgba(74,255,180,0.22) 50%, rgba(255,215,0,0.15) 70%, transparent 100%)",
                  }}
                  initial={{ opacity: 0, x: "-60%" }}
                  animate={{
                    opacity: [0, 0.8, 0],
                    x: ["-60%", "20%", "120%"],
                  }}
                  transition={{
                    delay: delay + 0.05,
                    duration: leaf.duration * 0.9,
                    ease: "easeInOut",
                  }}
                />
              </div>

              {/* BACK FACE OF RUNIC LEAF */}
              <div
                className="absolute inset-0 w-full h-full overflow-hidden"
                style={{
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  transform: "rotateY(180deg) translateZ(0.5px)",
                }}
              >
                {isFinalLeaf && isForward ? (
                  <SpellPageLeft
                    spell={currentSpell}
                    pageNumber={1}
                    totalSpells={totalSpells}
                  />
                ) : (
                  <BlankRunicPage side="left" variant={leaf.variant} />
                )}

                {/* Settle sheen as leaf lands flat */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--lume-primary,#4affb4)]/25 to-transparent pointer-events-none"
                  initial={{ opacity: 0.7, x: "100%" }}
                  animate={{ opacity: 0, x: "-100%" }}
                  transition={{
                    delay: delay + leaf.duration * 0.45,
                    duration: 0.35,
                    ease: "easeOut",
                  }}
                />
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
