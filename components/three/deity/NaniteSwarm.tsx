"use client"

import React, { useRef, useMemo, useEffect } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { useViewModeStore } from "@/store/useViewModeStore"
import { useDeityControls } from "@/store/useDeityControls"
import {
  COLOR_GOLD_ACCENT,
  COLOR_CYAN_ACCENT,
  _scratchMatrix,
  _scratchVec1,
  _scratchQuat1,
  _scratchEuler,
} from "./types"

const DRONE_COUNT = 1250

export function NaniteSwarm() {
  const mode = useViewModeStore((s) => s.mode)
  const deityMode = useDeityControls((s) => s.mode)
  const activeShockwaves = useDeityControls((s) => s.activeShockwaves)
  const pruneShockwaves = useDeityControls((s) => s.pruneShockwaves)
  const assemblyProgress = useDeityControls((s) => s.assemblyProgress)
  const isDeepDive = mode === "deep"
  const isCad = deityMode === "CAD SCHEMATIC"
  const isSwarmCommand = deityMode === "SWARM COMMAND"
  const isOverdrive = deityMode === "OVERDRIVE"

  const meshRef = useRef<THREE.InstancedMesh>(null)

  // Pre-allocated flat buffers for 1,250 drones
  const droneData = useMemo(() => {
    const radii = new Float32Array(DRONE_COUNT)
    const inclinations = new Float32Array(DRONE_COUNT)
    const azimuths = new Float32Array(DRONE_COUNT)
    const speeds = new Float32Array(DRONE_COUNT)
    const scales = new Float32Array(DRONE_COUNT)

    // Dynamic perturbation offsets and velocities for shockwave blasts
    const posX = new Float32Array(DRONE_COUNT)
    const posY = new Float32Array(DRONE_COUNT)
    const posZ = new Float32Array(DRONE_COUNT)
    const velX = new Float32Array(DRONE_COUNT)
    const velY = new Float32Array(DRONE_COUNT)
    const velZ = new Float32Array(DRONE_COUNT)

    const goldenAngle = Math.PI * (3 - Math.sqrt(5))

    for (let i = 0; i < DRONE_COUNT; i++) {
      // Fibonacci sphere distribution
      const y = 1 - (i / (DRONE_COUNT - 1)) * 2
      const radiusAtY = Math.sqrt(1 - y * y)
      const theta = goldenAngle * i

      // Shell radius variation between 2.2 and 5.5 units
      const r = 2.4 + (i % 7) * 0.45 + Math.random() * 0.3
      radii[i] = r
      inclinations[i] = Math.acos(y)
      azimuths[i] = theta

      // Orbital speed: high velocity in swarm command, moderate in observer
      speeds[i] = (0.2 + (i % 5) * 0.15) * ((i % 2 === 0 ? 1 : -1))
      scales[i] = 0.035 + (i % 3) * 0.015

      // Initial positions
      posX[i] = r * radiusAtY * Math.cos(theta)
      posY[i] = r * y
      posZ[i] = r * radiusAtY * Math.sin(theta)
    }

    return {
      radii,
      inclinations,
      azimuths,
      speeds,
      scales,
      posX,
      posY,
      posZ,
      velX,
      velY,
      velZ,
    }
  }, [])

  // Material
  const droneMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: isDeepDive ? COLOR_CYAN_ACCENT : COLOR_GOLD_ACCENT,
      wireframe: isCad,
    })
  }, [isDeepDive, isCad])

  const targetColor = isDeepDive ? COLOR_CYAN_ACCENT : COLOR_GOLD_ACCENT

  // Track applied shockwaves to prevent multiple hits from the same pulse
  const appliedShockwaveHits = useRef<Set<string>>(new Set())

  useFrame((state, delta) => {
    if (!meshRef.current) return
    const t = state.clock.getElapsedTime()
    const now = performance.now()

    // Smooth color & wireframe update
    droneMaterial.color.lerp(targetColor, delta * 3)
    droneMaterial.wireframe = isCad

    // Clean expired shockwaves
    pruneShockwaves(now, 1600)

    const speedMultiplier = isOverdrive ? 2.8 : isSwarmCommand ? 2.2 : 1.0
    const {
      radii,
      inclinations,
      azimuths,
      speeds,
      scales,
      posX,
      posY,
      posZ,
      velX,
      velY,
      velZ,
    } = droneData

    // Check active shockwaves
    const activePulses = activeShockwaves.filter(
      (p) => now - p.timestamp < 1500
    )

    for (let i = 0; i < DRONE_COUNT; i++) {
      // 1. Orbital motion calculation (spirals inward during assembly)
      azimuths[i] += delta * speeds[i] * speedMultiplier
      const theta = azimuths[i]
      const phi = inclinations[i]
      const assemblyRadiusMult = assemblyProgress < 1.0 ? 1.0 + (1.0 - assemblyProgress) * 2.2 : 1.0
      const r = radii[i] * assemblyRadiusMult

      const orbitX = r * Math.sin(phi) * Math.cos(theta)
      const orbitY = r * Math.cos(phi)
      const orbitZ = r * Math.sin(phi) * Math.sin(theta)

      // 2. Gravitational Shockwave Physics Pulse
      for (let s = 0; s < activePulses.length; s++) {
        const pulse = activePulses[s]
        const pulseAge = (now - pulse.timestamp) / 1000
        const waveRadius = pulseAge * pulse.speed

        // Compute distance from shockwave origin to drone
        const dx = posX[i] - pulse.origin.x
        const dy = posY[i] - pulse.origin.y
        const dz = posZ[i] - pulse.origin.z
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)

        // Wavefront collision tolerance window (thickness 0.9)
        const hitKey = `${pulse.id}_${i}`
        if (Math.abs(dist - waveRadius) < 0.9 && !appliedShockwaveHits.current.has(hitKey)) {
          appliedShockwaveHits.current.add(hitKey)
          const invDist = 1 / (dist || 1)
          const blastStrength = 8.5 * Math.max(0.2, 1 - pulseAge / 1.5)
          velX[i] += dx * invDist * blastStrength
          velY[i] += dy * invDist * blastStrength
          velZ[i] += dz * invDist * blastStrength
        }
      }

      // 3. Integrate velocity & apply magnetic damping restoring force toward orbit
      posX[i] += velX[i] * delta
      posY[i] += velY[i] * delta
      posZ[i] += velZ[i] * delta

      // Magnetic damping: pulls drone position back toward (orbitX, orbitY, orbitZ)
      const pullForce = 3.8 * delta
      posX[i] += (orbitX - posX[i]) * pullForce
      posY[i] += (orbitY - posY[i]) * pullForce
      posZ[i] += (orbitZ - posZ[i]) * pullForce

      // Velocity decay friction
      velX[i] *= 0.92
      velY[i] *= 0.92
      velZ[i] *= 0.92

      // 4. Construct drone transformation matrix
      _scratchVec1.set(posX[i], posY[i], posZ[i])

      // Drone tumbling orientation
      _scratchEuler.set(t * 1.5 + i, t * 2.0 + i * 0.5, 0)
      _scratchQuat1.setFromEuler(_scratchEuler)

      const s = scales[i] * (isOverdrive ? 1.3 : 1.0) * Math.min(1.0, assemblyProgress * 1.5 + 0.05)
      _scratchMatrix.compose(
        _scratchVec1,
        _scratchQuat1,
        _scratchVec1.set(s, s, s)
      )

      meshRef.current.setMatrixAt(i, _scratchMatrix)
    }

    meshRef.current.instanceMatrix.needsUpdate = true
  })

  // Periodically trim stale hit tracking keys
  useEffect(() => {
    const timer = setInterval(() => {
      if (appliedShockwaveHits.current.size > 5000) {
        appliedShockwaveHits.current.clear()
      }
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, DRONE_COUNT]}
      material={droneMaterial}
    >
      <tetrahedronGeometry args={[1, 0]} />
    </instancedMesh>
  )
}
