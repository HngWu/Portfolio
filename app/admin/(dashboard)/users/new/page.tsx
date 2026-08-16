"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { createAdminAccount } from "@/app/actions/admin-users"
import { GlassCard } from "@/components/ui/GlassCard"
import { ArrowLeft, Save } from "lucide-react"

export default function NewAdminUserPage() {
  const router = useRouter()
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await createAdminAccount({ email, password })
      router.push("/admin/users")
    } catch (err: any) {
      setError(err?.message || "Failed to create admin user.")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-8 max-w-xl mx-auto">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/admin/users")}
          className="p-2 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-xl transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-display text-white/90">Create Admin Account</h1>
          <p className="text-sm text-white/50">Add a new administrative user to the system.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <GlassCard className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase text-white/50 mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="newadmin@example.com"
              required
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-lume-primary/50"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-white/50 mb-2">Password (min 6 chars)</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-lume-primary/50"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-white/50 mb-2">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-lume-primary/50"
            />
          </div>
        </GlassCard>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.push("/admin/users")}
            className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white/70 rounded-xl text-sm font-medium transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 bg-lume-primary text-black font-semibold rounded-xl hover:bg-lume-primary/90 transition-all active:scale-95 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? "Creating..." : "Create Admin Account"}
          </button>
        </div>
      </form>
    </div>
  )
}
