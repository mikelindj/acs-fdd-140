import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // Test database connection
    const admin = await prisma.admin.findFirst()
    const adminCount = await prisma.admin.count()
    const tablesCount = await prisma.table.count()

    return Response.json({
      success: true,
      message: "Database connection successful",
      data: {
        adminEmail: admin?.email || "No admin found",
        adminCount,
        tablesCount,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error: unknown) {
    console.error("Database test error:", error)
    return Response.json({
      success: false,
      message: "Database connection failed",
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}