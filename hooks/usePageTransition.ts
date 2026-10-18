"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useViewModeStore } from "@/store/useViewModeStore"
import { usePageTransitionsStore } from "@/store/usePageTransitionsStore"
import { useNavigationStore, type OriginRect } from "@/store/useNavigationStore"

const EXTERNAL_LINK_REGEX = /^(https?:|\/\/|mailto:|tel:)/i

export interface UsePageTransitionReturn {
  navigateWithTransition: (path: string, originEl?: Element | null) => void
}

export function usePageTransition(): UsePageTransitionReturn {
  const router = useRouter()
  const resolveTransition = usePageTransitionsStore((s) => s.resolveTransition)
  const setCurtainState = useNavigationStore((s) => s.setCurtainState)
  const setPageLoaded = useNavigationStore((s) => s.setPageLoaded)
  const setActivePreset = useNavigationStore((s) => s.setActivePreset)
  const setTargetPath = useNavigationStore((s) => s.setTargetPath)
  const setOriginRect = useNavigationStore((s) => s.setOriginRect)

  const navigateWithTransition = React.useCallback(
    (path: string, originEl?: Element | null) => {
      // 1. Guard against external links
      if (EXTERNAL_LINK_REGEX.test(path)) {
        if (typeof window !== "undefined") {
          window.location.href = path
        }
        return
      }

      // 2. Guard against in-page hash anchors
      if (path.startsWith("#")) {
        router.push(path)
        return
      }

      // 3. Guard against duplicate rapid clicks
      const { curtainState, targetPath } = useNavigationStore.getState()
      if (curtainState !== "idle" && targetPath === path) {
        return
      }

      // Prefetch destination route immediately so assets/RSC are warm
      try {
        router.prefetch(path)
      } catch {
        // Ignored if prefetching is unavailable
      }

      // Feature detection and accessibility checks
      const prefersReduced =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches

      if (prefersReduced) {
        router.push(path)
        return
      }

      // Read view mode on-demand to keep callback referentially stable
      const mode = useViewModeStore.getState().mode
      const { preset } = resolveTransition(path, mode)

      // 4. Validate origin element bounds with defensive error handling
      let originRect: OriginRect | null = null
      if (
        originEl &&
        originEl.isConnected !== false &&
        typeof originEl.getBoundingClientRect === "function"
      ) {
        try {
          const rect = originEl.getBoundingClientRect()
          if (rect.width > 0 && rect.height > 0 && Number.isFinite(rect.left)) {
            originRect = {
              left: rect.left,
              top: rect.top,
              width: rect.width,
              height: rect.height,
              right: rect.right,
              bottom: rect.bottom,
            }
          }
        } catch {
          originRect = null
        }
      }

      // Orchestrate page transition via UnifiedTransitionOverlay
      setOriginRect(originRect)
      setActivePreset(preset)
      setTargetPath(path)
      setPageLoaded(false)
      setCurtainState("covering")

      // Trigger route swap
      router.push(path)
    },
    [
      router,
      resolveTransition,
      setCurtainState,
      setPageLoaded,
      setActivePreset,
      setTargetPath,
      setOriginRect,
    ]
  )

  return { navigateWithTransition }
}
