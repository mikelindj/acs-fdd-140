"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-slate-600">Loading...</div>
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
              <Link href="/admin/tables" className="text-sm font-medium text-slate-700 hover:text-slate-900">
                Tables
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
    </div>
  )
}

