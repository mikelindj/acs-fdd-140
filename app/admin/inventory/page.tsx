"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { Logo } from "@/components/Logo"
import { Footer } from "@/components/Footer"

interface InventorySettings {
  id: string
  totalTables: number
  maxElevenSeaterTables: number
  tablePrice: number
  seatPrice: number
  tablePromoPrice: number | null
  seatPromoPrice: number | null
  tableMembersPrice: number | null
  seatMembersPrice: number | null
}

interface Voucher {
  id: string
  code: string
  name: string | null
  notes: string | null
  type: "PERCENTAGE" | "FIXED_AMOUNT" | "FIXED_PRICE"
  discountPercent: number | null
  discountAmount: number | null
  fixedPrice: number | null
  maxRedemptions: number
  currentRedemptions: number
  isActive: boolean
  expiresAt: string | null
  createdAt: string
}

export default function InventoryPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [inventory, setInventory] = useState<InventorySettings | null>(null)
  const [vouchers, setVouchers] = useState<Voucher[]>([])
  const [showVoucherForm, setShowVoucherForm] = useState(false)
  const [eventSettings, setEventSettings] = useState<{
    eventName: string | null
    logoImageUrl: string | null
    footerLogoImageUrl: string | null
  }>({
    eventName: null,
    logoImageUrl: null,
    footerLogoImageUrl: null,
  })
  const [voucherForm, setVoucherForm] = useState({
    name: "",
    notes: "",
    type: "PERCENTAGE" as "PERCENTAGE" | "FIXED_AMOUNT" | "FIXED_PRICE",
    discountPercent: "",
    discountAmount: "",
    fixedPrice: "",
    maxRedemptions: "1",
    expiresAt: "",
  })

  useEffect(() => {
    fetchInventory()
    fetchVouchers()
    fetchEventSettings()
  }, [])

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

  const fetchInventory = async () => {
    try {
      const res = await fetch("/api/admin/inventory")
      if (res.ok) {
        const data = await res.json()
        setInventory(data)
      }
    } catch (error) {
      console.error("Error fetching inventory:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchVouchers = async () => {
    try {
      const res = await fetch("/api/admin/vouchers")
      if (res.ok) {
        const data = await res.json()
        setVouchers(data)
      }
    } catch (error) {
      console.error("Error fetching vouchers:", error)
    }
  }

  const saveInventory = async () => {
    if (!inventory) return
    setSaving(true)
    try {
      const res = await fetch("/api/admin/inventory", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inventory),
      })
      if (res.ok) {
        toast({
          title: "Success",
          description: "Inventory settings saved",
        })
      } else {
        throw new Error("Failed to save")
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to save inventory settings",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const createVoucher = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/admin/vouchers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(voucherForm),
      })
      if (res.ok) {
        toast({
          title: "Success",
          description: "Voucher created",
        })
        setShowVoucherForm(false)
        setVoucherForm({
          name: "",
          notes: "",
          type: "PERCENTAGE",
          discountPercent: "",
          discountAmount: "",
          fixedPrice: "",
          maxRedemptions: "1",
          expiresAt: "",
        })
        fetchVouchers()
      } else {
        throw new Error("Failed to create")
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to create voucher",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const toggleVoucher = async (id: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/admin/vouchers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      })
      if (res.ok) {
        fetchVouchers()
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to update voucher",
        variant: "destructive",
      })
    }
  }

  const deleteVoucher = async (id: string) => {
    if (!confirm("Are you sure you want to delete this voucher?")) return
    try {
      const res = await fetch(`/api/admin/vouchers/${id}`, {
        method: "DELETE",
      })
      if (res.ok) {
        fetchVouchers()
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete voucher",
        variant: "destructive",
      })
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
                 logoUrl={eventSettings.logoImageUrl} 
                 alt={eventSettings.eventName || "Event Logo"}
               />
            </div>
            
            <nav className="flex items-center gap-6 text-sm font-medium text-slate-600">
               <Link href="/admin/dashboard" className="hover:text-primary transition-colors">
                 Dashboard
               </Link>
               <Link href="/admin/setup" className="hover:text-primary transition-colors">
                 Setup
               </Link>
               <Link href="/admin/tables" className="hover:text-primary transition-colors">
                 Tables
               </Link>
               <Link href="/admin/inventory" className="hover:text-primary transition-colors">
                 Inventory
               </Link>
               <Link href="/admin/broadcast" className="hover:text-primary transition-colors">
                 Broadcast
               </Link>
               <Link href="/api/auth/signout" className="hover:text-primary transition-colors">
                 Logout
               </Link>
            </nav>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center">
          <div className="text-slate-600">Loading...</div>
        </main>

        {/* --- FOOTER --- */}
        <Footer 
          eventName={eventSettings.eventName || "140th ACS OBA FOUNDERS DAY DINNER"} 
          footerLogoImageUrl={eventSettings.footerLogoImageUrl}
        />
      </div>
    )
  }

  if (!inventory) {
    return <div>Error loading inventory</div>
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
        <h2 className="text-3xl font-semibold tracking-tight text-slate-900 mb-8">Inventory Management</h2>

        <div className="space-y-8">
          {/* Inventory Settings */}
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-slate-900 mb-6">Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="totalTables">Total Number of Tables</Label>
                <Input
                  id="totalTables"
                  type="number"
                  min="0"
                  value={inventory.totalTables}
                  onChange={(e) =>
                    setInventory({
                      ...inventory,
                      totalTables: parseInt(e.target.value) || 0,
                    })
                  }
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="maxElevenSeater">Max 11-Seater Tables</Label>
                <Input
                  id="maxElevenSeater"
                  type="number"
                  min="0"
                  value={inventory.maxElevenSeaterTables}
                  onChange={(e) =>
                    setInventory({
                      ...inventory,
                      maxElevenSeaterTables: parseInt(e.target.value) || 0,
                    })
                  }
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="tablePrice">Table Price (10 seats)</Label>
                <Input
                  id="tablePrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={inventory.tablePrice}
                  onChange={(e) =>
                    setInventory({
                      ...inventory,
                      tablePrice: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="seatPrice">Individual Seat / 11th Seat Price</Label>
                <Input
                  id="seatPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={inventory.seatPrice}
                  onChange={(e) =>
                    setInventory({
                      ...inventory,
                      seatPrice: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="tablePromoPrice">Table Promo Price (Optional)</Label>
                <Input
                  id="tablePromoPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={inventory.tablePromoPrice || ""}
                  onChange={(e) =>
                    setInventory({
                      ...inventory,
                      tablePromoPrice: e.target.value ? parseFloat(e.target.value) : null,
                    })
                  }
                  className="mt-2"
                  placeholder="Leave empty for no promo"
                />
              </div>
              <div>
                <Label htmlFor="seatPromoPrice">Seat Promo Price (Optional)</Label>
                <Input
                  id="seatPromoPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={inventory.seatPromoPrice || ""}
                  onChange={(e) =>
                    setInventory({
                      ...inventory,
                      seatPromoPrice: e.target.value ? parseFloat(e.target.value) : null,
                    })
                  }
                  className="mt-2"
                  placeholder="Leave empty for no promo"
                />
              </div>
              <div>
                <Label htmlFor="tableMembersPrice">Table Members Price (Optional)</Label>
                <Input
                  id="tableMembersPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={inventory.tableMembersPrice || ""}
                  onChange={(e) =>
                    setInventory({
                      ...inventory,
                      tableMembersPrice: e.target.value ? parseFloat(e.target.value) : null,
                    })
                  }
                  className="mt-2"
                  placeholder="Leave empty for no members price"
                />
              </div>
              <div>
                <Label htmlFor="seatMembersPrice">Seat Members Price (Optional)</Label>
                <Input
                  id="seatMembersPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={inventory.seatMembersPrice || ""}
                  onChange={(e) =>
                    setInventory({
                      ...inventory,
                      seatMembersPrice: e.target.value ? parseFloat(e.target.value) : null,
                    })
                  }
                  className="mt-2"
                  placeholder="Leave empty for no members price"
                />
              </div>
            </div>
            <Button onClick={saveInventory} disabled={saving} className="mt-6">
              {saving ? "Saving..." : "Save Settings"}
            </Button>
          </div>

          {/* Vouchers */}
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-slate-900">Vouchers</h3>
              <Button onClick={() => setShowVoucherForm(!showVoucherForm)}>
                {showVoucherForm ? "Cancel" : "Create Voucher"}
              </Button>
            </div>

            {showVoucherForm && (
              <div className="mb-6 p-4 border border-slate-200 rounded-lg bg-slate-50">
                <h4 className="font-semibold text-slate-900 mb-4">New Voucher</h4>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="voucherName">Name (Optional)</Label>
                    <Input
                      id="voucherName"
                      type="text"
                      value={voucherForm.name}
                      onChange={(e) =>
                        setVoucherForm({ ...voucherForm, name: e.target.value })
                      }
                      className="mt-2"
                      placeholder="e.g., Early Bird Discount"
                    />
                  </div>
                  <div>
                    <Label htmlFor="voucherNotes">Notes (Optional)</Label>
                    <textarea
                      id="voucherNotes"
                      value={voucherForm.notes}
                      onChange={(e) =>
                        setVoucherForm({ ...voucherForm, notes: e.target.value })
                      }
                      className="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      rows={3}
                      placeholder="Internal notes about this voucher"
                    />
                  </div>
                  <div>
                    <Label htmlFor="voucherType">Type</Label>
                    <select
                      id="voucherType"
                      value={voucherForm.type}
                      onChange={(e) =>
                        setVoucherForm({
                          ...voucherForm,
                          type: e.target.value as "PERCENTAGE" | "FIXED_AMOUNT" | "FIXED_PRICE",
                        })
                      }
                      className="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="PERCENTAGE">Percentage Discount</option>
                      <option value="FIXED_AMOUNT">Fixed Amount Discount</option>
                      <option value="FIXED_PRICE">Fixed Price</option>
                    </select>
                  </div>
                  {voucherForm.type === "PERCENTAGE" && (
                    <div>
                      <Label htmlFor="discountPercent">Discount Percentage</Label>
                      <Input
                        id="discountPercent"
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={voucherForm.discountPercent}
                        onChange={(e) =>
                          setVoucherForm({ ...voucherForm, discountPercent: e.target.value })
                        }
                        className="mt-2"
                        placeholder="e.g., 10 for 10%"
                      />
                    </div>
                  )}
                  {voucherForm.type === "FIXED_AMOUNT" && (
                    <div>
                      <Label htmlFor="discountAmount">Discount Amount (S$)</Label>
                      <Input
                        id="discountAmount"
                        type="number"
                        min="0"
                        step="0.01"
                        value={voucherForm.discountAmount}
                        onChange={(e) =>
                          setVoucherForm({ ...voucherForm, discountAmount: e.target.value })
                        }
                        className="mt-2"
                        placeholder="e.g., 50"
                      />
                    </div>
                  )}
                  {voucherForm.type === "FIXED_PRICE" && (
                    <div>
                      <Label htmlFor="fixedPrice">Fixed Price (S$)</Label>
                      <Input
                        id="fixedPrice"
                        type="number"
                        min="0"
                        step="0.01"
                        value={voucherForm.fixedPrice}
                        onChange={(e) =>
                          setVoucherForm({ ...voucherForm, fixedPrice: e.target.value })
                        }
                        className="mt-2"
                        placeholder="e.g., 500"
                      />
                    </div>
                  )}
                  <div>
                    <Label htmlFor="maxRedemptions">Max Redemptions</Label>
                    <Input
                      id="maxRedemptions"
                      type="number"
                      min="1"
                      value={voucherForm.maxRedemptions}
                      onChange={(e) =>
                        setVoucherForm({ ...voucherForm, maxRedemptions: e.target.value })
                      }
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="expiresAt">Expires At (Optional)</Label>
                    <Input
                      id="expiresAt"
                      type="datetime-local"
                      value={voucherForm.expiresAt}
                      onChange={(e) =>
                        setVoucherForm({ ...voucherForm, expiresAt: e.target.value })
                      }
                      className="mt-2"
                    />
                  </div>
                  <Button onClick={createVoucher} disabled={saving}>
                    {saving ? "Creating..." : "Create Voucher"}
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {vouchers.length === 0 ? (
                <p className="text-slate-600">No vouchers created yet</p>
              ) : (
                vouchers.map((voucher) => (
                  <div
                    key={voucher.id}
                    className="flex items-center justify-between p-4 border border-slate-200 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        {voucher.name && (
                          <span className="font-semibold text-slate-900">{voucher.name}</span>
                        )}
                        <span className="font-mono font-semibold text-lg text-slate-900">
                          {voucher.code}
                        </span>
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            voucher.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {voucher.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      {voucher.notes && (
                        <div className="mt-1 text-xs text-slate-500 italic">{voucher.notes}</div>
                      )}
                      <div className="mt-2 text-sm text-slate-600">
                        {voucher.type === "PERCENTAGE" && (
                          <span>{voucher.discountPercent}% off</span>
                        )}
                        {voucher.type === "FIXED_AMOUNT" && (
                          <span>S${voucher.discountAmount} off</span>
                        )}
                        {voucher.type === "FIXED_PRICE" && (
                          <span>Fixed price: S${voucher.fixedPrice}</span>
                        )}
                        {" • "}
                        <span>
                          {voucher.currentRedemptions}/{voucher.maxRedemptions} redemptions
                        </span>
                        {voucher.expiresAt && (
                          <>
                            {" • "}
                            <span>
                              Expires: {new Date(voucher.expiresAt).toLocaleDateString()}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="text-sm px-3 py-1.5"
                        onClick={() => toggleVoucher(voucher.id, voucher.isActive)}
                      >
                        {voucher.isActive ? "Deactivate" : "Activate"}
                      </Button>
                      <Button
                        variant="outline"
                        className="text-sm px-3 py-1.5"
                        onClick={() => deleteVoucher(voucher.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
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
