"use client"

import * as React from "react"
import { useViewModeStore } from "@/store/useViewModeStore"

export function DynamicFavicon() {
  const mode = useViewModeStore((state) => state.mode)
  const isMountedRef = React.useRef(false)

  React.useEffect(() => {
    if (typeof document === "undefined") return

    let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']")
    if (!link) {
      link = document.createElement("link")
      link.rel = "icon"
      link.type = "image/svg+xml"
      document.head.appendChild(link)
    }

    const targetIcon = mode === "deep" ? "/icon-deep.svg" : "/icon-quick.svg"

    // If already mounted and mode changed, trigger 300ms crystallization pulse
    if (isMountedRef.current) {
      link.href = "/icon-pulse.svg"
      const timer = setTimeout(() => {
        if (link) {
          link.href = targetIcon
        }
      }, 300)
      return () => clearTimeout(timer)
    } else {
      isMountedRef.current = true
      link.href = targetIcon
    }
  }, [mode])

  return null
}
