"use client"

import { useEffect } from "react"
import { useViewModeStore } from "@/store/useViewModeStore"

/**
 * Mirrors ThemeApplier: writes the current view mode onto <html data-mode>
 * so the `--mode-*` CSS token namespace (globals.css) resolves to gold or blue.
 * The actual value flips mid-transition while ModeTransitionOverlay covers the screen.
 */
export function ModeApplier() {
  const mode = useViewModeStore((state) => state.mode)

  useEffect(() => {
    document.documentElement.dataset.mode = mode
  }, [mode])

  return null
}
