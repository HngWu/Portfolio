"use client"

import * as React from "react"
import { usePathname, useSearchParams } from "next/navigation"

function NavigationProgressBarInner() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [progress, setProgress] = React.useState(0)
  const [isVisible, setIsVisible] = React.useState(false)
  const timerRef = React.useRef<NodeJS.Timeout | null>(null)
  const completeTimerRef = React.useRef<NodeJS.Timeout | null>(null)
  const prevRouteRef = React.useRef<string>("")

  const startProgress = React.useCallback(() => {
    if (completeTimerRef.current) {
      clearTimeout(completeTimerRef.current)
      completeTimerRef.current = null
    }
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    setIsVisible(true)
    setProgress(15)

    // Increment progress incrementally towards 85%
    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 85) {
          if (timerRef.current) clearInterval(timerRef.current)
          return 85
        }
        const diff = 85 - prev
        const step = Math.max(1, Math.floor(diff * 0.15))
        return Math.min(85, prev + step)
      })
    }, 150)
  }, [])

  const completeProgress = React.useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    setProgress(100)

    completeTimerRef.current = setTimeout(() => {
      setIsVisible(false)
      completeTimerRef.current = setTimeout(() => {
        setProgress(0)
      }, 300)
    }, 300)
  }, [])

  // Listen for route changes
  React.useEffect(() => {
    const currentRoute = `${pathname}?${searchParams?.toString() || ""}`
    if (prevRouteRef.current && prevRouteRef.current !== currentRoute) {
      completeProgress()
    }
    prevRouteRef.current = currentRoute
  }, [pathname, searchParams, completeProgress])

  // Listen to clicks on links navigating inside admin
  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest("a")
      if (!target) return

      const href = target.getAttribute("href")
      if (!href) return

      if (
        target.target === "_blank" ||
        target.hasAttribute("download") ||
        e.ctrlKey ||
        e.metaKey ||
        e.shiftKey ||
        e.altKey ||
        e.defaultPrevented
      ) {
        return
      }

      try {
        const url = new URL(target.href, window.location.href)
        const currentUrl = new URL(window.location.href)

        if (url.origin === currentUrl.origin) {
          if (url.pathname === currentUrl.pathname && url.search === currentUrl.search && url.hash !== "") {
            return
          }
          if (url.pathname !== currentUrl.pathname || url.search !== currentUrl.search) {
            startProgress()
          }
        }
      } catch {
        if (href.startsWith("/admin") && href !== pathname) {
          startProgress()
        }
      }
    }

    document.addEventListener("click", handleClick, { capture: true })
    return () => {
      document.removeEventListener("click", handleClick, { capture: true })
      if (timerRef.current) clearInterval(timerRef.current)
      if (completeTimerRef.current) clearTimeout(completeTimerRef.current)
    }
  }, [pathname, startProgress])

  if (!isVisible && progress === 0) {
    return null
  }

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-[100] h-[3px] pointer-events-none transition-opacity duration-300"
      style={{
        opacity: isVisible ? 1 : 0,
      }}
    >
      <div
        className="h-full bg-gradient-to-r from-lume-primary via-emerald-400 to-lume-primary shadow-[0_0_12px_#4affb4] transition-all duration-300 ease-out relative"
        style={{
          width: `${progress}%`,
        }}
      >
        <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-r from-transparent to-white/40 shadow-[0_0_16px_#4affb4] blur-[1px]" />
      </div>
    </div>
  )
}

export function AdminNavigationProgress() {
  return (
    <React.Suspense fallback={null}>
      <NavigationProgressBarInner />
    </React.Suspense>
  )
}
