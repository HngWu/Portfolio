"use client"

import { useEffect } from "react"
import { useViewModeStore } from "@/store/useViewModeStore"

/**
 * Mirrors ThemeApplier: writes the current view mode onto <html data-mode>
 * so the `--mode-*` CSS token namespace (globals.css) resolves to gold or blue.
 * Also synchronizes the initial mode with the `?mode=` URL parameter on mount.
 */
export function ModeApplier() {
  const mode = useViewModeStore((state) => state.mode)
  const setMode = useViewModeStore((state) => state.setMode)

  useEffect(() => {
    // Read ?mode= query param on initial load
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      const urlMode = params.get("mode")
      if (urlMode === "quick" || urlMode === "deep") {
        if (urlMode !== mode) {
          setMode(urlMode)
        }
      }
    }
  }, [mode, setMode])

  useEffect(() => {
    document.documentElement.dataset.mode = mode
  }, [mode])

  return null
}
