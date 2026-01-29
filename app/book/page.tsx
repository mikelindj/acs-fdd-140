"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/Logo"
import { Footer } from "@/components/Footer"
import { AlertCircle } from "lucide-react"
import Link from "next/link"

export default function BookPage() {
  const [eventSettings, setEventSettings] = useState<{
    eventName: string | null
    logoImageUrl: string | null
    footerLogoImageUrl: string | null
  }>({
    eventName: null,
    logoImageUrl: null,
    footerLogoImageUrl: null,
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

  return (
    <div className="min-h-screen flex flex-col bg-white bg-wavy-pattern font-sans selection:bg-brand-red selection:text-white">
      {/* --- HEADER --- */}
      <header className="relative z-50 w-full bg-white bg-wavy-pattern border-b border-slate-100 shadow-sm">
        <div className="container max-w-6xl mx-auto px-4 h-20 md:h-24 flex items-center justify-between">
          <div className="flex items-center">
            <Logo 
              logoUrl={eventSettings.logoImageUrl} 
              alt={eventSettings.eventName || "ACS Founders' Day Dinner"}
              priority
            />
          </div>
        </div>
      </header>

      <main className="flex-1 py-12 px-4">
        <div className="container max-w-6xl mx-auto">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8 space-y-4">
              <h1 className="text-3xl md:text-5xl font-bold text-primary">
                Event Sold Out
              </h1>
              <p className="text-slate-600 text-lg max-w-2xl mx-auto">
                Thank you for your interest in the ACS Founders&apos; Day Dinner
              </p>
            </div>
          
            <div className="rounded-[2rem] border border-slate-200 bg-white bg-wavy-pattern p-8 md:p-10 shadow-lg">
              
              {/* Sold Out Notice */}
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
          </div>
        </div>
      </main>

      <Footer eventName={eventSettings.eventName || "ACS Founders' Day Dinner"} footerLogoImageUrl={eventSettings.footerLogoImageUrl} />
    </div>
  )
}
