import { describe, it, expect, beforeEach } from "bun:test"
import { useMechanicalDeityStore } from "../store/useMechanicalDeityStore"

describe("useMechanicalDeityStore", () => {
  beforeEach(() => {
    useMechanicalDeityStore.getState().reset()
  })

  it("initializes with default values", () => {
    const state = useMechanicalDeityStore.getState()
    expect(state.isHovered).toBe(false)
    expect(state.activeHotspot).toBe(null)
    expect(state.normalizedMouse).toEqual({ x: 0, y: 0 })
    expect(state.cursorPixel).toEqual({ x: 0, y: 0 })
    expect(state.overdrive).toBe(false)
    expect(state.reducedMotion).toBe(false)
  })

  it("updates hover state", () => {
    useMechanicalDeityStore.getState().setHovered(true)
    expect(useMechanicalDeityStore.getState().isHovered).toBe(true)
    useMechanicalDeityStore.getState().setHovered(false)
    expect(useMechanicalDeityStore.getState().isHovered).toBe(false)
  })

  it("updates active hotspot", () => {
    useMechanicalDeityStore.getState().setActiveHotspot("core")
    expect(useMechanicalDeityStore.getState().activeHotspot).toBe("core")
    useMechanicalDeityStore.getState().setActiveHotspot("sword")
    expect(useMechanicalDeityStore.getState().activeHotspot).toBe("sword")
    useMechanicalDeityStore.getState().setActiveHotspot(null)
    expect(useMechanicalDeityStore.getState().activeHotspot).toBe(null)
  })

  it("updates mouse coordinates (normalized and pixel)", () => {
    useMechanicalDeityStore.getState().setMouseCoordinates(0.5, -0.25, 250, 180)
    const state = useMechanicalDeityStore.getState()
    expect(state.normalizedMouse).toEqual({ x: 0.5, y: -0.25 })
    expect(state.cursorPixel).toEqual({ x: 250, y: 180 })
  })

  it("clamps normalized coordinates between -1 and 1", () => {
    useMechanicalDeityStore.getState().setMouseCoordinates(2.5, -3.0)
    const state = useMechanicalDeityStore.getState()
    expect(state.normalizedMouse.x).toBe(1)
    expect(state.normalizedMouse.y).toBe(-1)
  })

  it("triggers and resets overdrive mode", () => {
    useMechanicalDeityStore.getState().setOverdrive(true)
    expect(useMechanicalDeityStore.getState().overdrive).toBe(true)
    useMechanicalDeityStore.getState().setOverdrive(false)
    expect(useMechanicalDeityStore.getState().overdrive).toBe(false)
  })

  it("toggles sound option", () => {
    const initial = useMechanicalDeityStore.getState().soundEnabled
    useMechanicalDeityStore.getState().toggleSound()
    expect(useMechanicalDeityStore.getState().soundEnabled).toBe(!initial)
  })
})
