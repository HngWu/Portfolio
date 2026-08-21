/**
 * Gyroscope Engine — High-Performance 2D Canvas Physics & Render Pipeline
 * 
 * Drives the Arcane Gyroscope & Supernova Singularity initial preloader:
 * - Counter-rotating runic celestial rings
 * - 3D-angled trigonometric gimbal simulation
 * - Inward spiral particle gravity vortex
 * - Dynamic singularity diamond flare & radial overcharge
 * - Supernova shockwave expansion & ejection particles
 */

export interface GyroParticle {
  distance: number
  angle: number
  speed: number
  spiralSpeed: number
  size: number
  alpha: number
  hue: "mint" | "gold" | "blue" | "white"
}

export interface ShockwaveParticle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  alpha: number
  color: string
}

export interface GyroscopeState {
  outerAngle: number
  runicAngle: number
  gimbalPitch: number
  gimbalYaw: number
  particles: GyroParticle[]
  shockwaveActive: boolean
  shockwaveProgress: number
  shockwaveParticles: ShockwaveParticle[]
  overchargeIntensity: number
  pulsePhase: number
  lastTime: number | null
}

const RUNES = [
  "ᚠ", "ᚢ", "ᚦ", "ᚨ", "ᚱ", "ᚲ", "ᚷ", "ᚹ", 
  "ᚺ", "ᚾ", "ᛁ", "ᛃ", "ᛇ", "ᛈ", "ᛉ", "ᛊ", 
  "ᛏ", "ᛒ", "ᛖ", "ᛗ", "ᛚ", "ᛜ", "ᛞ", "ᛟ"
]

const PARTICLE_COUNT = 55
const BASE_RADIUS = 130

export function initGyroscope(width: number, height: number): GyroscopeState {
  const particles: GyroParticle[] = []
  const hues: Array<GyroParticle["hue"]> = ["mint", "gold", "blue", "white"]

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
      distance: BASE_RADIUS * 0.4 + Math.random() * (BASE_RADIUS * 1.4),
      angle: Math.random() * Math.PI * 2,
      speed: 35 + Math.random() * 45,
      spiralSpeed: (Math.random() > 0.5 ? 1 : -1) * (0.8 + Math.random() * 1.2),
      size: 1 + Math.random() * 2.2,
      alpha: 0.2 + Math.random() * 0.7,
      hue: hues[Math.floor(Math.random() * hues.length)]
    })
  }

  return {
    outerAngle: 0,
    runicAngle: 0,
    gimbalPitch: 0,
    gimbalYaw: 0,
    particles,
    shockwaveActive: false,
    shockwaveProgress: 0,
    shockwaveParticles: [],
    overchargeIntensity: 0,
    pulsePhase: 0,
    lastTime: null
  }
}

export function triggerShockwave(state: GyroscopeState, centerX: number, centerY: number): void {
  state.shockwaveActive = true
  state.shockwaveProgress = 0
  state.shockwaveParticles = []

  const sparkCount = 40
  const colors = ["#4AFFB4", "#FFE875", "#4A8FFF", "#FFFFFF"]
  for (let i = 0; i < sparkCount; i++) {
    const angle = Math.random() * Math.PI * 2
    const speed = 250 + Math.random() * 600
    state.shockwaveParticles.push({
      x: centerX,
      y: centerY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 1.5 + Math.random() * 2.5,
      alpha: 1,
      color: colors[Math.floor(Math.random() * colors.length)]
    })
  }
}

export function drawGyroscope(
  ctx: CanvasRenderingContext2D,
  state: GyroscopeState,
  progress: number,
  isReady: boolean,
  isOvercharging: boolean,
  now: number,
  width: number,
  height: number
): boolean {
  if (state.lastTime === null) {
    state.lastTime = now
  }
  const dt = Math.min((now - state.lastTime) / 1000, 0.05)
  state.lastTime = now

  const cx = width / 2
  const cy = height / 2 - 40 // slight vertical offset to center with HUD

  // Responsive scale factor (bounds to safe dimensions on mobile vs desktop)
  const minDim = Math.min(width, height)
  const scale = Math.max(0.75, Math.min(1.15, minDim / 650))

  // Rotation speed scales up as progress advances
  const progressRatio = Math.max(0, Math.min(100, progress)) / 100
  const speedMultiplier = 1 + progressRatio * 1.5

  state.outerAngle += dt * 0.4 * speedMultiplier
  state.runicAngle -= dt * 0.3 * speedMultiplier
  state.gimbalPitch += dt * 0.8 * speedMultiplier
  state.gimbalYaw += dt * 0.6 * speedMultiplier
  state.pulsePhase += dt * 3.5

  if (isOvercharging) {
    state.overchargeIntensity = Math.min(1, state.overchargeIntensity + dt * 3)
  }

  // Clear canvas
  ctx.clearRect(0, 0, width, height)

  // 1. Ambient Center Glow
  const ambientGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, BASE_RADIUS * 1.8 * scale)
  const mintAlpha = 0.08 + progressRatio * 0.08 + state.overchargeIntensity * 0.25
  const goldAlpha = 0.04 + progressRatio * 0.06 + state.overchargeIntensity * 0.20
  ambientGlow.addColorStop(0, `rgba(255, 232, 117, ${goldAlpha})`)
  ambientGlow.addColorStop(0.4, `rgba(74, 255, 180, ${mintAlpha})`)
  ambientGlow.addColorStop(0.8, `rgba(74, 143, 255, ${mintAlpha * 0.5})`)
  ambientGlow.addColorStop(1, "rgba(5, 5, 5, 0)")
  ctx.fillStyle = ambientGlow
  ctx.fillRect(0, 0, width, height)

  // 2. Inward Particle Vortex
  ctx.save()
  for (let i = 0; i < state.particles.length; i++) {
    const p = state.particles[i]

    // Move along spiral
    p.angle += p.spiralSpeed * dt * speedMultiplier
    p.distance -= p.speed * dt * speedMultiplier

    // Respawn when reaching center
    if (p.distance < 10 * scale) {
      p.distance = (BASE_RADIUS * 1.2 + Math.random() * (BASE_RADIUS * 0.6)) * scale
      p.angle = Math.random() * Math.PI * 2
      p.alpha = 0.3 + Math.random() * 0.6
    }

    const px = cx + Math.cos(p.angle) * p.distance
    const py = cy + Math.sin(p.angle) * p.distance

    let colorStr = "rgba(74, 255, 180, "
    if (p.hue === "gold") colorStr = "rgba(255, 232, 117, "
    if (p.hue === "blue") colorStr = "rgba(74, 143, 255, "
    if (p.hue === "white") colorStr = "rgba(255, 255, 255, "

    // Inward acceleration trail
    const trailLen = Math.min(18 * scale, (1 - p.distance / (BASE_RADIUS * 1.8 * scale)) * 25 * scale)
    const prevX = px - Math.cos(p.angle + p.spiralSpeed * 0.2) * trailLen
    const prevY = py - Math.sin(p.angle + p.spiralSpeed * 0.2) * trailLen

    ctx.beginPath()
    ctx.moveTo(prevX, prevY)
    ctx.lineTo(px, py)
    ctx.strokeStyle = colorStr + (p.alpha * 0.4) + ")"
    ctx.lineWidth = p.size * 0.6
    ctx.stroke()

    // Particle spark head
    ctx.beginPath()
    ctx.arc(px, py, p.size * scale, 0, Math.PI * 2)
    ctx.fillStyle = colorStr + p.alpha + ")"
    ctx.fill()
  }
  ctx.restore()

  // 3. Outer Celestial Ring with Ticks & Segmented Arcs
  ctx.save()
  ctx.translate(cx, cy)
  const outerR = BASE_RADIUS * 1.35 * scale

  // Base faint outer track
  ctx.beginPath()
  ctx.arc(0, 0, outerR, 0, Math.PI * 2)
  ctx.strokeStyle = "rgba(255, 255, 255, 0.08)"
  ctx.lineWidth = 1
  ctx.stroke()

  // Rotating tick marks
  const tickCount = 48
  ctx.rotate(state.outerAngle)
  for (let i = 0; i < tickCount; i++) {
    const angle = (i / tickCount) * Math.PI * 2
    const isMajor = i % 6 === 0
    const isSemi = i % 3 === 0
    const len = isMajor ? 9 * scale : isSemi ? 5 * scale : 2.5 * scale

    const x1 = Math.cos(angle) * (outerR - len)
    const y1 = Math.sin(angle) * (outerR - len)
    const x2 = Math.cos(angle) * outerR
    const y2 = Math.sin(angle) * outerR

    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.strokeStyle = isMajor
      ? "rgba(255, 232, 117, 0.75)"
      : isSemi
      ? "rgba(74, 255, 180, 0.5)"
      : "rgba(255, 255, 255, 0.18)"
    ctx.lineWidth = isMajor ? 1.5 : 1
    ctx.stroke()
  }

  // Accent glowing orbital arcs
  ctx.beginPath()
  ctx.arc(0, 0, outerR, 0, Math.PI * 0.4)
  ctx.strokeStyle = "rgba(74, 255, 180, 0.85)"
  ctx.lineWidth = 2
  ctx.shadowColor = "#4AFFB4"
  ctx.shadowBlur = 10
  ctx.stroke()

  ctx.beginPath()
  ctx.arc(0, 0, outerR, Math.PI, Math.PI * 1.35)
  ctx.strokeStyle = "rgba(255, 232, 117, 0.8)"
  ctx.lineWidth = 2
  ctx.shadowColor = "#FFE875"
  ctx.shadowBlur = 10
  ctx.stroke()
  ctx.restore()

  // 4. Counter-Spinning Inscribed Runic Orbit Track
  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(state.runicAngle)
  const runicR = BASE_RADIUS * 1.05 * scale

  // Subtle runic guide circle
  ctx.beginPath()
  ctx.arc(0, 0, runicR, 0, Math.PI * 2)
  ctx.strokeStyle = "rgba(74, 143, 255, 0.25)"
  ctx.lineWidth = 1
  ctx.setLineDash([4 * scale, 6 * scale])
  ctx.stroke()
  ctx.setLineDash([])

  // Render runes along the circular orbit
  const runeCount = RUNES.length
  ctx.font = `${Math.round(13 * scale)}px 'NotoSansRunic-Regular', 'Geist Mono', monospace`
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"

  const activeRunesCount = Math.floor(progressRatio * runeCount)

  for (let i = 0; i < runeCount; i++) {
    const angle = (i / runeCount) * Math.PI * 2
    const rx = Math.cos(angle) * runicR
    const ry = Math.sin(angle) * runicR

    ctx.save()
    ctx.translate(rx, ry)
    ctx.rotate(angle + Math.PI / 2) // Orient rune along circumference

    const isActive = i <= activeRunesCount
    if (isActive || state.overchargeIntensity > 0) {
      ctx.fillStyle = i % 2 === 0 ? "#FFE875" : "#4AFFB4"
      ctx.shadowColor = i % 2 === 0 ? "#FFE875" : "#4AFFB4"
      ctx.shadowBlur = 8 + state.overchargeIntensity * 12
    } else {
      ctx.fillStyle = "rgba(255, 255, 255, 0.22)"
      ctx.shadowBlur = 0
    }

    ctx.fillText(RUNES[i], 0, 0)
    ctx.restore()
  }
  ctx.restore()

  // 5. 3D-Oscillating Gyroscope Gimbal Rings (Pitch & Yaw Projections)
  ctx.save()
  ctx.translate(cx, cy)

  // Outer Gimbal Ring (Gold/Mint)
  const gimbalR1 = BASE_RADIUS * 0.75 * scale
  const pitchFactor1 = Math.cos(state.gimbalPitch)
  ctx.save()
  ctx.rotate(state.outerAngle * 0.5)
  ctx.scale(1, Math.max(0.15, Math.abs(pitchFactor1)))
  ctx.beginPath()
  ctx.arc(0, 0, gimbalR1, 0, Math.PI * 2)
  ctx.strokeStyle = "rgba(201, 162, 39, 0.65)"
  ctx.lineWidth = 1.5
  ctx.shadowColor = "#C9A227"
  ctx.shadowBlur = 8
  ctx.stroke()
  ctx.restore()

  // Inner Orthogonal Gimbal Ring (Cyan/Blue)
  const gimbalR2 = BASE_RADIUS * 0.52 * scale
  const yawFactor2 = Math.sin(state.gimbalYaw)
  ctx.save()
  ctx.rotate(state.runicAngle * 0.7)
  ctx.scale(Math.max(0.15, Math.abs(yawFactor2)), 1)
  ctx.beginPath()
  ctx.arc(0, 0, gimbalR2, 0, Math.PI * 2)
  ctx.strokeStyle = "rgba(74, 255, 180, 0.75)"
  ctx.lineWidth = 1.5
  ctx.shadowColor = "#4AFFB4"
  ctx.shadowBlur = 8
  ctx.stroke()
  ctx.restore()

  ctx.restore()

  // 6. Central Singularity Core & Overcharge Diamond Flare
  ctx.save()
  ctx.translate(cx, cy)

  // Core contraction on overcharge suction -> explosive expansion
  let coreScale = (1 + Math.sin(state.pulsePhase) * 0.08) * scale
  if (state.overchargeIntensity > 0) {
    coreScale = (1 + state.overchargeIntensity * 1.5) * scale
  }

  // Radial Light Beams from Core
  const beamCount = 8
  const beamLen = (35 + state.overchargeIntensity * 80) * scale
  for (let i = 0; i < beamCount; i++) {
    const angle = (i / beamCount) * Math.PI * 2 + state.outerAngle * 0.2
    const bx = Math.cos(angle) * beamLen
    const by = Math.sin(angle) * beamLen

    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(bx, by)
    ctx.strokeStyle = `rgba(255, 232, 117, ${0.15 + state.overchargeIntensity * 0.6})`
    ctx.lineWidth = (i % 2 === 0 ? 2 : 1) * scale
    ctx.stroke()
  }

  // Core outer glowing diamond
  const coreSize = 16 * coreScale
  ctx.save()
  ctx.rotate(Math.PI / 4 + state.outerAngle * 0.5)
  ctx.beginPath()
  ctx.rect(-coreSize / 2, -coreSize / 2, coreSize, coreSize)
  ctx.fillStyle = "rgba(74, 255, 180, 0.4)"
  ctx.strokeStyle = "#4AFFB4"
  ctx.lineWidth = 2
  ctx.shadowColor = "#4AFFB4"
  ctx.shadowBlur = 20 + state.overchargeIntensity * 30
  ctx.fill()
  ctx.stroke()
  ctx.restore()

  // Core inner intense diamond
  const innerSize = 9 * coreScale
  ctx.save()
  ctx.rotate(Math.PI / 4 - state.runicAngle * 0.5)
  ctx.beginPath()
  ctx.rect(-innerSize / 2, -innerSize / 2, innerSize, innerSize)
  ctx.fillStyle = state.overchargeIntensity > 0.5 ? "#FFFFFF" : "#FFE875"
  ctx.shadowColor = "#FFE875"
  ctx.shadowBlur = 15 + state.overchargeIntensity * 25
  ctx.fill()
  ctx.restore()

  ctx.restore()

  // 7. Supernova Shockwave Simulation
  if (state.shockwaveActive) {
    state.shockwaveProgress += dt * 1.25 // completes in ~0.8s
    const maxR = Math.sqrt(width * width + height * height) * 0.65
    const currentR = state.shockwaveProgress * maxR
    const alpha = Math.max(0, 1 - state.shockwaveProgress)

    // Primary bright shockwave wave
    ctx.save()
    ctx.beginPath()
    ctx.arc(cx, cy, currentR, 0, Math.PI * 2)
    ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.9})`
    ctx.lineWidth = Math.max(2, (1 - state.shockwaveProgress) * 12 * scale)
    ctx.shadowColor = "#4AFFB4"
    ctx.shadowBlur = 25
    ctx.stroke()

    // Secondary colored refractive ring
    ctx.beginPath()
    ctx.arc(cx, cy, Math.max(0, currentR - 15 * scale), 0, Math.PI * 2)
    ctx.strokeStyle = `rgba(74, 255, 180, ${alpha * 0.6})`
    ctx.lineWidth = 3 * scale
    ctx.stroke()

    // Ejected shockwave sparks
    for (let i = 0; i < state.shockwaveParticles.length; i++) {
      const sp = state.shockwaveParticles[i]
      sp.x += sp.vx * dt
      sp.y += sp.vy * dt
      sp.alpha = Math.max(0, sp.alpha - dt * 1.2)

      ctx.beginPath()
      ctx.arc(sp.x, sp.y, sp.size * scale, 0, Math.PI * 2)
      ctx.fillStyle = sp.color
      ctx.globalAlpha = sp.alpha
      ctx.fill()
    }
    ctx.globalAlpha = 1
    ctx.restore()

    if (state.shockwaveProgress >= 1) {
      state.shockwaveActive = false
      return false
    }
  }

  return true
}
