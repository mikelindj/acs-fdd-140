"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createBooking } from "@/app/actions/booking"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { PRICING, calculateTotal } from "@/lib/pricing"

export default function BookPage() {
  const router = useRouter()
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
    } catch (error) {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-2xl p-8">
          <h1 className="text-3xl font-bold text-blue-900 mb-6 text-center">
            Book Your Table or Seats
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label>Booking Type</Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: "TABLE" })}
                  className={`p-4 border-2 rounded-lg ${
                    formData.type === "TABLE"
                      ? "border-blue-900 bg-blue-50"
                      : "border-gray-200"
                  }`}
                >
                  <div className="font-bold">Full Table</div>
                  <div className="text-sm text-gray-600">10-11 seats</div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: "SEAT" })}
                  className={`p-4 border-2 rounded-lg ${
                    formData.type === "SEAT"
                      ? "border-blue-900 bg-blue-50"
                      : "border-gray-200"
                  }`}
                >
                  <div className="font-bold">Individual Seat</div>
                  <div className="text-sm text-gray-600">Per person</div>
                </button>
              </div>
            </div>

            <div>
              <Label>Category</Label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    category: e.target.value as any,
                  })
                }
                className="w-full mt-2 p-2 border rounded-lg"
              >
                <option value="VIP">VIP - $1,200 / $120</option>
                <option value="SCHOOL">School - $1,000 / $100</option>
                <option value="OBA">OBA - $1,000 / $100</option>
                <option value="GUEST">Guest - $1,000 / $100</option>
              </select>
            </div>

            <div>
              <Label>Quantity</Label>
              <Input
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
              <Label>Your Name *</Label>
              <Input
                value={formData.buyerName}
                onChange={(e) =>
                  setFormData({ ...formData, buyerName: e.target.value })
                }
                required
                className="mt-2"
              />
            </div>

            <div>
              <Label>Email *</Label>
              <Input
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
              <Label>Mobile</Label>
              <Input
                type="tel"
                value={formData.buyerMobile}
                onChange={(e) =>
                  setFormData({ ...formData, buyerMobile: e.target.value })
                }
                className="mt-2"
              />
            </div>

            <div>
              <Label>Membership Number (Optional)</Label>
              <Input
                value={formData.membershipNo}
                onChange={(e) =>
                  setFormData({ ...formData, membershipNo: e.target.value })
                }
                className="mt-2"
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex justify-between text-lg font-bold">
                <span>Total Amount:</span>
                <span className="text-yellow-600">S${total.toFixed(2)}</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Includes transaction fee
              </p>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-900 text-yellow-400 hover:bg-blue-800"
            >
              {loading ? "Processing..." : "Proceed to Payment"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

