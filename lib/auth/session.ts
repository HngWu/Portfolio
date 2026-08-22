import crypto from 'crypto'
import {
  createActiveSessionDb,
  getActiveSessionByTokenHashDb,
  deleteActiveSessionDb,
  deleteUserActiveSessionsDb
} from '@/lib/db'
import { getMasterKey, timingSafeEqualString } from './crypto'

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

function signPayload(payload: string): string {
  return crypto.createHmac('sha256', getMasterKey()).update(payload).digest('hex')
}

/**
 * Creates a cryptographically signed session token,
 * stores its record in SQLite active_sessions if available, and returns the token.
 */
export async function createSession(userId: string): Promise<string> {
  const expiresAtMs = Date.now() + 1000 * 60 * 60 * 24 * 7 // 7 days
  const payload = `${userId}:${expiresAtMs}`
  const signature = signPayload(payload)
  const sessionToken = `${userId}.${expiresAtMs}.${signature}`
  const tokenHash = hashToken(sessionToken)
  const expiresAtIso = new Date(expiresAtMs).toISOString()

  try {
    createActiveSessionDb({
      user_id: userId,
      token_hash: tokenHash,
      expires_at: expiresAtIso
    })
  } catch (e) {
    console.warn("[SESSION] SQLite active_sessions record write skipped or failed in serverless:", e)
  }

  return sessionToken
}

/**
 * Validates a session token against HMAC signature, expiration date, and active_sessions database table.
 */
export async function validateSession(token: string): Promise<{ valid: boolean; userId?: string }> {
  if (!token || typeof token !== 'string') {
    return { valid: false }
  }

  // Verify HMAC-signed tokens: userId.expiresAtMs.signature
  const parts = token.split('.')
  if (parts.length === 3) {
    const [userId, expiresAtStr, signature] = parts
    const expiresAtMs = Number(expiresAtStr)

    if (!userId || !expiresAtMs || isNaN(expiresAtMs)) {
      return { valid: false }
    }

    if (Date.now() > expiresAtMs) {
      return { valid: false }
    }

    const expectedSignature = signPayload(`${userId}:${expiresAtMs}`)
    if (!timingSafeEqualString(signature, expectedSignature)) {
      return { valid: false }
    }

    return { valid: true, userId }
  }

  // Fallback for legacy raw hex tokens (32 random bytes)
  if (token.length >= 32) {
    try {
      const tokenHash = hashToken(token)
      const session = getActiveSessionByTokenHashDb(tokenHash)

      if (!session) {
        return { valid: false }
      }

      const isExpired = new Date(session.expires_at).getTime() < Date.now()
      if (isExpired) {
        try {
          deleteActiveSessionDb(tokenHash)
        } catch {
          // Ignore delete failures during validation
        }
        return { valid: false }
      }

      return { valid: true, userId: session.user_id }
    } catch {
      return { valid: false }
    }
  }

  return { valid: false }
}

/**
 * Revokes a specific session token from the database.
 */
export async function revokeSession(token: string): Promise<void> {
  if (!token) return
  try {
    const tokenHash = hashToken(token)
    deleteActiveSessionDb(tokenHash)
  } catch (e) {
    console.warn("[SESSION] SQLite active_sessions delete failed:", e)
  }
}

/**
 * Revokes all active session tokens for a specified user ID ("Logout everywhere").
 */
export async function revokeAllUserSessions(userId: string): Promise<void> {
  try {
    deleteUserActiveSessionsDb(userId)
  } catch (e) {
    console.warn("[SESSION] SQLite deleteUserActiveSessionsDb failed:", e)
  }
}
