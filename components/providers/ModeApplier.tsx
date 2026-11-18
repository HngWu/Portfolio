"use client"

import { useEffect } from "react"
import { useViewModeStore } from "@/store/useViewModeStore"

/**
 * Mirrors ThemeApplier: writes the current view mode onto <html data-mode>
 * so the `--mode-*` CSS token namespace (globals.css) resolves to gold or blue.
 * Also synchronizes the initial mode with the `?mode=` URL parameter on mount,
 * and maintains the URL query string when the user toggles modes.
 */
export function ModeApplier() {
  const mode = useViewModeStore((state) => state.mode)
  const setMode = useViewModeStore((state) => state.setMode)

  // 1. Initial mount & history traversal synchronization
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      const urlMode = params.get("mode")
      if (urlMode === "quick" || urlMode === "deep") {
        setMode(urlMode)
      }
    }

    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search)
      const urlMode = params.get("mode")
      if (urlMode === "quick" || urlMode === "deep") {
        setMode(urlMode)
      } else {
        setMode("quick")
      }
    }

    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [setMode])

  // 2. Reflect mode changes to DOM dataset and keep browser URL in sync without page reloads
  useEffect(() => {
    document.documentElement.dataset.mode = mode

    if (typeof window !== "undefined") {
      try {
        const url = new URL(window.location.href)
        const currentParam = url.searchParams.get("mode")

        if (mode === "deep" && currentParam !== "deep") {
          url.searchParams.set("mode", "deep")
          window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash)
        } else if (mode === "quick" && currentParam === "deep") {
          url.searchParams.delete("mode")
          const search = url.searchParams.toString()
          const newUrl = url.pathname + (search ? `?${search}` : "") + url.hash
          window.history.replaceState(window.history.state, "", newUrl)
        }
      } catch {
        // Fallback for non-standard environments
      }
    }
  }, [mode])

  return null
}
