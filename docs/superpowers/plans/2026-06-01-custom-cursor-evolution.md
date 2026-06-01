# Custom Cursor Evolution Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the 6-stage crystalline-mechanical cursor evolution and 5-state interactive engine based on Cursor.png, synchronized with page scroll, view mode shifts, and the 3D HexCore center artifact.

**Architecture:** We use a state-driven Next.js cursor container that calculates a normalized `u_evolution` progress (using global scroll hooks and Zustand view modes), morphs detailed inline SVGs using GSAP path interpolation, blends Magic amber spell halos and Tech blue diagnostic scanner lines inside a custom WebGL fragment shader, and draws velocity-responsive rune/binary trails on a 2D canvas overlay.

**Tech Stack:** Next.js, React, Tailwind CSS, GSAP, WebGL, Zustand.

---

## Decomposed Tasks

### Task 1: Scroll Tracking Hook & View Mode Synchronization

**Files:**
- Modify: `components/cursor/ArcaneCursor.tsx:24-90`

- [ ] **Step 1: Set up evolution refs and scroll event hook**
  Modify `components/cursor/ArcaneCursor.tsx` to add tracking refs for raw scroll percent, smoothed scroll, and smoothed mode values, along with a window passive scroll listener.
  
  Replace the top section of `export function ArcaneCursor()` with:
  ```typescript
  export function ArcaneCursor() {
    const mode = useViewModeStore((state) => state.mode)
    const isDeep = mode === 'deep'

    const [isActive, setIsActive] = useState(false)
    const [clientPos, setClientPos] = useState({ x: 0, y: 0 })
    const [smoothedPos, setSmoothedPos] = useState({ x: 0, y: 0 })
    const [isHovered, setIsHovered] = useState(false)
    const [hasWebGLFailed, setHasWebGLFailed] = useState(false)
    const [isTouchDevice, setIsTouchDevice] = useState(false)
    const [cursorState, setCursorState] = useState<'default' | 'hover' | 'select' | 'drag' | 'unavailable'>('default')

    // Ref tracking variables for high-performance scroll and mode values
    const scrollProgressRef = useRef(0)
    const smoothScrollRef = useRef(0)
    const smoothModeRef = useRef(isDeep ? 1 : 0)
    const evolutionValRef = useRef(isDeep ? 1 : 0)

    useEffect(() => {
      const checkTouch = () => {
        const isTouch = window.matchMedia("(pointer: coarse)").matches || 'ontouchstart' in window
        setIsTouchDevice(isTouch)
      }
      checkTouch()
    }, [])

    // Track page scroll percentage with passive listener for performance
    useEffect(() => {
      const handleScroll = () => {
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
        if (scrollHeight > 0) {
          scrollProgressRef.current = window.scrollY / scrollHeight
        }
      }
      window.addEventListener('scroll', handleScroll, { passive: true })
      handleScroll()
      return () => window.removeEventListener('scroll', handleScroll)
    }, [])
  ```

- [ ] **Step 2: Add smoothing interpolations in the frame loop**
  Update the main `renderLoop` inside the existing `useEffect` to interpolate `smoothScrollRef`, `smoothModeRef`, and calculate the current `u_evolution` value in each frame.
  
  Locate inside `renderLoop`:
  ```typescript
  smoothedMouseRef.current.x += (mouseRef.current.x - smoothedMouseRef.current.x) * lerpFactor
  smoothedMouseRef.current.y += (mouseRef.current.y - smoothedMouseRef.current.y) * lerpFactor
  ```
  Append below it:
  ```typescript
  // Smoothly interpolate scroll progress and mode values with visual spring-inertia
  smoothScrollRef.current += (scrollProgressRef.current - smoothScrollRef.current) * 0.1
  const targetModeVal = isDeep ? 1.0 : 0.0
  smoothModeRef.current += (targetModeVal - smoothModeRef.current) * 0.12
  
  // u_evolution is the maximum of scroll and deep mode toggle progress
  evolutionValRef.current = Math.max(smoothScrollRef.current, smoothModeRef.current)
  ```

- [ ] **Step 3: Run local type compilation verification**
  Run: `npm run build` or `npx tsc --noEmit`
  Expected: PASS with no compilation errors related to newly added refs.

- [ ] **Step 4: Commit changes**
  ```bash
  git add components/cursor/ArcaneCursor.tsx
  git commit -m "feat(cursor): implement passive scroll hooks and evolution progress state tracking"
  ```

---

### Task 2: Define SVG Morph Path Coordinates & Crystalline Structure SVGs

**Files:**
- Modify: `components/cursor/ArcaneCursor.tsx:480-608`

- [ ] **Step 1: Write static morph path definitions**
  Define standard coordinate paths for all 6 stages and 5 states in `ArcaneCursor.tsx` at the module level.
  
  Add this constant above `export function ArcaneCursor()`:
  ```typescript
  const STAGE_PATHS = {
    step1: "M20 5 L35 25 L25 22 L23 35 L17 35 L15 22 L5 25 Z", // 1. Runic Origin
    step2: "M20 5 L35 25 L25 22 L23 32 L17 32 L15 22 L5 25 Z", // 2. Awakening
    step3: "M20 4 L35 25 L25 22 L27 28 L20 25 L13 28 L15 22 L5 25 Z", // 3. Conduit
    step4: "M20 4 L35 25 L25 22 L20 26 L15 22 L5 25 Z", // 4. Harmonization
    step5: "M20 4 L35 25 L25 22 L20 26 L15 22 L5 25 Z", // 5. Transition
    step6: "M20 3 L36 26 L26 23 L20 27 L14 23 L4 26 Z", // 6. Tech Form
    drag: "M20 2 L38 28 L28 24 L20 34 L12 24 L2 28 Z", // Drag Delta Shape
    unavailable: "M20 4 L34 22 L20 18 L6 22 Z" // Locked Warning Frame
  }
  ```

- [ ] **Step 2: Implement dynamic SVG Morph rendering in the component markup**
  Replace the rendering block of `ArcaneCursor.tsx` (the SVG portion in Magic / Tech modes) with a single unified, responsive SVG wrapper that uses GSAP or direct CSS bindings to interpolate between the structural layers based on `u_evolution` and `cursorState`.
  
  Replace lines 474 to 607 with:
  ```typescript
    // Determine active visual stage based on evolution progress
    const val = evolutionValRef.current
    let activePath = STAGE_PATHS.step1
    let fillOpacity = 0.15
    let strokeColor = "#FFB44A"
    let strokeDash = "3, 3"
    let isMagicStage = val < 0.5
    
    if (cursorState === 'drag') {
      activePath = STAGE_PATHS.drag
      strokeColor = isDeep ? "#4AFFB4" : "#FFB44A"
      fillOpacity = 0.4
      strokeDash = "none"
    } else if (cursorState === 'unavailable') {
      activePath = STAGE_PATHS.unavailable
      strokeColor = "#FF4A6B"
      fillOpacity = 0.2
      strokeDash = "none"
    } else {
      if (val < 0.16) {
        activePath = STAGE_PATHS.step1
        strokeColor = "#FFB44A"
        fillOpacity = 0.15
        strokeDash = "3, 3"
      } else if (val < 0.33) {
        activePath = STAGE_PATHS.step2
        strokeColor = "#FFB44A"
        fillOpacity = 0.3
        strokeDash = "none"
      } else if (val < 0.50) {
        activePath = STAGE_PATHS.step3
        strokeColor = "#FFFBEB"
        fillOpacity = 0.5
        strokeDash = "none"
      } else if (val < 0.66) {
        activePath = STAGE_PATHS.step4
        strokeColor = "#FFB44A"
        fillOpacity = 0.6
        strokeDash = "none"
      } else if (val < 0.83) {
        activePath = STAGE_PATHS.step5
        strokeColor = "#4AFFB4"
        fillOpacity = 0.7
        strokeDash = "none"
      } else {
        activePath = STAGE_PATHS.step6
        strokeColor = "#4AFFB4"
        fillOpacity = 0.8
        strokeDash = "none"
      }
    }

    return (
      <>
        {/* 1. Full-screen Composited 2D Canvas Trail Layer */}
        <canvas 
          ref={canvasTrailRef}
          className="fixed inset-0 pointer-events-none z-[99998] w-screen h-screen"
        />

        {/* 2. Unified Custom Interactive Cursor Core */}
        <div 
          className="fixed pointer-events-none z-[99999] w-[120px] h-[120px]"
          style={{
            left: `${smoothedPos.x}px`,
            top: `${smoothedPos.y}px`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          {/* WebGL Shader Layer (Renders glowing holographic plasma/rings behind the pointer) */}
          {!hasWebGLFailed && (
            <canvas
              ref={canvasWebGLRef}
              className="absolute inset-0 w-full h-full"
              style={{ width: '120px', height: '120px' }}
            />
          )}

          {/* SVG Arrowhead Core Layer */}
          <div 
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{
              transform: cursorState === 'hover' 
                ? 'scale(1.25)' 
                : cursorState === 'select' 
                  ? 'scale(0.85)' 
                  : 'scale(1.0)',
              transition: 'transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}
          >
            {/* Concentric diagnostics target brackets (shown on hover or tech state) */}
            {cursorState === 'hover' && (
              <div 
                className="absolute w-[46px] h-[46px] border rounded-full animate-spin transition-all duration-300"
                style={{
                  borderColor: isDeep ? 'rgba(74, 255, 180, 0.6)' : 'rgba(255, 180, 74, 0.6)',
                  borderStyle: 'dashed',
                  animationDuration: '6s',
                  boxShadow: isDeep ? '0 0 10px rgba(74, 255, 180, 0.3)' : '0 0 10px rgba(255, 180, 74, 0.3)'
                }}
              />
            )}

            <svg 
              width="40" 
              height="40" 
              viewBox="0 0 40 40" 
              fill="none" 
              className="drop-shadow-[0_0_8px_rgba(255,255,255,0.2)] transition-transform duration-200"
              style={{ 
                transform: cursorState === 'drag' ? 'rotate(0deg)' : 'rotate(-22.5deg)',
                transformOrigin: '50% 50%' 
              }}
            >
              {/* Outer Casing / Outer Plate */}
              <path 
                d={activePath} 
                fill={isMagicStage ? `rgba(255, 180, 74, ${fillOpacity})` : "#C5A059"} 
                stroke={strokeColor} 
                strokeWidth={cursorState === 'hover' ? "2" : "1.5"}
                strokeDasharray={strokeDash}
                style={{ transition: 'd 0.3s ease-out, fill 0.3s, stroke 0.3s' }}
              />
              
              {/* Sliding Steel Core Plate (Stages 4-6) */}
              {!isMagicStage && cursorState !== 'unavailable' && (
                <path 
                  d="M20 7 L31 21 L23 19 L20 22 L17 19 L9 21 Z" 
                  fill="#4F5D6B" 
                  stroke={cursorState === 'hover' ? "#4AFFB4" : "rgba(255,255,255,0.2)"}
                  strokeWidth="1"
                  style={{ transition: 'fill 0.3s, stroke 0.3s' }}
                />
              )}

              {/* Glowing Core Crystal */}
              {cursorState !== 'unavailable' && (
                <circle 
                  cx="20" 
                  cy="14" 
                  r={activePath === STAGE_PATHS.step6 ? "3" : "2.5"} 
                  fill={isMagicStage ? "#FFB44A" : "#4AFFB4"} 
                  className="animate-pulse"
                  style={{ 
                    filter: isMagicStage ? 'drop-shadow(0 0 3px #FFB44A)' : 'drop-shadow(0 0 4px #4AFFB4)',
                    transition: 'fill 0.3s'
                  }}
                />
              )}

              {/* Unavailable lock cross bars */}
              {cursorState === 'unavailable' && (
                <>
                  <line x1="12" y1="20" x2="28" y2="20" stroke="#FF4A6B" strokeWidth="2" />
                  <line x1="20" y1="12" x2="20" y2="28" stroke="#FF4A6B" strokeWidth="2" />
                </>
              )}
            </svg>
          </div>
          
          {/* Preload fonts */}
          <div 
            className="absolute opacity-0 pointer-events-none -z-50 select-none"
            style={{ fontFamily: 'NotoSansRunic-Regular' }}
          >
            ᚠ
          </div>
        </div>
      </>
    )
  ```

- [ ] **Step 3: Test compilation**
  Run: `npm run build` or `npx tsc --noEmit`
  Expected: PASS.

- [ ] **Step 4: Commit changes**
  ```bash
  git add components/cursor/ArcaneCursor.tsx
  git commit -m "feat(cursor): implement 6-stage morphing SVGs and mechanical casing structures"
  ```

---

### Task 3: Upgrade WebGL Fragment Shader to Blend Auras

**Files:**
- Modify: `components/cursor/ArcaneCursor.tsx:265-334`

- [ ] **Step 1: Write unified dual-blend fragment shader**
  Modify the WebGL fragment shader source in `components/cursor/ArcaneCursor.tsx` to handle blending the Magic Spell Grid (amber radial glows) with Tech Diagnostics Scanlines (blue concentric target dashes) using the normalized `u_evolution` value.
  
  Replace lines 269 to 334 (`const fsSource = ...`) with:
  ```typescript
      // FS Code: Cinematic dynamic dual shaders (Stable gold halo + Scanline Deep/Dark blue HUD rings)
      const fsSource = `
        precision mediump float;
        varying vec2 vUv;
        uniform float u_time;
        uniform float u_hover;
        uniform float u_evolution;

        void main() {
          vec2 uv = vUv - 0.5;
          float dist = length(uv);
          
          // Output soft master circle mask
          float mask = smoothstep(0.5, 0.35, dist);
          
          // --- 1. MAGIC SHADER (Quick Pitch Amber Glow) ---
          vec3 magicCore = vec3(1.0, 0.95, 0.78);   // Glowing light gold #FEF3C7
          vec3 magicMid = vec3(0.98, 0.75, 0.14);    // Warm gold #FBBF24
          vec3 magicOuter = vec3(0.96, 0.62, 0.04);  // Amber #F59E0B
          
          vec3 magicColor = mix(magicOuter, magicMid, dist * 2.0);
          magicColor = mix(magicColor, magicCore, pow(1.0 - dist * 2.0, 2.0));
          
          float magicGlow = 0.10 / (dist + 0.035) * (1.0 + 0.15 * sin(u_time * 3.5));
          magicColor += magicMid * magicGlow;
          
          float magicAlpha = smoothstep(0.45, 0.1, dist) * 0.45;
          vec4 magicFinal = vec4(magicColor, magicAlpha);
          
          // --- 2. TECH SHADER (Deep Dive Royal Blue HUD Scanlines) ---
          vec3 techColor = vec3(0.0, 0.2, 0.85);  // Deep Dark Blue #0033DD
          vec3 techCore = vec3(0.0, 0.55, 1.0);    // Glowing Royal Blue #0088FF
          
          float hoverSpeed = 1.0 + u_hover * 2.0;
          float tTime = u_time * 2.5 * hoverSpeed;
          
          float ring1 = abs(sin(dist * 25.0 - tTime)) * 0.8;
          float ring2 = smoothstep(0.40, 0.38, dist) * smoothstep(0.36, 0.38, dist);
          
          float coreIntensity = 0.04 / (dist + 0.015);
          vec3 techFinalColor = mix(techColor, techCore, ring1 * 0.5 + ring2 * 0.8);
          techFinalColor += techCore * coreIntensity;
          
          float techAlpha = (ring1 * 0.25 + ring2 * 0.6 + coreIntensity * 0.4) * mask;
          vec4 techFinal = vec4(techFinalColor, techAlpha);
          
          // --- 3. CINEMATIC EVOLUTIONARY INTERPOLATED TRANSITION ---
          vec4 finalColor = mix(magicFinal, techFinal, u_evolution);
          
          gl_FragColor = finalColor * mask * (0.8 + 0.2 * u_hover);
        }
      `;
  ```

- [ ] **Step 2: Pass evolution uniform**
  Find the uniform location and pass the evolution ref value in each draw step.
  
  Locate lines 395-398:
  ```typescript
      // Retrieve uniform references
      const timeLoc = gl.getUniformLocation(program, 'u_time')
      const hoverLoc = gl.getUniformLocation(program, 'u_hover')
      const transitionLoc = gl.getUniformLocation(program, 'u_transition')
  ```
  Replace with:
  ```typescript
      // Retrieve uniform references
      const timeLoc = gl.getUniformLocation(program, 'u_time')
      const hoverLoc = gl.getUniformLocation(program, 'u_hover')
      const evolutionLoc = gl.getUniformLocation(program, 'u_evolution')
  ```
  
  Locate lines 420-423 inside `render()` loop:
  ```typescript
        const elapsedSeconds = (Date.now() - startTimeRef.current) / 1000.0
        gl.uniform1f(timeLoc, elapsedSeconds)
        gl.uniform1f(hoverLoc, hoverValRef.current)
        gl.uniform1f(transitionLoc, transitionValRef.current)
  ```
  Replace with:
  ```typescript
        const elapsedSeconds = (Date.now() - startTimeRef.current) / 1000.0
        gl.uniform1f(timeLoc, elapsedSeconds)
        gl.uniform1f(hoverLoc, hoverValRef.current)
        gl.uniform1f(evolutionLoc, evolutionValRef.current)
  ```

- [ ] **Step 3: Run typescript check**
  Run: `npm run build` or `npx tsc --noEmit`
  Expected: PASS.

- [ ] **Step 4: Commit changes**
  ```bash
  git add components/cursor/ArcaneCursor.tsx
  git commit -m "feat(cursor): bind WebGL fragment shaders to dynamic evolution value uniform"
  ```

---

### Task 4: Upgrade 2D Canvas Trail Particle Loop (Runes & Binary Traces)

**Files:**
- Modify: `components/cursor/ArcaneCursor.tsx:142-220`

- [ ] **Step 1: Update trail updates and rendering with morph paths**
  Modify the particle updating loop in the canvas drawing logic to handle Norse Runes (Magic Mode) vs Binary Circuit Trails (Tech Mode) dynamically based on `evolutionValRef.current`.
  
  Replace lines 151 to 182 with:
  ```typescript
            const isMagicStage = evolutionValRef.current < 0.5
            
            if (isMagicStage) {
              // Magic: undulating sine-wave drifts (runic floating feel)
              p.x += p.vx + Math.sin(time * 0.008 + p.id) * 0.4
              p.y += p.vy + Math.cos(time * 0.008 + p.id) * 0.4
              p.rotation += p.rotationSpeed * 0.016
            } else {
              // Tech: linear velocity decay following rigid horizontal/vertical traces
              p.x += p.vx
              p.y += p.vy
            }

            // Draw the glowing trail particle
            ctx.save()
            ctx.translate(p.x, p.y)
            if (isMagicStage) {
              ctx.rotate(p.rotation)
            }

            // Set emissive glows (Royal Blue/Cyan for Tech; Golden/Amber for Magic)
            ctx.shadowBlur = p.size * 1.5
            ctx.shadowColor = isMagicStage ? '#FBBF24' : '#4AFFB4'

            ctx.font = `${p.size}px ${isMagicStage ? 'NotoSansRunic-Regular, monospace' : 'monospace'}`
            ctx.fillStyle = isMagicStage 
              ? `rgba(245, 158, 11, ${p.opacity})` // Golden-amber runes
              : `rgba(74, 255, 180, ${p.opacity})` // Cyan-mint binary
            
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText(p.char, 0, 0)
            ctx.restore()
  ```

- [ ] **Step 2: Update particle spawner pool**
  Update particle spawner in lines 194 to 210 to utilize the correct character pools based on active evolution.
  
  Replace lines 194 to 210 with:
  ```typescript
            const isMagicStage = evolutionValRef.current < 0.5
            const charPool = isMagicStage ? RUNES : BINARY
            const randomChar = charPool[Math.floor(Math.random() * charPool.length)]

            const newParticle: Particle = {
              id: particleIdCounter.current,
              x: smoothedMouseRef.current.x,
              y: smoothedMouseRef.current.y,
              vx: -velocityRef.current.x * 0.25 + (Math.random() - 0.5) * 1.5,
              vy: -velocityRef.current.y * 0.25 + (Math.random() - 0.5) * 1.5,
              rotation: Math.random() * Math.PI * 2,
              rotationSpeed: (Math.random() - 0.5) * 2.5,
              size: isMagicStage ? 9 + Math.random() * 5 : 7 + Math.random() * 4,
              opacity: 1.0,
              age: 0,
              maxAge: isMagicStage ? 0.8 + Math.random() * 0.5 : 0.5 + Math.random() * 0.4,
              char: randomChar
            }
  ```

- [ ] **Step 3: Run typescript verification**
  Run: `npm run build` or `npx tsc --noEmit`
  Expected: PASS.

- [ ] **Step 4: Commit changes**
  ```bash
  git add components/cursor/ArcaneCursor.tsx
  git commit -m "feat(cursor): update 2D canvas trails to morph between runes and high-speed binary coordinates"
  ```

---

### Task 5: Implement Interactive Cursor State Engine (Default, Hover, Select, Drag, Unavailable)

**Files:**
- Modify: `components/cursor/ArcaneCursor.tsx:82-99`

- [ ] **Step 1: Set up unified event listeners for state management**
  Configure window event listeners inside `ArcaneCursor.tsx` to delegately capture hover targets, click compressions (`select`), drag states, and warning triggers (`unavailable`).
  
  Replace the tracking `useEffect` (lines 82 to 98) with:
  ```typescript
    useEffect(() => {
      const trackCoords = (e: MouseEvent) => {
        mouseRef.current.x = e.clientX
        mouseRef.current.y = e.clientY
        setClientPos({ x: e.clientX, y: e.clientY })
        
        const target = e.target as HTMLElement | null
        if (target) {
          // 1. Check for locked / disabled items (Unavailable State)
          const isLocked = target.closest('disabled, [disabled], .cursor-not-allowed, [data-locked="true"]') !== null
          if (isLocked) {
            setCursorState('unavailable')
            setIsHovered(false)
            return
          }

          // 2. Check for drag triggers (Drag State)
          const isDraggable = target.closest('[draggable="true"], .draggable, [data-drag="true"]') !== null
          if (isDraggable) {
            setCursorState('drag')
            setIsHovered(false)
            return
          }

          // 3. Check for standard clickable items (Hover State)
          const isInteractive = target.closest('a, button, [role="button"], [data-hover-glow], [data-interactive], .cursor-pointer') !== null
          setIsHovered(isInteractive)
          setCursorState(isInteractive ? 'hover' : 'default')
        }
      }

      const handleMouseDown = () => {
        setCursorState('select')
      }

      const handleMouseUp = (e: MouseEvent) => {
        // Trigger Canvas shockwave spawn
        triggerShockwave(e.clientX, e.clientY)
        
        // Re-evaluate current state
        const target = e.target as HTMLElement | null
        if (target) {
          const isInteractive = target.closest('a, button, [role="button"], [data-hover-glow], [data-interactive]') !== null
          setCursorState(isInteractive ? 'hover' : 'default')
        } else {
          setCursorState('default')
        }
      }

      window.addEventListener('mousemove', trackCoords)
      window.addEventListener('mousedown', handleMouseDown)
      window.addEventListener('mouseup', handleMouseUp)
      
      return () => {
        window.removeEventListener('mousemove', trackCoords)
        window.removeEventListener('mousedown', handleMouseDown)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }, [])
  ```

- [ ] **Step 2: Implement triggerShockwave function**
  Add the shockwave particle trigger function above the rendering block to draw a expanding circle in the 2D Canvas on select.
  
  Add inside `ArcaneCursor`:
  ```typescript
    const triggerShockwave = (x: number, y: number) => {
      const isMagicStage = evolutionValRef.current < 0.5
      particleIdCounter.current += 1
      const shockwaveParticle: Particle = {
        id: particleIdCounter.current,
        x: x,
        y: y,
        vx: 0,
        vy: 0,
        rotation: 0,
        rotationSpeed: 0,
        size: 15, // represents initial radius
        opacity: 1.0,
        age: 0,
        maxAge: 0.35, // short lifespan
        char: "◯" // circular shockwave
      }
      particlesRef.current.push(shockwaveParticle)
    }
  ```

- [ ] **Step 3: Run full local compilation**
  Run: `npm run build` or `npx tsc --noEmit`
  Expected: PASS.

- [ ] **Step 4: Commit changes**
  ```bash
  git add components/cursor/ArcaneCursor.tsx
  git commit -m "feat(cursor): implement interactive cursor state engine and click shockwave dynamics"
  ```

---

### Task 6: Wire Proximity and Command Link to 3D HexCore

**Files:**
- Modify: `components/cursor/ArcaneCursor.tsx:100-130`
- Modify: `components/bento/tiles/PolyhedronCanvas.tsx:1030-1045`

- [ ] **Step 1: Implement HexCore scroll ejection trigger**
  Add threshold listener inside `ArcaneCursor.tsx` scroll effect to fire `window.__hexcore_cmd('eject_rune')` on scroll boundaries.
  
  Add inside `ArcaneCursor` scroll `useEffect`:
  ```typescript
    const hasEjected = useRef(false)
    useEffect(() => {
      const handleScroll = () => {
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
        if (scrollHeight > 0) {
          const currentProgress = window.scrollY / scrollHeight
          scrollProgressRef.current = currentProgress
          
          // Trigger ejection threshold command at 15% scroll
          if (currentProgress > 0.15 && !hasEjected.current) {
            hasEjected.current = true
            if (typeof window !== 'undefined' && (window as any).__hexcore_cmd) {
              (window as any).__hexcore_cmd('eject_rune')
            }
          } else if (currentProgress < 0.08) {
            hasEjected.current = false // reset on top scroll
          }
        }
      }
      window.addEventListener('scroll', handleScroll, { passive: true })
      return () => window.removeEventListener('scroll', handleScroll)
    }, [])
  ```

- [ ] **Step 2: Support proximity snapping listener in HexCore**
  Locate `PolyhedronCanvas.tsx:1030-1045` or search where cursor tracking vector is used. Compute and snap lightning snaps inside `LightningArcs.tsx` on overlap bounds.
  
  Locate:
  ```typescript
  // Capture coordinates for proximity snaps
  ```
  Ensure `sharedSpellState` contains cursor positions so the displacement mathematics snaps lightning arcs when `cursor` enters `< 150px` radius from hexcore center.

- [ ] **Step 3: Perform final test build check**
  Run: `npm run build` or `npx tsc --noEmit`
  Expected: PASS with 100% clean output.

- [ ] **Step 4: Commit and finalize**
  ```bash
  git add components/cursor/ArcaneCursor.tsx components/bento/tiles/PolyhedronCanvas.tsx
  git commit -m "feat(hexcore): wire cursor proximity snapping and scroll rune ejection bindings"
  ```
