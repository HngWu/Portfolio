"use client"

import React, { useRef, useMemo, useState, useCallback } from "react"
import { useFrame } from "@react-three/fiber"
import { Float, Text } from "@react-three/drei"
import * as THREE from "three"
import { ShatteredMonolithCore } from "./ShatteredMonolithCore"
import { MonolithMicroArcs } from "./MonolithMicroArcs"

const RUNES = ["ᚠ", "ᚢ", "ᚦ", "ᚨ", "ᚱ", "ᚲ", "ᚷ", "ᚹ", "ᚺ", "ᚾ", "ᛁ", "ᛃ"]

interface ShatteredMonolithSceneProps {
  isActive: boolean
  viewMode: "quick-pitch" | "deep-dive"
  isIgnited?: boolean
  isLockdown?: boolean
  shatterImpulse?: number
  onTelemetry?: (data: { shardCount: number; tension: number; activeArcs: number }) => void
}

/**
 * Procedural particles drifting in zero-G around the magnetic monolith.
 */
function AmbientMagneticDust({ modeProgress, isIgnited }: { modeProgress: number; isIgnited: boolean }) {
  const count = 90
  const pointsRef = useRef<THREE.Points>(null)

  const [positions, phases] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const ph = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = (Math.random() - 0.5) * Math.PI
      const r = 1.4 + Math.random() * 2.2
      pos[i * 3] = r * Math.cos(phi) * Math.cos(theta)
      pos[i * 3 + 1] = r * Math.sin(phi)
      pos[i * 3 + 2] = r * Math.cos(phi) * Math.sin(theta)

      ph[i * 3] = Math.random() * Math.PI * 2
      ph[i * 3 + 1] = 0.5 + Math.random() * 1.5
      ph[i * 3 + 2] = (Math.random() - 0.5) * 0.02
    }
    return [pos, ph]
  }, [count])

  const colorGold = useMemo(() => new THREE.Color("#ffb44a"), [])
  const colorTeal = useMemo(() => new THREE.Color("#4AFFB4"), [])
  const colorIgnite = useMemo(() => new THREE.Color("#ff5500"), [])
  const targetCol = useMemo(() => new THREE.Color(), [])

  useFrame((state) => {
    if (!pointsRef.current) return
    const t = state.clock.getElapsedTime()
    const posAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute
    const arr = posAttr.array as Float32Array

    for (let i = 0; i < count; i++) {
      const idx = i * 3
      // Spiral magnetic drift inward and upward
      arr[idx + 1] += Math.sin(t * phases[idx + 1] + phases[idx]) * 0.003
      // Subtle orbit
      const x = arr[idx]
      const z = arr[idx + 2]
      const angle = phases[idx + 2]
      arr[idx] = x * Math.cos(angle) - z * Math.sin(angle)
      arr[idx + 2] = x * Math.sin(angle) + z * Math.cos(angle)
    }
    posAttr.needsUpdate = true

    targetCol.copy(colorGold).lerp(colorTeal, modeProgress)
    if (isIgnited) targetCol.copy(colorIgnite)
    ;(pointsRef.current.material as THREE.PointsMaterial).color.lerp(targetCol, 0.1)
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.038}
        color="#ffb44a"
        transparent
        opacity={0.75}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </points>
  )
}

/**
 * Concentric orbital gimbal rings framing the monolith.
 */
function GimbalRings({
  modeProgress,
  isIgnited,
  isLockdown,
}: {
  modeProgress: number
  isIgnited: boolean
  isLockdown: boolean
}) {
  const ring1Ref = useRef<THREE.Group>(null)
  const ring2Ref = useRef<THREE.Group>(null)

  const ringGeo1 = useMemo(() => new THREE.TorusGeometry(1.85, 0.015, 16, 80), [])
  const ringGeo2 = useMemo(() => new THREE.TorusGeometry(2.25, 0.015, 16, 80), [])

  const colorGold = useMemo(() => new THREE.Color("#ffb44a"), [])
  const colorTeal = useMemo(() => new THREE.Color("#4AFFB4"), [])
  const ringCol = useMemo(() => new THREE.Color(), [])

  useFrame((_, delta) => {
    ringCol.copy(colorGold).lerp(colorTeal, modeProgress)
    if (isIgnited) ringCol.set("#ff5500")
    else if (isLockdown) ringCol.set("#253545")

    const speed = isLockdown ? 0.0 : (isIgnited ? 3.0 : 1.0)
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x += delta * 0.45 * speed
      ring1Ref.current.rotation.y += delta * 0.35 * speed
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.y -= delta * 0.40 * speed
      ring2Ref.current.rotation.z += delta * 0.30 * speed
    }
  })

  return (
    <>
      <group ref={ring1Ref}>
        <mesh geometry={ringGeo1}>
          <meshBasicMaterial color={ringCol} wireframe={false} transparent opacity={0.65} />
        </mesh>
        {RUNES.slice(0, 6).map((rune, i) => {
          const angle = (i / 6) * Math.PI * 2
          return (
            <Text
              key={i}
              position={[1.85 * Math.cos(angle), 1.85 * Math.sin(angle), 0]}
              fontSize={0.16}
              font="/fonts/NotoSansRunic-Regular.ttf"
              anchorX="center"
              anchorY="middle"
            >
              <meshBasicMaterial color={ringCol} toneMapped={false} />
              {rune}
            </Text>
          )
        })}
      </group>

      <group ref={ring2Ref} rotation={[Math.PI / 3, 0, Math.PI / 4]}>
        <mesh geometry={ringGeo2}>
          <meshBasicMaterial color={ringCol} transparent opacity={0.5} />
        </mesh>
        {RUNES.slice(6, 12).map((rune, i) => {
          const angle = (i / 6) * Math.PI * 2
          return (
            <Text
              key={i}
              position={[2.25 * Math.cos(angle), 2.25 * Math.sin(angle), 0]}
              fontSize={0.16}
              font="/fonts/NotoSansRunic-Regular.ttf"
              anchorX="center"
              anchorY="middle"
            >
              <meshBasicMaterial color={ringCol} toneMapped={false} />
              {rune}
            </Text>
          )
        })}
      </group>
    </>
  )
}

export const ShatteredMonolithScene: React.FC<ShatteredMonolithSceneProps> = ({
  isActive,
  viewMode,
  isIgnited = false,
  isLockdown = false,
  shatterImpulse = 0,
  onTelemetry,
}) => {
  const masterGroupRef = useRef<THREE.Group>(null)
  const coreLightRef = useRef<THREE.PointLight>(null)

  const modeProgress = viewMode === "deep-dive" ? 1.0 : 0.0

  // Track live vertices for MonolithMicroArcs
  const liveVerticesRef = useRef<THREE.Vector3[]>([])
  const handleVerticesUpdate = useCallback((verts: THREE.Vector3[]) => {
    liveVerticesRef.current = verts
  }, [])

  const getShardVertices = useCallback(() => {
    return liveVerticesRef.current
  }, [])

  // Pointer tracking spring tilt
  const currentTilt = useRef(new THREE.Vector2(0, 0))

  useFrame((state, delta) => {
    const { pointer } = state

    // Tilt responds smoothly to cursor position
    const targetX = pointer.y * 0.32
    const targetY = pointer.x * 0.40
    currentTilt.current.x = THREE.MathUtils.lerp(currentTilt.current.x, targetX, delta * 4.0)
    currentTilt.current.y = THREE.MathUtils.lerp(currentTilt.current.y, targetY, delta * 4.0)

    if (masterGroupRef.current) {
      masterGroupRef.current.rotation.x = currentTilt.current.x
      masterGroupRef.current.rotation.y = currentTilt.current.y
    }

    // Dynamic inner core light
    if (coreLightRef.current) {
      const lightColor = new THREE.Color(viewMode === "deep-dive" ? "#4AFFB4" : "#ffb44a")
      if (isIgnited) lightColor.set("#ff5500")
      else if (isLockdown) lightColor.set("#1a2530")

      coreLightRef.current.color.lerp(lightColor, 0.1)

      // Light intensifies when shards drift apart to illuminate hollow negative space
      const baseIntensity = isActive ? 2.5 : 4.5
      const targetIntensity = isLockdown ? 0.4 : (isIgnited ? 7.0 : baseIntensity)
      coreLightRef.current.intensity = THREE.MathUtils.lerp(coreLightRef.current.intensity, targetIntensity, delta * 6.0)
    }

    // Periodically update telemetry
    if (onTelemetry) {
      onTelemetry({
        shardCount: 18,
        tension: isActive ? 1.0 : 0.0,
        activeArcs: isLockdown ? 0 : 14,
      })
    }
  })

  return (
    <group ref={masterGroupRef}>
      <Float speed={1.2} rotationIntensity={0.08} floatIntensity={0.15}>
        {/* Central Monolith Core with Negative Hollow Space */}
        <ShatteredMonolithCore
          isActive={isActive}
          isIgnited={isIgnited}
          isLockdown={isLockdown}
          modeProgress={modeProgress}
          shatterImpulse={shatterImpulse}
          onVerticesUpdate={handleVerticesUpdate}
        />

        {/* Dynamic Micro-Arcs of Electricity Jumping Across Gaps */}
        <MonolithMicroArcs
          getShardVertices={getShardVertices}
          modeProgress={modeProgress}
          isIgnited={isIgnited}
          isLockdown={isLockdown}
          tensionProgress={isActive ? 1.0 : 0.0}
        />

        {/* Arcane Gimbal Rings framing the monolith */}
        <GimbalRings
          modeProgress={modeProgress}
          isIgnited={isIgnited}
          isLockdown={isLockdown}
        />

        {/* Ambient Magnetic Dust particles */}
        <AmbientMagneticDust modeProgress={modeProgress} isIgnited={isIgnited} />

        {/* Central Core Point Light inside negative cavity */}
        <pointLight ref={coreLightRef} position={[0, 0, 0]} distance={7} intensity={3.5} />
      </Float>
    </group>
  )
}
