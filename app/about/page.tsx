"use client"

import React, { useEffect } from "react"
import { MechanicalDeityScene } from "@/components/three/MechanicalDeityScene"
import { DeityHudOverlay } from "@/components/three/deity/DeityHudOverlay"
import { GlassCard } from "@/components/ui/GlassCard"
import { useViewModeStore } from "@/store/useViewModeStore"
import { useNavigationStore } from "@/store/useNavigationStore"
import { motion } from "framer-motion"
import {
  Shield,
  Award,
  GraduationCap,
  Sparkles,
  ChevronDown,
  Terminal,
  Cpu,
  Layers,
  Activity,
  Zap,
  Globe,
  CheckCircle2,
  ExternalLink,
} from "lucide-react"

export default function AboutPage() {
  const mode = useViewModeStore((s) => s.mode)
  const isDeepDive = mode === "deep"
  const reportPageLoaded = useNavigationStore((s) => s.reportPageLoaded)

  useEffect(() => {
    reportPageLoaded("/about")
  }, [reportPageLoaded])

  const scrollToSanctum = () => {
    const el = document.getElementById("sanctum-grid")
    if (el) {
      el.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#06070A] text-white relative overflow-x-hidden selection:bg-lume-primary/30">
      {/* ──────────────────────────────────────────────────────────── */}
      {/* SECTION 1: 100vh Full-Bleed 3D Mechanical Deity Hero         */}
      {/* ──────────────────────────────────────────────────────────── */}
      <section className="relative w-full h-[100dvh] flex flex-col justify-between overflow-hidden">
        {/* Full-Bleed R3F 3D Scene */}
        <div className="absolute inset-0 z-0">
          <MechanicalDeityScene />
        </div>

        {/* Ambient Vignette & Telemetry Grid Lines */}
        <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(6,7,10,0.8)_85%,#06070A_100%)]" />
        <div className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-40" />

        {/* Floating Top Telemetry Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative z-20 pt-20 sm:pt-24 px-6 sm:px-12 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pointer-events-none"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-[rgba(13,16,23,0.7)] backdrop-blur-md text-[11px] font-mono tracking-wider text-white/70">
              <span
                className={`size-2 rounded-full animate-ping ${
                  isDeepDive ? "bg-[#00F0FF]" : "bg-[#F5B041]"
                }`}
              />
              <span>SYS.SANCTUM // PROFILE</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mt-2 font-sans">
              Mechanical Deity
            </h1>
            <p className="text-xs sm:text-sm font-mono text-white/50 tracking-widest mt-1 uppercase">
              Omniscient Architecture • Tan Hng Wu
            </p>
          </div>

          <div className="hidden md:flex flex-col items-end text-right font-mono text-xs text-white/50 space-y-1">
            <span>COORDINATES: 1.3521° N, 103.8198° E (SGP)</span>
            <span>SYSTEM CHASSIS: LUME-GLASS V4.2</span>
            <span>STATUS: SINGULARITY NOMINAL</span>
          </div>
        </motion.div>

        {/* Bottom Scroll Prompt */}
        <div className="relative z-20 pb-20 sm:pb-28 flex flex-col items-center pointer-events-auto">
          <button
            onClick={scrollToSanctum}
            className="flex flex-col items-center gap-2 text-white/40 hover:text-white/90 transition-colors group cursor-pointer"
            aria-label="Scroll to Sanctum Bento Grid"
          >
            <span className="text-[10px] font-mono tracking-widest uppercase">
              DESCENT TO SANCTUM GRID
            </span>
            <ChevronDown className="size-4 animate-bounce group-hover:translate-y-1 transition-transform" />
          </button>
        </div>

        {/* Floating Interactive HUD Controls Bar */}
        <DeityHudOverlay />
      </section>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* SECTION 2: Structured Lume-Glass Bento Grid                 */}
      {/* ──────────────────────────────────────────────────────────── */}
      <section
        id="sanctum-grid"
        className="relative z-20 max-w-[1400px] mx-auto px-4 sm:px-8 py-20 sm:py-28 flex flex-col gap-8"
      >
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-6 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 font-mono text-xs text-lume-primary tracking-widest uppercase">
              <Terminal className="size-3.5" />
              <span>DOSSIER // EXPEDITION TELEMETRY</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white mt-1">
              Tan Hng Wu
            </h2>
            <p className="text-sm text-white/60 font-mono mt-1">
              Systems Architect & Software Engineer
            </p>
          </div>
          <div className="flex items-center gap-3 font-mono text-xs text-white/50">
            <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10">
              NATIONAL SERVICE (SG)
            </span>
            <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10">
              NUS CS INCOMING
            </span>
          </div>
        </div>

        {/* 12-Column Responsive Bento Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* ──────────────────────────────────────────────────────── */}
          {/* Module 1: Identity & Core Telemetry Card (7 Cols)        */}
          {/* ──────────────────────────────────────────────────────── */}
          <GlassCard className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
            {/* Top Reticle */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2 font-mono text-xs text-white/80">
                <Cpu className="size-4 text-lume-primary" />
                <span>MODULE 01 // CORE TELEMETRY</span>
              </div>
              <span className="font-mono text-[10px] text-white/40">LOC: SINGAPORE</span>
            </div>

            <div className="my-6 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Tan Hng Wu
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-lume-primary/10 text-lume-primary border border-lume-primary/20">
                  ACTIVE BUILDER
                </span>
              </div>

              {/* Mode-Aware Bio */}
              <p className="text-sm sm:text-base text-white/80 leading-relaxed font-sans">
                {isDeepDive ? (
                  <>
                    Graduated with a <strong>Diploma in Information Technology with Merit (3.91 GPA)</strong> from Nanyang Polytechnic and completed a full one-year Software Engineering Internship at <strong>DBS Bank</strong> (Consumer Banking Group Technology). Experienced in enterprise database migrations from MongoDB to MariaDB via Java Spring Boot, Jenkins CI/CD on OpenShift, real-time multiplayer networking, forensic watermarking, and deterministic AI agent coding harnesses.
                  </>
                ) : (
                  <>
                    Full-stack software engineer and systems builder focused on resilient enterprise backend architectures, deterministic AI agent workflows, and cinema-grade spatial web interfaces. Currently fulfilling National Service obligations in Singapore while preparing for Computer Science at the National University of Singapore (NUS).
                  </>
                )}
              </p>
            </div>

            <div className="pt-4 border-t border-white/10 grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs text-white/60">
              <div>
                <span className="block text-[10px] text-white/40 uppercase">STATUS</span>
                <span className="text-white/90">National Service</span>
              </div>
              <div>
                <span className="block text-[10px] text-white/40 uppercase">ACADEMIA</span>
                <span className="text-white/90">NUS CS (Direct Honours)</span>
              </div>
              <div>
                <span className="block text-[10px] text-white/40 uppercase">FOCUS</span>
                <span className="text-white/90">Distributed Systems & AI</span>
              </div>
            </div>
          </GlassCard>

          {/* ──────────────────────────────────────────────────────── */}
          {/* Module 2: Key Metrics & Honors Matrix (5 Cols, 2x2 Grid) */}
          {/* ──────────────────────────────────────────────────────── */}
          <div className="md:col-span-5 grid grid-cols-2 gap-4">
            {/* Stat 1 */}
            <GlassCard className="p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-white/40 font-mono text-[10px]">
                <span>GPA // ACADEMIC</span>
                <GraduationCap className="size-3.5 text-cyan-400" />
              </div>
              <div className="my-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
                  3.91
                </span>
                <span className="text-xs text-white/50 font-mono ml-1">/ 4.00</span>
              </div>
              <p className="text-[11px] text-white/70 leading-snug">
                Diploma in IT with Merit, Nanyang Polytechnic (2023–2026)
              </p>
            </GlassCard>

            {/* Stat 2 */}
            <GlassCard className="p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-white/40 font-mono text-[10px]">
                <span>MEDAL // ARENA</span>
                <Award className="size-3.5 text-yellow-400" />
              </div>
              <div className="my-2">
                <span className="text-xl sm:text-2xl font-extrabold text-yellow-400 font-mono">
                  SILVER
                </span>
              </div>
              <p className="text-[11px] text-white/70 leading-snug">
                WorldSkills Singapore 2025 (IT Software Solutions)
              </p>
            </GlassCard>

            {/* Stat 3 */}
            <GlassCard className="p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-white/40 font-mono text-[10px]">
                <span>NATIONAL // SGP</span>
                <Globe className="size-3.5 text-red-400" />
              </div>
              <div className="my-2">
                <span className="text-lg sm:text-xl font-extrabold text-white font-mono">
                  TEAM SG
                </span>
              </div>
              <p className="text-[11px] text-white/70 leading-snug">
                14th WorldSkills ASEAN Competitor (Manila, Philippines)
              </p>
            </GlassCard>

            {/* Stat 4 */}
            <GlassCard className="p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-white/40 font-mono text-[10px]">
                <span>SCHOLAR // HONOR</span>
                <Shield className="size-3.5 text-emerald-400" />
              </div>
              <div className="my-2">
                <span className="text-base sm:text-lg font-extrabold text-emerald-400 font-mono">
                  SCHOLAR
                </span>
              </div>
              <p className="text-[11px] text-white/70 leading-snug">
                The Ngee Ann Kongsi Tertiary Award (AY 2025/2026)
              </p>
            </GlassCard>
          </div>

          {/* ──────────────────────────────────────────────────────── */}
          {/* Module 3: The Architect's Ascension (4-Stage Timeline)   */}
          {/* ──────────────────────────────────────────────────────── */}
          <GlassCard className="md:col-span-12 p-6 sm:p-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <div className="flex items-center gap-2 font-mono text-xs text-white/80">
                <Activity className="size-4 text-lume-primary" />
                <span>MODULE 03 // THE ARCHITECT&apos;S ASCENSION</span>
              </div>
              <span className="font-mono text-[10px] text-white/40">4-STAGE TIMELINE</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
              {/* Stage 1 */}
              <div className="relative border-l-2 md:border-l-0 md:border-t-2 border-white/10 pl-4 md:pl-0 md:pt-4">
                <div className="font-mono text-[10px] text-lume-primary tracking-wider uppercase mb-1">
                  STAGE 01 // 2023–2026
                </div>
                <h4 className="text-base font-bold text-white mb-2">Foundations & Craft</h4>
                <p className="text-xs text-white/70 leading-relaxed">
                  Forged core full-stack foundations at Nanyang Polytechnic (3.91 GPA, Merit). Awarded The Ngee Ann Kongsi Tertiary Award and earned Google UX Design credentials.
                </p>
              </div>

              {/* Stage 2 */}
              <div className="relative border-l-2 md:border-l-0 md:border-t-2 border-white/10 pl-4 md:pl-0 md:pt-4">
                <div className="font-mono text-[10px] text-yellow-400 tracking-wider uppercase mb-1">
                  STAGE 02 // 2025
                </div>
                <h4 className="text-base font-bold text-white mb-2">Competitive Arena</h4>
                <p className="text-xs text-white/70 leading-relaxed">
                  Earned Silver Medal at WorldSkills Singapore 2025 in IT Software Solutions for Business. Selected for Team Singapore at the 14th WorldSkills ASEAN in Manila.
                </p>
              </div>

              {/* Stage 3 */}
              <div className="relative border-l-2 md:border-l-0 md:border-t-2 border-white/10 pl-4 md:pl-0 md:pt-4">
                <div className="font-mono text-[10px] text-cyan-400 tracking-wider uppercase mb-1">
                  STAGE 03 // 2025–2026
                </div>
                <h4 className="text-base font-bold text-white mb-2">Enterprise Scale • DBS Bank</h4>
                <p className="text-xs text-white/70 leading-relaxed">
                  1-year Software Engineering Internship in CBGT. Migrated MarTech portals from MongoDB to MariaDB with Java Spring Boot, Liquibase, and Jenkins on OpenShift.
                </p>
              </div>

              {/* Stage 4 */}
              <div className="relative border-l-2 md:border-l-0 md:border-t-2 border-white/10 pl-4 md:pl-0 md:pt-4">
                <div className="font-mono text-[10px] text-purple-400 tracking-wider uppercase mb-1">
                  STAGE 04 // PRESENT
                </div>
                <h4 className="text-base font-bold text-white mb-2">Current Orbit & Horizon</h4>
                <p className="text-xs text-white/70 leading-relaxed">
                  Fulfilling National Service duties while engineering deterministic AI agent harnesses (<code className="text-purple-300">forge</code>) and preparing for NUS Computer Science.
                </p>
              </div>
            </div>
          </GlassCard>

          {/* ──────────────────────────────────────────────────────── */}
          {/* Module 4: Deployed Systems & Flagship Builds (6 Cols)    */}
          {/* ──────────────────────────────────────────────────────── */}
          <GlassCard className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                <div className="flex items-center gap-2 font-mono text-xs text-white/80">
                  <Layers className="size-4 text-lume-primary" />
                  <span>MODULE 04 // FLAGSHIP BUILDS</span>
                </div>
                <span className="font-mono text-[10px] text-white/40">4 ACTIVE DEPLOYS</span>
              </div>

              <div className="space-y-4">
                {/* TriviaDuel */}
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/15 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white">TriviaDuel</span>
                    <span className="font-mono text-[10px] text-cyan-400">Next.js 16 • Redis • Gemini</span>
                  </div>
                  <p className="text-xs text-white/60 mt-1 leading-relaxed">
                    Real-time multiplayer trivia arena with sub-100ms sync for 10 concurrent players and multi-model fallback.
                  </p>
                </div>

                {/* SecureAsset */}
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/15 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white">SecureAsset</span>
                    <span className="font-mono text-[10px] text-emerald-400">MariaDB • Vite • Monorepo</span>
                  </div>
                  <p className="text-xs text-white/60 mt-1 leading-relaxed">
                    Forensic watermarking & digital asset protection with LiquidGlass UI, LSB, DCT, and EXIF embedding.
                  </p>
                </div>

                {/* forge */}
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/15 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white">forge</span>
                    <span className="font-mono text-[10px] text-yellow-400">AI Coding Harness</span>
                  </div>
                  <p className="text-xs text-white/60 mt-1 leading-relaxed">
                    Custom open-source AI agent coding harness engineered for deterministic multi-step software engineering.
                  </p>
                </div>

                {/* NovelPolish Studio */}
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/15 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white">NovelPolish Studio</span>
                    <span className="font-mono text-[10px] text-purple-400">Python • antigravity-cli</span>
                  </div>
                  <p className="text-xs text-white/60 mt-1 leading-relaxed">
                    Automated EPUB sanitization and chapter formatting pipeline with automated typographic rules.
                  </p>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* ──────────────────────────────────────────────────────── */}
          {/* Module 5: Technical Arsenal (6 Cols)                     */}
          {/* ──────────────────────────────────────────────────────── */}
          <GlassCard className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                <div className="flex items-center gap-2 font-mono text-xs text-white/80">
                  <Zap className="size-4 text-lume-primary" />
                  <span>MODULE 05 // TECHNICAL ARSENAL</span>
                </div>
                <span className="font-mono text-[10px] text-white/40">SYSTEM PROFICIENCIES</span>
              </div>

              <div className="space-y-4 font-mono text-xs">
                {/* Category 1 */}
                <div>
                  <span className="text-[10px] text-white/40 uppercase tracking-wider block mb-1.5">
                    Frontend & Spatial UI
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {["Next.js 16", "React 19", "TypeScript", "Tailwind CSS v4", "React Three Fiber", "Three.js", "Zustand", "GSAP"].map((tag) => (
                      <span key={tag} className="px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/10 text-white/80">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Category 2 */}
                <div>
                  <span className="text-[10px] text-white/40 uppercase tracking-wider block mb-1.5">
                    Backend & Languages
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {["Java", "Spring Boot", "Python", "Node.js", "C#", "Kotlin", "C++", "SQL"].map((tag) => (
                      <span key={tag} className="px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/10 text-white/80">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Category 3 */}
                <div>
                  <span className="text-[10px] text-white/40 uppercase tracking-wider block mb-1.5">
                    Data, Cloud & DevOps
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {["MariaDB", "MongoDB", "PostgreSQL", "Supabase", "Upstash Redis", "Docker", "OpenShift", "Jenkins", "Liquibase", "Git"].map((tag) => (
                      <span key={tag} className="px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/10 text-white/80">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Category 4 */}
                <div>
                  <span className="text-[10px] text-white/40 uppercase tracking-wider block mb-1.5">
                    AI & Experimentation
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {["Google Gemini API", "Custom AI Agent Harnesses", "Adobe Target", "Adobe Analytics"].map((tag) => (
                      <span key={tag} className="px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/10 text-white/80">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>
    </div>
  )
}
