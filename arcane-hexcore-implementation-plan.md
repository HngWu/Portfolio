# Arcane Hex Core — Implementation Plan

> Transform the existing 3D polyhedron model into the Arcane Hex Core.  
> The model exists inside a portfolio website with two modes: **Quick Pitch** (magical, warm, golden) and **Deep Dive** (technical, cool, violet-teal).  
> Every feature below is tagged with which mode it belongs to, or whether it spans both.

---

## Mode Design Philosophy

| Dimension | Quick Pitch Mode | Deep Dive Mode |
|---|---|---|
| **Personality** | Enchanted artefact, mythic energy | Living machine, engineered precision |
| **Colour palette** | Warm gold `#FFB44A` → amber `#FF8C00` → white apex | Deep violet `#6A0DAD` → teal `#4AFFB4` → white apex |
| **Ring glow** | Neon mint `#4AFFB4` + warm gold `#FFB44A` (existing) | Electric violet `#B44AFF` + cold teal `#4AFFB4` |
| **Edge lines** | Gold `#FFD700` → amber, slow pulse | Violet → teal, fast dash current |
| **Particle sparks** | Golden firefly drift, slow float | Cold blue-white sparks, fast radial burst |
| **Tooltips** | Arcane lore fragments, runic script | Tech stack labels, metric readouts |
| **Bloom character** | Wide, soft, warm haze | Tight, intense, cool glow |
| **Ambient motion** | Slow, breathing, organic | Fast, precise, mechanical tick |
| **Shell material** | Deep obsidian with warm gold vein highlights | Dark carbon with cool blue-tinted specular |
| **Transition** | Cross-fade with golden particle burst outward | Cross-fade with blue scan-line sweep upward |

### Mode prop contract

All scene components receive `mode: 'quick-pitch' | 'deep-dive'` as a prop. A `useModeColors()` hook centralises every palette value so no colour is hardcoded in more than one place:

```ts
function useModeColors(mode: 'quick-pitch' | 'deep-dive') {
  return mode === 'quick-pitch'
    ? {
        coreA:      '#6A0DAD', // deep violet (inner)
        coreB:      '#FFB44A', // gold (mid)
        coreApex:   '#FFFFFF',
        edgeA:      '#FFD700',
        edgeB:      '#FF8C00',
        ringGlow1:  '#4AFFB4',
        ringGlow2:  '#FFB44A',
        particleCol:'#FFD700',
        bloomStrength: 1.8,
        bloomRadius:   0.9,   // wider, softer
        emissiveBase:  28,
      }
    : {
        coreA:      '#6A0DAD',
        coreB:      '#4AFFB4',
        coreApex:   '#FFFFFF',
        edgeA:      '#6A0DAD',
        edgeB:      '#4AFFB4',
        ringGlow1:  '#4AFFB4',
        ringGlow2:  '#B44AFF',
        particleCol:'#8AB4FF',
        bloomStrength: 1.4,
        bloomRadius:   0.6,   // tighter, sharper
        emissiveBase:  25,
      }
}
```

---

## Table of Contents

1. [Phase 1 — Foundation](#phase-1--foundation)
   - [1.1 Mode-Aware Postprocessing Bloom](#11-mode-aware-postprocessing-bloom)
   - [1.2 Dual-Mode Plasma Energy Sphere Shader](#12-dual-mode-plasma-energy-sphere-shader)
   - [1.3 Mode Transition System](#13-mode-transition-system)
2. [Phase 2 — Pyramid Shell](#phase-2--pyramid-shell)
   - [2.1 Animated Hex-Lattice Edge Glow](#21-animated-hex-lattice-edge-glow)
   - [2.2 Per-Face Mouse Proximity Glow](#22-per-face-mouse-proximity-glow)
   - [2.3 Shatter + Magnetic Reassembly on Click](#23-shatter--magnetic-reassembly-on-click)
   - [2.4 QP — Shell Material: Obsidian + Gold Veins](#24-qp--shell-material-obsidian--gold-veins)
   - [2.5 DD — Shell Material: Carbon Fibre + Blueprint Grid](#25-dd--shell-material-carbon-fibre--blueprint-grid)
3. [Phase 3 — Orbital Rings](#phase-3--orbital-rings)
   - [3.1 Third Gyroscopic Ring + Intersection Beam](#31-third-gyroscopic-ring--intersection-beam)
   - [3.2 Ring Particle Spark Emission](#32-ring-particle-spark-emission)
   - [3.3 QP — Ring Constellation Trails](#33-qp--ring-constellation-trails)
   - [3.4 DD — Ring RPM Readout HUD](#34-dd--ring-rpm-readout-hud)
4. [Phase 4 — CLI / Spell API](#phase-4--cli--spell-api)
   - [4.1 Terminal Overlay + `window.__hexcore_cmd` API](#41-terminal-overlay--window__hexcore_cmd-api)
5. [Phase 5 — Scroll + Hover Narrative](#phase-5--scroll--hover-narrative)
   - [5.1 4-Act Scroll Narrative Sequence](#51-4-act-scroll-narrative-sequence)
   - [5.2 Scroll-Triggered Lightning Arcs](#52-scroll-triggered-lightning-arcs)
   - [5.3 Magnetic Tilt + Bloom Intensification on Hover](#53-magnetic-tilt--bloom-intensification-on-hover)
   - [5.4 QP — Runic Face Tooltip Overlays](#54-qp--runic-face-tooltip-overlays)
   - [5.5 DD — Tech Stack Face Tooltip Overlays](#55-dd--tech-stack-face-tooltip-overlays)
   - [5.6 QP — Constellation Star Field Background](#56-qp--constellation-star-field-background)
   - [5.7 DD — Floating Code Fragment Particles](#57-dd--floating-code-fragment-particles)
6. [Phase 6 — Antigravity + Lockdown CLI Spells](#phase-6--antigravity--lockdown-cli-spells)
   - [6.1 Antigravity: Full Fragment Levitation](#61-antigravity-full-fragment-levitation)
   - [6.2 Lockdown: EMP Shockwave + Idle Dim](#62-lockdown-emp-shockwave--idle-dim)
   - [6.3 QP — Summon Spell: Golden Ritual Circle](#63-qp--summon-spell-golden-ritual-circle)
   - [6.4 DD — Overclock Spell: Diagnostic Cascade](#64-dd--overclock-spell-diagnostic-cascade)
7. [Phase 7 — Mode-Exclusive Ambient Features](#phase-7--mode-exclusive-ambient-features)
   - [7.1 QP — Orbiting Magical Sigil Glyphs](#71-qp--orbiting-magical-sigil-glyphs)
   - [7.2 QP — Breath Pulse: Organic Idle Animation](#72-qp--breath-pulse-organic-idle-animation)
   - [7.3 DD — Wireframe Deconstruct on Idle](#73-dd--wireframe-deconstruct-on-idle)
   - [7.4 DD — System Vitals Readout Panel](#74-dd--system-vitals-readout-panel)
8. [Architectural Notes](#architectural-notes)
9. [Dependency Reference](#dependency-reference)

---

## Phase 1 — Foundation

> Do this first. Bloom and the plasma shader have the highest visual payoff. Get them working in both modes before touching the cage.

---

### 1.1 Mode-Aware Postprocessing Bloom

**Modes:** Both (different character per mode)  
**Type:** Shader / Postprocessing  
**Complexity:** ●●○○  
**Key APIs:** `@react-three/postprocessing`, `EffectComposer`, `UnrealBloom`, `SelectiveBloom`

#### Why first
Everything downstream benefits automatically. Mode differences in bloom character (wide soft gold haze vs tight cool glow) set the entire emotional register before any other feature is built.

#### Steps

1. Install:
   ```bash
   npm install @react-three/postprocessing
   ```

2. Wrap `Canvas` children in `<EffectComposer>`.

3. Store a `bloomRef` pointing to `<UnrealBloom>` and a `selectiveBloomRef` for the core mesh:
   ```tsx
   <UnrealBloom ref={bloomRef} threshold={0.2} strength={colors.bloomStrength} radius={colors.bloomRadius} />
   <SelectiveBloom ref={selectiveBloomRef} selection={[coreRef]} intensity={2.0} />
   ```

4. **Quick Pitch** bloom character — wider and warmer:
   - `strength: 1.8`, `radius: 0.9`, `threshold: 0.15`
   - Add `<ToneMapping mode={ToneMappingMode.ACES_FILMIC} />` for that filmic golden warmth

5. **Deep Dive** bloom character — tighter and crisper:
   - `strength: 1.4`, `radius: 0.6`, `threshold: 0.22`
   - Add `<ChromaticAberration offset={[0.002, 0.002]} />` for that clinical digital edge

6. On mode change: smoothly lerp `bloomRef.current.strength` and `bloomRef.current.radius` toward new targets over 800ms in `useFrame` — no hard snaps.

7. Tune threshold so the dark pyramid shell never blooms regardless of mode.

#### Notes
- `SelectiveBloom` requires `toneMapped={false}` on target materials.
- Store `bloomRef` so Phase 5.3 hover logic can ramp `intensity` directly.

---

### 1.2 Dual-Mode Plasma Energy Sphere Shader

**Modes:** Both (different palette per mode)  
**Type:** Shader  
**Complexity:** ●●●○  
**Key APIs:** `ShaderMaterial`, `glsl-noise / simplex3`, `uTime`, `uModeBlend`

#### Steps

1. Keep `<sphereGeometry args={[1, 32, 32]} />` on `coreRef`. Swap only the material to a `ShaderMaterial` stored in a `useRef`.

2. **Vertex shader:**
   ```glsl
   varying vec3 vWorldPos;
   varying vec3 vNormal;
   varying vec2 vUv;
   void main() {
     vUv = uv;
     vNormal = normalize(normalMatrix * normal);
     vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
     gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
   }
   ```

3. **Fragment shader** — use `uModeBlend` (0 = Quick Pitch, 1 = Deep Dive) to lerp between palettes:
   ```glsl
   uniform float uTime;
   uniform float uGlowIntensity;
   uniform float uModeBlend;       // 0.0 = Quick Pitch, 1.0 = Deep Dive
   varying vec3 vWorldPos;
   varying vec3 vNormal;
   varying vec2 vUv;

   // paste snoise3 here

   void main() {
     float n = snoise(vWorldPos * 1.8 + uTime * 0.4) * 0.5 + 0.5;

     // Quick Pitch palette: violet core → gold → white
     vec3 qp_a = vec3(0.416, 0.051, 0.678); // #6A0DAD
     vec3 qp_b = vec3(1.000, 0.706, 0.290); // #FFB44A gold
     // Deep Dive palette: violet core → teal → white
     vec3 dd_a = vec3(0.416, 0.051, 0.678); // #6A0DAD
     vec3 dd_b = vec3(0.290, 1.000, 0.706); // #4AFFB4 teal

     vec3 colA = mix(qp_a, dd_a, uModeBlend);
     vec3 colB = mix(qp_b, dd_b, uModeBlend);
     vec3 col  = mix(colA, colB, n);
     col = mix(col, vec3(1.0), pow(max(dot(vNormal, vec3(0,1,0)), 0.0), 3.0));

     // Lissajous energy filaments (faster in Deep Dive)
     float speed = mix(1.5, 2.0, uModeBlend);
     float fil = sin(vUv.x * 8.0 + uTime * speed) * cos(vUv.y * 6.0 - uTime * speed * 0.75);
     col += colB * (fil > 0.92 ? 0.6 : 0.0);

     // Outward pulsing rings
     float ring = fract(length(vUv - 0.5) * 4.0 - uTime * 0.8);
     col += vec3(smoothstep(0.92, 1.0, ring) * 0.5);

     // Chromatic aberration (stronger in Deep Dive)
     float aberration = mix(0.001, 0.003, uModeBlend);
     // (apply per-channel UV offset here)

     gl_FragColor = vec4(col * uGlowIntensity, 1.0);
   }
   ```

4. Animate uniforms in `useFrame`:
   ```ts
   coreMat.current.uniforms.uTime.value = t
   coreMat.current.uniforms.uModeBlend.value = THREE.MathUtils.lerp(
     coreMat.current.uniforms.uModeBlend.value,
     mode === 'deep-dive' ? 1.0 : 0.0,
     delta * 1.2  // smooth cross-fade over ~800ms
   )
   ```

5. Expose `uGlowIntensity` (default `25.0`) for hover and lockdown tweening.

---

### 1.3 Mode Transition System

**Modes:** Both  
**Type:** Architecture  
**Complexity:** ●●○○  
**Key APIs:** `useRef`, `lerp`, CSS transition, `uModeBlend`

#### Overview
Every visual property that differs between modes is driven by a single `modeBlend` ref (0 = Quick Pitch, 1 = Deep Dive) that advances each `useFrame`. This single value fans out to all shader uniforms, material colours, and bloom parameters — ensuring a seamless cross-fade rather than a hard cut.

#### Steps

1. Add a `modeBlendRef = useRef(0)` in `PolyhedronScene`.

2. Each frame, advance toward target:
   ```ts
   const target = mode === 'deep-dive' ? 1.0 : 0.0
   modeBlendRef.current = THREE.MathUtils.lerp(modeBlendRef.current, target, delta * 1.2)
   ```

3. Fan out to all materials:
   ```ts
   const b = modeBlendRef.current
   coreMat.current.uniforms.uModeBlend.value = b
   runicShaderMaterial1.uniforms.uGlowColor.value.lerpColors(goldColor, mintColor, b)
   runicShaderMaterial2.uniforms.uGlowColor.value.lerpColors(amberColor, violetColor, b)
   bloomRef.current.strength = THREE.MathUtils.lerp(1.8, 1.4, b)
   bloomRef.current.radius   = THREE.MathUtils.lerp(0.9, 0.6, b)
   ```

4. **Transition burst effect** — on mode change, fire a one-shot particle burst:
   - **Quick Pitch → Deep Dive:** spawn a scan-line sweep (horizontal plane mesh, thin, blue, ascends from y=-3 to y=+3 over 600ms then disposes)
   - **Deep Dive → Quick Pitch:** spawn an outward golden particle burst (200 particles, radial velocity, fade over 800ms)

5. Detect mode change by comparing previous mode in a `prevModeRef` each frame.

---

## Phase 2 — Pyramid Shell

---

### 2.1 Animated Hex-Lattice Edge Glow

**Modes:** Both (different colour and speed)  
**Type:** Shader  
**Complexity:** ●●●○  
**Key APIs:** `LineMaterial`, `LineSegments2`, `LineSegmentsGeometry`, `dashOffset`, hue cycle

#### Steps

1. Import `LineMaterial`, `LineSegments2`, `LineSegmentsGeometry` from `three/addons`.

2. Replace `<lineSegments>` + `<lineBasicMaterial>` in `PyramidFragment`:
   ```ts
   const lineGeo = new LineSegmentsGeometry().fromEdgesGeometry(edgeGeo)
   const lineMat = new LineMaterial({
     color: 0xFFD700,   // starts gold; overridden each frame by modeBlend
     linewidth: 1.5,
     dashed: true,
     dashSize: 0.3,
     gapSize: 0.15,
   })
   ```

3. Each frame, drive colour from `modeBlend`:
   ```ts
   const edgeA = new THREE.Color(colors.edgeA) // gold or violet
   const edgeB = new THREE.Color(colors.edgeB) // amber or teal
   const t = Math.sin(elapsed * (mode === 'quick-pitch' ? 0.3 : 0.6)) * 0.5 + 0.5
   lineMat.color.lerpColors(edgeA, edgeB, t)
   ```

4. Animate `dashOffset` — **Quick Pitch** slow and dreamy, **Deep Dive** fast and electric:
   ```ts
   const speed = THREE.MathUtils.lerp(0.4, 1.2, modeBlend)
   lineMat.dashOffset -= delta * speed
   ```

5. Set `depthWrite: false`, `transparent: true`, `polygonOffset: true`.

---

### 2.2 Per-Face Mouse Proximity Glow

**Modes:** Both  
**Type:** Interaction  
**Complexity:** ●●●○  
**Key APIs:** `useThree`, `Raycaster`, `emissiveIntensity`, `pointer`

#### Steps

1. In `PolyhedronScene`:
   ```ts
   const { raycaster, pointer, camera } = useThree()
   ```

2. Collect all 54 pyramid mesh refs into a `meshRefs` array.

3. In `useFrame`:
   ```ts
   raycaster.setFromCamera(pointer, camera)
   const hits = raycaster.intersectObjects(meshRefs.current, false)
   ```

4. Top N=5 closest faces glow; rest fade back to default.

5. **Quick Pitch:** emissive colour shifts toward warm gold on proximity.  
   **Deep Dive:** emissive colour shifts toward cold teal-blue.

6. Apply small outward nudge along face normal:
   ```ts
   mesh.position.addScaledVector(face.normal, proximityStrength * 0.04)
   ```

7. Lerp all non-hit faces back to defaults for smooth ripple falloff.

---

### 2.3 Shatter + Magnetic Reassembly on Click

**Modes:** Both (different spring feel per mode)  
**Type:** Animation  
**Complexity:** ●●●●  
**Key APIs:** `@react-spring/three`, `useSpring`, `easeOutExpo`, `easeInElastic`, stagger

#### Steps

1. Install:
   ```bash
   npm install @react-spring/three
   ```

2. In `PyramidFragment`, replace manual expansion with a spring:
   ```ts
   const [springs, api] = useSpring(() => ({
     expansion: 0.25,
     config: { mass: 1, tension: 280, friction: 60 }
   }))
   ```

3. On click — fire outward with stagger (20ms per face index):
   ```ts
   api.start({
     expansion: 6.0 + faceIndex * 0.04,
     config: { easing: easeOutExpo, duration: 600 }
   })
   ```

4. After 800ms hold, snap back with mode-specific config:
   - **Quick Pitch:** `{ tension: 280, friction: 16 }` — elastic, bouncy, magical
   - **Deep Dive:** `{ tension: 500, friction: 30 }` — fast, precise, mechanical
   ```ts
   setTimeout(() => api.start({ expansion: 0.25, config: modeSpringConfig }), 800 + faceIndex * 20)
   ```

5. Drive `meshGroupRef.position` from the animated spring value.

6. Optional: camera shake pulse on detonation (300ms sin disturbance on `camera.position.z`).

---

### 2.4 QP — Shell Material: Obsidian + Gold Veins

**Modes:** Quick Pitch only  
**Type:** Shader  
**Complexity:** ●●●○  
**Key APIs:** `ShaderMaterial`, Perlin noise, `uModeBlend`

#### Concept
When in Quick Pitch, pyramid faces shift from flat dark toward a deep obsidian with glowing gold vein cracks — like a magical geode. Veins pulse with the core's heartbeat.

#### Steps

1. Add a secondary `ShaderMaterial` for pyramid faces in Quick Pitch mode.

2. Fragment shader: use 2D Perlin noise to generate irregular crack patterns, threshold them into bright gold lines:
   ```glsl
   uniform float uTime;
   uniform float uModeBlend; // 0 = QP, 1 = DD

   void main() {
     vec3 baseColor = vec3(0.02, 0.02, 0.08); // deep obsidian
     float vein = smoothstep(0.78, 0.82, snoise(vUv * 6.0 + uTime * 0.1));
     vec3 veinColor = vec3(1.0, 0.706, 0.29) * vein * (1.5 + sin(uTime * 2.0) * 0.3);
     vec3 col = mix(baseColor + veinColor, vec3(0.03, 0.04, 0.2), uModeBlend);
     gl_FragColor = vec4(col, 1.0);
   }
   ```

3. Gold veins fully visible at `uModeBlend = 0` (Quick Pitch); faded to near-zero at `uModeBlend = 1`.

4. Vein brightness pulses in sync with core sphere `uGlowIntensity` rhythm.

---

### 2.5 DD — Shell Material: Carbon Fibre + Blueprint Grid

**Modes:** Deep Dive only  
**Type:** Shader  
**Complexity:** ●●●○  
**Key APIs:** `ShaderMaterial`, UV grid pattern, `uModeBlend`

#### Concept
When in Deep Dive, pyramid faces display a subtle carbon-fibre weave texture overlaid with a faint blueprint grid — like a CAD model of an engineering component.

#### Steps

1. Fragment shader: generate a carbon-fibre weave using UV tiling and a grid:
   ```glsl
   uniform float uModeBlend;
   uniform float uTime;

   void main() {
     // Carbon fibre weave
     vec2 uv = vUv * 20.0;
     float weave = mod(floor(uv.x) + floor(uv.y), 2.0);
     vec3 carbon = mix(vec3(0.04, 0.04, 0.06), vec3(0.08, 0.08, 0.12), weave);

     // Blueprint grid overlay
     vec2 grid = abs(fract(vUv * 8.0) - 0.5);
     float line = min(grid.x, grid.y);
     float gridAlpha = smoothstep(0.04, 0.0, line) * 0.15;
     vec3 gridColor = vec3(0.2, 0.6, 1.0); // blueprint blue

     vec3 col = carbon + gridColor * gridAlpha;
     col = mix(vec3(0.02, 0.02, 0.08), col, uModeBlend); // fade in on mode switch
     gl_FragColor = vec4(col, 1.0);
   }
   ```

2. Blueprint grid only fully visible at `uModeBlend = 1.0`.

3. Grid lines pulse opacity subtly with `sin(uTime * 0.5)` — like active circuit traces.

---

## Phase 3 — Orbital Rings

---

### 3.1 Third Gyroscopic Ring + Intersection Beam

**Modes:** Both  
**Type:** Animation  
**Complexity:** ●●●○  
**Key APIs:** `Line2`, `LineGeometry`, plane intersection math, `THREE.Quaternion`

#### Steps

1. Add a third ring group on the Z-X diagonal:
   ```tsx
   <group ref={ring3Ref} rotation={[0, Math.PI / 4, Math.PI / 4]}>
     <mesh geometry={ring3Geo} material={runicShaderMaterial3} />
   </group>
   ```
   `ring3Geo = makeRectangularTorus(2.3, 0.28, 0.45, 2.2)`

2. Each frame, compute plane normals from ring quaternions:
   ```ts
   const n1 = new THREE.Vector3(0, 0, 1).applyQuaternion(ring1Ref.current.quaternion)
   const n2 = new THREE.Vector3(0, 0, 1).applyQuaternion(ring2Ref.current.quaternion)
   const dir = new THREE.Vector3().crossVectors(n1, n2).normalize()
   ```

3. Render a `Line2` from `dir * -2.5` → `dir * 2.5`.

4. Beam colour by mode:
   - **Quick Pitch:** warm amber `#FFB44A` with wide soft glow
   - **Deep Dive:** cold teal `#4AFFB4` with tight bright line

5. Pulse opacity: `Math.sin(t * 3.0) * 0.5 + 0.5`

---

### 3.2 Ring Particle Spark Emission

**Modes:** Both (different particle character)  
**Type:** Shader / Particles  
**Complexity:** ●●●○  
**Key APIs:** `Points`, `PointsMaterial`, `AdditiveBlending`, sprite texture, particle lifetime

#### Steps

1. Create 400-particle `Points` geometry initialized at random ring1 torus surface positions.

2. Store per-particle: `spawnPos`, `velocity`, `lifetime` (0.6–1.2s), `age` (initialised to `Math.random() * lifetime` for stagger).

3. Per-mode particle behaviour:
   - **Quick Pitch:** slow drift upward with gentle turbulence, golden colour `#FFD700`, larger size `0.06`, long lifetime `1.4s`
   - **Deep Dive:** fast radial burst outward, cold blue-white `#8AB4FF`, smaller size `0.03`, short lifetime `0.7s`

4. Drive per-particle opacity via sine arch: `sin(age / lifetime * Math.PI)`

5. Material settings:
   ```ts
   new THREE.PointsMaterial({
     size: modeBlend > 0.5 ? 0.03 : 0.06,
     sizeAttenuation: true,
     transparent: true,
     depthWrite: false,
     blending: THREE.AdditiveBlending,
     map: sparkTexture,
   })
   ```

---

### 3.3 QP — Ring Constellation Trails

**Modes:** Quick Pitch only  
**Type:** Shader / Animation  
**Complexity:** ●●●○  
**Key APIs:** `Points`, trail buffer, `AdditiveBlending`

#### Concept
As the rings rotate, they leave behind a fading constellation trail — like stars being dragged across a night sky. Dots spawn at 8 fixed points on each ring's rim, persist for ~2s, fade out. Creates a magical orbital trace.

#### Steps

1. For each of the 3 rings, define 8 spawn points equidistant on the ring circumference.

2. Each 120ms, snapshot world positions of those 8 points and append to a `trailBuffer` (capped at 40 entries × 8 points = 320 points total).

3. Each frame, update a `Points` geometry from the trail buffer. Older entries get lower opacity via a per-point colour alpha fade.

4. Use warm gold sprite texture, `AdditiveBlending`, small size `0.04`.

5. Only render when `modeBlend < 0.3` (Quick Pitch — fades automatically during transition).

---

### 3.4 DD — Ring RPM Readout HUD

**Modes:** Deep Dive only  
**Type:** UI / Interaction  
**Complexity:** ●●○○  
**Key APIs:** `drei Html`, ring angular velocity refs

#### Concept
Three small `<Html>` readout chips are anchored to the outer edge of each ring, displaying their current angular velocity in RPM. They update in real-time as rings accelerate on hover. Looks like a live engineering dashboard attached to spinning gyroscopes.

#### Steps

1. Compute RPM from angular velocity refs:
   ```ts
   const rpm1 = (ring1SpeedX.current * 60) / (2 * Math.PI)
   ```

2. Anchor a `<Html>` at the top of each ring's current world position (recompute from quaternion each frame).

3. Style as a monospace dark chip:
   ```css
   .rpm-chip {
     font-family: monospace;
     font-size: 10px;
     color: #4AFFB4;
     background: rgba(0, 10, 20, 0.7);
     border: 1px solid rgba(74, 255, 180, 0.3);
     border-radius: 3px;
     padding: 2px 6px;
     white-space: nowrap;
   }
   ```

4. Display: `RING-1  34.2 RPM ↻`

5. Only render when `modeBlend > 0.7` (Deep Dive — fades automatically during transition).

---

## Phase 4 — CLI / Spell API

---

### 4.1 Terminal Overlay + `window.__hexcore_cmd` API

**Modes:** Both (different command vocabulary)  
**Type:** CLI / Interaction  
**Complexity:** ●●○○  
**Key APIs:** `window.__hexcore_cmd`, `drei Html`, `useRef` flag pattern

#### Steps

1. Create a spell flags ref:
   ```ts
   const spellsRef = useRef<Record<string, boolean>>({})
   ```

2. Register the global API in `useEffect`:
   ```ts
   useEffect(() => {
     (window as any).__hexcore_cmd = (cmd: string) => {
       spellsRef.current[cmd] = true
     }
     return () => { delete (window as any).__hexcore_cmd }
   }, [])
   ```

3. Read flags synchronously in `useFrame` — **no React state, no re-renders**.

4. Add a `<Html>` terminal overlay from `@react-three/drei`.

5. **Full command table:**

   | Command | Mode | Effect |
   |---|---|---|
   | `antigravity on` | Both | Fragment levitation |
   | `antigravity off` | Both | Magnetic snap-back |
   | `lockdown` | Both | EMP shockwave + dim |
   | `lightning on` | Both | Arc between pyramids |
   | `lightning off` | Both | Clear arcs |
   | `ignite on` | Both | Magma overload (existing) |
   | `ignite off` | Both | Clear ignite |
   | `summon` | Quick Pitch | Ritual circle spell |
   | `overclock` | Deep Dive | Diagnostic cascade |
   | `constellation on` | Quick Pitch | Dense constellation field |
   | `scan` | Deep Dive | Full wireframe deconstruct |

6. Terminal overlay styling adapts to mode:
   - **Quick Pitch:** dark glass card, gold border, serif-adjacent font
   - **Deep Dive:** terminal green-on-black, monospace font, scanline effect

---

## Phase 5 — Scroll + Hover Narrative

---

### 5.1 4-Act Scroll Narrative Sequence

**Modes:** Both (pacing differs)  
**Type:** Interaction  
**Complexity:** ●●●●  
**Key APIs:** `ScrollControls`, `useScroll`, `THREE.MathUtils.smoothstep`, camera dolly

#### Act Map

| Act | Scroll Range | Quick Pitch State | Deep Dive State |
|---|---|---|---|
| 1 — Assembly | 0.00 – 0.25 | Pyramids drift in like falling stars | Pyramids snap in from exact cardinal positions |
| 2 — Spin-up | 0.25 – 0.50 | Rings accelerate softly; gold glow intensifies | Rings ramp up mechanically; RPM chips light up |
| 3 — Detonation | 0.50 – 0.75 | Fragments bloom outward with golden burst | Fragments explode with precision; wireframe flash |
| 4 — Lockup | 0.75 – 1.00 | Fragments breathe back slowly; dim constellation | Fragments lock into grid-aligned final position |

#### Steps

1. Wrap in `<ScrollControls pages={4} damping={0.1}>`.

2. Use `const { offset } = useScroll()` — `offset` is 0→1.

3. Extract per-act progress:
   ```ts
   const act1 = THREE.MathUtils.smoothstep(offset, 0.00, 0.25)
   const act2 = THREE.MathUtils.smoothstep(offset, 0.25, 0.50)
   const act3 = THREE.MathUtils.smoothstep(offset, 0.50, 0.75)
   const act4 = THREE.MathUtils.smoothstep(offset, 0.75, 1.00)
   ```

4. **Act 1 assembly:** drive `assemblyProgress = act1` instead of auto-increment.  
   - Quick Pitch: `flyInOffset` uses slow easeOutBack  
   - Deep Dive: `flyInOffset` arrives from 6 cardinal axes with easeOutCubic

5. **Act 2 spin-up:** `ringSpeedMultiplier = 1 + act2 * 3`

6. **Act 3 detonation:** `explosionStrength = act3 * 6.0`; camera dolly:
   ```ts
   const targetZ = THREE.MathUtils.lerp(13, 7, act2 * 0.5 + act3 * 0.5)
   state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, targetZ, delta * 2)
   ```

7. **Act 4 lockup:** reverse expansion; Quick Pitch dims to a soft amber ember; Deep Dive dims to a cold idle state.

---

### 5.2 Scroll-Triggered Lightning Arcs

**Modes:** Both (colour differs)  
**Type:** Shader / Interaction  
**Complexity:** ●●●●  
**Key APIs:** `Line2`, `LineMaterial`, midpoint displacement, `AdditiveBlending`

#### Midpoint Displacement Algorithm

```ts
function fractalLightning(p1: THREE.Vector3, p2: THREE.Vector3, depth = 3): THREE.Vector3[] {
  if (depth === 0) return [p1, p2]
  const mid = p1.clone().lerp(p2, 0.5)
  const perp = new THREE.Vector3()
    .crossVectors(p2.clone().sub(p1), new THREE.Vector3(0, 1, 0))
    .normalize()
  mid.addScaledVector(perp, (Math.random() - 0.5) * p1.distanceTo(p2) * 0.4)
  return [...fractalLightning(p1, mid, depth - 1), ...fractalLightning(mid, p2, depth - 1)]
}
```

#### Steps

1. At Act 3 threshold: select 3 non-adjacent pyramid pairs (index distance > 10).

2. Run `fractalLightning(face1.center, face2.center, 3)` per pair.

3. Render as `Line2` with mode-aware colour:
   - **Quick Pitch:** white core + amber `#FF8C00` halo glow
   - **Deep Dive:** white core + violet `#6A0DAD` halo glow

4. Flash loop — toggle opacity at 30ms intervals, clear after 400ms.

5. Always `dispose()` geometry and material after animation ends.

---

### 5.3 Magnetic Tilt + Bloom Intensification on Hover

**Modes:** Both  
**Type:** Interaction  
**Complexity:** ●●○○  
**Key APIs:** pointer delta, `SelectiveBloom` ref, `ChromaticAberration`, lerp

#### Steps

1. Track pointer from `useThree` — already normalised -1 → 1.

2. Apply spring-damped tilt:
   ```ts
   groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, pointer.y * 0.35, delta * 4)
   groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, pointer.x * 0.35, delta * 4)
   ```

3. Clamp to ±20°.

4. Ramp bloom on approach (pointer distance < 0.5 from center):
   ```ts
   const dist = Math.sqrt(pointer.x ** 2 + pointer.y ** 2)
   bloomRef.current.strength = THREE.MathUtils.lerp(colors.bloomStrength, colors.bloomStrength * 2.2, 1 - dist)
   ```

5. Ramp core `uGlowIntensity` from `25 → 45` as pointer approaches center.

6. **Quick Pitch deep hover (dist < 0.15):** add `<LensFlare>` intensity burst  
   **Deep Dive deep hover (dist < 0.15):** ramp `<ChromaticAberration>` offset to `[0.006, 0.006]`

---

### 5.4 QP — Runic Face Tooltip Overlays

**Modes:** Quick Pitch only  
**Type:** Interaction  
**Complexity:** ●●○○  
**Key APIs:** `drei Html`, raycaster, CSS spring

#### Concept
On hover, pyramid faces reveal a dark glass card with a large runic character and a short Arcane-lore flavour text — "Echo of the Rune-Forger", "Shard of Hextide", etc. Rewards curiosity with world-building.

#### Steps

1. Track `hoveredFace: FaceData | null` in state.

2. Spawn `<Html>` at `face.center + face.normal * 0.6`:
   ```tsx
   <Html position={...} transform sprite distanceFactor={8}>
     <div className="tooltip-card">
       <span className="tooltip-rune">{face.rune}</span>
       <span className="tooltip-label">{LORE_MAP[face.id]}</span>
     </div>
   </Html>
   ```

3. Style: dark glass card, gold border `rgba(255, 180, 74, 0.4)`, gold rune text `#FFD700`.

4. Animate in: CSS `scale(0.8 → 1.0)` + `opacity(0 → 1)` over 150ms.

5. Limit to 1 active tooltip; dismiss on pointer leave.

6. `LORE_MAP` — 54 entries, each a short Arcane-universe label (e.g. "Rune of Convergence", "Hextech Resonance Node").

---

### 5.5 DD — Tech Stack Face Tooltip Overlays

**Modes:** Deep Dive only  
**Type:** Interaction  
**Complexity:** ●●○○  
**Key APIs:** `drei Html`, raycaster, CSS spring

#### Concept
In Deep Dive, the same hover interaction reveals a monospace technical readout: the face's index, its normal vector, and a "tech stack" label (e.g. "React · Three.js", "GLSL · WebGL2", "TypeScript · Next.js"). The model becomes a navigable skill map.

#### Steps

1. Same raycaster logic as 5.4 — just swap the tooltip content.

2. `TECH_MAP[face.id]` — 54 entries mapping each face to a technology label from your actual stack.

3. Style: terminal card, cold teal border `rgba(74, 255, 180, 0.3)`, monospace teal text.

4. Display format:
   ```
   FACE-ID  06-2-1
   NORMAL   (0.577, 0.577, 0.577)
   STACK    React · Three.js
   PROFICIENCY  ████████░░  82%
   ```

5. Proficiency bar uses a `div` with width driven by a data value — rendered as a thin teal fill bar.

6. Animate in: CSS `translateX(-4px → 0)` + `opacity(0 → 1)` over 120ms (snappier than QP version).

---

### 5.6 QP — Constellation Star Field Background

**Modes:** Quick Pitch only  
**Type:** Shader / Ambient  
**Complexity:** ●●○○  
**Key APIs:** `Points`, `PointsMaterial`, `AdditiveBlending`

#### Concept
A sparse star field (`~200 stars`) fills the background behind the model in Quick Pitch mode. Stars twinkle with a gentle sine flicker. A few random stars slowly drift inward toward the core, consumed and reborn — reinforcing the magical energy-feeding-the-artefact narrative.

#### Steps

1. Create a `Points` geometry with 200 stars, positions scattered in a sphere of radius 12.

2. Per star: random twinkle phase offset, random drift speed (most = 0, ~10 drift inward).

3. In `useFrame`: advance drifting stars toward origin; respawn at radius 12 when they reach radius 1.

4. Opacity driven by `uModeBlend`: fully visible at `0.0`, invisible at `1.0`.

5. `PointsMaterial`: size `0.02–0.06` randomised per star, white `#FFFFFF`, `AdditiveBlending`, `sizeAttenuation: true`.

6. Twinkle: multiply each star's opacity by `0.7 + 0.3 * sin(t * twinkleFreq + phase)`.

---

### 5.7 DD — Floating Code Fragment Particles

**Modes:** Deep Dive only  
**Type:** Shader / Ambient  
**Complexity:** ●●●○  
**Key APIs:** `drei Html`, `Points`, animated opacity

#### Concept
~20 tiny `<Html>` fragments containing real code snippets (`useFrame`, `ShaderMaterial`, `uniforms.uTime`, etc.) float slowly around the model in the background at low opacity. They orbit the model loosely, fading in and out. Makes the scene feel like it's surrounded by its own source code — a meta-reference to the engineering behind the portfolio.

#### Steps

1. Define an array of 20 code fragment strings drawn from real Three.js / GLSL syntax.

2. Each fragment has a random spherical orbit position (radius 4–6), orbit speed, and phase.

3. In `useFrame`: advance orbit angle; compute new 3D position; set `<Html>` visibility.

4. Opacity: `0.08–0.18` (very subtle, never competes with the model).

5. Style: monospace font, cold teal `#4AFFB4` at low opacity, no background, no border.

6. Only render when `modeBlend > 0.7`.

---

## Phase 6 — Antigravity + Lockdown CLI Spells

---

### 6.1 Antigravity: Full Fragment Levitation

**Modes:** Both (particle colour differs)  
**Type:** CLI / Animation  
**Complexity:** ●●●●  
**Key APIs:** drift vectors, `window.__hexcore_cmd`, `@react-spring/three`, `Points`

#### Steps

1. On `'antigravity on'`: assign each fragment a random drift vector (Y-biased upward).

2. Each frame: advance position along drift, add independent tumble quaternion.

3. Skip Rubik sequencer while active.

4. Gravity particles from each centroid:
   - **Quick Pitch:** warm amber quads, slow fall, opacity 0.3
   - **Deep Dive:** dim blue-white quads, fast fall, opacity 0.5

5. On `'antigravity off'`: spring back with mode-appropriate config (bouncy vs snappy).

---

### 6.2 Lockdown: EMP Shockwave + Idle Dim

**Modes:** Both (EMP ring colour differs)  
**Type:** CLI / Animation  
**Complexity:** ●●●○  
**Key APIs:** `easeInBack`, EMP torus, delta accumulator, `AdditiveBlending`, `dispose`

#### Steps

1. Tween pyramid expansion → `0` over 400ms (`easeInBack`).

2. Tween ring velocity → `0` over 600ms.

3. Spawn EMP torus:
   - **Quick Pitch:** gold `#FFD700`, wider tube `0.15`
   - **Deep Dive:** teal `#4AFFB4`, thin tube `0.06`

4. Animate: scale `1 → 6`, opacity `1 → 0` over 800ms. Dispose on completion.

5. Dim core `uGlowIntensity`: `25 → 2` over 600ms.

6. Dim ring `uGlowIntensity`: `0.6 → 0.1` over 600ms.

---

### 6.3 QP — Summon Spell: Golden Ritual Circle

**Modes:** Quick Pitch only  
**Type:** CLI / Animation  
**Complexity:** ●●●○  
**Key APIs:** `window.__hexcore_cmd('summon')`, `ShaderMaterial`, `RingGeometry`

#### Concept
Triggers a ritual summoning circle beneath the model — a flat circular glyph pattern that rises from below, rotates slowly, then contracts into the core. Pure magical theatre.

#### Steps

1. On `'summon'` command: spawn a `RingGeometry` flat circle (radius 3) at `y = -2`.

2. Material is a `ShaderMaterial` that draws concentric runic ring patterns in GLSL — alternating gold lines with runic text characters UV-mapped around the circumference.

3. Animate: tween `y` from `-2 → 0` over 1s; rotate at `0.5 rad/s`; scale `0 → 1` over 600ms.

4. After 3s hold: contract scale `1 → 0` over 800ms with `easeInBack`; dispose.

5. During the hold, the core's `uGlowIntensity` ramps from `25 → 50` and back — as if being powered by the ritual.

6. Spawn 60 golden particles from the circle rim, flying inward toward the core on a slow spiral trajectory.

---

### 6.4 DD — Overclock Spell: Diagnostic Cascade

**Modes:** Deep Dive only  
**Type:** CLI / Animation  
**Complexity:** ●●●○  
**Key APIs:** `window.__hexcore_cmd('overclock')`, `drei Html`, rapid ring speed

#### Concept
The "overclock" spell simulates pushing the Hex Core beyond operational limits. Ring RPM spikes to maximum, diagnostic readouts across all 54 faces flash with random telemetry data, a system warning banner appears, and the scene desaturates slightly as if approaching overload.

#### Steps

1. On `'overclock'`: spike ring speed multiplier `1 → 8` over 200ms (very fast).

2. Flash all 54 face edge lines simultaneously at full white brightness for 300ms, then back to normal.

3. All RPM readout chips turn amber/red and display the warning value.

4. Spawn a `<Html>` full-width banner at the top of the scene:
   ```
   ⚠ CORE TEMPERATURE CRITICAL — 847°C — SHUTDOWN IN 5s
   ```
   Monospace red text, dark background, flashing at 500ms intervals.

5. After 5s: trigger the lockdown sequence automatically (`spellsRef.current['lockdown'] = true`).

6. Add a subtle desaturation postprocessing effect during overclock — `<HueSaturation saturation={-0.4} />` from postprocessing, tweened in over 400ms.

---

## Phase 7 — Mode-Exclusive Ambient Features

> These run continuously in the background, reinforcing each mode's identity at idle.

---

### 7.1 QP — Orbiting Magical Sigil Glyphs

**Modes:** Quick Pitch only  
**Type:** Ambient / Animation  
**Complexity:** ●●○○  
**Key APIs:** `drei Text`, orbit math, `AdditiveBlending`

#### Concept
4–6 large runic glyphs orbit the model at radius ~3.5 on tilted planes — like slow satellites. Each rotates on its own axis as it orbits. They glow faintly gold, reinforcing the magical artefact aesthetic at rest.

#### Steps

1. Define 5 glyph orbits: each with a unique orbit plane normal, radius `3.5`, and orbital speed `0.1–0.2 rad/s`.

2. Each glyph: a `<Text>` component with a single rune character, `fontSize={0.6}`, `color="#FFD700"`, `opacity={0.35}`.

3. In `useFrame`: advance orbit angle per glyph; compute 3D position from orbit normal + angle; update `<Text>` position and rotation to face camera.

4. Glyph scale pulses subtly: `0.9 + 0.1 * sin(t * 0.7 + phaseOffset)`.

5. Fade in/out with `modeBlend`: `opacity = 0.35 * (1 - modeBlend)`.

---

### 7.2 QP — Breath Pulse: Organic Idle Animation

**Modes:** Quick Pitch only  
**Type:** Ambient / Animation  
**Complexity:** ●○○○  
**Key APIs:** `useFrame`, sine wave, scale

#### Concept
In Quick Pitch, the entire model breathes — a slow `sin(t * 0.8)` drives a gentle ±3% scale pulse on the root group, and a matching ±8% bloom strength oscillation. Makes the artefact feel alive and conscious.

#### Steps

1. In `useFrame`, when in Quick Pitch mode:
   ```ts
   const breathe = Math.sin(t * 0.8) * 0.03
   groupRef.current.scale.setScalar(1.0 + breathe * (1 - modeBlend))
   ```

2. Sync bloom to breathe:
   ```ts
   bloomRef.current.strength = colors.bloomStrength * (1 + breathe * 0.4) * (1 - modeBlend)
   ```

3. Sync core `uGlowIntensity` to breathe: `25 + breathe * 8 * (1 - modeBlend)`.

4. Keep breathe amplitude at `0.03` — subtle enough to feel organic, not sea-sick.

---

### 7.3 DD — Wireframe Deconstruct on Idle

**Modes:** Deep Dive only  
**Type:** Ambient / Animation  
**Complexity:** ●●●○  
**Key APIs:** `WireframeGeometry`, `ShaderMaterial`, animated opacity, `useFrame`

#### Concept
After 8s of no interaction in Deep Dive, the pyramid faces slowly fade toward transparent, revealing only their wireframes — as if the engineering view dissolves the material surface to expose the mesh topology. Moving the mouse restores opacity.

#### Steps

1. Track last interaction time in `lastInteractionRef = useRef(Date.now())`.

2. Update on pointer move and click.

3. In `useFrame`: compute idle duration; after 8s, lerp face mesh `material.opacity` from `1 → 0.1` over 3s.

4. Simultaneously fade edge line opacity from `0.5 → 1.0` over the same 3s (wireframe becomes prominent as surface disappears).

5. On interaction resume: lerp back to `opacity: 1` over 1s.

6. Only active when `modeBlend > 0.8`.

---

### 7.4 DD — System Vitals Readout Panel

**Modes:** Deep Dive only  
**Type:** UI / Ambient  
**Complexity:** ●●○○  
**Key APIs:** `drei Html`, `useFrame`, FPS counter

#### Concept
A small transparent HUD panel in the top-right of the canvas displays live scene stats: FPS, draw calls, active particles, ring velocities. Looks like a real-time diagnostic overlay — makes the scene feel like a monitored engineering system.

#### Steps

1. In `useFrame`, sample `state.performance.current` and ring speed refs each tick.

2. Throttle panel update to every 200ms (no need for 60fps DOM updates).

3. Render via `<Html>` with `style={{ pointerEvents: 'none' }}` so it doesn't block mouse interaction.

4. Panel content:
   ```
   ■ HEXCORE VITALS
   FPS        58.4
   DRAW CALLS 142
   PARTICLES  400
   RING-1     34.2 RPM
   RING-2     28.9 RPM
   RING-3     19.1 RPM
   MODE       DEEP-DIVE
   ```

5. Style: monospace, cold teal `#4AFFB4` on near-black, 10px font, 0.7 opacity.

6. Only render when `modeBlend > 0.7`.

---

## Architectural Notes

### Flag-ref pattern over React state for spells

Write spell flags into a `useRef` object, not `useState`. State triggers React re-renders; refs are read synchronously every `useFrame` tick.

```ts
// ✅ Correct — no re-renders
spellsRef.current['antigravity on'] = true

// ❌ Avoid — triggers re-render, may cause jank
setActiveSpell('antigravity on')
```

### Single modeBlend ref fans out to everything

Never read `mode === 'quick-pitch'` directly in `useFrame`. Always use `modeBlendRef.current` (0–1) so all transitions are smooth and interruptible — if the user switches mode mid-transition, the blend simply reverses from wherever it currently is.

```ts
// ✅ Smooth, interruptible
const b = modeBlendRef.current
lineMat.color.lerpColors(goldColor, tealColor, b)

// ❌ Hard cut — jarring if switched mid-transition
lineMat.color.set(mode === 'quick-pitch' ? '#FFD700' : '#4AFFB4')
```

### Build the plasma shader before replacing geometry

The `coreRef` mesh already exists. Only swap the material — keep the same `sphereGeometry`. This avoids React reconciler overhead and lets you mutate uniforms directly in `useFrame` without touching JSX.

### LineMaterial vs ShaderMaterial for edges

| Approach | Pros | Cons |
|---|---|---|
| `LineMaterial` (three/addons) | Real screen-pixel width, easy to control | Requires `LineSegments2` + `LineSegmentsGeometry`, different render path |
| `ShaderMaterial` on `lineSegments` | Lighter, stays on standard path | Width limited to 1px on most GPUs |

Choose `LineMaterial` for visible thickness. Use `ShaderMaterial` to stay closer to existing code.

### Particle respawn staggering

Initialize each particle's `age` to `Math.random() * lifetime[i]`, not `0`. If all particles are born at `t=0`, they all die simultaneously — creating a visible flash/gap. Staggered ages enter steady-state immediately.

### Memory hygiene for transient effects

Lightning arcs, EMP meshes, summon circles, and overclock banners are spawned and discarded. Always call `geometry.dispose()` and `material.dispose()` after animations complete.

---

## Dependency Reference

| Package | Version | Used for |
|---|---|---|
| `@react-three/fiber` | ^8 | Core Three.js–React bridge |
| `@react-three/drei` | ^9 | `Html`, `ScrollControls`, `useScroll`, `Text`, `Float` |
| `@react-three/postprocessing` | ^2 | `EffectComposer`, `UnrealBloom`, `SelectiveBloom`, `ChromaticAberration`, `HueSaturation`, `ToneMapping` |
| `@react-spring/three` | ^9 | `useSpring` for shatter/reassembly/antigravity snap |
| `three` | ^0.160 | Core 3D engine |
| `three/addons` | (bundled) | `LineMaterial`, `LineSegments2`, `LineSegmentsGeometry`, `LineGeometry` |
| `glsl-noise` or `ashima/webgl-noise` | latest | Simplex/Perlin noise in GLSL shaders |

### Install command

```bash
npm install @react-three/fiber @react-three/drei @react-three/postprocessing @react-spring/three three
```

---

_Last updated: May 2026_
