"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { getAdminUsers, unlockAdminAccount, deleteAdminAccount, SafeAdminUser } from "@/app/actions/admin-users"
import { GlassCard } from "@/components/ui/GlassCard"
import { Plus, Trash2, Key, Unlock, ShieldCheck, ShieldAlert, Search } from "lucide-react"

export default function AdminUsersPage() {
  const router = useRouter()
  const [users, setUsers] = React.useState<SafeAdminUser[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)

  const loadData = React.useCallback(async (isMounted: boolean) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getAdminUsers()
      if (isMounted) {
        setUsers(data || [])
        setIsLoading(false)
      }
    } catch (err: any) {
      if (isMounted) {
        setError(err?.message || "Failed to load admin users.")
        setIsLoading(false)
      }
    }
  }, [])

  React.useEffect(() => {
    let isMounted = true
    loadData(isMounted)
    return () => {
      isMounted = false
    }
  }, [loadData])

  const handleUnlock = async (id: string, email: string) => {
    try {
      await unlockAdminAccount(id)
      loadData(true)
    } catch (err: any) {
      alert(err?.message || "Failed to unlock account.")
    }
  }

  const handleDelete = async (id: string, email: string) => {
    if (confirm(`Are you sure you want to delete admin user "${email}"?`)) {
      try {
        await deleteAdminAccount(id)
        loadData(true)
      } catch (err: any) {
        alert(err?.message || "Failed to delete user.")
      }
    }
  }

  const displayedUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const isLockedOut = (user: SafeAdminUser) => {
    if (!user.lockout_until) return false
    return new Date(user.lockout_until).getTime() > Date.now()
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display text-white/90">Admin User Management</h1>
          <p className="text-sm text-white/50">Manage administrative accounts, reset passwords, and unlock accounts.</p>
        </div>
        <button
          onClick={() => router.push("/admin/users/new")}
          className="flex items-center gap-2 px-4 py-2 bg-lume-primary/20 text-lume-primary rounded-xl hover:bg-lume-primary/30 transition-all active:scale-95 shadow-lg shadow-lume-primary/5 text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Admin Account
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Search Input */}
      <div className="relative max-w-sm">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search admin users by email..."
          className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-lume-primary/50"
        />
      </div>

      {/* Users List */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="size-8 border-2 border-lume-primary/20 border-t-lume-primary rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid gap-4">
          {displayedUsers.map((user) => {
            const locked = isLockedOut(user)

            return (
              <GlassCard key={user.id} className="p-4 flex items-center justify-between group hover:border-lume-primary/30 transition-all duration-500">
                <div className="flex items-center gap-4 overflow-hidden">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-mono transition-colors ${
                    locked ? "bg-red-500/20 text-red-400" : "bg-white/5 text-lume-primary group-hover:bg-lume-primary/10"
                  }`}>
                    {locked ? <ShieldAlert className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                  </div>
                  <div className="overflow-hidden">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-white/90">{user.email}</span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase tracking-tighter border ${
                        locked
                          ? "bg-red-500/10 text-red-400 border-red-500/20"
                          : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      }`}>
                        {locked ? "Locked Out" : "Active"}
                      </span>
                    </div>
                    <div className="text-xs text-white/40 mt-1 font-mono">
                      Created: {new Date(user.created_at || "").toLocaleDateString()}
                      {user.failed_attempts > 0 && ` • Failed Attempts: ${user.failed_attempts}`}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                  {locked && (
                    <button
                      onClick={() => handleUnlock(user.id, user.email)}
                      className="p-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-xl transition-all"
                      title="Unlock Account"
                    >
                      <Unlock className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => router.push(`/admin/users/${user.id}`)}
                    className="p-2 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-xl transition-all"
                    title="Change Password"
                  >
                    <Key className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(user.id, user.email)}
                    className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400/60 hover:text-red-400 rounded-xl transition-all"
                    title="Delete Account"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </GlassCard>
            )
          })}

          {displayedUsers.length === 0 && (
            <div className="text-center py-20 bg-white/[0.02] rounded-3xl border border-dashed border-white/10">
              <p className="text-sm text-white/40 font-mono">No admin accounts found.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
