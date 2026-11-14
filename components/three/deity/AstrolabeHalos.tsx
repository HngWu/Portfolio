"use client"

import React, { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { useViewModeStore } from "@/store/useViewModeStore"
import { useDeityControls } from "@/store/useDeityControls"
import {
  COLOR_GOLD_PRIMARY,
  COLOR_CYAN_PRIMARY,
  COLOR_GOLD_ACCENT,
  COLOR_CYAN_ACCENT,
} from "./types"

export function AstrolabeHalos() {
  const mode = useViewModeStore((s) => s.mode)
  const deityMode = useDeityControls((s) => s.mode)
  const assemblyProgress = useDeityControls((s) => s.assemblyProgress)
  const isDeepDive = mode === "deep"
  const isOverdrive = deityMode === "OVERDRIVE"
  const isCad = deityMode === "CAD SCHEMATIC"

  // Ring group refs
  const rootGroupRef = useRef<THREE.Group>(null)
  const ring1Ref = useRef<THREE.Group>(null)
  const ring2Ref = useRef<THREE.Group>(null)
  const ring3Ref = useRef<THREE.Group>(null)
  const ring4Ref = useRef<THREE.Group>(null)

  // Materials
  const ringMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: 0x101524,
      emissive: isDeepDive ? COLOR_CYAN_PRIMARY : COLOR_GOLD_PRIMARY,
      emissiveIntensity: 0.95,
      metalness: 0.95,
      roughness: 0.18,
      wireframe: isCad,
    })
  }, [isDeepDive, isCad])

  const gearMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: 0x1a2133,
      emissive: isDeepDive ? COLOR_CYAN_PRIMARY : COLOR_GOLD_PRIMARY,
      emissiveIntensity: 0.5,
      metalness: 0.92,
      roughness: 0.24,
      wireframe: isCad,
    })
  }, [isDeepDive, isCad])

  const nodeMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: isDeepDive ? COLOR_CYAN_ACCENT : COLOR_GOLD_ACCENT,
      wireframe: isCad,
    })
  }, [isDeepDive, isCad])

  const targetEmissive = isDeepDive ? COLOR_CYAN_PRIMARY : COLOR_GOLD_PRIMARY
  const targetNodeColor = isDeepDive ? COLOR_CYAN_ACCENT : COLOR_GOLD_ACCENT

  // 24 Gear Teeth for Ring 2
  const gearTeeth = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => {
      const angle = (i * Math.PI * 2) / 24
      return {
        x: Math.cos(angle) * 2.95,
        y: Math.sin(angle) * 2.95,
        rot: angle,
      }
    })
  }, [])

  // 12 Zodiacal Nodes for Ring 3
  const zodiacNodes = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const angle = (i * Math.PI * 2) / 12
      return {
        x: Math.cos(angle) * 3.7,
        y: Math.sin(angle) * 3.7,
        rot: angle,
      }
    })
  }, [])

  useFrame((_, delta) => {
    const speed = isOverdrive ? 3.5 : 1.0

    // Color transitions
    ringMaterial.emissive.lerp(targetEmissive, delta * 3)
    gearMaterial.emissive.lerp(targetEmissive, delta * 3)
    nodeMaterial.color.lerp(targetNodeColor, delta * 3)

    ringMaterial.wireframe = isCad
    gearMaterial.wireframe = isCad
    nodeMaterial.wireframe = isCad

    // Genesis Assembly Unfolding progress: [0.25, 0.75]
    const pAstrolabe = THREE.MathUtils.clamp((assemblyProgress - 0.25) / 0.50, 0, 1)

    // Scale root group smoothly based on pAstrolabe
    if (rootGroupRef.current) {
      rootGroupRef.current.scale.set(pAstrolabe, pAstrolabe, pAstrolabe)
    }

    // Rotational velocities spin up during assembly
    const spinMultiplier = speed * (0.3 + pAstrolabe * 0.7)

    // Ring 1: Counter-clockwise
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z += delta * 0.48 * spinMultiplier
      ring1Ref.current.rotation.x = THREE.MathUtils.lerp(
        ring1Ref.current.rotation.x,
        isOverdrive ? 0 : 0.14,
        delta * 3
      )
    }

    // Ring 2: Clockwise (Gear-toothed dial)
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z -= delta * 0.35 * spinMultiplier
      ring2Ref.current.rotation.y = THREE.MathUtils.lerp(
        ring2Ref.current.rotation.y,
        isOverdrive ? 0 : -0.16,
        delta * 3
      )
    }

    // Ring 3: Counter-clockwise (Zodiacal nodes)
    if (ring3Ref.current) {
      ring3Ref.current.rotation.z += delta * 0.24 * spinMultiplier
      ring3Ref.current.rotation.x = THREE.MathUtils.lerp(
        ring3Ref.current.rotation.x,
        isOverdrive ? 0 : -0.12,
        delta * 3
      )
    }

    // Ring 4: Clockwise (Outer Horizon)
    if (ring4Ref.current) {
      ring4Ref.current.rotation.z -= delta * 0.14 * spinMultiplier
      ring4Ref.current.rotation.y = THREE.MathUtils.lerp(
        ring4Ref.current.rotation.y,
        isOverdrive ? 0 : 0.08,
        delta * 3
      )
    }
  })

  return (
    <group ref={rootGroupRef} position={[0, 0, -0.7]}>
      {/* ────────────────────────────────────────────────────────── */}
      {/* Ring 1 (Radius 2.2): Inner Celestial Astrolabe Ring        */}
      {/* ────────────────────────────────────────────────────────── */}
      <group ref={ring1Ref}>
        <mesh material={ringMaterial}>
          <torusGeometry args={[2.2, 0.024, 16, 64]} />
        </mesh>
        {/* 8 Inner Node Beads */}
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
          const angle = (i * Math.PI * 2) / 8
          return (
            <mesh
              key={i}
              position={[Math.cos(angle) * 2.2, Math.sin(angle) * 2.2, 0]}
              material={nodeMaterial}
            >
              <sphereGeometry args={[0.048, 12, 12]} />
            </mesh>
          )
        })}
      </group>

      {/* ────────────────────────────────────────────────────────── */}
      {/* Ring 2 (Radius 2.95): Gear-Toothed Chronometer Dial (24)   */}
      {/* ────────────────────────────────────────────────────────── */}
      <group ref={ring2Ref}>
        {/* Main Base Torus */}
        <mesh material={ringMaterial}>
          <torusGeometry args={[2.95, 0.026, 16, 64]} />
        </mesh>
        {/* Inner Track Ring */}
        <mesh material={gearMaterial}>
          <torusGeometry args={[2.84, 0.012, 12, 64]} />
        </mesh>
        {/* 24 Mechanical Gear Teeth */}
        {gearTeeth.map((t, i) => (
          <mesh
            key={i}
            position={[t.x, t.y, 0]}
            rotation={[0, 0, t.rot]}
            material={gearMaterial}
          >
            <boxGeometry args={[0.11, 0.038, 0.025]} />
          </mesh>
        ))}
      </group>

      {/* ────────────────────────────────────────────────────────── */}
      {/* Ring 3 (Radius 3.7): 12 Zodiacal / Orbital Nodes           */}
      {/* ────────────────────────────────────────────────────────── */}
      <group ref={ring3Ref}>
        <mesh material={ringMaterial}>
          <torusGeometry args={[3.7, 0.028, 16, 80]} />
        </mesh>
        {zodiacNodes.map((n, i) => (
          <mesh
            key={i}
            position={[n.x, n.y, 0]}
            rotation={[0, 0, n.rot + Math.PI / 4]}
            material={nodeMaterial}
          >
            <octahedronGeometry args={[0.08]} />
          </mesh>
        ))}
      </group>

      {/* ────────────────────────────────────────────────────────── */}
      {/* Ring 4 (Radius 4.5): Outer Astrolabe Horizon               */}
      {/* ────────────────────────────────────────────────────────── */}
      <group ref={ring4Ref}>
        <mesh material={ringMaterial}>
          <torusGeometry args={[4.5, 0.02, 16, 96]} />
        </mesh>
        {/* 4 Cardinal Celestial Markers */}
        {[0, 1, 2, 3].map((i) => {
          const angle = (i * Math.PI) / 2
          return (
            <mesh
              key={i}
              position={[Math.cos(angle) * 4.5, Math.sin(angle) * 4.5, 0]}
              rotation={[0, 0, angle]}
              material={nodeMaterial}
            >
              <coneGeometry args={[0.09, 0.38, 4]} />
            </mesh>
          )
        })}
      </group>
    </group>
  )
}
