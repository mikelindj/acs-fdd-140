import { getCurrentAdmin } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { BookingsTable } from "./BookingsTable"

export default async function AdminDashboardPage() {
  await getCurrentAdmin()

  const stats = await prisma.$transaction([
    prisma.booking.count(),
    prisma.guest.count(),
    prisma.table.count(),
    prisma.booking.count({ where: { status: "PAID" } }),
  ])

  const [totalBookings, totalGuests, totalTables, paidBookings] = stats

  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <h1 className="text-xl font-semibold text-slate-900">ACS FDD Admin</h1>
            <div className="flex items-center space-x-6">
              <Link href="/admin/dashboard" className="text-sm font-medium text-slate-700 hover:text-slate-900">
                Dashboard
              </Link>
              <Link href="/admin/setup" className="text-sm font-medium text-slate-700 hover:text-slate-900">
                Setup
              </Link>
              <Link href="/admin/tables" className="text-sm font-medium text-slate-700 hover:text-slate-900">
                Tables
              </Link>
              <Link href="/admin/inventory" className="text-sm font-medium text-slate-700 hover:text-slate-900">
                Inventory
              </Link>
              <Link href="/admin/broadcast" className="text-sm font-medium text-slate-700 hover:text-slate-900">
                Broadcast
              </Link>
              <Link href="/api/auth/signout" className="text-sm font-medium text-slate-700 hover:text-slate-900">
                Logout
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-semibold tracking-tight text-slate-900 mb-8">Dashboard</h2>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-medium text-slate-500 mb-2">Total Bookings</h3>
            <p className="text-3xl font-semibold text-slate-900">{totalBookings}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-medium text-slate-500 mb-2">Paid Bookings</h3>
            <p className="text-3xl font-semibold text-green-600">{paidBookings}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-medium text-slate-500 mb-2">Total Guests</h3>
            <p className="text-3xl font-semibold text-slate-900">{totalGuests}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-medium text-slate-500 mb-2">Total Tables</h3>
            <p className="text-3xl font-semibold text-slate-900">{totalTables}</p>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">Recent Bookings</h3>
          <RecentBookings />
        </div>
      </div>
    </div>
  )
}

async function RecentBookings() {
  const bookings = await prisma.booking.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    include: {
      buyer: true,
      table: true,
    },
  })

  // Convert Decimal to number for compatibility
  const formattedBookings = bookings.map((booking) => ({
    ...booking,
    totalAmount: Number(booking.totalAmount),
    createdAt: booking.createdAt.toISOString(),
  }))

  return <BookingsTable bookings={formattedBookings} />
}

