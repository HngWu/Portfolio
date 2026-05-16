"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

export function BackLink() {
  const router = useRouter()

  return (
    <button
      onClick={() => router.push("/")}
      className="flex items-center gap-2 text-sm font-medium text-white/50 hover:text-white/90 transition-colors group mb-12"
    >
      <ArrowLeft className="w-4 h-4 transform transition-transform group-hover:-translate-x-1" />
      Back to Home
    </button>
  )
}
