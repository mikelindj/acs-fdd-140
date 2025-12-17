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

    return NextResponse.json({
      booking: table.booking,
      guests: table.booking.guests,
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
      const tableHashForEmail = updated.table?.tableHash
      const inviteCodes =
        updated.inviteCodes?.map((c) => c.code).filter(Boolean) ?? []

      try {
        const [{ sendEmail }, { getMagicLinkEmail, getInviteEmail }] = await Promise.all([
          import("@/lib/email"),
          import("@/lib/email-templates"),
        ])

        if (tableHashForEmail && buyerEmail) {
          await sendEmail({
            to: buyerEmail,
            subject: "Manage Your Table - ACS Founders' Day Dinner",
            html: getMagicLinkEmail(tableHashForEmail, buyerName),
          })
        }

        if (buyerEmail && inviteCodes.length > 0) {
          for (const code of inviteCodes) {
            await sendEmail({
              to: buyerEmail,
              subject: "Invite Your Guests - ACS Founders' Day Dinner",
              html: getInviteEmail(code, buyerName, "Guest"),
            })
          }
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

