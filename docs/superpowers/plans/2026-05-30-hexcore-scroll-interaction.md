# HexCore Scroll Interaction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a highly refined, premium scroll interaction system for the 3D HexCore model in the bento grid by combining gyroscopic precession Y-axis alignment (Orrery Lock) and volumetric layer micro-displacements (Breathing Singularity), completely eliminating visual clutter and clipping.

**Architecture:** We will replace the camera dolly-zoom and the massive pyramid explosion of 2.8+ units with a compact micro-expansion of max 0.08 units and a zero-G Z-drift parallax. The concentric outer rings will smoothly slerp from idle precession wobble axes into a perfectly flat coplanar plane based on scroll progress, locking their spin speeds into harmonic integer gear ratios.

**Tech Stack:** React Three Fiber, Three.js, GSAP.

---

## decomposed tasks

### Task 1: Deprecate Extreme Scaling & Camera Dolly

**Files:**
- Modify: `components/bento/tiles/PolyhedronCanvas.tsx:1028-1036`
- Modify: `components/bento/tiles/PolyhedronCanvas.tsx:1428-1440`

- [ ] **Step 1: Stable Camera Z-axis position**
  Remove the camera position dolly-zoom interpolation in the scene frame loop.
  
  Locate lines 1032-1035:
  ```typescript
  // Act 3 Detonation: Camera Dolly Closer (Triggered in the first 0% to 25% of scroll while fully visible)
  const act3Progress = THREE.MathUtils.clamp(smoothScroll.current / 0.25, 0, 1)
  camera.position.z = THREE.MathUtils.lerp(13, 9, act3Progress)
  ```
  Replace it with a stable, fixed camera position on the Z-axis:
  ```typescript
  // Stable camera positioning to prevent visual motion friction
  camera.position.z = 13
  ```

- [ ] **Step 2: Remove Extreme Pyramid Expansion Vector**
  Remove the large pyramid expansion increment and the act 3/4 calculations.
  
  Locate lines 1429-1438:
  ```typescript
  // Assemble acts
  let targetExp = isDeepDive ? 0.45 : 0.25
  
  // Act 3 Detonation: Expand outward (Triggered in the first 0% to 25% of scroll while fully visible)
  const act3Progress = THREE.MathUtils.clamp(smoothScroll.current / 0.25, 0, 1)
  targetExp += act3Progress * 2.8

  // Act 4 Lockdown: Slam completely shut (Triggered in the next 25% to 50% of scroll)
  const act4Progress = THREE.MathUtils.clamp((smoothScroll.current - 0.25) / 0.25, 0, 1)
  targetExp = THREE.MathUtils.lerp(targetExp, 0.02, act4Progress)
  ```
  Replace it with the base expansion calculation:
  ```typescript
  // Assemble base expansion based on Deep Dive mode progress
  let targetExp = isDeepDive ? 0.35 : 0.25
  ```

- [ ] **Step 3: Commit clean-up**
  ```bash
  git add components/bento/tiles/PolyhedronCanvas.tsx
  git commit -m "refactor: stabilize camera Z-position and remove extreme scroll expansion"
  ```

---

### Task 2: Implement Gyroscopic Precession & Resonance Alignment (Orrery Lock)

**Files:**
- Modify: `components/bento/tiles/PolyhedronCanvas.tsx:1036-1070`

- [ ] **Step 1: Implement Scroll-Activated Precession slerping**
  Configure the concentric rings' base quaternions to slerp from their precessing idle wobble axes to a flat global Y-axis alignment based on `smoothScroll.current`, and slerp towards the cursor tracking on pointer hover.
  
  Locate lines 1050-1055:
  ```typescript
  refs.forEach((ref, idx) => {
    if (!ref.current) return
    // Calculate slerp between idle wobble precession and active cursor orientation
    const idleQuat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), currentPrecessedAxes[idx])
    const targetQuat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), cursorVector)
    ref.current.quaternion.slerpQuaternions(idleQuat, targetQuat, hoverProgress)
  ```
  Replace it with:
  ```typescript
  const flatAxis = _scratchVector1.set(0, 1, 0)
  refs.forEach((ref, idx) => {
    if (!ref.current) return
    
    // 1. Calculate base idle wobble precession quaternion
    const idleQuat = _scratchQuat1.setFromUnitVectors(flatAxis, currentPrecessedAxes[idx])
    
    // 2. Target coplanar/flat locked orientation
    const lockedQuat = _scratchQuat2.setFromEuler(_scratchEuler.set(0, 0, 0))
    
    // 3. Slerp precession wobble down based on scroll progress (Concept A)
    const baseAlignedQuat = _scratchQuat3.slerpQuaternions(idleQuat, lockedQuat, smoothScroll.current)
    
    // 4. Slerp to active pointer tracking based on hoverProgress
    const targetCursorQuat = _scratchQuat1.setFromUnitVectors(flatAxis, cursorVector)
    ref.current.quaternion.slerpQuaternions(baseAlignedQuat, targetCursorQuat, hoverProgress)
  ```

- [ ] **Step 2: Apply Harmonic Speed Coupling**
  Transition local spin speeds to strict integer gear ratios based on scroll progress.
  
  Locate lines 1057-1060:
  ```typescript
  // Calculate and accumulate smooth local Y-axis spin
  const idleSpeed = idx === 1 ? -0.5 : (idx === 2 ? 0.3 : 0.6)
  const targetSpeed = baseFreq * gearRatios[idx]
  let currentSpeed = THREE.MathUtils.lerp(idleSpeed, targetSpeed, hoverProgress)
  ```
  Replace it with:
  ```typescript
  // Smoothly coupling speed to strict integer gear ratios as scroll progress increases
  const idleSpeed = idx === 1 ? -0.5 : (idx === 2 ? 0.3 : 0.6)
  const targetSpeed = baseFreq * gearRatios[idx]
  
  // Blend speeds using smoothScroll progress (harmonic resonance)
  const speedBlend = Math.pow(smoothScroll.current, 1.5)
  let currentSpeed = THREE.MathUtils.lerp(idleSpeed, targetSpeed, speedBlend)
  ```

- [ ] **Step 3: Commit Orrery Lock changes**
  ```bash
  git add components/bento/tiles/PolyhedronCanvas.tsx
  git commit -m "feat: implement gyroscopic precession alignment and harmonic speed coupling"
  ```

---

### Task 3: Volumetric Micro-Displacement & Zero-G Parallax Z-Drift

**Files:**
- Modify: `components/bento/tiles/PolyhedronCanvas.tsx:1430-1456`
- Modify: `components/bento/tiles/PolyhedronCanvas.tsx:1532-1540`

- [ ] **Step 1: Volumetric breathing micro-expansion**
  Implement the subtle sinusoidal expansion wave that peaks at 50% scroll.
  
  Locate lines 1429-1431 (modified in Task 1):
  ```typescript
  // Assemble base expansion based on Deep Dive mode progress
  let targetExp = isDeepDive ? 0.35 : 0.25
  ```
  Replace with a dynamic breathing curve based on scroll progress (Concept B):
  ```typescript
  // Base expansion plus subtle cinematic sinusoidal micro-expansion (Breathing Singularity)
  const baseExpansion = isDeepDive ? 0.35 : 0.25
  const scrollExpansion = 0.08 * Math.sin(smoothScroll.current * Math.PI)
  let targetExp = baseExpansion + scrollExpansion
  ```

- [ ] **Step 2: Layered Z-axis Parallax Drift**
  Add the coordinate-anchored zero-G layer drift inside the pyramid assembly frame loop.
  
  Locate lines 1532-1540:
  ```typescript
  const driftOffset = _scratchVector2.set(0, 0, 0)
  if (sharedSpellState.antigravity) {
    const driftAmp = 1.0 + Math.sin(state.clock.getElapsedTime() * 1.5 + data.center.x) * 0.25
    driftOffset.set(
      Math.sin(state.clock.getElapsedTime() * 0.8 + data.center.y) * 0.5,
      Math.cos(state.clock.getElapsedTime() * 1.1 + data.center.z) * 0.5 + driftAmp,
      Math.cos(state.clock.getElapsedTime() * 0.9 + data.center.x) * 0.5
    )
  }
  ```
  Replace it with:
  ```typescript
  const driftOffset = _scratchVector2.set(0, 0, 0)
  if (sharedSpellState.antigravity) {
    const driftAmp = 1.0 + Math.sin(state.clock.getElapsedTime() * 1.5 + data.center.x) * 0.25
    driftOffset.set(
      Math.sin(state.clock.getElapsedTime() * 0.8 + data.center.y) * 0.5,
      Math.cos(state.clock.getElapsedTime() * 1.1 + data.center.z) * 0.5 + driftAmp,
      Math.cos(state.clock.getElapsedTime() * 0.9 + data.center.x) * 0.5
    )
  } else {
    // Volumetric out-of-phase Z-parallax drift using piece-distance coordinates (Concept B)
    const pieceDist = data.center.length()
    const phaseOffset = pieceDist * Math.PI
    const driftAmp = 0.08 * smoothScroll.current
    driftOffset.set(
      Math.sin(state.clock.getElapsedTime() * 0.6 + phaseOffset) * 0.03 * smoothScroll.current,
      Math.cos(state.clock.getElapsedTime() * 0.8 + phaseOffset) * 0.03 * smoothScroll.current,
      Math.cos(state.clock.getElapsedTime() * 1.0 + phaseOffset) * driftAmp
    )
  }
  ```

- [ ] **Step 3: Commit Breathing Singularity changes**
  ```bash
  git add components/bento/tiles/PolyhedronCanvas.tsx
  git commit -m "feat: implement volumetric breathing micro-expansion and zero-G Z-parallax drift"
  ```

---

### Task 4: Compilation & Performance Verification

- [ ] **Step 1: Check compile and production build correctness**
  Run the Next.js production build to ensure that all typescript definitions, glsl shader properties, and component configurations compile cleanly without warning.
  
  Run: `npm run build`
  Expected output: Clean compilation and static page generation.

- [ ] **Step 2: Profile frame-rate and memory allocations**
  Verify that no new Vector3, Quaternion, or Euler allocations are made inside the useFrame loop (no garbage collection overhead).

- [ ] **Step 3: Push changes to development and master**
  ```bash
  git push origin development
  git push origin master
  ```
