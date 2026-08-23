"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { getAdminUsers, unlockAdminAccount, deleteAdminAccount, SafeAdminUser } from "@/app/actions/admin-users"
import { GlassCard } from "@/components/ui/GlassCard"
import { Plus, Trash2, Key, Unlock, ShieldCheck, ShieldAlert, Search, X, Calendar, UserCheck } from "lucide-react"
import { useToastStore } from "@/store/useToastStore"
import { useConfirmStore } from "@/store/useConfirmStore"

export default function AdminUsersPage() {
  const router = useRouter()
  const { addToast } = useToastStore()
  const { confirm } = useConfirmStore()

  const [users, setUsers] = React.useState<SafeAdminUser[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState("")

  const loadData = React.useCallback(async (isMounted: boolean) => {
    setIsLoading(true)
    try {
      const data = await getAdminUsers()
      if (isMounted) {
        setUsers(data || [])
        setIsLoading(false)
      }
    } catch (err: any) {
      if (isMounted) {
        addToast(err?.message || "Failed to load admin users.", "error")
        setIsLoading(false)
      }
    }
  }, [addToast])

  React.useEffect(() => {
    let isMounted = true
    loadData(isMounted)
    return () => {
      isMounted = false
    }
  }, [loadData])

  const handleUnlock = async (id: string, email: string) => {
    const shouldUnlock = await confirm({
      title: "Unlock Admin Account?",
      message: `Unlock admin access and clear failed login attempts for "${email}"?`,
      confirmText: "Unlock Account",
      cancelText: "Cancel",
      isDestructive: false
    })

    if (shouldUnlock) {
      try {
        await unlockAdminAccount(id)
        addToast(`Admin account "${email}" unlocked`, "success")
        loadData(true)
      } catch (err: any) {
        addToast(err?.message || "Failed to unlock account.", "error")
      }
    }
  }

  const handleDelete = async (id: string, email: string) => {
    const shouldDelete = await confirm({
      title: "Delete Admin Account?",
      message: `Are you sure you want to permanently remove admin user "${email}"? This action cannot be undone.`,
      confirmText: "Delete Account",
      cancelText: "Cancel",
      isDestructive: true
    })

    if (shouldDelete) {
      try {
        await deleteAdminAccount(id)
        addToast(`Admin user "${email}" deleted`, "success")
        loadData(true)
      } catch (err: any) {
        addToast(err?.message || "Failed to delete user.", "error")
      }
    }
  }

  const displayedUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase().trim())
  )

  const isLockedOut = (user: SafeAdminUser) => {
    if (!user.lockout_until) return false
    return new Date(user.lockout_until).getTime() > Date.now()
  }

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-display text-white">Admin User Management</h1>
            <span className="text-xs font-mono text-white/40 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/5">
              {users.length} Admins
            </span>
          </div>
          <p className="text-xs sm:text-sm text-white/50 mt-1">
            Manage administrative accounts, rotate passwords, and unlock security lockouts.
          </p>
        </div>
        <button
          onClick={() => router.push("/admin/users/new")}
          className="flex items-center gap-2 px-5 py-2.5 bg-lume-primary text-black rounded-xl hover:bg-lume-primary/90 transition-all active:scale-95 shadow-[0_0_20px_rgba(74,255,180,0.25)] text-xs font-bold uppercase tracking-wider"
        >
          <Plus className="size-3.5" />
          <span>Add Admin</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between p-2 bg-white/[0.02] border border-white/5 rounded-2xl backdrop-blur-xl">
        <div className="relative w-full max-w-md">
          <Search className="size-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search admin accounts by email..."
            className="w-full bg-black/50 border border-white/10 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-lume-primary/50 transition-colors font-mono"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-white/30 hover:text-white"
            >
              <X className="size-3" />
            </button>
          )}
        </div>
      </div>

      {/* Users List */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="size-8 border-2 border-lume-primary/20 border-t-lume-primary rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid gap-3">
          {displayedUsers.map((user) => {
            const locked = isLockedOut(user)

            return (
              <GlassCard 
                key={user.id} 
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:border-lume-primary/30 transition-all duration-300 bg-white/[0.01]"
              >
                <div className="flex items-start sm:items-center gap-4 overflow-hidden">
                  <div className={`size-10 rounded-xl flex items-center justify-center text-xs font-mono transition-colors shrink-0 ${
                    locked ? "bg-red-500/20 text-red-400 border border-red-500/30" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  }`}>
                    {locked ? <ShieldAlert className="size-5" /> : <ShieldCheck className="size-5" />}
                  </div>

                  <div className="overflow-hidden space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-sm font-semibold text-white/95">{user.email}</span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase tracking-wider border ${
                        locked
                          ? "bg-red-500/10 text-red-400 border-red-500/20"
                          : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      }`}>
                        {locked ? "Locked Out" : "Active"}
                      </span>
                    </div>

                    <div className="text-[11px] text-white/40 font-mono flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="size-3 text-white/30" />
                        <span>Created: {new Date(user.created_at || "").toLocaleDateString()}</span>
                      </span>
                      {user.failed_attempts > 0 && (
                        <span className="text-amber-400/80">
                          • {user.failed_attempts} failed attempt(s)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Touch-First Action Buttons */}
                <div className="flex items-center justify-end gap-2 border-t sm:border-t-0 border-white/5 pt-2 sm:pt-0 shrink-0">
                  {locked && (
                    <button
                      type="button"
                      onClick={() => handleUnlock(user.id, user.email)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-xl transition-all border border-amber-500/20 text-xs font-semibold"
                      title="Unlock Account"
                    >
                      <Unlock className="size-3.5" />
                      <span>Unlock</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => router.push(`/admin/users/${user.id}`)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-xl text-xs font-semibold transition-all border border-white/5"
                    title="Change Password"
                  >
                    <Key className="size-3.5 text-lume-primary" />
                    <span>Reset Key</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(user.id, user.email)}
                    className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400/70 hover:text-red-400 rounded-xl transition-all border border-red-500/20"
                    title="Delete Account"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </GlassCard>
            )
          })}

          {displayedUsers.length === 0 && (
            <div className="text-center py-20 bg-white/[0.01] rounded-3xl border border-dashed border-white/10">
              <UserCheck className="size-8 text-white/20 mx-auto mb-2" />
              <p className="text-xs font-mono text-white/40">No admin accounts found matching your query.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
