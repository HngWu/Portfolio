"use client"

import * as React from "react"
import { login } from "@/app/actions/auth"
import { GlassCard } from "@/components/ui/GlassCard"

export default function LoginPage() {
  const [error, setError] = React.useState<string | null>(null)
  const [isPending, setIsPending] = React.useState(false)

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
    <main className="min-h-screen flex items-center justify-center p-4">
      <GlassCard className="w-full max-w-md p-8">
        <h1 className="text-2xl font-display text-white/90 mb-6 text-center">Admin Login</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-mono text-white/40 uppercase tracking-widest">Email</label>
            <input
              required
              name="email"
              type="email"
              placeholder="admin@lume-glass.local"
              className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-lume-primary transition-colors"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-mono text-white/40 uppercase tracking-widest">Password</label>
            <input
              required
              name="password"
              type="password"
              placeholder="••••••••"
              className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-lume-primary transition-colors"
            />
          </div>

          {error && (
            <div className="text-red-500 text-xs font-mono bg-red-500/10 p-2 rounded">
              {error}
            </div>
          )}

          <button
            disabled={isPending}
            type="submit"
            className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-3 rounded-lg transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {isPending ? "Signing in..." : "Login"}
          </button>
        </form>
      </GlassCard>
    </main>
  )
}
