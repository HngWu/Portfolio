"use client"

import { useEffect } from "react"
import { useThemeStore } from "@/store/useThemeStore"

export function ThemeApplier() {
  const primaryColor = useThemeStore((state) => state.primaryColor)

  useEffect(() => {
    document.documentElement.style.setProperty("--lume-primary", primaryColor)
    document.documentElement.style.setProperty("--text-accent", primaryColor)
    document.documentElement.style.setProperty("--ring", primaryColor)
  }, [primaryColor])

  return null
}
