import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "lume" | "outline"
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "bg-white/10 text-white/70",
    lume: "bg-[var(--mode-accent,#C9A227)]/15 text-[var(--mode-accent-bright,#FFE875)] border border-[var(--mode-accent,#C9A227)]/25",
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
