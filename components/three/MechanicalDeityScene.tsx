"use client"

import React, { Suspense, useRef, useEffect, useState } from "react"
import { Canvas, useFrame, useThree, ThreeEvent } from "@react-three/fiber"
import { EffectComposer, Bloom } from "@react-three/postprocessing"
import * as THREE from "three"
import { useViewModeStore } from "@/store/useViewModeStore"
import { useDeityControls } from "@/store/useDeityControls"
import { usePerformanceStore } from "@/store/usePerformanceStore"
import { SingularityCore } from "./deity/SingularityCore"
import { DeityArmorBust } from "./deity/DeityArmorBust"
import { SeraphicWings } from "./deity/SeraphicWings"
import { AstrolabeHalos } from "./deity/AstrolabeHalos"
import { NaniteSwarm } from "./deity/NaniteSwarm"

function CameraAndAssemblyController({ isMobile }: { isMobile: boolean }) {
  const tickAssembly = useDeityControls((s) => s.tickAssembly)
  const tickKineticPulse = useDeityControls((s) => s.tickKineticPulse)
  const assemblyProgress = useDeityControls((s) => s.assemblyProgress)
  const { camera } = useThree()

  const targetZ = isMobile ? 11.2 : 9.2
  const startZ = isMobile ? 16.0 : 14.5

  useFrame((_, delta) => {
    // 1. Advance Genesis Assembly state at 60fps
    tickAssembly(performance.now())

    // 2. Decay interactive kinetic recoil pulse
    tickKineticPulse(delta)

    // 3. Camera Cinematic Dolly-In (startZ -> targetZ)
    const currentTargetZ = THREE.MathUtils.lerp(startZ, targetZ, assemblyProgress)
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, currentTargetZ, 0.06)
  })

  return null
}

function DeityAssembly() {
  const deityGroupRef = useRef<THREE.Group>(null)
  const deityMode = useDeityControls((s) => s.mode)
  const kineticPulse = useDeityControls((s) => s.kineticPulse)
  const isOverdrive = deityMode === "OVERDRIVE"

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime()
    const pointer = state.pointer
    const speed = delta * 3.5

    if (deityGroupRef.current) {
      // ──────────────────────────────────────────────────────────
      // Multi-Harmonic Biomechanical Levitation Physics
      // ──────────────────────────────────────────────────────────
      // 1. Primary deep cosmic floating wave (~0.9 Hz)
      const primaryFloatY = 0.45 + Math.sin(t * 0.9) * 0.16 + kineticPulse * 0.08
      deityGroupRef.current.position.y = THREE.MathUtils.lerp(
        deityGroupRef.current.position.y,
        primaryFloatY,
        speed
      )

      // 2. Secondary pitch & roll breathing harmonic
      const pitchSway = Math.sin(t * 0.9 - 0.4) * 0.035
      const rollSway = Math.cos(t * 0.45) * 0.022

      // 3. Torso damped cursor parallax (secondary to independent head tracking)
      const targetRotY = pointer.x * 0.18
      const targetRotX = -pointer.y * 0.10 + pitchSway
      const targetRotZ = rollSway - pointer.x * 0.04

      deityGroupRef.current.rotation.y = THREE.MathUtils.lerp(
        deityGroupRef.current.rotation.y,
        targetRotY,
        speed
      )
      deityGroupRef.current.rotation.x = THREE.MathUtils.lerp(
        deityGroupRef.current.rotation.x,
        targetRotX,
        speed
      )
      deityGroupRef.current.rotation.z = THREE.MathUtils.lerp(
        deityGroupRef.current.rotation.z,
        targetRotZ,
        speed
      )

      // 4. Kinetic Recoil Depth Kick on click
      const recoilZ = -kineticPulse * 0.18
      deityGroupRef.current.position.z = THREE.MathUtils.lerp(
        deityGroupRef.current.position.z,
        recoilZ,
        delta * 6
      )

      // Overdrive subtle vibrational tremor
      if (isOverdrive) {
        deityGroupRef.current.position.x = (Math.random() - 0.5) * 0.03
      } else {
        deityGroupRef.current.position.x = 0
      }
    }
  })

  return (
    <group ref={deityGroupRef} position={[0, 0.45, 0]}>
      <AstrolabeHalos />
      <SeraphicWings />
      <SingularityCore />
      <DeityArmorBust />
      <NaniteSwarm />
    </group>
  )
}

function SceneLighting() {
  const mode = useViewModeStore((s) => s.mode)
  const deityMode = useDeityControls((s) => s.mode)
  const kineticPulse = useDeityControls((s) => s.kineticPulse)
  const isDeepDive = mode === "deep"
  const isOverdrive = deityMode === "OVERDRIVE"

  const lightColor = isDeepDive ? "#00F0FF" : "#F5B041"
  const rimColor = isDeepDive ? "#0066FF" : "#FF7700"
  const cursorLightColor = isDeepDive ? "#6AFFFF" : "#FFE58F"

  const cursorLightRef = useRef<THREE.PointLight>(null)

  useFrame((state, delta) => {
    const pointer = state.pointer
    if (cursorLightRef.current) {
      // Dynamic 3D Cursor Specular Point Light following mouse in space
      cursorLightRef.current.position.x = THREE.MathUtils.lerp(
        cursorLightRef.current.position.x,
        pointer.x * 5.5,
        delta * 6
      )
      cursorLightRef.current.position.y = THREE.MathUtils.lerp(
        cursorLightRef.current.position.y,
        pointer.y * 4.0,
        delta * 6
      )
      cursorLightRef.current.position.z = 3.8
    }
  })

  return (
    <>
      <ambientLight intensity={0.4} color="#0d111d" />
      <directionalLight
        position={[4, 6, 5]}
        intensity={(isOverdrive ? 3.0 : 1.8) + kineticPulse * 1.5}
        color={lightColor}
      />
      <directionalLight
        position={[-5, -4, -3]}
        intensity={1.2}
        color={rimColor}
      />
      <pointLight
        position={[0, 0.22, 1.8]}
        intensity={(isOverdrive ? 2.5 : 1.4) + kineticPulse * 2.0}
        color={lightColor}
        distance={7}
      />
      {/* Interactive 3D Cursor Specular Point Light */}
      <pointLight
        ref={cursorLightRef}
        position={[0, 0, 3.8]}
        intensity={isOverdrive ? 2.0 : 1.2}
        color={cursorLightColor}
        distance={8}
      />
    </>
  )
}

function PostprocessingEffects() {
  const deityMode = useDeityControls((s) => s.mode)
  const assemblyProgress = useDeityControls((s) => s.assemblyProgress)
  const kineticPulse = useDeityControls((s) => s.kineticPulse)
  const isOverdrive = deityMode === "OVERDRIVE"
  const enable3DModel = usePerformanceStore((s) => s.enable3DModel)

  if (!enable3DModel) return null

  // Peak bloom intensity during ignition
  const ignitionSurge =
    assemblyProgress > 0.15 && assemblyProgress < 0.6
      ? Math.sin(((assemblyProgress - 0.15) / 0.45) * Math.PI) * 1.8
      : 0

  return (
    <EffectComposer multisampling={0}>
      <Bloom
        luminanceThreshold={0.25}
        luminanceSmoothing={0.85}
        intensity={(isOverdrive ? 2.4 : 1.3) + ignitionSurge + kineticPulse * 1.2}
        mipmapBlur
      />
    </EffectComposer>
  )
}

function ClickInteractionPlane() {
  const triggerShockwave = useDeityControls((s) => s.triggerShockwave)

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    triggerShockwave(e.point || new THREE.Vector3(0, 0, 0))
  }

  return (
    <mesh
      visible={false}
      position={[0, 0, 0]}
      onPointerDown={handlePointerDown}
    >
      <planeGeometry args={[100, 100]} />
      <meshBasicMaterial transparent opacity={0} />
    </mesh>
  )
}

export function MechanicalDeityScene() {
  const setHovered = useDeityControls((s) => s.setHovered)
  const triggerAssembly = useDeityControls((s) => s.triggerAssembly)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Auto-initiate Genesis Assembly on initial page mount
  useEffect(() => {
    triggerAssembly()
  }, [triggerAssembly])

  return (
    <div
      className="w-full h-full relative cursor-crosshair select-none"
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <Canvas
        camera={{
          position: [0, 0, isMobile ? 16.0 : 14.5], // Starts far, dollies in during assembly
          fov: 45,
          near: 0.1,
          far: 60,
        }}
        dpr={typeof window !== "undefined" ? Math.min(window.devicePixelRatio, 2) : 1}
        gl={{
          antialias: true,
          powerPreference: "high-performance",
          alpha: true,
        }}
      >
        <Suspense fallback={null}>
          <CameraAndAssemblyController isMobile={isMobile} />
          <SceneLighting />
          <ClickInteractionPlane />
          <DeityAssembly />
          <PostprocessingEffects />
        </Suspense>
      </Canvas>
    </div>
  )
}
