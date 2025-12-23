"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

interface EventSettings {
  id: string
  eventName: string | null
  eventDate: string | null
  eventVenue: string | null
}

export default function SetupPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<EventSettings>({
    id: "event",
    eventName: null,
    eventDate: null,
    eventVenue: null,
  })

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/setup")
      if (res.ok) {
        const data = await res.json()
        setSettings({
          ...data,
          eventDate: data.eventDate ? new Date(data.eventDate).toISOString().split("T")[0] : null,
        })
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const saveSettings = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/admin/setup", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })

      if (!res.ok) {
        throw new Error("Failed to save settings")
      }

      toast({
        title: "Success",
        description: "Event settings saved successfully",
      })
    } catch {
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const isComplete = settings.eventName && settings.eventDate && settings.eventVenue

  if (loading) {
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
          <p>Loading...</p>
        </div>
      </div>
    )
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
        <h2 className="text-3xl font-semibold tracking-tight text-slate-900 mb-8">Event Setup</h2>

        {isComplete && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-green-900">Setup Complete!</h3>
                <p className="text-sm text-green-700 mt-1">
                  All event settings have been configured. You can now proceed to set up booking parameters.
                </p>
              </div>
              <Link href="/admin/inventory">
                <Button className="bg-green-600 hover:bg-green-700">
                  Go to Inventory
                </Button>
              </Link>
            </div>
          </div>
        )}

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-slate-900 mb-6">Event Information</h3>
          <div className="space-y-6">
            <div>
              <Label htmlFor="eventName">Event Name *</Label>
              <Input
                id="eventName"
                type="text"
                value={settings.eventName || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    eventName: e.target.value || null,
                  })
                }
                className="mt-2"
                placeholder="e.g., ACS Founders' Day Dinner"
              />
            </div>
            <div>
              <Label htmlFor="eventDate">Event Date *</Label>
              <Input
                id="eventDate"
                type="date"
                value={settings.eventDate || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    eventDate: e.target.value || null,
                  })
                }
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="eventVenue">Event Venue *</Label>
              <Input
                id="eventVenue"
                type="text"
                value={settings.eventVenue || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    eventVenue: e.target.value || null,
                  })
                }
                className="mt-2"
                placeholder="e.g., Grand Ballroom, Marina Bay Sands"
              />
            </div>
          </div>
          <Button onClick={saveSettings} disabled={saving} className="mt-6">
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </div>

        <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm text-slate-600">
            <strong>Note:</strong> These settings will be used across all pages, including the home page and confirmation emails.
            Additional settings may be added to this page in the future.
          </p>
        </div>
      </div>
    </div>
  )
}
