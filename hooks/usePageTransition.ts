"use client"

import { useRouter } from "next/navigation"
import { useNavigationStore } from "@/store/useNavigationStore"

export function usePageTransition() {
  const router = useRouter()
  const { setCurtainState } = useNavigationStore()

  const navigateWithTransition = async (path: string) => {
    setCurtainState("covering")
    await new Promise((resolve) => setTimeout(resolve, 500))
    router.push(path)
    setCurtainState("revealing")
    setTimeout(() => setCurtainState("idle"), 500)
  }

  return { navigateWithTransition }
}
