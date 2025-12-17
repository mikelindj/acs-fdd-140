import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyHitPayWebhook, HitPayWebhookPayload } from "@/lib/hitpay"
import { sendEmail } from "@/lib/email"
import { getMagicLinkEmail, getInviteEmail } from "@/lib/email-templates"

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const payload: HitPayWebhookPayload = JSON.parse(body)
    
    // Verify webhook signature
    const signature = request.headers.get("x-hitpay-signature") || payload.hmac
    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 401 })
    }

    const isValid = verifyHitPayWebhook(body, signature)

    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    // Find booking by reference number
    const booking = await prisma.booking.findUnique({
      where: { id: payload.reference_number },
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
    let status: "PENDING" | "PAID" | "FAILED" | "REFUNDED" = "PENDING"
    if (payload.status === "completed") {
      status = "PAID"
    } else if (payload.status === "failed") {
      status = "FAILED"
    }

    const alreadyPaid = booking.status === "PAID"

    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status,
        hitpayPaymentId: payload.payment_id,
      },
    })

    // Send emails only on first transition to PAID
    if (status === "PAID" && !alreadyPaid) {
      const buyerEmail = booking.buyer?.email
      const buyerName = booking.buyer?.name ?? "Guest"
      const tableHash = booking.table?.tableHash
      const inviteCodes = booking.inviteCodes?.map((c) => c.code).filter(Boolean) ?? []

      try {
        if (tableHash && buyerEmail) {
          await sendEmail({
            to: buyerEmail,
            subject: "Manage Your Table - ACS Founders' Day Dinner",
            html: getMagicLinkEmail(tableHash, buyerName),
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
        console.error("HitPay webhook email error:", emailError)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

