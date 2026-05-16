"use client"

import { BentoTile } from "../BentoTile"
import { useViewModeStore } from "@/store/useViewModeStore"
import { motion, AnimatePresence } from "framer-motion"

interface ExperienceTileProps {
  id: string
  size: string
  role: string
  company: string
  date: string
  bullets: string[]
}

export function ExperienceTile({ id, size, role, company, date, bullets }: ExperienceTileProps) {
  const mode = useViewModeStore((state) => state.mode)
  const isDeepDive = mode === "deep"

  return (
    <BentoTile id={id} size={size} href={`/experience`} glowColor="mint" className="border-l-2 border-l-[#4AFFB4]/50">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-medium text-white/90">{role}</h3>
          <p className="text-xs font-mono text-white/40 mt-1">{company} · {date}</p>
        </div>
      </div>

      <ul className="space-y-2 text-sm text-white/60 list-disc pl-4">
        {bullets.slice(0, 2).map((bullet, i) => (
          <li key={i}>{bullet}</li>
        ))}
        
        <AnimatePresence>
          {isDeepDive && bullets.length > 2 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              {bullets.slice(2).map((bullet, i) => (
                <li key={i + 2} className="mt-2">{bullet}</li>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </ul>
    </BentoTile>
  )
}
