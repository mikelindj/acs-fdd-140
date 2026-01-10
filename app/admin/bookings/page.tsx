import { getCurrentAdmin } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { BookingsTable } from "../dashboard/BookingsTable"
import { Logo } from "@/components/Logo"
import { Footer } from "@/components/Footer"
import { getEventSettings } from "@/lib/event-settings"

export default async function AdminBookingsPage() {
  await getCurrentAdmin()
  const eventSettings = await getEventSettings()

  // Fetch all bookings with full details
  const bookings = await prisma.booking.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      buyer: true,
      table: true,
      voucher: true,
      guests: true,
      inviteCodes: {
        include: {
          guest: true,
        },
      },
    },
  })

  // Convert Decimal fields to numbers for client component compatibility
  const formattedBookings = bookings.map((booking) => ({
    ...booking,
    totalAmount: Number(booking.totalAmount),
    transactionFee: booking.transactionFee ? Number(booking.transactionFee) : null,
    balanceDue: Number(booking.balanceDue),
    createdAt: booking.createdAt.toISOString(),
    updatedAt: booking.updatedAt.toISOString(),
    inviteCodes: booking.inviteCodes.map((invite) => ({
      ...invite,
      claimedAt: invite.claimedAt ? invite.claimedAt.toISOString() : null,
      expiresAt: invite.expiresAt ? invite.expiresAt.toISOString() : null,
      createdAt: invite.createdAt.toISOString(),
      updatedAt: invite.updatedAt.toISOString(),
    })),
    guests: booking.guests.map((guest) => ({
      ...guest,
      createdAt: guest.createdAt.toISOString(),
      updatedAt: guest.updatedAt.toISOString(),
    })),
    table: booking.table
      ? {
          ...booking.table,
          createdAt: booking.table.createdAt.toISOString(),
          updatedAt: booking.table.updatedAt.toISOString(),
        }
      : null,
    buyer: {
      ...booking.buyer,
      createdAt: booking.buyer.createdAt.toISOString(),
      updatedAt: booking.buyer.updatedAt.toISOString(),
    },
    voucher: booking.voucher
      ? {
          ...booking.voucher,
          discountPercent: booking.voucher.discountPercent ? Number(booking.voucher.discountPercent) : null,
          discountAmount: booking.voucher.discountAmount ? Number(booking.voucher.discountAmount) : null,
          fixedPrice: booking.voucher.fixedPrice ? Number(booking.voucher.fixedPrice) : null,
          expiresAt: booking.voucher.expiresAt ? booking.voucher.expiresAt.toISOString() : null,
          createdAt: booking.voucher.createdAt.toISOString(),
          updatedAt: booking.voucher.updatedAt.toISOString(),
        }
      : null,
  }))

  // Calculate statistics
  const totalBookings = formattedBookings.length
  const paidBookings = formattedBookings.filter(b => b.status === "PAID").length
  const pendingBookings = formattedBookings.filter(b => b.status === "PENDING").length
  const failedBookings = formattedBookings.filter(b => b.status === "FAILED").length

  const totalRevenue = formattedBookings
    .filter(b => b.status === "PAID")
    .reduce((sum, b) => sum + b.totalAmount, 0)

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* --- HEADER --- */}
      <header className="relative z-50 w-full bg-white bg-wavy-pattern border-b border-slate-100 shadow-sm">
        <div className="container max-w-6xl mx-auto px-4 h-32 md:h-40 flex items-center justify-between">
          <div className="flex items-center">
             {/* Event Logo */}
             <Logo
               logoUrl={eventSettings.logoImageUrl}
               alt={eventSettings.eventName || "Event Logo"}
             />
          </div>

          <nav className="flex items-center gap-2 text-sm font-medium text-slate-600">
             <Link href="/admin/dashboard" className="px-3 py-2 rounded-lg hover:bg-primary/10 hover:text-primary transition-all duration-200">
               Dashboard
             </Link>
             <Link href="/admin/bookings" className="px-3 py-2 rounded-lg bg-primary/10 text-primary transition-all duration-200">
               Bookings
             </Link>
             <Link href="/admin/setup" className="px-3 py-2 rounded-lg hover:bg-primary/10 hover:text-primary transition-all duration-200">
               Setup
             </Link>
             <Link href="/admin/tables" className="px-3 py-2 rounded-lg hover:bg-primary/10 hover:text-primary transition-all duration-200">
               Tables
             </Link>
             <Link href="/admin/inventory" className="px-3 py-2 rounded-lg hover:bg-primary/10 hover:text-primary transition-all duration-200">
               Inventory
             </Link>
             <Link href="/admin/broadcast" className="px-3 py-2 rounded-lg hover:bg-primary/10 hover:text-primary transition-all duration-200">
               Broadcast
             </Link>
             <Link href="/api/auth/signout" className="px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-all duration-200">
               Logout
             </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900 mb-2">All Bookings</h2>
          <p className="text-slate-600">View and manage all booking records</p>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="text-2xl font-bold text-slate-900">{totalBookings}</div>
            <div className="text-sm text-slate-600">Total Bookings</div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="text-2xl font-bold text-green-600">{paidBookings}</div>
            <div className="text-sm text-slate-600">Paid</div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="text-2xl font-bold text-yellow-600">{pendingBookings}</div>
            <div className="text-sm text-slate-600">Pending</div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="text-2xl font-bold text-red-600">{failedBookings}</div>
            <div className="text-sm text-slate-600">Failed</div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="text-2xl font-bold text-blue-600">${totalRevenue.toLocaleString()}</div>
            <div className="text-sm text-slate-600">Total Revenue</div>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
          <div className="p-6 border-b border-slate-200">
            <h3 className="text-xl font-semibold text-slate-900">All Bookings</h3>
            <p className="text-sm text-slate-600 mt-1">Click on any booking to view full details</p>
          </div>
          <div className="p-6">
            <BookingsTable bookings={formattedBookings} />
          </div>
        </div>
      </div>
      </main>

      {/* --- FOOTER --- */}
      <Footer
        eventName={eventSettings.eventName || "140th ACS OBA FOUNDERS DAY DINNER"}
        footerLogoImageUrl={eventSettings.footerLogoImageUrl}
      />
    </div>
  )
}