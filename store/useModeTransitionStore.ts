import { create } from "zustand"
import { useViewModeStore } from "@/store/useViewModeStore"

export type ModeTransitionDirection = "gold-to-blue" | "blue-to-gold"
export type ModeTransitionPhase = "idle" | "covering" | "peak" | "revealing"

/**
 * Orchestration for the "Core Collapse" mode toggle transition.
 *
 * Kept separate from useViewModeStore so the read-heavy mode selector stays lean.
 * The flow mirrors the page-curtain pattern (useNavigationStore + PageCurtain):
 *
 *   covering (overlay animates in)  →  peak (screen fully covered)  →
 *     commit useViewModeStore.setMode() here  →  revealing (overlay animates out)  →  idle
 *
 * The overlay component reads `phase` + `direction` to drive its canvas animation
 * and commits nothing itself. Timers live here so any caller (toggle pill, ⌘K)
 * shares one source of truth.
 */

const COVER_MS = 420
const PEAK_MS = 90
const REVEAL_MS = 480

interface ModeTransitionStore {
  phase: ModeTransitionPhase
  direction: ModeTransitionDirection | null
  pendingMode: "quick" | "deep" | null
  startTransition: (targetMode: "quick" | "deep") => void
}

export const useModeTransitionStore = create<ModeTransitionStore>((set, get) => ({
  phase: "idle",
  direction: null,
  pendingMode: null,

  startTransition: (targetMode) => {
    const currentMode = useViewModeStore.getState().mode
    // No-op if already in the target mode or a transition is in flight.
    if (currentMode === targetMode || get().phase !== "idle") return

    const direction: ModeTransitionDirection =
      currentMode === "quick" ? "gold-to-blue" : "blue-to-gold"

    set({ phase: "covering", direction, pendingMode: targetMode })

    // Cover completes → screen is fully obscured → commit the swap, then peak.
    window.setTimeout(() => {
      set({ phase: "peak" })
      if (get().pendingMode) {
        useViewModeStore.getState().setMode(get().pendingMode!)
      }
      window.setTimeout(() => {
        // Begin reveal; the new theme is now applied underneath.
        set({ phase: "revealing" })
        window.setTimeout(() => {
          set({ phase: "idle", direction: null, pendingMode: null })
        }, REVEAL_MS)
      }, PEAK_MS)
    }, COVER_MS)
  },
}))
