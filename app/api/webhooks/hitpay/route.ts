import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import {
  parseHitPayWebhookPayload,
  verifyHitPayWebhook,
} from "@/lib/hitpay"

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const payload = parseHitPayWebhookPayload(body)
    
    const getString = (keys: string[]) => {
      for (const key of keys) {
        const value = (payload as Record<string, unknown>)[key]
        if (typeof value === "string" && value.trim().length > 0) {
          return value
        }
      }
      return undefined
    }

    // Verify webhook signature
    const signatureHeader = request.headers.get("x-hitpay-signature")
    const signature = signatureHeader || getString(["hmac"])
    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 401 })
    }

    const isValid = verifyHitPayWebhook(payload, signature)

    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    const referenceNumber = getString([
      "reference_number",
      "referenceNumber",
    ])

    if (!referenceNumber) {
      return NextResponse.json(
        { error: "Missing reference_number" },
        { status: 400 }
      )
    }

    // Find booking by reference number
    const booking = await prisma.booking.findUnique({
      where: { id: referenceNumber },
      include: {
        buyer: true,
        table: true,
        inviteCodes: true,
      },
    })

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    // Update booking status
    const rawStatus =
      getString(["status", "payment_status", "paymentStatus"]) || ""
    const normalizedStatus = rawStatus.toLowerCase()
    let status: "PENDING" | "PAID" | "FAILED" | "REFUNDED" = "PENDING"
    if (["completed", "succeeded", "success"].includes(normalizedStatus)) {
      status = "PAID"
    } else if (
      ["failed", "canceled", "cancelled", "expired"].includes(
        normalizedStatus
      )
    ) {
      status = "FAILED"
    } else if (
      ["refunded", "partial_refunded", "partial-refund"].includes(
        normalizedStatus
      )
    ) {
      status = "REFUNDED"
    }

    const alreadyPaid = booking.status === "PAID"

    const paymentId =
      getString([
        "payment_id",
        "paymentId",
        "payment_request_id",
        "paymentRequestId",
      ]) || booking.hitpayPaymentId

    const updateData: {
      status: "PENDING" | "PAID" | "FAILED" | "REFUNDED"
      hitpayPaymentId?: string
    } = { status }
    if (paymentId) {
      updateData.hitpayPaymentId = paymentId
    }

    await prisma.booking.update({
      where: { id: booking.id },
      data: updateData,
    })

    // Send consolidated email only on first transition to PAID
    if (status === "PAID" && !alreadyPaid && booking.buyer?.email) {
      const buyerEmail = booking.buyer.email
      const buyerName = booking.buyer.name ?? "Guest"

      try {
        // Find ALL PAID bookings for this buyer to send a single consolidated email
        const allPaidBookings = await prisma.booking.findMany({
          where: {
            buyerId: booking.buyerId,
            status: "PAID",
          },
          include: {
            table: true,
          },
          orderBy: {
            createdAt: "asc",
          },
        })

        if (allPaidBookings.length > 0) {
          const [{ sendEmail }, { getPurchaseConfirmationEmail }] =
            await Promise.all([
              import("@/lib/email"),
              import("@/lib/email-templates"),
            ])

          // Prepare booking data for email
          const bookingData = allPaidBookings.map((b) => ({
            id: b.id,
            type: b.type,
            quantity: b.quantity,
            totalAmount: b.totalAmount.toString(),
            tableHash: b.table?.tableHash || null,
            tableNumber: b.table?.tableNumber || null,
            tableCapacity: b.table?.capacity || null,
          }))

          // Send single consolidated email
          await sendEmail({
            to: buyerEmail,
            subject: "Thank You for Your Purchase - ACS Founders' Day Dinner",
            html: await getPurchaseConfirmationEmail(buyerName, bookingData),
          })
        }
      } catch (emailError) {
        console.error("HitPay webhook email error:", emailError)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

