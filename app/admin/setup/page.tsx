"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useRouter } from "next/navigation"
import { Logo } from "@/components/Logo"
import { Footer } from "@/components/Footer"

interface EventSettings {
  id: string
  eventName: string | null
  eventDate: string | null
  eventVenue: string | null
  logoImageUrl: string | null
  footerLogoImageUrl: string | null
  siteIconUrl: string | null
}

export default function SetupPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [resetConfirmName, setResetConfirmName] = useState("")
  const [settings, setSettings] = useState<EventSettings>({
    id: "event",
    eventName: null,
    eventDate: null,
    eventVenue: null,
    logoImageUrl: null,
    footerLogoImageUrl: null,
    siteIconUrl: null,
  })
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingFooterLogo, setUploadingFooterLogo] = useState(false)
  const [uploadingIcon, setUploadingIcon] = useState(false)

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

  const handleExport = async () => {
    setExporting(true)
    try {
      const response = await fetch("/api/admin/export")
      if (!response.ok) {
        throw new Error("Failed to export data")
      }
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `event_export_${new Date().toISOString().split("T")[0]}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "Success",
        description: "Data exported successfully",
      })
    } catch {
      toast({
        title: "Error",
        description: "Failed to export data",
        variant: "destructive",
      })
    } finally {
      setExporting(false)
    }
  }

  const handleImageUpload = async (file: File, type: "logo" | "footerLogo" | "siteIcon") => {
    if (!file) return

    // Validate file type
    const validImageTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]
    if (!validImageTypes.includes(file.type)) {
      toast({
        title: "Error",
        description: "Invalid file type. Only images are allowed.",
        variant: "destructive",
      })
      return
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      toast({
        title: "Error",
        description: "File size exceeds 5MB limit",
        variant: "destructive",
      })
      return
    }

    if (type === "logo") {
      setUploadingLogo(true)
    } else if (type === "footerLogo") {
      setUploadingFooterLogo(true)
    } else {
      setUploadingIcon(true)
    }

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("type", type)

      const res = await fetch("/api/admin/upload-image", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to upload image")
      }

      const data = await res.json()
      
      // Update settings with new URL
      setSettings(prev => ({
        ...prev,
        ...(type === "logo" 
          ? { logoImageUrl: data.url } 
          : type === "footerLogo"
          ? { footerLogoImageUrl: data.url }
          : { siteIconUrl: data.url }
        ),
      }))

      toast({
        title: "Success",
        description: `${type === "logo" ? "Logo" : type === "footerLogo" ? "Footer Logo" : "Icon"} uploaded successfully`,
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to upload image"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      if (type === "logo") {
        setUploadingLogo(false)
      } else if (type === "footerLogo") {
        setUploadingFooterLogo(false)
      } else {
        setUploadingIcon(false)
      }
    }
  }

  const handleReset = async () => {
    if (!settings.eventName) {
      toast({
        title: "Error",
        description: "No event configured to reset",
        variant: "destructive",
      })
      return
    }

    if (resetConfirmName.trim() !== settings.eventName.trim()) {
      toast({
        title: "Error",
        description: "Event name does not match",
        variant: "destructive",
      })
      return
    }

    setResetting(true)
    try {
      const response = await fetch("/api/admin/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventName: resetConfirmName }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to reset event")
      }

      toast({
        title: "Success",
        description: "Event reset successfully",
      })

      setShowResetDialog(false)
      setResetConfirmName("")
      
      // Refresh the page to show reset state
      router.refresh()
      fetchSettings()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to reset event"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setResetting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        {/* --- HEADER --- */}
        <header className="relative z-50 w-full bg-white bg-wavy-pattern border-b border-slate-100 shadow-sm">
          <div className="container max-w-6xl mx-auto px-4 h-32 md:h-40 flex items-center justify-between">
            <div className="flex items-center">
               {/* Event Logo */}
               <Logo 
                 logoUrl={settings.logoImageUrl} 
                 alt={settings.eventName || "Event Logo"}
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
          <p>Loading...</p>
        </div>
        </main>

        {/* --- FOOTER --- */}
        <footer className="bg-slate-900 border-t border-slate-700 py-12">
          <div className="container max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
             <div className="flex items-center gap-3">
                 <div className="relative h-10 w-10 opacity-90 hover:opacity-100 transition-opacity duration-500">
                    <Image 
                      src="/images/acs-logo.png" 
                      alt="ACS Logo" 
                      width={40}
                      height={40}
                      className="object-contain w-full h-full"
                    />
                 </div>
                 <span className="font-bold text-white tracking-tight">ACS OBA</span>
             </div>
             
             <div className="text-center text-white md:text-right">
                © 140th ACS OBA FOUNDERS DAY DINNER, 2026
                <p className="text-[0.5rem] text-slate-400 mt-2">This page is designed and built by ACSOBA Volunteers: <a href="https://nofa.io" className="hover:text-white transition-colors">Michael Lin</a> and <a href="https://github.com/kennethch22" className="hover:text-white transition-colors">Kenneth Hendra</a></p>
             </div>
          </div>
        </footer>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* --- HEADER --- */}
      <header className="relative z-50 w-full bg-white bg-wavy-pattern border-b border-slate-100 shadow-sm">
        <div className="container max-w-6xl mx-auto px-4 h-32 md:h-40 flex items-center justify-between">
          <div className="flex items-center">
             {/* Event Logo */}
             <Logo 
               logoUrl={settings.logoImageUrl} 
               alt={settings.eventName || "Event Logo"}
             />
          </div>
          
          <nav className="flex items-center gap-2 text-sm font-medium text-slate-600">
             <Link href="/admin/dashboard" className="px-3 py-2 rounded-lg hover:bg-primary/10 hover:text-primary transition-all duration-200">
               Dashboard
             </Link>
             <Link href="/admin/bookings" className="px-3 py-2 rounded-lg hover:bg-primary/10 hover:text-primary transition-all duration-200">
               Bookings
             </Link>
             <Link href="/admin/setup" className="px-3 py-2 rounded-lg bg-primary/10 text-primary transition-all duration-200">
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

        {/* Logo Upload */}
        <div className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">Logo Image</h3>
          <p className="text-sm text-slate-600 mb-4">
            Upload a logo image to be used in the header across all pages. Recommended size: 200x128px or similar aspect ratio.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {settings.logoImageUrl && (
              <div className="flex-shrink-0">
                <div className="relative h-24 md:h-32 w-auto border border-slate-200 rounded-lg p-2 bg-slate-50">
                  <Image 
                    src={settings.logoImageUrl} 
                    alt="Current Logo" 
                    width={200}
                    height={128}
                    className="object-contain w-full h-full"
                  />
                </div>
              </div>
            )}
            <div className="flex-1">
              <Label htmlFor="logoUpload">Upload Logo</Label>
              <Input
                id="logoUpload"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    handleImageUpload(file, "logo")
                  }
                }}
                disabled={uploadingLogo}
                className="mt-2"
              />
              {uploadingLogo && (
                <p className="text-sm text-slate-500 mt-2">Uploading...</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer Logo Upload */}
        <div className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">Footer Logo Image</h3>
          <p className="text-sm text-slate-600 mb-4">
            Upload a logo image to be used in the footer across all pages. Recommended size: 40x40px or similar square aspect ratio.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {settings.footerLogoImageUrl && (
              <div className="flex-shrink-0">
                <div className="relative h-16 w-16 border border-slate-200 rounded-lg p-2 bg-slate-50">
                  <Image 
                    src={settings.footerLogoImageUrl} 
                    alt="Current Footer Logo" 
                    width={40}
                    height={40}
                    className="object-contain w-full h-full"
                  />
                </div>
              </div>
            )}
            <div className="flex-1">
              <Label htmlFor="footerLogoUpload">Upload Footer Logo</Label>
              <Input
                id="footerLogoUpload"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    handleImageUpload(file, "footerLogo")
                  }
                }}
                disabled={uploadingFooterLogo}
                className="mt-2"
              />
              {uploadingFooterLogo && (
                <p className="text-sm text-slate-500 mt-2">Uploading...</p>
              )}
            </div>
          </div>
        </div>

        {/* Site Icon Upload */}
        <div className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">Site Icon (Favicon)</h3>
          <p className="text-sm text-slate-600 mb-4">
            Upload a site icon (favicon) to be used in browser tabs and bookmarks. Recommended size: 32x32px or 64x64px, square aspect ratio.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {settings.siteIconUrl && (
              <div className="flex-shrink-0">
                <div className="relative h-16 w-16 border border-slate-200 rounded-lg p-2 bg-slate-50">
                  <Image 
                    src={settings.siteIconUrl} 
                    alt="Current Icon" 
                    width={64}
                    height={64}
                    className="object-contain w-full h-full"
                  />
                </div>
              </div>
            )}
            <div className="flex-1">
              <Label htmlFor="iconUpload">Upload Site Icon</Label>
              <Input
                id="iconUpload"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    handleImageUpload(file, "siteIcon")
                  }
                }}
                disabled={uploadingIcon}
                className="mt-2"
              />
              {uploadingIcon && (
                <p className="text-sm text-slate-500 mt-2">Uploading...</p>
              )}
            </div>
          </div>
        </div>

        {/* Export and Reset Section */}
        <div className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">Event Management</h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={handleExport} 
              disabled={exporting || !isComplete}
              variant="outline"
              className="flex-1"
            >
              {exporting ? "Exporting..." : "Extract All Data to Excel"}
            </Button>
            <Button 
              onClick={() => setShowResetDialog(true)}
              disabled={!isComplete || resetting}
              variant="outline"
              className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              Reset Event
            </Button>
          </div>
          <p className="text-sm text-slate-500 mt-4">
            <strong>Export:</strong> Downloads an Excel file with event settings, all orders/income data, cuisine breakdown by guest count, and batch grouping information.
            <br />
            <strong>Reset:</strong> This will permanently delete all event data, bookings, tables, guests, and vouchers. This action cannot be undone.
          </p>
        </div>

        <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm text-slate-600">
            <strong>Note:</strong> These settings will be used across all pages, including the home page and confirmation emails.
            Additional settings may be added to this page in the future.
          </p>
        </div>

        {/* Reset Confirmation Dialog */}
        <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reset Event - Confirmation Required</DialogTitle>
              <DialogDescription>
                This action will permanently delete ALL event data including:
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                  <li>All bookings and orders</li>
                  <li>All tables and guest assignments</li>
                  <li>All guest information</li>
                  <li>All vouchers</li>
                  <li>Event settings</li>
                  <li>Inventory settings (will be reset to defaults)</li>
                </ul>
                <p className="mt-4 font-semibold text-red-600">
                  This action cannot be undone!
                </p>
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="resetConfirm">
                  To confirm, please type the event name: <strong>{settings.eventName}</strong>
                </Label>
                <Input
                  id="resetConfirm"
                  type="text"
                  value={resetConfirmName}
                  onChange={(e) => setResetConfirmName(e.target.value)}
                  placeholder="Enter event name to confirm"
                  className="mt-2"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowResetDialog(false)
                    setResetConfirmName("")
                  }}
                  disabled={resetting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleReset}
                  disabled={resetting || resetConfirmName.trim() !== settings.eventName?.trim()}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {resetting ? "Resetting..." : "Confirm Reset"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      </main>

      {/* --- FOOTER --- */}
      <Footer 
        eventName={settings.eventName || "140th ACS OBA FOUNDERS DAY DINNER"} 
        footerLogoImageUrl={settings.footerLogoImageUrl}
      />
    </div>
  )
}
