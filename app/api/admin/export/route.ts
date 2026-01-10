import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Calculate cuisine breakdown for Excel export
function calculateCuisineBreakdown(cuisineJson: string | null | undefined, type: string, quantity: number, tableCapacity: number | null): Record<string, number> {
  const result: Record<string, number> = {}

  if (!cuisineJson) return result

  try {
    const cuisines: string[] = JSON.parse(cuisineJson)
    if (!Array.isArray(cuisines) || cuisines.length === 0) return result

    // Count occurrences of each cuisine
    const cuisineCounts: Record<string, number> = {}
    cuisines.forEach(cuisine => {
      cuisineCounts[cuisine] = (cuisineCounts[cuisine] || 0) + 1
    })

    // Convert to guest counts based on booking type
    Object.entries(cuisineCounts).forEach(([cuisine, count]) => {
      if (type === "TABLE" && tableCapacity) {
        // For tables, multiply by table capacity (usually 10)
        result[cuisine] = count * tableCapacity
      } else {
        // For individual seats, use the count directly
        result[cuisine] = count
      }
    })

    return result
  } catch {
    console.warn('Error parsing cuisine JSON in export:', cuisineJson)
    return result
  }
}

export async function GET() {
  try {
    // Dynamic import for xlsx - it exports utilities directly
    const XLSX = await import("xlsx")
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch event settings
    const eventSettings = await prisma.eventSettings.findUnique({
      where: { id: "event" },
    })

    // Fetch all bookings with buyer and table information
    const bookings = await prisma.booking.findMany({
      include: {
        buyer: true,
        table: true,
        voucher: true,
        guests: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Prepare event settings data
    const eventSettingsData = [
      { Field: "Event Name", Value: eventSettings?.eventName || "Not set" },
      { 
        Field: "Event Date", 
        Value: eventSettings?.eventDate 
          ? new Date(eventSettings.eventDate).toLocaleDateString() 
          : "Not set" 
      },
      { Field: "Event Venue", Value: eventSettings?.eventVenue || "Not set" },
    ]

    // Prepare orders data
    const ordersData = bookings.map((booking) => {
      const tableCapacity = booking.table?.capacity || null
      const tableNumber = booking.table?.tableNumber || "N/A"
      const voucherCode = booking.voucher?.code || "N/A"

      // Calculate guests count
      let guestsCount = booking.quantity
      if (booking.type === "TABLE" && tableCapacity) {
        guestsCount = booking.quantity * tableCapacity
      }

      // Calculate cuisine breakdown
      const cuisineBreakdown = calculateCuisineBreakdown(booking.cuisine, booking.type, booking.quantity, tableCapacity)

      return {
        "Booking ID": booking.id,
        "Order Date": new Date(booking.createdAt).toLocaleString(),
        "Buyer Name": booking.buyer.name,
        "Buyer Email": booking.buyer.email || "N/A",
        "Buyer Mobile": booking.buyer.mobile || "N/A",
        "Booking Type": booking.type,
        "Table Capacity": tableCapacity || "N/A",
        "Table Number": tableNumber,
        "Quantity": booking.quantity,
        "Total Guests": guestsCount,
        "Category": booking.category,
        "Status": booking.status,
        "Total Amount": Number(booking.totalAmount).toFixed(2),
        "Transaction Fee": booking.transactionFee ? Number(booking.transactionFee).toFixed(2) : "0.00",
        "Balance Due": Number(booking.balanceDue).toFixed(2),
        "Voucher Code": voucherCode,
        "Payment ID": booking.hitpayPaymentId || "N/A",
        "Wants Batch Seating": booking.wantsBatchSeating ? "Yes" : "No",
        "Guests Count": booking.guests.length,
        // Grouping columns
        "School": booking.buyer.gradYear ? booking.buyer.school || "" : "",
        "Year": booking.buyer.gradYear || "",
        "PSG-School": !booking.buyer.gradYear ? booking.buyer.school || "" : "",
        "Staff-School": !booking.buyer.gradYear ? booking.buyer.school || "" : "",
        // Cuisine columns
        "Chinese": cuisineBreakdown.Chinese || 0,
        "Chinese-Vegetarian": cuisineBreakdown["Chinese-Vegetarian"] || 0,
        "Halal": cuisineBreakdown.Halal || 0,
      }
    })

    // Create workbook
    const workbook = XLSX.utils.book_new()

    // Add event settings sheet
    const eventSheet = XLSX.utils.json_to_sheet(eventSettingsData)
    XLSX.utils.book_append_sheet(workbook, eventSheet, "Event Settings")

    // Add orders sheet
    const ordersSheet = XLSX.utils.json_to_sheet(ordersData)
    XLSX.utils.book_append_sheet(workbook, ordersSheet, "Orders and Income")

    // Generate Excel file buffer
    const excelBuffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" })

    // Get event name for filename
    const eventName = eventSettings?.eventName || "Event"
    const sanitizedEventName = eventName.replace(/[^a-z0-9]/gi, "_").toLowerCase()
    const filename = `${sanitizedEventName}_export_${new Date().toISOString().split("T")[0]}.xlsx`

    // Return Excel file - convert Buffer to Uint8Array for NextResponse
    return new NextResponse(new Uint8Array(excelBuffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (_error) {
    console.error("Error exporting data:", _error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

