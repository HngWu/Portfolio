"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { getAdminUser, updateAdminPassword, SafeAdminUser } from "@/app/actions/admin-users"
import { GlassCard } from "@/components/ui/GlassCard"
import { ArrowLeft, Key, Eye, EyeOff, Loader2 } from "lucide-react"
import { useToastStore } from "@/store/useToastStore"

export default function EditAdminUserPage() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()
  const { addToast } = useToastStore()

  const [user, setUser] = React.useState<SafeAdminUser | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  const [newPassword, setNewPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [showNewPassword, setShowNewPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  React.useEffect(() => {
    let isMounted = true
    async function load() {
      try {
        const data = await getAdminUser(id)
        if (isMounted) {
          setUser(data)
          setIsLoading(false)
        }
      } catch (err: any) {
        addToast("Failed to load user: " + err.message, "error")
        if (isMounted) setIsLoading(false)
      }
    }
    load()
    return () => {
      isMounted = false
    }
  }, [id, addToast])

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      addToast("Passwords do not match.", "error")
      return
    }

    setIsSubmitting(true)

    try {
      await updateAdminPassword(id, newPassword)
      addToast("Password updated and account unlocked successfully", "success")
      setNewPassword("")
      setConfirmPassword("")
      setIsSubmitting(false)
      router.push("/admin/users")
      router.refresh()
    } catch (err: any) {
      addToast(err?.message || "Failed to update password.", "error")
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
      <div className="text-center py-20 text-white/50 font-mono text-xs">
        Admin account not found.
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-xl mx-auto pb-36 animate-in fade-in duration-300">
      <div className="flex items-center gap-3.5">
        <button
          type="button"
          onClick={() => router.push("/admin/users")}
          aria-label="Back to Admin Users"
          className="p-2.5 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-xl transition-all"
          title="Back to Admins"
        >
          <ArrowLeft className="size-4" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-display text-white">Reset Credentials</h1>
          <p className="text-xs text-white/50 mt-0.5 font-mono">
            Reset access key for <span className="text-lume-primary">{user.email}</span>
          </p>
        </div>
      </div>

      <form onSubmit={handlePasswordReset} className="space-y-6">
        <GlassCard className="p-6 sm:p-8 space-y-6 bg-white/[0.01] border-white/5 rounded-3xl">
          <div>
            <label htmlFor="reset-new-password" className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-2 font-medium">
              New Password (min 6 chars) <span className="text-lume-primary">*</span>
            </label>
            <div className="relative">
              <input
                id="reset-new-password"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full bg-black/50 border border-white/10 rounded-xl pl-4 pr-10 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-lume-primary/60 focus:ring-1 focus:ring-lume-primary/20 transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                aria-label={showNewPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-white/40 hover:text-white transition-colors"
              >
                {showNewPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            <p className="text-[11px] text-white/40 mt-1.5 leading-relaxed">
              Enter a new secure access key for this account.
            </p>
          </div>

          <div>
            <label htmlFor="reset-confirm-password" className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-2 font-medium">
              Confirm New Password <span className="text-lume-primary">*</span>
            </label>
            <div className="relative">
              <input
                id="reset-confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full bg-black/50 border border-white/10 rounded-xl pl-4 pr-10 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-lume-primary/60 focus:ring-1 focus:ring-lume-primary/20 transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-white/40 hover:text-white transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            <p className="text-[11px] text-white/40 mt-1.5 leading-relaxed">
              Re-enter the new password to confirm match.
            </p>
          </div>
        </GlassCard>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.push("/admin/users")}
            aria-label="Cancel and return to Users"
            className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-xl text-xs font-semibold transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            aria-label={isSubmitting ? "Updating password..." : "Update Password"}
            className="flex items-center gap-2 px-6 py-2.5 bg-lume-primary text-black font-bold rounded-xl hover:bg-lume-primary/90 transition-all active:scale-95 disabled:opacity-50 text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(74,255,180,0.25)]"
          >
            {isSubmitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Key className="size-3.5" />
            )}
            <span>{isSubmitting ? "Updating..." : "Update Password"}</span>
          </button>
        </div>
      </form>
    </div>
  )
}
