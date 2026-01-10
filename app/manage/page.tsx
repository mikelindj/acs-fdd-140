"use client"

import { useState, useEffect, useCallback, useRef, Suspense } from "react"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Logo } from "@/components/Logo"
import { Footer } from "@/components/Footer"

interface Table {
  id: string
  tableNumber: string
  tableHash: string
  capacity: number
  status: string
}

interface Booking {
  id: string
  type: string
  status: string
  totalAmount: string | number
  quantity: number
  createdAt: string
  cuisine?: string | null
  table?: Table | null
}

function ManagePageContent() {
  const searchParams = useSearchParams()
  const tableHash = searchParams.get("table")
  const bookingId = searchParams.get("bookingId")
  const paymentStatus = searchParams.get("paymentStatus")
  const paymentId = searchParams.get("paymentId")
  const multipleTables = searchParams.get("multipleTables")
  const { toast } = useToast()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [allBookings, setAllBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [announced, setAnnounced] = useState(false)
  const [multipleTablesAnnounced, setMultipleTablesAnnounced] = useState(false)
  const [reconciling, setReconciling] = useState(false)
  const hasReconciled = useRef(false)
  const [eventSettings, setEventSettings] = useState<{
    eventName: string | null
    logoImageUrl: string | null
    footerLogoImageUrl: string | null
  }>({
    eventName: null,
    logoImageUrl: null,
    footerLogoImageUrl: null,
  })

  // Format cuisine display for the manage page
  const formatCuisineDisplay = (cuisineJson: string, type: string) => {
    try {
      const cuisines: string[] = JSON.parse(cuisineJson)
      if (!Array.isArray(cuisines) || cuisines.length === 0) return "Not specified"

      // Count occurrences of each cuisine
      const cuisineCounts: Record<string, number> = {}
      cuisines.forEach(cuisine => {
        cuisineCounts[cuisine] = (cuisineCounts[cuisine] || 0) + 1
      })

      // Format the breakdown
      const breakdownParts = Object.entries(cuisineCounts).map(([cuisine, count]) => {
        const itemType = type === "TABLE" ? "Table" : "Seat"
        if (count === 1) {
          return `1 ${cuisine} ${itemType.toLowerCase()}`
        } else {
          return `${count} ${cuisine} ${itemType.toLowerCase()}s`
        }
      })

      // Join with commas and "and" for the last item
      if (breakdownParts.length === 1) {
        return breakdownParts[0]
      } else if (breakdownParts.length === 2) {
        return `${breakdownParts[0]} and ${breakdownParts[1]}`
      } else {
        const lastPart = breakdownParts.pop()
        return `${breakdownParts.join(", ")}, and ${lastPart}`
      }
    } catch {
      console.warn('Error parsing cuisine JSON in manage page:', cuisineJson)
      return "Not specified"
    }
  }

  useEffect(() => {
    const fetchEventSettings = async () => {
      try {
        const res = await fetch("/api/setup/public")
        if (res.ok) {
          const data = await res.json()
          setEventSettings({
            eventName: data.eventName || null,
            logoImageUrl: data.logoImageUrl || null,
            footerLogoImageUrl: data.footerLogoImageUrl || null,
          })
        }
      } catch (_error) {
        console.error("Error fetching event settings:", _error)
      }
    }
    fetchEventSettings()
  }, [])

  const fetchBooking = useCallback(async () => {
    try {
      // For table bookings, use tableHash
      if (tableHash) {
        const res = await fetch(`/api/bookings?tableHash=${tableHash}`)
        const data = await res.json()
        if (data.booking) {
          setBooking(data.booking)
        }
        if (data.allBookings) {
          setAllBookings(data.allBookings)
        }
      }
      // For seat bookings, use bookingId
      else if (bookingId) {
        const res = await fetch(`/api/bookings?bookingId=${bookingId}`)
        const data = await res.json()
        if (data.booking) {
          setBooking(data.booking)
        }
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
  }, [tableHash, bookingId, toast])

  useEffect(() => {
    if (tableHash || bookingId) {
      fetchBooking()
    }
  }, [fetchBooking, tableHash, bookingId])

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
        ? "Payment completed successfully!"
        : isFailure
        ? "Payment not completed"
        : "Payment update",
      description: isSuccess
        ? "Thank you for your purchase. Your booking has been confirmed."
        : paymentId
        ? `Reference: ${paymentId}`
        : "Payment status received.",
      variant: isFailure ? "destructive" : "default",
    })
    setAnnounced(true)
  }, [paymentStatus, paymentId, toast, announced])

  // Show toast if user has multiple tables
  useEffect(() => {
    if (multipleTablesAnnounced) return
    if (multipleTables !== "true") return
    if (!paymentStatus || paymentStatus.toLowerCase() !== "completed") return

    toast({
      title: "You have multiple tables",
      description: "Check your email for links to manage all your tables.",
      variant: "default",
    })
    setMultipleTablesAnnounced(true)
  }, [multipleTables, paymentStatus, toast, multipleTablesAnnounced])

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
      if (reconciling || hasReconciled.current) return
      
      setReconciling(true)
      hasReconciled.current = true
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
        hasReconciled.current = false // Reset on error so it can retry
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableHash, paymentStatus, paymentId])

  if (loading) {
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
            
            <nav className="flex items-center gap-6 text-sm font-medium text-slate-600">
              {/* Navigation Items (Empty) */}
            </nav>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center py-12 px-4">
          <div className="text-slate-600">Loading...</div>
        </main>

        {/* --- FOOTER --- */}
        <Footer 
          eventName={eventSettings.eventName || "140th ACS OBA FOUNDERS DAY DINNER"} 
          footerLogoImageUrl={eventSettings.footerLogoImageUrl}
        />
      </div>
    )
  }

  if (!booking && allBookings.length === 0) {
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
            
            <nav className="flex items-center gap-6 text-sm font-medium text-slate-600">
              {/* Navigation Items (Empty) */}
            </nav>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center py-12 px-4">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-slate-900 mb-4">Booking Not Found</h1>
            <p className="text-slate-600">The table link is invalid or has expired.</p>
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

  // Use allBookings if available, otherwise fall back to single booking
  const bookingsToDisplay = allBookings.length > 0 ? allBookings : booking ? [booking] : []

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
          
          <nav className="flex items-center gap-6 text-sm font-medium text-slate-600">
             {/* Navigation Items (Empty) */}
          </nav>
        </div>
      </header>

      <main className="flex-1 py-12 px-4">
        <div className="container max-w-6xl mx-auto">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8 space-y-4">
              <h1 className="text-3xl md:text-5xl font-bold text-primary">
                {allBookings.length > 1 ? "Your Reservations" : "View Your Reservation"}
              </h1>
              <p className="text-slate-600 text-lg max-w-2xl mx-auto">
                {allBookings.length > 1
                  ? `You have ${allBookings.length} reservation${allBookings.length > 1 ? 's' : ''} confirmed`
                  : "View your booking details"}
              </p>
            </div>
            
            <div className="space-y-4">
              {bookingsToDisplay.map((bookingItem) => (
                <div
                  key={bookingItem.id}
                  className="rounded-[2rem] border border-slate-200 bg-white bg-wavy-pattern p-6 md:p-8 shadow-lg"
                >
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Left side - Booking Details */}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900 mb-4">Booking Details</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-slate-500">Type</Label>
                          <p className="mt-1 font-semibold text-slate-900">{bookingItem.type}</p>
                        </div>
                        <div>
                          <Label className="text-slate-500">Quantity</Label>
                          <p className="mt-1 font-semibold text-slate-900">{bookingItem.quantity}</p>
                        </div>
                        <div>
                          <Label className="text-slate-500">Status</Label>
                          <p className="mt-1 font-semibold text-slate-900">
                            <span
                              className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                bookingItem.status === "PAID"
                                  ? "bg-green-100 text-green-800"
                                  : bookingItem.status === "PENDING"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-slate-100 text-slate-800"
                              }`}
                            >
                              {bookingItem.status}
                            </span>
                          </p>
                        </div>
                        <div>
                          <Label className="text-slate-500">Total Amount</Label>
                          <p className="mt-1 font-semibold text-slate-900">S${bookingItem.totalAmount}</p>
                        </div>
                        <div>
                          <Label className="text-slate-500">Cuisine</Label>
                          <p className="mt-1 font-semibold text-slate-900">
                            {bookingItem.cuisine ? formatCuisineDisplay(bookingItem.cuisine, bookingItem.type) : "Not specified"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Right side - Table/Seat Assignment */}
                    <div className="md:w-80 flex-shrink-0">
                      <h3 className="text-lg font-semibold text-slate-900 mb-4">
                        {bookingItem.type === "TABLE" ? "Table" : "Seat"} Assignment{bookingItem.quantity > 1 ? ` (${bookingItem.quantity} ${bookingItem.type === "TABLE" ? "tables" : "seats"})` : ''}
                      </h3>
                      <div className="space-y-3">
                        {Array.from({ length: bookingItem.quantity }).map((_, index) => (
                          <div
                            key={index}
                            className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                          >
                            <div className="space-y-2">
                              <div className="flex items-center justify-between mb-2">
                                <Label className="text-slate-500 text-xs">
                                  {bookingItem.type === "TABLE" ? "Table" : "Seat"} {index + 1}
                                </Label>
                                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                  paymentStatus?.toLowerCase() === 'canceled' || paymentStatus?.toLowerCase() === 'cancelled'
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-green-100 text-green-800"
                                }`}>
                                  {paymentStatus?.toLowerCase() === 'canceled' || paymentStatus?.toLowerCase() === 'cancelled'
                                    ? "PENDING"
                                    : "CONFIRMED"
                                  }
                                </span>
                              </div>
                              <div>
                                <Label className="text-slate-500 text-xs">
                                  {bookingItem.type === "TABLE" ? "Table" : "Seat"} Number
                                </Label>
                                <p className="mt-1 font-bold text-lg text-slate-900">
                                  Not yet assigned
                                </p>
                              </div>
                              <p className="text-slate-600 text-sm mt-2">
                                Will be assigned by admin team by 25 Feb 2026.
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* --- FOOTER --- */}
      <footer className="bg-slate-900 border-t border-slate-700 py-12">
        <div className="container max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
           <div className="flex items-center gap-3">
               <div className="relative h-10 w-10 opacity-90 hover:opacity-100 transition-opacity duration-500">
                  <Image 
                    src="/images/acs-logo.png" 
                    alt="ACS Logo" 
                    width={40}
                    height={40}
                    className="object-contain w-full h-full"
                  />
               </div>
               <span className="font-bold text-white tracking-tight">ACS OBA</span>
           </div>
           
           <div className="text-center text-white md:text-right">
              © 140th ACS OBA FOUNDERS DAY DINNER, 2026
<p className="text-[0.5rem] text-slate-400 mt-2">This page is designed and built by ACSOBA Volunteers: <a href="https://nofa.io" className="hover:text-white transition-colors">Michael Lin</a> and <a href="https://github.com/kennethch22" className="hover:text-white transition-colors">Kenneth Hendra</a></p>

           </div>
        </div>
      </footer>
    </div>
  )
}

export default function ManagePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col bg-slate-50">
        {/* --- HEADER --- */}
        <header className="relative z-50 w-full bg-white bg-wavy-pattern border-b border-slate-100 shadow-sm">
          <div className="container max-w-6xl mx-auto px-4 h-32 md:h-40 flex items-center justify-between">
            <div className="flex items-center">
              {/* Event Logo */}
              <Logo 
                logoUrl={null} 
                alt="Event Logo"
              />
            </div>
            
            <nav className="flex items-center gap-6 text-sm font-medium text-slate-600">
              {/* Navigation Items (Empty) */}
            </nav>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center py-12 px-4">
          <div className="text-slate-600">Loading...</div>
        </main>

        {/* --- FOOTER --- */}
        <Footer 
          eventName="140th ACS OBA FOUNDERS DAY DINNER" 
          footerLogoImageUrl={null}
        />
      </div>
    }>
      <ManagePageContent />
    </Suspense>
  )
}
