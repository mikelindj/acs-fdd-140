import crypto from 'crypto'

/**
 * Generate a cryptographically secure 10-character table hash
 */
export function generateTableHash(): string {
  return crypto.randomBytes(5).toString('hex').substring(0, 10)
}

/**
 * Generate a cryptographically secure 8-character invite code
 */
export function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Exclude confusing chars
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars[crypto.randomInt(0, chars.length)]
  }
  return code
}

