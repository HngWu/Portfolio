"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useViewModeStore } from "@/store/useViewModeStore"
import { usePageTransitionsStore } from "@/store/usePageTransitionsStore"

// Holds in-flight transition reference to support clean rapid cancellation
let activeTransition: { skipTransition: () => void } | null = null

export function usePageTransition() {
  const router = useRouter()
  const mode = useViewModeStore((s) => s.mode)
  const resolveTransition = usePageTransitionsStore((s) => s.resolveTransition)

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

      const hasNativeVT =
        typeof document !== "undefined" &&
        "startViewTransition" in document &&
        typeof (document as any).startViewTransition === "function"

      if (prefersReduced || !hasNativeVT) {
        router.push(path)
        return
      }

      // 3. Cancel in-flight transition if user navigated rapidly
      if (activeTransition) {
        try {
          activeTransition.skipTransition()
        } catch {
          // Transition might have already finished
        }
        activeTransition = null
      }

      // 4. Resolve preset and duration based on target path & current mode
      const { preset, durationMs } = resolveTransition(path, mode)

      // 5. Apply transition attributes to <html> for CSS scoping
      document.documentElement.setAttribute("data-page-transition", preset)
      document.documentElement.setAttribute("data-mode", mode)
      document.documentElement.style.setProperty("--vt-duration", `${durationMs}ms`)

      // 6. Invoke native startViewTransition
      try {
        const transition = (document as any).startViewTransition(async () => {
          router.push(path)
        })

        activeTransition = transition

        // Await finished or catch interruption
        await transition.finished.catch(() => {
          // Clean skip/cancel
        })
      } catch {
        // Fallback safety
        router.push(path)
      } finally {
        if (activeTransition) {
          activeTransition = null
        }
      }
    },
    [router, mode, resolveTransition]
  )

  return { navigateWithTransition }
}
