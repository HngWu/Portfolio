# HexCore Concentric Rings Transformation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the Concentric Rings surrounding the 3D HexCore in the Bento Grid to eliminate visual striped texture artifacts by implementing dual-layered physical glass and custom runic shaders, gyroscopic resonance motion, secondary GPU-noise particles, lightning snap effects, and completely removing the green plane-intersection resonance line.

**Architecture:** Split the implementation into modular steps:
1.  **Refactoring & Core Cleanup**: Split the three rings into coaxial dual layers. Configure high-transmission physical glass for the outer casings. Completely remove the dynamic green resonance `<line>` mesh and its calculations in the R3F loop.
2.  **Custom GLSL Rune Shaders**: Implement custom runic signed distance/noise shaders inside `PolyhedronCanvas.tsx` for the inner coaxial rings. Wire their colors and emission to react smoothly to `modeProgress` (Gold vs Teal).
3.  **Gyroscopic Motion Resonance**: Code the slow precession axis wobble for idle float, spherical linear interpolation (`slerp`) to project active tracking towards the cursor, and lock the spin rates to precise $1\omega$, $-2\omega$, $3\omega$ harmonic ratios on hover.
4.  **Secondary VFX Integration**: Create and mount `<RunicDustStreams />` (1,500 GPU curl-noise particles) and `<LightningArcs />` (CPU-buffered midpoint lightning snapping) inside the R3F canvas tree.

**Tech Stack:** React Three Fiber (R3F), Three.js, GLSL, GSAP, Zustand.

---

## File Structure & Responsibilities
- Modify: `components/bento/tiles/PolyhedronCanvas.tsx` — Handles the main canvas loop, dual-layered meshes, glass physical materials, custom runic shaders, and the gyroscopic interaction mathematics.
- Create: `components/bento/tiles/hexcore/RunicDustStreams.tsx` — Pre-allocates buffer geometry and renders 1,500 particles using a GPU curl noise vertex shader.
- Create: `components/bento/tiles/hexcore/LightningArcs.tsx` — Manages pre-allocated line segments and calculates CPU-buffered midpoint displacement snaps between rings on alignment overlaps.

---

### Task 1: Coaxial Glass Refactoring & Green Line Removal

**Files:**
- Modify: `components/bento/tiles/PolyhedronCanvas.tsx`

- [ ] **Step 1: Clean up resonance line references and mathematical calculations**
  
  In `components/bento/tiles/PolyhedronCanvas.tsx`, remove the `resonanceLineGeoRef` and `resonancePositions` hooks. Then, delete the mathematical plane-intersection calculation block inside the `useFrame` hook:
  ```typescript
  // REMOVE THIS BLOCK ENTIRELY INSIDE useFrame:
  if (ring1Ref.current && ring2Ref.current && resonanceLineGeoRef.current) {
    const q1 = ring1Ref.current.quaternion
    const q2 = ring2Ref.current.quaternion
    const n1 = new THREE.Vector3(0, 0, 1).applyQuaternion(q1)
    const n2 = new THREE.Vector3(0, 0, 1).applyQuaternion(q2)
    
    const dir = new THREE.Vector3().crossVectors(n1, n2).normalize()
    const p1 = dir.clone().multiplyScalar(-2.3)
    const p2 = dir.clone().multiplyScalar(2.3)
    
    const pts = new Float32Array([p1.x, p1.y, p1.z, p2.x, p2.y, p2.z])
    resonanceLineGeoRef.current.setAttribute('position', new THREE.BufferAttribute(pts, 3))
    resonanceLineGeoRef.current.attributes.position.needsUpdate = true
  }
  ```

- [ ] **Step 2: Remove the `<line>` component from the return structure**
  
  Remove the following code block from the R3F return tree:
  ```xml
  {/* REMOVE THIS BLOCK ENTIRELY FROM JSX: */}
  <line>
    <bufferGeometry ref={resonanceLineGeoRef} />
    <lineBasicMaterial 
      color="#4AFFB4" 
      transparent 
      opacity={sharedSpellState.lockdown ? 0.05 : 0.8}
      blending={THREE.AdditiveBlending} 
      linewidth={2} 
      toneMapped={false}
    />
  </line>
  ```

- [ ] **Step 3: Define outer glass casing materials**
  
  Replace the standard `MeshStandardMaterial` for the three rings with `MeshPhysicalMaterial` templates designed for transmission:
  ```typescript
  const glassMaterialProps = useMemo(() => ({
    transmission: 0.98,
    thickness: 1.8,
    roughness: 0.04,
    ior: 1.65,
    clearcoat: 1.0,
    clearcoatRoughness: 0.02,
    color: new THREE.Color("#0e0b1f"),
    attenuationColor: new THREE.Color("#0c0a1a"),
    attenuationDistance: 0.5,
    envMapIntensity: 2.5,
    metalness: 0.0,
    roughnessMap: null
  }), [])
  ```

- [ ] **Step 4: Construct the double-layered coaxial mesh structures**
  
  Create slightly smaller inner geometries for the suspended rune rings:
  ```typescript
  const { innerRing1Geo, innerRing2Geo, innerRing3Geo } = useMemo(() => {
    return {
      innerRing1Geo: new THREE.TorusGeometry(1.5, 0.28 * 0.84, 16, 100),
      innerRing2Geo: new THREE.TorusGeometry(1.9, 0.28 * 0.84, 16, 100),
      innerRing3Geo: new THREE.TorusGeometry(2.3, 0.22 * 0.84, 16, 100)
    }
  }, [])
  ```
  Mount them coaxially in JSX:
  ```xml
  {/* Ring 1 (X-Y Diagonal) */}
  <group ref={ring1Ref} rotation={[Math.PI / 4, Math.PI / 4, 0]}>
    {/* Inner Holographic Rune Core */}
    <mesh geometry={innerRing1Geo} material={ring1RuneMaterial} />
    {/* Outer Refractive Glass Casing */}
    <mesh geometry={ring1Geo}>
      <meshPhysicalMaterial {...glassMaterialProps} />
    </mesh>
  </group>
  ```
  Repeat this nested layout for `ring2Ref` and `ring3Ref`.

- [ ] **Step 5: Run compilation to ensure geometries and structure build correctly**
  
  Run: `npm run build` or inspect canvas in browser.
  Expected: Severe green line is removed, glass casings are rendering with physical thickness and reflections.

---

### Task 2: Custom GLSL Runic Shaders & Mode Blending

**Files:**
- Modify: `components/bento/tiles/PolyhedronCanvas.tsx`

- [ ] **Step 1: Write Custom Suspended Runes Shader**
  
  Inject the custom GLSL code at the top level of `PolyhedronCanvas.tsx`:
  ```typescript
  const SuspendedRunesShader = {
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      varying vec3 vWorldPosition;
      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewPosition = -mvPosition.xyz;
        vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uRuneColor;
      uniform float uHoverActive;
      uniform float uPulseScale;
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      varying vec3 vWorldPosition;

      float runeNoise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        float n = sin(i.x + i.y * 57.0) * 43758.5453;
        return fract(n);
      }

      void main() {
        float speed = uTime * 1.5;
        float circuit = sin(vUv.x * 35.0 - speed) * cos(vUv.y * 8.0 + sin(uTime));
        float runeMask = pow(abs(circuit), 4.0) * 2.0;
        
        float noiseVal = runeNoise(vWorldPosition.xy * 8.0 + vec2(uTime, -uTime * 0.5));
        runeMask *= (0.4 + 0.6 * noiseVal);
        
        vec3 normal = normalize(vNormal);
        vec3 viewDir = normalize(vViewPosition);
        float fresnel = pow(max(dot(normal, viewDir), 0.0), 2.5);
        
        vec3 glowColor = uRuneColor * (1.2 + uHoverActive * 0.8) * uPulseScale;
        vec3 finalColor = glowColor * runeMask * fresnel;
        float alpha = clamp(runeMask * fresnel * 0.95, 0.0, 1.0);
        
        gl_FragColor = vec4(finalColor, alpha);
      }
    `
  }
  ```

- [ ] **Step 2: Create Material instances with unique uniforms**
  
  Initialize the custom materials inside the component:
  ```typescript
  const ring1Uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uRuneColor: { value: new THREE.Color("#4AFFB4") },
    uHoverActive: { value: 0 },
    uPulseScale: { value: 1.0 }
  }), [])
  // Repeat for ring2Uniforms and ring3Uniforms
  ```

- [ ] **Step 3: Wire mode progress and hover intensities inside the frame loop**
  
  In the `useFrame` hook, update the custom uniforms:
  ```typescript
  const t = state.clock.getElapsedTime()
  const mode = sharedSpellState.modeProgress
  const targetColor = new THREE.Color("#ffe875").lerp(new THREE.Color("#4AFFB4"), mode)

  ring1Uniforms.uTime.value = t
  ring1Uniforms.uRuneColor.value.copy(targetColor)
  ring1Uniforms.uHoverActive.value = THREE.MathUtils.lerp(ring1Uniforms.uHoverActive.value, isHovered ? 1.0 : 0.0, state.delta * 6.0)
  ring1Uniforms.uPulseScale.value = 0.9 + 0.15 * Math.sin(t * 3.5)
  // Repeat updates for ring2Uniforms and ring3Uniforms
  ```

- [ ] **Step 4: Verify GLSL compile checks**
  
  Compile the build: `npm run build`
  Expected: Shaders compile cleanly without dynamic link errors.

---

### Task 3: Gyroscopic Motion Resonance

**Files:**
- Modify: `components/bento/tiles/PolyhedronCanvas.tsx`

- [ ] **Step 1: Code the idle precessional wobble axes**
  
  In `useFrame`, add sinusoidal precession calculations:
  ```typescript
  const p1 = new THREE.Vector3(1.0, 0.2 * Math.sin(0.5 * t), 0.1 * Math.cos(0.3 * t)).normalize()
  const p2 = new THREE.Vector3(-0.2 * Math.cos(0.4 * t), 1.0, 0.3 * Math.sin(0.6 * t)).normalize()
  const p3 = new THREE.Vector3(0.1 * Math.sin(0.7 * t), -0.3 * Math.cos(0.2 * t), 1.0).normalize()
  const currentPrecessedAxes = [p1, p2, p3]
  ```

- [ ] **Step 2: Add Slerp tracking to face active cursor vectors**
  
  Calculate the active pointing target:
  ```typescript
  const cursorVector = new THREE.Vector3(pointer.x * 0.5, pointer.y * 0.5, 1.0).normalize()
  const hoverProgress = sharedSpellState.modeProgress

  refs.forEach((ref, idx) => {
    if (!ref.current) return
    const idleQuat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), currentPrecessedAxes[idx])
    const targetQuat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), cursorVector)
    
    // Smoothly slerp active orientation
    ref.current.quaternion.slerpQuaternions(idleQuat, targetQuat, hoverProgress)
  })
  ```

- [ ] **Step 3: Program harmonic locked spin speeds**
  
  Lock velocities on direct hover ($1\omega, -2\omega, 3\omega$):
  ```typescript
  const baseFreq = 0.8
  const gearRatios = [1.0, -2.0, 3.0]
  
  refs.forEach((ref, idx) => {
    if (!ref.current) return
    const idleSpeed = idx === 1 ? -0.5 : (idx === 2 ? 0.3 : 0.6)
    const targetSpeed = baseFreq * gearRatios[idx]
    const currentSpeed = THREE.MathUtils.lerp(idleSpeed, targetSpeed, hoverProgress)
    
    ref.current.rotateOnAxis(new THREE.Vector3(0, 1, 0), currentSpeed * delta)
  })
  ```

- [ ] **Step 4: Run project build and verify gyroscopic motions**
  
  Verify that rings wobble independently, slerp face tracking on cursor entry, and lock ratios.

---

### Task 4: Secondary VFX Injection

**Files:**
- Create: `components/bento/tiles/hexcore/RunicDustStreams.tsx`
- Create: `components/bento/tiles/hexcore/LightningArcs.tsx`
- Modify: `components/bento/tiles/PolyhedronCanvas.tsx`

- [ ] **Step 1: Create the particle stream component**
  
  Write the complete GPU Curl Noise particles file `components/bento/tiles/hexcore/RunicDustStreams.tsx` using the code block defined in Proposal 3.
  Ensure it accepts `mode` prop and precomputes positions buffer cleanly.

- [ ] **Step 2: Create the lightning discharge component**
  
  Write the midpoint displaced lightning snapping lines file `components/bento/tiles/hexcore/LightningArcs.tsx` using the code block defined in Proposal 3.
  Ensure it updates geometries inside `useFrame` via buffer references safely.

- [ ] **Step 3: Mount secondary effects in Canvas tree**
  
  Inside `PolyhedronCanvas.tsx` return JSX, mount the newly created components right next to the concentric rings:
  ```xml
  <RunicDustStreams mode={isDeepDive ? 'deep-dive' : 'quick-pitch'} />
  <LightningArcs 
    mode={isDeepDive ? 'deep-dive' : 'quick-pitch'} 
    ringARef={ring1Ref} 
    ringBRef={ring2Ref} 
  />
  ```

- [ ] **Step 4: Execute full test build**
  
  Run: `npm run build`
  Expected: Successful production-grade bundle. No TS errors. All assets pass.

---

## Execution Choice
We are ready to start implementing this plan. Please choose how you want to proceed:

**1. Subagent-Driven (recommended)** - I spawn a fresh subagent for each task, inspect their output between tasks, ensuring extremely fast parallel iteration.
**2. Inline Execution** - I execute the tasks sequentially in this active session with review checkpoints.

Which approach would you like to take?
