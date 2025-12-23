"use client"

import { useState } from "react"
import Link from "next/link"
import { useState, useEffect, useCallback } from "react"
import { createBooking } from "@/app/actions/booking"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { calculateTotal } from "@/lib/pricing"
import { UnifrakturMaguntia } from "next/font/google"
import { Users, User, CheckCircle2, Loader2 } from "lucide-react"

const oldFont = UnifrakturMaguntia({ 
  weight: "400", subsets: ["latin"], variable: "--font-old",
})

interface InventorySettings {
  tablePrice: number
  seatPrice: number
  tablePromoPrice: number | null
  seatPromoPrice: number | null
  tableMembersPrice: number | null
  seatMembersPrice: number | null
}


export default function BookPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  
  // State
  const [bookingOption, setBookingOption] = useState<"SEAT" | "TABLE_10" | "TABLE_11">("TABLE_10")
  
  // Default quantity to 1 for everything
  const [formData, setFormData] = useState({
    category: "OBA" as "VIP" | "SCHOOL" | "OBA" | "GUEST",
    quantity: 1, 
  const [validatingMembership, setValidatingMembership] = useState(false)
  const [membershipValidated, setMembershipValidated] = useState(false)
  const [inventorySettings, setInventorySettings] = useState<InventorySettings | null>(null)
  const [inventoryAvailable, setInventoryAvailable] = useState<{
    available: boolean
    availableCount: number
    error?: string
  } | null>(null)
  const [formData, setFormData] = useState({
    type: "TABLE" as "TABLE" | "SEAT",
    tableCapacity: 10 as 10 | 11,
    quantity: 1,
    buyerName: "",
    buyerEmail: "",
    buyerMobile: "",
    membershipNo: "",
    gradYear: "",
  })

  // Logic to determine payload type
  const getBookingPayload = () => {
    if (bookingOption === "SEAT") {
      return { 
        type: "SEAT" as const, 
        quantity: formData.quantity, 
        capacity: undefined 
      }
    } else {
      return { 
        type: "TABLE" as const, 
        quantity: formData.quantity, 
        capacity: bookingOption === "TABLE_10" ? 10 : 11 
      }
    }
  }

  const payload = getBookingPayload()
  const total = calculateTotal(payload.quantity, formData.category, payload.type)
    wantsBatchSeating: false,
    school: "",
    gradYear: undefined as number | undefined,
  })

  // Fetch inventory settings on mount
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const res = await fetch("/api/pricing/public")
        if (res.ok) {
          const data = await res.json()
          // Extract pricing from the response
          const tablePrice = data.table?.regular?.nonMember || 1000
          const seatPrice = data.seat?.regular?.nonMember || 100
          const tablePromoPrice = data.table?.promo?.nonMember || null
          const seatPromoPrice = data.seat?.promo?.nonMember || null
          const tableMembersPrice = data.table?.regular?.member || null
          const seatMembersPrice = data.seat?.regular?.member || null
          
          setInventorySettings({
            tablePrice,
            seatPrice,
            tablePromoPrice,
            seatPromoPrice,
            tableMembersPrice,
            seatMembersPrice,
          })
        }
      } catch (error) {
        console.error("Error fetching inventory:", error)
        // Use defaults
        setInventorySettings({
          tablePrice: 1000,
          seatPrice: 100,
          tablePromoPrice: null,
          seatPromoPrice: null,
          tableMembersPrice: null,
          seatMembersPrice: null,
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

  // Calculate price breakdown based on inventory settings
  const calculatePriceBreakdown = useCallback(() => {
    if (!inventorySettings) {
      return {
        tablePrice: 0,
        tableDiscount: 0,
        seatPrice: 0,
        seatDiscount: 0,
        total: 0,
      }
    }

    const isTable = formData.type === "TABLE"
    const isElevenSeater = isTable && formData.tableCapacity === 11
    
    // Base prices (non-discounted)
    const baseTablePrice = Number(inventorySettings.tablePrice)
    const baseSeatPrice = Number(inventorySettings.seatPrice)
    
    // Get actual prices (with membership or promo discounts)
    let tablePrice: number
    let seatPrice: number
    let tableDiscount = 0
    let seatDiscount = 0

    if (membershipValidated && formData.membershipNo) {
      // Use members price if validated
      tablePrice = Number(inventorySettings.tableMembersPrice || inventorySettings.tablePrice)
      seatPrice = Number(inventorySettings.seatMembersPrice || inventorySettings.seatPrice)
      // Calculate discount from base price (only if lower than base)
      tableDiscount = Math.max(0, baseTablePrice - tablePrice)
      seatDiscount = Math.max(0, baseSeatPrice - seatPrice)
    } else {
      // Use promo price if available, otherwise base price
      tablePrice = Number(inventorySettings.tablePromoPrice || inventorySettings.tablePrice)
      seatPrice = Number(inventorySettings.seatPromoPrice || inventorySettings.seatPrice)
      // Calculate discount from base price (only if promo is lower than base)
      tableDiscount = Math.max(0, baseTablePrice - tablePrice)
      seatDiscount = Math.max(0, baseSeatPrice - seatPrice)
    }

    let total = 0
    if (isElevenSeater) {
      // 11-seater = 1 table (10-seater) + 1 seat
      total = (tablePrice + seatPrice) * formData.quantity
    } else if (isTable) {
      // 10-seater table
      total = tablePrice * formData.quantity
    } else {
      // Individual seat
      total = seatPrice * formData.quantity
    }

    return {
      tablePrice: isTable ? tablePrice * formData.quantity : 0,
      tableDiscount: isTable ? tableDiscount * formData.quantity : 0,
      seatPrice: (isElevenSeater || !isTable) ? seatPrice * formData.quantity : 0,
      seatDiscount: (isElevenSeater || !isTable) ? seatDiscount * formData.quantity : 0,
      total: Math.round(total * 100) / 100,
    }
  }, [inventorySettings, formData.type, formData.tableCapacity, formData.quantity, membershipValidated, formData.membershipNo])

  const priceBreakdown = calculatePriceBreakdown()
  const total = priceBreakdown.total

  const handleValidateMembership = async () => {
    if (!formData.membershipNo.trim()) {
      toast({
        title: "Error",
        description: "Please enter a membership number",
        variant: "destructive",
      })
      return
    }

    setValidatingMembership(true)
    try {
      // For now, auto-approve any membership number (validation logic will be added later)
      // In the future, this will call an API to validate
      await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate API call
      setMembershipValidated(true)
      toast({
        title: "Success",
        description: "Members price applied",
      })
    } catch {
      toast({
        title: "Error",
        description: "Failed to validate membership",
        variant: "destructive",
      })
    } finally {
      setValidatingMembership(false)
    }
  }

  // Default category to OBA
  const defaultCategory = "OBA" as const

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate school and gradYear if wantsBatchSeating is true
    if (formData.wantsBatchSeating) {
      if (!formData.school?.trim()) {
        toast({
          title: "Error",
          description: "School is required when requesting batch seating",
          variant: "destructive",
        })
        return
      }
      if (!formData.gradYear) {
        toast({
          title: "Error",
          description: "Year of completion is required when requesting batch seating",
          variant: "destructive",
        })
        return
      }
    }
    
    setLoading(true)

    try {
      const result = await createBooking({
        ...formData,
        ...payload,
        gradYear: formData.gradYear ? parseInt(formData.gradYear) : undefined,
      })
      
      const bookingData = {
        ...formData,
        category: defaultCategory,
        tableCapacity: formData.type === "TABLE" ? formData.tableCapacity : undefined,
        membershipValidated: membershipValidated && !!formData.membershipNo,
        wantsBatchSeating: formData.wantsBatchSeating,
        school: formData.wantsBatchSeating ? formData.school : undefined,
        gradYear: formData.wantsBatchSeating ? formData.gradYear : undefined,
      }
      const result = await createBooking(bookingData)
      if (result.error) {
        toast({ title: "Error", description: result.error, variant: "destructive" })
      } else if (result.paymentUrl) {
        window.location.href = result.paymentUrl
      }
    } catch {
      toast({ title: "Error", description: "Failed to create booking", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`min-h-screen flex flex-col bg-primary font-sans selection:bg-brand-red selection:text-white ${oldFont.variable}`}>
      
      {/* HEADER */}
      <header className="relative z-50 w-full bg-white shadow-md">
        <div className="container mx-auto px-4 h-24 flex items-center justify-between">
          <Link href="/">
             <div className="h-20 w-auto py-2 hover:scale-105 transition-transform duration-300">
               <img src="/images/acs-140-logo.jpg" alt="ACS 140" className="object-contain w-full h-full" />
             </div>
          </Link>
        </div>
        <div className="h-1.5 w-full bg-gradient-to-r from-primary via-brand-red to-secondary" />
      </header>

      <main className="flex-1 container mx-auto px-4 py-12 max-w-5xl relative">
        
        {/* Title Section */}
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-5xl md:text-7xl font-bold text-white font-old drop-shadow-lg">
            Reserve Your Place
          </h1>
          <p className="text-slate-200 text-lg font-light tracking-wide">
            Select your preferred arrangement below.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-12">
          
          {/* 1. SELECTION CARDS */}
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { id: "SEAT", label: "Individual Seat", icon: User, desc: "Single ticket. Open seating." },
              { id: "TABLE_10", label: "Table of 10", icon: Users, desc: "Private table for 10 guests." },
              { id: "TABLE_11", label: "Table of 11", icon: Users, desc: "Maximize group size to 11." }
            ].map((opt) => (
              <div 
                key={opt.id}
                onClick={() => setBookingOption(opt.id as any)}
                className={`cursor-pointer relative p-6 rounded-xl border-2 transition-all duration-300 ${
                  bookingOption === opt.id 
                  ? "bg-white border-secondary shadow-[0_0_30px_rgba(255,198,41,0.2)] scale-[1.03] z-10" 
                  : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/30"
                }`}
              >
                {bookingOption === opt.id && (
                  <div className="absolute -top-3 -right-3 bg-secondary text-primary rounded-full p-1 shadow-lg">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                )}
                <opt.icon className={`w-8 h-8 mb-4 ${bookingOption === opt.id ? "text-brand-red" : "text-slate-400"}`} />
                <h3 className={`text-xl font-bold ${bookingOption === opt.id ? "text-primary" : "text-white"}`}>{opt.label}</h3>
                <p className={`text-sm mt-2 ${bookingOption === opt.id ? "text-slate-600" : "text-slate-400"}`}>{opt.desc}</p>
              </div>
            ))}
          </div>

          {/* 2. THE PAPER FORM CARD */}
          <div className="relative bg-white rounded-[2px] md:rounded-[2rem] p-8 md:p-12 shadow-2xl">
             
             {/* Decorative Top Line */}
             <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-red via-primary to-secondary opacity-80" />
             
             {/* LOGO ON TOP (Letterhead Style) */}
             <div className="flex justify-center mb-10">
                <div className="w-24 h-24 md:w-32 md:h-32 drop-shadow-xl">
                   <img 
                     src="/images/acs-logo.png" 
                     alt="ACS Crest" 
                     className="w-full h-full object-contain"
                   />
                </div>
             </div>

             {/* Form Fields */}
             <div className="grid md:grid-cols-2 gap-8 relative z-10 mb-10">
                <div className="space-y-6">
                   <div className="space-y-2">
                      <Label className="text-primary font-bold uppercase text-xs tracking-wider">Category</Label>
                      <select 
                        className="w-full h-12 rounded-lg border border-slate-200 bg-slate-50 px-3 focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
                        value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as any})}
                      >
                        <option value="VIP">VIP</option>
                        <option value="SCHOOL">School</option>
                        <option value="OBA">OBA</option>
                        <option value="GUEST">Guest</option>
                      </select>
                   </div>

                   <div className="space-y-2">
                     <Label className="text-primary font-bold uppercase text-xs tracking-wider">
                        {bookingOption === "SEAT" ? "Number of Seats" : "Number of Tables"}
                     </Label>
                     <Input 
                        type="number" 
                        min="1" 
                        max="10" 
                        className="h-12 bg-slate-50" 
                        value={formData.quantity} 
                        onChange={e => setFormData({...formData, quantity: parseInt(e.target.value)||1})} 
                     />
                   </div>

                   <div className="space-y-2">
                     <Label className="text-primary font-bold uppercase text-xs tracking-wider">Full Name</Label>
                     <Input className="h-12 bg-slate-50" placeholder="e.g. Tan Ah Seng" value={formData.buyerName} onChange={e => setFormData({...formData, buyerName: e.target.value})} />
                   </div>
                   
                   <div className="space-y-2">
                     <Label className="text-primary font-bold uppercase text-xs tracking-wider">Email Address</Label>
                     <Input className="h-12 bg-slate-50" placeholder="name@example.com" value={formData.buyerEmail} onChange={e => setFormData({...formData, buyerEmail: e.target.value})} />
                   </div>
                </div>

                <div className="space-y-6">
                   <div className="space-y-2">
                     <Label className="text-primary font-bold uppercase text-xs tracking-wider">Mobile Number</Label>
                     <Input className="h-12 bg-slate-50" placeholder="+65 9123 4567" value={formData.buyerMobile} onChange={e => setFormData({...formData, buyerMobile: e.target.value})} />
                   </div>
                   
                   <div className="space-y-2">
                     <Label className="text-primary font-bold uppercase text-xs tracking-wider">Membership No. (Optional)</Label>
                     <Input className="h-12 bg-slate-50" placeholder="ACS OBA No." value={formData.membershipNo} onChange={e => setFormData({...formData, membershipNo: e.target.value})} />
                   </div>

                   <div className="space-y-2">
                     <Label className="text-brand-red font-bold uppercase text-xs tracking-wider flex items-center gap-2">
                       Batch Year 
                       <span className="text-slate-400 font-normal normal-case">(Your Cohort)</span>
                     </Label>
                     <Input className="h-12 bg-slate-50 border-brand-red/20 focus:border-brand-red" placeholder="e.g. 1998" value={formData.gradYear} onChange={e => setFormData({...formData, gradYear: e.target.value})} />
                   </div>
                </div>
             </div>

             {/* NORMAL SUBMIT BUTTON SECTION */}
             <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-slate-100 gap-6">
                
                {/* Total Display */}
                <div className="text-center md:text-left">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Total Payable</p>
                  <p className="text-4xl font-bold text-primary font-old">S${total.toLocaleString()}</p>
                  <p className="text-sm text-slate-500 mt-1">Includes all taxes & fees</p>
                </div>

                {/* Submit Action */}
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full md:w-auto px-10 h-16 bg-secondary hover:bg-secondary/90 text-primary text-lg font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1"
                >
                  {loading ? (
                     <>
                       <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing...
                     </>
                  ) : (
                     "Proceed to Payment"
                  )}
                </Button>
             </div>

          </div>
        </form>
      </main>

      {/* FOOTER */}
      <footer className="bg-primary-foreground/5 border-t border-white/5 py-12 relative z-10">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
           <div className="flex items-center gap-3 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
               <div className="relative h-10 w-10 bg-white rounded-full p-1">
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* --- HEADER --- */}
      <header className="relative z-50 w-full bg-white bg-wavy-pattern border-b border-slate-100 shadow-sm">
        <div className="container max-w-6xl mx-auto px-4 h-32 md:h-40 flex items-center justify-between">
          <div className="flex items-center">
             {/* ACS 140 Logo (Big) */}
             <div className="relative h-24 md:h-32 w-auto transition-transform hover:scale-105 duration-300">
               <img 
                 src="/images/acs-140-logo.jpg" 
                 alt="ACS 140 Years" 
                 className="object-contain w-full h-full"
               />
             </div>
          </div>
          
          <nav className="flex items-center gap-6 text-sm font-medium text-slate-600">
             {/* Navigation Items (Empty) */}
          </nav>
        </div>
      </header>

      <main className="flex-1 py-12 px-4">
        <div className="container max-w-6xl mx-auto">
          <div className="max-w-2xl mx-auto">
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
                value={formData.type === "SEAT" ? "SEAT" : `TABLE-${formData.tableCapacity}`}
                onChange={(e) => {
                  const value = e.target.value
                  if (value === "SEAT") {
                    setFormData({ ...formData, type: "SEAT" })
                  } else {
                    const capacity = value === "TABLE-11" ? 11 : 10
                    setFormData({ ...formData, type: "TABLE", tableCapacity: capacity })
                  }
                }}
                className="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
              >
                <option value="TABLE-10">Table (10 seater)</option>
                <option value="TABLE-11">Table (11 seater)</option>
                <option value="SEAT">Individual Seat (1 seat)</option>
              </select>
            </div>

            <div>
              <Label htmlFor="quantity">Quantity *</Label>
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
                    setFormData({
                      ...formData,
                      quantity: newQuantity,
                    })
                  }
                }}
                required
                className="mt-2"
              />
              {inventoryAvailable && !inventoryAvailable.available && (
                <p className="mt-2 text-sm text-brand-red font-medium">
                  {inventoryAvailable.error || `Only ${inventoryAvailable.availableCount} available. You requested ${formData.quantity}.`}
                </p>
              )}
              {inventoryAvailable && inventoryAvailable.available && inventoryAvailable.availableCount < 5 && (
                <p className="mt-2 text-sm text-orange-600 font-medium">
                  Only {inventoryAvailable.availableCount} {formData.type === "TABLE" ? "table" : "seat"}{inventoryAvailable.availableCount !== 1 ? "s" : ""} remaining
                </p>
              )}
            </div>

            <div className="space-y-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="space-y-3">
                <Label className="text-base font-semibold text-slate-900">Would you like to be seated near or with your batch?</Label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="radio"
                      name="wantsBatchSeating"
                      checked={formData.wantsBatchSeating === true}
                      onChange={() => setFormData({ ...formData, wantsBatchSeating: true })}
                      className="w-4 h-4 text-primary focus:ring-primary focus:ring-2"
                    />
                    <span className="text-sm font-medium text-slate-700 group-hover:text-primary transition-colors">Yes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="radio"
                      name="wantsBatchSeating"
                      checked={formData.wantsBatchSeating === false}
                      onChange={() => setFormData({ ...formData, wantsBatchSeating: false, school: "", gradYear: undefined })}
                      className="w-4 h-4 text-primary focus:ring-primary focus:ring-2"
                    />
                    <span className="text-sm font-medium text-slate-700 group-hover:text-primary transition-colors">No</span>
                  </label>
                </div>
                <p className="text-xs text-slate-500 italic">
                  We will attempt to seat you on a best effort basis
                </p>
              </div>

              {formData.wantsBatchSeating && (
                <div className="space-y-4 border-t border-slate-300 pt-4 mt-4 transition-all duration-300 ease-out animate-slide-down">
                  <Label className="text-base font-semibold text-slate-900">Tell us about the batch that you most identify with:</Label>
                  
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
                        required={formData.wantsBatchSeating}
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
                        required={formData.wantsBatchSeating}
                        className="mt-2"
                      />
                    </div>
                  </div>
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
              <Label htmlFor="membershipNo">Membership Number (Optional)</Label>
              <div className="mt-2 flex gap-2">
                <Input
                  id="membershipNo"
                  value={formData.membershipNo}
                  onChange={(e) => {
                    setFormData({ ...formData, membershipNo: e.target.value })
                    // Reset validation if membership number changes
                    if (membershipValidated) {
                      setMembershipValidated(false)
                    }
                  }}
                  className="flex-1"
                  placeholder="Enter membership number"
                />
                <Button
                  type="button"
                  onClick={handleValidateMembership}
                  disabled={validatingMembership || !formData.membershipNo.trim()}
                  variant={membershipValidated ? "default" : "outline"}
                  className={membershipValidated ? "bg-secondary text-primary hover:bg-secondary/90 font-semibold" : "border-2 border-slate-200 hover:border-primary hover:text-primary hover:bg-primary/5"}
                >
                  {validatingMembership ? "Validating..." : membershipValidated ? "✓ Validated" : "Validate"}
                </Button>
              </div>
              {membershipValidated && (
                <p className="mt-2 text-sm text-green-600 font-semibold flex items-center gap-1">
                  <span className="text-green-600">✓</span> Members price applied
                </p>
              )}
            </div>

            <div className="rounded-xl border-2 border-slate-200 bg-gradient-to-br from-slate-50 to-white p-6 shadow-sm">
              <div className="space-y-3 mb-4">
                {formData.type === "TABLE" && (
                  <>
                    <div className="flex justify-between text-sm font-medium text-slate-700">
                      <span>Table ({formData.tableCapacity}-seater) × {formData.quantity}</span>
                      <span className="text-slate-900">S${priceBreakdown.tablePrice.toFixed(2)}</span>
                    </div>
                    {priceBreakdown.tableDiscount > 0 && (
                      <div className="flex justify-between text-sm font-medium text-green-600">
                        <span>Table Discount</span>
                        <span>-S${priceBreakdown.tableDiscount.toFixed(2)}</span>
                      </div>
                    )}
                  </>
                )}
                {(formData.type === "SEAT" || (formData.type === "TABLE" && formData.tableCapacity === 11)) && (
                  <>
                    <div className="flex justify-between text-sm font-medium text-slate-700">
                      <span>
                        {formData.type === "SEAT" 
                          ? `Individual Seat × ${formData.quantity}`
                          : `11th Seat Rate × ${formData.quantity}`
                        }
                      </span>
                      <span className="text-slate-900">S${priceBreakdown.seatPrice.toFixed(2)}</span>
                    </div>
                    {priceBreakdown.seatDiscount > 0 && (
                      <div className="flex justify-between text-sm font-medium text-green-600">
                        <span>
                          {formData.type === "SEAT" ? "Seat Discount" : "11th Seat Discount"}
                        </span>
                        <span>-S${priceBreakdown.seatDiscount.toFixed(2)}</span>
                      </div>
                    )}
                  </>
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
          </div>
        </div>
      </main>

      {/* --- FOOTER --- */}
      <footer className="bg-slate-900 border-t border-slate-700 py-12">
        <div className="container max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
           <div className="flex items-center gap-3">
               <div className="relative h-10 w-10 opacity-90 hover:opacity-100 transition-opacity duration-500">
                  <img 
                    src="/images/acs-logo.png" 
                    alt="ACS Logo" 
                    className="object-contain w-full h-full"
                  />
               </div>
               <span className="font-bold text-white tracking-tight">ACS COMMUNITY</span>
           </div>
           
           <div className="text-center md:text-right">
              <a href="mailto:events@acs.edu.sg" className="text-sm font-medium text-slate-400 hover:text-brand-red transition-colors">
                events@acs.edu.sg
              </a>
              <p className="text-xs text-slate-500 mt-2">© 2026 ACS Founders&apos; Day Committee</p>
               <span className="font-bold text-white tracking-tight">ACS OBA</span>
           </div>
           
           <div className="text-center text-white md:text-right">
              © 140th ACS OBA FOUNDERS DAY DINNER, 2026
              <p className="text-xs text-slate-400 mt-2">This page designed and built by <a href="https://nofa.io" className="hover:text-white transition-colors">Michael Lin</a> and <a href="https://github.com/kennethch22" className="hover:text-white transition-colors">Kenneth Hendra</a></p>
           </div>
        </div>
      </footer>
    </div>
  )
}