"use client"

import * as React from "react"
import { motion, useMotionValue, useSpring } from "framer-motion"
import { cn } from "@/lib/utils"

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  glowColor?: "mint" | "blue" | "pink" | "amber" | "none"
  interactive?: boolean
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, glowColor = "none", interactive = true, children, ...props }, ref) => {
    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)

    const springConfig = { damping: 25, stiffness: 400 }
    const x = useSpring(mouseX, springConfig)
    const y = useSpring(mouseY, springConfig)

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (interactive) {
        const rect = e.currentTarget.getBoundingClientRect()
        mouseX.set(e.clientX - rect.left)
        mouseY.set(e.clientY - rect.top)
      }
      props.onMouseMove?.(e)
    }

    const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
      props.onMouseLeave?.(e)
    }

    const glowClasses = {
      mint: "hover:border-[rgba(74,255,180,0.3)] shadow-[0_0_40px_rgba(74,255,180,0.05)]",
      blue: "hover:border-[rgba(74,143,255,0.3)] shadow-[0_0_40px_rgba(74,143,255,0.05)]",
      pink: "hover:border-[rgba(255,74,143,0.3)] shadow-[0_0_40px_rgba(255,74,143,0.05)]",
      amber: "hover:border-[rgba(255,180,74,0.3)] shadow-[0_0_40px_rgba(255,180,74,0.05)]",
      none: "hover:border-white/10"
    }

    const accentColor = {
      mint: "rgba(74,255,180,0.15)",
      blue: "rgba(74,143,255,0.15)",
      pink: "rgba(255,74,143,0.15)",
      amber: "rgba(255,180,74,0.15)",
      none: "rgba(255,255,255,0.05)"
    }

    return (
      <div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={cn(
          "relative group bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/5 overflow-hidden",
          "shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)]",
          "transition-all duration-500",
          glowClasses[glowColor],
          className
        )}
        {...props}
      >
        {/* Liquid Glass Background Layer */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          {/* Base Noise/Grain */}
          <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
          
          {/* Dynamic Interactive Glow */}
          {interactive && (
            <motion.div
              style={{
                left: x,
                top: y,
                background: `radial-gradient(circle at center, ${accentColor[glowColor]}, transparent 70%)`,
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 w-64 h-64 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            />
          )}

          {/* Animated Liquid Blobs */}
          <div className="absolute inset-0 opacity-20 filter blur-[80px] pointer-events-none text-lume-primary">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-current opacity-20 animate-liquid-1" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-lume-secondary/20 animate-liquid-2" />
          </div>
        </div>

        {/* Shine/Refraction Effect */}
        <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none bg-gradient-to-br from-white/5 via-transparent to-transparent" />

        <div className="relative z-10 h-full">
          {children}
        </div>
      </div>
    )
  }
)
GlassCard.displayName = "GlassCard"
