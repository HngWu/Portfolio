import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getSizeClasses(sizeKey: string, isDeepDive: boolean = false) {
  // If not deep dive, we return the strict mapping for the database size
  // If it is deep dive, we allow tiles to 'morph' by expanding their row-span
  
  const base: Record<string, string> = {
    // Small & Standard
    "1x1": isDeepDive ? "col-span-1 row-span-2" : "col-span-1 row-span-1",
    "1x2": isDeepDive ? "col-span-1 row-span-4" : "col-span-1 row-span-2",
    "2x1": isDeepDive ? "col-span-2 row-span-2 md:col-span-3 xl:col-span-2" : "col-span-2 row-span-1 md:col-span-3 xl:col-span-2",
    "2x2": isDeepDive ? "col-span-2 row-span-3 md:col-span-3 xl:col-span-2" : "col-span-2 row-span-2 md:col-span-3 xl:col-span-2",

    // Medium & Functional
    "3x1": isDeepDive ? "col-span-2 row-span-2 md:col-span-3 xl:col-span-3" : "col-span-2 row-span-1 md:col-span-3 xl:col-span-3",
    "3x2": isDeepDive ? "col-span-2 row-span-4 md:col-span-3 xl:col-span-3" : "col-span-2 row-span-2 md:col-span-3 xl:col-span-3",
    "3x3": isDeepDive ? "col-span-2 row-span-5 md:col-span-3 xl:col-span-3" : "col-span-2 row-span-3 md:col-span-3 xl:col-span-3",
    "4x1": isDeepDive ? "col-span-2 row-span-2 md:col-span-6 xl:col-span-4" : "col-span-2 row-span-1 md:col-span-6 xl:col-span-4",
    "4x2": isDeepDive ? "col-span-2 row-span-4 md:col-span-6 xl:col-span-4" : "col-span-2 row-span-2 md:col-span-6 xl:col-span-4",
    "4x3": isDeepDive ? "col-span-2 row-span-5 md:col-span-6 xl:col-span-4" : "col-span-2 row-span-3 md:col-span-6 xl:col-span-4",
    "4x4": isDeepDive ? "col-span-2 row-span-6 md:col-span-6 xl:col-span-4" : "col-span-2 row-span-4 md:col-span-6 xl:col-span-4",
    "4x6": isDeepDive ? "col-span-2 row-span-8 md:col-span-6 xl:col-span-4" : "col-span-2 row-span-6 md:col-span-6 xl:col-span-4",

    // Large & Wide

    "6x1": isDeepDive ? "col-span-2 row-span-2 md:col-span-6 xl:col-span-6" : "col-span-2 row-span-1 md:col-span-6 xl:col-span-6",
    "6x2": isDeepDive ? "col-span-2 row-span-3 md:col-span-6 xl:col-span-6" : "col-span-2 row-span-2 md:col-span-6 xl:col-span-6",
    "6x4": isDeepDive ? "col-span-2 row-span-6 md:col-span-6 xl:col-span-6" : "col-span-2 row-span-4 md:col-span-6 xl:col-span-6",
    "6x6": isDeepDive ? "col-span-2 row-span-8 md:col-span-6 xl:col-span-6" : "col-span-2 row-span-6 md:col-span-6 xl:col-span-6",
    "8x2": isDeepDive ? "col-span-2 row-span-4 md:col-span-6 xl:col-span-8" : "col-span-2 row-span-2 md:col-span-6 xl:col-span-8",
    "8x4": isDeepDive ? "col-span-2 row-span-7 md:col-span-6 xl:col-span-8" : "col-span-2 row-span-4 md:col-span-6 xl:col-span-8",
    "12x2": isDeepDive ? "col-span-2 row-span-4 md:col-span-6 xl:col-span-12" : "col-span-2 row-span-2 md:col-span-6 xl:col-span-12",
    "12x4": isDeepDive ? "col-span-2 row-span-8 md:col-span-6 xl:col-span-12" : "col-span-2 row-span-4 md:col-span-6 xl:col-span-12",

    // Specials
    "2x4": isDeepDive ? "col-span-2 row-span-6 md:col-span-3 xl:col-span-2" : "col-span-2 row-span-4 md:col-span-3 xl:col-span-2",
  }
  return base[sizeKey] || "col-span-2 row-span-2"
}

export function getTypographyClasses(sizeKey: string, isDeepDive: boolean = false) {
  // Returns classes for [heading, body, metadata]
  const isSmall = ["1x1", "2x1"].includes(sizeKey)
  const isMedium = ["2x2", "3x2", "4x2"].includes(sizeKey)

  if (isSmall) {
    return {
      heading: isDeepDive ? "text-lg md:text-xl font-display" : "text-base md:text-lg font-display",
      body: "text-[10px] md:text-xs leading-relaxed",
      meta: "text-[9px] font-mono",
      icon: "size-3.5"
    }
  }

  if (isMedium) {
    return {
      heading: isDeepDive ? "text-2xl md:text-3xl font-display" : "text-xl md:text-2xl font-display",
      body: "text-xs md:text-sm leading-relaxed",
      meta: "text-[10px] font-mono",
      icon: "size-4.5"
    }
  }

  // Large or default
  return {
    heading: isDeepDive ? "text-3xl md:text-5xl font-display" : "text-2xl md:text-3xl font-display",
    body: "text-sm md:text-base leading-relaxed",
    meta: "text-xs font-mono",
    icon: "size-5"
  }
}
