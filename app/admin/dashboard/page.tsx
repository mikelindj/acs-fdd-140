import { getCurrentAdmin } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { BookingsTable } from "./BookingsTable"
import { Logo } from "@/components/Logo"
import { Footer } from "@/components/Footer"
import { getEventSettings } from "@/lib/event-settings"

export default async function AdminDashboardPage() {
  await getCurrentAdmin()
  const eventSettings = await getEventSettings()

  // Fetch all paid bookings with table information
  const paidBookings = await prisma.booking.findMany({
    where: { status: "PAID" },
    include: {
      table: true,
    },
  })

  // Calculate statistics
  const completedBookings = paidBookings.length
  
  // 10-seater tables sold: sum of quantities for TABLE bookings with capacity 10
  const tablesSold10 = paidBookings
    .filter(b => b.type === "TABLE" && b.table?.capacity === 10)
    .reduce((sum, b) => sum + b.quantity, 0)
  
  // 11-seater tables sold: sum of quantities for TABLE bookings with capacity 11
  const tablesSold11 = paidBookings
    .filter(b => b.type === "TABLE" && b.table?.capacity === 11)
    .reduce((sum, b) => sum + b.quantity, 0)
  
  // Seats sold: sum of quantities for SEAT bookings
  const seatsSold = paidBookings
    .filter(b => b.type === "SEAT")
    .reduce((sum, b) => sum + b.quantity, 0)
  
  // Total guests expected
  const totalGuestsExpected = paidBookings.reduce((sum, booking) => {
    if (booking.type === "TABLE" && booking.table) {
      // For table bookings, multiply quantity by table capacity
      return sum + (booking.quantity * booking.table.capacity)
    } else if (booking.type === "SEAT") {
      // For seat bookings, just add the quantity
      return sum + booking.quantity
    }
    return sum
  }, 0)

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
        <h2 className="text-3xl font-semibold tracking-tight text-slate-900 mb-8">Dashboard</h2>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 mb-8">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-medium text-slate-500 mb-2">Completed Bookings</h3>
            <p className="text-3xl font-semibold text-green-600">{completedBookings}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-medium text-slate-500 mb-2">10-Seater Tables</h3>
            <p className="text-3xl font-semibold text-slate-900">{tablesSold10}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-medium text-slate-500 mb-2">11-Seater Tables</h3>
            <p className="text-3xl font-semibold text-slate-900">{tablesSold11}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-medium text-slate-500 mb-2">Seats Sold</h3>
            <p className="text-3xl font-semibold text-slate-900">{seatsSold}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-medium text-slate-500 mb-2">Total Guests Expected</h3>
            <p className="text-3xl font-semibold text-slate-900">{totalGuestsExpected}</p>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">Recent Bookings</h3>
          <RecentBookings />
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
    transactionFee: booking.transactionFee ? Number(booking.transactionFee) : null,
    balanceDue: Number(booking.balanceDue),
    createdAt: booking.createdAt.toISOString(),
  }))

  return <BookingsTable bookings={formattedBookings} />
}

