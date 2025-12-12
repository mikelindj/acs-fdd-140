import { Pool } from 'pg'

let pool: Pool | null = null

export async function validateMembershipNumber(membershipNo: string): Promise<boolean> {
  if (!process.env.MEMBERSHIP_DB_URL) {
    // If no external DB configured, skip validation
    return true
  }

  try {
    if (!pool) {
      const { Pool } = await import('pg')
      pool = new Pool({
        connectionString: process.env.MEMBERSHIP_DB_URL,
      })
    }

    const result = await pool.query(
      'SELECT membership_no FROM membership WHERE membership_no = $1 LIMIT 1',
      [membershipNo]
    )

    return result.rows.length > 0
  } catch (error) {
    console.error('Membership validation error:', error)
    // Fail open - allow booking if validation fails
    return true
  }
}

