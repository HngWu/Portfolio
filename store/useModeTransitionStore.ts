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
 *   covering (overlay animates in)  →  peak (screen fully covered; mode commits
 *   here)  →  revealing (overlay animates out)  →  idle
 *
 * The overlay component reads `phase` + `direction` to drive its canvas animation
 * and commits nothing itself. Timers live here so any caller (toggle pill, ⌘K)
 * shares one source of truth. A watchdog resets a stalled sequence so an
 * interrupted rAF / routing freeze can never wedge the UI.
 */

const COVER_MS = 420
const PEAK_MS = 90
const REVEAL_MS = 480
const WATCHDOG_MS = COVER_MS + PEAK_MS + REVEAL_MS + 500

interface ModeTransitionStore {
  phase: ModeTransitionPhase
  direction: ModeTransitionDirection | null
  pendingMode: "quick" | "deep" | null
  startTransition: (targetMode: "quick" | "deep") => void
  /** Force-abort a stuck sequence back to idle. */
  reset: () => void
}

// Held outside the store so it isn't part of any React subscription.
let phaseTimers: number[] = []
let watchdog: number | null = null

function clearTimers() {
  phaseTimers.forEach((id) => window.clearTimeout(id))
  phaseTimers = []
  if (watchdog !== null) {
    window.clearTimeout(watchdog)
    watchdog = null
  }
}

export const useModeTransitionStore = create<ModeTransitionStore>((set, get) => ({
  phase: "idle",
  direction: null,
  pendingMode: null,

  startTransition: (targetMode) => {
    const currentMode = useViewModeStore.getState().mode
    if (currentMode === targetMode) return

    // Immediately commit the mode for direct 3D card flip transitions
    useViewModeStore.getState().setMode(targetMode)
  },

  reset: () => {
    clearTimers()
    set({ phase: "idle", direction: null, pendingMode: null })
  },
}))
