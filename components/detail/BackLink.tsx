"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

interface BackLinkProps {
  href?: string
  label?: string
}

export function BackLink({ href = "/", label = "Back to Home" }: BackLinkProps) {
  const router = useRouter()

  return (
    <button
      onClick={() => router.push(href)}
      className="flex items-center gap-2 text-sm font-medium text-white/50 hover:text-white/90 transition-colors group mb-12"
    >
      <ArrowLeft className="w-4 h-4 transform transition-transform group-hover:-translate-x-1" />
      {label}
    </button>
  )
}
