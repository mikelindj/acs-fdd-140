import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getTableAssignmentEmail, getBroadcastEmail } from "@/lib/email-templates"

/**
 * GET /api/admin/broadcast/render-email
 * Renders an email template as HTML for local preview.
 *
 * Query params:
 *   type=table-assignment  → buyerName (default "Test Guest"), tables (comma-separated, e.g. "1,2,3")
 *   type=broadcast         → subject (default "Preview"), content (plain text body)
 *
 * Example: /api/admin/broadcast/render-email?type=table-assignment&buyerName=John&tables=1,2,3
 * Example: /api/admin/broadcast/render-email?type=broadcast&subject=Hello&content=Hi%20everyone
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const type = searchParams.get("type") || "table-assignment"

  try {
    let html: string

    if (type === "broadcast") {
      const subject = searchParams.get("subject") || "Preview"
      const content = searchParams.get("content") || "Sample email body."
      html = await getBroadcastEmail(subject, content)
    } else {
      const buyerName = searchParams.get("buyerName") || "Test Guest"
      const tablesParam = searchParams.get("tables") || "1,2,3"
      const assignedTables = tablesParam.split(",").map((t) => t.trim()).filter(Boolean)
      html = await getTableAssignmentEmail(buyerName, assignedTables)
    }

    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    })
  } catch (err) {
    console.error("Render email error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to render email" },
      { status: 500 }
    )
  }
}
