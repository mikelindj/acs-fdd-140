"use server"

import { prisma } from "@/lib/prisma"
import { sendEmail } from "@/lib/email"
import { getBroadcastEmail } from "@/lib/email-templates"
import { broadcastSchema } from "@/lib/validations"
import { z } from "zod"

export async function sendBroadcast(data: z.infer<typeof broadcastSchema>) {
  try {
    const validated = broadcastSchema.parse(data)

    let recipients: Array<{ email: string; name: string }> = []

    if (validated.recipients === 'all') {
      const allGuests = await prisma.guest.findMany({
        where: { email: { not: null } },
        select: { email: true, name: true },
      })
      recipients = allGuests.filter(g => g.email) as Array<{ email: string; name: string }>
    } else if (validated.recipients === 'buyers') {
      const buyers = await prisma.booking.findMany({
        include: { buyer: true },
        distinct: ['buyerId'],
      })
      recipients = buyers
        .map(b => ({ email: b.buyer.email, name: b.buyer.name }))
        .filter(r => r.email) as Array<{ email: string; name: string }>
    } else if (validated.recipients === 'guests') {
      const guests = await prisma.guest.findMany({
        where: {
          email: { not: null },
          bookings: { none: {} }, // Not a buyer
        },
        select: { email: true, name: true },
      })
      recipients = guests.filter(g => g.email) as Array<{ email: string; name: string }>
    } else if (validated.recipients === 'unseated') {
      const unseated = await prisma.guest.findMany({
        where: {
          email: { not: null },
          tableId: null,
        },
        select: { email: true, name: true },
      })
      recipients = unseated.filter(g => g.email) as Array<{ email: string; name: string }>
    }

    // Send emails
    const results = []
    for (const recipient of recipients) {
      try {
        await sendEmail({
          to: recipient.email!,
          subject: validated.subject,
          html: await getBroadcastEmail(validated.subject, validated.content),
        })
        results.push({ email: recipient.email, success: true })
      } catch (error) {
        results.push({ email: recipient.email, success: false, error: String(error) })
      }
    }

    return {
      success: true,
      sent: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results,
    }
  } catch (error) {
    console.error('Broadcast error:', error)
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message }
    }
    return { error: "Failed to send broadcast" }
  }
}

