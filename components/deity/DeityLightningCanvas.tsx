"use client"

import React, { useRef, useEffect } from "react"
import { useMechanicalDeityStore } from "@/store/useMechanicalDeityStore"
import {
  generateLightningTree,
  createCosmicSpark,
  updateCosmicSpark,
  type CosmicSpark,
  type Point,
} from "@/lib/deity/lightningMath"

interface DeityLightningCanvasProps {
  className?: string
}

export function DeityLightningCanvas({ className = "" }: DeityLightningCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const isHovered = useMechanicalDeityStore((s) => s.isHovered)
  const cursorPixel = useMechanicalDeityStore((s) => s.cursorPixel)
  const overdrive = useMechanicalDeityStore((s) => s.overdrive)
  const reducedMotion = useMechanicalDeityStore((s) => s.reducedMotion)

  const isHoveredRef = useRef(isHovered)
  const cursorPixelRef = useRef(cursorPixel)
  const overdriveRef = useRef(overdrive)
  const reducedMotionRef = useRef(reducedMotion)

  useEffect(() => {
    isHoveredRef.current = isHovered
  }, [isHovered])

  useEffect(() => {
    cursorPixelRef.current = cursorPixel
  }, [cursorPixel])

  useEffect(() => {
    overdriveRef.current = overdrive
  }, [overdrive])

  useEffect(() => {
    reducedMotionRef.current = reducedMotion
  }, [reducedMotion])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationFrameId: number
    let lastTime = performance.now()
    let isVisible = true

    // Spark particles pool
    const sparkCount = 45
    let sparks: CosmicSpark[] = []

    const initSparks = (w: number, h: number) => {
      sparks = Array.from({ length: sparkCount }, () => createCosmicSpark({ width: w, height: h }))
    }

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.floor(rect.width * dpr)
      canvas.height = Math.floor(rect.height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      if (sparks.length === 0) {
        initSparks(rect.width, rect.height)
      }
    }

    resize()
    const resizeObserver = new ResizeObserver(() => resize())
    resizeObserver.observe(canvas)

    // Visibility observer to pause RAF when offscreen
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting
    })
    intersectionObserver.observe(canvas)

    let lightningJitterTimer = 0
    let cachedLightningBranches: Point[][] = []

    const render = (now: number) => {
      animationFrameId = requestAnimationFrame(render)
      if (!isVisible) return

      const delta = Math.min((now - lastTime) / 1000, 0.1)
      lastTime = now

      const rect = canvas.getBoundingClientRect()
      const width = rect.width
      const height = rect.height

      ctx.clearRect(0, 0, width, height)

      // 1. Render Floating Cosmic Sparks
      if (!reducedMotionRef.current) {
        for (let i = 0; i < sparks.length; i++) {
          sparks[i] = updateCosmicSpark(sparks[i], { width, height }, delta)
          const spark = sparks[i]

          ctx.save()
          ctx.beginPath()
          ctx.arc(spark.x, spark.y, spark.size, 0, Math.PI * 2)
          ctx.fillStyle = `${spark.color}${spark.alpha})`
          ctx.shadowColor = spark.color.includes("255, 180") ? "#4AFFB4" : "#00F0FF"
          ctx.shadowBlur = spark.size * 4
          ctx.fill()
          ctx.restore()
        }
      }

      // 2. Render Procedural Lightning Arcs to Cursor
      if (isHoveredRef.current && !reducedMotionRef.current) {
        const cursor = cursorPixelRef.current
        const coreOrigin: Point = { x: width * 0.54, y: height * 0.30 }
        const swordOrigin: Point = { x: width * 0.40, y: height * 0.68 }

        lightningJitterTimer += delta
        // Recalculate fractal lightning path every ~60ms for organic twitch
        if (lightningJitterTimer > 0.06 || cachedLightningBranches.length === 0) {
          lightningJitterTimer = 0
          const primaryOrigin = cursor.y > height * 0.55 ? swordOrigin : coreOrigin
          cachedLightningBranches = generateLightningTree(primaryOrigin, cursor, 4, 0.36, 0.3)

          if (overdriveRef.current) {
            // In overdrive, simultaneously discharge from both core and sword!
            const secondaryBranches = generateLightningTree(swordOrigin, cursor, 4, 0.4, 0.4)
            cachedLightningBranches.push(...secondaryBranches)
          }
        }

        // Draw lightning multi-pass
        for (const branch of cachedLightningBranches) {
          if (branch.length < 2) continue

          // Pass 1: Broad Cyan Neon Glow
          ctx.save()
          ctx.beginPath()
          ctx.moveTo(branch[0].x, branch[0].y)
          for (let i = 1; i < branch.length; i++) {
            ctx.lineTo(branch[i].x, branch[i].y)
          }
          ctx.strokeStyle = overdriveRef.current
            ? "rgba(168, 85, 247, 0.7)"
            : "rgba(0, 240, 255, 0.45)"
          ctx.lineWidth = overdriveRef.current ? 7 : 5
          ctx.shadowColor = overdriveRef.current ? "#A855F7" : "#00F0FF"
          ctx.shadowBlur = 18
          ctx.stroke()
          ctx.restore()

          // Pass 2: High Intensity Core
          ctx.save()
          ctx.beginPath()
          ctx.moveTo(branch[0].x, branch[0].y)
          for (let i = 1; i < branch.length; i++) {
            ctx.lineTo(branch[i].x, branch[i].y)
          }
          ctx.strokeStyle = overdriveRef.current ? "#F472B6" : "#4AFFB4"
          ctx.lineWidth = 2.2
          ctx.shadowColor = "#FFFFFF"
          ctx.shadowBlur = 6
          ctx.stroke()
          ctx.restore()

          // Pass 3: Searing White Ray Centerline
          ctx.save()
          ctx.beginPath()
          ctx.moveTo(branch[0].x, branch[0].y)
          for (let i = 1; i < branch.length; i++) {
            ctx.lineTo(branch[i].x, branch[i].y)
          }
          ctx.strokeStyle = "#FFFFFF"
          ctx.lineWidth = 1.0
          ctx.stroke()
          ctx.restore()
        }

        // Cursor Contact Spark Ring
        ctx.save()
        ctx.beginPath()
        ctx.arc(cursor.x, cursor.y, 6 + Math.sin(now * 0.02) * 2, 0, Math.PI * 2)
        ctx.strokeStyle = "#00F0FF"
        ctx.lineWidth = 2
        ctx.shadowColor = "#4AFFB4"
        ctx.shadowBlur = 12
        ctx.stroke()
        ctx.restore()
      }
    }

    animationFrameId = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(animationFrameId)
      resizeObserver.disconnect()
      intersectionObserver.disconnect()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      data-deity-lightning-canvas="true"
      aria-hidden="true"
      className={`absolute inset-0 w-full h-full pointer-events-none z-25 ${className}`}
    />
  )
}
