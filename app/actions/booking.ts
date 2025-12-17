"use server"

import { prisma } from "@/lib/prisma"
import { bookingSchema } from "@/lib/validations"
import { calculateTotal } from "@/lib/pricing"
import { generateTableHash, generateInviteCode } from "@/lib/crypto"
import { createHitPayPayment } from "@/lib/hitpay"
import { validateMembershipNumber } from "@/lib/membership"
import { z } from "zod"

export async function createBooking(data: z.infer<typeof bookingSchema>) {
  try {
    const validated = bookingSchema.parse(data)

    // Validate membership if provided
    if (validated.membershipNo) {
      const isValid = await validateMembershipNumber(validated.membershipNo)
      if (!isValid) {
        return { error: "Invalid membership number" }
      }
    }

    // Calculate pricing
    const totalAmount = calculateTotal(
      validated.quantity,
      validated.category,
      validated.type
    )
    const subtotal = validated.type === 'TABLE' 
      ? (validated.category === 'VIP' ? 1200 : 1000) * validated.quantity
      : (validated.category === 'VIP' ? 120 : 100) * validated.quantity
    const transactionFee = totalAmount - subtotal

    // Create or reuse buyer guest (email is unique)
    const buyer = await prisma.guest.upsert({
      where: { email: validated.buyerEmail },
      update: {
        name: validated.buyerName,
        mobile: validated.buyerMobile,
        membershipNo: validated.membershipNo ?? undefined,
      },
      create: {
        name: validated.buyerName,
        email: validated.buyerEmail,
        mobile: validated.buyerMobile,
        membershipNo: validated.membershipNo,
      },
    })

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        type: validated.type,
        category: validated.category,
        quantity: validated.quantity,
        totalAmount,
        transactionFee,
        balanceDue: totalAmount,
        buyerId: buyer.id,
        status: 'PENDING',
      },
    })

    // Generate table hash if it's a table booking
    let tableHash: string | null = null
    if (validated.type === 'TABLE') {
      tableHash = generateTableHash()
      // Create a table record (will be assigned later)
      await prisma.table.create({
        data: {
          tableNumber: `TEMP-${booking.id.substring(0, 8)}`,
          capacity: 11,
          status: 'RESERVED',
          tableHash,
          bookingId: booking.id,
        },
      })
    }

    // Generate invite codes for guests
    const inviteCodes = []
    for (let i = 0; i < validated.quantity; i++) {
      const code = generateInviteCode()
      await prisma.inviteCode.create({
        data: {
          code,
          bookingId: booking.id,
          email: validated.buyerEmail,
        },
      })
      inviteCodes.push(code)
    }

    const trimSlash = (value: string) => value.replace(/\/+$/, "")
    const isLocalhost = (value: string) =>
      value.includes("localhost") || value.includes("127.0.0.1")

    const redirectBase =
      process.env.HITPAY_RETURN_URL ?? process.env.NEXT_PUBLIC_SITE_URL
    const webhookBase =
      process.env.HITPAY_WEBHOOK_URL ??
      process.env.HITPAY_RETURN_URL ??
      process.env.NEXT_PUBLIC_SITE_URL

    if (!redirectBase || !webhookBase) {
      return {
        error:
          "Payment is not configured: set HITPAY_RETURN_URL (and HITPAY_WEBHOOK_URL or NEXT_PUBLIC_SITE_URL) to a public domain.",
      }
    }

    const redirectUrl = `${trimSlash(redirectBase)}/payment/success?booking=${booking.id}`
    const webhookUrl = `${trimSlash(webhookBase)}/api/webhooks/hitpay`

    if (isLocalhost(redirectUrl) || isLocalhost(webhookUrl)) {
      console.error("HitPay requires public URLs for redirect/webhook", {
        redirectUrl,
        webhookUrl,
      })
      return {
        error:
          "Payment is not configured: HitPay needs public https URLs for redirect and webhook. Set HITPAY_RETURN_URL and HITPAY_WEBHOOK_URL to a public domain.",
      }
    }

    // Create HitPay payment request
    const payment = await createHitPayPayment({
      amount: totalAmount,
      email: validated.buyerEmail,
      name: validated.buyerName,
      referenceNumber: booking.id,
      redirectUrl,
      webhookUrl,
    })
    const paymentRequestId = payment.payment_request_id || payment.id

    // Update booking with payment ID
    await prisma.booking.update({
      where: { id: booking.id },
      data: { hitpayPaymentId: paymentRequestId },
    })

    return {
      success: true,
      bookingId: booking.id,
      paymentUrl: payment.url ?? payment.redirect_url,
      tableHash,
    }
  } catch (error) {
    console.error('Booking creation error:', error)
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message }
    }
    if (error instanceof Error) {
      return { error: error.message }
    }
    return { error: "Failed to create booking" }
  }
}

