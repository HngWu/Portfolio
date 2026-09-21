"use client"

// Procedural Web Audio API sound generator for tactile book interactions
// Zero external asset downloads; fully synthesized in-memory

let audioCtx: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
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
 * Procedural paper page turn flutter sound
 * Synthesizes white noise passed through a bandpass filter with fast exponential decay
 */
export function playPageTurnSound(enabled = false) {
  if (!enabled) return
  const ctx = getAudioContext()
  if (!ctx) return

  try {
    const bufferSize = ctx.sampleRate * 0.28 // 280ms flutter
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)

    for (let i = 0; i < bufferSize; i++) {
      // Pinkish/brownish noise shape
      const progress = i / bufferSize
      const envelope = Math.sin(progress * Math.PI) * Math.exp(-progress * 3.5)
      data[i] = (Math.random() * 2 - 1) * envelope
    }

    const noiseSource = ctx.createBufferSource()
    noiseSource.buffer = buffer

    // Filter to paper scrape frequency
    const filter = ctx.createBiquadFilter()
    filter.type = "bandpass"
    filter.frequency.setValueAtTime(1400, ctx.currentTime)
    filter.frequency.exponentialRampToValueAtTime(700, ctx.currentTime + 0.25)
    filter.Q.setValueAtTime(2.2, ctx.currentTime)

    // Gentle gain
    const gainNode = ctx.createGain()
    gainNode.gain.setValueAtTime(0.08, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.26)

    noiseSource.connect(filter)
    filter.connect(gainNode)
    gainNode.connect(ctx.destination)

    noiseSource.start()
  } catch {
    // Ignore audio failures gracefully
  }
}

/**
 * Procedural book opening leather/binding release sound
 */
export function playBookOpenSound(enabled = false) {
  if (!enabled) return
  const ctx = getAudioContext()
  if (!ctx) return

  try {
    const duration = 0.4
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const filter = ctx.createBiquadFilter()

    osc.type = "triangle"
    osc.frequency.setValueAtTime(95, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + duration)

    filter.type = "lowpass"
    filter.frequency.setValueAtTime(220, ctx.currentTime)

    gain.gain.setValueAtTime(0.09, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)

    osc.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)

    osc.start()
    osc.stop(ctx.currentTime + duration)
  } catch {
    // Ignore gracefully
  }
}
