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

    // Send email only for the current booking on first transition to PAID
    if (status === "PAID" && !alreadyPaid && booking.buyer?.email) {
      const buyerEmail = booking.buyer.email
      const buyerName = booking.buyer.name ?? "Guest"

      try {
        const [{ sendEmail }, { getPurchaseConfirmationEmail }] =
          await Promise.all([
            import("@/lib/email"),
            import("@/lib/email-templates"),
          ])

        // Prepare booking data for email - only include the current booking
        const bookingData = [{
          id: booking.id,
          type: booking.type,
          quantity: booking.quantity,
          totalAmount: booking.totalAmount.toString(),
          tableHash: booking.table?.tableHash || null,
          tableNumber: booking.table?.tableNumber || null,
          tableCapacity: booking.table?.capacity || null,
        }]

        // Send email for this transaction only
        console.log(`Sending confirmation email to ${buyerEmail} for booking ${booking.id} (${booking.type}, qty: ${booking.quantity})`)
        await sendEmail({
          to: buyerEmail,
          subject: "Thank You for Your Purchase - ACS Founders' Day Dinner",
          html: await getPurchaseConfirmationEmail(buyerName, bookingData),
        })
        console.log(`Confirmation email sent successfully to ${buyerEmail} for booking ${booking.id}`)
      } catch (emailError) {
        console.error("HitPay webhook email error:", emailError)
        // Log more details about the error
        if (emailError instanceof Error) {
          console.error("Email error details:", {
            message: emailError.message,
            stack: emailError.stack,
            buyerEmail,
            bookingId: booking.id,
          })
        }
      }
    } else {
      // Log why email wasn't sent
      if (status !== "PAID") {
        console.log(`Email not sent: status is ${status}, not PAID`)
      } else if (alreadyPaid) {
        console.log(`Email not sent: booking ${booking.id} was already PAID`)
      } else if (!booking.buyer?.email) {
        console.log(`Email not sent: buyer has no email for booking ${booking.id}`)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

