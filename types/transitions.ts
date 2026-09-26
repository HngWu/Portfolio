export type TransitionPreset =
  | "singularity-bloom"
  | "arcane-rune"
  | "blueprint-slide"
  | "matrix-pulse"
  | "clean-lift"

export interface PageTransitionRule {
  id: string
  route: string
  preset: TransitionPreset
  quickDurationMs: number
  deepDurationMs: number
  quickEasing: string
  deepEasing: string
  enabled: boolean
}

export const DEFAULT_PAGE_TRANSITIONS: PageTransitionRule[] = [
  {
    id: "default",
    route: "*",
    preset: "singularity-bloom",
    quickDurationMs: 280,
    deepDurationMs: 220,
    quickEasing: "cubic-bezier(0.22, 1, 0.36, 1)",
    deepEasing: "cubic-bezier(0.16, 1, 0.3, 1)",
    enabled: true,
  },
  {
    id: "experience",
    route: "/experience",
    preset: "arcane-rune",
    quickDurationMs: 260,
    deepDurationMs: 240,
    quickEasing: "cubic-bezier(0.22, 1, 0.36, 1)",
    deepEasing: "cubic-bezier(0.16, 1, 0.3, 1)",
    enabled: true,
  },
  {
    id: "projects",
    route: "/projects",
    preset: "blueprint-slide",
    quickDurationMs: 260,
    deepDurationMs: 220,
    quickEasing: "cubic-bezier(0.22, 1, 0.36, 1)",
    deepEasing: "cubic-bezier(0.16, 1, 0.3, 1)",
    enabled: true,
  },
  {
    id: "skills",
    route: "/skills",
    preset: "matrix-pulse",
    quickDurationMs: 240,
    deepDurationMs: 200,
    quickEasing: "cubic-bezier(0.22, 1, 0.36, 1)",
    deepEasing: "cubic-bezier(0.16, 1, 0.3, 1)",
    enabled: true,
  },
  {
    id: "cv",
    route: "/cv",
    preset: "clean-lift",
    quickDurationMs: 220,
    deepDurationMs: 200,
    quickEasing: "cubic-bezier(0.22, 1, 0.36, 1)",
    deepEasing: "cubic-bezier(0.16, 1, 0.3, 1)",
    enabled: true,
  },
  {
    id: "awards",
    route: "/awards",
    preset: "clean-lift",
    quickDurationMs: 220,
    deepDurationMs: 200,
    quickEasing: "cubic-bezier(0.22, 1, 0.36, 1)",
    deepEasing: "cubic-bezier(0.16, 1, 0.3, 1)",
    enabled: true,
  },
  {
    id: "education",
    route: "/education",
    preset: "clean-lift",
    quickDurationMs: 220,
    deepDurationMs: 200,
    quickEasing: "cubic-bezier(0.22, 1, 0.36, 1)",
    deepEasing: "cubic-bezier(0.16, 1, 0.3, 1)",
    enabled: true,
  },
]
