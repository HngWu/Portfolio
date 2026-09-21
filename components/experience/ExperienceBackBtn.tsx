"use client"

import * as React from "react"
import { usePageTransition } from "@/hooks/usePageTransition"
import { ArrowLeft } from "lucide-react"

export function ExperienceBackBtn() {
  const { navigateWithTransition } = usePageTransition()

  return (
    <button
      type="button"
      onClick={() => navigateWithTransition("/")}
      className="absolute top-5 left-5 md:top-6 md:left-8 z-50 p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.12] border border-white/10 text-white/70 hover:text-white transition-all group flex items-center justify-center active:scale-95 shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-xl cursor-pointer"
      title="Return to Home"
      aria-label="Return to portfolio home"
    >
      <ArrowLeft className="size-4 transform transition-transform group-hover:-translate-x-0.5" />
    </button>
  )
}
