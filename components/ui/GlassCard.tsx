import * as React from "react"
import { cn } from "@/lib/utils"

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  glowColor?: "mint" | "blue" | "pink" | "amber" | "none"
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, glowColor = "none", ...props }, ref) => {
    const glowClasses = {
      mint: "hover:shadow-[0_0_40px_rgba(74,255,180,0.15),inset_0_0_20px_rgba(74,255,180,0.15)] border-[rgba(255,255,255,0.08)] hover:border-[rgba(74,255,180,0.4)]",
      blue: "hover:shadow-[0_0_40px_rgba(74,143,255,0.15),inset_0_0_20px_rgba(74,143,255,0.15)] border-[rgba(255,255,255,0.08)] hover:border-[rgba(74,143,255,0.4)]",
      pink: "hover:shadow-[0_0_40px_rgba(255,74,143,0.15),inset_0_0_20px_rgba(255,74,143,0.15)] border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,74,143,0.4)]",
      amber: "hover:shadow-[0_0_40px_rgba(255,180,74,0.15),inset_0_0_20px_rgba(255,180,74,0.15)] border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,180,74,0.4)]",
      none: "border-[rgba(255,255,255,0.08)] hover:border-white/[0.18]"
    }

    return (
      <div
        ref={ref}
        className={cn(
          "bg-white/[0.06] backdrop-blur-md rounded-2xl border",
          "shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_1px_3px_rgba(0,0,0,0.5),0_8px_32px_rgba(0,0,0,0.3)]",
          "transition-all duration-300 ease-out",
          glowClasses[glowColor],
          className
        )}
        {...props}
      />
    )
  }
)
GlassCard.displayName = "GlassCard"
