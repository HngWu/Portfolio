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
    if (currentMode === targetMode) return
    useViewModeStore.getState().setMode(targetMode)
  },
}))
