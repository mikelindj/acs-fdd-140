import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { eventName } = body

    if (!eventName || typeof eventName !== "string") {
      return NextResponse.json({ error: "Event name is required" }, { status: 400 })
    }

    // Verify event name matches
    const eventSettings = await prisma.eventSettings.findUnique({
      where: { id: "event" },
    })

    if (!eventSettings?.eventName) {
      return NextResponse.json({ error: "No event configured to reset" }, { status: 400 })
    }

    if (eventSettings.eventName.trim() !== eventName.trim()) {
      return NextResponse.json({ error: "Event name does not match" }, { status: 400 })
    }

    // Reset all event-related data in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete all bookings (cascades to invite codes and guest relations)
      await tx.booking.deleteMany({})

      // Delete all tables
      await tx.table.deleteMany({})

      // Delete all guests
      await tx.guest.deleteMany({})

      // Delete all vouchers
      await tx.voucher.deleteMany({})

      // Reset inventory settings
      await tx.inventorySettings.upsert({
        where: { id: "inventory" },
        update: {
          totalTables: 0,
          maxElevenSeaterTables: 0,
          tablePrice: 1000,
          seatPrice: 100,
          tablePromoPrice: null,
          seatPromoPrice: null,
          tableMembersPrice: null,
          seatMembersPrice: null,
        },
        create: {
          id: "inventory",
          totalTables: 0,
          maxElevenSeaterTables: 0,
          tablePrice: 1000,
          seatPrice: 100,
          tablePromoPrice: null,
          seatPromoPrice: null,
          tableMembersPrice: null,
          seatMembersPrice: null,
        },
      })

      // Reset event settings
      await tx.eventSettings.update({
        where: { id: "event" },
        data: {
          eventName: null,
          eventDate: null,
          eventVenue: null,
        },
      })

      // Delete email logs (optional - you might want to keep these)
      // await tx.emailLog.deleteMany({})
    })

    return NextResponse.json({ success: true, message: "Event reset successfully" })
  } catch (error) {
    console.error("Error resetting event:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

