"use server"

import { prisma } from "@/lib/prisma"
import { bookingSchema } from "@/lib/validations"
import { calculateTotal } from "@/lib/pricing"
import { generateTableHash, generateInviteCode } from "@/lib/crypto"
import { sendEmail } from "@/lib/email"
import { getMagicLinkEmail, getInviteEmail } from "@/lib/email-templates"
import { createHitPayPayment } from "@/lib/hitpay"
import { validateMembershipNumber } from "@/lib/membership"
import { revalidatePath } from "next/cache"
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

    // Create buyer guest
    const buyer = await prisma.guest.create({
      data: {
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

    // Create HitPay payment
    const payment = await createHitPayPayment({
      amount: totalAmount,
      email: validated.buyerEmail,
      name: validated.buyerName,
      referenceNumber: booking.id,
      redirectUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/payment/success?booking=${booking.id}`,
      webhookUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhooks/hitpay`,
    })

    // Update booking with payment ID
    await prisma.booking.update({
      where: { id: booking.id },
      data: { hitpayPaymentId: payment.payment_request_id },
    })

    // Send magic link email if table booking
    if (tableHash) {
      await sendEmail({
        to: validated.buyerEmail,
        subject: "Manage Your Table - ACS Founders' Day Dinner",
        html: getMagicLinkEmail(tableHash, validated.buyerName),
        type: 'magic_link',
      })
    }

    // Send invite emails
    for (const code of inviteCodes) {
      await sendEmail({
        to: validated.buyerEmail,
        subject: "Invite Your Guests - ACS Founders' Day Dinner",
        html: getInviteEmail(code, validated.buyerName, 'Guest'),
        type: 'invite',
      })
    }

    return {
      success: true,
      bookingId: booking.id,
      paymentUrl: payment.redirect_url,
      tableHash,
    }
  } catch (error) {
    console.error('Booking creation error:', error)
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message }
    }
    return { error: "Failed to create booking" }
  }
}

