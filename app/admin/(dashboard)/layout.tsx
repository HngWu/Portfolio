import * as React from "react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { validateSession } from "@/lib/auth/session"
import { AdminSidebar } from "@/components/admin/AdminSidebar"
import { AdminHeader } from "@/components/admin/AdminHeader"
import { AdminNavigationProgress } from "@/components/admin/AdminNavigationProgress"
import { ToastContainer } from "@/components/admin/Toast"
import { ConfirmDialog } from "@/components/admin/ConfirmDialog"

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
    <div className="flex min-h-screen bg-[#070707] text-white selection:bg-lume-primary/30 selection:text-white">
      <AdminNavigationProgress />
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-[1440px] w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Global Feedback Overlays */}
      <ToastContainer />
      <ConfirmDialog />
    </div>
  )
}
