"use client"

import { useRouter } from "next/navigation"
import { useNavigationStore } from "@/store/useNavigationStore"

export const TRANSITION_DURATION = 500 // ms

export function usePageTransition() {
  const router = useRouter()
  const { setCurtainState } = useNavigationStore()

  const navigateWithTransition = async (path: string) => {
    // 1. Cover the screen
    setCurtainState("covering")
    
    // 2. Wait for cover animation to finish
    await new Promise((resolve) => setTimeout(resolve, TRANSITION_DURATION))
    
    // 3. Trigger navigation
    router.push(path)
    
    // 4. Wait a small extra buffer for Next.js to swap the route content
    // This reduces the chance of seeing the old content reveal
    await new Promise((resolve) => setTimeout(resolve, 100))
    
    // 5. Reveal the screen
    setCurtainState("revealing")
    
    // 6. Cleanup
    setTimeout(() => setCurtainState("idle"), TRANSITION_DURATION)
  }

  return { navigateWithTransition }
}