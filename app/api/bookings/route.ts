import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const tableHash = searchParams.get("tableHash")

  if (!tableHash) {
    return NextResponse.json({ error: "tableHash is required" }, { status: 400 })
  }

  try {
    const table = await prisma.table.findUnique({
      where: { tableHash },
      include: {
        booking: {
          include: {
            buyer: true,
            guests: true,
            inviteCodes: true,
          },
        },
      },
    })

    if (!table || !table.booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    return NextResponse.json({
      booking: table.booking,
      guests: table.booking.guests,
    })
  } catch (error) {
    console.error("Error fetching booking:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

