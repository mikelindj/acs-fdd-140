"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import Link from "next/link"
import { assignTableToGuests } from "@/app/actions/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Logo } from "@/components/Logo"
import { Footer } from "@/components/Footer"

interface Table {
  id: string
  tableNumber: string
  capacity: number
  status: string
  x: number | null
  y: number | null
  guests: Array<{ id: string; name: string }>
}

interface Guest {
  id: string
  name: string
  email: string | null
  tableId: string | null
  school?: string | null
  gradYear?: number | null
  membershipNo?: string | null
}

interface GuestGroup {
  id: string
  name: string
  guests: Guest[]
  school?: string
  gradYear?: number
  membershipNo?: string
  guestCount: number
}

export default function TablesPage() {
  const { toast } = useToast()
  const [tables, setTables] = useState<Table[]>([])
  const [unseatedGuests, setUnseatedGuests] = useState<Guest[]>([])
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [selectedGuests, setSelectedGuests] = useState<string[]>([])
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterBy, setFilterBy] = useState<"all" | "school" | "year" | "membership">("all")
  const [eventSettings, setEventSettings] = useState<{
    eventName: string | null
    logoImageUrl: string | null
    footerLogoImageUrl: string | null
  }>({
    eventName: null,
    logoImageUrl: null,
    footerLogoImageUrl: null,
  })

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/tables")
      const data = await res.json()
      setTables(data.tables || [])
      setUnseatedGuests(data.unseatedGuests || [])
    } catch {
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  // Group guests by their batch/school information
  const guestGroups = useMemo(() => {
    const groups: GuestGroup[] = []

    // Create groups based on school + gradYear combinations
    unseatedGuests.forEach(guest => {
      const school = guest.school || "No School Specified"
      const year = guest.gradYear ? ` (${guest.gradYear})` : ""
      const groupKey = `${school}${year}`

      let group = groups.find(g => g.id === groupKey)
      if (!group) {
        group = {
          id: groupKey,
          name: `${school}${year}`,
          guests: [],
          school: guest.school || undefined,
          gradYear: guest.gradYear || undefined,
          guestCount: 0,
        }
        groups.push(group)
      }
      group.guests.push(guest)
      group.guestCount++
    })

    // Sort groups by size (largest first) and alphabetically
    return groups.sort((a, b) => {
      if (a.guestCount !== b.guestCount) {
        return b.guestCount - a.guestCount
      }
      return a.name.localeCompare(b.name)
    })
  }, [unseatedGuests])

  // Filter guests/groups based on search and filter criteria
  const filteredGroups = useMemo(() => {
    return guestGroups.filter(group => {
      const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           group.guests.some(guest =>
                             guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             (guest.email && guest.email.toLowerCase().includes(searchTerm.toLowerCase()))
                           )

      const matchesFilter = filterBy === "all" ||
                           (filterBy === "school" && group.school) ||
                           (filterBy === "year" && group.gradYear) ||
                           (filterBy === "membership" && group.guests.some(g => g.membershipNo))

      return matchesSearch && matchesFilter
    })
  }, [guestGroups, searchTerm, filterBy])

  useEffect(() => {
    fetchData()
    fetchEventSettings()
  }, [fetchData])

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

  async function handleAssign() {
    if (!selectedTable || selectedGuests.length === 0) {
      toast({
        title: "Error",
        description: "Please select a table and guests",
        variant: "destructive",
      })
      return
    }

    try {
      const result = await assignTableToGuests({
        tableId: selectedTable,
        guestIds: selectedGuests,
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
          description: `${selectedGuests.length} guest(s) assigned successfully`,
        })
        setSelectedTable(null)
        setSelectedGuests([])
        setSelectedGroup(null)
        fetchData()
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to assign guests",
        variant: "destructive",
      })
    }
  }

  function handleGroupSelect(groupId: string) {
    const group = guestGroups.find(g => g.id === groupId)
    if (!group) return

    const guestIds = group.guests.map(g => g.id)
    setSelectedGuests(guestIds)
    setSelectedGroup(groupId)
  }

  function handleTableSelect(tableId: string) {
    setSelectedTable(selectedTable === tableId ? null : tableId)
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
        <div className="mb-8">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900 mb-2">Table Management</h2>
          <p className="text-slate-600">Assign guests to tables 1-92 based on their batch, school, and group preferences.</p>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="text-2xl font-bold text-slate-900">{tables.filter(t => t.status === "FULL").length}</div>
            <div className="text-sm text-slate-600">Tables Full</div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="text-2xl font-bold text-slate-900">{tables.filter(t => t.status === "RESERVED").length}</div>
            <div className="text-sm text-slate-600">Tables Reserved</div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="text-2xl font-bold text-slate-900">{tables.filter(t => t.status === "AVAILABLE").length}</div>
            <div className="text-sm text-slate-600">Tables Available</div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="text-2xl font-bold text-slate-900">{unseatedGuests.length}</div>
            <div className="text-sm text-slate-600">Unseated Guests</div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Tables Grid - Left Side */}
          <div className="xl:col-span-2">
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
              <div className="p-6 border-b border-slate-200">
                <h3 className="text-xl font-semibold text-slate-900">Tables (1-92)</h3>
                <p className="text-sm text-slate-600 mt-1">Click a table to select it for guest assignment</p>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-3">
                  {tables.map((table) => {
                    const _tableNumber = parseInt(table.tableNumber)
                    const isSelected = selectedTable === table.id
                    const occupancyRate = table.capacity > 0 ? (table.guests.length / table.capacity) * 100 : 0

                    return (
                  <div
                    key={table.id}
                        onClick={() => handleTableSelect(table.id)}
                        className={`relative rounded-lg border-2 p-3 cursor-pointer transition-all duration-200 ${
                          isSelected
                            ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                            : table.status === "FULL"
                            ? "border-green-400 bg-green-50 hover:border-green-500"
                            : table.status === "RESERVED"
                            ? "border-yellow-400 bg-yellow-50 hover:border-yellow-500"
                            : "border-slate-300 bg-white hover:border-slate-400 hover:shadow-md"
                        }`}
                      >
                        <div className="text-center">
                          <div className={`text-lg font-bold ${
                            isSelected ? "text-blue-700" :
                            table.status === "FULL" ? "text-green-700" :
                            table.status === "RESERVED" ? "text-yellow-700" :
                            "text-slate-700"
                          }`}>
                            {table.tableNumber}
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            {table.guests.length}/{table.capacity}
                          </div>

                          {/* Occupancy indicator */}
                          <div className="mt-2 bg-slate-200 rounded-full h-1">
                            <div
                              className={`h-1 rounded-full transition-all duration-300 ${
                                occupancyRate === 100 ? "bg-green-500" :
                                occupancyRate >= 50 ? "bg-yellow-500" : "bg-blue-500"
                              }`}
                              style={{ width: `${occupancyRate}%` }}
                            />
                          </div>
                    </div>

                        {/* Status badge */}
                        <div className="absolute -top-1 -right-1">
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                          table.status === "FULL"
                            ? "bg-green-100 text-green-800"
                            : table.status === "RESERVED"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-slate-100 text-slate-800"
                          }`}>
                            {table.status === "FULL" ? "✓" :
                             table.status === "RESERVED" ? "○" : "□"}
                      </span>
                    </div>
                  </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Guest Groups Panel - Right Side */}
          <div className="space-y-6">
            {/* Search and Filter Controls */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Guest Groups</h3>

              {/* Search */}
              <div className="mb-4">
                <Input
                  type="text"
                  placeholder="Search groups or guests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Filter Tabs */}
              <div className="flex space-x-1 mb-4">
                {[
                  { key: "all", label: "All" },
                  { key: "school", label: "With School" },
                  { key: "year", label: "With Year" },
                  { key: "membership", label: "Members" },
                ].map((filter) => (
                  <button
                    key={filter.key}
                    onClick={() => setFilterBy(filter.key as "all" | "school" | "year" | "membership")}
                    className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                      filterBy === filter.key
                        ? "bg-blue-100 text-blue-700 font-medium"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>

              {/* Guest Groups List */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredGroups.map((group) => {
                  const isSelected = selectedGroup === group.id
                  const canFitAtTable = selectedTable ?
                    group.guestCount <= (tables.find(t => t.id === selectedTable)?.capacity || 0) : false

                  return (
                    <div
                      key={group.id}
                      onClick={() => handleGroupSelect(group.id)}
                      className={`rounded-lg border p-3 cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-slate-900 text-sm">{group.name}</div>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            group.guestCount <= 10 ? "bg-green-100 text-green-800" :
                            group.guestCount <= 15 ? "bg-yellow-100 text-yellow-800" :
                            "bg-red-100 text-red-800"
                          }`}>
                            {group.guestCount} guests
                          </span>
                          {selectedTable && (
                            <span className={`text-xs ${canFitAtTable ? "text-green-600" : "text-red-600"}`}>
                              {canFitAtTable ? "✓ Fits" : "⚠ Too big"}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Show first few guest names */}
                      <div className="text-xs text-slate-600 space-y-1">
                        {group.guests.slice(0, 3).map((guest) => (
                          <div key={guest.id} className="truncate">
                            • {guest.name}
                          </div>
                        ))}
                        {group.guests.length > 3 && (
                          <div className="text-slate-500">
                            +{group.guests.length - 3} more...
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Assignment Panel */}
            {(selectedTable || selectedGuests.length > 0) && (
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Assignment</h3>

                {selectedTable && (
                  <div className="mb-4">
                    <div className="text-sm text-slate-600 mb-1">Selected Table:</div>
                    <div className="font-medium text-slate-900 bg-slate-100 px-3 py-2 rounded">
                      Table {tables.find(t => t.id === selectedTable)?.tableNumber} (
                      {tables.find(t => t.id === selectedTable)?.guests.length}/
                      {tables.find(t => t.id === selectedTable)?.capacity} occupied)
                    </div>
                  </div>
                )}

                {selectedGuests.length > 0 && (
                  <div className="mb-4">
                    <div className="text-sm text-slate-600 mb-1">Selected Guests:</div>
                    <div className="font-medium text-slate-900 bg-slate-100 px-3 py-2 rounded">
                      {selectedGuests.length} guest{selectedGuests.length !== 1 ? "s" : ""} selected
                    </div>
                  </div>
                )}

            {selectedTable && selectedGuests.length > 0 && (
              <Button
                onClick={handleAssign}
                className="w-full"
                    disabled={selectedGuests.length === 0 || !selectedTable}
              >
                    Assign {selectedGuests.length} Guest{selectedGuests.length !== 1 ? "s" : ""} to Table
              </Button>
                )}
              </div>
            )}
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

