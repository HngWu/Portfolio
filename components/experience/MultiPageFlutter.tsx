"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { BlankRunicPage } from "./BlankRunicPage"
import { SpellPageLeft } from "./SpellPageLeft"
import { playMultiPageFlutterSound } from "@/lib/experience/bookAudio"
import type { SpellData } from "@/lib/content/experienceSpells"

export interface MultiPageFlutterProps {
  currentSpell: SpellData
  totalSpells: number
  onComplete: () => void
  audioEnabled?: boolean
}

interface FlutterLeafConfig {
  id: number
  variant: 1 | 2 | 3
  delay: number
  duration: number
}

// Staggered cascade that runs simultaneously behind the opening front cover
const RUNIC_LEAVES: FlutterLeafConfig[] = [
  { id: 1, variant: 1, delay: 0.12, duration: 0.72 },
  { id: 2, variant: 2, delay: 0.24, duration: 0.65 },
  { id: 3, variant: 3, delay: 0.36, duration: 0.60 },
]

export function MultiPageFlutter({
  currentSpell,
  totalSpells,
  onComplete,
  audioEnabled = false,
}: MultiPageFlutterProps) {
  const completedCountRef = React.useRef(0)

  // Audio flutter trigger on initiation
  React.useEffect(() => {
    playMultiPageFlutterSound(audioEnabled)
  }, [audioEnabled])

  // Safety fallback watchdog
  React.useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      onComplete()
    }, 1200)
    return () => clearTimeout(fallbackTimer)
  }, [onComplete])

  const handleLeafComplete = React.useCallback(
    (leafId: number) => {
      completedCountRef.current += 1
      if (completedCountRef.current >= RUNIC_LEAVES.length) {
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
      {RUNIC_LEAVES.map((leaf, index) => {
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
                skewY: [0, -2.5, 0],
                rotateZ: [0, -3.2, 0],
              }}
              transition={{
                delay: leaf.delay,
                duration: leaf.duration,
                ease: [0.25, 0.85, 0.35, 1],
              }}
              onAnimationComplete={() => handleLeafComplete(leaf.id)}
            >
              {/* FRONT FACE OF RUNIC LEAF (Faces right before rotation) */}
              <div
                className="absolute inset-0 w-full h-full overflow-hidden"
                style={{
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  transform: "rotateY(0deg) translateZ(1px)",
                  transformStyle: "preserve-3d",
                }}
              >
                <BlankRunicPage side="right" variant={leaf.variant} />

                {/* Dynamic Radiant Specular Sheen sweeping across curvature */}
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(to right, transparent 0%, rgba(74,255,180,0.35) 45%, rgba(255,215,0,0.28) 65%, transparent 100%)",
                  }}
                  initial={{ opacity: 0, x: "-60%" }}
                  animate={{
                    opacity: [0, 1, 0],
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
                  className="absolute inset-0 pointer-events-none bg-gradient-to-r from-black/90 via-black/45 to-transparent"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.75, 0.95] }}
                  transition={{
                    delay: leaf.delay,
                    duration: leaf.duration,
                    ease: "easeInOut",
                  }}
                />
              </div>

              {/* BACK FACE OF RUNIC LEAF (Faces left after rotating -180deg) */}
              <div
                className="absolute inset-0 w-full h-full overflow-hidden"
                style={{
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  transform: "rotateY(180deg) translateZ(1px)",
                  transformStyle: "preserve-3d",
                }}
              >
                {leaf.id === 3 ? (
                  <SpellPageLeft
                    spell={currentSpell}
                    pageNumber={1}
                    totalSpells={totalSpells}
                  />
                ) : (
                  <BlankRunicPage side="left" variant={leaf.variant} />
                )}

                {/* Settle sheen dispersing as back face lands flat */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--lume-primary,#4affb4)]/30 to-transparent pointer-events-none"
                  initial={{ opacity: 0.9, x: "100%" }}
                  animate={{ opacity: 0, x: "-100%" }}
                  transition={{
                    delay: leaf.delay + 0.15,
                    duration: 0.38,
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
