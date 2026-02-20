"use server"

import { prisma } from "@/lib/prisma"
import { sendEmail } from "@/lib/email"
import { getBroadcastEmail, getTableAssignmentEmail } from "@/lib/email-templates"
import { broadcastSchema } from "@/lib/validations"
import { z } from "zod"

export async function getTableAssignmentPreview(
  buyerName: string,
  assignedTables: string[]
): Promise<{ html?: string; error?: string }> {
  try {
    const html = await getTableAssignmentEmail(buyerName, assignedTables ?? [])
    return { html }
  } catch (err) {
    console.error("Table assignment preview error:", err)
    return { error: err instanceof Error ? err.message : "Failed to generate preview" }
  }
}

export async function getBroadcastPreview(
  subject: string,
  content: string
): Promise<{ html?: string; error?: string }> {
  try {
    const html = await getBroadcastEmail(subject || "Preview", content || "")
    return { html }
  } catch (err) {
    console.error("Broadcast preview error:", err)
    return { error: err instanceof Error ? err.message : "Failed to generate preview" }
  }
}

const TABLE_ASSIGNMENT_EMAIL_SUBJECT = "Your Table Assignment - ACS Founders' Day Dinner"

export async function sendTableAssignmentEmails(): Promise<
  | { success: true; sent: number; failed: number; results: { email: string; success: boolean; error?: string }[] }
  | { error: string }
> {
  try {
    const bookings = await prisma.booking.findMany({
      where: { status: "PAID" },
      include: { buyer: { select: { email: true, name: true } } },
    })

    const results: { email: string; success: boolean; error?: string }[] = []
    for (const b of bookings) {
      const email = b.buyer?.email
      if (!email) {
        results.push({ email: "(no email)", success: false, error: "Buyer has no email" })
        continue
      }
      const raw = b.assignedTableNumbers as string[] | null
      const assignedTables = Array.isArray(raw) ? raw : []
      const buyerName = b.buyer?.name ?? "Guest"
      try {
        const html = await getTableAssignmentEmail(buyerName, assignedTables)
        await sendEmail({ to: email, subject: TABLE_ASSIGNMENT_EMAIL_SUBJECT, html })
        results.push({ email, success: true })
      } catch (err) {
        results.push({ email, success: false, error: err instanceof Error ? err.message : String(err) })
      }
    }

    return {
      success: true,
      sent: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      results,
    }
  } catch (err) {
    console.error("Send table assignment emails error:", err)
    return { error: err instanceof Error ? err.message : "Failed to send table assignment emails" }
  }
}

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

