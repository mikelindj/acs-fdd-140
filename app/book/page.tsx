"use client"

import { useState } from "react"
import Link from "next/link"
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

export default function BookPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  
  // State
  const [bookingOption, setBookingOption] = useState<"SEAT" | "TABLE_10" | "TABLE_11">("TABLE_10")
  
  // Default quantity to 1 for everything
  const [formData, setFormData] = useState({
    category: "OBA" as "VIP" | "SCHOOL" | "OBA" | "GUEST",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await createBooking({
        ...formData,
        ...payload,
        gradYear: formData.gradYear ? parseInt(formData.gradYear) : undefined,
      })
      
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
           </div>
        </div>
      </footer>
    </div>
  )
}