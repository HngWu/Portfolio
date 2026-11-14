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

function CameraAndAssemblyController({
  isMobile,
  isVisibleRef,
}: {
  isMobile: boolean
  isVisibleRef: React.RefObject<boolean>
}) {
  const tickAssembly = useDeityControls((s) => s.tickAssembly)
  const tickKineticPulse = useDeityControls((s) => s.tickKineticPulse)
  const assemblyProgress = useDeityControls((s) => s.assemblyProgress)
  const { camera } = useThree()

  const targetZ = isMobile ? 11.2 : 9.2
  const startZ = isMobile ? 16.0 : 14.5

  useFrame((_, delta) => {
    if (!isVisibleRef.current || (typeof document !== "undefined" && document.hidden)) return

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

function DeityAssembly({ isVisibleRef }: { isVisibleRef: React.RefObject<boolean> }) {
  const deityGroupRef = useRef<THREE.Group>(null)
  const deityMode = useDeityControls((s) => s.mode)
  const kineticPulse = useDeityControls((s) => s.kineticPulse)
  const isOverdrive = deityMode === "OVERDRIVE"

  useFrame((state, delta) => {
    if (!isVisibleRef.current || (typeof document !== "undefined" && document.hidden)) return

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

function SceneLighting({ isVisibleRef }: { isVisibleRef: React.RefObject<boolean> }) {
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
    if (!isVisibleRef.current || (typeof document !== "undefined" && document.hidden)) return

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

function MechanicalDeityBlueprintFallback() {
  return (
    <div className="w-full h-full relative flex flex-col items-center justify-center overflow-hidden bg-[#06070A] select-none">
      {/* Blueprint Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Dual Radial Glow (Cyan & Gold) */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,240,255,0.08)_0%,rgba(245,176,65,0.05)_45%,transparent_70%)] pointer-events-none" />

      {/* Corner Crosshair Accents */}
      <div className="absolute top-8 left-8 sm:top-12 sm:left-12 size-4 border-t-2 border-l-2 border-cyan-400/40 pointer-events-none" />
      <div className="absolute top-8 right-8 sm:top-12 sm:right-12 size-4 border-t-2 border-r-2 border-amber-400/40 pointer-events-none" />
      <div className="absolute bottom-8 left-8 sm:bottom-12 sm:left-12 size-4 border-b-2 border-l-2 border-amber-400/40 pointer-events-none" />
      <div className="absolute bottom-8 right-8 sm:bottom-12 sm:right-12 size-4 border-b-2 border-r-2 border-cyan-400/40 pointer-events-none" />

      {/* Center Visual: Astrolabe, Halos & Singularity Core Blueprint */}
      <div className="relative flex flex-col items-center justify-center z-10 px-4">
        {/* Ambient Pulse Glow */}
        <div className="absolute size-72 sm:size-96 rounded-full bg-cyan-500/10 blur-3xl animate-pulse pointer-events-none" />
        <div className="absolute size-48 sm:size-64 rounded-full bg-amber-500/10 blur-2xl animate-pulse pointer-events-none" />

        {/* Concentric Rotating Astrolabe Rings */}
        <div className="relative size-44 sm:size-60 rounded-full border border-cyan-400/30 flex items-center justify-center">
          {/* Outer dashed ring */}
          <div className="absolute -inset-4 sm:-inset-6 rounded-full border border-dashed border-amber-400/30 animate-spin [animation-duration:35s] pointer-events-none" />
          {/* Middle dotted ring */}
          <div className="absolute -inset-8 sm:-inset-12 rounded-full border border-dotted border-cyan-400/20 animate-spin [animation-duration:50s] [animation-direction:reverse] pointer-events-none" />
          {/* Seraphic wing arc brackets */}
          <div className="absolute -inset-12 sm:-inset-16 rounded-full border-t border-b border-cyan-400/30 pointer-events-none" />
          <div className="absolute -inset-16 sm:-inset-20 rounded-full border-l border-r border-amber-400/20 pointer-events-none" />

          {/* Center Singularity Core Emblem */}
          <div className="relative size-24 sm:size-32 rounded-2xl border border-white/10 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center shadow-[0_0_40px_rgba(0,240,255,0.15)]">
            <div className="absolute size-10 rounded-full bg-cyan-400/20 blur-md animate-ping [animation-duration:3s]" />
            <div className="absolute size-6 rounded-full bg-gradient-to-tr from-cyan-400 to-amber-400 opacity-60 shadow-[0_0_20px_rgba(0,240,255,0.8)]" />

            {/* Sacred Geometry Biomechanical SVG Icon */}
            <svg
              className="size-12 sm:size-14 text-cyan-300 drop-shadow-[0_0_12px_rgba(0,240,255,0.6)]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
              <path d="m4.93 4.93 2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12" />
              <polygon points="12 4 19 8 19 16 12 20 5 16 5 8" strokeDasharray="2 2" />
            </svg>
          </div>
        </div>

        {/* Blueprint Badge */}
        <div className="mt-8 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cyan-400/30 bg-cyan-500/10 text-cyan-300 font-mono text-[11px] font-medium tracking-wider shadow-[0_0_20px_rgba(0,240,255,0.15)]">
          <span className="size-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>BLUEPRINT SCHEMATIC // MECHANICAL DEITY</span>
        </div>

        {/* Description / Instructions */}
        <h3 className="mt-4 text-base sm:text-xl font-bold font-mono tracking-wider text-white uppercase text-center">
          Omniscient Architecture • Eco Mode
        </h3>
        <p className="mt-2 text-xs font-mono text-white/50 text-center max-w-sm sm:max-w-md leading-relaxed px-4">
          WebGL Canvas paused for maximum power efficiency. Toggle &apos;Live 3D&apos; in performance telemetry to ignite real-time R3F simulation.
        </p>

        {/* Telemetry specs footer */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 font-mono text-[10px] text-white/40 uppercase tracking-wider">
          <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-cyan-400/80">SINGULARITY CORE</span>
          <span>•</span>
          <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-amber-400/80">ASTROLABE HALOS</span>
          <span>•</span>
          <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-cyan-400/80">SERAPHIC WINGS</span>
          <span>•</span>
          <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-amber-400/80">NANITE SWARM</span>
        </div>
      </div>
    </div>
  )
}

export function MechanicalDeityScene() {
  const setHovered = useDeityControls((s) => s.setHovered)
  const triggerAssembly = useDeityControls((s) => s.triggerAssembly)
  const enable3DModel = usePerformanceStore((s) => s.enable3DModel)
  const [isMobile, setIsMobile] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const isVisibleRef = useRef<boolean>(true)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Auto-initiate Genesis Assembly on initial page mount when 3D is active
  useEffect(() => {
    if (enable3DModel) {
      triggerAssembly()
    }
  }, [triggerAssembly, enable3DModel])

  // Track viewport intersection and document visibility for occlusion culling
  useEffect(() => {
    let isIntersecting = true

    const updateVisibility = () => {
      const isDocVisible = typeof document !== "undefined" ? !document.hidden : true
      isVisibleRef.current = isIntersecting && isDocVisible
    }

    if (typeof IntersectionObserver !== "undefined" && containerRef.current) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          isIntersecting = entry.isIntersecting
          updateVisibility()
        },
        { threshold: 0 }
      )
      observer.observe(containerRef.current)

      const handleVisibilityChange = () => {
        updateVisibility()
      }
      document.addEventListener("visibilitychange", handleVisibilityChange)

      return () => {
        observer.disconnect()
        document.removeEventListener("visibilitychange", handleVisibilityChange)
      }
    } else {
      const handleVisibilityChange = () => {
        updateVisibility()
      }
      document.addEventListener("visibilitychange", handleVisibilityChange)
      return () => {
        document.removeEventListener("visibilitychange", handleVisibilityChange)
      }
    }
  }, [])

  if (!enable3DModel) {
    return (
      <div ref={containerRef} className="w-full h-full relative">
        <MechanicalDeityBlueprintFallback />
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
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
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          powerPreference: "high-performance",
          alpha: true,
        }}
      >
        <Suspense fallback={null}>
          <CameraAndAssemblyController isMobile={isMobile} isVisibleRef={isVisibleRef} />
          <SceneLighting isVisibleRef={isVisibleRef} />
          <ClickInteractionPlane />
          <DeityAssembly isVisibleRef={isVisibleRef} />
          <PostprocessingEffects />
        </Suspense>
      </Canvas>
    </div>
  )
}
