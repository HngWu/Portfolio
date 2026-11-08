"use client"

import { useEffect, useRef } from "react"
import { usePerformanceStore } from "@/store/usePerformanceStore"

const FPS_THRESHOLD = 28
const SUSTAINED_LAG_MS = 2500
const WARMUP_GRACE_PERIOD_MS = 4000
const SAMPLE_WINDOW_SIZE = 60

declare global {
  interface Window {
    __triggerLagPrompt?: () => void
    __simulateLag?: (fps?: number) => void
  }
}

export function useLagDetector() {
  const isLaggingRef = useRef(false)
  const lagStartTimeRef = useRef<number | null>(null)
  const frameDeltasRef = useRef<number[]>([])
  const lastFrameTimeRef = useRef<number | null>(null)
  const lastStateUpdateRef = useRef<number>(0)
  const mountTimeRef = useRef<number>(0)

  useEffect(() => {
    if (typeof window === "undefined") return

    mountTimeRef.current = performance.now()
    lastFrameTimeRef.current = performance.now()
    lastStateUpdateRef.current = performance.now()

    // Debugging helpers for developers / testing
    window.__triggerLagPrompt = () => {
      usePerformanceStore.getState().setFps(22, true)
      usePerformanceStore.getState().setPromptOpen(true)
    }

    window.__simulateLag = (mockFps = 20) => {
      usePerformanceStore.getState().setFps(mockFps, true)
      usePerformanceStore.getState().setPromptOpen(true)
    }

    let rafId: number

    const handleVisibilityChange = () => {
      // Reset timestamps when returning to the tab so throttled background frames don't skew FPS
      lastFrameTimeRef.current = performance.now()
      frameDeltasRef.current = []
      lagStartTimeRef.current = null
      isLaggingRef.current = false
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    const onFrame = (now: DOMHighResTimeStamp) => {
      if (document.hidden) {
        lastFrameTimeRef.current = null
        rafId = requestAnimationFrame(onFrame)
        return
      }

      if (lastFrameTimeRef.current === null) {
        lastFrameTimeRef.current = now
        rafId = requestAnimationFrame(onFrame)
        return
      }

      const delta = now - lastFrameTimeRef.current
      lastFrameTimeRef.current = now

      // Cap aberrant single pauses (e.g. system sleep/context lost) to 500ms
      const clampedDelta = Math.min(delta, 500)
      frameDeltasRef.current.push(clampedDelta)
      if (frameDeltasRef.current.length > SAMPLE_WINDOW_SIZE) {
        frameDeltasRef.current.shift()
      }

      // Only evaluate lag after the warm-up grace period
      const isWarmupOver = now - mountTimeRef.current > WARMUP_GRACE_PERIOD_MS

      if (isWarmupOver && frameDeltasRef.current.length >= 15) {
        const totalDuration = frameDeltasRef.current.reduce((a, b) => a + b, 0)
        const avgDelta = totalDuration / frameDeltasRef.current.length
        const currentFps = Math.min(Math.round(1000 / avgDelta), 120)

        // Check if currently under the lag threshold
        if (currentFps < FPS_THRESHOLD) {
          if (lagStartTimeRef.current === null) {
            lagStartTimeRef.current = now
          } else if (now - lagStartTimeRef.current >= SUSTAINED_LAG_MS) {
            if (!isLaggingRef.current) {
              isLaggingRef.current = true
              usePerformanceStore.getState().reportLag()
            }
          }
        } else {
          lagStartTimeRef.current = null
          isLaggingRef.current = false
        }

        // Throttle UI store updates to twice per second (every 500ms)
        if (now - lastStateUpdateRef.current >= 500) {
          lastStateUpdateRef.current = now
          usePerformanceStore.getState().setFps(currentFps, isLaggingRef.current)
        }
      }

      rafId = requestAnimationFrame(onFrame)
    }

    rafId = requestAnimationFrame(onFrame)

    return () => {
      cancelAnimationFrame(rafId)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      delete window.__triggerLagPrompt
      delete window.__simulateLag
    }
  }, [])
}
