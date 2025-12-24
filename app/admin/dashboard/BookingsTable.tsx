"use client"

import { useState } from "react"
import { getBookingDetails, deletePendingBooking, bulkDeletePendingBookings } from "@/app/actions/booking"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface Booking {
  id: string
  type: string
  quantity: number
  totalAmount: number | string
  status: string
  createdAt: Date | string
  buyer: {
    name: string
    email: string | null
    mobile: string | null
    membershipNo: string | null
    school: string | null
    gradYear: number | null
  }
  table: {
    id: string
    tableNumber: string
    capacity: number
    status: string
    tableHash: string
  } | null
}

interface BookingsTableProps {
  bookings: Booking[]
}

interface BookingDetails {
  id: string
  type: string
  quantity: number
  category: string
  status: string
  totalAmount: number | string
  transactionFee?: number | string | null
  balanceDue: number | string
  createdAt: string | Date
  updatedAt: string | Date
  hitpayPaymentId?: string | null
  wantsBatchSeating?: boolean
  buyer: {
    name: string
    email: string
    mobile?: string | null
    membershipNo?: string | null
    school?: string | null
    gradYear?: number | null
  }
  table?: {
    id: string
    tableNumber: string
    capacity: number
    status: string
    tableHash: string
    guests?: Array<{
      id: string
      name: string
      email?: string | null
    }>
  } | null
  guests?: Array<{
    id: string
    name: string
    email?: string | null
    mobile?: string | null
    dietary?: string | null
  }>
}

export function BookingsTable({ bookings }: BookingsTableProps) {
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null)
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkDeleting, setBulkDeleting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  // Get only PENDING bookings for selection
  const pendingBookings = bookings.filter((b) => b.status === "PENDING")
  const allPendingSelected = pendingBookings.length > 0 && pendingBookings.every((b) => selectedIds.has(b.id))

  const handleRowClick = async (bookingId: string) => {
    setSelectedBookingId(bookingId)
    setLoading(true)
    try {
      const result = await getBookingDetails(bookingId)
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
        setSelectedBookingId(null)
      } else if (result.booking) {
        // Convert Decimal types to numbers for compatibility
        const booking = result.booking as {
          totalAmount: unknown
          transactionFee: unknown
          balanceDue: unknown
          createdAt: Date | string
          updatedAt: Date | string
          [key: string]: unknown
        }
        setBookingDetails({
          ...booking,
          totalAmount: Number(booking.totalAmount),
          transactionFee: booking.transactionFee ? Number(booking.transactionFee) : null,
          balanceDue: Number(booking.balanceDue),
          createdAt: booking.createdAt instanceof Date ? booking.createdAt.toISOString() : booking.createdAt,
          updatedAt: booking.updatedAt instanceof Date ? booking.updatedAt.toISOString() : booking.updatedAt,
        } as BookingDetails)
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to load booking details",
        variant: "destructive",
      })
      setSelectedBookingId(null)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedBookingId || !bookingDetails) return

    if (!confirm(`Are you sure you want to delete this PENDING booking? This action cannot be undone.`)) {
      return
    }

    setDeleting(true)
    try {
      const result = await deletePendingBooking(selectedBookingId)
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: "Booking deleted successfully",
        })
        setSelectedBookingId(null)
        setBookingDetails(null)
        router.refresh()
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete booking",
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
    }
  }

  const handleClose = () => {
    setSelectedBookingId(null)
    setBookingDetails(null)
  }

  const handleCheckboxChange = (bookingId: string, checked: boolean, e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation() // Prevent row click
    setSelectedIds((prev) => {
      const newSet = new Set(prev)
      if (checked) {
        newSet.add(bookingId)
      } else {
        newSet.delete(bookingId)
      }
      return newSet
    })
  }

  const handleSelectAll = (checked: boolean, e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation()
    if (checked) {
      setSelectedIds(new Set(pendingBookings.map((b) => b.id)))
    } else {
      setSelectedIds(new Set())
    }
  }

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return

    const count = selectedIds.size
    if (!confirm(`Are you sure you want to delete ${count} PENDING booking(s)? This action cannot be undone.`)) {
      return
    }

    setBulkDeleting(true)
    try {
      const result = await bulkDeletePendingBookings(Array.from(selectedIds))
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: `Successfully deleted ${result.deletedCount || count} booking(s)`,
        })
        setSelectedIds(new Set())
        router.refresh()
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete bookings",
        variant: "destructive",
      })
    } finally {
      setBulkDeleting(false)
    }
  }

  return (
    <>
      {selectedIds.size > 0 && (
        <div className="mb-4 flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm font-medium text-blue-900">
            {selectedIds.size} booking{selectedIds.size !== 1 ? "s" : ""} selected
          </div>
          <Button
            variant="destructive"
            onClick={handleBulkDelete}
            disabled={bulkDeleting}
            className="h-9 px-3 text-sm"
          >
            {bulkDeleting ? "Deleting..." : `Delete ${selectedIds.size} Booking${selectedIds.size !== 1 ? "s" : ""}`}
          </Button>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 w-12">
                {pendingBookings.length > 0 && (
                  <input
                    type="checkbox"
                    checked={allPendingSelected}
                    onChange={(e) => handleSelectAll(e.target.checked, e)}
                    onClick={(e) => e.stopPropagation()}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                )}
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                Buyer
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                Amount
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {bookings.map((booking) => {
              const isPending = booking.status === "PENDING"
              const isSelected = selectedIds.has(booking.id)
              return (
                <tr
                  key={booking.id}
                  onClick={() => handleRowClick(booking.id)}
                  className={`hover:bg-slate-50 cursor-pointer transition-colors ${
                    isSelected ? "bg-blue-50" : ""
                  }`}
                >
                  <td
                    className="whitespace-nowrap px-4 py-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {isPending ? (
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => handleCheckboxChange(booking.id, e.target.checked, e)}
                        onClick={(e) => e.stopPropagation()}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-slate-900">
                    {booking.buyer.name}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                    {booking.type}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-900">
                    S${Number(booking.totalAmount).toFixed(2)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        booking.status === "PAID"
                          ? "bg-green-100 text-green-800"
                          : booking.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-800"
                          : booking.status === "FAILED"
                          ? "bg-red-100 text-red-800"
                          : "bg-slate-100 text-slate-800"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-500">
                    {new Date(booking.createdAt as string).toLocaleDateString()}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <Dialog open={selectedBookingId !== null} onOpenChange={handleClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-slate-500">Loading booking details...</div>
            </div>
          ) : bookingDetails ? (
            <div className="space-y-6">
              <DialogHeader>
                <DialogTitle>Booking Details</DialogTitle>
              </DialogHeader>

              {/* Booking Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-slate-700">Booking Information</h3>
                  <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Booking ID:</span>
                      <span className="text-sm font-mono text-slate-900">{bookingDetails.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Type:</span>
                      <span className="text-sm font-medium text-slate-900">{bookingDetails.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Quantity:</span>
                      <span className="text-sm font-medium text-slate-900">{bookingDetails.quantity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Category:</span>
                      <span className="text-sm font-medium text-slate-900">{bookingDetails.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Status:</span>
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          bookingDetails.status === "PAID"
                            ? "bg-green-100 text-green-800"
                            : bookingDetails.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-800"
                            : bookingDetails.status === "FAILED"
                            ? "bg-red-100 text-red-800"
                            : "bg-slate-100 text-slate-800"
                        }`}
                      >
                        {bookingDetails.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Total Amount:</span>
                      <span className="text-sm font-bold text-slate-900">
                        S${Number(bookingDetails.totalAmount).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Transaction Fee:</span>
                      <span className="text-sm text-slate-900">
                        S${Number(bookingDetails.transactionFee || 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Balance Due:</span>
                      <span className="text-sm text-slate-900">
                        S${Number(bookingDetails.balanceDue).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Created:</span>
                      <span className="text-sm text-slate-900">
                        {new Date(bookingDetails.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Updated:</span>
                      <span className="text-sm text-slate-900">
                        {new Date(bookingDetails.updatedAt).toLocaleString()}
                      </span>
                    </div>
                    {bookingDetails.hitpayPaymentId && (
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Payment ID:</span>
                        <span className="text-sm font-mono text-slate-900">
                          {bookingDetails.hitpayPaymentId}
                        </span>
                      </div>
                    )}
                    {bookingDetails.wantsBatchSeating && (
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Batch Seating:</span>
                        <span className="text-sm text-green-600 font-medium">Requested</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Buyer Info */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-slate-700">Buyer Information</h3>
                  <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Name:</span>
                      <span className="text-sm font-medium text-slate-900">{bookingDetails.buyer.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Email:</span>
                      <span className="text-sm text-slate-900">{bookingDetails.buyer.email}</span>
                    </div>
                    {bookingDetails.buyer.mobile && (
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Mobile:</span>
                        <span className="text-sm text-slate-900">{bookingDetails.buyer.mobile}</span>
                      </div>
                    )}
                    {bookingDetails.buyer.membershipNo && (
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Membership No:</span>
                        <span className="text-sm text-slate-900">{bookingDetails.buyer.membershipNo}</span>
                      </div>
                    )}
                    {bookingDetails.buyer.school && (
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">School:</span>
                        <span className="text-sm text-slate-900">{bookingDetails.buyer.school}</span>
                      </div>
                    )}
                    {bookingDetails.buyer.gradYear && (
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Grad Year:</span>
                        <span className="text-sm text-slate-900">{bookingDetails.buyer.gradYear}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Table Info */}
              {bookingDetails.table && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-slate-700">Table Information</h3>
                  <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Table Number:</span>
                      <span className="text-sm font-medium text-slate-900">
                        {bookingDetails.table.tableNumber}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Capacity:</span>
                      <span className="text-sm text-slate-900">{bookingDetails.table.capacity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Status:</span>
                      <span className="text-sm text-slate-900">{bookingDetails.table.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Table Hash:</span>
                      <span className="text-sm font-mono text-slate-900">
                        {bookingDetails.table.tableHash}
                      </span>
                    </div>
                    {bookingDetails.table.guests && bookingDetails.table.guests.length > 0 && (
                      <div className="mt-4">
                        <span className="text-sm font-medium text-slate-700">Seated Guests:</span>
                        <div className="mt-2 space-y-1">
                          {bookingDetails.table.guests.map((guest) => (
                            <div key={guest.id} className="text-sm text-slate-600">
                              • {guest.name} {guest.email && `(${guest.email})`}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Guests */}
              {bookingDetails.guests && bookingDetails.guests.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-slate-700">Registered Guests</h3>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="space-y-3">
                      {bookingDetails.guests.map((guest) => (
                        <div key={guest.id} className="bg-white rounded-lg p-3 border border-slate-200">
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-slate-600">Name:</span>{" "}
                              <span className="font-medium text-slate-900">{guest.name}</span>
                            </div>
                            {guest.email && (
                              <div>
                                <span className="text-slate-600">Email:</span>{" "}
                                <span className="text-slate-900">{guest.email}</span>
                              </div>
                            )}
                            {guest.mobile && (
                              <div>
                                <span className="text-slate-600">Mobile:</span>{" "}
                                <span className="text-slate-900">{guest.mobile}</span>
                              </div>
                            )}
                            {guest.dietary && (
                              <div>
                                <span className="text-slate-600">Dietary:</span>{" "}
                                <span className="text-slate-900">{guest.dietary}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              {bookingDetails.status === "PENDING" && (
                <div className="flex justify-end pt-4 border-t border-slate-200">
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={deleting}
                  >
                    {deleting ? "Deleting..." : "Delete Booking"}
                  </Button>
                </div>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  )
}

