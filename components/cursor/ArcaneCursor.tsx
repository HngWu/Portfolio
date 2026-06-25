"use client"

import React, { useEffect, useRef, useState } from 'react'
import { useViewModeStore } from '@/store/useViewModeStore'

interface Particle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  rotation: number
  rotationSpeed: number
  size: number
  opacity: number
  age: number
  maxAge: number
  char: string
}

interface ClickEffect {
  id: number
  x: number
  y: number
  age: number
  maxAge: number
  isDeep: boolean
}

const RUNES = ["ᚠ", "ᚢ", "ᚦ", "ᚨ", "ᚱ", "ᚲ", "ᚷ", "ᚹ", "ᚺ", "ᚾ", "ᛁ", "ᛃ", "ᛇ", "ᛈ", "ᛉ", "ᛊ"]
const BINARY = ["0", "1"]

export function ArcaneCursor() {
  const mode = useViewModeStore((state) => state.mode)
  const isDeep = mode === 'deep'

  const [isActive, setIsActive] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [hasWebGLFailed, setHasWebGLFailed] = useState(false)
  const [isTouchDevice, setIsTouchDevice] = useState(false)

  const cursorRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const checkTouch = () => {
      // Only disable custom cursor on small mobile/tablet screens (< 768px)
      // This prevents hybrid touchscreen laptops from losing their cursor
      setIsTouchDevice(window.innerWidth < 768)
    }
    checkTouch()
    window.addEventListener('resize', checkTouch)
    return () => window.removeEventListener('resize', checkTouch)
  }, [])

  // Refs for tracking mouse position and velocity
  const mouseRef = useRef({ x: 0, y: 0 })
  const smoothedMouseRef = useRef({ x: 0, y: 0 })
  const velocityRef = useRef({ x: 0, y: 0 })
  const lastSpawnPos = useRef({ x: 0, y: 0 })

  // 2D Canvas Trail Ref
  const canvasTrailRef = useRef<HTMLCanvasElement | null>(null)
  const particlesRef = useRef<Particle[]>([])
  const particleIdCounter = useRef(0)

  // Click Effect Refs
  const clickEffectsRef = useRef<ClickEffect[]>([])
  const clickIdCounter = useRef(0)

  // Sprite caching for particle optimization
  const runeSpritesRef = useRef<Record<string, HTMLCanvasElement>>({})
  const maxParticlesRef = useRef(45)
  const clickProgressRef = useRef(1.0) // 1.0 means shockwave finished

  // Cap particles based on hardware capability
  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      const cores = navigator.hardwareConcurrency || 4
      maxParticlesRef.current = cores < 4 ? 20 : 45
    }
  }, [])

  // Clear sprite cache when fonts load to ensure fallback text isn't cached permanently
  useEffect(() => {
    if (typeof document !== 'undefined' && document.fonts) {
      document.fonts.ready.then(() => {
        runeSpritesRef.current = {}
      })
    }
  }, [])

  const getRuneSprite = (char: string, isDeepMode: boolean): HTMLCanvasElement => {
    const key = `${char}_${isDeepMode ? 'tech' : 'magic'}`
    if (runeSpritesRef.current[key]) {
      return runeSpritesRef.current[key]
    }

    const canvas = document.createElement('canvas')
    const size = 64
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')

    if (ctx) {
      ctx.imageSmoothingEnabled = true
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      
      // Draw baked glow shadow
      ctx.shadowBlur = 12
      ctx.shadowColor = isDeepMode ? '#0044FF' : '#A16C07'
      ctx.fillStyle = isDeepMode ? '#0088FF' : '#D97706' // slightly brighter base color for better contrast
      
      ctx.font = `32px ${isDeepMode ? 'monospace' : 'NotoSansRunic-Regular, monospace'}`
      ctx.fillText(char, size / 2, size / 2)
    }

    runeSpritesRef.current[key] = canvas
    return canvas
  }

  // WebGL Shader Refs
  const canvasWebGLRef = useRef<HTMLCanvasElement | null>(null)
  const glRef = useRef<WebGLRenderingContext | null>(null)
  const programRef = useRef<WebGLProgram | null>(null)
  const animationWebGLRef = useRef<number | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const hoverValRef = useRef<number>(0)
  const transitionValRef = useRef<number>(isDeep ? 1 : 0)

  const isHoveredRef = useRef(isHovered)
  const isDeepRef = useRef(isDeep)

  // Optimization Refs
  const lastTargetRef = useRef<HTMLElement | null>(null)
  // Seeded on mount (not during render) so the first mouse-move "stale" check
  // has a sensible baseline timestamp. Reading/writing refs during render is
  // disallowed by react-hooks, so this lives in an effect.
  const lastMouseMoveTimeRef = useRef<number>(0)
  useEffect(() => {
    lastMouseMoveTimeRef.current = Date.now()
  }, [])
  const start2DLoopRef = useRef<(() => void) | null>(null)
  const startWebGLRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    isHoveredRef.current = isHovered
  }, [isHovered])

  useEffect(() => {
    isDeepRef.current = isDeep
  }, [isDeep])

  // 1. Activate custom cursor on mouse movement
  useEffect(() => {
    const activateCustomCursor = () => {
      setIsActive(true)
      window.removeEventListener('mousemove', activateCustomCursor)
      window.removeEventListener('touchstart', activateCustomCursor)
    }

    window.addEventListener('mousemove', activateCustomCursor)
    window.addEventListener('touchstart', activateCustomCursor)

    return () => {
      window.removeEventListener('mousemove', activateCustomCursor)
      window.removeEventListener('touchstart', activateCustomCursor)
    }
  }, [])

  // 1.1 Manage body class based on active state and touch device settings
  useEffect(() => {
    if (isActive && !isTouchDevice) {
      document.body.classList.add('custom-cursor-active')
    } else {
      document.body.classList.remove('custom-cursor-active')
    }
    return () => {
      document.body.classList.remove('custom-cursor-active')
    }
  }, [isActive, isTouchDevice])

  // 2. Track real-time mouse coordinate and stashes coordinates/target to defer DOM walks
  useEffect(() => {
    const trackCoords = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX
      mouseRef.current.y = e.clientY
      lastTargetRef.current = e.target as HTMLElement | null
      lastMouseMoveTimeRef.current = Date.now()

      // Resume loops if they are idle
      if (start2DLoopRef.current) start2DLoopRef.current()
      if (startWebGLRef.current) startWebGLRef.current()
    }

    const trackActivity = () => {
      lastMouseMoveTimeRef.current = Date.now()
      if (start2DLoopRef.current) start2DLoopRef.current()
      if (startWebGLRef.current) startWebGLRef.current()
    }

    window.addEventListener('mousemove', trackCoords)
    window.addEventListener('mousedown', trackActivity)
    window.addEventListener('touchstart', trackActivity)
    window.addEventListener('wheel', trackActivity, { passive: true })
    window.addEventListener('scroll', trackActivity, { passive: true })

    return () => {
      window.removeEventListener('mousemove', trackCoords)
      window.removeEventListener('mousedown', trackActivity)
      window.removeEventListener('touchstart', trackActivity)
      window.removeEventListener('wheel', trackActivity)
      window.removeEventListener('scroll', trackActivity)
    }
  }, [])

  // 2.1 Listen for click events to spawn interactive burst particles
  useEffect(() => {
    if (!isActive) return
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return
      clickIdCounter.current += 1
      clickEffectsRef.current.push({
        id: clickIdCounter.current,
        x: e.clientX,
        y: e.clientY,
        age: 0,
        maxAge: 0.5, // 500ms duration
        isDeep: isDeep
      })

      // Trigger WebGL shockwave
      clickProgressRef.current = 0.0

      // Spawn radial burst particles in the main trail loop
      const particleCount = isDeep ? 8 : 12
      const angleStep = (Math.PI * 2) / particleCount
      const charPool = isDeep ? BINARY : RUNES

      for (let i = 0; i < particleCount; i++) {
        const angle = angleStep * i
        const speed = isDeep ? 3 + Math.random() * 4 : 2 + Math.random() * 3
        particlesRef.current.push({
          id: ++particleIdCounter.current,
          x: e.clientX,
          y: e.clientY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 5,
          size: isDeep ? 7 + Math.random() * 4 : 9 + Math.random() * 5,
          opacity: 1.0,
          age: 0,
          maxAge: isDeep ? 0.3 + Math.random() * 0.3 : 0.4 + Math.random() * 0.4,
          char: charPool[Math.floor(Math.random() * charPool.length)]
        })
      }
    }

    window.addEventListener('mousedown', handleMouseDown)
    return () => window.removeEventListener('mousedown', handleMouseDown)
  }, [isActive, isDeep])

  // 3. Keep full-screen 2D particle trail canvas sized correctly
  useEffect(() => {
    if (!isActive) return
    const resizeCanvas = () => {
      const canvas = canvasTrailRef.current
      if (canvas) {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
      }
    }
    window.addEventListener('resize', resizeCanvas)
    resizeCanvas()
    return () => window.removeEventListener('resize', resizeCanvas)
  }, [isActive])

  // 4. Smooth visual coordinate interpolation & 2D trail particle loop
  useEffect(() => {
    if (!isActive) return
    let animationFrameId: number | null = null
    let isLoopRunning = false

    const renderLoop = (time: number) => {
      // 1. Evaluate hover state & magnetic snap
      const target = lastTargetRef.current
      let isInteractive = false
      let shouldSnap = false
      let snapCenter = { x: 0, y: 0 }

      if (target) {
        const interactiveEl = target.closest('a, button, [role="button"], [data-hover-glow], [data-interactive], [data-id], .cursor-pointer') as HTMLElement | null
        isInteractive = interactiveEl !== null
        
        if (interactiveEl) {
          const rect = interactiveEl.getBoundingClientRect()
          const hasExplicitMagnetic = interactiveEl.hasAttribute('data-magnetic') || interactiveEl.closest('[data-magnetic]') !== null
          const isSmallElement = rect.width < 120 && rect.height < 120
          
          if (hasExplicitMagnetic || isSmallElement) {
            shouldSnap = true
            snapCenter = {
              x: rect.left + rect.width / 2,
              y: rect.top + rect.height / 2
            }
          }
        }
      }

      // Defer React re-renders: only update isHovered state when it actually flips
      if (isInteractive !== isHoveredRef.current) {
        isHoveredRef.current = isInteractive
        setIsHovered(isInteractive)
      }

      // Visual inertia: smoother LERP on hover for precise feel
      const lerpFactor = isHoveredRef.current ? 0.28 : 0.18
      const lastX = smoothedMouseRef.current.x
      const lastY = smoothedMouseRef.current.y

      // Magnetic center interpolation
      const targetX = shouldSnap 
        ? snapCenter.x + (mouseRef.current.x - snapCenter.x) * 0.35
        : mouseRef.current.x
      const targetY = shouldSnap 
        ? snapCenter.y + (mouseRef.current.y - snapCenter.y) * 0.35
        : mouseRef.current.y

      smoothedMouseRef.current.x += (targetX - smoothedMouseRef.current.x) * lerpFactor
      smoothedMouseRef.current.y += (targetY - smoothedMouseRef.current.y) * lerpFactor

      // Velocity calculation
      const vx = smoothedMouseRef.current.x - lastX
      const vy = smoothedMouseRef.current.y - lastY
      velocityRef.current.x = vx
      velocityRef.current.y = vy

      // Direct DOM transform: translate3d + velocity-reactive stretch
      if (cursorRef.current) {
        const x = smoothedMouseRef.current.x
        const y = smoothedMouseRef.current.y
        const speed = Math.hypot(vx, vy)
        
        if (speed > 0.5 && !shouldSnap) {
          const angle = Math.atan2(vy, vx)
          const stretch = Math.min(1 + speed * 0.015, 1.35)
          cursorRef.current.style.transform = `translate3d(${x - 45}px, ${y - 45}px, 0) rotate(${angle}rad) scaleX(${stretch}) rotate(${-angle}rad)`
        } else {
          cursorRef.current.style.transform = `translate3d(${x - 45}px, ${y - 45}px, 0)`
        }
      }

      // 2. Idle Throttling
      const isIdle = (Date.now() - lastMouseMoveTimeRef.current) > 2000
      const hasActiveVisuals = particlesRef.current.length > 0 || clickEffectsRef.current.length > 0

      if (isIdle && !hasActiveVisuals) {
        isLoopRunning = false
        animationFrameId = null
        return // Stop requesting animation frames to save idle CPU/GPU
      }

      // 3. Draw particle trails on the 2D Canvas
      const canvas = canvasTrailRef.current
      const ctx = canvas?.getContext('2d')
      if (canvas && ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.globalCompositeOperation = 'screen' // Additive blending for glows

        const isDeepMode = isDeepRef.current

        // Update and draw active particles
        particlesRef.current.forEach((p) => {
          p.age += 0.016
          p.opacity = Math.max(0, 1.0 - p.age / p.maxAge)

          // Drag / deceleration friction
          p.vx *= 0.95
          p.vy *= 0.95

          if (!isDeepMode) {
            // Magic: undulating sine-wave drifts (runic floating feel)
            p.x += p.vx + Math.sin(time * 0.008 + p.id) * 0.4
            p.y += p.vy + Math.cos(time * 0.008 + p.id) * 0.4
            p.rotation += p.rotationSpeed * 0.016
          } else {
            // Tech: linear velocity decay
            p.x += p.vx
            p.y += p.vy
          }

          // Draw the glowing trail particle using cache (NO shadowBlur in loop!)
          ctx.save()
          ctx.translate(p.x, p.y)
          if (!isDeepMode) {
            ctx.rotate(p.rotation)
          }

          ctx.globalAlpha = p.opacity
          const sprite = getRuneSprite(p.char, isDeepMode)
          // Draw centered sprite
          ctx.drawImage(sprite, -p.size, -p.size, p.size * 2, p.size * 2)
          ctx.restore()
        })

        // Remove expired particles
        particlesRef.current = particlesRef.current.filter(p => p.age < p.maxAge)

        // Update and draw active click effects
        clickEffectsRef.current.forEach((effect) => {
          effect.age += 0.016
          const p = Math.min(1.0, effect.age / effect.maxAge)
          const opacity = 1.0 - p

          ctx.save()
          ctx.globalCompositeOperation = 'screen'

          if (!effect.isDeep) {
            // Magic Mode: Hexagram Fracture
            const radius = 10 + p * 50 // expand outward
            const angle = p * Math.PI // rotate as it expands
            
            ctx.strokeStyle = `rgba(161, 108, 7, ${opacity})`
            ctx.lineWidth = 1.5
            ctx.shadowBlur = 10 * opacity
            ctx.shadowColor = '#A16C07'

            // Equilateral Triangle 1 (pointing up)
            ctx.beginPath()
            for (let i = 0; i < 3; i++) {
              const theta = angle + (i * 2 * Math.PI / 3) - Math.PI / 2
              const hx = effect.x + radius * Math.cos(theta)
              const hy = effect.y + radius * Math.sin(theta)
              if (i === 0) ctx.moveTo(hx, hy)
              else ctx.lineTo(hx, hy)
            }
            ctx.closePath()
            ctx.stroke()

            // Equilateral Triangle 2 (pointing down)
            ctx.beginPath()
            for (let i = 0; i < 3; i++) {
              const theta = angle + (i * 2 * Math.PI / 3) + Math.PI / 2
              const hx = effect.x + radius * Math.cos(theta)
              const hy = effect.y + radius * Math.sin(theta)
              if (i === 0) ctx.moveTo(hx, hy)
              else ctx.lineTo(hx, hy)
            }
            ctx.closePath()
            ctx.stroke()

          } else {
            // Tech Mode: HUD Bracket Burst
            const radius = 15 + p * 45 // expand outward
            const len = 6 // length of bracket arms
            
            ctx.strokeStyle = `rgba(59, 130, 246, ${opacity})`
            ctx.lineWidth = 1.5
            ctx.shadowBlur = 8 * opacity
            ctx.shadowColor = '#0055FF'

            ctx.beginPath()
            // Top-Left Corner
            ctx.moveTo(effect.x - radius, effect.y - radius + len)
            ctx.lineTo(effect.x - radius, effect.y - radius)
            ctx.lineTo(effect.x - radius + len, effect.y - radius)

            // Top-Right Corner
            ctx.moveTo(effect.x + radius, effect.y - radius + len)
            ctx.lineTo(effect.x + radius, effect.y - radius)
            ctx.lineTo(effect.x + radius - len, effect.y - radius)

            // Bottom-Left Corner
            ctx.moveTo(effect.x - radius, effect.y + radius - len)
            ctx.lineTo(effect.x - radius, effect.y + radius)
            ctx.lineTo(effect.x - radius + len, effect.y + radius)

            // Bottom-Right Corner
            ctx.moveTo(effect.x + radius, effect.y + radius - len)
            ctx.lineTo(effect.x + radius, effect.y + radius)
            ctx.lineTo(effect.x + radius - len, effect.y + radius)
            ctx.stroke()
          }

          ctx.restore()
        })

        // Remove expired click effects
        if (clickEffectsRef.current.length > 0) {
          clickEffectsRef.current = clickEffectsRef.current.filter((effect) => effect.age < effect.maxAge)
        }

        // Spawn new particles based on distance traveled (dynamic comet trail: spawn threshold scales down with speed)
        const dx = smoothedMouseRef.current.x - lastSpawnPos.current.x
        const dy = smoothedMouseRef.current.y - lastSpawnPos.current.y
        const dist = Math.hypot(dx, dy)

        const speed = Math.hypot(vx, vy)
        const dynamicThreshold = Math.max(3, 8 - speed * 0.15)

        if (dist > dynamicThreshold && particlesRef.current.length < maxParticlesRef.current) {
          particleIdCounter.current += 1
          const charPool = isDeepMode ? BINARY : RUNES
          const randomChar = charPool[Math.floor(Math.random() * charPool.length)]

          const newParticle: Particle = {
            id: particleIdCounter.current,
            x: smoothedMouseRef.current.x,
            y: smoothedMouseRef.current.y,
            vx: -vx * 0.2 + (Math.random() - 0.5) * 1.2,
            vy: -vy * 0.2 + (Math.random() - 0.5) * 1.2,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 2.5,
            size: isDeepMode ? 7 + Math.random() * 4 : 9 + Math.random() * 5,
            opacity: 1.0,
            age: 0,
            maxAge: isDeepMode ? 0.5 + Math.random() * 0.4 : 0.8 + Math.random() * 0.5,
            char: randomChar
          }

          particlesRef.current.push(newParticle)
          lastSpawnPos.current = { x: smoothedMouseRef.current.x, y: smoothedMouseRef.current.y }
        }
      }

      animationFrameId = requestAnimationFrame(renderLoop)
    }

    const start2DLoop = () => {
      if (!isLoopRunning) {
        isLoopRunning = true
        animationFrameId = requestAnimationFrame(renderLoop)
      }
    }

    start2DLoopRef.current = start2DLoop
    start2DLoop()

    return () => {
      start2DLoopRef.current = null
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [isActive])

  // 5. Vanilla WebGL custom shaders setup (Architecture 2)
  useEffect(() => {
    if (!isActive || hasWebGLFailed) return

    const canvas = canvasWebGLRef.current
    if (!canvas) return

    let gl: WebGLRenderingContext | null = null
    try {
      gl = canvas.getContext('webgl', { 
        alpha: true, 
        antialias: true, 
        premultipliedAlpha: false,
        failIfMajorPerformanceCaveat: false
      }) as WebGLRenderingContext | null
      
      if (!gl) {
        gl = canvas.getContext('experimental-webgl', { 
          alpha: true, 
          antialias: true, 
          premultipliedAlpha: false 
        }) as WebGLRenderingContext | null
      }
    } catch (e) {
      console.warn("Could not retrieve WebGL context for custom cursor", e)
    }

    if (!gl) {
      console.warn("WebGL initialization failed. Cursor falling back to SVG/2D mode.");
      setHasWebGLFailed(true)
      return
    }

    glRef.current = gl

    // VS Code: Simple Quad Vertex Shader
    const vsSource = `
      attribute vec2 position;
      varying vec2 vUv;
      void main() {
        vUv = position * 0.5 + 0.5;
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    // FS Code: Cinematic dynamic dual shaders (Stable gold halo + Scanline Deep/Dark blue HUD rings)
    const fsSource = `
      precision mediump float;
      varying vec2 vUv;
      uniform float u_time;
      uniform float u_hover;
      uniform float u_transition;
      uniform float u_click;

      void main() {
        vec2 uv = vUv - 0.5;
        float dist = length(uv);
        
        // Output soft master circle mask
        float mask = smoothstep(0.5, 0.35, dist);
        
        // --- 1. MAGIC SHADER (Quick Pitch Golden Halo) ---
        // Elegant glowing burnished/antique gold tones (no green/olive tint)
        vec3 magicCore = vec3(0.85, 0.60, 0.20);   // Warm gold core
        vec3 magicMid = vec3(0.65, 0.42, 0.03);    // Warm burnished gold
        vec3 magicOuter = vec3(0.50, 0.30, 0.05);  // Warm antique gold
        
        vec3 magicColor = mix(magicOuter, magicMid, dist * 2.0);
        magicColor = mix(magicColor, magicCore, pow(1.0 - dist * 2.0, 2.0));
        
        // Ring glow peaking around the Norse runes (dist = 0.22) and hollow at the center
        float magicGlow = 0.04 / (abs(dist - 0.22) + 0.07);
        magicColor += magicMid * magicGlow;
        
        // Radial mask with hollow center (alpha = 0.0 at dist < 0.04)
        float magicAlpha = smoothstep(0.45, 0.12, dist) * smoothstep(0.04, 0.14, dist) * 0.45 * (0.8 + 0.2 * u_hover);
        vec4 magicFinal = vec4(magicColor, magicAlpha);
        
        // --- 2. TECH SHADER (Deep Dive Dark Blue HUD Scanlines) ---
        vec3 techColor = vec3(0.0, 0.2, 0.85);  // Deep Dark Blue #0033DD
        vec3 techCore = vec3(0.0, 0.55, 1.0);    // Glowing Royal Blue #0088FF
        
        float hoverSpeed = 1.0 + u_hover * 2.0;
        float tTime = u_time * 2.5 * hoverSpeed;
        
        // Rotating concentric scanline circles
        float ring1 = abs(sin(dist * 25.0 - tTime)) * 0.8;
        float ring2 = abs(sin(dist * 45.0 + tTime * 1.5)) * 0.5;
        
        // Intermittent dash rings
        float angle = atan(uv.y, uv.x);
        float segmentCount = 4.0;
        float tAngle = angle + u_time * 0.8 * (1.0 + u_hover);
        float segments = step(0.15, sin(tAngle * segmentCount));
        
        float ring3 = smoothstep(0.24, 0.22, dist) * smoothstep(0.18, 0.20, dist) * segments;
        float ring4 = smoothstep(0.40, 0.38, dist) * smoothstep(0.36, 0.38, dist) * step(0.4, sin(tAngle * 12.0));
        
        // High-tech target-locking dot
        float coreIntensity = 0.04 / (dist + 0.015);
        vec3 techFinalColor = mix(techColor, techCore, ring1 * 0.5 + ring3 * 0.5 + ring4 * 0.8);
        techFinalColor += techCore * coreIntensity;
        
        float techAlpha = (ring1 * 0.25 + ring2 * 0.15 + ring3 * 0.7 + ring4 * 0.6 + coreIntensity * 0.4) * mask;
        vec4 techFinal = vec4(techFinalColor, techAlpha * (0.8 + 0.2 * u_hover));
        
        // --- 3. CINEMATIC INTERPOLATED TRANSITION ---
        vec4 finalColor = mix(magicFinal, techFinal, u_transition);
        
        // --- 4. SHOCKWAVE CLICK EFFECT ---
        if (u_click < 1.0) {
          float clickRadius = u_click * 0.45;
          // Thin expanding ring
          float clickGlow = smoothstep(clickRadius - 0.05, clickRadius, dist) * 
                            smoothstep(clickRadius + 0.05, clickRadius, dist);
          
          vec3 clickColor = mix(magicCore, techCore, u_transition);
          finalColor.rgb += clickColor * clickGlow * (1.0 - u_click) * 2.5;
          finalColor.a += clickGlow * (1.0 - u_click) * 0.9;
        }
        
        gl_FragColor = finalColor * mask;
      }
    `;

    // Helpers to compile and create program
    const compile = (source: string, type: number): WebGLShader | null => {
      if (!gl) return null
      const shader = gl.createShader(type)
      if (!shader) return null
      gl.shaderSource(shader, source)
      gl.compileShader(shader)
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compilation error in custom cursor:', gl.getShaderInfoLog(shader))
        gl.deleteShader(shader)
        return null
      }
      return shader
    }

    const vs = compile(vsSource, gl.VERTEX_SHADER)
    const fs = compile(fsSource, gl.FRAGMENT_SHADER)
    if (!vs || !fs) {
      setHasWebGLFailed(true)
      return
    }

    const program = gl.createProgram()
    if (!program) {
      setHasWebGLFailed(true)
      return
    }

    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error in custom cursor:', gl.getProgramInfoLog(program))
      gl.deleteProgram(program)
      setHasWebGLFailed(true)
      return
    }

    programRef.current = program
    gl.useProgram(program)

    // Set up vertex coordinate buffers for the quad
    const positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    const vertices = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1,
    ])
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)

    const positionLoc = gl.getAttribLocation(program, 'position')
    gl.enableVertexAttribArray(positionLoc)
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0)

    // Retrieve uniform references
    const timeLoc = gl.getUniformLocation(program, 'u_time')
    const hoverLoc = gl.getUniformLocation(program, 'u_hover')
    const transitionLoc = gl.getUniformLocation(program, 'u_transition')
    const clickLoc = gl.getUniformLocation(program, 'u_click')

    // Initial setup (Cap effective pixel ratio to 2 to optimize fragment shader fills)
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = 90 * pixelRatio
    canvas.height = 90 * pixelRatio
    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.clearColor(0.0, 0.0, 0.0, 0.0)

    let webglLoopRunning = false

    // Render loop
    const render = () => {
      if (!gl || !program) return

      // Smoothly interpolate custom state variables (eliminates GSAP refs issues)
      const targetHover = isHoveredRef.current ? 1.0 : 0.0
      hoverValRef.current += (targetHover - hoverValRef.current) * 0.15

      const targetTransition = isDeepRef.current ? 1.0 : 0.0
      transitionValRef.current += (targetTransition - transitionValRef.current) * 0.12

      // Increment click progress (400ms duration)
      if (clickProgressRef.current < 1.0) {
        clickProgressRef.current += 0.016 / 0.4
        if (clickProgressRef.current > 1.0) {
          clickProgressRef.current = 1.0
        }
      }

      // Idle Throttling
      const isIdle = (Date.now() - lastMouseMoveTimeRef.current) > 2000
      const isShockwaveDone = clickProgressRef.current >= 1.0

      if (isIdle && isShockwaveDone) {
        webglLoopRunning = false
        animationWebGLRef.current = null
        return // Pause rendering loop to conserve battery/GPU
      }

      gl.clear(gl.COLOR_BUFFER_BIT)

      if (!startTimeRef.current) {
        startTimeRef.current = Date.now()
      }
      const elapsedSeconds = (Date.now() - startTimeRef.current) / 1000.0
      gl.uniform1f(timeLoc, elapsedSeconds)
      gl.uniform1f(hoverLoc, hoverValRef.current)
      gl.uniform1f(transitionLoc, transitionValRef.current)
      gl.uniform1f(clickLoc, clickProgressRef.current)

      gl.drawArrays(gl.TRIANGLES, 0, 6)

      animationWebGLRef.current = requestAnimationFrame(render)
    }

    const startWebGL = () => {
      if (!webglLoopRunning) {
        webglLoopRunning = true
        animationWebGLRef.current = requestAnimationFrame(render)
      }
    }

    startWebGLRef.current = startWebGL
    startWebGL()

    // Cleanup resources
    return () => {
      startWebGLRef.current = null
      if (animationWebGLRef.current) {
        cancelAnimationFrame(animationWebGLRef.current)
      }
      if (gl && program) {
        gl.deleteProgram(program)
        gl.deleteBuffer(positionBuffer)
      }
    }
  }, [isActive, hasWebGLFailed])

  if (isTouchDevice) return null

  if (!isActive) return null

  return (
    <>
      {/* 1. Full-screen Composited 2D Canvas Trail Layer */}
      <canvas 
        ref={canvasTrailRef}
        className="fixed inset-0 pointer-events-none z-[99998] w-screen h-screen"
      />

      {/* 2. Unified Custom Interactive Cursor Core (Aligned & mathematically exact tip hotspot) */}
      <div 
        ref={cursorRef}
        className="fixed pointer-events-none z-[99999] w-[90px] h-[90px] left-0 top-0"
        style={{
          transform: 'translate3d(-100px, -100px, 0)',
          willChange: 'transform'
        }}
      >
        {/* WebGL Shader Layer (Renders glowing holographic plasma/rings behind the pointer) */}
        {!hasWebGLFailed && (
          <canvas
            ref={canvasWebGLRef}
            className="absolute inset-0 w-full h-full"
            style={{ width: '90px', height: '90px', willChange: 'transform' }}
          />
        )}

        {/* 2.1 TECH MODE CONTAINER */}
        <div
          className="absolute inset-0 transition-opacity duration-500 ease-in-out"
          style={{
            opacity: isDeep ? 1 : 0,
            pointerEvents: 'none'
          }}
        >
          {/* Concentric diagnostics target brackets (snaps, grows and glows on interactive hover) */}
          <div 
            className="absolute w-[60px] h-[60px] border-2 rounded transition-all duration-500 ease-out"
            style={{
              left: '15px',
              top: '15px',
              transform: isDeep
                ? (isHovered ? 'scale(0.85) rotate(-45deg)' : 'scale(1.0) rotate(0deg)')
                : 'scale(0.3) rotate(45deg)',
              borderColor: isHovered ? 'rgba(0, 85, 255, 0.9)' : 'rgba(0, 51, 204, 0.35)', // Glowing dark blue
              boxShadow: isHovered ? '0 0 12px rgba(0, 85, 255, 0.55)' : 'none'
            }}
          />

          {/* Center Point Click Area Indicator (Tech Mode only) */}
          <div 
            className="absolute left-1/2 top-1/2 w-[5px] h-[5px] -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-150 ease-out z-[99999] rotate-45"
            style={{
              backgroundColor: '#0088FF',
              boxShadow: isHovered ? '0 0 8px rgba(0, 136, 255, 0.95)' : 'none'
            }}
          />
        </div>

        {/* 2.2 MAGIC MODE CONTAINER */}
        <div
          className="absolute inset-0 transition-opacity duration-500 ease-in-out"
          style={{
            opacity: isDeep ? 0 : 1,
            pointerEvents: 'none'
          }}
        >
          {/* Concentric Astrological Spell Array (Interlocking glowing golden-amber geometric lines) */}
          <div
            className="absolute transition-all duration-300 ease-out"
            style={{
              left: '15px',
              top: '15px',
              transform: 'scale(1.0)',
              width: '60px',
              height: '60px',
            }}
          >
            <svg
              width="60"
              height="60"
              viewBox="0 0 80 80"
              className="animate-[spin_28s_linear_infinite]"
              style={{
                opacity: isHovered ? 0.8 : 0.45,
                filter: isHovered ? 'drop-shadow(0 0 4px rgba(161, 108, 7, 0.75))' : 'none',
              }}
            >
              {/* Outer boundary ring */}
              <circle cx="40" cy="40" r="38" stroke="rgba(245, 158, 11, 0.3)" strokeWidth="0.8" fill="none" />
              {/* Dashed secondary boundary */}
              <circle cx="40" cy="40" r="32" stroke="rgba(245, 158, 11, 0.2)" strokeWidth="0.8" fill="none" strokeDasharray="3, 3" />
              
              {/* Solomon's Star (Intersecting concentric triangles creating a stunning Hexgram spell grid) */}
              <polygon points="40,3 72,58 8,58" stroke="rgba(245, 158, 11, 0.2)" strokeWidth="0.8" fill="none" />
              <polygon points="40,77 72,22 8,22" stroke="rgba(245, 158, 11, 0.2)" strokeWidth="0.8" fill="none" />
              
              {/* Cardinal axis crosshair markers */}
              <line x1="40" y1="2" x2="40" y2="7" stroke="rgba(245, 158, 11, 0.6)" strokeWidth="1" />
              <line x1="40" y1="73" x2="40" y2="78" stroke="rgba(245, 158, 11, 0.6)" strokeWidth="1" />
              <line x1="2" y1="40" x2="7" y2="40" stroke="rgba(245, 158, 11, 0.6)" strokeWidth="1" />
              <line x1="73" y1="40" x2="78" y2="40" stroke="rgba(245, 158, 11, 0.6)" strokeWidth="1" />
            </svg>
          </div>

          {/* Concentric Counter-Rotating Runic Ring (Actual Norse runes) */}
          <div
            className="absolute transition-all duration-300 ease-out"
            style={{
              left: '15px',
              top: '15px',
              transform: 'scale(1.0)',
              width: '60px',
              height: '60px',
            }}
          >
            <div 
              className="w-full h-full animate-[spin_12s_linear_infinite_reverse]" 
              style={{
                animationDuration: isHovered ? '4s' : '15s' // Fast rotation on hover, slower at idle
              }}
            >
              {/* Actual Norse Runes mapped around the circle */}
              {["ᚠ", "ᚢ", "ᚦ", "ᚨ", "ᚱ", "ᚲ", "ᚷ", "ᚹ", "ᚺ", "ᚾ", "ᛁ", "ᛃ"].map((rune, idx, arr) => {
                const angle = (idx / arr.length) * 360
                const radius = 20 // stable radius
                return (
                  <span
                    key={idx}
                    className="absolute text-[8.5px] select-none pointer-events-none"
                    style={{
                      fontFamily: 'NotoSansRunic-Regular, monospace',
                      left: '50%',
                      top: '50%',
                      transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-${isDeep ? radius * 0.3 : radius}px) rotate(-${angle}deg) scale(${isDeep ? 0.01 : 1})`,
                      transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s ease, color 0.3s ease, text-shadow 0.3s ease',
                      transitionDelay: `${idx * 20}ms`,
                      opacity: isDeep ? 0 : 1,
                      textShadow: isHovered ? '0 0 5px rgba(161, 108, 7, 0.9)' : '0 0 3px rgba(161, 108, 7, 0.5)',
                      color: isHovered ? '#FFFBEB' : 'rgba(161, 108, 7, 0.85)',
                    }}
                  >
                    {rune}
                  </span>
                )
              })}
            </div>
          </div>
        </div>

        {/* Preload Runic Font Eagerly to Force Browser Download for Canvas Rendering */}
        <div 
          className="absolute opacity-0 pointer-events-none -z-50 select-none"
          style={{ fontFamily: 'NotoSansRunic-Regular' }}
        >
          ᚠ
        </div>
      </div>
    </>
  )
}
