"use server"

import { prisma } from "@/lib/prisma"
import { sendEmail, prepareInlineImages } from "@/lib/email"
import { getBroadcastEmail, getTableAssignmentEmail, getEmailBaseUrl } from "@/lib/email-templates"
import { broadcastSchema } from "@/lib/validations"
import { z } from "zod"

function getTableAssignmentImageUrls(): { url: string; cid: string; filename: string }[] {
  const base = getEmailBaseUrl()
  return [
    { url: `${base}/images/acs-140-logo.jpg`, cid: "acs140logo", filename: "acs-140-logo.jpg" },
    { url: `${base}/images/acs-logo.png`, cid: "acslogo", filename: "acs-logo.png" },
    { url: `${base}/images/wavy-pattern.jpg`, cid: "wavypattern", filename: "wavy-pattern.jpg" },
    { url: "https://acsoba.org/wp-content/uploads/2026/01/140polo-4.png", cid: "polotee", filename: "140polo-4.png" }  ]
}

function getBroadcastImageUrls(): { url: string; cid: string; filename: string }[] {
  const base = getEmailBaseUrl()
  return [
    { url: `${base}/images/acs-140-logo.jpg`, cid: "acs140logo", filename: "acs-140-logo.jpg" },
    { url: `${base}/images/acs-logo.png`, cid: "acslogo", filename: "acs-logo.png" },
    { url: `${base}/images/wavy-pattern.jpg`, cid: "wavypattern", filename: "wavy-pattern.jpg" },
  ]
}

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

function isValidEmail(s: string): boolean {
  return typeof s === "string" && s.length > 0 && s.includes("@") && s.includes(".")
}

export async function sendTableAssignmentTestEmail(
  to: string,
  buyerName: string,
  assignedTables: string[]
): Promise<{ success?: true; error?: string }> {
  if (!isValidEmail(to)) return { error: "Please enter a valid email address." }
  try {
    const html = await getTableAssignmentEmail(buyerName, assignedTables ?? [])
    const { html: htmlWithCid, attachments } = await prepareInlineImages(html, getTableAssignmentImageUrls())
    await sendEmail({
      to: to.trim(),
      subject: `[TEST] ${TABLE_ASSIGNMENT_EMAIL_SUBJECT}`,
      html: htmlWithCid,
      attachments,
    })
    return { success: true }
  } catch (err) {
    console.error("Table assignment test send error:", err)
    return { error: err instanceof Error ? err.message : "Failed to send test email" }
  }
}

export async function sendBroadcastTestEmail(
  to: string,
  subject: string,
  content: string
): Promise<{ success?: true; error?: string }> {
  if (!isValidEmail(to)) return { error: "Please enter a valid email address." }
  try {
    const html = await getBroadcastEmail(subject || "Preview", content || "")
    const { html: htmlWithCid, attachments } = await prepareInlineImages(html, getBroadcastImageUrls())
    await sendEmail({
      to: to.trim(),
      subject: `[TEST] ${subject || "Broadcast"}`,
      html: htmlWithCid,
      attachments,
    })
    return { success: true }
  } catch (err) {
    console.error("Broadcast test send error:", err)
    return { error: err instanceof Error ? err.message : "Failed to send test email" }
  }
}

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
      const email = b.broadcastOverrideEmail ?? b.buyer?.email ?? null
      if (!email) {
        results.push({ email: "(no email)", success: false, error: "No email (buyer or override)" })
        continue
      }
      const raw = b.assignedTableNumbers as string[] | null
      const assignedTables = Array.isArray(raw) ? raw : []
      const buyerName = b.broadcastOverrideName ?? b.buyer?.name ?? "Guest"
      try {
        const html = await getTableAssignmentEmail(buyerName, assignedTables)
        const { html: htmlWithCid, attachments } = await prepareInlineImages(html, getTableAssignmentImageUrls())
        await sendEmail({ to: email, subject: TABLE_ASSIGNMENT_EMAIL_SUBJECT, html: htmlWithCid, attachments })
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

/** Send table assignment email for a single booking to its actual recipient (override or buyer email). */
export async function sendTableAssignmentEmailForBooking(
  bookingId: string
): Promise<{ success?: true; email?: string; error?: string }> {
  try {
    const b = await prisma.booking.findUnique({
      where: { id: bookingId, status: "PAID" },
      include: { buyer: { select: { email: true, name: true } } },
    })
    if (!b) return { error: "Booking not found or not paid" }
    const email = b.broadcastOverrideEmail ?? b.buyer?.email ?? null
    if (!email) return { error: "No email (set buyer or override email)" }
    const raw = b.assignedTableNumbers as string[] | null
    const assignedTables = Array.isArray(raw) ? raw : []
    const buyerName = b.broadcastOverrideName ?? b.buyer?.name ?? "Guest"
    const html = await getTableAssignmentEmail(buyerName, assignedTables)
    const { html: htmlWithCid, attachments } = await prepareInlineImages(html, getTableAssignmentImageUrls())
    await sendEmail({ to: email, subject: TABLE_ASSIGNMENT_EMAIL_SUBJECT, html: htmlWithCid, attachments })
    return { success: true, email }
  } catch (err) {
    console.error("Send single table assignment error:", err)
    return { error: err instanceof Error ? err.message : "Failed to send" }
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

    // Send emails (prepare HTML + inline images once, reuse for all recipients)
    const broadcastHtml = await getBroadcastEmail(validated.subject, validated.content)
    const { html: htmlWithCid, attachments } = await prepareInlineImages(broadcastHtml, getBroadcastImageUrls())

    const results = []
    for (const recipient of recipients) {
      try {
        await sendEmail({
          to: recipient.email!,
          subject: validated.subject,
          html: htmlWithCid,
          attachments,
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

