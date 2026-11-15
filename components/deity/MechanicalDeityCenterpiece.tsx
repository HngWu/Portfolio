"use client"

import React, { useRef, useEffect, useCallback, useState } from "react"
import { useMechanicalDeityStore } from "@/store/useMechanicalDeityStore"
import { DeityHaloGyroscope } from "./DeityHaloGyroscope"
import { DeityEnergySpotlight } from "./DeityEnergySpotlight"
import { DeityEmissionPulse } from "./DeityEmissionPulse"
import { DeityHudHotspots } from "./DeityHudHotspots"
import { DeityLightningCanvas } from "./DeityLightningCanvas"
import { Zap, Volume2, VolumeX, Sparkles, Layers } from "lucide-react"

interface MechanicalDeityCenterpieceProps {
  className?: string
  priority?: boolean
}

export function MechanicalDeityCenterpiece({
  className = "",
  priority = false,
}: MechanicalDeityCenterpieceProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const cardRef = useRef<HTMLDivElement | null>(null)
  const bgRef = useRef<HTMLDivElement | null>(null)
  const bodyRef = useRef<HTMLDivElement | null>(null)
  const fgRef = useRef<HTMLDivElement | null>(null)

  const isHovered = useMechanicalDeityStore((s) => s.isHovered)
  const cursorPixel = useMechanicalDeityStore((s) => s.cursorPixel)
  const overdrive = useMechanicalDeityStore((s) => s.overdrive)
  const soundEnabled = useMechanicalDeityStore((s) => s.soundEnabled)
  const reducedMotion = useMechanicalDeityStore((s) => s.reducedMotion)
  const setHovered = useMechanicalDeityStore((s) => s.setHovered)
  const setMouseCoordinates = useMechanicalDeityStore((s) => s.setMouseCoordinates)
  const triggerOverdrive = useMechanicalDeityStore((s) => s.triggerOverdrive)
  const toggleSound = useMechanicalDeityStore((s) => s.toggleSound)
  const setReducedMotion = useMechanicalDeityStore((s) => s.setReducedMotion)

  // Motion physics state (colossal momentum lerp)
  const targetXRef = useRef(0)
  const targetYRef = useRef(0)
  const currentXRef = useRef(0)
  const currentYRef = useRef(0)
  const rafIdRef = useRef<number | null>(null)

  // Check user preference for reduced motion
  useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
      setReducedMotion(mediaQuery.matches)
      const listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
      mediaQuery.addEventListener("change", listener)
      return () => mediaQuery.removeEventListener("change", listener)
    }
  }, [setReducedMotion])

  // Smoothed 3D Momentum Loop
  useEffect(() => {
    if (reducedMotion) {
      if (cardRef.current) {
        cardRef.current.style.transform = "rotateX(0deg) rotateY(0deg)"
      }
      return
    }

    const DAMPING = 0.045 // Colossal, heavy mechanical inertia

    const updatePhysics = () => {
      // Lerp current values towards target
      currentXRef.current += (targetXRef.current - currentXRef.current) * DAMPING
      currentYRef.current += (targetYRef.current - currentYRef.current) * DAMPING

      const normX = currentXRef.current
      const normY = currentYRef.current

      // Container Tilt angles: Max 14 degrees
      const tiltX = -normY * 14
      const tiltY = normX * 14

      if (cardRef.current) {
        cardRef.current.style.transform = `perspective(1200px) rotateX(${tiltX.toFixed(
          2
        )}deg) rotateY(${tiltY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`
      }

      // Parallax Layer Shifts (Stereo depth effect)
      if (bgRef.current) {
        // Deep Space Background: Recedes (-60px) and moves counter-intuitively
        const bgShiftX = normX * -12
        const bgShiftY = normY * -12
        bgRef.current.style.transform = `translate3d(${bgShiftX.toFixed(2)}px, ${bgShiftY.toFixed(
          2
        )}px, -60px) scale(1.15)`
      }

      if (bodyRef.current) {
        // Deity Body: Midground (+20px)
        const bodyShiftX = normX * 6
        const bodyShiftY = normY * 6
        bodyRef.current.style.transform = `translate3d(${bodyShiftX.toFixed(2)}px, ${bodyShiftY.toFixed(
          2
        )}px, 20px)`
      }

      if (fgRef.current) {
        // Foreground Greatsword & Asteroids (+75px): Strong forward pop
        const fgShiftX = normX * 24
        const fgShiftY = normY * 24
        fgRef.current.style.transform = `translate3d(${fgShiftX.toFixed(2)}px, ${fgShiftY.toFixed(
          2
        )}px, 75px) scale(1.08)`
      }

      rafIdRef.current = requestAnimationFrame(updatePhysics)
    }

    rafIdRef.current = requestAnimationFrame(updatePhysics)

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current)
      }
    }
  }, [reducedMotion])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) return

      const pixelX = e.clientX - rect.left
      const pixelY = e.clientY - rect.top

      // Normalized coordinates from -1.0 to +1.0
      const normX = (pixelX / rect.width) * 2 - 1
      const normY = (pixelY / rect.height) * 2 - 1

      targetXRef.current = normX
      targetYRef.current = normY

      setMouseCoordinates(normX, normY, pixelX, pixelY)
    },
    [setMouseCoordinates]
  )

  const handleMouseEnter = useCallback(() => {
    setHovered(true)
  }, [setHovered])

  const handleMouseLeave = useCallback(() => {
    setHovered(false)
    targetXRef.current = 0
    targetYRef.current = 0
  }, [setHovered])

  return (
    <div
      ref={containerRef}
      data-deity-centerpiece="true"
      aria-label="Interactive Mechanical Deity Centerpiece"
      className={`relative w-full max-w-[620px] mx-auto aspect-[3/4] sm:aspect-[765/1024] select-none ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* 3D Perspective Card Wrapper */}
      <div
        ref={cardRef}
        className="w-full h-full relative rounded-3xl overflow-hidden border border-white/15 bg-[#08080A] shadow-[0_20px_50px_rgba(0,0,0,0.8)] transition-shadow duration-500 hover:shadow-[0_25px_60px_rgba(0,240,255,0.25)]"
        style={{
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
      >
        {/* ======================================================== */}
        {/* LAYER 1: Deep Space Background (Z: -60px)                 */}
        {/* ======================================================== */}
        <div
          ref={bgRef}
          className="absolute inset-0 w-full h-full pointer-events-none will-change-transform"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/deity/layer-bg-space.webp"
            alt="Deep Space Cosmic Void"
            className="w-full h-full object-cover"
          />
        </div>

        {/* ======================================================== */}
        {/* LAYER 2: 3D Astrolabe Halo Gyroscope (Z: -20px)          */}
        {/* ======================================================== */}
        <DeityHaloGyroscope reducedMotion={reducedMotion} />

        {/* ======================================================== */}
        {/* LAYER 3: Main Deity Titan Body (Z: 20px)                  */}
        {/* ======================================================== */}
        <div
          ref={bodyRef}
          className="absolute inset-0 w-full h-full pointer-events-none will-change-transform"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/deity/layer-deity-body.webp"
            alt="Mechanical Deity Colossus"
            className="w-full h-full object-cover"
          />
        </div>

        {/* ======================================================== */}
        {/* LAYER 4: Independent Emission Pulse Mask (Z: 22px)        */}
        {/* ======================================================== */}
        <DeityEmissionPulse overdrive={overdrive} />

        {/* ======================================================== */}
        {/* LAYER 5: Dynamic Color-Dodge Energy Spotlight (Z: 35px)   */}
        {/* ======================================================== */}
        <DeityEnergySpotlight isHovered={isHovered} cursorPixel={cursorPixel} />

        {/* ======================================================== */}
        {/* LAYER 6: Foreground Greatsword & Asteroids (Z: 75px)      */}
        {/* ======================================================== */}
        <div
          ref={fgRef}
          className="absolute inset-0 w-full h-full pointer-events-none will-change-transform mix-blend-screen opacity-90"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/deity/layer-fg-sword-asteroids.webp"
            alt="Celestial Claymore and Asteroids"
            className="w-full h-full object-cover"
          />
        </div>

        {/* ======================================================== */}
        {/* LAYER 7: Interactive HUD Hotspots (Z: 85px)               */}
        {/* ======================================================== */}
        <DeityHudHotspots />

        {/* ======================================================== */}
        {/* LAYER 8: Procedural Lightning & Sparks Canvas (Z: 95px)   */}
        {/* ======================================================== */}
        <DeityLightningCanvas />

        {/* ======================================================== */}
        {/* VIGNETTE & CORNER CROSSHAIRS                             */}
        {/* ======================================================== */}
        <div className="absolute inset-0 pointer-events-none z-30 rounded-3xl ring-1 ring-inset ring-white/10" />
        <div className="absolute inset-0 pointer-events-none z-30 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(6,7,10,0.6)_85%,rgba(6,7,10,0.95)_100%)]" />

        {/* Top Floating Telemetry Header */}
        <div className="absolute top-4 left-4 right-4 z-40 flex items-center justify-between pointer-events-none">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-400/30 bg-black/60 backdrop-blur-md text-[11px] font-mono tracking-wider text-cyan-300">
            <span
              className={`size-2 rounded-full ${
                overdrive ? "bg-purple-400 animate-ping" : "bg-lume-primary animate-pulse"
              }`}
            />
            <span>SYS.SANCTUM // TITAN TITL 2.5D</span>
          </div>

          <div className="flex items-center gap-2 pointer-events-auto">
            {/* Overdrive Trigger */}
            <button
              type="button"
              onClick={() => triggerOverdrive(4000)}
              className={`px-3 py-1 rounded-full border text-[10px] font-mono font-bold tracking-wider transition-all duration-300 cursor-pointer ${
                overdrive
                  ? "bg-purple-500/30 border-purple-400 text-purple-200 shadow-[0_0_15px_#A855F7]"
                  : "bg-white/5 border-white/20 text-white/70 hover:border-lume-primary hover:text-lume-primary"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Zap className="size-3" />
                <span>{overdrive ? "OVERDRIVE ACTIVE" : "OVERDRIVE"}</span>
              </span>
            </button>

            {/* Sound Toggle */}
            <button
              type="button"
              onClick={toggleSound}
              aria-label={soundEnabled ? "Mute Deity Audio" : "Enable Deity Audio"}
              className="p-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-white/60 hover:text-white transition-colors cursor-pointer"
            >
              {soundEnabled ? <Volume2 className="size-3.5" /> : <VolumeX className="size-3.5" />}
            </button>
          </div>
        </div>

        {/* Bottom Status Bar */}
        <div className="absolute bottom-4 left-4 right-4 z-40 flex items-center justify-between pointer-events-none font-mono text-[10px] text-white/50">
          <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
            <span className="text-lume-primary">STATUS</span>
            <span>HYPER-PARALLAX ONLINE</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
            <Sparkles className="size-3 text-cyan-300" />
            <span>MOMENTUM DAMPING 0.045</span>
          </div>
        </div>
      </div>
    </div>
  )
}
