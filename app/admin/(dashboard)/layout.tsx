import * as React from "react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { validateSession } from "@/lib/auth/session"
import { AdminSidebar } from "@/components/admin/AdminSidebar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const token = cookieStore.get("admin_session")?.value

  if (!token) {
    redirect("/admin/login")
  }

  const { valid } = await validateSession(token)
  if (!valid) {
    redirect("/admin/login")
  }

  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
