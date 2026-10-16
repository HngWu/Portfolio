"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { validateSession } from "@/lib/auth/session"
import {
  getActiveProvider,
  setActiveProvider,
  clearActiveProviderOverride,
  getDatabaseStatus,
  testSupabaseConnection,
  type DatabaseProvider,
  type DatabaseStatus
} from "@/lib/db"

async function verifyAdmin(): Promise<boolean> {
  const cookieStore = await cookies()
  const token = cookieStore.get("admin_session")?.value
  if (!token) return false
  const { valid } = await validateSession(token)
  return Boolean(valid)
}

export async function getDatabaseStatusAction(): Promise<DatabaseStatus> {
  const isAdmin = await verifyAdmin()
  if (!isAdmin) {
    throw new Error("Unauthorized: Admin access required.")
  }

  return getDatabaseStatus()
}

export async function switchDatabaseProviderAction(
  provider: DatabaseProvider
): Promise<{ success: boolean; activeProvider?: DatabaseProvider; error?: string; latencyMs?: number }> {
  const isAdmin = await verifyAdmin()
  if (!isAdmin) {
    return { success: false, error: "Unauthorized: Admin session expired or invalid." }
  }

  if (provider === "supabase") {
    const testResult = await testSupabaseConnection(true)
    if (!testResult.ok) {
      return {
        success: false,
        error: testResult.error || "Failed to establish connection to Supabase."
      }
    }

    await setActiveProvider("supabase")
    revalidatePath("/", "layout")
    revalidatePath("/admin", "layout")

    return {
      success: true,
      activeProvider: "supabase",
      latencyMs: testResult.latencyMs
    }
  }

  // Switch to local SQLite
  await setActiveProvider("sqlite")
  revalidatePath("/", "layout")
  revalidatePath("/admin", "layout")

  return {
    success: true,
    activeProvider: "sqlite"
  }
}

export async function resetDatabaseProviderAction(): Promise<{ success: boolean; activeProvider?: DatabaseProvider; error?: string }> {
  const isAdmin = await verifyAdmin()
  if (!isAdmin) {
    return { success: false, error: "Unauthorized: Admin session expired or invalid." }
  }

  await clearActiveProviderOverride()
  const defaultProvider = await getActiveProvider()
  revalidatePath("/", "layout")
  revalidatePath("/admin", "layout")

  return {
    success: true,
    activeProvider: defaultProvider
  }
}
