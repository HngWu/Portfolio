"use client"

import React, { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { useViewModeStore } from "@/store/useViewModeStore"
import { useDeityControls } from "@/store/useDeityControls"
import {
  COLOR_ARMOR_TITANIUM,
  COLOR_GOLD_PRIMARY,
  COLOR_CYAN_PRIMARY,
  COLOR_GOLD_ACCENT,
  COLOR_CYAN_ACCENT,
} from "./types"

interface WingBladeConfig {
  x: number
  y: number
  z: number
  rotZ: number
  rotY: number
  scale: number
}

function generateWingBlades(
  count: number,
  arcRadiusX: number,
  arcRadiusY: number,
  startAngle: number,
  endAngle: number,
  zBase: number,
  zCurve: number,
  scaleBase: number
): WingBladeConfig[] {
  const blades: WingBladeConfig[] = []
  for (let i = 0; i < count; i++) {
    const t = count === 1 ? 0 : i / (count - 1)
    const angle = THREE.MathUtils.lerp(startAngle, endAngle, t)
    const rX = arcRadiusX * (1 + t * 0.48)
    const rY = arcRadiusY * (1 + t * 0.28)
    const x = Math.cos(angle) * rX
    const y = Math.sin(angle) * rY
    const z = zBase + t * zCurve

    const rotZ = angle + Math.PI / 2
    const rotY = t * 0.42
    const scale = scaleBase * (1.25 - t * 0.35)

    blades.push({ x, y, z, rotZ, rotY, scale })
  }
  return blades
}

export function SeraphicWings() {
  const mode = useViewModeStore((s) => s.mode)
  const deityMode = useDeityControls((s) => s.mode)
  const isHovered = useDeityControls((s) => s.isHovered)
  const assemblyProgress = useDeityControls((s) => s.assemblyProgress)
  const kineticPulse = useDeityControls((s) => s.kineticPulse)

  const isDeepDive = mode === "deep"
  const isOverdrive = deityMode === "OVERDRIVE"
  const isCad = deityMode === "CAD SCHEMATIC"

  // Left & Right wing group refs
  const upperLeftWingRef = useRef<THREE.Group>(null)
  const upperRightWingRef = useRef<THREE.Group>(null)
  const midLeftWingRef = useRef<THREE.Group>(null)
  const midRightWingRef = useRef<THREE.Group>(null)
  const lowerLeftWingRef = useRef<THREE.Group>(null)
  const lowerRightWingRef = useRef<THREE.Group>(null)

  // Smooth hover progress (0 → 1) for gradual wing spread / retract transitions
  const hoverProgressRef = useRef(0)

  // Electric Arc Line Segments Ref
  const electricArcsRef = useRef<THREE.LineSegments>(null)

  // 72 blades total:
  // Upper: 14x2 = 28, sweep high and arch backward into space (z: -0.25 -> -0.65)
  // Mid: 12x2 = 24, wide lateral wingspan (rX: 2.7)
  // Lower: 10x2 = 20, wrap forward around hips like an angelic throne (z: -0.15 -> +0.32)
  const upperBlades = useMemo(
    () => generateWingBlades(14, 2.0, 2.4, 0.4, 1.62, -0.25, -0.4, 1.15),
    []
  )
  const midBlades = useMemo(
    () => generateWingBlades(12, 2.7, 1.55, -0.2, 0.72, -0.28, -0.15, 1.0),
    []
  )
  const lowerBlades = useMemo(
    () => generateWingBlades(10, 2.1, 1.75, -1.45, -0.38, -0.12, 0.44, 0.9),
    []
  )

  // Materials
  const bladeArmorMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: COLOR_ARMOR_TITANIUM,
      metalness: 0.95,
      roughness: 0.16,
      wireframe: isCad,
    })
  }, [isCad])

  const bladeVeinMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: isDeepDive ? COLOR_CYAN_ACCENT : COLOR_GOLD_ACCENT,
      wireframe: isCad,
    })
  }, [isDeepDive, isCad])

  const lightningMaterial = useMemo(() => {
    return new THREE.LineBasicMaterial({
      color: isDeepDive ? COLOR_CYAN_PRIMARY : COLOR_GOLD_PRIMARY,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    })
  }, [isDeepDive])

  // Pre-allocated Float32Array for dynamic electric arc segments
  const arcPositions = useMemo(() => new Float32Array(12 * 2 * 3), [])
  const arcGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute("position", new THREE.BufferAttribute(arcPositions, 3))
    return geo
  }, [arcPositions])

  const targetVeinColor = isDeepDive ? COLOR_CYAN_ACCENT : COLOR_GOLD_ACCENT
  const targetArcColor = isDeepDive ? COLOR_CYAN_PRIMARY : COLOR_GOLD_PRIMARY

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime()
    const pointer = state.pointer
    const speed = delta * 4.2

    // Color transitions
    bladeVeinMaterial.color.lerp(targetVeinColor, speed)
    lightningMaterial.color.lerp(targetArcColor, speed)
    bladeArmorMaterial.wireframe = isCad
    bladeVeinMaterial.wireframe = isCad

    // Genesis Assembly Unfurl interpolation: [0.65, 0.95]
    const pUnfurl = THREE.MathUtils.clamp((assemblyProgress - 0.65) / 0.3, 0, 1)

    // Smooth hover progress: lerps 0→1 on enter, 1→0 on leave (~0.3s transition)
    hoverProgressRef.current = THREE.MathUtils.lerp(
      hoverProgressRef.current,
      isHovered ? 1.0 : 0.0,
      delta * 3.5
    )

    // Flare factor: idle (0), hover (smooth 0→0.85), overdrive (1.45), click kinetic pulse (always additive)
    // Fix: kineticPulse is separated as an additive term so it fires regardless of hover/overdrive state
    const baseFlareMagnitude = isOverdrive ? 1.45 : hoverProgressRef.current * 0.85
    const flare = (baseFlareMagnitude + kineticPulse * 1.35) * pUnfurl

    // Fluidic aerodynamic inertia: wingtips flex against levitation vertical velocity
    const fluidInertiaZ = Math.cos(t * 1.5) * 0.045 * pUnfurl

    // Idle sinusoidal breathing
    const breathUpper = (Math.sin(t * 1.8) * 0.04 + fluidInertiaZ) * pUnfurl
    const breathMid = (Math.sin(t * 1.8 + 0.6) * 0.035 + fluidInertiaZ * 0.8) * pUnfurl
    const breathLower = (Math.sin(t * 1.8 + 1.2) * 0.03 - fluidInertiaZ * 0.6) * pUnfurl

    // Cursor tracking parallax
    const gazeY = pointer.x * 0.1 * pUnfurl
    const gazeX = pointer.y * 0.06 * pUnfurl

    // Folded rest rotation offset when dormant
    const foldedZ = (1 - pUnfurl) * 0.8

    // ──────────────────────────────────────────────────────────
    // 1. Upper Wings (Arched High & Swept Backward)
    // ──────────────────────────────────────────────────────────
    if (upperLeftWingRef.current) {
      upperLeftWingRef.current.rotation.z = THREE.MathUtils.lerp(
        upperLeftWingRef.current.rotation.z,
        0.18 + breathUpper + flare * 0.42 - foldedZ,
        speed
      )
      upperLeftWingRef.current.rotation.y = THREE.MathUtils.lerp(
        upperLeftWingRef.current.rotation.y,
        -0.28 + gazeY - flare * 0.48,
        speed
      )
      upperLeftWingRef.current.rotation.x = THREE.MathUtils.lerp(
        upperLeftWingRef.current.rotation.x,
        gazeX - kineticPulse * 0.2,
        speed
      )
      upperLeftWingRef.current.scale.set(pUnfurl, pUnfurl, pUnfurl)
    }
    if (upperRightWingRef.current) {
      upperRightWingRef.current.rotation.z = THREE.MathUtils.lerp(
        upperRightWingRef.current.rotation.z,
        -0.18 - breathUpper - flare * 0.42 + foldedZ,
        speed
      )
      upperRightWingRef.current.rotation.y = THREE.MathUtils.lerp(
        upperRightWingRef.current.rotation.y,
        0.28 + gazeY + flare * 0.48,
        speed
      )
      upperRightWingRef.current.rotation.x = THREE.MathUtils.lerp(
        upperRightWingRef.current.rotation.x,
        gazeX - kineticPulse * 0.2,
        speed
      )
      upperRightWingRef.current.scale.set(pUnfurl, pUnfurl, pUnfurl)
    }

    // ──────────────────────────────────────────────────────────
    // 2. Mid Wings (Flared Wide Horizontally)
    // ──────────────────────────────────────────────────────────
    if (midLeftWingRef.current) {
      midLeftWingRef.current.rotation.z = THREE.MathUtils.lerp(
        midLeftWingRef.current.rotation.z,
        -0.06 + breathMid + flare * 0.35 - foldedZ * 0.6,
        speed
      )
      midLeftWingRef.current.rotation.y = THREE.MathUtils.lerp(
        midLeftWingRef.current.rotation.y,
        -0.36 + gazeY - flare * 0.36,
        speed
      )
      midLeftWingRef.current.scale.set(pUnfurl, pUnfurl, pUnfurl)
    }
    if (midRightWingRef.current) {
      midRightWingRef.current.rotation.z = THREE.MathUtils.lerp(
        midRightWingRef.current.rotation.z,
        0.06 - breathMid - flare * 0.35 + foldedZ * 0.6,
        speed
      )
      midRightWingRef.current.rotation.y = THREE.MathUtils.lerp(
        midRightWingRef.current.rotation.y,
        0.36 + gazeY + flare * 0.36,
        speed
      )
      midRightWingRef.current.scale.set(pUnfurl, pUnfurl, pUnfurl)
    }

    // ──────────────────────────────────────────────────────────
    // 3. Lower Wings (Curved Forward Around Hips Like a Throne)
    // ──────────────────────────────────────────────────────────
    if (lowerLeftWingRef.current) {
      lowerLeftWingRef.current.rotation.z = THREE.MathUtils.lerp(
        lowerLeftWingRef.current.rotation.z,
        -0.24 + breathLower + flare * 0.28,
        speed
      )
      lowerLeftWingRef.current.rotation.y = THREE.MathUtils.lerp(
        lowerLeftWingRef.current.rotation.y,
        0.18 + gazeY * 0.5 - flare * 0.2,
        speed
      )
      lowerLeftWingRef.current.scale.set(pUnfurl, pUnfurl, pUnfurl)
    }
    if (lowerRightWingRef.current) {
      lowerRightWingRef.current.rotation.z = THREE.MathUtils.lerp(
        lowerRightWingRef.current.rotation.z,
        0.24 - breathLower - flare * 0.28,
        speed
      )
      lowerRightWingRef.current.rotation.y = THREE.MathUtils.lerp(
        lowerRightWingRef.current.rotation.y,
        -0.18 + gazeY * 0.5 + flare * 0.2,
        speed
      )
      lowerRightWingRef.current.scale.set(pUnfurl, pUnfurl, pUnfurl)
    }

    // ──────────────────────────────────────────────────────────
    // 4. Dynamic Electric Arcs between wingtips & Click Surge
    // ──────────────────────────────────────────────────────────
    if (electricArcsRef.current && pUnfurl > 0.85) {
      const arcTrigger = isOverdrive || kineticPulse > 0.1 || Math.sin(t * 8) > 0.25
      if (arcTrigger) {
        const targetOpacity = isOverdrive ? 0.95 : kineticPulse > 0.1 ? 1.0 : 0.65
        lightningMaterial.opacity = THREE.MathUtils.lerp(
          lightningMaterial.opacity,
          targetOpacity,
          delta * 14
        )

        // Generate 4 jittered midpoint displacement line segments
        const posAttr = arcGeometry.attributes.position as THREE.BufferAttribute
        const arr = posAttr.array as Float32Array

        // Upper to Mid Left Wing
        arr[0] = -2.3 + (Math.random() - 0.5) * 0.15
        arr[1] = 2.2 + (Math.random() - 0.5) * 0.15
        arr[2] = -0.4
        arr[3] = -2.9 + (Math.random() - 0.5) * 0.15
        arr[4] = 0.9 + (Math.random() - 0.5) * 0.15
        arr[5] = -0.3

        // Upper to Mid Right Wing
        arr[6] = 2.3 + (Math.random() - 0.5) * 0.15
        arr[7] = 2.2 + (Math.random() - 0.5) * 0.15
        arr[8] = -0.4
        arr[9] = 2.9 + (Math.random() - 0.5) * 0.15
        arr[10] = 0.9 + (Math.random() - 0.5) * 0.15
        arr[11] = -0.3

        // Mid to Lower Left Wing
        arr[12] = -2.9 + (Math.random() - 0.5) * 0.15
        arr[13] = 0.9 + (Math.random() - 0.5) * 0.15
        arr[14] = -0.3
        arr[15] = -2.2 + (Math.random() - 0.5) * 0.15
        arr[16] = -0.9 + (Math.random() - 0.5) * 0.15
        arr[17] = 0.1

        // Mid to Lower Right Wing
        arr[18] = 2.9 + (Math.random() - 0.5) * 0.15
        arr[19] = 0.9 + (Math.random() - 0.5) * 0.15
        arr[20] = -0.3
        arr[21] = 2.2 + (Math.random() - 0.5) * 0.15
        arr[22] = -0.9 + (Math.random() - 0.5) * 0.15
        arr[23] = 0.1

        posAttr.needsUpdate = true
      } else {
        lightningMaterial.opacity = THREE.MathUtils.lerp(lightningMaterial.opacity, 0, delta * 10)
      }
    } else if (lightningMaterial) {
      lightningMaterial.opacity = 0
    }
  })

  // Shared Blade Component
  const BladeMesh = ({ cfg, isLeft }: { cfg: WingBladeConfig; isLeft: boolean }) => (
    <group
      position={[isLeft ? cfg.x : -cfg.x, cfg.y, cfg.z]}
      rotation={[0, isLeft ? cfg.rotY : -cfg.rotY, isLeft ? cfg.rotZ : -cfg.rotZ]}
      scale={[cfg.scale, cfg.scale, cfg.scale]}
    >
      {/* Tapered Titanium Blade */}
      <mesh material={bladeArmorMaterial}>
        <boxGeometry args={[0.07, 0.44, 0.018]} />
      </mesh>
      {/* Golden Glowing Vein running along blade spine */}
      <mesh position={[0, 0, 0.011]} material={bladeVeinMaterial}>
        <boxGeometry args={[0.018, 0.38, 0.006]} />
      </mesh>
    </group>
  )

  return (
    <group position={[0, 0, -0.45]}>
      {/* Upper Wings */}
      <group ref={upperLeftWingRef}>
        {upperBlades.map((cfg, i) => (
          <BladeMesh key={i} cfg={cfg} isLeft={true} />
        ))}
      </group>
      <group ref={upperRightWingRef}>
        {upperBlades.map((cfg, i) => (
          <BladeMesh key={i} cfg={cfg} isLeft={false} />
        ))}
      </group>

      {/* Mid Wings */}
      <group ref={midLeftWingRef}>
        {midBlades.map((cfg, i) => (
          <BladeMesh key={i} cfg={cfg} isLeft={true} />
        ))}
      </group>
      <group ref={midRightWingRef}>
        {midBlades.map((cfg, i) => (
          <BladeMesh key={i} cfg={cfg} isLeft={false} />
        ))}
      </group>

      {/* Lower Wings */}
      <group ref={lowerLeftWingRef}>
        {lowerBlades.map((cfg, i) => (
          <BladeMesh key={i} cfg={cfg} isLeft={true} />
        ))}
      </group>
      <group ref={lowerRightWingRef}>
        {lowerBlades.map((cfg, i) => (
          <BladeMesh key={i} cfg={cfg} isLeft={false} />
        ))}
      </group>

      {/* Dynamic Lightning Electric Arcs between wingtips */}
      <primitive object={arcGeometry} attach="geometry" />
      <lineSegments ref={electricArcsRef} geometry={arcGeometry} material={lightningMaterial} />
    </group>
  )
}
