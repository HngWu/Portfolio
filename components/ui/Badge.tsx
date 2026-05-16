import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "lume" | "outline"
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "bg-white/10 text-white/70",
    lume: "bg-[#4A8FFF]/15 text-[#4A8FFF]",
    outline: "border border-white/10 text-white/50"
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[0.6875rem] font-semibold tracking-[0.12em] uppercase",
        variants[variant],
        className
      )}
      {...props}
    />
  )
}
