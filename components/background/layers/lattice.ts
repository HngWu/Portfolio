import { HexCenter, LayerContext, rgbaToString } from '../types'

/**
 * Deterministic 2D pseudorandom hash returning a float in [0, 1).
 */
function pseudoRandom(col: number, row: number): number {
  const n = Math.sin((col + 0.1234) * 12.9898 + (row + 0.5678) * 78.233) * 43758.5453123
  return n - Math.floor(n)
}

// Static unit hexagon corner offsets (flat-top: angles k * PI / 3)
const HEX_UNIT_CORNERS = [0, 1, 2, 3, 4, 5].map((k) => {
  const angle = (k * Math.PI) / 3
  return { cos: Math.cos(angle), sin: Math.sin(angle) }
})

/**
 * Builds a flat-top hexagonal lattice covering the given dimensions.
 *
 * Vertices are at angle = k * Math.PI / 3 for k = 0..5, where vertex 0 is at (R, 0).
 * Column spacing is 1.5 * radius, row spacing is Math.sqrt(3) * radius, and
 * odd columns are vertically offset by Math.sqrt(3) * radius * 0.5.
 *
 * All hex borders are pre-drawn into a single Path2D, and approximately 5% of
 * cells are deterministically flagged as crystal cells.
 */
export function buildHexLattice(
  width: number,
  height: number,
  radius: number
): { path: Path2D; centers: HexCenter[] } {
  const safeW = Math.max(0, width)
  const safeH = Math.max(0, height)
  const safeR = Math.max(1, radius)

  const centers: HexCenter[] = []
  const colSpacing = 1.5 * safeR
  const rowSpacing = Math.sqrt(3) * safeR
  const rowShift = rowSpacing * 0.5

  if (safeW === 0 || safeH === 0) {
    const emptyPath = typeof Path2D !== 'undefined' ? new Path2D() : ({} as Path2D)
    return { path: emptyPath, centers }
  }

  // Cover beyond edges to avoid visible cutoffs
  const minCol = -1
  const maxCol = Math.ceil(safeW / colSpacing) + 1
  const minRow = -1
  const maxRow = Math.ceil(safeH / rowSpacing) + 1

  for (let col = minCol; col <= maxCol; col++) {
    const isOddCol = Math.abs(col) % 2 === 1
    const yOffset = isOddCol ? rowShift : 0
    const cx = col * colSpacing

    for (let row = minRow; row <= maxRow; row++) {
      const cy = row * rowSpacing + yOffset
      const isCrystal = pseudoRandom(col, row) < 0.05

      centers.push({
        x: cx,
        y: cy,
        col,
        row,
        isCrystal,
      })
    }
  }

  const path = typeof Path2D !== 'undefined' ? new Path2D() : ({} as Path2D)

  if (typeof Path2D !== 'undefined') {
    for (let i = 0; i < centers.length; i++) {
      const c = centers[i]
      for (let k = 0; k < 6; k++) {
        const vx = c.x + safeR * HEX_UNIT_CORNERS[k].cos
        const vy = c.y + safeR * HEX_UNIT_CORNERS[k].sin
        if (k === 0) {
          path.moveTo(vx, vy)
        } else {
          path.lineTo(vx, vy)
        }
      }
      path.closePath()
    }
  }

  return { path, centers }
}

/**
 * Renders the Deep Dive mode hexagonal blueprint lattice.
 *
 * 1. Base lattice stroked using ctx.hexLatticePath.
 * 2. Hex cells within 280px of active cursor illuminated with cyan/mint glow (zero heap string allocations).
 * 3. Crystal cells breathe sinusoidally and display an inner crystal polygon (precomputed unit corners).
 */
export function renderLattice(ctx: LayerContext): void {
  if (ctx.mix < 0.01 || ctx.width <= 0 || ctx.height <= 0) return

  const { ctx: c, width, height, mix, palette, pointer, hexLatticePath, hexCenters, config, time } = ctx
  const radius = config.density.hexRadius || 36

  // 1. Base lattice stroke using pre-built Path2D
  if (hexLatticePath) {
    const strokeAlpha = mix * (palette.isLight ? 0.07 : 0.15)
    if (strokeAlpha > 0.001) {
      c.save()
      c.strokeStyle = rgbaToString(palette.accent, strokeAlpha)
      c.lineWidth = 0.8
      c.stroke(hexLatticePath)
      c.restore()
    }
  }

  // 2. Cursor illumination: Zero string allocations using globalAlpha
  if (pointer.active && !pointer.isCoarse && hexCenters.length > 0) {
    const maxDist = 280
    const maxDistSq = maxDist * maxDist
    const baseBright = rgbaToString(palette.accentBright, 1)

    c.save()
    c.fillStyle = baseBright
    for (let i = 0; i < hexCenters.length; i++) {
      const center = hexCenters[i]
      const dx = center.x - pointer.x
      const dy = center.y - pointer.y
      const distSq = dx * dx + dy * dy

      if (distSq < maxDistSq) {
        const dist = Math.sqrt(distSq)
        const falloff = Math.max(0, 1 - dist / maxDist)
        const fillAlpha = falloff * 0.12 * mix

        if (fillAlpha > 0.001) {
          c.globalAlpha = fillAlpha
          c.beginPath()
          for (let k = 0; k < 6; k++) {
            const vx = center.x + radius * HEX_UNIT_CORNERS[k].cos
            const vy = center.y + radius * HEX_UNIT_CORNERS[k].sin
            if (k === 0) c.moveTo(vx, vy)
            else c.lineTo(vx, vy)
          }
          c.closePath()
          c.fill()
        }
      }
    }
    c.restore()
  }

  // 3. Pulsing Crystal Cells: Zero string allocations & cached line width
  if (hexCenters.length > 0) {
    const safeTime = ctx.reducedMotion ? 0 : Number.isFinite(time) ? time : 0
    const innerRadius = radius * 0.48
    const baseSoft = rgbaToString(palette.accentSoft, 1)
    const basePrimary = rgbaToString(palette.lumePrimary, 1)

    c.save()
    c.fillStyle = baseSoft
    c.strokeStyle = basePrimary
    c.lineWidth = 0.6

    for (let i = 0; i < hexCenters.length; i++) {
      const center = hexCenters[i]
      if (!center.isCrystal) continue

      if (
        center.x < -radius ||
        center.x > width + radius ||
        center.y < -radius ||
        center.y > height + radius
      ) {
        continue
      }

      const pulse = Math.sin(safeTime * 2.0 + (center.col * 3 + center.row) * 0.7)
      const crystalAlpha = Math.max(0, (0.1 + 0.15 * pulse) * mix)

      if (crystalAlpha > 0.001) {
        c.beginPath()
        for (let k = 0; k < 6; k++) {
          const vx = center.x + innerRadius * HEX_UNIT_CORNERS[k].cos
          const vy = center.y + innerRadius * HEX_UNIT_CORNERS[k].sin
          if (k === 0) c.moveTo(vx, vy)
          else c.lineTo(vx, vy)
        }
        c.closePath()

        c.globalAlpha = crystalAlpha
        c.fill()

        c.globalAlpha = Math.min(1, crystalAlpha * 1.3)
        c.stroke()
      }
    }
    c.restore()
  }
}
