import { describe, it, expect } from "bun:test"
import {
  generateLightningBolt,
  createCosmicSpark,
  updateCosmicSpark,
  type Point,
} from "../lib/deity/lightningMath"

describe("Procedural Lightning Math", () => {
  it("generates a continuous polyline starting at start and ending at end", () => {
    const start: Point = { x: 100, y: 100 }
    const end: Point = { x: 500, y: 400 }
    const points = generateLightningBolt(start, end, 3, 0.4)

    expect(points.length).toBeGreaterThan(4)
    expect(points[0].x).toBeCloseTo(start.x, 1)
    expect(points[0].y).toBeCloseTo(start.y, 1)
    expect(points[points.length - 1].x).toBeCloseTo(end.x, 1)
    expect(points[points.length - 1].y).toBeCloseTo(end.y, 1)
  })

  it("produces deterministic points with a seeded RNG", () => {
    const start: Point = { x: 50, y: 50 }
    const end: Point = { x: 200, y: 200 }
    let seed = 42
    const fakeRng = () => {
      seed = (seed * 9301 + 49297) % 233280
      return seed / 233280
    }

    const run1 = generateLightningBolt(start, end, 3, 0.3, fakeRng)
    seed = 42
    const run2 = generateLightningBolt(start, end, 3, 0.3, fakeRng)

    expect(run1).toEqual(run2)
  })

  it("handles identical start and end points gracefully", () => {
    const pt: Point = { x: 100, y: 100 }
    const points = generateLightningBolt(pt, pt, 3, 0.3)
    expect(points.length).toBeGreaterThanOrEqual(1)
  })
})

describe("Cosmic Spark Particle Simulation", () => {
  const bounds = { width: 400, height: 600 }

  it("creates a cosmic spark within given bounds", () => {
    const spark = createCosmicSpark(bounds)
    expect(spark.x).toBeGreaterThanOrEqual(0)
    expect(spark.x).toBeLessThanOrEqual(bounds.width)
    expect(spark.y).toBeGreaterThanOrEqual(0)
    expect(spark.y).toBeLessThanOrEqual(bounds.height)
    expect(spark.vy).toBeLessThan(0) // Moves upwards
    expect(spark.alpha).toBeGreaterThanOrEqual(0)
  })

  it("updates spark position upward across delta time", () => {
    const spark = createCosmicSpark(bounds)
    const initialY = spark.y
    const updated = updateCosmicSpark({ ...spark, y: 300, vy: -50 }, bounds, 0.1)
    expect(updated.y).toBeLessThan(300)
  })

  it("respawns spark when life reaches zero", () => {
    const dyingSpark = createCosmicSpark(bounds)
    dyingSpark.life = 0.01
    const updated = updateCosmicSpark(dyingSpark, bounds, 0.5)
    expect(updated.life).toBeGreaterThan(0.5)
  })
})
