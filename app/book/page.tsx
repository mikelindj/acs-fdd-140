"use client"

import { useState, useEffect, useCallback } from "react"
import { createBooking } from "@/app/actions/booking"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Logo } from "@/components/Logo"
import { Footer } from "@/components/Footer"
import { Minus, Plus, AlertCircle } from "lucide-react"
import Link from "next/link"

interface InventorySettings {
  isSoldOut?: boolean
  table: {
    regular: {
      nonMember: number
      member: number | null
    }
    promo: {
      nonMember: number | null
      member: number | null
    }
  }
  seat: {
    regular: {
      nonMember: number
      member: number | null
    }
    promo: {
      nonMember: number | null
      member: number | null
    }
  }
}


export default function BookPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [paymentProcessing, setPaymentProcessing] = useState(false)
  const [validatingVoucher, setValidatingVoucher] = useState(false)
  const [voucherValidated, setVoucherValidated] = useState(false)
  const [showMembershipToast, setShowMembershipToast] = useState(false)
  const [voucherData, setVoucherData] = useState<{
    id: string
    code: string
    type: string
    discountPercent: number | null
    discountAmount: number | null
    fixedPrice: number | null
  } | null>(null)
  const [inventorySettings, setInventorySettings] = useState<InventorySettings | null>(null)
  const [eventSettings, setEventSettings] = useState<{
    eventName: string | null
    logoImageUrl: string | null
    footerLogoImageUrl: string | null
  }>({
    eventName: null,
    logoImageUrl: null,
    footerLogoImageUrl: null,
  })
  const [inventoryAvailable, setInventoryAvailable] = useState<{
    available: boolean
    availableCount: number
    error?: string
  } | null>(null)
  const [formData, setFormData] = useState({
    type: "TABLE" as "TABLE" | "SEAT",
    tableCapacity: 10 as const,
    quantity: 1,
    buyerName: "",
    buyerEmail: "",
    buyerMobile: "",
    membershipNo: "",
    voucherCode: "",
    wantsBatchSeating: true, // Always true now since we always show batch info
    batchType: "SCHOOL_YEAR" as "SCHOOL_YEAR" | "PSG" | "SCHOOL_STAFF", // Track whether user selects School+Year, PSG, or School Staff
    school: "",
    gradYear: undefined as number | undefined,
    psgSchool: "", // For PSG dropdown selection
    schoolStaffSchool: "", // For School Staff dropdown selection
    cuisines: [] as string[], // Array of cuisine selections, one per table/seat
    tableDiscountApplied: false, // Whether the table bundle discount has been manually applied
  })

  // Fetch event settings on mount
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
      } catch (error) {
        console.error("Error fetching event settings:", error)
      }
    }
    fetchEventSettings()
  }, [])

  // Fetch inventory settings on mount
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const res = await fetch("/api/pricing/public")
        if (res.ok) {
          const data = await res.json()
          setInventorySettings(data)
        }
      } catch (error) {
        console.error("Error fetching inventory:", error)
        // Use defaults
        setInventorySettings({
          table: {
            regular: {
              nonMember: 1000,
              member: null,
            },
            promo: {
              nonMember: null,
              member: null,
            },
          },
          seat: {
            regular: {
              nonMember: 100,
              member: null,
            },
            promo: {
              nonMember: null,
              member: null,
            },
          },
        })
      }
    }
    fetchInventory()
  }, [])

  // Check inventory availability when type, capacity, or quantity changes
  useEffect(() => {
    const checkAvailability = async () => {
      if (!formData.quantity || formData.quantity < 1) {
        setInventoryAvailable(null)
        return
      }

      // Don't check if type is not set
      if (!formData.type) {
        return
      }

      try {
        const params = new URLSearchParams({
          type: formData.type,
          quantity: formData.quantity.toString(),
        })
        if (formData.type === "TABLE" && formData.tableCapacity) {
          params.append("tableCapacity", formData.tableCapacity.toString())
        }

        const res = await fetch(`/api/inventory/availability?${params.toString()}`)
        if (res.ok) {
          const data = await res.json()
          setInventoryAvailable(data)
        } else {
          // If API fails, don't block checkout - backend will validate
          setInventoryAvailable({ available: true, availableCount: 999 })
        }
      } catch (error) {
        console.error("Error checking availability:", error)
        // Don't block on error - backend will validate
        setInventoryAvailable({ available: true, availableCount: 999 })
      }
    }

    checkAvailability()
  }, [formData.type, formData.tableCapacity, formData.quantity])

  // Initialize and sync cuisines array when quantity changes
  useEffect(() => {
    const currentLength = formData.cuisines.length
    if (formData.quantity !== currentLength) {
      const newCuisines = [...formData.cuisines]
      if (formData.quantity > currentLength) {
        // Add empty strings for new items
        while (newCuisines.length < formData.quantity) {
          newCuisines.push("")
        }
      } else {
        // Trim array if quantity decreased
        newCuisines.splice(formData.quantity)
      }
      setFormData(prev => ({ ...prev, cuisines: newCuisines, tableDiscountApplied: false }))
    }
  }, [formData.quantity, formData.cuisines])

  // Reset table discount when membership changes
  useEffect(() => {
    setFormData(prev => ({ ...prev, tableDiscountApplied: false }))
  }, [formData.membershipNo])

  // Reset table discount when cuisines change
  useEffect(() => {
    setFormData(prev => ({ ...prev, tableDiscountApplied: false }))
  }, [formData.cuisines])

  // Initialize cuisines array on mount
  useEffect(() => {
    if (formData.cuisines.length === 0 && formData.quantity > 0) {
      setFormData(prev => ({ 
        ...prev, 
        cuisines: Array(formData.quantity).fill("") 
      }))
    }
  }, [formData.cuisines.length, formData.quantity])


  // Calculate price breakdown based on inventory settings
  const calculatePriceBreakdown = useCallback(() => {
    if (!inventorySettings || !formData) {
      return {
        tablePrice: 0,
        tableDiscount: 0,
        seatPrice: 0,
        seatDiscount: 0,
        displaySeatPrice: 0,
        displayTablePrice: 0,
        tableBundleDiscount: 0,
        voucherDiscount: 0,
        total: 0,
        promoDiscount: 0,
        isPromoApplied: false,
      }
    }

    const isTable = formData.type === "TABLE"
    const hasMembership = formData.membershipNo && typeof formData.membershipNo === 'string' && formData.membershipNo.trim()

    // Regular prices (always displayed initially)
    const tableRegularPrice = Number(inventorySettings.table.regular.nonMember)
    const seatRegularPrice = Number(inventorySettings.seat.regular.nonMember)

    let tablePrice = tableRegularPrice
    let seatPrice = seatRegularPrice
    let tableDiscount = 0
    let seatDiscount = 0
    let promoDiscount = 0
    let isPromoApplied = false

    // When membership is entered, apply discounts
    if (hasMembership) {
      if (isTable) {
        // Check for members price first (takes precedence)
        const memberPrice = inventorySettings.table.regular.member
        if (memberPrice !== null && memberPrice < tableRegularPrice) {
          tablePrice = memberPrice
          tableDiscount = tableRegularPrice - memberPrice
        } else {
          // If no members price, use promo price
          const promoPrice = inventorySettings.table.promo.nonMember
          if (promoPrice !== null && promoPrice < tableRegularPrice) {
            tablePrice = promoPrice
            promoDiscount = tableRegularPrice - promoPrice
            isPromoApplied = true
          }
        }
      } else {
        // Check for members price first (takes precedence)
        const memberPrice = inventorySettings.seat.regular.member
        if (memberPrice !== null && memberPrice < seatRegularPrice) {
          seatPrice = memberPrice
          seatDiscount = seatRegularPrice - memberPrice
        } else {
          // If no members price, use promo price
          const promoPrice = inventorySettings.seat.promo.nonMember
          if (promoPrice !== null && promoPrice < seatRegularPrice) {
            seatPrice = promoPrice
            promoDiscount = seatRegularPrice - promoPrice
            isPromoApplied = true
          }
        }
      }
    }


    let total = 0
    let tableBundleDiscount = 0

    if (isTable) {
      // 10-seater table
      total = tablePrice * formData.quantity
    } else {
      // Individual seat
      const regularSeatTotal = seatPrice * formData.quantity

      // Check for table bundle discount (manually applied)
      if (formData.tableDiscountApplied) {
        // Apply fixed table bundle price of $2100 for 10 seats
        total = 2100
        tableBundleDiscount = regularSeatTotal - 2100
      } else {
        total = regularSeatTotal
      }
    }

    // Apply voucher discount if validated
    let voucherDiscount = 0
    let finalTotal = total
    if (voucherValidated && voucherData) {
      if (voucherData.type === "PERCENTAGE" && voucherData.discountPercent) {
        voucherDiscount = (total * voucherData.discountPercent) / 100
        finalTotal = Math.max(0, total - voucherDiscount)
      } else if (voucherData.type === "FIXED_AMOUNT" && voucherData.discountAmount) {
        voucherDiscount = Number(voucherData.discountAmount)
        finalTotal = Math.max(0, total - voucherDiscount)
      } else if (voucherData.type === "FIXED_PRICE" && voucherData.fixedPrice) {
        finalTotal = Number(voucherData.fixedPrice) * formData.quantity
        voucherDiscount = total - finalTotal
      }
    }

    return {
      tablePrice: isTable ? tablePrice * formData.quantity : 0,
      tableDiscount: isTable ? tableDiscount * formData.quantity : 0,
      seatPrice: !isTable ? seatPrice * formData.quantity : 0,
      seatDiscount: !isTable ? seatDiscount * formData.quantity : 0,
      displaySeatPrice: !isTable ? seatRegularPrice * formData.quantity : 0, // Regular rate for display
      displayTablePrice: isTable ? tableRegularPrice * formData.quantity : 0, // Regular rate for display
      tableBundleDiscount: tableBundleDiscount,
      voucherDiscount: voucherDiscount,
      promoDiscount: promoDiscount * formData.quantity,
      isPromoApplied,
      total: Math.round(finalTotal * 100) / 100,
    }
  }, [inventorySettings, formData, voucherValidated, voucherData])

  const priceBreakdown = calculatePriceBreakdown()
  const total = priceBreakdown.total

  // Helper functions for quantity controls
  const decreaseQuantity = () => {
    if (formData.quantity > 1) {
      const newQuantity = formData.quantity - 1
      // Sync cuisines array with new quantity
      const currentCuisines = formData.cuisines
      const newCuisines = [...currentCuisines]
      newCuisines.splice(newQuantity) // Trim array if quantity decreased
      setFormData({
        ...formData,
        quantity: newQuantity,
        cuisines: newCuisines,
        tableDiscountApplied: false, // Reset table discount when quantity changes
      })
    }
  }

  const increaseQuantity = () => {
    const newQuantity = formData.quantity + 1
    // Sync cuisines array with new quantity
    const currentCuisines = formData.cuisines
    const newCuisines = [...currentCuisines]
    while (newCuisines.length < newQuantity) {
      newCuisines.push("") // Add empty strings for new items
    }
    setFormData({
      ...formData,
      quantity: newQuantity,
      cuisines: newCuisines,
      tableDiscountApplied: false, // Reset table discount when quantity changes
    })
  }

  const handleValidateVoucher = async () => {
    if (!formData.voucherCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a voucher code",
        variant: "destructive",
      })
      return
    }

    setValidatingVoucher(true)
    try {
      const res = await fetch("/api/vouchers/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: formData.voucherCode.trim() }),
      })
      const data = await res.json()
      if (res.ok && data.valid) {
        setVoucherValidated(true)
        setVoucherData(data.voucher)
        toast({
          title: "Success",
          description: "Voucher code applied",
        })
      } else {
        setVoucherValidated(false)
        setVoucherData(null)
        toast({
          title: "Error",
          description: data.error || "Invalid voucher code",
          variant: "destructive",
        })
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to validate voucher",
        variant: "destructive",
      })
      setVoucherValidated(false)
      setVoucherData(null)
    } finally {
      setValidatingVoucher(false)
    }
  }

  // Default category to OBA
  const defaultCategory = "OBA" as const

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Prevent double submission
    if (loading) {
      return
    }
    
    // Validate cuisines - ensure all are selected
    if (formData.cuisines.length !== formData.quantity) {
      toast({
        title: "Error",
        description: `Please select cuisine preferences for all ${formData.quantity} ${formData.type === "TABLE" ? "table" : "seat"}${formData.quantity !== 1 ? "s" : ""}`,
        variant: "destructive",
      })
      return
    }
    
    const missingCuisines = formData.cuisines.filter((c) => !c || !c.trim())
    if (missingCuisines.length > 0) {
      const missingIndices = formData.cuisines
        .map((c, index) => (!c || !c.trim()) ? index + 1 : null)
        .filter((i): i is number => i !== null)
      toast({
        title: "Error",
        description: `Please select cuisine preferences for ${formData.type === "TABLE" ? "table" : "seat"} ${missingIndices.join(", ")}`,
        variant: "destructive",
      })
      return
    }

    // Validate batch information
    if (formData.batchType === "SCHOOL_YEAR") {
      if (!formData.school?.trim()) {
        toast({
          title: "Error",
          description: "School is required",
          variant: "destructive",
        })
        return
      }
      if (!formData.gradYear) {
        toast({
          title: "Error",
          description: "Year of completion is required",
          variant: "destructive",
        })
        return
      }
    } else if (formData.batchType === "PSG") {
      if (!formData.psgSchool?.trim()) {
        toast({
          title: "Error",
          description: "Please select a PSG school",
          variant: "destructive",
        })
        return
      }
    } else if (formData.batchType === "SCHOOL_STAFF") {
      if (!formData.schoolStaffSchool?.trim()) {
        toast({
          title: "Error",
          description: "Please select a school",
          variant: "destructive",
        })
        return
      }
    }
    
    setLoading(true)

    try {
      // Safety check for formData
      if (!formData) {
        throw new Error("Form data is not available")
      }

      // Destructure to exclude batchType, psgSchool, schoolStaffSchool, cuisines, and tableDiscountApplied (not part of schema)
      const { batchType: _batchType, psgSchool: _psgSchool, schoolStaffSchool: _schoolStaffSchool, cuisines: _cuisines, tableDiscountApplied: _tableDiscountApplied, ...formDataWithoutBatchType } = formData
      const bookingData = {
        ...formDataWithoutBatchType,
        category: defaultCategory,
        tableCapacity: formData.type === "TABLE" ? formData.tableCapacity : undefined,
        membershipValidated: !!(formData.membershipNo && typeof formData.membershipNo === 'string' && formData.membershipNo.trim()),
        voucherCode: voucherValidated && voucherData && formData.voucherCode ? formData.voucherCode.trim() : undefined,
        wantsBatchSeating: true, // Always true since we always show batch info
        // Use PSG school if PSG is selected, School Staff school if School Staff is selected, otherwise use regular school
        school: formData.batchType === "PSG" ? (formData.psgSchool || "") : formData.batchType === "SCHOOL_STAFF" ? (formData.schoolStaffSchool || "") : (formData.school || ""),
        gradYear: (formData.batchType === "PSG" || formData.batchType === "SCHOOL_STAFF") ? undefined : formData.gradYear,
        cuisine: (formData.cuisines && Array.isArray(formData.cuisines) && formData.cuisines.length > 0) ? JSON.stringify(formData.cuisines) : undefined,
        tableDiscountApplied: Boolean(formData.tableDiscountApplied),
      }
      const result = await createBooking(bookingData)
      if (result.error) {
        setPaymentProcessing(false)
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else if (result.paymentUrl) {
        // If it's a free booking, show success message before redirecting
        if (result.isFree) {
          toast({
            title: "Booking Confirmed!",
            description: "Your booking has been confirmed. You will receive a confirmation email shortly.",
          })
        }
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
      setPaymentProcessing(false)
    }
  }

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
               priority
             />
          </div>
          
          <nav className="flex items-center gap-6 text-sm font-medium text-slate-600">
             {/* Navigation Items (Empty) */}
          </nav>
        </div>
      </header>

      {/* Payment Processing Overlay */}
      {paymentProcessing && (
        <div className="fixed inset-0 bg-white bg-opacity-95 z-50 flex items-center justify-center">
          <div className="text-center space-y-6 max-w-md mx-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 bg-primary rounded-full animate-pulse"></div>
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-slate-900">
                Processing Your Payment
              </h2>
              <p className="text-slate-600">
                Please wait while we securely connect you to our payment gateway...
              </p>
            </div>
            <div className="flex justify-center space-x-1">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
            <p className="text-sm text-slate-500">
              This may take a few seconds. Please do not close this window.
            </p>
          </div>
        </div>
      )}

      <main className="flex-1 py-12 px-4">
        <div className="container max-w-6xl mx-auto">
          <div className="max-w-2xl mx-auto">
            {inventorySettings?.isSoldOut ? (
              <>
                <div className="text-center mb-8 space-y-4">
                  <h1 className="text-3xl md:text-5xl font-bold text-primary">
                    Event Sold Out
                  </h1>
                  <p className="text-slate-600 text-lg max-w-2xl mx-auto">
                    Thank you for your interest in the ACS Founders&apos; Day Dinner
                  </p>
                </div>
                
                <div className="rounded-[2rem] border border-slate-200 bg-white bg-wavy-pattern p-8 md:p-10 shadow-lg">
                  <div className="text-center space-y-6">
                    <div className="flex justify-center">
                      <div className="p-4 bg-brand-red/10 rounded-full">
                        <AlertCircle className="w-16 h-16 text-brand-red" />
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h2 className="text-2xl font-bold text-slate-900">All Tables & Seats Have Been Sold</h2>
                      <p className="text-slate-600 max-w-md mx-auto">
                        We are overwhelmed by the tremendous support from the ACS family. 
                        All available tables and seats for this year&apos;s dinner have been fully booked.
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-200">
                      <p className="text-slate-600 mb-2">For enquiries, please contact:</p>
                      <a 
                        href="mailto:admin@acsoba.org" 
                        className="text-primary font-semibold text-lg hover:underline"
                      >
                        admin@acsoba.org
                      </a>
                    </div>

                    <div className="pt-4">
                      <Link href="/">
                        <Button className="h-12 px-8 bg-primary hover:bg-brand-red transition-colors">
                          Return to Home
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
            <div className="text-center mb-8 space-y-4">
            <h1 className="text-3xl md:text-5xl font-bold text-primary">
              Book Your Table or Seats
            </h1>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              Reserve your spot for the ACS Founders&apos; Day Dinner
            </p>
          </div>
          
          <div className="rounded-[2rem] border border-slate-200 bg-white bg-wavy-pattern p-8 md:p-10 shadow-lg">

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="booking-type">Booking Type</Label>
              <select
                id="booking-type"
                value={formData.type === "SEAT" ? "SEAT" : "TABLE-10"}
                onChange={(e) => {
                  const value = e.target.value
                  if (value === "SEAT") {
                    setFormData({ ...formData, type: "SEAT" })
                  } else {
                    setFormData({ ...formData, type: "TABLE", tableCapacity: 10 })
                  }
                }}
                className="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
              >
                <option value="TABLE-10">Table (10 seater)</option>
                <option value="SEAT">Individual Seat (1 seat)</option>
              </select>
            </div>

            <div>
              <Label htmlFor="quantity">Quantity *</Label>
              <div className="flex items-center mt-2 w-full gap-3">
                <Button
                  type="button"
                  onClick={decreaseQuantity}
                  disabled={formData.quantity <= 1}
                  className="flex-shrink-0 w-10 h-10 rounded-full border border-slate-300 bg-white hover:bg-slate-100 hover:border-slate-400 active:bg-slate-200 text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-slate-300 transition-all duration-150"
                  variant="outline"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => {
                    const value = e.target.value
                    if (value === "" || value === null || value === undefined) {
                      setFormData({
                        ...formData,
                        quantity: 1,
                      })
                      return
                    }
                    const newQuantity = parseInt(value, 10)
                    if (!isNaN(newQuantity) && newQuantity > 0) {
                      // Sync cuisines array with new quantity
                      const currentCuisines = formData.cuisines
                      const newCuisines = [...currentCuisines]
                      if (newQuantity > currentCuisines.length) {
                        // Add empty strings for new items
                        while (newCuisines.length < newQuantity) {
                          newCuisines.push("")
                        }
                      } else if (newQuantity < currentCuisines.length) {
                        // Trim array if quantity decreased
                        newCuisines.splice(newQuantity)
                      }
                      setFormData({
                        ...formData,
                        quantity: newQuantity,
                        cuisines: newCuisines,
                        tableDiscountApplied: false, // Reset table discount when quantity changes
                      })
                    }
                  }}
                  required
                  className="text-center flex-1 h-10 border border-slate-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all duration-150 min-w-0"
                />
                <Button
                  type="button"
                  onClick={increaseQuantity}
                  className="flex-shrink-0 w-10 h-10 rounded-full border border-slate-300 bg-white hover:bg-slate-100 hover:border-slate-400 active:bg-slate-200 text-slate-700 transition-all duration-150"
                  variant="outline"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {inventoryAvailable && !inventoryAvailable.available && (
                <p className="mt-2 text-sm text-brand-red font-medium">
                  {inventoryAvailable.error || "Exceeded maximum allowed limit"}
                </p>
              )}
              {inventoryAvailable && inventoryAvailable.available && inventoryAvailable.availableCount < 5 && (
                <p className="mt-2 text-sm text-orange-600 font-medium">
                  Only {inventoryAvailable.availableCount} {formData.type === "TABLE" ? "table" : "seat"}{inventoryAvailable.availableCount !== 1 ? "s" : ""} remaining
                </p>
              )}
            </div>

            <div>
              <Label className="text-base font-semibold text-slate-900">
                Cuisine Preference * ({formData.quantity} {formData.type === "TABLE" ? "table" : "seat"}{formData.quantity !== 1 ? "s" : ""})
              </Label>
              <p className="text-sm text-slate-600 mt-1 mb-4">
                {formData.type === "TABLE"
                  ? "Please select a cuisine preference for each table you are booking. All guests at a table MUST be served the same cuisine."
                  : "Please select a cuisine preference for each seat you are booking."
                }
              </p>
              <div className="space-y-3">
                {Array.from({ length: formData.quantity }).map((_item, index) => (
                  <div key={index} className="space-y-2">
                    <Label htmlFor={`cuisine-${index}`} className="text-sm font-medium text-slate-700">
                      {formData.type === "TABLE" ? "Table" : "Seat"} {index + 1} *
                    </Label>
                    <select
                      id={`cuisine-${index}`}
                      value={formData.cuisines[index] || ""}
                      onChange={(e) => {
                        const newCuisines = [...formData.cuisines]
                        newCuisines[index] = e.target.value
                        // Ensure array length matches quantity
                        while (newCuisines.length < formData.quantity) {
                          newCuisines.push("")
                        }
                        setFormData({ ...formData, cuisines: newCuisines })
                      }}
                      required
                      className="block w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
                    >
                      <option value="">Select cuisine</option>
                      <option value="Chinese">Chinese</option>
                      <option value="Chinese-Vegetarian">Chinese-Vegetarian</option>
                      <option value="Halal">Halal</option>
                    </select>
                  </div>
                ))}
              </div>
              
              {/* Table Bundle Discount Button */}
              {formData.type === "SEAT" && formData.quantity === 10 && !formData.tableDiscountApplied && (
                formData.membershipNo && formData.membershipNo.trim() ? (
                  (() => {
                    // Check if all cuisines are selected and valid for discount
                    const validCuisines = ["Halal", "Chinese-Vegetarian"]
                    const allCuisinesSelected = formData.cuisines.length === 10 && formData.cuisines.every(c => c && c.trim())
                    const allSpecialCuisines = allCuisinesSelected && formData.cuisines.every(c => validCuisines.includes(c))

                    return allSpecialCuisines ? (
                      <div className="mt-4 p-4 rounded-xl bg-green-50 border border-green-200">
                        <p className="text-sm font-semibold text-green-700 flex items-center gap-2 mb-2">
                          <span>🎉</span> Table Bundle Discount Available!
                        </p>
                        <p className="text-xs text-green-600 mb-3">
                          All 10 seats have Halal or Chinese-Vegetarian cuisine. Click below to get the table price instead of 10 individual seat prices.
                        </p>
                        <Button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, tableDiscountApplied: true }))}
                          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold"
                        >
                          Apply Table Bundle Discount
                        </Button>
                      </div>
                    ) : (
                      <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200">
                        <p className="text-sm font-semibold text-amber-700 flex items-center gap-2">
                          <span>💡</span> Table Bundle Discount Available
                        </p>
                        <p className="text-xs text-amber-600 mt-1">
                          Select your cuisine for all 10 seats to unlock the table bundle discount.
                        </p>
                      </div>
                    )
                  })()
                ) : (
                  <div className="mt-4 p-4 rounded-xl bg-blue-50 border border-blue-200">
                    <p className="text-sm font-semibold text-blue-700 flex items-center gap-2">
                      <span>ℹ️</span> Membership Required
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Enter a membership number below to unlock the table bundle discount for 10 seats.
                    </p>
                  </div>
                )
              )}

              {/* Applied Discount Confirmation */}
              {formData.tableDiscountApplied && (
                <div className="mt-4 p-4 rounded-xl bg-green-50 border border-green-200">
                  <p className="text-sm font-semibold text-green-700 flex items-center gap-2">
                    <span>✅</span> Table Bundle Discount Applied!
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    You&apos;re getting the table price instead of 10 individual seat prices.
                  </p>
                </div>
              )}
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
              <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 mb-3">
                <p className="text-sm text-blue-700 font-medium">
                  Enter your membership number for members-only price (Optional).
                  <Input
                id="membershipNo"
                value={formData.membershipNo}
                onChange={(e) => {
                  setFormData({ ...formData, membershipNo: e.target.value })
                  // Hide the success message immediately when user starts typing
                  if (showMembershipToast) {
                    setShowMembershipToast(false)
                  }
                }}
                onBlur={() => {
                  // Auto-apply member price when user clicks away - delay for 2 seconds
                  if (formData.membershipNo && formData.membershipNo.trim()) {
                    setTimeout(() => {
                      setShowMembershipToast(true)
                      toast({
                        title: "Members price applied",
                        description: "Member pricing has been applied to your booking",
                      })
                    }, 2000)
                  } else {
                    setShowMembershipToast(false)
                  }
                }}
                className="mt-2"
                placeholder="Enter membership number"
              />
              {showMembershipToast && (
                <p className="mt-2 text-sm text-green-600 font-semibold flex items-center gap-1">
                  <span className="text-green-600">✓</span> Members price applied
                </p>
              )}
                </p>
              </div>

            </div>

            <div className="space-y-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <Label className="text-base font-semibold text-slate-900">Tell us about your batch:</Label>

              <div className="space-y-3">
                <div className="flex flex-wrap gap-6">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="radio"
                      name="batchType"
                      checked={formData.batchType === "SCHOOL_YEAR"}
                      onChange={() => setFormData({ ...formData, batchType: "SCHOOL_YEAR", psgSchool: "", schoolStaffSchool: "" })}
                      className="w-4 h-4 text-primary focus:ring-primary focus:ring-2"
                    />
                    <span className="text-sm font-medium text-slate-700 group-hover:text-primary transition-colors">School + Year of Completion</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="radio"
                      name="batchType"
                      checked={formData.batchType === "PSG"}
                      onChange={() => setFormData({ ...formData, batchType: "PSG", school: "", gradYear: undefined, schoolStaffSchool: "" })}
                      className="w-4 h-4 text-primary focus:ring-primary focus:ring-2"
                    />
                    <span className="text-sm font-medium text-slate-700 group-hover:text-primary transition-colors">PSG</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="radio"
                      name="batchType"
                      checked={formData.batchType === "SCHOOL_STAFF"}
                      onChange={() => setFormData({ ...formData, batchType: "SCHOOL_STAFF", school: "", gradYear: undefined, psgSchool: "" })}
                      className="w-4 h-4 text-primary focus:ring-primary focus:ring-2"
                    />
                    <span className="text-sm font-medium text-slate-700 group-hover:text-primary transition-colors">School Staff</span>
                  </label>
                </div>
              </div>

              {formData.batchType === "SCHOOL_YEAR" && (
                <div className="space-y-4 border-t border-slate-300 pt-4 mt-4 transition-all duration-300 ease-out animate-slide-down">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="transition-all duration-300 ease-out delay-75 animate-slide-down">
                      <Label htmlFor="school">School *</Label>
                      <Input
                        id="school"
                        value={formData.school}
                        onChange={(e) =>
                          setFormData({ ...formData, school: e.target.value })
                        }
                        placeholder="e.g., ACS (Barker Road), ACS (Independent), etc."
                        required
                        className="mt-2"
                      />
                    </div>

                    <div className="transition-all duration-300 ease-out delay-75 animate-slide-down">
                      <Label htmlFor="gradYear">Year of Completion *</Label>
                      <Input
                        id="gradYear"
                        type="number"
                        min="1900"
                        max={new Date().getFullYear() + 10}
                        value={formData.gradYear || ""}
                        onChange={(e) => {
                          const value = e.target.value
                          if (value === "") {
                            setFormData({ ...formData, gradYear: undefined })
                          } else {
                            const year = parseInt(value, 10)
                            if (!isNaN(year)) {
                              setFormData({ ...formData, gradYear: year })
                            }
                          }
                        }}
                        placeholder="e.g., 2020"
                        required
                        className="mt-2"
                      />
                    </div>
                  </div>
                </div>
              )}

              {formData.batchType === "PSG" && (
                <div className="space-y-4 border-t border-slate-300 pt-4 mt-4 transition-all duration-300 ease-out animate-slide-down">
                  <div className="transition-all duration-300 ease-out delay-75 animate-slide-down">
                    <Label htmlFor="psgSchool">PSG School *</Label>
                    <select
                      id="psgSchool"
                      value={formData.psgSchool}
                onChange={(e) =>
                        setFormData({ ...formData, psgSchool: e.target.value })
                }
                required
                      className="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
                    >
                      <option value="">Select a school</option>
                      <option value="ACS Primary">ACS Primary</option>
                      <option value="ACS Junior">ACS Junior</option>
                      <option value="ACS Barker Road">ACS Barker Road</option>
                      <option value="ACS Independent">ACS Independent</option>
                      <option value="ACS International">ACS International</option>
                      <option value="ACS Academy">ACS Academy</option>
                      <option value="ACJC">ACJC</option>
                    </select>
            </div>
                </div>
              )}

              {formData.batchType === "SCHOOL_STAFF" && (
                <div className="space-y-4 border-t border-slate-300 pt-4 mt-4 transition-all duration-300 ease-out animate-slide-down">
                  <div className="transition-all duration-300 ease-out delay-75 animate-slide-down">
                    <Label htmlFor="schoolStaffSchool">School *</Label>
                    <select
                      id="schoolStaffSchool"
                      value={formData.schoolStaffSchool}
                onChange={(e) =>
                        setFormData({ ...formData, schoolStaffSchool: e.target.value })
                }
                required
                      className="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
                    >
                      <option value="">Select a school</option>
                      <option value="ACS Primary">ACS Primary</option>
                      <option value="ACS Junior">ACS Junior</option>
                      <option value="ACS Barker Road">ACS Barker Road</option>
                      <option value="ACS Independent">ACS Independent</option>
                      <option value="ACS International">ACS International</option>
                      <option value="ACS Academy">ACS Academy</option>
                      <option value="ACJC">ACJC</option>
                    </select>
            </div>
            </div>
              )}

              <p className="text-xs text-slate-500 italic">
                We will attempt to seat you with your batch or group on a best effort basis
              </p>
            </div>

            <div>
              <Label htmlFor="voucherCode">Voucher Code (Optional)</Label>
              <div className="mt-2 flex gap-2">
                <Input
                  id="voucherCode"
                  value={formData.voucherCode}
                  onChange={(e) => {
                    setFormData({ ...formData, voucherCode: e.target.value.toUpperCase() })
                    // Reset validation if voucher code changes
                    if (voucherValidated) {
                      setVoucherValidated(false)
                      setVoucherData(null)
                    }
                  }}
                  className="flex-1"
                  placeholder="Enter voucher code"
                />
                <Button
                  type="button"
                  onClick={handleValidateVoucher}
                  disabled={validatingVoucher || !formData.voucherCode.trim()}
                  variant={voucherValidated ? "default" : "outline"}
                  className={voucherValidated ? "bg-secondary text-primary hover:bg-secondary/90 font-semibold" : "border-2 border-slate-200 hover:border-primary hover:text-primary hover:bg-primary/5"}
                >
                  {validatingVoucher ? "Validating..." : voucherValidated ? "✓ Applied" : "Apply"}
                </Button>
              </div>
              {voucherValidated && voucherData && (
                <p className="mt-2 text-sm text-green-600 font-semibold flex items-center gap-1">
                  <span className="text-green-600">✓</span> Voucher code applied
                </p>
              )}
            </div>

            {/* Second Apply Table Discount Button */}
            {formData.type === "SEAT" && formData.quantity === 10 && !formData.tableDiscountApplied && (
              formData.membershipNo && formData.membershipNo.trim() ? (
                (() => {
                  // Check if all cuisines are selected and valid for discount
                  const validCuisines = ["Halal", "Chinese-Vegetarian"]
                  const allCuisinesSelected = formData.cuisines.length === 10 && formData.cuisines.every(c => c && c.trim())
                  const allSpecialCuisines = allCuisinesSelected && formData.cuisines.every(c => validCuisines.includes(c))

                  return allSpecialCuisines ? (
                    <div className="flex justify-center mb-4">
                      <Button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, tableDiscountApplied: true }))}
                        className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2"
                      >
                        🎉 Apply Table Bundle Discount
                      </Button>
                    </div>
                  ) : null
                })()
              ) : null
            )}

            <div className="rounded-xl border-2 border-slate-200 bg-gradient-to-br from-slate-50 to-white p-6 shadow-sm">
              <div className="space-y-3 mb-4">
                {formData.type === "TABLE" && (
                  <>
                    <div className="flex justify-between text-sm font-medium text-slate-700">
                      <span>Table ({formData.tableCapacity}-seater) × {formData.quantity}</span>
                      <span className={`text-slate-900 ${(priceBreakdown.tableDiscount > 0 || priceBreakdown.promoDiscount > 0) ? 'line-through text-slate-500' : ''}`}>S${priceBreakdown.displayTablePrice.toFixed(2)}</span>
                    </div>
                    {priceBreakdown.tableDiscount > 0 && (
                      <div className="flex justify-between text-sm font-medium text-green-600">
                        <span>Member Discount</span>
                        <span>-S${priceBreakdown.tableDiscount.toFixed(2)}</span>
                      </div>
                    )}
                    {priceBreakdown.promoDiscount > 0 && priceBreakdown.tableDiscount === 0 && (
                      <div className="flex justify-between text-sm font-medium text-orange-600">
                        <span>🎉 Promotional Price</span>
                        <span>-S${priceBreakdown.promoDiscount.toFixed(2)}</span>
                      </div>
                    )}
                  </>
                )}
                {formData.type === "SEAT" && (
                  <>
                    <div className="flex justify-between text-sm font-medium text-slate-700">
                      <span>Individual Seat × {formData.quantity}</span>
                      <span className={`text-slate-900 ${(priceBreakdown.seatDiscount > 0 || priceBreakdown.promoDiscount > 0) ? 'line-through text-slate-500' : ''}`}>S${priceBreakdown.displaySeatPrice.toFixed(2)}</span>
                    </div>
                    {priceBreakdown.seatDiscount > 0 && (
                      <div className="flex justify-between text-sm font-medium text-green-600">
                        <span>Member Discount</span>
                        <span>-S${priceBreakdown.seatDiscount.toFixed(2)}</span>
                      </div>
                    )}
                    {priceBreakdown.promoDiscount > 0 && priceBreakdown.seatDiscount === 0 && (
                      <div className="flex justify-between text-sm font-medium text-orange-600">
                        <span>🎉 Promotional Price</span>
                        <span>-S${priceBreakdown.promoDiscount.toFixed(2)}</span>
                      </div>
                    )}
                    {priceBreakdown.tableBundleDiscount > 0 && (
                      <div className="flex justify-between text-sm font-medium text-green-600">
                        <span>🎉 Table Bundle Discount</span>
                        <span>-S${priceBreakdown.tableBundleDiscount.toFixed(2)}</span>
                      </div>
                    )}
                  </>
                )}
                {priceBreakdown.voucherDiscount > 0 && (
                  <div className="flex justify-between text-sm font-medium text-green-600">
                    <span>Voucher Discount</span>
                    <span>-S${priceBreakdown.voucherDiscount.toFixed(2)}</span>
                  </div>
                )}
              </div>
              <div className="border-t-2 border-slate-300 pt-4 mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-slate-900">Total Charge:</span>
                  <span className="text-2xl font-bold text-primary">S${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 text-base font-bold bg-primary hover:bg-brand-red transition-colors rounded-xl shadow-lg hover:shadow-brand-red/25"
            >
              {loading ? "Processing..." : "Proceed to Payment"}
            </Button>
          </form>
          </div>
              </>
            )}
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