"use client"

// Synthesized procedural Web Audio feedback for the Celestial Astrolabe
// Zero external asset downloads; fully synthesized in-memory

let audioCtx: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (AudioContextClass) {
      audioCtx = new AudioContextClass()
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {})
  }
  return audioCtx
}

/**
 * Plays harmonic dual-sine chime at 528Hz & 1056Hz with smooth exponential decay.
 * Represents celestial resonance when selecting a star/node.
 */
export function playStarChime(isMuted = false): void {
  if (isMuted) return
  const ctx = getAudioContext()
  if (!ctx) return

  try {
    const now = ctx.currentTime
    const duration = 1.0

    const oscFundamental = ctx.createOscillator()
    const oscHarmonic = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscFundamental.type = "sine"
    oscFundamental.frequency.setValueAtTime(528, now)

    oscHarmonic.type = "sine"
    oscHarmonic.frequency.setValueAtTime(1056, now)

    // Master volume envelope: gentle attack (15ms) to prevent clicks, smooth exponential decay
    gainNode.gain.setValueAtTime(0.0001, now)
    gainNode.gain.linearRampToValueAtTime(0.12, now + 0.015)
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration)

    oscFundamental.connect(gainNode)
    oscHarmonic.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscFundamental.start(now)
    oscHarmonic.start(now)
    oscFundamental.stop(now + duration)
    oscHarmonic.stop(now + duration)

    oscFundamental.onended = () => {
      try {
        oscFundamental.disconnect()
        oscHarmonic.disconnect()
        gainNode.disconnect()
      } catch {
        // Ignore disconnect errors if context closed
      }
    }
  } catch {
    // Gracefully ignore audio failures (e.g. autoplay policies)
  }
}

let lastClickTime = 0

/**
 * Plays subtle filtered click (bandpass ~2600Hz, rapid 25ms decay) for wheel/pan interactions.
 * Represents tactile brass ratchet / gear stepping in the astrolabe.
 * Throttled to max 1 per 35ms to prevent event flooding.
 */
export function playBrassClick(isMuted = false): void {
  if (isMuted) return

  // Throttle rapid wheel events
  if (typeof performance !== "undefined") {
    const nowMs = performance.now()
    if (nowMs - lastClickTime < 35) return
    lastClickTime = nowMs
  }

  const ctx = getAudioContext()
  if (!ctx) return

  try {
    const now = ctx.currentTime
    const duration = 0.025 // 25ms decay

    const osc = ctx.createOscillator()
    const filter = ctx.createBiquadFilter()
    const gainNode = ctx.createGain()

    // Rapid tone transient
    osc.type = "sine"
    osc.frequency.setValueAtTime(2600, now)
    osc.frequency.exponentialRampToValueAtTime(600, now + duration)

    // Bandpass filter centered at 2600Hz
    filter.type = "bandpass"
    filter.frequency.setValueAtTime(2600, now)
    filter.Q.setValueAtTime(3.5, now)

    // Rapid decay envelope
    gainNode.gain.setValueAtTime(0.06, now)
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration)

    osc.connect(filter)
    filter.connect(gainNode)
    gainNode.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + duration)

    osc.onended = () => {
      try {
        osc.disconnect()
        filter.disconnect()
        gainNode.disconnect()
      } catch {
        // Ignore disconnect errors
      }
    }
  } catch {
    // Gracefully ignore audio failures
  }
}
