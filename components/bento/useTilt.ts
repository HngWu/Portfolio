"use client"

import { useCallback, useRef } from "react"

export function useTilt() {
  const ref = useRef<HTMLDivElement>(null)

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return

    const { left, top, width, height } = ref.current.getBoundingClientRect()
    const x = (e.clientX - left) / width
    const y = (e.clientY - top) / height

    const rotateX = (y - 0.5) * -12 // max 12 degrees
    const rotateY = (x - 0.5) * 12

    ref.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`
  }, [])

  const onMouseLeave = useCallback(() => {
    if (!ref.current) return
    ref.current.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`
  }, [])

  return { ref, onMouseMove, onMouseLeave }
}
