import * as React from "react"
import { cn } from "@/lib/utils"

export function BentoGrid({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 md:grid-cols-6 xl:grid-cols-12 auto-rows-[minmax(120px,auto)] gap-2 md:gap-3 xl:gap-4 max-w-[1440px] mx-auto w-full",
        className
      )}
    >
      {children}
    </div>
  )
}
