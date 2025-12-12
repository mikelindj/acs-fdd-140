import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyHitPayWebhook, HitPayWebhookPayload } from "@/lib/hitpay"

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

    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status,
        hitpayPaymentId: payload.payment_id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

