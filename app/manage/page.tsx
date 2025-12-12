"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

function ManagePageContent() {
  const searchParams = useSearchParams()
  const tableHash = searchParams.get("table")
  const { toast } = useToast()
  const [booking, setBooking] = useState<any>(null)
  const [guests, setGuests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (tableHash) {
      fetchBooking()
    }
  }, [tableHash])

  async function fetchBooking() {
    try {
      const res = await fetch(`/api/bookings?tableHash=${tableHash}`)
      const data = await res.json()
      if (data.booking) {
        setBooking(data.booking)
        setGuests(data.guests || [])
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load booking",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Booking Not Found</h1>
          <p>The table link is invalid or has expired.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-blue-900 mb-6">
            Manage Your Table
          </h1>

          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Booking Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Type</Label>
                <p className="font-semibold">{booking.type}</p>
              </div>
              <div>
                <Label>Status</Label>
                <p className="font-semibold">{booking.status}</p>
              </div>
              <div>
                <Label>Total Amount</Label>
                <p className="font-semibold">S${booking.totalAmount}</p>
              </div>
              <div>
                <Label>Table Number</Label>
                <p className="font-semibold">
                  {booking.table?.tableNumber || "Not assigned"}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-4">Guests</h2>
            {guests.length === 0 ? (
              <p className="text-gray-600">No guests registered yet.</p>
            ) : (
              <div className="space-y-2">
                {guests.map((guest) => (
                  <div
                    key={guest.id}
                    className="border rounded-lg p-4 flex justify-between items-center"
                  >
                    <div>
                      <p className="font-semibold">{guest.name}</p>
                      {guest.email && <p className="text-sm text-gray-600">{guest.email}</p>}
                    </div>
                    {guest.tableId && (
                      <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                        Seated
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Invite Codes</h2>
            <p className="text-gray-600 mb-4">
              Share these codes with your guests to register:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {booking.inviteCodes?.map((code: any) => (
                <div
                  key={code.id}
                  className="border rounded-lg p-4 text-center font-mono text-lg"
                >
                  {code.code}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ManagePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ManagePageContent />
    </Suspense>
  )
}

