export async function GET() {
  const hasAdminEmail = !!process.env.ADMIN_EMAIL
  const hasAdminPassword = !!process.env.ADMIN_PASSWORD
  const nextAuthSecret = !!process.env.NEXTAUTH_SECRET
  const nextAuthUrl = process.env.NEXTAUTH_URL

  return Response.json({
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      NEXTAUTH_SECRET: nextAuthSecret ? "✓ Set" : "✗ Missing",
      NEXTAUTH_URL: nextAuthUrl || "✗ Not set",
      ADMIN_EMAIL: hasAdminEmail ? "✓ Set" : "✗ Not set (using fallback)",
      ADMIN_PASSWORD: hasAdminPassword ? "✓ Set" : "✗ Not set (using fallback)",
    },
    auth_fallback: {
      email: "admin@acsoba.org",
      password: "TGBTG-TBIYTB",
      note: "These credentials will work even if database fails"
    }
  })
}