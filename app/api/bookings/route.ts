import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

type PaymentUpdateStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED"

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

    // Fetch all bookings for this buyer (for multiple table support)
    const buyerId = table.booking.buyerId
    const allBookings = await prisma.booking.findMany({
      where: {
        buyerId,
        type: "TABLE", // Only show table bookings
      },
      include: {
        table: true,
        buyer: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    })

    return NextResponse.json({
      booking: table.booking,
      guests: table.booking.guests,
      allBookings: allBookings.map((b) => ({
        id: b.id,
        type: b.type,
        status: b.status,
        totalAmount: b.totalAmount.toString(),
        quantity: b.quantity,
        createdAt: b.createdAt.toISOString(),
        table: b.table
          ? {
              id: b.table.id,
              tableNumber: b.table.tableNumber,
              tableHash: b.table.tableHash,
              capacity: b.table.capacity,
              status: b.table.status,
            }
          : null,
      })),
    })
  } catch (error) {
    console.error("Error fetching booking:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const tableHash = body.tableHash as string | undefined
    const paymentStatus = (body.paymentStatus as string | undefined)?.toLowerCase()
    const paymentId = body.paymentId as string | undefined

    if (!tableHash) {
      return NextResponse.json({ error: "tableHash is required" }, { status: 400 })
    }

    const table = await prisma.table.findUnique({
      where: { tableHash },
      include: {
        booking: {
          include: {
            buyer: true,
            table: true,
            inviteCodes: true,
          },
        },
      },
    })

    if (!table || !table.booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    // Only mark paid on successful statuses
    const isSuccess =
      paymentStatus &&
      ["completed", "succeeded", "success", "paid"].includes(paymentStatus)

    if (!isSuccess) {
      return NextResponse.json({
        ok: true,
        updated: false,
        reason: "paymentStatus not successful",
      })
    }

    const booking = table.booking
    const alreadyPaid = booking.status === "PAID"

    if (alreadyPaid && booking.hitpayPaymentId && paymentId === booking.hitpayPaymentId) {
      return NextResponse.json({ ok: true, updated: false, alreadyPaid: true })
    }

    const updateData: { status: PaymentUpdateStatus; hitpayPaymentId?: string } = {
      status: "PAID",
    }
    if (paymentId) {
      updateData.hitpayPaymentId = paymentId
    }

    const updated = await prisma.booking.update({
      where: { id: booking.id },
      data: updateData,
      include: {
        buyer: true,
        table: true,
        inviteCodes: true,
      },
    })

    // Send emails only on first transition to PAID
    if (!alreadyPaid) {
      const buyerEmail = updated.buyer?.email
      const buyerName = updated.buyer?.name ?? "Guest"
      // Note: tableHashForEmail and inviteCodes are reserved for future email functionality
      // const tableHashForEmail = updated.table?.tableHash
      // const inviteCodes =
      //   updated.inviteCodes?.map((c) => c.code).filter(Boolean) ?? []

      try {
        const [{ sendEmail }, { getBookingConfirmationEmail }] = await Promise.all([
          import("@/lib/email"),
          import("@/lib/email-templates"),
        ])

        if (buyerEmail) {
          await sendEmail({
            to: buyerEmail,
            subject: "Booking Confirmed - ACS Founders' Day Dinner",
            html: await getBookingConfirmationEmail(buyerName),
          })
        }
      } catch (emailError) {
        console.error("Booking paid email error:", emailError)
      }
    }

    return NextResponse.json({ ok: true, updated: true })
  } catch (error) {
    console.error("Error updating booking status:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
