import { create } from "zustand"
import { DEFAULT_PAGE_TRANSITIONS, type PageTransitionRule, type TransitionPreset } from "@/types/transitions"

interface PageTransitionsState {
  rules: PageTransitionRule[]
  setRules: (rules: PageTransitionRule[]) => void
  resolveTransition: (pathname: string, mode: "quick" | "deep") => {
    preset: TransitionPreset
    durationMs: number
    easing: string
  }
}

export const usePageTransitionsStore = create<PageTransitionsState>((set, get) => ({
  rules: DEFAULT_PAGE_TRANSITIONS,
  setRules: (rules) => set({ rules }),

  resolveTransition: (pathname, mode) => {
    const { rules } = get()
    const cleanPath = pathname.split("?")[0].replace(/\/$/, "") || "/"

    // 1. Find exact match
    let match = rules.find((r) => r.enabled && r.route === cleanPath)

    // 2. Find prefix match (e.g. /projects/slug matching /projects)
    if (!match) {
      match = rules.find(
        (r) => r.enabled && r.route !== "*" && cleanPath.startsWith(r.route)
      )
    }

    // 3. Fallback to default '*' or singularity-bloom
    if (!match) {
      match = rules.find((r) => r.route === "*") || DEFAULT_PAGE_TRANSITIONS[0]
    }

    const isQuick = mode === "quick"
    return {
      preset: match.preset,
      durationMs: isQuick ? match.quickDurationMs : match.deepDurationMs,
      easing: isQuick ? match.quickEasing : match.deepEasing,
    }
  },
}))
