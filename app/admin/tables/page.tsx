"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { assignTableToGuests } from "@/app/actions/table"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

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
}

export default function TablesPage() {
  const { toast } = useToast()
  const [tables, setTables] = useState<Table[]>([])
  const [unseatedGuests, setUnseatedGuests] = useState<Guest[]>([])
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [selectedGuests, setSelectedGuests] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

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

  useEffect(() => {
    fetchData()
  }, [fetchData])

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
          description: "Guests assigned successfully",
        })
        setSelectedTable(null)
        setSelectedGuests([])
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

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        {/* --- HEADER --- */}
        <header className="relative z-50 w-full bg-white bg-wavy-pattern border-b border-slate-100 shadow-sm">
          <div className="container max-w-6xl mx-auto px-4 h-32 md:h-40 flex items-center justify-between">
            <div className="flex items-center">
               {/* ACS 140 Logo (Big) */}
               <Link href="/">
                 <div className="relative h-24 md:h-32 w-auto transition-transform hover:scale-105 duration-300">
                   <Image 
                     src="/images/acs-140-logo.jpg" 
                     alt="ACS 140 Years" 
                     width={200}
                     height={128}
                     className="object-contain w-full h-full"
                     priority
                   />
                 </div>
               </Link>
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
                <p className="text-[0.5rem] text-slate-400 mt-2">This page designed and built by ACSOBA Volunteers: <a href="https://nofa.io" className="hover:text-white transition-colors">Michael Lin</a> and <a href="https://github.com/kennethch22" className="hover:text-white transition-colors">Kenneth Hendra</a></p>
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
             {/* ACS 140 Logo (Big) */}
             <Link href="/">
               <div className="relative h-24 md:h-32 w-auto transition-transform hover:scale-105 duration-300">
                 <Image 
                   src="/images/acs-140-logo.jpg" 
                   alt="ACS 140 Years" 
                   width={200}
                   height={128}
                   className="object-contain w-full h-full"
                   priority
                 />
               </div>
             </Link>
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
        <h2 className="text-3xl font-semibold tracking-tight text-slate-900 mb-8">Table Management</h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Tables</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {tables.map((table) => (
                  <div
                    key={table.id}
                    onClick={() => setSelectedTable(table.id)}
                    className={`rounded-lg border p-4 cursor-pointer transition-colors ${
                      selectedTable === table.id
                        ? "border-blue-600 bg-blue-50 ring-2 ring-blue-600"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="font-semibold text-lg text-slate-900">{table.tableNumber}</div>
                    <div className="text-sm text-slate-500">
                      {table.guests.length} / {table.capacity} guests
                    </div>
                    <div className="text-xs mt-2">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 font-semibold ${
                          table.status === "FULL"
                            ? "bg-green-100 text-green-800"
                            : table.status === "RESERVED"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-slate-100 text-slate-800"
                        }`}
                      >
                        {table.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="rounded-lg border border-slate-200 bg-white p-6 mb-4 shadow-sm">
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Unseated Guests</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {unseatedGuests.map((guest) => (
                  <div
                    key={guest.id}
                    onClick={() => {
                      if (selectedGuests.includes(guest.id)) {
                        setSelectedGuests(selectedGuests.filter((id) => id !== guest.id))
                      } else {
                        setSelectedGuests([...selectedGuests, guest.id])
                      }
                    }}
                    className={`rounded-lg border p-2 cursor-pointer transition-colors ${
                      selectedGuests.includes(guest.id)
                        ? "border-blue-600 bg-blue-50 ring-2 ring-blue-600"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="font-semibold text-slate-900">{guest.name}</div>
                    {guest.email && (
                      <div className="text-sm text-slate-500">{guest.email}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {selectedTable && selectedGuests.length > 0 && (
              <Button
                onClick={handleAssign}
                className="w-full"
              >
                Assign {selectedGuests.length} Guest(s) to Table
              </Button>
            )}
          </div>
        </div>
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
              <p className="text-[0.5rem] text-slate-400 mt-2">This page designed and built by ACSOBA Volunteers: <a href="https://nofa.io" className="hover:text-white transition-colors">Michael Lin</a> and <a href="https://github.com/kennethch22" className="hover:text-white transition-colors">Kenneth Hendra</a></p>
           </div>
        </div>
      </footer>
    </div>
  )
}

