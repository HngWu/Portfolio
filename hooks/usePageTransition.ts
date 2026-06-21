"use client"

import { useRouter } from "next/navigation"
import { useNavigationStore, type OriginRect } from "@/store/useNavigationStore"

export const TRANSITION_DURATION = 500

export function usePageTransition() {
  const router = useRouter()
  const { setCurtainState, setOriginRect, setOriginTileId, setBentoTilesBounds } = useNavigationStore()

  const navigateWithTransition = async (path: string, originEl?: Element | null) => {
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

    // 2. Capture bounds of all other bento tiles
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

    setCurtainState("covering")
    await new Promise((resolve) => setTimeout(resolve, TRANSITION_DURATION))
    router.push(path)
    await new Promise((resolve) => setTimeout(resolve, 100))
    setCurtainState("revealing")

    setTimeout(() => {
      setCurtainState("idle")
      setOriginRect(null)
      setOriginTileId(null)
      setBentoTilesBounds(null)
    }, TRANSITION_DURATION)
  }

  return { navigateWithTransition }
}
