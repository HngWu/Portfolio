import test from "node:test"
import assert from "node:assert/strict"

// Mock minimal localStorage for node environment
if (typeof globalThis.localStorage === "undefined") {
  const store = new Map()
  globalThis.localStorage = {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, val) => store.set(key, String(val)),
    removeItem: (key) => store.delete(key),
    clear: () => store.clear(),
  }
}

// Import store
const { usePerformanceStore } = await import("../store/usePerformanceStore.ts")

test("usePerformanceStore has correct defaults", () => {
  const state = usePerformanceStore.getState()
  assert.equal(state.enable3DModel, true)
  assert.equal(state.enableCustomCursor, true)
  assert.equal(state.enableBackgroundFx, true)
  assert.equal(state.enableCardTilt, true)
  assert.equal(state.isPromptOpen, false)
  assert.equal(state.hasPrompted, false)
})

test("optimizeAll disables all performance-intensive features", () => {
  const store = usePerformanceStore.getState()
  store.optimizeAll()

  const updated = usePerformanceStore.getState()
  assert.equal(updated.enable3DModel, false)
  assert.equal(updated.enableCustomCursor, false)
  assert.equal(updated.enableBackgroundFx, false)
  assert.equal(updated.enableCardTilt, false)
})

test("restoreHighQuality re-enables all features", () => {
  const store = usePerformanceStore.getState()
  store.restoreHighQuality()

  const updated = usePerformanceStore.getState()
  assert.equal(updated.enable3DModel, true)
  assert.equal(updated.enableCustomCursor, true)
  assert.equal(updated.enableBackgroundFx, true)
  assert.equal(updated.enableCardTilt, true)
})

test("setToggle updates an individual toggle correctly", () => {
  const store = usePerformanceStore.getState()
  store.setToggle("enable3DModel", false)

  assert.equal(usePerformanceStore.getState().enable3DModel, false)
  assert.equal(usePerformanceStore.getState().enableCustomCursor, true)

  store.setToggle("enable3DModel", true)
  assert.equal(usePerformanceStore.getState().enable3DModel, true)
})

test("reportLag opens prompt if not already prompted and not suppressed", () => {
  const store = usePerformanceStore.getState()
  store.restoreHighQuality()
  usePerformanceStore.setState({ hasPrompted: false, neverShowAutoPrompt: false, isPromptOpen: false })

  store.reportLag()

  const updated = usePerformanceStore.getState()
  assert.equal(updated.isPromptOpen, true)
  assert.equal(updated.hasPrompted, true)
  assert.equal(updated.isLagging, true)
})

test("reportLag does not open prompt if neverShowAutoPrompt is true", () => {
  usePerformanceStore.setState({ hasPrompted: false, neverShowAutoPrompt: true, isPromptOpen: false })
  const store = usePerformanceStore.getState()

  store.reportLag()

  const updated = usePerformanceStore.getState()
  assert.equal(updated.isPromptOpen, false)
})

test("dismissPrompt closes prompt and records preference", () => {
  usePerformanceStore.setState({ isPromptOpen: true, neverShowAutoPrompt: false })
  const store = usePerformanceStore.getState()

  store.dismissPrompt(true)

  const updated = usePerformanceStore.getState()
  assert.equal(updated.isPromptOpen, false)
  assert.equal(updated.hasPrompted, true)
  assert.equal(updated.neverShowAutoPrompt, true)
})
