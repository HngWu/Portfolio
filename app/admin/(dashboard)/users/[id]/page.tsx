"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { getAdminUser, updateAdminPassword, SafeAdminUser } from "@/app/actions/admin-users"
import { GlassCard } from "@/components/ui/GlassCard"
import { ArrowLeft, Key, Eye, EyeOff } from "lucide-react"
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
    <div className="space-y-6 max-w-xl mx-auto pb-20 animate-in fade-in duration-300">
      <div className="flex items-center gap-3.5">
        <button
          onClick={() => router.push("/admin/users")}
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
        <GlassCard className="p-6 space-y-4 bg-white/[0.01]">
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-white/50 mb-1.5">
              New Password (min 6 chars)
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full bg-black/50 border border-white/10 rounded-xl pl-4 pr-10 py-2.5 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-lume-primary/50 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/40 hover:text-white"
              >
                {showNewPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-white/50 mb-1.5">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full bg-black/50 border border-white/10 rounded-xl pl-4 pr-10 py-2.5 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-lume-primary/50 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/40 hover:text-white"
              >
                {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>
        </GlassCard>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.push("/admin/users")}
            className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-xl text-xs font-semibold transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 bg-lume-primary text-black font-bold rounded-xl hover:bg-lume-primary/90 transition-all active:scale-95 disabled:opacity-50 text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(74,255,180,0.25)]"
          >
            <Key className="size-3.5" />
            <span>{isSubmitting ? "Updating..." : "Update Password"}</span>
          </button>
        </div>
      </form>
    </div>
  )
}
