"use client"

import { useState } from "react"
import Link from "next/link"
import { sendBroadcast } from "@/app/actions/broadcast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import dynamic from "next/dynamic"

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
    <div className="min-h-screen bg-white">
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <h1 className="text-xl font-semibold text-slate-900">ACS FDD Admin</h1>
            <div className="flex items-center space-x-6">
              <Link href="/admin/dashboard" className="text-sm font-medium text-slate-700 hover:text-slate-900">
                Dashboard
              </Link>
              <Link href="/admin/setup" className="text-sm font-medium text-slate-700 hover:text-slate-900">
                Setup
              </Link>
              <Link href="/admin/tables" className="text-sm font-medium text-slate-700 hover:text-slate-900">
                Tables
              </Link>
              <Link href="/admin/inventory" className="text-sm font-medium text-slate-700 hover:text-slate-900">
                Inventory
              </Link>
              <Link href="/admin/broadcast" className="text-sm font-medium text-slate-700 hover:text-slate-900">
                Broadcast
              </Link>
              <Link href="/api/auth/signout" className="text-sm font-medium text-slate-700 hover:text-slate-900">
                Logout
              </Link>
            </div>
          </div>
        </div>
      </nav>

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
    </div>
  )
}

