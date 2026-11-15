"use client"

import React, { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { useDeityControls } from "@/store/useDeityControls"

interface DeityLightningArcs3DProps {
  isOverdrive?: boolean
}

interface ArcDefinition {
  start: [number, number, number]
  end: [number, number, number]
  segments: number
  color: string
}

function generate3DLightningPoints(
  start: [number, number, number],
  end: [number, number, number],
  segments: number,
  jitter: number
): Float32Array {
  const points = new Float32Array((segments + 1) * 3)
  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    const x = start[0] + (end[0] - start[0]) * t + (i === 0 || i === segments ? 0 : (Math.random() - 0.5) * jitter)
    const y = start[1] + (end[1] - start[1]) * t + (i === 0 || i === segments ? 0 : (Math.random() - 0.5) * jitter)
    const z = start[2] + (end[2] - start[2]) * t + (i === 0 || i === segments ? 0 : (Math.random() - 0.5) * jitter)

    points[i * 3] = x
    points[i * 3 + 1] = y
    points[i * 3 + 2] = z
  }
  return points
}

export function DeityLightningArcs3D({ isOverdrive = false }: DeityLightningArcs3DProps) {
  const groupRef = useRef<THREE.Group>(null)
  const lineGeometries = useRef<(THREE.BufferGeometry | null)[]>([])
  const timerRef = useRef(0)
  const kineticPulse = useDeityControls((s) => s.kineticPulse)

  const arcConfigs: ArcDefinition[] = useMemo(() => [
    // Arc 1: Core -> Right Claymore Hilt
    { start: [0, 0.45, 0.25], end: [0.72, -0.25, 0.45], segments: 10, color: "#00F0FF" },
    // Arc 2: Core -> Right Pauldron Ordnance
    { start: [0, 0.45, 0.25], end: [0.85, 0.85, 0.15], segments: 8, color: "#4AFFB4" },
    // Arc 3: Core -> Left Pauldron Ordnance
    { start: [0, 0.45, 0.25], end: [-0.85, 0.85, 0.15], segments: 8, color: "#00F0FF" },
    // Arc 4: Right Pauldron -> Greatsword Blade
    { start: [0.85, 0.85, 0.15], end: [0.95, -0.65, 0.85], segments: 12, color: "#A855F7" },
    // Arc 5: Core -> Hip Conduit (Left)
    { start: [0, 0.45, 0.25], end: [-0.35, -0.3, 0.2], segments: 6, color: "#00F0FF" },
    // Arc 6: Core -> Hip Conduit (Right)
    { start: [0, 0.45, 0.25], end: [0.35, -0.3, 0.2], segments: 6, color: "#4AFFB4" },
  ], [])

  useFrame((_, delta) => {
    timerRef.current += delta
    // Retwist 3D lightning curves every 50ms for organic twitch
    if (timerRef.current > 0.05) {
      timerRef.current = 0
      const jitterMag = isOverdrive ? 0.18 : 0.09 + kineticPulse * 0.12

      arcConfigs.forEach((arc, idx) => {
        const geom = lineGeometries.current[idx]
        if (geom) {
          const newPts = generate3DLightningPoints(arc.start, arc.end, arc.segments, jitterMag)
          geom.setAttribute("position", new THREE.BufferAttribute(newPts, 3))
          geom.attributes.position.needsUpdate = true
        }
      })
    }
  })

  return (
    <group
      ref={groupRef}
      name="deity-lightning-arcs"
      userData={{ deityLightning: true, isOverdrive }}
      dispose={null}
    >
      {arcConfigs.map((arc, i) => {
        const initialPoints = generate3DLightningPoints(arc.start, arc.end, arc.segments, 0.08)
        const lineColor = isOverdrive ? (i % 2 === 0 ? "#F472B6" : "#A855F7") : arc.color

        return (
          <group key={i}>
            {/* Primary Searing Electric Arc */}
            <line>
              <bufferGeometry
                ref={(el: THREE.BufferGeometry | null) => {
                  lineGeometries.current[i] = el
                }}
              >
                <bufferAttribute
                  attach="attributes-position"
                  args={[initialPoints, 3]}
                />
              </bufferGeometry>
              <lineBasicMaterial
                color={lineColor}
                linewidth={isOverdrive ? 3 : 2}
                transparent
                opacity={isOverdrive ? 0.95 : 0.75}
                toneMapped={false}
              />
            </line>
          </group>
        )
      })}
    </group>
  )
}
