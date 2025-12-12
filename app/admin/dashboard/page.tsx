import { getCurrentAdmin } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import Link from "next/link"

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
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-blue-900 text-yellow-400 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">ACS FDD Admin</h1>
          <div className="space-x-4">
            <Link href="/admin/dashboard" className="hover:underline">
              Dashboard
            </Link>
            <Link href="/admin/tables" className="hover:underline">
              Tables
            </Link>
            <Link href="/admin/broadcast" className="hover:underline">
              Broadcast
            </Link>
            <Link href="/api/auth/signout" className="hover:underline">
              Logout
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto p-8">
        <h2 className="text-3xl font-bold text-blue-900 mb-8">Dashboard</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-600 mb-2">Total Bookings</h3>
            <p className="text-3xl font-bold text-blue-900">{totalBookings}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-600 mb-2">Paid Bookings</h3>
            <p className="text-3xl font-bold text-green-600">{paidBookings}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-600 mb-2">Total Guests</h3>
            <p className="text-3xl font-bold text-blue-900">{totalGuests}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-600 mb-2">Total Tables</h3>
            <p className="text-3xl font-bold text-blue-900">{totalTables}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-4">Recent Bookings</h3>
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

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left p-2">Buyer</th>
            <th className="text-left p-2">Type</th>
            <th className="text-left p-2">Amount</th>
            <th className="text-left p-2">Status</th>
            <th className="text-left p-2">Date</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr key={booking.id} className="border-b">
              <td className="p-2">{booking.buyer.name}</td>
              <td className="p-2">{booking.type}</td>
              <td className="p-2">S${booking.totalAmount.toString()}</td>
              <td className="p-2">
                <span
                  className={`px-2 py-1 rounded text-sm ${
                    booking.status === "PAID"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {booking.status}
                </span>
              </td>
              <td className="p-2">
                {new Date(booking.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

