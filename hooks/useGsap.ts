"use client"

import { useLayoutEffect, DependencyList } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

export const useGsap = (callback: () => void, dependencies: DependencyList = []) => {
  useLayoutEffect(() => {
    const ctx = gsap.context(callback)
    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies)
}
