"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { validateSession } from "@/lib/auth/session"
import {
  pushSqliteToSupabase,
  pullSupabaseToSqlite,
  getLastSyncStatus,
  type SyncResult,
  type SyncStatus
} from "@/lib/db"

async function verifyAdmin(): Promise<boolean> {
  const cookieStore = await cookies()
  const token = cookieStore.get("admin_session")?.value
  if (!token) return false
  const { valid } = await validateSession(token)
  return Boolean(valid)
}

export async function getLastSyncStatusAction(): Promise<SyncStatus> {
  const isAdmin = await verifyAdmin()
  if (!isAdmin) {
    throw new Error("Unauthorized: Admin access required.")
  }

  return getLastSyncStatus()
}

export async function syncDatabasesAction(
  direction: "push" | "pull",
  options?: { allowEmpty?: boolean }
): Promise<SyncResult> {
  const isAdmin = await verifyAdmin()
  if (!isAdmin) {
    return {
      success: false,
      error: "Unauthorized: Admin session expired or invalid."
    }
  }

  let result: SyncResult

  if (direction === "push") {
    result = await pushSqliteToSupabase()
  } else if (direction === "pull") {
    result = await pullSupabaseToSqlite(options)
  } else {
    return {
      success: false,
      error: `Invalid sync direction: ${direction}`
    }
  }

  if (result.success) {
    // Revalidate all data-driven public and admin paths
    revalidatePath("/", "layout")
    revalidatePath("/admin")
    revalidatePath("/admin/tiles")
    revalidatePath("/admin/detailed-items")
    revalidatePath("/admin/projects")
    revalidatePath("/cv")
  }

  return result
}
