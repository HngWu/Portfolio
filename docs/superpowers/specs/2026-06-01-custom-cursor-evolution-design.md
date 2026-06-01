# Custom Cursor Evolution Design Specification

- **Date:** 2026-06-01
- **Status:** Approved
- **Reference:** [Cursor.png](file:///C:/Projects/Portfolio/Cursor.png)
- **Target Component:** `components/cursor/ArcaneCursor.tsx`
- **Related Plan:** `docs/superpowers/plans/2026-05-30-hexcore-scroll-interaction.md`

---

## 1. Executive Summary

This document specifies the technical design, component architecture, and mathematical models for upgrading the custom portfolio mouse cursor. The upgrade replaces the basic cursor overlays with an active, high-fidelity **6-Stage Crystalline-Mechanical Evolution** and a **5-State Interactive Engine** directly inspired by *Cursor.png*. 

The cursor's visual structure morphs dynamically based on global page scroll progress and view mode state, creating a narrative journey where **magic meets machinery**, perfectly synced with the 3D HexCore center artifact.

---

## 2. Design System & Color Mapping

The cursor preserves the project's existing "Lume-Glass" aesthetics and semantic tokens while incorporating the transitions described in the reference art:

| Semantic Token | Hex Code | Stage Alignment | Usage |
| :--- | :--- | :--- | :--- |
| `--lume-warm` | `#FFB44A` | Stages 1–3 (Magic) | Organic runic strokes, spell geometric outlines, amber particle sparks |
| `Hextech Brass` | `#C5A059` | Stages 4–6 (Transition) | Outer mechanical casing plates, gear elements |
| `Polished Steel` | `#4F5D6B` | Stages 5–6 (Tech) | Internal sliding structural core plate inserts |
| `--lume-primary` | `#4AFFB4` | Stage 6 (Tech Core) | Precision cyan crystal singularity, high-speed binary trail grid |
| `--lume-secondary` | `#4A8FFF` | Hover Diagnostics | Concentric outer target rings, royal blue diagnostic scanner |
| `--lume-tertiary` | `#FF4A6B` | Unavailable State | Locked warning outlines, crossbar crosshairs |

---

## 3. Component Architecture & Coordinates

The cursor is implemented as a single React component in `components/cursor/ArcaneCursor.tsx` composed of three stacked, hardware-accelerated layers:

```
        z-index:[99999]  ┌───────────────────────────────┐
                         │   3. SVG Morphing Core        │ <-- Precision mechanical tip
        z-index:[99998]  ├───────────────────────────────┤
                         │   2. WebGL Holographic Aura   │ <-- Concentric diagnostic scanlines
        z-index:[99997]  ├───────────────────────────────┤
                         │   1. 2D Canvas Trail Layer    │ <-- Particle paths / grid traces
                         └───────────────────────────────┘
```

### 3.1 Hotspot Coordinate Alignment
To ensure zero feel-latency and absolute mechanical precision, the interactive tip of the cursor is anchored at the exact screen coordinate of the mouse.
*   The parent wrapper is centered using `transform: translate(-50%, -50%)`.
*   Inside the `120px` wrapper, the exact tip of the cursor SVG is positioned at relative coordinates `(60px, 60px)`.
*   All child SVG layouts are configured with offset tip geometry aligned precisely with the `(60, 60)` parent coordinate origin.

---

## 4. The 6-Stage Evolution Mechanics

The visual shape of the cursor is driven by a continuous normalized variable `u_evolution` ranging from `0.0` (pure organic magic) to `1.0` (precision machinery).

```
[0.0] ────────────────────────── [0.5] ────────────────────────── [1.0]
 Runic Origin ── Awakening ── Conduit ── Harmonization ── Transition ── Tech Form
 (Amber Magic)                          (Brass Casing)                 (Cyan Tech)
```

### 4.1 Scroll & Mode Interpolation Mathematics
The value of `u_evolution` is updated inside the frame loop using a combination of page scroll position and view mode status:

```typescript
// 1. Calculate base scroll progress
const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
const clampedScroll = Math.max(0, Math.min(1.0, scrollPercent));

// 2. Track view mode ('quick' = magic, 'deep' = tech)
const mode = useViewModeStore.getState().mode;
const targetModeVal = mode === 'deep' ? 1.0 : 0.0;

// 3. Smoothly interpolate with visual spring inertia
// smoothScrollProgress is updated via linear interpolation (LERP)
smoothScrollProgress.current += (clampedScroll - smoothScrollProgress.current) * 0.1;
smoothModeVal.current += (targetModeVal - smoothModeVal.current) * 0.12;

// 4. Calculate final u_evolution
// When deep mode is active, u_evolution snaps to 1.0; otherwise it tracks scroll progress
const u_evolution = Math.max(smoothScrollProgress.current, smoothModeVal.current);
```

### 4.2 Stage Transitions & SVG Path Morphing
We define distinct path sets representing each of the 6 stages. We use **GSAP `to`** transitions to interpolate the `d` attribute of the path dynamically as `u_evolution` crosses stage thresholds:

1.  **Stage 1: Runic Origin (`u_evolution <= 0.15`):** Soft, organic warm-amber outline with a dashed boundary. Features a floating center rune.
2.  **Stage 2: Awakening (`0.15 < u_evolution <= 0.35`):** The outline hardens and sharpens. Core rune aligns and becomes a solid golden triangle insertion.
3.  **Stage 3: Conduit (`0.35 < u_evolution <= 0.50`):** Sharp, faceted crystal blade layout (reminiscent of the HexCore gemstone nucleus).
4.  **Stage 4: Harmonization (`0.50 < u_evolution <= 0.65`):** Hextech Brass casing plates materialise on the outer edges. Core crystal begins transitioning from amber to royal blue.
5.  **Stage 5: Transition (`0.65 < u_evolution <= 0.85`):** Precision sliding steel plating locks into the interior casing. Runic details turn into high-tech diagnostics lines.
6.  **Stage 6: Tech Form (`u_evolution > 0.85`):** Precision mechanical pointer with brass details, dark steel core, and a glowing cyan energy core.

---

## 5. Interactive Cursor State Engine (Use Cases)

We map the cursor's sub-elements and rotation orientations to a 5-state machine that responds to DOM interactions:

```typescript
type CursorState = 'default' | 'hover' | 'select' | 'drag' | 'unavailable';
```

### 5.1 State Machine Specification

#### `DEFAULT` (Tilted Pointer)
*   *Asset Layout:* Standard tilted arrow (`rotate(-22.5deg)`), tip aligned exactly with parent hotspot.
*   *Animation:* Static flow, standard scale `1.0`.

#### `HOVER` (Target Resonance)
*   *Asset Layout:* The cursor body scales up to `1.25` via an underdamped spring scale. Secondary **diagnostic concentric rings** expand from the core and spin rapidly in counter-rotation.
*   *Feedback:* Active target glow intensifies. WebGL shader aura doubles pulse rate (`u_hover = 1.0`).

#### `SELECT` (Click Shockwave)
*   *Trigger:* `mousedown` -> `mouseup`.
*   *Asset Layout:* The arrowhead wings expand outwards by `10%` on compress, while the body undergoes an elastic recoil scaling down to `0.85` then springing back.
*   *Feedback:* Spawns a glowing, rapid-expanding circular shockwave ring on the 2D canvas trail layer that dissipates over 300ms.

#### `DRAG` (Delta Wing)
*   *Trigger:* Hovering and clicking on scroll components, 3D R3F rotation planes, or grid widgets.
*   *Asset Layout:* Arrowhead sweeps back into a symmetric, aggressive vertical delta wing.
*   *Feedback:* Rotates to `0deg` (straight up), indicating vertical directional traction.

#### `UNAVAILABLE` (Locked State)
*   *Trigger:* Hovering disabled actions, locked admin segments, or restricted portfolio routes.
*   *Asset Layout:* Arrowhead hard-transitions to deep-red color (`#FF4A6B`). A set of concentric locking crosshairs projects from the center.
*   *Feedback:* Micro-jitter animation (representing physical feedback of a locked mechanic).

---

## 6. WebGL Aura & Canvas Trail Upgrades

### 6.1 WebGL Holographic Aura Shader
The custom shader (`fsSource` in `ArcaneCursor.tsx`) is upgraded to use `u_evolution` to blend between Magic and Tech auras seamlessly:

```glsl
// Inside fragment shader
uniform float u_time;
uniform float u_hover;
uniform float u_evolution;

void main() {
  vec2 uv = vUv - 0.5;
  float dist = length(uv);
  float mask = smoothstep(0.5, 0.35, dist);
  
  // Magic Aura: Warm glowing amber radial grids
  vec3 magicColor = vec3(0.98, 0.75, 0.14) * (0.1 / (dist + 0.035) * (1.0 + 0.15 * sin(u_time * 3.5)));
  float magicAlpha = smoothstep(0.45, 0.1, dist) * 0.45;
  
  // Tech Aura: Royal blue target scanlines & concentric diagnostic dashes
  float tTime = u_time * 2.5 * (1.0 + u_hover * 2.0);
  float ring1 = abs(sin(dist * 25.0 - tTime)) * 0.8;
  float ring2 = smoothstep(0.40, 0.38, dist) * smoothstep(0.36, 0.38, dist);
  vec3 techColor = mix(vec3(0.0, 0.2, 0.85), vec3(0.0, 0.55, 1.0), ring1 * 0.5 + ring2 * 0.8);
  float techAlpha = (ring1 * 0.25 + ring2 * 0.6) * mask;
  
  // Interpolated Output
  vec4 finalMagic = vec4(magicColor, magicAlpha);
  vec4 finalTech = vec4(techColor, techAlpha);
  vec4 finalAura = mix(finalMagic, finalTech, u_evolution);
  
  gl_FragColor = finalAura * mask * (0.8 + 0.2 * u_hover);
}
```

### 6.2 2D Canvas Trail Particle Upgrade
*   **Buoyant Magic Runes (`u_evolution < 0.5`):** Spawns warm-golden (`#FFB44A` / `#FBBF24`) Norse runes (`ᚠ`, `ᚢ`, `ᚦ`, `ᚨ`, `ᚱ`, etc.) that float upwards slowly under a sine-wave displacement.
*   **Grid Vector Tech (`u_evolution >= 0.5`):** Spawns precise cyan/mint binary characters (`0` / `1`) aligned to a rigid high-tech vector trail that shoots directly opposite the cursor velocity vector, tracing circuit lines.

---

## 7. Integration with the 3D HexCore Model

To create a unified mechanical ecosystem, the custom cursor links directly to the R3F Canvas using the global `window.__hexcore_cmd` API:

1.  **Scroll Rune Ejection:** As the scroll progress crosses `0.1` (the threshold from Runic Origin to Awakening), the cursor triggers a local command `window.__hexcore_cmd('eject_rune')`. The 3D HexCore model in `PolyhedronCanvas.tsx` immediately expels a 3D rune fragment (`RUNE_VEX`) using a high-energy particle burst. The fragment flies towards the screen bounds, seamlessly transition-fading as the 2D cursor spawns its glowing center element!
2.  **Proximity Lightning Snapping:** When the cursor coordinates are within a radial distance of `150px` from the 3D HexCore's center bounds, a local listener activates. The cursor's inner core starts pulsing in phase with the HexCore singularity, and the `LightningArcs.tsx` system inside the R3F canvas projects microscopic, high-frequency verdigris lighting snaps between the cursor tip and the outer rotating 3D rings.

---

## 8. Verification & Performance Optimization

To guarantee a premium experience, the following constraints are enforced:
*   **Zero-Alloc Particle Loop:** All trail particles are recycled within a fixed buffer pool of max 45 particles to prevent garbage collection spikes.
*   **Active Hover Optimization:** Hover states are mapped in an $O(1)$ selector using event delegation (`target.closest`) to avoid binding expensive listeners to individual buttons or elements.
*   **Hardware Acceleration:** Custom components leverage CSS `translate3d(x, y, 0)` for hardware composing, ensuring a stable `60fps` / `120fps` rendering loop.

---

## 9. Verification checklist (Test Cases)

- [ ] **Test Case 1: Scroll Morphing**
  Ensure the cursor smoothly progresses through all 6 stages as the page is scrolled from top to bottom. Verify color change from Warm Amber to Cyan/Blue Tech.
- [ ] **Test Case 2: Deep-Dive Toggle**
  Verify that clicking the View Mode toggle to "Deep Dive" immediately springs the cursor to Stage 6 (Tech Form) regardless of scroll position, and restores it when clicked back.
- [ ] **Test Case 3: Interactive Hover**
  Verify that hovering over any anchor or button triggers a GSAP spring expansion to scale `1.25` and starts the rotation of outer diagnostic rings.
- [ ] **Test Case 4: Click Shockwave**
  Verify that clicking any element plays an elastic click recoil on the arrowhead and fires a radial energy circle.
- [ ] **Test Case 5: Drag & Scroll**
  Verify that dragging custom scrollbars or rotating 3D widgets shifts the cursor shape into the symmetric vertical delta wing pointer.
- [ ] **Test Case 6: Lock Status**
  Verify that hovering over disabled buttons or locked administrative sections shifts the cursor color to deep-red with crosshair rings.
