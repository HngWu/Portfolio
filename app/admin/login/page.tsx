"use client"

import * as React from "react"
import Link from "next/link"
import { login } from "@/app/actions/auth"
import { GlassCard } from "@/components/ui/GlassCard"
import { Layers, ArrowLeft, Eye, EyeOff, ShieldCheck, Loader2 } from "lucide-react"

export default function LoginPage() {
  const [error, setError] = React.useState<string | null>(null)
  const [isPending, setIsPending] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsPending(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const result = await login(formData)

    if (result?.error) {
      setError(result.error)
      setIsPending(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-[#070707] relative overflow-hidden">
      {/* Background Decorative Glow */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 size-[600px] bg-lume-primary/[0.04] rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-40 left-1/3 size-[500px] bg-blue-500/[0.03] rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10 animate-in fade-in duration-300">
        {/* Back Link */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-mono text-white/40 hover:text-white transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            <span>Return to Portfolio</span>
          </Link>
        </div>

        <GlassCard className="p-6 sm:p-8 space-y-6 bg-white/[0.01] border-white/5 shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl rounded-3xl">
          <div className="text-center space-y-2">
            <div className="size-12 rounded-2xl bg-lume-primary/10 border border-lume-primary/30 flex items-center justify-center text-lume-primary mx-auto shadow-[0_0_20px_rgba(74,255,180,0.15)]">
              <Layers className="size-6" />
            </div>
            <h1 className="text-2xl font-display text-white tracking-tight">Admin Console</h1>
            <p className="text-xs text-white/50 font-mono">Sign in to manage portfolio content</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="login-email" className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-2 font-medium">
                Email Address <span className="text-lume-primary">*</span>
              </label>
              <input
                id="login-email"
                required
                name="email"
                type="email"
                placeholder="admin@example.com"
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-lume-primary/60 focus:ring-1 focus:ring-lume-primary/20 transition-all font-mono"
              />
              <p className="text-[11px] text-white/40 mt-1.5 leading-relaxed">
                Enter your registered administrative email.
              </p>
            </div>
            
            <div>
              <label htmlFor="login-password" className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-2 font-medium">
                Access Password <span className="text-lume-primary">*</span>
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  required
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full bg-black/50 border border-white/10 rounded-xl pl-4 pr-10 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-lume-primary/60 focus:ring-1 focus:ring-lume-primary/20 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-white/40 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              <p className="text-[11px] text-white/40 mt-1.5 leading-relaxed">
                Enter your administrator access key.
              </p>
            </div>

            {error && (
              <div className="text-red-400 text-xs font-mono bg-red-500/10 border border-red-500/20 p-3 rounded-xl animate-in fade-in duration-200">
                {error}
              </div>
            )}

            <button
              disabled={isPending}
              type="submit"
              aria-label={isPending ? "Authenticating admin credentials..." : "Access Dashboard"}
              className="w-full bg-lume-primary text-black font-bold py-3 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(74,255,180,0.25)] flex items-center justify-center gap-2 mt-2 hover:bg-lume-primary/90"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin text-black" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <span>Access Dashboard</span>
              )}
            </button>
          </form>
        </GlassCard>
      </div>
    </main>
  )
}
