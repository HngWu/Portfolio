"use client"

import * as React from "react"
import { useLagDetector } from "@/hooks/useLagDetector"
import { PerformanceModal } from "./PerformanceModal"

/**
 * Global Performance Engine
 * Monitors real-time FPS and frame drops via requestAnimationFrame
 * and renders the interactive PerformanceModal advisory.
 */
export function PerformanceMonitor() {
  useLagDetector()
  return <PerformanceModal />
}
