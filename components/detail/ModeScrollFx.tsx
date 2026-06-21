"use client"

import * as React from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useViewModeStore } from "@/store/useViewModeStore"
import { useGsap } from "@/hooks/useGsap"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

type Cleanup = () => void

/**
 * Mode-themed scroll behavior, mounted once inside DetailShell so every detail
 * page inherits it.
 *
 * Gold ("Painterly Scroll"):
 *  - Faint golden geometric rings fixed in the background rotate at 0.05× the
 *    scroll velocity (a barely-perceptible parallax — like drifting gallery art).
 *  - Media in `.unmask-media` reveal by unmasking left→right with a bright
 *    golden line as the leading edge.
 *
 * Blue ("Blueprint Grid & Overdrive"):
 *  - A fixed dark-navy grid plane warps in 3D perspective (rotateX) as you
 *    scroll — descending deeper into a blueprint.
 *  - Gentle y-proximity scroll snapping on sections; when a section locks in,
 *    its border flashes the bright mode accent.
 *  - `.deep-media` elements (code blocks, diagrams) get a subtle blue
 *    chromatic aberration that intensifies while scrolling and settles to
 *    crisp when idle.
 *
 * Everything is gated on prefers-reduced-motion: under reduced motion the
 * background layers still render statically but nothing animates and snapping
 * is off. The useGsap wrapper reverts the gsap.context on unmount or mode
 * change; the cleanup returned here clears the manual DOM state that context
 * revert can't reach (inline styles on document/elements).
 */
export function ModeScrollFx() {
  const mode = useViewModeStore((s) => s.mode)

  useGsap(() => {
    const mm = gsap.matchMedia()
    let manual: Cleanup | undefined

    mm.add(
      {
        isMotion: "(prefers-reduced-motion: no-preference) and (min-width: 768px)",
      },
      (ctx) => {
        const { isMotion } = ctx.conditions as { isMotion?: boolean }
        manual = mode === "quick" ? mountGoldFx(Boolean(isMotion)) : mountBlueFx(Boolean(isMotion))
        // matchMedia invokes a returned cleanup when the query stops matching
        // or on mm.revert().
        return () => {
          manual?.()
          manual = undefined
        }
      }
    )

    return () => mm.revert()
  }, [mode])

  return <ModeScrollFxLayer mode={mode} />
}

/** Shared DOM layer that renders the mode's background plane. */
function ModeScrollFxLayer({ mode }: { mode: "quick" | "deep" }) {
  if (mode === "quick") {
    // Golden rings + faint painterly wash. Rotated on scroll by mountGoldFx.
    return (
      <div
        aria-hidden
        data-gold-rings
        className="pointer-events-none fixed inset-0 -z-[1] overflow-hidden"
        style={{ opacity: 0.5 }}
      >
        <svg
          className="absolute left-1/2 top-1/2 h-[180vmax] w-[180vmax] -translate-x-1/2 -translate-y-1/2"
          viewBox="-100 -100 200 200"
          fill="none"
        >
          {[28, 44, 60, 76, 92].map((r, i) => (
            <circle
              key={r}
              cx="0"
              cy="0"
              r={r}
              stroke="var(--mode-accent)"
              strokeWidth={i % 2 === 0 ? 0.15 : 0.08}
              opacity={0.5 - i * 0.06}
            />
          ))}
          {/* Mel's signature geometric line spokes */}
          {[0, 60, 120].map((deg) => (
            <line
              key={deg}
              x1="-92"
              y1="0"
              x2="92"
              y2="0"
              stroke="var(--mode-accent)"
              strokeWidth="0.08"
              opacity="0.12"
              transform={`rotate(${deg})`}
            />
          ))}
        </svg>
      </div>
    )
  }

  // Blue: dark-navy perspective grid plane (warped on scroll by mountBlueFx).
  return (
    <div
      aria-hidden
      data-blue-grid
      className="pointer-events-none fixed inset-0 -z-[1] overflow-hidden"
      style={{ perspective: "800px", opacity: 0.6 }}
    >
      <div
        data-blue-grid-inner
        className="absolute inset-[-25%]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(74,143,255,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(74,143,255,0.18) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          transformStyle: "preserve-3d",
          transform: "rotateX(60deg)",
        }}
      />
    </div>
  )
}

/** Gold scroll effects. Returns a cleanup that clears manual inline styles. */
function mountGoldFx(animate: boolean): Cleanup {
  const ringsEl = document.querySelector<HTMLElement>("[data-gold-rings] svg")

  if (!animate || !ringsEl) {
    return () => {
      if (ringsEl) ringsEl.style.transform = ""
    }
  }

  // Slow parallax rotation of the ring field, scrubbed to page scroll so it
  // crawls at a fraction of scroll speed (painterly, never busy).
  const rot = { v: 0 }
  gsap.to(rot, {
    v: 360,
    ease: "none",
    scrollTrigger: {
      trigger: document.documentElement,
      start: "top top",
      end: "bottom bottom",
      scrub: 1,
    },
    onUpdate: () => {
      ringsEl.style.transform = `translate(-50%, -50%) rotate(${rot.v * 0.05}deg)`
    },
  })

  // Horizontal unmask reveal for any media marked `.unmask-media`, with a
  // golden leading edge (the child `.unmask-edge` tracks the reveal front).
  gsap.utils.toArray<HTMLElement>(".unmask-media").forEach((el) => {
    const edge = el.querySelector<HTMLElement>(".unmask-edge")
    gsap.fromTo(
      el,
      { clipPath: "inset(0 100% 0 0)" },
      {
        clipPath: "inset(0 0% 0 0)",
        ease: "none",
        scrollTrigger: { trigger: el, start: "top 85%", end: "center 60%", scrub: true },
      }
    )
    if (edge) {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, start: "top 85%", end: "center 60%", scrub: true },
      })
      tl.fromTo(edge, { left: "0%" }, { left: "100%", ease: "none" }).to(edge, {
        opacity: 0,
        duration: 0.1,
      })
    }
  })

  return () => {
    // Context revert kills the tweens/triggers; we only clear the manual
    // transform the onUpdate wrote directly to the DOM.
    ringsEl.style.transform = ""
  }
}

/** Blue scroll effects. Returns a cleanup that clears manual DOM state. */
function mountBlueFx(animate: boolean): Cleanup {
  const gridInner = document.querySelector<HTMLElement>("[data-blue-grid-inner]")
  const sections = gsap.utils.toArray<HTMLElement>(".reveal-item")
  const redOffsetEl = document.getElementById("matrix-red-offset")
  const cyanOffsetEl = document.getElementById("matrix-cyan-offset")
  const aberrationMedia = gsap.utils.toArray<HTMLElement>(".deep-media")

  // Velocity proxy for chromatic aberration: spikes while scrolling, decays
  // to 0 (crisp) when idle.
  let velocity = 0
  let decayRegistered = false

  const applyAberration = () => {
    const amt = Math.min(velocity * 0.02, 3.5) // cap px-split
    if (redOffsetEl && cyanOffsetEl) {
      redOffsetEl.setAttribute("dx", `${amt}`)
      cyanOffsetEl.setAttribute("dx", `${-amt}`)
    }
    aberrationMedia.forEach((el) => {
      if (amt > 0.1) {
        el.style.filter = "url(#hextech-aberration)"
      } else {
        el.style.filter = "none"
      }
    })
  }
  const decay = () => {
    velocity *= 0.88
    if (velocity < 0.2) {
      velocity = 0
      if (redOffsetEl && cyanOffsetEl) {
        redOffsetEl.setAttribute("dx", "0")
        cyanOffsetEl.setAttribute("dx", "0")
      }
      aberrationMedia.forEach((el) => (el.style.filter = "none"))
      if (decayRegistered) {
        gsap.ticker.remove(decay)
        decayRegistered = false
      }
      return
    }
    applyAberration()
  }

  if (animate) {
    // 3D grid warp: rotateX shifts with scroll depth (descending the blueprint).
    if (gridInner) {
      gsap.fromTo(gridInner,
        { transform: "rotateX(60deg) translateZ(0px)" },
        {
          transform: "rotateX(75deg) translateZ(-80px)",
          ease: "none",
          scrollTrigger: {
            trigger: document.documentElement,
            start: "top top",
            end: "bottom bottom",
            scrub: true,
          },
        }
      )
    }

    // Section lock-in border flash.
    sections.forEach((section) => {
      ScrollTrigger.create({
        trigger: section,
        start: "top 55%",
        onEnter: () => flashBorder(section),
        onEnterBack: () => flashBorder(section),
      })
    })

    // Track scroll velocity for aberration; spin up the decay ticker.
    ScrollTrigger.create({
      trigger: document.documentElement,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        velocity = Math.abs(self.getVelocity())
        applyAberration()
        if (!decayRegistered) {
          gsap.ticker.add(decay)
          decayRegistered = true
        }
      },
    })

    // Gentle proximity snapping (proximity, not mandatory — avoids trapping
    // users on short pages).
    document.documentElement.style.scrollSnapType = "y proximity"
    sections.forEach((s) => {
      s.style.scrollSnapAlign = "start"
      s.style.scrollMarginTop = "5rem"
    })
  }

  function flashBorder(el: HTMLElement) {
    gsap.fromTo(
      el,
      { boxShadow: "0 0 0 1px rgba(106,255,255,0.0)" },
      {
        boxShadow: "0 0 30px rgba(106,255,255,0.65), inset 0 0 15px rgba(106,255,255,0.3)",
        duration: 0.3,
        yoyo: true,
        repeat: 1,
        ease: "power2.out",
      }
    )
  }

  return () => {
    if (decayRegistered) {
      gsap.ticker.remove(decay)
      decayRegistered = false
    }
    document.documentElement.style.scrollSnapType = ""
    sections.forEach((s) => {
      s.style.scrollSnapAlign = ""
      s.style.scrollMarginTop = ""
    })
    aberrationMedia.forEach((el) => (el.style.filter = ""))
  }
}
