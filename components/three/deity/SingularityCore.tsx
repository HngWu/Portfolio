"use client"

import React, { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { useViewModeStore } from "@/store/useViewModeStore"
import { useDeityControls } from "@/store/useDeityControls"
import {
  COLOR_GOLD_PRIMARY,
  COLOR_CYAN_PRIMARY,
} from "./types"

export function SingularityCore() {
  const mode = useViewModeStore((s) => s.mode)
  const deityMode = useDeityControls((s) => s.mode)
  const activeShockwaves = useDeityControls((s) => s.activeShockwaves)
  const assemblyProgress = useDeityControls((s) => s.assemblyProgress)
  const isDeepDive = mode === "deep"
  const isCad = deityMode === "CAD SCHEMATIC"
  const isOverdrive = deityMode === "OVERDRIVE"

  const coreGroupRef = useRef<THREE.Group>(null)
  const photonRingRef = useRef<THREE.Mesh>(null)
  const shockwaveMeshRef = useRef<THREE.Mesh>(null)

  // Gimbal Gyroscope Reactor Ring Refs
  const gimbalYawRef = useRef<THREE.Group>(null)
  const gimbalPitchRef = useRef<THREE.Group>(null)
  const gimbalRollRef = useRef<THREE.Group>(null)

  // Target colors
  const targetEmissive = isDeepDive ? COLOR_CYAN_PRIMARY : COLOR_GOLD_PRIMARY

  // Materials
  const gimbalMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: 0x161b26,
      emissive: isDeepDive ? COLOR_CYAN_PRIMARY : COLOR_GOLD_PRIMARY,
      emissiveIntensity: 0.9,
      roughness: 0.2,
      metalness: 0.95,
      wireframe: isCad,
    })
  }, [isDeepDive, isCad])

  const photonRingMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: 0x05070a,
      emissive: isDeepDive ? COLOR_CYAN_PRIMARY : COLOR_GOLD_PRIMARY,
      emissiveIntensity: 2.6,
      roughness: 0.1,
      metalness: 0.9,
      wireframe: isCad,
    })
  }, [isDeepDive, isCad])

  const shockwaveMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: isDeepDive ? COLOR_CYAN_PRIMARY : COLOR_GOLD_PRIMARY,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
  }, [isDeepDive])

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime()
    const speedMultiplier = isOverdrive ? 2.6 : 1.0

    // Genesis Assembly Ignition calculation
    const scaleFactor = THREE.MathUtils.lerp(0.08, 1.0, Math.min(1.0, assemblyProgress * 1.5))
    if (coreGroupRef.current) {
      coreGroupRef.current.scale.set(scaleFactor, scaleFactor, scaleFactor)
    }

    // Flash intensity surge during ignition
    let ignitionSurge = 0
    if (assemblyProgress > 0.15 && assemblyProgress < 0.6) {
      const norm = (assemblyProgress - 0.15) / 0.45
      ignitionSurge = Math.sin(norm * Math.PI) * 2.8
    }

    // Smooth color transitions
    photonRingMaterial.emissive.lerp(targetEmissive, delta * 3)
    gimbalMaterial.emissive.lerp(targetEmissive, delta * 3)
    shockwaveMaterial.color.lerp(targetEmissive, delta * 3)

    // Wireframe updates
    gimbalMaterial.wireframe = isCad
    photonRingMaterial.wireframe = isCad

    // Emissive intensity pulsating
    photonRingMaterial.emissiveIntensity = THREE.MathUtils.lerp(
      photonRingMaterial.emissiveIntensity,
      (isOverdrive ? 4.5 : 2.4 + Math.sin(t * 3.5) * 0.45) + ignitionSurge,
      delta * 4
    )

    // Interlocking Gimbal Gyroscope Reactor rotations
    if (gimbalYawRef.current) {
      gimbalYawRef.current.rotation.y += delta * 0.75 * speedMultiplier
    }
    if (gimbalPitchRef.current) {
      gimbalPitchRef.current.rotation.x += delta * 1.1 * speedMultiplier
    }
    if (gimbalRollRef.current) {
      gimbalRollRef.current.rotation.z -= delta * 0.9 * speedMultiplier
    }

    if (photonRingRef.current) {
      photonRingRef.current.rotation.x = Math.sin(t * 0.7) * 0.2
      photonRingRef.current.rotation.y += delta * 0.5 * speedMultiplier
    }

    // Shockwave expansion animation
    if (shockwaveMeshRef.current) {
      if (activeShockwaves.length > 0) {
        const latest = activeShockwaves[activeShockwaves.length - 1]
        const elapsed = (performance.now() - latest.timestamp) / 1000
        if (elapsed < 1.2) {
          const currentRadius = elapsed * latest.speed
          const scale = Math.max(0.01, currentRadius / 2)
          shockwaveMeshRef.current.scale.set(scale, scale, scale)
          shockwaveMaterial.opacity = Math.max(0, 1.0 - elapsed / 1.2)
        } else {
          shockwaveMaterial.opacity = 0
        }
      } else {
        shockwaveMaterial.opacity = 0
      }
    }
  })

  return (
    <group ref={coreGroupRef} position={[0, 0.22, 0.12]}>
      {/* ────────────────────────────────────────────────────────── */}
      {/* 1. Singularity Event Horizon Sphere (Pitch Black Void)     */}
      {/* ────────────────────────────────────────────────────────── */}
      <mesh>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshBasicMaterial color={0x000000} />
      </mesh>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 2. Relativistic Photon Sphere Ring                         */}
      {/* ────────────────────────────────────────────────────────── */}
      <mesh ref={photonRingRef} material={photonRingMaterial}>
        <torusGeometry args={[0.42, 0.03, 24, 48]} />
      </mesh>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 3. Interlocking 3-Axis Gimbal Gyroscope Reactor            */}
      {/* ────────────────────────────────────────────────────────── */}
      {/* Gimbal Ring 1: Yaw Axis (Outer) */}
      <group ref={gimbalYawRef}>
        <mesh material={gimbalMaterial}>
          <torusGeometry args={[0.54, 0.02, 16, 36]} />
        </mesh>
        <mesh position={[0, 0.54, 0]} material={gimbalMaterial}>
          <cylinderGeometry args={[0.025, 0.025, 0.06, 12]} />
        </mesh>
        <mesh position={[0, -0.54, 0]} material={gimbalMaterial}>
          <cylinderGeometry args={[0.025, 0.025, 0.06, 12]} />
        </mesh>

        {/* Gimbal Ring 2: Pitch Axis (Mid) */}
        <group ref={gimbalPitchRef}>
          <mesh material={gimbalMaterial}>
            <torusGeometry args={[0.48, 0.018, 16, 36]} />
          </mesh>
          <mesh position={[0.48, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={gimbalMaterial}>
            <cylinderGeometry args={[0.022, 0.022, 0.05, 12]} />
          </mesh>
          <mesh position={[-0.48, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={gimbalMaterial}>
            <cylinderGeometry args={[0.022, 0.022, 0.05, 12]} />
          </mesh>

          {/* Gimbal Ring 3: Roll Axis (Inner) */}
          <group ref={gimbalRollRef}>
            <mesh material={gimbalMaterial}>
              <torusGeometry args={[0.42, 0.015, 16, 36]} />
            </mesh>
          </group>
        </group>
      </group>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 4. Gravitational Click Shockwave Wavefront Ring            */}
      {/* ────────────────────────────────────────────────────────── */}
      <mesh
        ref={shockwaveMeshRef}
        material={shockwaveMaterial}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[1.6, 1.9, 48]} />
      </mesh>
    </group>
  )
}
