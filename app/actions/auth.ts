"use server"

import crypto from "crypto"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import {
  getAllAdminUsersDb,
  getAdminUserByEmailDb,
  createAdminUserDb,
  updateAdminUserLockoutDb
} from "@/lib/db"
import { hashPassword, verifyPassword } from "@/lib/auth/crypto"
import { createSession, revokeSession } from "@/lib/auth/session"

const MAX_FAILED_ATTEMPTS = 5
const LOCKOUT_DURATION_MS = 15 * 60 * 1000 // 15 minutes

async function ensureInitialAdminUser() {
  try {
    const allUsers = getAllAdminUsersDb()
    if (allUsers.length === 0) {
      const initialEmail = process.env.INITIAL_ADMIN_EMAIL
      const initialPassword = process.env.INITIAL_ADMIN_PASSWORD
      if (!initialEmail || !initialPassword) {
        console.warn("[SECURITY] No admin users exist. Set INITIAL_ADMIN_EMAIL and INITIAL_ADMIN_PASSWORD in environment variables to bootstrap initial admin.")
        return
      }
      const { hash, salt } = await hashPassword(initialPassword)
      createAdminUserDb({
        email: initialEmail.toLowerCase().trim(),
        password_hash: hash,
        salt: salt
      })
      console.log(`[SECURITY SETUP] Initial Admin User Created: ${initialEmail}`)
    }
  } catch (e) {
    console.warn("[SECURITY SETUP] Unable to initialize admin user:", e)
  }
}

export async function login(formData: FormData) {
  const emailInput = (formData.get("email") as string || "").toLowerCase().trim()
  const passwordInput = (formData.get("password") as string || "")

  if (!emailInput || !passwordInput) {
    return { error: "Email and password are required." }
  }

  await ensureInitialAdminUser()

  let user = getAdminUserByEmailDb(emailInput)

  if (!user) {
    return { error: "Invalid email or password." }
  }

  // Check account lockout status
  if (user.lockout_until) {
    const lockoutTime = new Date(user.lockout_until).getTime()
    if (lockoutTime > Date.now()) {
      const minutesRemaining = Math.ceil((lockoutTime - Date.now()) / (60 * 1000))
      return { error: `Account locked due to multiple failed attempts. Try again in ${minutesRemaining} minute(s).` }
    } else {
      // Lockout expired, reset lockout
      updateAdminUserLockoutDb(user.id, 0, null)
      user.failed_attempts = 0
      user.lockout_until = null
    }
  }

  // Verify password using Scrypt constant-time comparison
  const isValid = await verifyPassword(passwordInput, user.password_hash, user.salt)

  if (!isValid) {
    const newFailedCount = (user.failed_attempts || 0) + 1
    let newLockoutUntil: string | null = null

    if (newFailedCount >= MAX_FAILED_ATTEMPTS) {
      newLockoutUntil = new Date(Date.now() + LOCKOUT_DURATION_MS).toISOString()
    }

    updateAdminUserLockoutDb(user.id, newFailedCount, newLockoutUntil)

    if (newLockoutUntil) {
      return { error: "Too many failed attempts. Account locked for 15 minutes." }
    }

    return { error: `Invalid email or password. (${MAX_FAILED_ATTEMPTS - newFailedCount} attempts remaining)` }
  }

  // Password valid - reset failed attempts
  updateAdminUserLockoutDb(user.id, 0, null)

  // Create active session token
  const rawSessionToken = await createSession(user.id)

  const cookieStore = await cookies()
  cookieStore.set("admin_session", rawSessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7 // 7 days
  })

  redirect("/admin")
}

export async function logout() {
  const cookieStore = await cookies()
  const token = cookieStore.get("admin_session")?.value

  if (token) {
    await revokeSession(token)
    cookieStore.delete("admin_session")
  }

  redirect("/admin/login")
}
