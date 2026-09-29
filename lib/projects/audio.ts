"use client"

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

const AUDIO_MUTE_STORAGE_KEY = "lume_projects_carousel_audio_muted"

/**
 * Checks whether audio is muted. Defaults to true (sound off by default).
 */
export function isCarouselAudioMuted(): boolean {
  if (typeof window === "undefined") return true
  try {
    const stored = window.localStorage.getItem(AUDIO_MUTE_STORAGE_KEY)
    if (stored === null) return true // default OFF
    return stored === "true"
  } catch {
    return true
  }
}

/**
 * Saves mute state to localStorage.
 */
export function setCarouselAudioMuted(muted: boolean): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(AUDIO_MUTE_STORAGE_KEY, String(muted))
  } catch {
    // Ignore storage errors
  }
}

/**
 * Plays a procedural, tactile mechanical snap tick sound.
 * Zero external asset downloads; fully synthesized in-memory via Web Audio API.
 */
export function playCarouselTick(enabled = false): void {
  if (!enabled) return
  const ctx = getAudioContext()
  if (!ctx) return

  try {
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const filter = ctx.createBiquadFilter()

    // Dual-stage click: snappy attack dropping sharply
    osc.type = "sine"
    osc.frequency.setValueAtTime(1200, now)
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.024)

    filter.type = "bandpass"
    filter.frequency.setValueAtTime(2200, now)
    filter.Q.setValueAtTime(3.5, now)

    gain.gain.setValueAtTime(0.045, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.024)

    osc.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.025)
  } catch {
    // Gracefully ignore audio failures (e.g. strict autoplay policy before first gesture)
  }
}
