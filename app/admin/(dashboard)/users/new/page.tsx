"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { createAdminAccount } from "@/app/actions/admin-users"
import { GlassCard } from "@/components/ui/GlassCard"
import { ArrowLeft, Save, Eye, EyeOff, Loader2 } from "lucide-react"
import { useToastStore } from "@/store/useToastStore"

export default function NewAdminUserPage() {
  const router = useRouter()
  const { addToast } = useToastStore()

  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      addToast("Passwords do not match.", "error")
      return
    }

    setIsSubmitting(true)

    try {
      await createAdminAccount({ email, password })
      addToast(`Admin user "${email}" created successfully`, "success")
      router.push("/admin/users")
      router.refresh()
    } catch (err: any) {
      addToast(err?.message || "Failed to create admin user.", "error")
      setIsSubmitting(false)
    }
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
          <h1 className="text-xl sm:text-2xl font-display text-white">Create Admin Account</h1>
          <p className="text-xs text-white/50 mt-0.5">Add a new administrative user to the portfolio system.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <GlassCard className="p-6 sm:p-8 space-y-6 bg-white/[0.01] border-white/5 rounded-3xl">
          <div>
            <label htmlFor="new-admin-email" className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-2 font-medium">
              Email Address <span className="text-lume-primary">*</span>
            </label>
            <input
              id="new-admin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="newadmin@example.com"
              required
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-lume-primary/60 focus:ring-1 focus:ring-lume-primary/20 transition-all font-mono"
            />
            <p className="text-[11px] text-white/40 mt-1.5 leading-relaxed">
              Unique email address used for admin authentication.
            </p>
          </div>

          <div>
            <label htmlFor="new-admin-password" className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-2 font-medium">
              Password (min 6 chars) <span className="text-lume-primary">*</span>
            </label>
            <div className="relative">
              <input
                id="new-admin-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
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
              Must be at least 6 characters with secure entropy.
            </p>
          </div>

          <div>
            <label htmlFor="new-admin-confirm-password" className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-2 font-medium">
              Confirm Password <span className="text-lume-primary">*</span>
            </label>
            <div className="relative">
              <input
                id="new-admin-confirm-password"
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
              Re-enter the password to verify accuracy.
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
            aria-label={isSubmitting ? "Creating admin account..." : "Create Account"}
            className="flex items-center gap-2 px-6 py-2.5 bg-lume-primary text-black font-bold rounded-xl hover:bg-lume-primary/90 transition-all active:scale-95 disabled:opacity-50 text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(74,255,180,0.25)]"
          >
            {isSubmitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-3.5" />
            )}
            <span>{isSubmitting ? "Creating..." : "Create Account"}</span>
          </button>
        </div>
      </form>
    </div>
  )
}
