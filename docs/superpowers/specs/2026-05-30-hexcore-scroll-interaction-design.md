# HexCore Scroll Interaction Redesign Specification
### Lume-Glass Portfolio 3D Centerpiece Interaction Upgrade
**Author**: Antigravity AI
**Date**: May 30, 2026

---

## 1. Executive Summary & Context

### 1.1 The Current Problem
The existing scroll animation for the **3D HexCore** centerpiece relies on a dramatic detonation expansion (`targetExp += act3Progress * 2.8`) and a major camera dolly closer (`camera.position.z = THREE.MathUtils.lerp(13, 9, act3Progress)`). While visually bold, this approach violates our high-end **Lume-Glass** minimalist aesthetic:
1. **Geometric Disruption**: The extreme physical expansion (shattering parts outward by 2.8+ units) breaks the solid unity of the core, making it look fragmented and chaotic rather than a unified piece of advanced technology.
2. **Viewport & Spatial Clutter**: The dramatic scaling causes the 54 pyramids to clip against adjacent Bento tiles, drawing focus away from the surrounding project text and metrics.
3. **Jarring Parallax**: The abrupt camera movement and scaling disrupt smooth reading flow as the user scrolls, creating a visual "leap" instead of an elegant, premium, and cinematic scroll progression.

### 1.2 The Redesign Goal
We are replacing the massive geometric expansion and scale shifts with a **subtle, high-fidelity, and cinematic interaction system**. The centerpiece should feel like an active, weighted instrument suspended in a fluid magnetic field, responding to scroll progress with:
*   **Subtle rotational precession phase shifts**
*   **Weighted gyroscopic alignment**
*   **Micro-displacement and parallax depth layers**
*   **Concentrating VFX accretion fields**

Below, we detail three distinct premium motion concepts, their mathematical formulations, and their complete R3F `useFrame` implementation patterns.

---

## 2. Concept A: Gyroscopic Precession & Resonance Alignment (The "Orrery" Lock)

### 2.1 Visual & Cinematic Experience
In this concept, the three outer concentric rings and the inner 3D core start in an unaligned, out-of-phase precession wobble—representing an "unlocked," wandering idle state.
As the user scrolls down, the gyroscopic precession axes of the rings and the core layers smoothly slerp into perfect, coplanar alignment. 
At 100% scroll progress (fully locked), the three rings synchronize their local rotation speeds into strict harmonic integer gear ratios (e.g., $1\omega, -2\omega, 3\omega$), and the runic glow intensities rise to a sharp, high-contrast gleam. It feels like an ancient, precision-engineered astronomical instrument (an orrery) locking into a sacred coordinate.

```
       [ IDLE STATE: 0% SCROLL ]                     [ LOCKED STATE: 100% SCROLL ]
        Rings Wobbling on Odd Axes                     All Rings Coplanar (Y-Plane)
               /   |   \                                      =======
             /     |     \                                    =======
           (   Core Tumbled   )                               ( Core )
             \     |     /                                    =======
               \   |   /                                      =======
```

### 2.2 Mathematical Model
Let $\hat{u}_i(t)$ be the precessing idle axis of ring $i$ at time $t$. The target locked spin axis is the global Y-axis:
$$\vec{v}_{\text{target}} = \begin{bmatrix} 0 \\ 1 \\ 0 \end{bmatrix}$$

We calculate the slerped rotation axis $\hat{w}_i(s, t)$ as a function of scroll progress $s \in [0, 1]$ and time $t$:
$$\vec{w}_i(s, t) = \text{Slerp}\left(\hat{u}_i(t), \vec{v}_{\text{target}}, s^2\right)$$
Where the quadratic $s^2$ provides a premium, weighted ease-in feeling to the alignment.

To animate the local ring spin, the rotational velocity $\omega_i(s)$ transitions from its idle speed $\omega_{\text{idle}, i}$ to its harmonic gear speed $\omega_{\text{lock}, i}$:
$$\omega_i(s) = \text{lerp}\left(\omega_{\text{idle}, i}, \omega_0 \cdot \gamma_i, s^{1.5}\right)$$
Where $\gamma = [1, -2, 3]$ represent the gear ratios, and $\omega_0$ is the base resonance frequency.

### 2.3 R3F `useFrame` Equation & Implementation
```typescript
// Pre-allocated variables in component module scope (Zero-Allocation)
const _targetAxis = new THREE.Vector3(0, 1, 0);
const _currentAxis = new THREE.Vector3();
const _idleQuat = new THREE.Quaternion();
const _targetQuat = new THREE.Quaternion();
const _finalQuat = new THREE.Quaternion();

// Inside main HexCore useFrame:
useFrame((state, delta) => {
  const t = state.clock.getElapsedTime();
  const s = smoothScroll.current; // smooth 0 to 1 scroll position
  
  // Ease curve for weighted lock
  const alignEase = s * s;
  const speedEase = Math.pow(s, 1.5);
  
  const refs = [ring1Ref, ring2Ref, ring3Ref];
  const spinRefs = [ring1Spin, ring2Spin, ring3Spin];
  const idleSpeeds = [0.6, -0.5, 0.3];
  const gearRatios = [1.0, -2.0, 3.0];
  const baseFreq = 0.8;
  
  refs.forEach((ref, idx) => {
    if (!ref.current) return;
    
    // 1. Gyroscopic Axis Precession slerp
    const precessAxis = currentPrecessedAxes[idx]; // original precessing axis
    _idleQuat.setFromUnitVectors(_targetAxis, precessAxis);
    _targetQuat.setFromEuler(_scratchEuler.set(0, 0, 0)); // Flat coplanar target
    
    _finalQuat.slerpQuaternions(_idleQuat, _targetQuat, alignEase);
    ref.current.quaternion.copy(_finalQuat);
    
    // 2. Harmonic Speed Coupling
    const targetSpeed = baseFreq * gearRatios[idx];
    const currentSpeed = THREE.MathUtils.lerp(idleSpeeds[idx], targetSpeed, speedEase);
    
    spinRefs[idx].current += currentSpeed * delta;
    ref.current.rotateOnAxis(_targetAxis, spinRefs[idx].current);
  });
});
```

---

## 3. Concept B: Fractional Layer Displacement & Volumetric Core Drift (The "Breathing" Singularity)

### 3.1 Visual & Cinematic Experience
Instead of exploding the 54 pyramids outward and scaling the core, this concept introduces a highly controlled, organic "breathing" micro-expansion.
As the user scrolls, the pyramids shift outwards along their normal axes by a maximum of only `0.12 units` (a fraction of the previous `2.8 units`).
To create depth, we apply a layered volumetric parallax: the inner core, the middle shell layers, and the outer obsidian casing drift slightly out of phase on the Z-axis (towards and away from the camera).
This micro-displacement creates an elastic, high-fidelity liquid feeling, revealing the intricate gaps and glowing runic symbols inside the core without breaking its geometry.

```
       [ SCROLL PROGRESS: 0% ]                        [ SCROLL PROGRESS: 50% ]
      Core Compact, Solid Shell                     controlled micro-expansion (0.12)
             ___________                                   _ _ _ _ _ _ _
            /           \                                 /  _   _   _  \
           |   [Core]    |                               |  |_| |_| |_|  |
           |             |                               |  |_| [★] |_|  |
            \___________/                                 \ _ _ _ _ _ _ /
```

### 3.2 Mathematical Model
Let $d_j$ be the distance of pyramid piece $j$ from the center, and $\hat{n}_j$ be its normal axis.
The expansion factor $E(s)$ is modeled as a smooth sinus pulse that peaks at 50% scroll (when scanning bento details) and smoothly contracts back as the user moves past:
$$E(s) = E_{\text{base}} + E_{\text{max}} \cdot \sin(s \cdot \pi)$$
Where $E_{\text{base}} = 0.05$ and $E_{\text{max}} = 0.12$.

The axial volumetric Z-drift $Z_j(s, t)$ uses a layer phase offset based on the piece's initial radial distance $r_j$:
$$\text{Drift}_j(s, t) = \sin(t \cdot 1.2 + r_j \cdot 2.5) \cdot A_{\text{drift}} \cdot s$$
Where $A_{\text{drift}} = 0.08$ is the drift amplitude, scaling linearly with scroll progress.

### 3.3 R3F `useFrame` Equation & Implementation
```typescript
// Inside BentoPyramidPiece useFrame:
useFrame((state, delta) => {
  const t = state.clock.getElapsedTime();
  const s = smoothScroll.current;
  
  // Base parameters
  const isDeepDive = sharedSpellState.modeProgress > 0.5;
  const baseExpansion = isDeepDive ? 0.08 : 0.04;
  
  // Cinematic scroll expansion curve: smooth sine pulse peaking in middle viewport
  const scrollExpansion = 0.12 * Math.sin(s * Math.PI);
  const expansionFactor = baseExpansion + scrollExpansion;
  
  // Zero-G layered parallax drift (zero-allocation)
  const pieceDist = data.center.length();
  const phaseOffset = pieceDist * 3.14; // anchor to distance
  const driftAmp = 0.08 * s;
  
  const driftOffset = _scratchVector2.set(
    Math.sin(t * 0.6 + phaseOffset) * 0.03 * s,
    Math.cos(t * 0.8 + phaseOffset) * 0.03 * s,
    Math.cos(t * 1.0 + phaseOffset) * driftAmp
  );
  
  const assembledPos = _scratchVector3.copy(data.center)
    .applyMatrix4(matrix)
    .add(rotatedNormal.multiplyScalar(expansionFactor))
    .add(driftOffset);
    
  meshGroupRef.current.position.copy(assembledPos);
});
```

---

## 4. Concept C: Dimensional Ring Compression & Accretion Flare (The "Chronos" Gate)

### 4.1 Visual & Cinematic Experience
In this concept, as the user scrolls down, the concentric outer rings slowly contract along their coaxial axes, moving from their wide, precessing, orbital positions into a tightly compressed, single-axis obsidian shielding sleeve around the core.
Simultaneously, the GPU-accelerated **Runic Dust Stream** is drawn inward by a simulated gravitational singularity: the particles condense from a loose, warm ambient fog into a highly concentrated, fast-rotating accretion disk directly orbiting the core’s equator.
The glow of the rings transitions from a diffuse glow into a high-intensity, blazing light, shifting the camera's depth of field to emphasize the compressed, high-energy core singularity.

```
       [ SCROLL PROGRESS: 0% ]                        [ SCROLL PROGRESS: 100% ]
        Wide Orbital Rings                             Tight Protective Sleeve
              Ring 1                                          === Ring 1 ===
            - Ring 2 -                                        === Ring 2 ===
          --  Ring 3  --                                      === Ring 3 ===
         (Loose Dust Fog)                                   (Accretion Disk)
```

### 4.2 Mathematical Model
Let $Z_i$ be the target axial distance of ring $i$ from the core center. The initial wide spread is $Z_{\text{initial}} = [-0.6, 0.0, 0.6]$. As the user scrolls, the axial coordinates contract:
$$Z_i(s) = Z_{\text{initial}, i} \cdot (1.0 - s^{2})$$

The Runic Dust particle positions $\vec{P}_p(t)$ are governed by an orbital gravity field that compresses their latitude coordinates as scroll progress increases:
$$\vec{P}_p(s, t) = \begin{bmatrix} R_p \cos(\theta_p + \omega_p t) \\ R_p \sin(\theta_p + \omega_p t) \\ Z_{\text{particle}} \cdot (1.0 - s^{1.5}) \end{bmatrix}$$
Where the Z-spread of the dust stream is flattened by a factor of $(1.0 - s^{1.5})$, compressing the spherical fog into a paper-thin accretion plane.

### 4.3 R3F `useFrame` Equation & Implementation
```typescript
// Inside main HexCore useFrame:
useFrame((state, delta) => {
  const s = smoothScroll.current;
  const t = state.clock.getElapsedTime();
  
  // Coaxial ring compression along local Y axis (flat layout)
  const ring1Ref_y = 0.55 * (1.0 - s * s);
  const ring3Ref_y = -0.55 * (1.0 - s * s);
  
  if (ring1Ref.current) ring1Ref.current.position.y = ring1Ref_y;
  if (ring3Ref.current) ring3Ref.current.position.y = ring3Ref_y;
  
  // Pass equatorial compression factor directly to GPU Dust shader
  // mats.dust is custom ShaderMaterial for particle accretion disk
  mats.dust.uniforms.uCompression.value = s;
  mats.dust.uniforms.uSpeedScale.value = 1.0 + s * 3.5;
});
```

---

## 5. Architectural Comparison & Recommendation

### 5.1 Trade-Off Matrix

| Metric | Concept A: Orrery Lock | Concept B: Volumetric Drift | Concept C: Chronos Gate |
|---|---|---|---|
| **Aesthetic Luxury** | **High (9.5/10)** — Extremely technical, structured, and premium. | **Medium (8/10)** — Organic, liquid, feels highly sophisticated. | **High (9/10)** — High cinematic energy, dramatic VFX focus. |
| **Motion Clutter** | **Zero** — Compact, rotation-based; no clipping with adjacent cells. | **Very Low** — Micro-movements stay within strict 3D boundaries. | **Zero** — Contracts inward rather than expanding outward. |
| **Math Complexity** | High (Co-planar slerping, quaternion axis alignments). | Medium (Volumetric layer offsets, smooth sine breathing). | Low (Simple Y-position compression and shader scales). |
| **GC Overhead** | Zero-allocation pre-allocated quaternions. | Zero-allocation vectors and matrices. | Zero-allocation scalar interpolations. |
| **Transition Integration** | Perfect fit for locking into "Deep Dive" mode. | Excellent fit for revealing internal "Technical Specs." | Fits high-energy "ignite" and active CLI overloads. |

### 5.2 Recommendation
We recommend **Concept A (Gyroscopic Precession & Resonance Alignment)** as the primary interaction model, combined with a **very subtle micro-expansion from Concept B (max 0.08 units)**. 
*   **Why**: The "Orrery Lock" matches the core philosophy of a "highly advanced mystical tech device." Keeping the rings precessing during scan states and slowly locking them into a single, flat, perfectly synchronized plane at 100% scroll is mathematically elegant, visually captivating, and guarantees zero collision or clipping with adjacent Bento tiles.
*   **Volumetric Blending**: Adding a very small 0.08 normal expansion on the 54 pyramids during this alignment creates a subtle "aperture opening" look, revealing the glowing runes inside the core without creating geometric messiness.

---

## 6. Implementation & Transition Plan

### 6.1 Step 1: Remove Deprecated Expansion Logic
*   Locate the previous `act3Progress` outward explosion logic in `PolyhedronCanvas.tsx`.
*   Remove the camera dolly lerp `camera.position.z = THREE.MathUtils.lerp(13, 9, act3Progress)` to stabilize the viewport.
*   Remove the large pyramid expansion increment: `targetExp += act3Progress * 2.8`.

### 6.2 Step 2: Implement Precession Slerping & Resonant Speeds
*   Implement precessional axis slerping in the `HexCore` `useFrame` loop using the pre-allocated quaternion cache.
*   Map the local spin speed of concentric rings to smooth-damp between idle orbital velocities and harmonic speeds ($1\omega, -2\omega, 3\omega$) based on `smoothScroll.current`.

### 6.3 Step 3: Implement Micro-Displacement on Pyramid Pieces
*   Modify `BentoPyramidPiece` position math: clamp the scroll-expansion offset to a tight $[0.0, 0.08]$ range.
*   Inject the volumetric Zero-G parallax offset (using `Math.sin` based on individual pieces' radial distance) to create high-end visual depth.

---

## 7. Spec Verification & Checklist

- [ ] **Geometry Safety Gate**: Check that no new vector/matrix instances are created inside `useFrame`.
- [ ] **Frame-rate Independence**: Ensure all spin updates use `delta` as a multiplier.
- [ ] **Clipping boundary check**: Verify that at 100% scroll, no part of the core exceeds `2.5 units` in radius (leaving a safe 25% margin before adjacent bento boundaries).
- [ ] **Visual Companion confirmation**: Present these three beautiful concepts to the user in the interactive visual companion.

---
*End of Design Specification.*
