"use client"

import { useState, useEffect, useCallback, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

interface InviteCode {
  id: string
  code: string
}

interface Table {
  tableNumber?: string | null
}

interface Booking {
  id: string
  type: string
  status: string
  totalAmount: string | number
  table?: Table | null
  inviteCodes?: InviteCode[]
}

interface Guest {
  id: string
  name: string
  email?: string | null
  tableId?: string | null
}

function ManagePageContent() {
  const searchParams = useSearchParams()
  const tableHash = searchParams.get("table")
  const paymentStatus = searchParams.get("paymentStatus")
  const paymentId = searchParams.get("paymentId")
  const { toast } = useToast()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [guests, setGuests] = useState<Guest[]>([])
  const [loading, setLoading] = useState(true)
  const [announced, setAnnounced] = useState(false)
  const [reconciling, setReconciling] = useState(false)

  const fetchBooking = useCallback(async () => {
    try {
      const res = await fetch(`/api/bookings?tableHash=${tableHash}`)
      const data = await res.json()
      if (data.booking) {
        setBooking(data.booking)
        setGuests(data.guests || [])
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to load booking",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [tableHash, toast])

  useEffect(() => {
    if (tableHash) {
      fetchBooking()
    }
  }, [fetchBooking, tableHash])

  // Surface payment result if redirected from HitPay
  useEffect(() => {
    if (announced) return
    if (!paymentStatus) return

    const normalized = paymentStatus.toLowerCase()
    const isSuccess = ["completed", "success", "succeeded", "paid"].includes(
      normalized
    )
    const isFailure = ["failed", "canceled", "cancelled", "expired"].includes(
      normalized
    )

    toast({
      title: isSuccess
        ? "Payment completed"
        : isFailure
        ? "Payment not completed"
        : "Payment update",
      description: paymentId
        ? `Reference: ${paymentId}`
        : "Payment status received.",
      variant: isFailure ? "destructive" : "default",
    })
    setAnnounced(true)
  }, [paymentStatus, paymentId, toast, announced])

  // If paymentStatus indicates success, reconcile booking status via API
  useEffect(() => {
    const reconcile = async () => {
      if (!tableHash) return
      if (!paymentStatus) return
      const normalized = paymentStatus.toLowerCase()
      const isSuccess = ["completed", "success", "succeeded", "paid"].includes(
        normalized
      )
      if (!isSuccess) return
      if (reconciling) return
      setReconciling(true)
      try {
        const res = await fetch("/api/bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tableHash,
            paymentStatus: normalized,
            paymentId: paymentId || undefined,
          }),
        })
        const result = await res.json()
        if (!res.ok || result.error) {
          throw new Error(result.error || "Failed to update booking")
        }
        // Refresh booking to show updated status
        await fetchBooking()
      } catch (err) {
        console.error("Payment reconciliation failed", err)
        toast({
          title: "Payment update failed",
          description: "Please contact support if this persists.",
          variant: "destructive",
        })
      } finally {
        setReconciling(false)
      }
    }
    reconcile()
  }, [tableHash, paymentStatus, paymentId, fetchBooking, toast, reconciling])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-slate-600">Loading...</div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-slate-900 mb-4">Booking Not Found</h1>
          <p className="text-slate-600">The table link is invalid or has expired.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 mb-6">
            Manage Your Table
          </h1>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Booking Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-500">Type</Label>
                <p className="mt-1 font-semibold text-slate-900">{booking.type}</p>
              </div>
              <div>
                <Label className="text-slate-500">Status</Label>
                <p className="mt-1 font-semibold text-slate-900">{booking.status}</p>
              </div>
              <div>
                <Label className="text-slate-500">Total Amount</Label>
                <p className="mt-1 font-semibold text-slate-900">S${booking.totalAmount}</p>
              </div>
              <div>
                <Label className="text-slate-500">Table Number</Label>
                <p className="mt-1 font-semibold text-slate-900">
                  {booking.table?.tableNumber || "Not assigned"}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Guests</h2>
            {guests.length === 0 ? (
              <p className="text-slate-600">No guests registered yet.</p>
            ) : (
              <div className="space-y-2">
                {guests.map((guest) => (
                  <div
                    key={guest.id}
                    className="rounded-lg border border-slate-200 bg-white p-4 flex justify-between items-center shadow-sm"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">{guest.name}</p>
                      {guest.email && <p className="text-sm text-slate-500">{guest.email}</p>}
                    </div>
                    {guest.tableId && (
                      <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">
                        Seated
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Invite Codes</h2>
            <p className="text-slate-600 mb-4">
              Share these codes with your guests to register:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {booking.inviteCodes?.map((code: InviteCode) => (
                <div
                  key={code.id}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-center font-mono text-lg text-slate-900 shadow-sm"
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
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-slate-600">Loading...</div>
      </div>
    }>
      <ManagePageContent />
    </Suspense>
  )
}

