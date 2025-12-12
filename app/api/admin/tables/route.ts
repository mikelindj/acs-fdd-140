import { NextRequest, NextResponse } from "next/server"
import { getCurrentAdmin } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    await getCurrentAdmin()

    const [tables, unseatedGuests] = await Promise.all([
      prisma.table.findMany({
        include: {
          guests: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { tableNumber: "asc" },
      }),
      prisma.guest.findMany({
        where: { tableId: null },
        select: {
          id: true,
          name: true,
          email: true,
        },
      }),
    ])

    return NextResponse.json({ tables, unseatedGuests })
  } catch (error) {
    console.error("Error fetching tables:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

