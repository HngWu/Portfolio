"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { getAdminUser, updateAdminPassword, SafeAdminUser } from "@/app/actions/admin-users"
import { GlassCard } from "@/components/ui/GlassCard"
import { ArrowLeft, Key } from "lucide-react"

export default function EditAdminUserPage() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()

  const [user, setUser] = React.useState<SafeAdminUser | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  const [newPassword, setNewPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState(false)

  React.useEffect(() => {
    let isMounted = true
    async function load() {
      const data = await getAdminUser(id)
      if (isMounted) {
        setUser(data)
        setIsLoading(false)
      }
    }
    load()
    return () => {
      isMounted = false
    }
  }, [id])

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    setIsSubmitting(true)
    setError(null)
    setSuccess(false)

    try {
      await updateAdminPassword(id, newPassword)
      setSuccess(true)
      setNewPassword("")
      setConfirmPassword("")
      setIsSubmitting(false)
    } catch (err: any) {
      setError(err?.message || "Failed to update password.")
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="size-8 border-2 border-lume-primary/20 border-t-lume-primary rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-20 text-white/50">
        Admin account not found.
      </div>
    )
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
          <h1 className="text-2xl font-display text-white/90">Reset Password</h1>
          <p className="text-sm text-white/50">Reset password for <span className="text-lume-primary font-mono">{user.email}</span></p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 text-sm">
          Password updated successfully and account unlocked.
        </div>
      )}

      <form onSubmit={handlePasswordReset} className="space-y-6">
        <GlassCard className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase text-white/50 mb-2">New Password (min 6 chars)</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-lume-primary/50"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-white/50 mb-2">Confirm New Password</label>
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
            Back to Admins
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 bg-lume-primary text-black font-semibold rounded-xl hover:bg-lume-primary/90 transition-all active:scale-95 disabled:opacity-50"
          >
            <Key className="w-4 h-4" />
            {isSubmitting ? "Updating..." : "Update Password"}
          </button>
        </div>
      </form>
    </div>
  )
}
