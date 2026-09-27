"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useViewModeStore } from "@/store/useViewModeStore"
import { usePageTransitionsStore } from "@/store/usePageTransitionsStore"
import { useNavigationStore } from "@/store/useNavigationStore"

// Holds in-flight transition reference to support clean rapid cancellation
let activeTransition: { skipTransition: () => void } | null = null

export function usePageTransition() {
  const router = useRouter()
  const mode = useViewModeStore((s) => s.mode)
  const resolveTransition = usePageTransitionsStore((s) => s.resolveTransition)
  const setCurtainState = useNavigationStore((s) => s.setCurtainState)
  const setPageLoaded = useNavigationStore((s) => s.setPageLoaded)
  const setActivePreset = useNavigationStore((s) => s.setActivePreset)

  const navigateWithTransition = React.useCallback(
    async (path: string, _originEl?: Element | null) => {
      // 1. Prefetch destination route immediately so assets/RSC are warm
      try {
        router.prefetch(path)
      } catch {
        // Ignored if prefetching is unavailable
      }

      // 2. Feature detection and accessibility checks
      const prefersReduced =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches

      if (prefersReduced) {
        router.push(path)
        return
      }

      // 3. Resolve preset and duration based on target path & current mode
      const { preset, durationMs } = resolveTransition(path, mode)

      // 4. If target is projects or uses blueprint preset, trigger BlueprintTransitionOverlay
      if (preset === "blueprint-draft" || preset === "blueprint-slide" || path.startsWith("/projects")) {
        setActivePreset(preset)
        setPageLoaded(false)
        setCurtainState("covering")

        // Wait for cover phase to fully occlude the viewport before swapping route
        const coverDelay = mode === "deep" ? 220 : 250
        await new Promise((resolve) => setTimeout(resolve, coverDelay))

        router.push(path)
        return
      }

      // 5. Fallback to native View Transitions for other routes if available
      const hasNativeVT =
        typeof document !== "undefined" &&
        "startViewTransition" in document &&
        typeof (document as any).startViewTransition === "function"

      if (!hasNativeVT) {
        router.push(path)
        return
      }

      // Cancel in-flight transition if user navigated rapidly
      if (activeTransition) {
        try {
          activeTransition.skipTransition()
        } catch {
          // Transition might have already finished
        }
        activeTransition = null
      }

      // Apply transition attributes to <html> for CSS scoping
      document.documentElement.setAttribute("data-page-transition", preset)
      document.documentElement.setAttribute("data-mode", mode)
      document.documentElement.style.setProperty("--vt-duration", `${durationMs}ms`)

      try {
        const transition = (document as any).startViewTransition(async () => {
          router.push(path)
        })

        activeTransition = transition

        await transition.finished.catch(() => {
          // Clean skip/cancel
        })
      } catch {
        router.push(path)
      } finally {
        if (activeTransition) {
          activeTransition = null
        }
      }
    },
    [router, mode, resolveTransition, setActivePreset, setCurtainState, setPageLoaded]
  )

  return { navigateWithTransition }
}

