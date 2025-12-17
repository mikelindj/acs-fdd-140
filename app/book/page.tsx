"use client"

import { useState } from "react"
import { createBooking } from "@/app/actions/booking"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { calculateTotal } from "@/lib/pricing"

export default function BookPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    type: "TABLE" as "TABLE" | "SEAT",
    category: "OBA" as "VIP" | "SCHOOL" | "OBA" | "GUEST",
    quantity: 1,
    buyerName: "",
    buyerEmail: "",
    buyerMobile: "",
    membershipNo: "",
  })

  const total = calculateTotal(formData.quantity, formData.category, formData.type)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await createBooking(formData)
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else if (result.paymentUrl) {
        window.location.href = result.paymentUrl
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to create booking",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 mb-6 text-center">
            Book Your Table or Seats
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="booking-type">Booking Type</Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: "TABLE" })}
                  className={`rounded-lg border p-4 text-left transition-colors ${
                    formData.type === "TABLE"
                      ? "border-blue-600 bg-blue-50 ring-2 ring-blue-600"
                      : "border-slate-300 bg-white hover:border-slate-400"
                  }`}
                >
                  <div className="font-semibold text-slate-900">Full Table</div>
                  <div className="text-sm text-slate-500">10-11 seats</div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: "SEAT" })}
                  className={`rounded-lg border p-4 text-left transition-colors ${
                    formData.type === "SEAT"
                      ? "border-blue-600 bg-blue-50 ring-2 ring-blue-600"
                      : "border-slate-300 bg-white hover:border-slate-400"
                  }`}
                >
                  <div className="font-semibold text-slate-900">Individual Seat</div>
                  <div className="text-sm text-slate-500">Per person</div>
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    category: e.target.value as "VIP" | "SCHOOL" | "OBA" | "GUEST",
                  })
                }
                className="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="VIP">VIP - $1,200 / $120</option>
                <option value="SCHOOL">School - $1,000 / $100</option>
                <option value="OBA">OBA - $1,000 / $100</option>
                <option value="GUEST">Guest - $1,000 / $100</option>
              </select>
            </div>

            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                max={formData.type === "TABLE" ? 1 : 11}
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    quantity: parseInt(e.target.value) || 1,
                  })
                }
                required
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="buyerName">Your Name *</Label>
              <Input
                id="buyerName"
                value={formData.buyerName}
                onChange={(e) =>
                  setFormData({ ...formData, buyerName: e.target.value })
                }
                required
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="buyerEmail">Email *</Label>
              <Input
                id="buyerEmail"
                type="email"
                value={formData.buyerEmail}
                onChange={(e) =>
                  setFormData({ ...formData, buyerEmail: e.target.value })
                }
                required
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="buyerMobile">Mobile</Label>
              <Input
                id="buyerMobile"
                type="tel"
                value={formData.buyerMobile}
                onChange={(e) =>
                  setFormData({ ...formData, buyerMobile: e.target.value })
                }
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="membershipNo">Membership Number (Optional)</Label>
              <Input
                id="membershipNo"
                value={formData.membershipNo}
                onChange={(e) =>
                  setFormData({ ...formData, membershipNo: e.target.value })
                }
                className="mt-2"
              />
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex justify-between text-lg font-semibold text-slate-900">
                <span>Total Amount:</span>
                <span className="text-blue-600">S${total.toFixed(2)}</span>
              </div>
              <p className="text-sm text-slate-500 mt-2">
                Includes transaction fee
              </p>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? "Processing..." : "Proceed to Payment"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

