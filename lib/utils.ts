import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getSizeClasses(sizeKey: string, isDeepDive: boolean = false, forceMobile: boolean = false) {
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
    "4x5": isDeepDive ? "col-span-2 row-span-7 md:col-span-6 xl:col-span-4" : "col-span-2 row-span-5 md:col-span-6 xl:col-span-4",
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
  const classes = base[sizeKey] || "col-span-2 row-span-2"
  if (forceMobile) {
    return classes.split(' ').filter(c => !c.startsWith('md:') && !c.startsWith('xl:')).join(' ')
  }
  return classes
}

export function getTypographyClasses(sizeKey: string, isDeepDive: boolean = false, forceMobile: boolean = false) {
  // Returns classes for [heading, body, metadata]
  const isSmall = ["1x1", "2x1"].includes(sizeKey)
  const isMedium = ["2x2", "3x2", "4x2"].includes(sizeKey)

  let classesObj;
  if (isSmall) {
    classesObj = {
      heading: isDeepDive ? "text-base md:text-lg font-display" : "text-base md:text-lg font-display",
      body: "text-[10px] md:text-xs leading-relaxed",
      meta: "text-[9px] font-mono",
      icon: "size-3.5"
    }
  } else if (isMedium) {
    classesObj = {
      heading: isDeepDive ? "text-lg md:text-xl font-display" : "text-xl md:text-2xl font-display",
      body: "text-xs md:text-sm leading-relaxed",
      meta: "text-[10px] font-mono",
      icon: "size-4.5"
    }
  } else {
    // Large or default
    classesObj = {
      heading: isDeepDive ? "text-xl md:text-2xl font-display" : "text-2xl md:text-3xl font-display",
      body: "text-sm md:text-base leading-relaxed",
      meta: "text-xs font-mono",
      icon: "size-5"
    }
  }

  if (forceMobile) {
    const strip = (s: string) => s.split(' ').filter(c => !c.startsWith('md:') && !c.startsWith('xl:')).join(' ')
    return {
      heading: strip(classesObj.heading),
      body: strip(classesObj.body),
      meta: strip(classesObj.meta),
      icon: strip(classesObj.icon)
    }
  }
  return classesObj;
}
