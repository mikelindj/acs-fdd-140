"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { sendBroadcast, getTableAssignmentPreview } from "@/app/actions/broadcast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Logo } from "@/components/Logo"
import { Footer } from "@/components/Footer"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

/** Convert plain text to HTML for broadcast email (escape + newlines to <br />). */
function textToHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/\n/g, "<br />")
}

type Order = {
  id: string
  type: string
  quantity: number
  buyerName: string
  buyerEmail: string | null
  assignedTableNumbers: string[]
}

export default function BroadcastPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [orders, setOrders] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [assignments, setAssignments] = useState<Record<string, string[]>>({})
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewHtml, setPreviewHtml] = useState<string | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop")
  const [savingId, setSavingId] = useState<string | null>(null)
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

  const fetchOrders = useCallback(async () => {
    setOrdersLoading(true)
    try {
      const res = await fetch("/api/admin/broadcast/orders")
      if (res.ok) {
        const data = await res.json()
        setOrders(data)
        setAssignments((prev) => {
          const next = { ...prev }
          data.forEach((o: Order) => {
            const saved = o.assignedTableNumbers ?? []
            next[o.id] = Array.from({ length: o.quantity }, (_, i) => saved[i] ?? "")
          })
          return next
        })
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
      toast({ title: "Error", description: "Failed to load orders", variant: "destructive" })
    } finally {
      setOrdersLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

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

  const setAssignment = (bookingId: string, index: number, value: string) => {
    setAssignments((prev) => {
      const arr = [...(prev[bookingId] ?? [])]
      arr[index] = value
      return { ...prev, [bookingId]: arr }
    })
  }

  const saveAssignments = async (bookingId: string) => {
    const arr = assignments[bookingId] ?? []
    setSavingId(bookingId)
    try {
      const res = await fetch("/api/admin/broadcast/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, assignedTableNumbers: arr }),
      })
      if (!res.ok) throw new Error("Failed to save")
    } catch {
      toast({ title: "Error", description: "Failed to save table assignments", variant: "destructive" })
    } finally {
      setSavingId(null)
    }
  }

  const handlePreview = async (order: Order) => {
    const tables = assignments[order.id] ?? Array.from({ length: order.quantity }, () => "")
    setPreviewLoading(true)
    setPreviewHtml(null)
    setPreviewOpen(true)
    try {
      const result = await getTableAssignmentPreview(order.buyerName, tables)
      if (result.error) {
        toast({ title: "Preview failed", description: result.error, variant: "destructive" })
        setPreviewOpen(false)
      } else if (result.html) {
        setPreviewHtml(result.html)
      }
    } catch {
      toast({ title: "Preview failed", description: "Could not generate preview", variant: "destructive" })
      setPreviewOpen(false)
    } finally {
      setPreviewLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await sendBroadcast({
        ...formData,
        content: textToHtml(formData.content),
      })
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
             <Link href="/admin/bookings" className="px-3 py-2 rounded-lg hover:bg-primary/10 hover:text-primary transition-all duration-200">
               Bookings
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
             <Link href="/admin/broadcast" className="px-3 py-2 rounded-lg bg-primary/10 text-primary transition-all duration-200">
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
        {/* Table assignment emails */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900 mb-4">Table Assignment Emails</h2>
          <p className="text-slate-600 mb-6">Enter assigned table numbers for each order, then preview the email before sending.</p>
          {ordersLoading ? (
            <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm text-slate-500">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm text-slate-500">No paid orders yet.</div>
          ) : (
            <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="text-left py-3 px-4 font-semibold text-slate-900">Order ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900">Buyer</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900">Email</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900">Type</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900">Qty</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900">Assigned tables</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900 w-24">Preview</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                        <td className="py-3 px-4 text-slate-900">{order.id.slice(-8)}</td>
                        <td className="py-3 px-4 text-slate-900">{order.buyerName}</td>
                        <td className="py-3 px-4 text-slate-600">{order.buyerEmail ?? "—"}</td>
                        <td className="py-3 px-4 text-slate-600">{order.type}</td>
                        <td className="py-3 px-4 text-slate-600">{order.quantity}</td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-2 items-center">
                            {Array.from({ length: order.quantity }, (_, i) => (
                              <span key={i} className="flex items-center gap-1">
                                <span className="text-xs text-slate-500 whitespace-nowrap">T{i + 1}:</span>
                                <Input
                                  type="text"
                                  placeholder="#"
                                  className="w-14 h-8 text-center"
                                  value={(assignments[order.id] ?? [])[i] ?? ""}
                                  onChange={(e) => setAssignment(order.id, i, e.target.value)}
                                  onBlur={() => saveAssignments(order.id)}
                                />
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              className="h-8 px-3 text-xs"
                              onClick={() => handlePreview(order)}
                            >
                              Preview
                            </Button>
                            {savingId === order.id && (
                              <span className="text-xs text-slate-500">Saving...</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

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
              <textarea
                id="content"
                required
                rows={12}
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                className="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[200px]"
                placeholder="Enter your message. Line breaks will be preserved in the email."
              />
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

      {/* Preview dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>Table assignment email preview</DialogTitle>
            {!previewLoading && previewHtml && (
              <div className="flex gap-2 mt-3">
                <Button
                  type="button"
                  variant={previewMode === "desktop" ? "default" : "outline"}
                  className="h-8 px-3 text-xs"
                  onClick={() => setPreviewMode("desktop")}
                >
                  Desktop
                </Button>
                <Button
                  type="button"
                  variant={previewMode === "mobile" ? "default" : "outline"}
                  className="h-8 px-3 text-xs"
                  onClick={() => setPreviewMode("mobile")}
                >
                  Mobile
                </Button>
              </div>
            )}
          </DialogHeader>
          <div className="flex-1 min-h-0 p-6 pt-4 flex justify-center">
            {previewLoading && (
              <div className="flex items-center justify-center py-12 text-slate-500">Generating preview...</div>
            )}
            {!previewLoading && previewHtml && (
              <div
                className={
                  previewMode === "mobile"
                    ? "w-[375px] max-w-full border-2 border-slate-300 rounded-xl overflow-hidden shadow-xl bg-slate-200"
                    : "w-full max-w-[600px]"
                }
              >
                <iframe
                  title="Email preview"
                  srcDoc={previewHtml}
                  className={
                    previewMode === "mobile"
                      ? "w-[375px] h-[70vh] border-0 bg-white block"
                      : "w-full h-[70vh] border border-slate-200 rounded-lg bg-white"
                  }
                  sandbox="allow-same-origin"
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* --- FOOTER --- */}
      <Footer 
        eventName={eventSettings.eventName || "140th ACS OBA FOUNDERS DAY DINNER"} 
        footerLogoImageUrl={eventSettings.footerLogoImageUrl}
      />
    </div>
  )
}

