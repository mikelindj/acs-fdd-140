import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get("type") as "TABLE" | "SEAT" | null
    const tableCapacity = searchParams.get("tableCapacity") ? parseInt(searchParams.get("tableCapacity")!) : null
    const quantity = searchParams.get("quantity") ? parseInt(searchParams.get("quantity")!) : null

    // Fetch inventory settings
    const inventorySettings = await prisma.inventorySettings.findUnique({
      where: { id: "inventory" },
    })

    if (!inventorySettings) {
      return NextResponse.json({ 
        available: false, 
        error: "Inventory settings not configured" 
      }, { status: 400 })
    }

    const totalTables = inventorySettings.totalTables
    const maxElevenSeaterTables = inventorySettings.maxElevenSeaterTables

    if (type === "TABLE") {
      // Count existing table bookings (only PAID ones count as taken)
      const existingTableBookings = await prisma.booking.findMany({
        where: {
          type: "TABLE",
          status: "PAID",
        },
        include: {
          table: true,
        },
      })

      if (tableCapacity === 11) {
        // Check 11-seater availability
        const bookedElevenSeaters = existingTableBookings.filter(
          (b) => b.table?.capacity === 11
        ).length

        const available = maxElevenSeaterTables - bookedElevenSeaters
        const requested = quantity || 1

        return NextResponse.json({
          available: requested <= available,
          availableCount: available,
          requestedCount: requested,
          type: "TABLE",
          tableCapacity: 11,
        })
      } else {
        // Check 10-seater availability
        // Total available = totalTables - booked 11-seaters - booked 10-seaters
        const bookedElevenSeaters = existingTableBookings.filter(
          (b) => b.table?.capacity === 11
        ).length
        const bookedTenSeaters = existingTableBookings.filter(
          (b) => b.table?.capacity === 10
        ).length

        const available = totalTables - bookedElevenSeaters - bookedTenSeaters
        const requested = quantity || 1

        return NextResponse.json({
          available: requested <= available,
          availableCount: available,
          requestedCount: requested,
          type: "TABLE",
          tableCapacity: 10,
        })
      }
    } else if (type === "SEAT") {
      // Count existing seat bookings (only PAID ones count as taken)
      const existingSeatBookings = await prisma.booking.findMany({
        where: {
          type: "SEAT",
          status: "PAID",
        },
      })

      const bookedSeats = existingSeatBookings.reduce((sum, booking) => sum + booking.quantity, 0)

      // Total available seats = (totalTables * 10) + maxElevenSeaterTables
      // The maxElevenSeaterTables represents the extra seats from 11-seater tables
      const totalAvailableSeats = (totalTables * 10) + maxElevenSeaterTables
      const available = totalAvailableSeats - bookedSeats
      const requested = quantity || 1

      return NextResponse.json({
        available: requested <= available,
        availableCount: available,
        requestedCount: requested,
        type: "SEAT",
      })
    }

    return NextResponse.json({ 
      available: false, 
      error: "Invalid type or parameters" 
    }, { status: 400 })
  } catch (error) {
    console.error("Error checking inventory availability:", error)
    return NextResponse.json({ 
      available: false, 
      error: "Internal server error" 
    }, { status: 500 })
  }
}





