import mysql from 'mysql2/promise'

let pool: mysql.Pool | null = null

// Validate that required environment variables are set
function getMySQLConfig(): mysql.PoolOptions {
  const host = process.env.MEMBERSHIP_DB_HOST
  const user = process.env.MEMBERSHIP_DB_USER
  const password = process.env.MEMBERSHIP_DB_PASSWORD
  const database = process.env.MEMBERSHIP_DB_NAME
  const port = process.env.MEMBERSHIP_DB_PORT

  // Require all credentials from environment variables - no hardcoded fallbacks
  if (!host || !user || !password || !database) {
    throw new Error(
      'Membership database configuration is incomplete. ' +
      'Required environment variables: MEMBERSHIP_DB_HOST, MEMBERSHIP_DB_USER, ' +
      'MEMBERSHIP_DB_PASSWORD, MEMBERSHIP_DB_NAME'
    )
  }

  return {
    host,
    user,
    password,
    database,
    port: port ? parseInt(port, 10) : 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 10000, // 10 seconds
    // Enable SSL/TLS for secure connections
    ssl: process.env.MEMBERSHIP_DB_SSL === 'true' ? {
      rejectUnauthorized: process.env.MEMBERSHIP_DB_SSL_REJECT_UNAUTHORIZED !== 'false'
    } : undefined,
    // Additional security settings
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
  }
}

// Input validation: membership numbers should be alphanumeric and reasonable length
function isValidMembershipNumberFormat(membershipNo: string): boolean {
  // Trim whitespace
  const trimmed = membershipNo.trim()
  
  // Check length (reasonable bounds: 1-50 characters)
  if (trimmed.length === 0 || trimmed.length > 50) {
    return false
  }
  
  // Allow alphanumeric characters, hyphens, and underscores only
  // This prevents injection attempts and ensures data integrity
  const validPattern = /^[a-zA-Z0-9_-]+$/
  return validPattern.test(trimmed)
}

// Get or create connection pool
function getPool(): mysql.Pool {
  if (!pool) {
    try {
      const config = getMySQLConfig()
      pool = mysql.createPool(config)
      // Note: Promise-based Pool doesn't support event listeners
      // Errors are handled in individual query calls
    } catch (error) {
      console.error('Failed to create MySQL connection pool:', error)
      throw error
    }
  }
  return pool
}

/**
 * Validates a membership number against the membership database.
 * 
 * Security features:
 * - Input validation and sanitization
 * - Parameterized queries (SQL injection protection)
 * - Fail-closed error handling
 * - Secure connection configuration
 * - No sensitive data in error messages
 * 
 * @param membershipNo - The membership number to validate
 * @returns true if membership number exists, false otherwise
 */
export async function validateMembershipNumber(membershipNo: string): Promise<boolean> {
  // Input validation: check if membership number is provided
  if (!membershipNo || typeof membershipNo !== 'string') {
    return false
  }

  // Input validation: check format and length
  if (!isValidMembershipNumberFormat(membershipNo)) {
    // Log suspicious input attempts (but don't expose details to caller)
    console.warn('Invalid membership number format attempted')
    return false
  }

  // Sanitize input: trim and normalize
  const sanitizedMembershipNo = membershipNo.trim()

  try {
    const dbPool = getPool()

    // Use parameterized query to prevent SQL injection
    // Only select the ID column (minimal data exposure)
    const [rows] = await dbPool.execute<mysql.RowDataPacket[]>(
      'SELECT MMembershipID FROM tblm_Member WHERE MMembershipID = ? LIMIT 1',
      [sanitizedMembershipNo]
    )

    // Return true only if exactly one row is found
    return Array.isArray(rows) && rows.length > 0
  } catch (error) {
    // Log error details server-side for debugging
    // But don't expose sensitive information in the return value
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Membership validation error:', {
      error: errorMessage,
      // Don't log the membership number in error logs to prevent data leakage
      timestamp: new Date().toISOString(),
    })
    
    // Fail closed - reject validation if database query fails
    // This ensures we don't accidentally give member pricing to invalid memberships
    return false
  }
}

// Graceful shutdown: close pool when application exits
if (typeof process !== 'undefined') {
  const shutdown = async () => {
    if (pool) {
      try {
        await pool.end()
        pool = null
        console.log('MySQL connection pool closed')
      } catch (error) {
        console.error('Error closing MySQL pool:', error)
      }
    }
  }

  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
  process.on('beforeExit', shutdown)
}

