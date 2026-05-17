# Arcane Hexcore — 3D Model Design Document
### For use with Gemini CLI · Bento Grid Portfolio Integration

---

## 1. Project Overview

A fully animated, texture-rich 3D Hexcore artifact from the TV series *Arcane*, embedded as a tile in a bento grid portfolio website. The model serves as the centrepiece of the grid — alive, reactive, and hyper-aware of the user's presence across the entire page.

**Key behaviours:**
- Hover-reactive surface with energy pulse and rune glow
- Global cursor magnetism — tilts and tracks the cursor from any tile on the page
- Scroll-triggered rune ejection that morphs into a custom cursor
- Idle float / breathe animation when no interaction is detected

---

## 2. Visual Reference & Art Direction

### 2.1 Source Material
The Hexcore from *Arcane* Season 2 is an evolving crystalline-organic structure — part ancient arcane gemstone, part living organism. It is hexagonal in silhouette, multi-layered with floating inner geometry, emitting purple-gold-teal bio-luminescence.

### 2.2 Colour Palette

| Token | Hex | Usage |
|---|---|---|
| `--hx-void` | `#0A0612` | Core shadow / depth |
| `--hx-crystal` | `#1A0D2E` | Primary facet base |
| `--hx-shimmer` | `#2D1B69` | Mid crystal fill |
| `--hx-arcane` | `#7B3FE4` | Primary energy glow |
| `--hx-pulse` | `#A855F7` | Active energy pulse |
| `--hx-gold` | `#C9A227` | Rune inscription |
| `--hx-gold-hot` | `#FFD166` | Rune activation flash |
| `--hx-teal` | `#06B6D4` | Secondary energy filament |
| `--hx-teal-dim` | `#0E7490` | Filament ambient |
| `--hx-white` | `#E8D5FF` | Specular highlight |
| `--hx-organic` | `#4A1A6B` | Organic vine geometry |

### 2.3 Aesthetic Direction

**Tone:** Arcano-Gothic maximalism — crystalline geometry fused with biological growth, ancient runic inscription, controlled chaos. Not decorative. Purposeful.

**Reference textures:**
- Labradorite gemstone facets (iridescent depth shift)
- Black opal (internal fire, purple-blue-gold)
- Bioluminescent deep-sea organism glow
- Hammered bronze / verdigris rune channels

---

## 3. 3D Model Specification

### 3.1 Overall Structure

The Hexcore is a **compound geometry** made of 5 distinct layers, all sharing a common vertical axis:

```
Layer 5  ┌─────────────┐  Outer Shell (static base)
          │  ~~~~~~~~~~  │  
Layer 4  │  ┌─────────┐  │  Mid Crystal Ring (slow rotation)
          │  │ ~~~~~~~  │  │  
Layer 3  │  │  ┌─────┐  │  │  Inner Nucleus (fast spin, opposite axis)
          │  │  │  ●  │  │  │  Core Singularity (pulsing sphere)
Layer 3  │  │  └─────┘  │  │
Layer 4  │  └─────────┘  │
Layer 5  └─────────────┘
          ↕  Hover offset 
         (floating animation)
```

### 3.2 Layer Specifications

#### Layer 5 — Outer Shell
- **Geometry:** Truncated octahedron / hexagonal bipyramid, 12–18 faces
- **Dimensions:** ~2.4 units diameter
- **Rotation:** None (acts as anchor, very slight precession 0.05 deg/s)
- **Material:** See Section 4.1
- **Special:** Cracked / fractured surface — Voronoi noise displacement on edges. Some faces have micro-fissures that glow teal from within.

#### Layer 4 — Mid Crystal Ring
- **Geometry:** 6 elongated rhomboidal shards arranged in a hexagonal orbit, slightly tilted inward (15° angle)
- **Dimensions:** Each shard ~0.9 units long, 0.25 wide
- **Rotation:** 12 deg/s on Y-axis
- **Gap from outer shell:** 0.18 units (light bleeds through)
- **Material:** See Section 4.2

#### Layer 3 — Inner Nucleus
- **Geometry:** Icosahedron, slightly deformed with organic noise
- **Dimensions:** ~1.1 units diameter
- **Rotation:** -28 deg/s on a tilted axis (X: 35°, Y: 1, Z: 0.2)
- **Material:** See Section 4.3
- **Special:** Rune glyphs carved into surface faces — see Section 3.4

#### Layer 2 — Rune Orbits
- **Geometry:** 3–4 floating rune plates (flat hexagonal discs, thin)
- **Dimensions:** ~0.35 units per disc
- **Orbit:** Elliptical, different orbital planes (30°, 70°, 120° inclinations)
- **Speed:** Each at different rate (8, 14, 19 deg/s)
- **Material:** See Section 4.4

#### Layer 1 — Core Singularity
- **Geometry:** Sphere
- **Dimensions:** ~0.4 units radius
- **Animation:** Pulsing scale (0.85 → 1.0 → 0.85 over 2.1s), emissive intensity pulse
- **Material:** Pure emissive, no PBR needed

---

### 3.3 Rune System

The hexcore bears **6 primary rune types**, each mapped to a face of the inner nucleus and the orbiting discs. These are not decorative — each rune has behaviour.

| Rune ID | Piltover Name (invented) | Shape | Behaviour |
|---|---|---|---|
| `RUNE_VEX` | Vex — Flow | Three-pronged fork, curved | Orbits fastest, ejects on scroll |
| `RUNE_SOL` | Sol — Bind | Circle with inner triangle | Glows when cursor is close |
| `RUNE_KAI` | Kai — Shatter | Zigzag with barb tips | Flickers in idle, cracks emit teal |
| `RUNE_ORN` | Orn — Root | Branching Y-form | Static on nucleus face, breathes |
| `RUNE_MYR` | Myr — Seek | Arrow spiral | Rotates on own axis, points cursor direction |
| `RUNE_THA` | Tha — Hold | Concentric hexagons | Pulses with core singularity |

Runes are rendered as **UV-mapped geometry** (thin extrusion, 0.02 units deep) inlaid into surfaces, with a dedicated emissive channel. Not flat decals.

---

### 3.4 Geometry Generation (Gemini CLI Prompts)

Use these structured prompts with Gemini CLI to generate the model progressively:

#### Prompt A — Outer Shell
```
Generate a Three.js geometry for an arcane crystal outer shell:
- Base shape: convex polyhedron approximating a truncated octahedron with 16 faces
- Apply Perlin noise displacement to vertices (amplitude: 0.08, frequency: 2.5)
- Add edge bevels at 0.012 radius
- UV unwrap using spherical projection
- Output as BufferGeometry with position, normal, and uv attributes
- Include vertex color attribute seeded from face index (for texture blending)
- Format: ES module exporting createOuterShell()
```

#### Prompt B — Shard Ring
```
Generate a Three.js geometry for 6 crystal shards in hexagonal arrangement:
- Each shard: elongated rhombohedron (length: 0.9, width: 0.22, depth: 0.18)
- Position each at radius 0.85 from origin, rotated 60° apart on XZ plane
- Tilt each shard 15° toward center axis
- Add micro-facets via subdivision + slight random vertex perturbation (0.015)
- UV map: box projection per shard
- Output as single merged BufferGeometry
- Format: ES module exporting createShardRing()
```

#### Prompt C — Inner Nucleus with Runes
```
Generate a Three.js icosahedron-based nucleus geometry:
- Base: IcosahedronGeometry(1.1, 2) subdivided
- Apply organic noise displacement (amplitude: 0.12, frequency: 1.8, seed: 42)
- On 6 largest faces: create inset rune panels (0.02 unit extrusion inward)
- Rune geometry type per face: [fork-3, circle-triangle, zigzag, branch-Y, spiral-arrow, hex-concentric]
- Separate UV islands for rune panels vs base geometry
- Flag rune face vertices with a custom attribute 'isRune' (float 1.0)
- Output as BufferGeometry
- Format: ES module exporting createNucleus()
```

#### Prompt D — Orbiting Rune Discs
```
Generate 4 flat hexagonal rune disc geometries for Three.js:
- Each disc: CylinderGeometry(0.32, 0.32, 0.03, 6)
- Bevel top/bottom edges at 0.008 radius
- Engrave a single rune design on top face (choose from: vex, sol, kai, myr)
- Each disc has its own UV layout with rune centered in 0.7×0.7 UV space
- Output each as named export: discVex, discSol, discKai, discMyr
- Format: ES module
```

---

## 4. Materials & Textures

### 4.1 Outer Shell Material — `HexcoreCrystalMaterial`

**Type:** Custom ShaderMaterial (Three.js) with PBR base + iridescence layer

**Texture maps required:**

| Map | Resolution | Description |
|---|---|---|
| `albedo` | 2048×2048 | Deep indigo-void base, Voronoi crack pattern overlay |
| `normal` | 2048×2048 | Sharp crystalline facet normals, micro-surface detail |
| `roughness` | 1024×1024 | Near-zero (0.05) on flat faces, 0.4–0.6 in cracks |
| `metalness` | 1024×1024 | 0.85 on smooth faces, 0.1 in organic fissures |
| `emissive` | 1024×1024 | Teal glow in crack channels, zero elsewhere |
| `iridescence` | 512×512 | Labradorite-like schiller effect (purple-gold-teal) |
| `ao` | 1024×1024 | Self-shadow in facet intersections and cracks |

**Gemini CLI texture generation prompt:**

```
Generate a 2048×2048 PBR albedo texture for an arcane crystal:
- Base color: deep indigo #1A0D2E
- Voronoi cell pattern: cell size 180–280px, lines are slightly lighter (#2D1B69)
- Crack channels along Voronoi edges: 8–14px wide, color #0A0612
- Subtle gradient shift toward purple #7B3FE4 at texture center
- Add micro-noise grain (5% intensity) to avoid flatness
- 4 crystalline streak highlights (near-white #E8D5FF) at 30–40° angles, 3–6px wide, 15% opacity
- Output: PNG, sRGB color space
```

```
Generate a 2048×2048 normal map for crystalline facets:
- Large facet planes: nearly flat normals (±5° variance per facet)
- Facet edges: sharp normal discontinuity, 4–8px blend zone
- Crack channels: steep inward slope normals (45–70°) for depth illusion
- Add high-frequency micro-facet noise across all surfaces (0.5px scale)
- Tangent-space, standard OpenGL convention (Y-up green channel)
- Output: PNG, linear color space
```

```
Generate a 1024×1024 iridescence/schiller texture for labradorite effect:
- Color shifts across surface: purple → gold → teal → purple in flowing bands
- Band orientation: approximately 40° diagonal
- Band width: 80–200px (varies)
- Transitions: smooth sinusoidal blend between colors
- Intensity: moderate (not chrome, more like pearlescent)
- Output as RGB PNG where R=schiller intensity, G=hue shift offset, B=saturation mask
```

### 4.2 Shard Ring Material — `HexcoreShardMaterial`

**Type:** MeshPhysicalMaterial with transmission

```javascript
const shardMaterial = new THREE.MeshPhysicalMaterial({
  color: 0x2D1B69,
  transmission: 0.85,        // glass-like translucency
  thickness: 0.4,
  roughness: 0.08,
  metalness: 0.1,
  ior: 1.72,                 // higher than standard glass for gem feel
  reflectivity: 0.9,
  iridescence: 0.6,
  iridescenceIOR: 1.3,
  iridescenceThicknessRange: [80, 400],
  emissive: new THREE.Color(0x7B3FE4),
  emissiveIntensity: 0.3,
  envMapIntensity: 2.0,
  side: THREE.DoubleSide,
});
```

### 4.3 Inner Nucleus Material — `HexcoreNucleusMaterial`

**Type:** Custom ShaderMaterial — splits rendering between base surface and rune panels using the `isRune` vertex attribute.

```glsl
// Fragment shader excerpt
void main() {
  float isRune = vIsRune; // passed from vertex shader
  
  vec3 baseColor = mix(
    texture2D(uAlbedo, vUv).rgb,
    vec3(0.1, 0.04, 0.2),
    0.3
  );
  
  // Rune panels: switch to gold emissive
  vec3 runeColor = mix(
    vec3(0.79, 0.64, 0.15),   // --hx-gold
    vec3(1.0,  0.82, 0.40),   // --hx-gold-hot (on activation)
    uRuneActivation
  );
  
  vec3 finalColor = mix(baseColor, runeColor, isRune);
  float emissiveStrength = mix(0.0, uRunePulse * 2.5, isRune);
  
  gl_FragColor = vec4(finalColor + finalColor * emissiveStrength, 1.0);
}
```

**Uniforms driven by interaction:**

| Uniform | Range | Driven by |
|---|---|---|
| `uRuneActivation` | 0.0 → 1.0 | Cursor proximity to tile |
| `uRunePulse` | 0.0 → 1.0 | Core singularity pulse oscillator |
| `uGlobalCursorAngle` | vec2 | Global cursor magnetism system |
| `uScrollProgress` | 0.0 → 1.0 | Scroll-triggered rune ejection |
| `uTime` | float | Frame time for idle animation |

### 4.4 Rune Disc Material — `HexcoreRuneDiscMaterial`

**Type:** MeshStandardMaterial base + emissive rune overlay

**Gemini CLI texture prompt (rune engravings):**

```
Generate a 512×512 rune texture for a hexagonal disc surface:
- Background: near-black metallic surface #0D0A1A with subtle brushed-metal grain
- Central rune: intricate arcane glyph inspired by alchemical/celestial notation
- Rune style: geometric + organic hybrid — straight lines connected by curved terminals
- Rune color: gold #C9A227 on primary strokes, 4px wide
- Secondary detail lines: 1–2px, slightly dimmer gold #A07818
- Outer ring: thin hexagonal border 6px from disc edge, same gold
- 6 equidistant small dot markers on the ring
- Add subtle glow halo around all gold elements (soft, 8px spread, 20% opacity)
- Output: PNG with alpha (disc shape masked, corners transparent)
```

---

## 5. Animation System

### 5.1 Idle State (no interaction)

```
Timeline: continuous loop

t=0s    ─── Float start (Y: 0)
t=1.2s  ─── Float peak (Y: +0.06 units)
t=2.4s  ─── Float trough (Y: −0.04 units)  [asymmetric = organic feel]
t=3.8s  ─── Return to start

Concurrent:
  Outer shell: micro-precession ±2° on X/Z, period 9s
  Shard ring:  constant Y rotation at 12 deg/s
  Nucleus:     constant tilted-axis rotation at -28 deg/s
  Rune discs:  each at individual speeds (8, 14, 19, 23 deg/s)
  Core:        scale pulse 0.85 → 1.0, period 2.1s (ease in-out sine)
  Core:        emissive intensity 0.8 → 2.4, same period
  Crack glow:  teal emissive 0.2 → 0.7 → 0.2, period 4.3s (offset from core)
```

### 5.2 Global Cursor Magnetism

This is the centrepiece interaction. The hexcore tracks the mouse **globally** — even when the cursor is on the opposite side of the page.

```javascript
// Global listener — attach once to window, not to the tile
window.addEventListener('mousemove', (e) => {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  
  // Normalise cursor to [-1, 1] range across full viewport
  const globalNX = (e.clientX / vw) * 2 - 1;   // -1 (left) to +1 (right)
  const globalNY = -(e.clientY / vh) * 2 + 1;   // -1 (bottom) to +1 (top)
  
  // Find hexcore tile centre in viewport space
  const tileRect = hexcoreTile.getBoundingClientRect();
  const tileCX = ((tileRect.left + tileRect.right) / 2) / vw * 2 - 1;
  const tileCY = -((tileRect.top + tileRect.bottom) / 2) / vh * 2 + 1;
  
  // Vector FROM tile TO cursor (this is what the hexcore "looks at")
  const lookX = globalNX - tileCX;
  const lookY = globalNY - tileCY;
  
  // Distance factor — magnetism weakens with square of distance
  const dist = Math.sqrt(lookX ** 2 + lookY ** 2);
  const maxDist = 2.0;  // in normalised viewport units (~diagonal)
  const strength = Math.max(0, 1 - (dist / maxDist) ** 2);
  
  // Target rotation: map look vector to euler angles
  targetRotX = lookY * 0.28 * strength;   // pitch toward cursor
  targetRotY = lookX * 0.35 * strength;   // yaw toward cursor
  
  // Shard ring gets additional magnetism — leans more aggressively
  shardRingTargetRotX = lookY * 0.45 * strength;
  shardRingTargetRotY = lookX * 0.55 * strength;
});

// In animation loop — apply damped lerp for smooth follow
function updateMagnetism(dt) {
  const lerpFactor = 1 - Math.exp(-dt * 3.5);  // ~3.5 Hz response
  
  hexcoreGroup.rotation.x += (targetRotX - hexcoreGroup.rotation.x) * lerpFactor;
  hexcoreGroup.rotation.y += (targetRotY - hexcoreGroup.rotation.y) * lerpFactor;
  
  // Nucleus counter-rotates slightly for parallax depth illusion
  nucleus.rotation.x += (-targetRotX * 0.4 - nucleus.rotation.x) * lerpFactor * 0.6;
  nucleus.rotation.y += (-targetRotY * 0.4 - nucleus.rotation.y) * lerpFactor * 0.6;
}
```

**Magnetism intensity tiers:**

| Distance from tile | Max tilt | Response speed | Description |
|---|---|---|---|
| Inside tile | 28°X / 35°Y | Fast (6 Hz) | Direct hover — full tracking |
| 0–30% of viewport | 18°X / 22°Y | Medium (4 Hz) | Near neighbour tiles |
| 30–70% of viewport | 8°X / 12°Y | Slow (2.5 Hz) | Far tiles — subtle pull |
| 70%+ of viewport | 3°X / 5°Y | Very slow (1.5 Hz) | Edge tiles — barely perceptible |

### 5.3 Scroll-Triggered Rune Ejection

```
Scroll trigger: 0% → first 40% of page scroll

Phase 1 (0% → 15% scroll):
  - RUNE_VEX disc begins to break orbit
  - Disc glows intensify ×3 over 0.6s
  - Inner nucleus briefly pulses bright (emissive spike)
  - Sound cue: arcane hum rising (if audio enabled)

Phase 2 (15% → 30% scroll):
  - RUNE_VEX disc ejects radially outward (lerp to viewport centre)
  - Emission trail: 4–6 gold particle streaks following disc path
  - Other 3 discs orbit faster (compensating energy)
  - Hexcore core dims 30% (energy transferred)

Phase 3 (30% → 40% scroll):
  - RUNE_VEX disc reaches cursor position
  - Morphs: disc geometry dissolves (scale → 0, opacity → 0, 0.4s)
  - Custom cursor activates simultaneously (see Section 6)
  - Remaining rune discs settle back to tighter orbits
  - Hexcore "breathes out" — emissive resets over 1.2s

Reverse (scroll back up):
  - Custom cursor fades (0.3s)
  - RUNE_VEX disc re-materialises at cursor position
  - Flies back to hexcore orbit (cubic bezier arc, 0.8s)
  - Hexcore re-absorbs — brief energy spike flash
```

```javascript
// Scroll driver
let scrollProgress = 0;

window.addEventListener('scroll', () => {
  const totalH = document.body.scrollHeight - window.innerHeight;
  scrollProgress = Math.min(1, window.scrollY / (totalH * 0.4));
  
  hexcoreShader.uniforms.uScrollProgress.value = scrollProgress;
  updateRuneEjection(scrollProgress);
});

function updateRuneEjection(t) {
  if (t < 0.15) {
    // Phase 1: charge up
    runeVex.material.emissiveIntensity = THREE.MathUtils.lerp(0.4, 2.8, t / 0.15);
    
  } else if (t < 0.30) {
    // Phase 2: eject
    const ejectT = (t - 0.15) / 0.15;
    const ejectPos = new THREE.Vector3().lerpVectors(
      runeVexOriginalWorldPos,
      viewportCentreWorldPos,
      easeInOutCubic(ejectT)
    );
    runeVex.position.copy(ejectPos);
    
  } else if (t < 0.40) {
    // Phase 3: morph to cursor
    const morphT = (t - 0.30) / 0.10;
    runeVex.scale.setScalar(1 - morphT);
    runeVex.material.opacity = 1 - morphT;
    customCursor.style.opacity = morphT;
    customCursor.style.transform = `scale(${morphT})`;
  }
}
```

---

## 6. Custom Cursor Design

The ejected rune becomes the user's cursor for the remainder of the scroll session.

### 6.1 Cursor Anatomy

```
          ╔══════════╗
          ║   rune   ║  ← SVG glyph (RUNE_VEX / fork-3 form)
          ║  symbol  ║    32×32px, gold #C9A227
          ╚══════════╝
               │         ← thin gold thread, 20px
               ╳         ← actual hotspot (crosshair, 2×2px)
```

**CSS implementation:**

```css
/* Applied to body after rune ejection */
body.rune-cursor * {
  cursor: none !important;
}

#custom-cursor {
  position: fixed;
  pointer-events: none;
  z-index: 99999;
  width: 44px;
  height: 44px;
  transform: translate(-50%, -50%);
  transition: opacity 0.3s ease;
  opacity: 0;
}

#custom-cursor svg {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 0 6px #C9A227cc) drop-shadow(0 0 14px #7B3FE488);
}

/* Cursor reacts to hovering interactive elements */
body.rune-cursor a:hover ~ #custom-cursor,
body.rune-cursor button:hover ~ #custom-cursor {
  /* Handled via JS class toggle for reliable detection */
}
```

```javascript
// Cursor tracking
const cursor = document.getElementById('custom-cursor');

window.addEventListener('mousemove', (e) => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top  = e.clientY + 'px';
});

// Hover state — cursor "activates" over interactive elements
document.querySelectorAll('a, button, [role="button"]').forEach(el => {
  el.addEventListener('mouseenter', () => cursor.classList.add('active'));
  el.addEventListener('mouseleave', () => cursor.classList.remove('active'));
});
```

### 6.2 Cursor SVG (RUNE_VEX — the fork-3 form)

```svg
<svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Central stem -->
  <line x1="22" y1="28" x2="22" y2="40" stroke="#C9A227" stroke-width="1.5" stroke-linecap="round"/>
  <!-- Three prongs - curved outward -->
  <path d="M22 28 Q14 20 10 10" stroke="#C9A227" stroke-width="1.5" stroke-linecap="round" fill="none"/>
  <path d="M22 28 Q22 18 22 8"  stroke="#C9A227" stroke-width="1.5" stroke-linecap="round" fill="none"/>
  <path d="M22 28 Q30 20 34 10" stroke="#C9A227" stroke-width="1.5" stroke-linecap="round" fill="none"/>
  <!-- Prong tips — small barbs -->
  <circle cx="10" cy="10" r="1.8" fill="#C9A227"/>
  <circle cx="22" cy="8"  r="1.8" fill="#C9A227"/>
  <circle cx="34" cy="10" r="1.8" fill="#C9A227"/>
  <!-- Hotspot crosshair (tiny, at base of stem) -->
  <circle cx="22" cy="40" r="1.2" fill="#FFD166" opacity="0.8"/>
</svg>
```

**Active state (hovering links/buttons):**
- Scale: 1.0 → 1.25 (0.2s ease)
- Gold glow intensifies (filter: drop-shadow spread 6px → 12px)
- Prongs rotate 20° CW (CSS transform-origin: 22px 34px)

---

## 7. Three.js Scene Setup

### 7.1 Scene Architecture

```
Scene
├── AmbientLight (intensity: 0.1, color: #1A0D2E)
├── HexcoreGroup                    ← top-level, receives magnetism rotation
│   ├── OuterShell (Mesh)
│   ├── ShardRingGroup              ← rotates independently  
│   │   ├── Shard[0..5] (Mesh)
│   ├── NucleusGroup                ← tilted rotation axis
│   │   ├── Nucleus (Mesh)
│   │   └── RuneOrbits[0..3] (Mesh)
│   └── CoreSingularity (Mesh)
├── PointLight — primary (color: #7B3FE4, intensity: 3.0, decay: 2)
│   └── [attached to CoreSingularity, pulses with it]
├── PointLight — secondary (color: #06B6D4, intensity: 1.2, decay: 2)
│   └── [offset -0.8 on X, slow orbit around Y]
└── PointLight — rim (color: #C9A227, intensity: 0.6, decay: 3)
    └── [above and behind, static — for rune highlight]
```

### 7.2 Renderer Configuration

```javascript
const renderer = new THREE.WebGLRenderer({
  canvas: hexcoreCanvas,
  antialias: true,
  alpha: true,              // transparent background (bento tile bg shows through)
  powerPreference: 'high-performance',
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.4;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = false;  // no shadows needed, lights are point

// Post-processing (requires Three.js postprocessing or custom pass)
// EffectComposer chain:
//   RenderPass
//   → UnrealBloomPass (threshold: 0.6, strength: 1.8, radius: 0.5)
//   → OutputPass
```

### 7.3 Camera

```javascript
const camera = new THREE.PerspectiveCamera(
  45,                                     // narrow FOV — less distortion
  tileWidth / tileHeight,
  0.1,
  100
);
camera.position.set(0, 0.4, 4.5);        // slightly above centre for dramatic angle
camera.lookAt(0, 0, 0);

// Camera subtly shifts with cursor (within tile only, not global)
// Max offset: ±0.15 units X, ±0.1 units Y
// This adds parallax independent of model rotation
```

---

## 8. Bento Grid Integration

### 8.1 Tile Specification

```css
.hexcore-tile {
  /* Bento grid placement */
  grid-column: span 2;
  grid-row:    span 2;
  
  /* Base styling */
  position: relative;
  background: radial-gradient(ellipse at center, #1A0D2E 0%, #0A0612 100%);
  border: 1px solid rgba(123, 63, 228, 0.25);
  border-radius: 20px;
  overflow: hidden;
  
  /* Glow border — intensifies on magnetism proximity */
  --border-glow: 0;
  box-shadow: 
    0 0 0 1px rgba(123, 63, 228, calc(0.25 + var(--border-glow) * 0.5)),
    0 0 calc(20px + var(--border-glow) * 40px) rgba(123, 63, 228, calc(0.1 + var(--border-glow) * 0.3)),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  
  transition: box-shadow 0.3s ease;
}

/* Canvas fills the tile */
.hexcore-tile canvas {
  width: 100% !important;
  height: 100% !important;
  display: block;
}

/* Label overlay (bottom of tile) */
.hexcore-tile .tile-label {
  position: absolute;
  bottom: 20px;
  left: 24px;
  color: rgba(232, 213, 255, 0.7);
  font-size: 11px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  font-family: 'JetBrains Mono', monospace;
}
```

```javascript
// Drive the CSS custom property from global magnetism strength
function updateTileGlow(strength) {
  hexcoreTile.style.setProperty('--border-glow', strength.toFixed(3));
}
```

### 8.2 Responsive Behaviour

| Viewport | Tile Size | Model Scale | LOD |
|---|---|---|---|
| ≥1280px | 2×2 bento cells | 1.0 | Full — all layers |
| 768–1279px | 2×2 cells (smaller grid) | 0.9 | Full |
| 480–767px | 2×1 cells (full width) | 0.75 | Simplified — no rune discs |
| <480px | Full width, fixed 240px height | 0.6 | Nucleus + shell only, reduced bloom |

---

## 9. Performance Guidelines

### 9.1 Draw Call Budget

| Component | Draw calls | Triangles (target) |
|---|---|---|
| Outer shell | 1 | ≤3,000 |
| Shard ring (merged) | 1 | ≤2,400 |
| Nucleus | 1 | ≤4,000 |
| Rune discs (instanced) | 1 (instanced) | ≤800 |
| Core singularity | 1 | ≤200 |
| **Total** | **5** | **≤10,400** |

### 9.2 Texture Memory Budget

| Map | Size | Notes |
|---|---|---|
| Albedo (outer) | 2048×2048 | Compressed to ASTC/DXT in production |
| Normal (outer) | 2048×2048 | |
| Roughness + Metalness + AO | 1024×1024 (packed RGB) | Pack into single texture |
| Emissive (outer) | 1024×1024 | |
| Iridescence | 512×512 | |
| Rune disc (atlas) | 512×512 | Single atlas for all 4 discs |
| Environment map | 256×256 cubemap | Low-res HDR sufficient for reflections |
| **Total VRAM** | **~28MB uncompressed** | **~8MB with compression** |

### 9.3 Animation Performance

- All rotation updates: use quaternion SLERP, not Euler direct assignment
- Magnetism lerp: run in `requestAnimationFrame`, clamp delta time to 50ms max
- Bloom post-process: disable on mobile, use CSS `filter: brightness(1.3)` as fallback
- Pause animation when tile is off-screen: use `IntersectionObserver`

```javascript
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    animationPaused = !entry.isIntersecting;
  });
}, { threshold: 0.01 });

observer.observe(hexcoreTile);
```

---

## 10. Gemini CLI Generation Workflow

### Recommended command sequence:

```bash
# Step 1: Generate geometries
gemini generate-3d \
  --prompt "$(cat prompts/outer-shell.txt)" \
  --format three-js-module \
  --output src/geometries/outer-shell.js

gemini generate-3d \
  --prompt "$(cat prompts/shard-ring.txt)" \
  --format three-js-module \
  --output src/geometries/shard-ring.js

gemini generate-3d \
  --prompt "$(cat prompts/nucleus.txt)" \
  --format three-js-module \
  --output src/geometries/nucleus.js

# Step 2: Generate textures
gemini generate-texture \
  --prompt "$(cat prompts/albedo.txt)" \
  --width 2048 --height 2048 \
  --format png \
  --output public/textures/hexcore-albedo.png

gemini generate-texture \
  --prompt "$(cat prompts/normal.txt)" \
  --width 2048 --height 2048 \
  --format png \
  --color-space linear \
  --output public/textures/hexcore-normal.png

# Step 3: Generate shader code
gemini generate-shader \
  --prompt "$(cat prompts/nucleus-shader.txt)" \
  --type fragment \
  --output src/shaders/nucleus.frag

# Step 4: Assemble scene
gemini generate-code \
  --prompt "Assemble a Three.js scene using the modules in src/geometries/ 
            and shaders in src/shaders/ following the architecture in 
            hexcore-design-document.md Section 7. Add the animation loop 
            from Section 5 and cursor magnetism from Section 5.2." \
  --context hexcore-design-document.md \
  --output src/hexcore-scene.js
```

---

## 11. File Structure

```
hexcore/
├── public/
│   └── textures/
│       ├── hexcore-albedo.png
│       ├── hexcore-normal.png
│       ├── hexcore-orm.png          (roughness/metalness/AO packed)
│       ├── hexcore-emissive.png
│       ├── hexcore-iridescence.png
│       ├── rune-disc-atlas.png
│       └── env-map/                 (cubemap faces)
├── src/
│   ├── geometries/
│   │   ├── outer-shell.js
│   │   ├── shard-ring.js
│   │   ├── nucleus.js
│   │   └── rune-discs.js
│   ├── shaders/
│   │   ├── crystal.vert
│   │   ├── crystal.frag
│   │   ├── nucleus.vert
│   │   └── nucleus.frag
│   ├── hexcore-scene.js             (Three.js scene assembly)
│   ├── magnetism.js                 (global cursor tracking)
│   ├── scroll-ejection.js           (rune ejection system)
│   └── custom-cursor.js             (cursor management)
├── prompts/                         (Gemini CLI prompt files)
│   ├── outer-shell.txt
│   ├── shard-ring.txt
│   ├── nucleus.txt
│   ├── albedo.txt
│   ├── normal.txt
│   ├── iridescence.txt
│   ├── rune-disc.txt
│   └── nucleus-shader.txt
└── hexcore-design-document.md       (this file)
```

---

## 12. Definition of Done

| Checkpoint | Criteria |
|---|---|
| Geometry complete | All 5 layers rendering with correct hierarchy and independent rotations |
| Textures complete | All maps loaded, iridescence visible, rune glow visible in cracks |
| Idle animation | Float, pulse, and rotation all running without judder |
| Magnetism | Model tracks cursor from any tile; damping feels alive not laggy |
| Scroll ejection | Rune disc ejects cleanly, cursor morphs at correct scroll %, reverse works |
| Custom cursor | Gold rune visible, active state responds, no default cursor visible |
| Performance | ≤5 draw calls, 60fps on mid-range laptop GPU, Lighthouse perf score ≥85 |
| Responsive | Graceful degradation to shell-only on mobile, no broken layout |
| Accessibility | `prefers-reduced-motion` disables float and pulse, cursor reverts to default |

---

*Document version 1.0 — Ready for Gemini CLI generation pipeline*
