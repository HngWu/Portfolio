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
    // Never overlap an in-flight transition; its sequence will settle to idle.
    if (get().phase !== "idle") return

    const direction: ModeTransitionDirection =
      currentMode === "quick" ? "gold-to-blue" : "blue-to-gold"

    clearTimers()
    set({ phase: "covering", direction, pendingMode: targetMode })

    phaseTimers.push(
      // Peak: screen fully occluded — the canvas holds its brightest frame here.
      window.setTimeout(() => {
        if (get().phase === "covering") set({ phase: "peak" })
      }, COVER_MS),

      // Reveal: commit the mode while the overlay still covers, then unwind.
      window.setTimeout(() => {
        useViewModeStore.getState().setMode(targetMode)
        set({ phase: "revealing" })
      }, COVER_MS + PEAK_MS),

      // Idle: teardown.
      window.setTimeout(() => {
        set({ phase: "idle", direction: null, pendingMode: null })
        clearTimers()
      }, COVER_MS + PEAK_MS + REVEAL_MS)
    )

    // Watchdog: if any phase ever stalls (rAF killed, tab backgrounded, etc.),
    // snap back to idle so the UI can't freeze on a covered screen.
    watchdog = window.setTimeout(() => {
      if (get().phase !== "idle") {
        clearTimers()
        set({ phase: "idle", direction: null, pendingMode: null })
      }
    }, WATCHDOG_MS)
  },

  reset: () => {
    clearTimers()
    set({ phase: "idle", direction: null, pendingMode: null })
  },
}))
