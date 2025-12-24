import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

type SearchParams = Record<string, string | string[] | undefined>

function pickFirst(params: SearchParams | undefined, keys: string[]): string | undefined {
  if (!params) return undefined
  for (const key of keys) {
    const value = params[key]
    if (Array.isArray(value)) {
      const found = value.find((v) => !!v?.toString().trim())
      if (found) return found.toString()
    }
    if (typeof value === "string" && value.trim()) {
      return value
    }
  }
  return undefined
}

export default async function RedirectPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>
}) {
  const resolved = searchParams ? await searchParams : undefined
  const status =
    pickFirst(resolved, ["status", "payment_status", "paymentStatus"]) || ""
  const reference =
    pickFirst(resolved, [
      "reference_number",
      "referenceNumber",
      "reference",
      "booking",
      "order_id",
    ]) || ""
  const paymentId =
    pickFirst(resolved, [
      "payment_id",
      "paymentId",
      "payment_request_id",
      "paymentRequestId",
    ]) || ""

  // Without a reference we can't look up the booking.
  if (!reference && !paymentId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-semibold text-slate-900 mb-3">
            Missing payment reference
          </h1>
          <p className="text-slate-600">
            We could not verify your payment details. Please use the link from
            your email or contact support.
          </p>
        </div>
      </div>
    )
  }

  // Try to find booking by ID first, then by hitpayPaymentId
  let booking = reference
    ? await prisma.booking.findUnique({
        where: { id: reference },
        include: {
          buyer: true,
          table: true,
        },
      })
    : null

  // If not found by ID, try finding by payment ID
  if (!booking && paymentId) {
    booking = await prisma.booking.findUnique({
      where: { hitpayPaymentId: paymentId },
      include: {
        buyer: true,
        table: true,
      },
    })
  }

  // Also try using reference as payment ID if it looks like a UUID
  if (!booking && reference && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(reference)) {
    booking = await prisma.booking.findUnique({
      where: { hitpayPaymentId: reference },
      include: {
        buyer: true,
        table: true,
      },
    })
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-semibold text-slate-900 mb-3">
            Booking not found
          </h1>
          <p className="text-slate-600">
            We could not find your booking. Please contact support if you need assistance.
          </p>
          <p className="text-xs text-slate-400 mt-4">
            Reference: {reference || "none"} | Payment ID: {paymentId || "none"}
          </p>
        </div>
      </div>
    )
  }

  // Update booking status if payment was completed (fallback if webhook hasn't fired yet)
  const normalizedStatus = status.toLowerCase()
  const isCompleted = ["completed", "succeeded", "success"].includes(normalizedStatus)
  const wasPending = booking.status === "PENDING"
  
  if (isCompleted && wasPending) {
    try {
      const updateData: {
        status: "PAID"
        hitpayPaymentId?: string
      } = { status: "PAID" }
      
      if (paymentId) {
        updateData.hitpayPaymentId = paymentId
      }
      
      console.log(`[Redirect] Updating booking ${booking.id} from PENDING to PAID`)
      booking = await prisma.booking.update({
        where: { id: booking.id },
        data: updateData,
        include: {
          buyer: true,
          table: true,
        },
      })
      console.log(`[Redirect] Booking ${booking.id} updated to PAID`)
    } catch (updateError) {
      console.error("[Redirect] Error updating booking status:", updateError)
      // Continue even if update fails - webhook might handle it
    }
  }

  // If payment was just completed and booking is now PAID, ensure email is sent
  // Only send email if this booking was just updated (wasPending), to avoid duplicate emails
  if (isCompleted && booking.status === "PAID" && wasPending && booking.buyer?.email) {
    try {
      // Send email only for the current booking (not all paid bookings)
      const [{ sendEmail }, { getPurchaseConfirmationEmail }] = await Promise.all([
        import("@/lib/email"),
        import("@/lib/email-templates"),
      ])

      const buyerEmail = booking.buyer.email
      const buyerName = booking.buyer.name ?? "Guest"

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

      // Send email for this transaction only (webhook might have already sent it, but this ensures it's sent)
      console.log(`[Redirect] Sending confirmation email to ${buyerEmail} for booking ${booking.id} (${booking.type}, qty: ${booking.quantity})`)
      await sendEmail({
        to: buyerEmail,
        subject: "Thank You for Your Purchase - ACS Founders' Day Dinner",
        html: await getPurchaseConfirmationEmail(buyerName, bookingData),
      })
      console.log(`[Redirect] Confirmation email sent successfully to ${buyerEmail} for booking ${booking.id}`)
    } catch (emailError) {
      console.error("[Redirect] Email error:", emailError)
      // Don't block the redirect if email fails
    }
  }

  // Handle seat bookings - they don't have tables, redirect to success page
  if (booking.type === "SEAT") {
    const params = new URLSearchParams()
    if (status) params.set("paymentStatus", status)
    if (paymentId) params.set("paymentId", paymentId)
    redirect(`/payment/success?${params.toString()}`)
  }

  // For table bookings, redirect to manage page
  if (booking.table?.tableHash) {
    const params = new URLSearchParams({ table: booking.table.tableHash })
    if (status) params.set("paymentStatus", status)
    if (paymentId) params.set("paymentId", paymentId)
    
    // If payment was successful, check if user has multiple table bookings
    if (status.toLowerCase() === "completed" && booking.buyerId) {
      const allPaidTableBookings = await prisma.booking.findMany({
        where: {
          buyerId: booking.buyerId,
          status: "PAID",
          type: "TABLE",
        },
        include: {
          table: true,
        },
      })
      
      const tableBookings = allPaidTableBookings.filter((b) => b.table?.tableHash)
      if (tableBookings.length > 1) {
        params.set("multipleTables", "true")
      }
    }
    
    redirect(`/manage?${params.toString()}`)
  }

  // Fallback: if no table but it's a table booking, redirect to success
  redirect("/payment/success")
}

