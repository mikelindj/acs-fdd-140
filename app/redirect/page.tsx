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
  if (!reference) {
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

  const booking = await prisma.booking.findUnique({
    where: { id: reference },
    include: {
      buyer: true,
      table: true,
    },
  })

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
        </div>
      </div>
    )
  }

  // If payment was successful, find all PAID bookings for this buyer
  if (status.toLowerCase() === "completed" && booking.buyerId) {
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

    // Find the first booking with a table to redirect to
    const firstTableBooking = allPaidBookings.find((b) => b.table?.tableHash)

    if (firstTableBooking?.table?.tableHash) {
      const params = new URLSearchParams({ table: firstTableBooking.table.tableHash })
      params.set("paymentStatus", "completed")
      if (paymentId) params.set("paymentId", paymentId)
      
      // If user has multiple tables, add a flag to show toast
      const tableBookings = allPaidBookings.filter((b) => b.table?.tableHash)
      if (tableBookings.length > 1) {
        params.set("multipleTables", "true")
      }
      
      redirect(`/manage?${params.toString()}`)
    }
  }

  // Fallback: if booking has a table, redirect to manage page
  if (booking.table?.tableHash) {
    const params = new URLSearchParams({ table: booking.table.tableHash })
    if (status) params.set("paymentStatus", status)
    if (paymentId) params.set("paymentId", paymentId)
    redirect(`/manage?${params.toString()}`)
  }

  // If there's no table (e.g., seat booking), fallback to success page.
  redirect("/payment/success")
}

