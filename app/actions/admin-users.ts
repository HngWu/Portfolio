"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import {
  getAllAdminUsersDb,
  getAdminUserByEmailDb,
  getAdminUserByIdDb,
  createAdminUserDb,
  updateAdminUserPasswordDb,
  unlockAdminUserDb,
  deleteAdminUserDb,
  AdminUserRow
} from "@/lib/db"
import { hashPassword } from "@/lib/auth/crypto"
import { validateSession } from "@/lib/auth/session"

export type SafeAdminUser = Omit<AdminUserRow, "password_hash" | "salt">

async function getAuthenticatedUser(): Promise<{ id: string } | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("admin_session")?.value
  if (!token) return null
  const { valid, userId } = await validateSession(token)
  if (!valid || !userId) return null
  return { id: userId }
}

export async function getAdminUsers(): Promise<SafeAdminUser[]> {
  const currentUser = await getAuthenticatedUser()
  if (!currentUser) throw new Error("Unauthorized")

  const users = getAllAdminUsersDb()
  return users.map(({ password_hash, salt, ...safeUser }) => safeUser)
}

export async function getAdminUser(id: string): Promise<SafeAdminUser | null> {
  const currentUser = await getAuthenticatedUser()
  if (!currentUser) throw new Error("Unauthorized")

  const user = getAdminUserByIdDb(id)
  if (!user) return null
  const { password_hash, salt, ...safeUser } = user
  return safeUser
}

export async function createAdminAccount(data: { email: string; password: string }): Promise<void> {
  const currentUser = await getAuthenticatedUser()
  if (!currentUser) throw new Error("Unauthorized")

  const email = data.email.toLowerCase().trim()
  if (!email || !data.password || data.password.length < 6) {
    throw new Error("Email and a password of at least 6 characters are required.")
  }

  const existing = getAdminUserByEmailDb(email)
  if (existing) {
    throw new Error("An admin account with this email already exists.")
  }

  const { hash, salt } = await hashPassword(data.password)
  createAdminUserDb({
    email,
    password_hash: hash,
    salt
  })

  revalidatePath("/admin/users")
}

export async function updateAdminPassword(id: string, newPassword: string): Promise<void> {
  const currentUser = await getAuthenticatedUser()
  if (!currentUser) throw new Error("Unauthorized")

  if (!newPassword || newPassword.length < 6) {
    throw new Error("Password must be at least 6 characters.")
  }

  const user = getAdminUserByIdDb(id)
  if (!user) throw new Error("Admin user not found.")

  const { hash, salt } = await hashPassword(newPassword)
  updateAdminUserPasswordDb(id, hash, salt)
  unlockAdminUserDb(id)

  revalidatePath("/admin/users")
}

export async function unlockAdminAccount(id: string): Promise<void> {
  const currentUser = await getAuthenticatedUser()
  if (!currentUser) throw new Error("Unauthorized")

  unlockAdminUserDb(id)
  revalidatePath("/admin/users")
}

export async function deleteAdminAccount(id: string): Promise<void> {
  const currentUser = await getAuthenticatedUser()
  if (!currentUser) throw new Error("Unauthorized")

  if (currentUser.id === id) {
    throw new Error("You cannot delete your own logged-in admin account.")
  }

  const allUsers = getAllAdminUsersDb()
  if (allUsers.length <= 1) {
    throw new Error("Cannot delete the last remaining admin account.")
  }

  deleteAdminUserDb(id)
  revalidatePath("/admin/users")
}
