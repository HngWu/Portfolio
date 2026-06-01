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

const RUNES = ["ᚠ", "ᚢ", "ᚦ", "ᚨ", "ᚱ", "ᚲ", "ᚷ", "ᚹ", "ᚺ", "ᚾ", "ᛁ", "ᛃ", "ᛇ", "ᛈ", "ᛉ", "ᛊ"]
const BINARY = ["0", "1"]

const STAGE_PATHS = {
  step1: "M20 5 L35 25 L25 22 L23 35 L20 35 L17 35 L15 22 L5 25 Z", // 1. Runic Origin (Padded)
  step2: "M20 5 L35 25 L25 22 L23 32 L20 32 L17 32 L15 22 L5 25 Z", // 2. Awakening (Padded)
  step3: "M20 4 L35 25 L25 22 L27 28 L20 25 L13 28 L15 22 L5 25 Z", // 3. Conduit (8 points)
  step4: "M20 4 L35 25 L25 22 L20 26 L20 26 L15 22 L5 25 L5 25 Z", // 4. Harmonization (Padded)
  step5: "M20 4 L35 25 L25 22 L20 26 L20 26 L15 22 L5 25 L5 25 Z", // 5. Transition (Padded)
  step6: "M20 3 L36 26 L26 23 L20 27 L20 27 L14 23 L4 26 L4 26 Z", // 6. Tech Form (Padded)
  drag: "M20 2 L38 28 L28 24 L20 34 L20 34 L12 24 L2 28 L2 28 Z", // Drag Delta Shape (Padded)
  unavailable: "M20 4 L34 22 L34 22 L20 18 L20 18 L6 22 L6 22 Z" // Locked Warning Frame (Padded)
}

const getStateForTarget = (
  target: HTMLElement | null,
  isDeep: boolean
): { state: 'default' | 'hover' | 'drag' | 'unavailable'; isHovered: boolean } => {
  if (!target) return { state: 'default', isHovered: false }

  // 1. Check for locked / disabled items (Unavailable State)
  const isLocked = target.closest('disabled, [disabled], .cursor-not-allowed, [data-locked="true"]') !== null
  if (isLocked) {
    return { state: 'unavailable', isHovered: false }
  }

  // 2. Check for drag triggers (Drag State)
  const isDraggable = target.closest('[draggable="true"], .draggable, [data-drag="true"]') !== null
  if (isDraggable) {
    return { state: 'drag', isHovered: false }
  }

  // 3. Check for standard clickable items (Hover State)
  const isInteractive = target.closest('a, button, [role="button"], [data-hover-glow], [data-interactive], .cursor-pointer') !== null
  return { 
    state: isInteractive ? 'hover' : 'default', 
    isHovered: isInteractive 
  }
}

export function ArcaneCursor() {
  const mode = useViewModeStore((state) => state.mode)
  const isDeep = mode === 'deep'

  const [isActive, setIsActive] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [hasWebGLFailed, setHasWebGLFailed] = useState(false)
  const [isTouchDevice, setIsTouchDevice] = useState(false)
  const [cursorState, setCursorState] = useState<'default' | 'hover' | 'select' | 'drag' | 'unavailable'>('default')

  // Ref tracking variables for high-performance scroll and mode values
  const scrollProgressRef = useRef(0)
  const smoothScrollRef = useRef(0)
  const smoothModeRef = useRef(isDeep ? 1 : 0)
  const evolutionValRef = useRef(isDeep ? 1 : 0)

  // Outer cursor DOM ref for high-performance direct transform manipulation
  const cursorRef = useRef<HTMLDivElement | null>(null)

  const cursorStateRef = useRef(cursorState)
  useEffect(() => {
    cursorStateRef.current = cursorState
  }, [cursorState])

  const pathRef = useRef<SVGPathElement | null>(null)
  const steelRef = useRef<SVGPathElement | null>(null)
  const crystalRef = useRef<SVGCircleElement | null>(null)
  const concentricRef = useRef<HTMLDivElement | null>(null)
  const crossbarRef = useRef<SVGGElement | null>(null)

  // Tracking refs to eliminate React re-render trigger dependencies in loops
  const isHoveredRef = useRef(isHovered)
  const isDeepRef = useRef(isDeep)

  useEffect(() => {
    isHoveredRef.current = isHovered
  }, [isHovered])

  useEffect(() => {
    isDeepRef.current = isDeep
  }, [isDeep])

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

  // Refs for tracking mouse position and velocity
  const mouseRef = useRef({ x: 0, y: 0 })
  const smoothedMouseRef = useRef({ x: 0, y: 0 })
  const velocityRef = useRef({ x: 0, y: 0 })
  const lastSpawnPos = useRef({ x: 0, y: 0 })

  // 2D Canvas Trail Ref
  const canvasTrailRef = useRef<HTMLCanvasElement | null>(null)
  const particlesRef = useRef<Particle[]>([])
  const particleIdCounter = useRef(0)

  // WebGL Shader Refs
  const canvasWebGLRef = useRef<HTMLCanvasElement | null>(null)
  const glRef = useRef<WebGLRenderingContext | null>(null)
  const programRef = useRef<WebGLProgram | null>(null)
  const animationWebGLRef = useRef<number | null>(null)
  const startTimeRef = useRef<number>(Date.now())
  const hoverValRef = useRef<number>(0)

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

  // 1. Activate custom cursor on mouse movement
  useEffect(() => {
    const activateCustomCursor = () => {
      setIsActive(true)
      document.body.classList.add('custom-cursor-active')
      window.removeEventListener('mousemove', activateCustomCursor)
      window.removeEventListener('touchstart', activateCustomCursor)
    }

    window.addEventListener('mousemove', activateCustomCursor)
    window.addEventListener('touchstart', activateCustomCursor)

    return () => {
      document.body.classList.remove('custom-cursor-active')
      window.removeEventListener('mousemove', activateCustomCursor)
      window.removeEventListener('touchstart', activateCustomCursor)
    }
  }, [])

  // 2. Track real-time mouse coordinate and O(1) interactive hover state
  useEffect(() => {
    const trackCoords = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX
      mouseRef.current.y = e.clientY
      
      const target = e.target as HTMLElement | null
      const { state, isHovered } = getStateForTarget(target, isDeepRef.current)
      setIsHovered(isHovered)
      setCursorState(state)
    }

    const handleMouseDown = () => {
      setCursorState('select')
    }

    const handleMouseUp = (e: MouseEvent) => {
      // Trigger Canvas shockwave spawn
      triggerShockwave(e.clientX, e.clientY)
      
      // Re-evaluate current state
      const target = e.target as HTMLElement | null
      const { state, isHovered } = getStateForTarget(target, isDeepRef.current)
      setIsHovered(isHovered)
      setCursorState(state)
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
    let animationFrameId: number

    const renderLoop = (time: number) => {
      // Visual inertia: smoother LERP on hover for precise feel
      const lerpFactor = isHoveredRef.current ? 0.28 : 0.18
      const lastX = smoothedMouseRef.current.x
      const lastY = smoothedMouseRef.current.y

      smoothedMouseRef.current.x += (mouseRef.current.x - smoothedMouseRef.current.x) * lerpFactor
      smoothedMouseRef.current.y += (mouseRef.current.y - smoothedMouseRef.current.y) * lerpFactor

      // Smoothly interpolate scroll progress and mode values with visual spring-inertia
      smoothScrollRef.current += (scrollProgressRef.current - smoothScrollRef.current) * 0.1
      const targetModeVal = isDeepRef.current ? 1.0 : 0.0
      smoothModeRef.current += (targetModeVal - smoothModeRef.current) * 0.12

      // u_evolution is the maximum of scroll and deep mode toggle progress
      evolutionValRef.current = Math.max(smoothScrollRef.current, smoothModeRef.current)

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${smoothedMouseRef.current.x}px, ${smoothedMouseRef.current.y}px, 0) translate(-50%, -50%)`
      }

      // Directly update SVG DOM nodes in real time!
      const val = evolutionValRef.current
      const state = cursorStateRef.current
      
      let activePath = STAGE_PATHS.step1
      let fillOpacity = 0.15
      let strokeColor = "#FFB44A"
      let strokeDash = "3, 3"
      let isMagicStage = val < 0.5
      
      if (state === 'drag') {
        activePath = STAGE_PATHS.drag
        strokeColor = isDeepRef.current ? "#4AFFB4" : "#FFB44A"
        fillOpacity = 0.4
        strokeDash = "none"
      } else if (state === 'unavailable') {
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

      if (pathRef.current) {
        pathRef.current.setAttribute('d', activePath)
        pathRef.current.setAttribute('fill', isMagicStage ? `rgba(255, 180, 74, ${fillOpacity})` : "#C5A059")
        pathRef.current.setAttribute('stroke', strokeColor)
        pathRef.current.setAttribute('stroke-width', state === 'hover' ? "2" : "1.5")
        if (strokeDash !== 'none') {
          pathRef.current.setAttribute('stroke-dasharray', strokeDash)
        } else {
          pathRef.current.removeAttribute('stroke-dasharray')
        }
      }
      
      if (steelRef.current) {
        if (!isMagicStage && state !== 'unavailable') {
          steelRef.current.setAttribute('fill', "#4F5D6B")
          steelRef.current.setAttribute('stroke', state === 'hover' ? "#4AFFB4" : "rgba(255,255,255,0.2)")
          steelRef.current.setAttribute('stroke-width', "1")
          steelRef.current.style.display = 'block'
        } else {
          steelRef.current.style.display = 'none'
        }
      }
      
      if (crystalRef.current) {
        if (state !== 'unavailable') {
          crystalRef.current.setAttribute('fill', isMagicStage ? "#FFB44A" : "#4AFFB4")
          crystalRef.current.setAttribute('r', activePath === STAGE_PATHS.step6 ? "3" : "2.5")
          crystalRef.current.style.filter = isMagicStage ? 'drop-shadow(0 0 3px #FFB44A)' : 'drop-shadow(0 0 4px #4AFFB4)'
          crystalRef.current.style.display = 'block'
        } else {
          crystalRef.current.style.display = 'none'
        }
      }

      if (concentricRef.current) {
        concentricRef.current.style.display = state === 'hover' ? 'block' : 'none'
        if (state === 'hover') {
          concentricRef.current.style.borderColor = isDeepRef.current ? 'rgba(74, 255, 180, 0.6)' : 'rgba(255, 180, 74, 0.6)'
          concentricRef.current.style.boxShadow = isDeepRef.current ? '0 0 10px rgba(74, 255, 180, 0.3)' : '0 0 10px rgba(255, 180, 74, 0.3)'
        }
      }

      if (crossbarRef.current) {
        crossbarRef.current.style.display = state === 'unavailable' ? 'block' : 'none'
      }

      // Velocity calculation
      velocityRef.current.x = smoothedMouseRef.current.x - lastX
      velocityRef.current.y = smoothedMouseRef.current.y - lastY

      // Draw particle trails on the 2D Canvas
      const canvas = canvasTrailRef.current
      const ctx = canvas?.getContext('2d')
      if (canvas && ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.globalCompositeOperation = 'screen' // Additive blending for glows

        // Update and draw active particles
        particlesRef.current.forEach((p) => {
          p.age += 0.016
          p.opacity = Math.max(0, 1.0 - p.age / p.maxAge)

          // Drag / deceleration friction
          p.vx *= 0.95
          p.vy *= 0.95

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
          let drawingSize = p.size
          if (p.char === "◯") {
            // Expands the shockwave circle from 15px to 55px over its 0.35s age
            drawingSize = 15 + (p.age / p.maxAge) * 40
          }

          ctx.shadowBlur = drawingSize * 1.5
          ctx.shadowColor = isMagicStage ? '#FBBF24' : '#4AFFB4'

          ctx.font = `${drawingSize}px ${isMagicStage ? 'NotoSansRunic-Regular, monospace' : 'monospace'}`
          ctx.fillStyle = isMagicStage 
            ? `rgba(245, 158, 11, ${p.opacity})` // Golden-amber runes
            : `rgba(74, 255, 180, ${p.opacity})` // Cyan-mint binary
          
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(p.char, 0, 0)
          ctx.restore()
        })

        // Remove expired particles
        particlesRef.current = particlesRef.current.filter(p => p.age < p.maxAge)

        // Spawn new particles based on distance traveled
        const dx = smoothedMouseRef.current.x - lastSpawnPos.current.x
        const dy = smoothedMouseRef.current.y - lastSpawnPos.current.y
        const dist = Math.hypot(dx, dy)

        if (dist > 8 && particlesRef.current.length < 45) {
          particleIdCounter.current += 1
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

          particlesRef.current.push(newParticle)
          lastSpawnPos.current = { x: smoothedMouseRef.current.x, y: smoothedMouseRef.current.y }
        }
      }

      animationFrameId = requestAnimationFrame(renderLoop)
    }

    animationFrameId = requestAnimationFrame(renderLoop)
    return () => cancelAnimationFrame(animationFrameId)
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
    const evolutionLoc = gl.getUniformLocation(program, 'u_evolution')

    // Initial setup
    const pixelRatio = window.devicePixelRatio || 1
    canvas.width = 120 * pixelRatio
    canvas.height = 120 * pixelRatio
    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.clearColor(0.0, 0.0, 0.0, 0.0)

    // Render loop
    const render = () => {
      if (!gl || !program) return

      // Smoothly interpolate custom state variables (eliminates GSAP refs issues)
      const targetHover = isHoveredRef.current ? 1.0 : 0.0
      hoverValRef.current += (targetHover - hoverValRef.current) * 0.15

      gl.clear(gl.COLOR_BUFFER_BIT)

      const elapsedSeconds = (Date.now() - startTimeRef.current) / 1000.0
      gl.uniform1f(timeLoc, elapsedSeconds)
      gl.uniform1f(hoverLoc, hoverValRef.current)
      gl.uniform1f(evolutionLoc, evolutionValRef.current)

      gl.drawArrays(gl.TRIANGLES, 0, 6)

      animationWebGLRef.current = requestAnimationFrame(render)
    }

    animationWebGLRef.current = requestAnimationFrame(render)

    // Cleanup resources
    return () => {
      if (animationWebGLRef.current) {
        cancelAnimationFrame(animationWebGLRef.current)
      }
      if (gl && program) {
        gl.deleteProgram(program)
        gl.deleteBuffer(positionBuffer)
      }
    }
  }, [isActive])

  if (isTouchDevice) return null

  if (!isActive) return null

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
        ref={cursorRef}
        className="fixed pointer-events-none z-[99999] w-[120px] h-[120px]"
        style={{
          transform: 'translate3d(0, 0, 0) translate(-50%, -50%)',
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
          <div 
            ref={concentricRef}
            className="absolute w-[46px] h-[46px] border rounded-full animate-spin transition-all duration-300"
            style={{
              borderColor: isDeep ? 'rgba(74, 255, 180, 0.6)' : 'rgba(255, 180, 74, 0.6)',
              borderStyle: 'dashed',
              animationDuration: '6s',
              boxShadow: isDeep ? '0 0 10px rgba(74, 255, 180, 0.3)' : '0 0 10px rgba(255, 180, 74, 0.3)',
              display: cursorState === 'hover' ? 'block' : 'none'
            }}
          />

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
              ref={pathRef}
              d={activePath} 
              fill={isMagicStage ? `rgba(255, 180, 74, ${fillOpacity})` : "#C5A059"} 
              stroke={strokeColor} 
              strokeWidth={cursorState === 'hover' ? "2" : "1.5"}
              strokeDasharray={strokeDash}
              style={{ transition: 'd 0.3s ease-out, fill 0.3s, stroke 0.3s' }}
            />
            
            {/* Sliding Steel Core Plate (Stages 4-6) */}
            <path 
              ref={steelRef}
              d="M20 7 L31 21 L23 19 L20 22 L17 19 L9 21 Z" 
              fill="#4F5D6B" 
              stroke={cursorState === 'hover' ? "#4AFFB4" : "rgba(255,255,255,0.2)"}
              strokeWidth="1"
              style={{ 
                transition: 'fill 0.3s, stroke 0.3s',
                display: (!isMagicStage && cursorState !== 'unavailable') ? 'block' : 'none'
              }}
            />

            {/* Glowing Core Crystal */}
            <circle 
              ref={crystalRef}
              cx="20" 
              cy="14" 
              r={activePath === STAGE_PATHS.step6 ? "3" : "2.5"} 
              fill={isMagicStage ? "#FFB44A" : "#4AFFB4"} 
              className="animate-pulse"
              style={{ 
                filter: isMagicStage ? 'drop-shadow(0 0 3px #FFB44A)' : 'drop-shadow(0 0 4px #4AFFB4)',
                transition: 'fill 0.3s',
                display: cursorState !== 'unavailable' ? 'block' : 'none'
              }}
            />

            {/* Unavailable lock cross bars */}
            <g 
              ref={crossbarRef}
              style={{ display: cursorState === 'unavailable' ? 'block' : 'none' }}
            >
              <line x1="12" y1="20" x2="28" y2="20" stroke="#FF4A6B" strokeWidth="2" />
              <line x1="20" y1="12" x2="20" y2="28" stroke="#FF4A6B" strokeWidth="2" />
            </g>
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
}
