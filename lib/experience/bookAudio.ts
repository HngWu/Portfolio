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
 * Procedural paper page turn sound (850ms layered parchment sweep)
 * Synthesizes 3-phase physical paper acoustics:
 * 1. Initial peel friction whisper (0–250ms)
 * 2. Sweeping bandpass arch friction (250–650ms)
 * 3. Soft air cushion landing thud (650–850ms)
 */
export function playPageTurnSound(enabled = false) {
  if (!enabled) return
  const ctx = getAudioContext()
  if (!ctx) return

  try {
    const now = ctx.currentTime
    const totalDuration = 0.85

    // 1. Friction sweep noise buffer (pink/brown noise profile)
    const bufferSize = Math.floor(ctx.sampleRate * totalDuration)
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)

    for (let i = 0; i < bufferSize; i++) {
      const progress = i / bufferSize
      // Multi-stage envelope: gentle rise -> resonant peak at 45% -> soft landing trail
      const envelope = Math.sin(progress * Math.PI) * Math.pow(1 - progress, 0.4)
      data[i] = (Math.random() * 2 - 1) * envelope
    }

    const noiseSource = ctx.createBufferSource()
    noiseSource.buffer = buffer

    // Sweeping bandpass filter: starts higher (peel) -> drops through 90deg -> settles low
    const filter = ctx.createBiquadFilter()
    filter.type = "bandpass"
    filter.frequency.setValueAtTime(1600, now)
    filter.frequency.exponentialRampToValueAtTime(1100, now + 0.35)
    filter.frequency.exponentialRampToValueAtTime(650, now + totalDuration)
    filter.Q.setValueAtTime(1.8, now)

    const gainNode = ctx.createGain()
    gainNode.gain.setValueAtTime(0.04, now)
    gainNode.gain.linearRampToValueAtTime(0.09, now + 0.35)
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + totalDuration)

    noiseSource.connect(filter)
    filter.connect(gainNode)
    gainNode.connect(ctx.destination)
    noiseSource.start(now)

    // 2. Soft landing air-cushion contact thud (subtle low-frequency settling pat)
    const thudOsc = ctx.createOscillator()
    const thudGain = ctx.createGain()
    const thudFilter = ctx.createBiquadFilter()

    thudOsc.type = "triangle"
    thudOsc.frequency.setValueAtTime(110, now + 0.6)
    thudOsc.frequency.exponentialRampToValueAtTime(45, now + totalDuration)

    thudFilter.type = "lowpass"
    thudFilter.frequency.setValueAtTime(180, now + 0.6)

    thudGain.gain.setValueAtTime(0, now)
    thudGain.gain.setValueAtTime(0.05, now + 0.6)
    thudGain.gain.exponentialRampToValueAtTime(0.001, now + totalDuration)

    thudOsc.connect(thudFilter)
    thudFilter.connect(thudGain)
    thudGain.connect(ctx.destination)

    thudOsc.start(now + 0.6)
    thudOsc.stop(now + totalDuration)
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

/**
 * Procedural metallic clasp unlatch sound (spring release and pin ping)
 */
export function playClaspUnlockSound(enabled = false) {
  if (!enabled) return
  const ctx = getAudioContext()
  if (!ctx) return

  try {
    const now = ctx.currentTime

    // 1. Resonant metallic pin release ping
    const osc = ctx.createOscillator()
    const oscGain = ctx.createGain()
    const filter = ctx.createBiquadFilter()

    osc.type = "sine"
    osc.frequency.setValueAtTime(2400, now)
    osc.frequency.exponentialRampToValueAtTime(1400, now + 0.12)

    filter.type = "bandpass"
    filter.frequency.setValueAtTime(2200, now)
    filter.Q.setValueAtTime(6.0, now)

    oscGain.gain.setValueAtTime(0.09, now)
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12)

    osc.connect(filter)
    filter.connect(oscGain)
    oscGain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.12)

    // 2. Micro mechanical lever friction click
    const clickBuffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.03), ctx.sampleRate)
    const data = clickBuffer.getChannelData(0)
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.005))
    }
    const clickSource = ctx.createBufferSource()
    clickSource.buffer = clickBuffer
    const clickGain = ctx.createGain()
    clickGain.gain.setValueAtTime(0.06, now)
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03)

    clickSource.connect(clickGain)
    clickGain.connect(ctx.destination)
    clickSource.start(now)
  } catch {
    // Ignore audio failures gracefully
  }
}

/**
 * Procedural metallic clasp relatch sound (crisp snap & lock click)
 */
export function playClaspLockSound(enabled = false) {
  if (!enabled) return
  const ctx = getAudioContext()
  if (!ctx) return

  try {
    const now = ctx.currentTime

    // 1. Sharp metallic snap latch transient
    const snapBuffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.05), ctx.sampleRate)
    const data = snapBuffer.getChannelData(0)
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.008))
    }
    const snapSource = ctx.createBufferSource()
    snapSource.buffer = snapBuffer

    const snapFilter = ctx.createBiquadFilter()
    snapFilter.type = "bandpass"
    snapFilter.frequency.setValueAtTime(3200, now)
    snapFilter.Q.setValueAtTime(3.5, now)

    const snapGain = ctx.createGain()
    snapGain.gain.setValueAtTime(0.12, now)
    snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05)

    snapSource.connect(snapFilter)
    snapFilter.connect(snapGain)
    snapGain.connect(ctx.destination)
    snapSource.start(now)

    // 2. Solid metallic seating tone
    const osc = ctx.createOscillator()
    const oscGain = ctx.createGain()
    osc.type = "triangle"
    osc.frequency.setValueAtTime(420, now)
    osc.frequency.exponentialRampToValueAtTime(160, now + 0.09)

    oscGain.gain.setValueAtTime(0.1, now)
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09)

    osc.connect(oscGain)
    oscGain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.09)
  } catch {
    // Ignore audio failures gracefully
  }
}

