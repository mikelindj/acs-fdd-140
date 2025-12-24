"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { sendBroadcast } from "@/app/actions/broadcast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import dynamic from "next/dynamic"
import { Logo } from "@/components/Logo"
import { Footer } from "@/components/Footer"

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false })
import "react-quill/dist/quill.snow.css"

export default function BroadcastPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    subject: "",
    content: "",
    recipients: "all" as "all" | "buyers" | "guests" | "unseated",
  })
  const [eventSettings, setEventSettings] = useState<{
    eventName: string | null
    logoImageUrl: string | null
    footerLogoImageUrl: string | null
  }>({
    eventName: null,
    logoImageUrl: null,
    footerLogoImageUrl: null,
  })

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await sendBroadcast(formData)
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: `Sent to ${result.sent} recipients. ${result.failed} failed.`,
        })
        setFormData({ subject: "", content: "", recipients: "all" })
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to send broadcast",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
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
             />
          </div>
          
          <nav className="flex items-center gap-2 text-sm font-medium text-slate-600">
             <Link href="/admin/dashboard" className="px-3 py-2 rounded-lg hover:bg-primary/10 hover:text-primary transition-all duration-200">
               Dashboard
             </Link>
             <Link href="/admin/setup" className="px-3 py-2 rounded-lg hover:bg-primary/10 hover:text-primary transition-all duration-200">
               Setup
             </Link>
             <Link href="/admin/tables" className="px-3 py-2 rounded-lg hover:bg-primary/10 hover:text-primary transition-all duration-200">
               Tables
             </Link>
             <Link href="/admin/inventory" className="px-3 py-2 rounded-lg hover:bg-primary/10 hover:text-primary transition-all duration-200">
               Inventory
             </Link>
             <Link href="/admin/broadcast" className="px-3 py-2 rounded-lg hover:bg-primary/10 hover:text-primary transition-all duration-200">
               Broadcast
             </Link>
             <Link href="/api/auth/signout" className="px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-all duration-200">
               Logout
             </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-semibold tracking-tight text-slate-900 mb-8">Send Broadcast</h2>

        <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="recipients">Recipients</Label>
              <select
                id="recipients"
                value={formData.recipients}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    recipients: e.target.value as "all" | "buyers" | "guests" | "unseated",
                  })
                }
                className="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">All Guests</option>
                <option value="buyers">Buyers Only</option>
                <option value="guests">Guests Only (Non-Buyers)</option>
                <option value="unseated">Unseated Guests</option>
              </select>
            </div>

            <div>
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
                required
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="content">Content *</Label>
              <div className="mt-2">
                <ReactQuill
                  value={formData.content}
                  onChange={(value) =>
                    setFormData({ ...formData, content: value })
                  }
                  theme="snow"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Broadcast"}
            </Button>
          </form>
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

