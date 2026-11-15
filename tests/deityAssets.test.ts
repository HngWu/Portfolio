import { describe, it, expect } from "bun:test"
import fs from "fs"
import path from "path"

describe("Mechanical Deity Asset Pipeline", () => {
  const deityDir = path.resolve(process.cwd(), "public/images/deity")

  it("ensures public/images/deity directory exists", () => {
    expect(fs.existsSync(deityDir)).toBe(true)
  })

  it("contains source.webp with valid file size", () => {
    const sourcePath = path.join(deityDir, "source.webp")
    expect(fs.existsSync(sourcePath)).toBe(true)
    const stats = fs.statSync(sourcePath)
    expect(stats.size).toBeGreaterThan(10000)
  })

  it("contains layer-emission-mask.webp", () => {
    const maskPath = path.join(deityDir, "layer-emission-mask.webp")
    expect(fs.existsSync(maskPath)).toBe(true)
    const stats = fs.statSync(maskPath)
    expect(stats.size).toBeGreaterThan(5000)
  })

  it("contains all 4 parallax layer WebP assets", () => {
    const layers = [
      "layer-bg-space.webp",
      "layer-halo-rings.webp",
      "layer-deity-body.webp",
      "layer-fg-sword-asteroids.webp",
    ]
    for (const layer of layers) {
      const p = path.join(deityDir, layer)
      expect(fs.existsSync(p)).toBe(true)
      const stats = fs.statSync(p)
      expect(stats.size).toBeGreaterThan(1000)
    }
  })
})
