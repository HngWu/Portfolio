"use client"

import { useNavigationStore } from "@/store/useNavigationStore"
import { motion, AnimatePresence } from "framer-motion"
import { TRANSITION_DURATION } from "@/hooks/usePageTransition"

export function PageCurtain() {
  const { curtainState } = useNavigationStore()

  return (
    <AnimatePresence>
      {curtainState !== "idle" && (
        <motion.div
          key="curtain"
          initial={{ y: "100%" }}
          animate={{ y: "0%" }}
          exit={{ y: "-100%" }}
          transition={{ duration: TRANSITION_DURATION / 1000, ease: [0.4, 0, 0.2, 1] }}
          className="fixed inset-0 bg-[#080808] z-[10000]"
        />
      )}
    </AnimatePresence>
  )
}
