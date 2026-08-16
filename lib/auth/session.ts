import crypto from 'crypto'
import {
  createActiveSessionDb,
  getActiveSessionByTokenHashDb,
  deleteActiveSessionDb,
  deleteUserActiveSessionsDb
} from '@/lib/db'

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

/**
 * Creates a cryptographically secure 32-byte session token,
 * stores its SHA-256 hash in SQLite active_sessions, and returns the raw token.
 */
export async function createSession(userId: string): Promise<string> {
  const rawToken = crypto.randomBytes(32).toString('hex')
  const tokenHash = hashToken(rawToken)
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString() // 7 days

  createActiveSessionDb({
    user_id: userId,
    token_hash: tokenHash,
    expires_at: expiresAt
  })

  return rawToken
}

/**
 * Validates a raw session token against the active_sessions database table and expiration date.
 */
export async function validateSession(token: string): Promise<{ valid: boolean; userId?: string }> {
  if (!token || token.length < 32) {
    return { valid: false }
  }

  const tokenHash = hashToken(token)
  const session = getActiveSessionByTokenHashDb(tokenHash)

  if (!session) {
    return { valid: false }
  }

  const isExpired = new Date(session.expires_at).getTime() < Date.now()
  if (isExpired) {
    deleteActiveSessionDb(tokenHash)
    return { valid: false }
  }

  return { valid: true, userId: session.user_id }
}

/**
 * Revokes a specific session token from the database.
 */
export async function revokeSession(token: string): Promise<void> {
  if (!token) return
  const tokenHash = hashToken(token)
  deleteActiveSessionDb(tokenHash)
}

/**
 * Revokes all active session tokens for a specified user ID ("Logout everywhere").
 */
export async function revokeAllUserSessions(userId: string): Promise<void> {
  deleteUserActiveSessionsDb(userId)
}
