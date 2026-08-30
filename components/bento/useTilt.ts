"use client"

import { useCallback, useEffect, useRef } from "react"

export function useTilt() {
  const ref = useRef<HTMLDivElement>(null)
  const rectRef = useRef<DOMRect | null>(null)
  const rafIdRef = useRef<number | null>(null)
  const pendingTransformRef = useRef<string | null>(null)

  useEffect(() => {
    const handleResize = () => {
      if (ref.current) {
        rectRef.current = ref.current.getBoundingClientRect()
      } else {
        rectRef.current = null
      }
    }

    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current)
      }
    }
  }, [])

  const onMouseEnter = useCallback((_e?: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return
    // Ignore coarse pointer devices (touchscreens) to prevent permanent skewing
    if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) return

    rectRef.current = ref.current.getBoundingClientRect()
  }, [])

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return
    // Ignore coarse pointer devices (touchscreens) to prevent permanent skewing
    if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) return

    if (!rectRef.current) {
      rectRef.current = ref.current.getBoundingClientRect()
    }

    const { left, top, width, height } = rectRef.current
    if (width === 0 || height === 0) return

    const x = (e.clientX - left) / width
    const y = (e.clientY - top) / height

    const rotateX = (y - 0.5) * -12 // max 12 degrees
    const rotateY = (x - 0.5) * 12

    pendingTransformRef.current = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`

    if (rafIdRef.current === null) {
      rafIdRef.current = requestAnimationFrame(() => {
        if (ref.current && pendingTransformRef.current !== null) {
          ref.current.style.transform = pendingTransformRef.current
        }
        rafIdRef.current = null
      })
    }
  }, [])

  const onMouseLeave = useCallback(() => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current)
      rafIdRef.current = null
    }
    pendingTransformRef.current = null
    rectRef.current = null

    if (!ref.current) return
    ref.current.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translate3d(0, 0, 0) scale3d(1, 1, 1)`
  }, [])

  return { ref, onMouseEnter, onMouseMove, onMouseLeave }
}
