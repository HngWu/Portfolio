"use client"

import { useRouter } from "next/navigation"
import { useNavigationStore, type OriginRect } from "@/store/useNavigationStore"

/**
 * Cover→peak→reveal total budget. The canvas plays a ~600ms cover to full
 * occlusion; the route swap happens at peak; the canvas then reveals page B
 * over ~600ms. The covering phase waits for the new page to report loaded
 * (capped by the overlay's watchdog), so this constant only gates the *minimum*
 * time the cover has had to paint before we push — ensuring the screen is
 * opaque by the time the DOM swaps.
 */
export const TRANSITION_DURATION = 500

export function usePageTransition() {
  const router = useRouter()
  const { setCurtainState, setOriginRect, setOriginTileId, setBentoTilesBounds, setPageLoaded } =
    useNavigationStore()

  const navigateWithTransition = async (path: string, originEl?: Element | null) => {
    // Respect reduced motion: skip the cinematic cover entirely and do a plain
    // navigation. The detail shell still fades its content in on mount.
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (prefersReduced) {
      router.push(path)
      return
    }

    // 1. Capture origin element and its ID
    let clickedId: string | null = null
    if (originEl) {
      clickedId = originEl.getAttribute("data-id")
      setOriginTileId(clickedId)
      if (typeof originEl.getBoundingClientRect === "function") {
        const r = originEl.getBoundingClientRect()
        setOriginRect({
          left: r.left,
          top: r.top,
          width: r.width,
          height: r.height,
          right: r.right,
          bottom: r.bottom,
        })
      }
    } else {
      setOriginTileId(null)
      setOriginRect(null)
    }

    // 2. Capture bounds of all other bento tiles (used by the deep-mode dissolve)
    const boundsMap: Record<string, OriginRect> = {}
    document.querySelectorAll("[data-id]").forEach((el) => {
      const id = el.getAttribute("data-id")
      if (id && id !== clickedId) {
        const r = el.getBoundingClientRect()
        boundsMap[id] = {
          left: r.left,
          top: r.top,
          width: r.width,
          height: r.height,
          right: r.right,
          bottom: r.bottom,
        }
      }
    })
    setBentoTilesBounds(boundsMap)

    // 3. Begin the cover. The overlay will paint page A away; once it reaches
    //    full occlusion we push the route so the DOM swap happens behind the
    //    held peak frame. PageEntryOverlay advances covering→peak→revealing.
    setPageLoaded(false)
    setCurtainState("covering")

    // Give the cover sweep time to reach near-full occlusion before swapping.
    await new Promise((resolve) => setTimeout(resolve, TRANSITION_DURATION))

    router.push(path)
    // The overlay's pathname-watcher marks the page loaded, which advances the
    // curtain to peak (held), then revealing. Nothing else to do here.
  }

  return { navigateWithTransition }
}
