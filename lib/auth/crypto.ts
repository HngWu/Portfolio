import crypto from 'crypto'
import { promisify } from 'util'

const scryptAsync = promisify(crypto.scrypt)

const ENCRYPTION_SECRET = process.env.ENCRYPTION_SECRET || 'lume_glass_portfolio_encryption_master_key_32bytes!'

export function getMasterKey(): Buffer {
  return crypto.createHash('sha256').update(ENCRYPTION_SECRET).digest()
}

/**
 * Computes a Scrypt password hash with a random 16-byte salt.
 */
export async function hashPassword(password: string, existingSalt?: string): Promise<{ hash: string; salt: string }> {
  const salt = existingSalt || crypto.randomBytes(16).toString('hex')
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer
  return {
    hash: derivedKey.toString('hex'),
    salt
  }
}

/**
 * Verifies a password against a stored Scrypt hash and salt in constant time.
 */
export async function verifyPassword(password: string, storedHash: string, salt: string): Promise<boolean> {
  const { hash } = await hashPassword(password, salt)
  const hashBuffer = Buffer.from(hash, 'hex')
  const storedBuffer = Buffer.from(storedHash, 'hex')

  if (hashBuffer.length !== storedBuffer.length) {
    crypto.timingSafeEqual(hashBuffer, hashBuffer)
    return false
  }

  return crypto.timingSafeEqual(hashBuffer, storedBuffer)
}

/**
 * Encrypts a plaintext string using AES-256-GCM authenticated encryption.
 */
export function encryptSecret(plaintext: string): { ciphertext: string; iv: string; tag: string } {
  const key = getMasterKey()
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  
  let encrypted = cipher.update(plaintext, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  
  const tag = cipher.getAuthTag().toString('hex')

  return {
    ciphertext: encrypted,
    iv: iv.toString('hex'),
    tag
  }
}

/**
 * Decrypts an AES-256-GCM encrypted ciphertext with authentication tag verification.
 */
export function decryptSecret(ciphertext: string, ivHex: string, tagHex: string): string {
  const key = getMasterKey()
  const iv = Buffer.from(ivHex, 'hex')
  const tag = Buffer.from(tagHex, 'hex')
  
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
  decipher.setAuthTag(tag)

  let decrypted = decipher.update(ciphertext, 'hex', 'utf8')
  decrypted += decipher.final('utf8')

  return decrypted
}

/**
 * Compares two strings in constant time.
 */
export function timingSafeEqualString(a: string, b: string): boolean {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)

  if (bufA.length !== bufB.length) {
    crypto.timingSafeEqual(bufA, bufA)
    return false
  }

  return crypto.timingSafeEqual(bufA, bufB)
}
