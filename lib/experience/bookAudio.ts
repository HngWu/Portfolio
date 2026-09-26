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

/**
 * Procedural multi-page flutter sound (rapid paper riffling)
 * Synthesizes 3 micro-staggered noise bursts with sweeping bandpass filters
 */
export function playMultiPageFlutterSound(enabled = false) {
  if (!enabled) return
  const ctx = getAudioContext()
  if (!ctx) return

  try {
    const bursts = [0, 0.1, 0.2] // 3 staggered page leaf sounds
    bursts.forEach((offset, idx) => {
      const bufferSize = Math.floor(ctx.sampleRate * 0.16)
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const data = buffer.getChannelData(0)

      for (let i = 0; i < bufferSize; i++) {
        const progress = i / bufferSize
        const envelope = Math.sin(progress * Math.PI) * Math.exp(-progress * 4.2)
        data[i] = (Math.random() * 2 - 1) * envelope
      }

      const noiseSource = ctx.createBufferSource()
      noiseSource.buffer = buffer

      const filter = ctx.createBiquadFilter()
      filter.type = "bandpass"
      const startFreq = 1900 - idx * 220
      filter.frequency.setValueAtTime(startFreq, ctx.currentTime + offset)
      filter.frequency.exponentialRampToValueAtTime(650, ctx.currentTime + offset + 0.14)
      filter.Q.setValueAtTime(2.0, ctx.currentTime + offset)

      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0.09, ctx.currentTime + offset)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + offset + 0.15)

      noiseSource.connect(filter)
      filter.connect(gain)
      gain.connect(ctx.destination)

      noiseSource.start(ctx.currentTime + offset)
    })
  } catch {
    // Ignore audio failures gracefully
  }
}

/**
 * Procedural heavy hardcover book closing thud sound
 * Deep resonance combined with leather/buckram slap
 */
export function playBookCloseSound(enabled = false) {
  if (!enabled) return
  const ctx = getAudioContext()
  if (!ctx) return

  try {
    const now = ctx.currentTime

    // 1. Deep low-frequency resonance
    const osc = ctx.createOscillator()
    const oscGain = ctx.createGain()
    const lowFilter = ctx.createBiquadFilter()

    osc.type = "triangle"
    osc.frequency.setValueAtTime(70, now)
    osc.frequency.exponentialRampToValueAtTime(32, now + 0.22)

    lowFilter.type = "lowpass"
    lowFilter.frequency.setValueAtTime(140, now)

    oscGain.gain.setValueAtTime(0.14, now)
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22)

    osc.connect(lowFilter)
    lowFilter.connect(oscGain)
    oscGain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.22)

    // 2. Crisp slap impact noise
    const slapBufferSize = Math.floor(ctx.sampleRate * 0.06)
    const slapBuffer = ctx.createBuffer(1, slapBufferSize, ctx.sampleRate)
    const slapData = slapBuffer.getChannelData(0)
    for (let i = 0; i < slapBufferSize; i++) {
      slapData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.012))
    }

    const slapSource = ctx.createBufferSource()
    slapSource.buffer = slapBuffer

    const slapFilter = ctx.createBiquadFilter()
    slapFilter.type = "bandpass"
    slapFilter.frequency.setValueAtTime(800, now)
    slapFilter.Q.setValueAtTime(1.4, now)

    const slapGain = ctx.createGain()
    slapGain.gain.setValueAtTime(0.08, now)
    slapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06)

    slapSource.connect(slapFilter)
    slapFilter.connect(slapGain)
    slapGain.connect(ctx.destination)

    slapSource.start(now)
  } catch {
    // Ignore audio failures gracefully
  }
}

