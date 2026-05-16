"use client"

import { BentoTile } from "../BentoTile"
import { Badge } from "@/components/ui/Badge"
import { useViewModeStore } from "@/store/useViewModeStore"
import { motion, AnimatePresence } from "framer-motion"

interface ProjectTileProps {
  id: string
  size: string
  name: string
  description: string
  tags: string[]
  deepDiveContent?: string
}

export function ProjectTile({ id, size, name, description, tags, deepDiveContent }: ProjectTileProps) {
  const mode = useViewModeStore((state) => state.mode)
  const isDeepDive = mode === "deep"

  return (
    <BentoTile id={id} size={size} href={`/projects/${id}`} glowColor="blue" className="justify-between">
      <div>
        <h3 className="text-xl md:text-2xl font-display text-white/90 mb-2">{name}</h3>
        <p className="text-sm text-white/55 line-clamp-2">{description}</p>
        
        <AnimatePresence>
          {isDeepDive && deepDiveContent && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <p className="mt-4 text-sm text-white/70">{deepDiveContent}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-wrap gap-2 mt-6">
        {tags.slice(0, isDeepDive ? tags.length : 3).map((tag) => (
          <Badge key={tag} variant="lume">{tag}</Badge>
        ))}
        {!isDeepDive && tags.length > 3 && (
          <Badge variant="outline">+{tags.length - 3}</Badge>
        )}
      </div>
    </BentoTile>
  )
}
