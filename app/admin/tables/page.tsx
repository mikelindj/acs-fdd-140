"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { assignTableToGuests, updateTablePosition } from "@/app/actions/table"
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

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const res = await fetch("/api/admin/tables")
      const data = await res.json()
      setTables(data.tables || [])
      setUnseatedGuests(data.unseatedGuests || [])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
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
          description: "Guests assigned successfully",
        })
        setSelectedTable(null)
        setSelectedGuests([])
        fetchData()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign guests",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-blue-900 text-yellow-400 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">ACS FDD Admin</h1>
          <div className="space-x-4">
            <a href="/admin/dashboard" className="hover:underline">Dashboard</a>
            <a href="/admin/tables" className="hover:underline">Tables</a>
            <a href="/admin/broadcast" className="hover:underline">Broadcast</a>
            <Link href="/api/auth/signout" className="hover:underline">Logout</Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto p-8">
        <h2 className="text-3xl font-bold text-blue-900 mb-8">Table Management</h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-bold mb-4">Tables</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {tables.map((table) => (
                  <div
                    key={table.id}
                    onClick={() => setSelectedTable(table.id)}
                    className={`border-2 rounded-lg p-4 cursor-pointer ${
                      selectedTable === table.id
                        ? "border-blue-900 bg-blue-50"
                        : "border-gray-200"
                    }`}
                  >
                    <div className="font-bold text-lg">{table.tableNumber}</div>
                    <div className="text-sm text-gray-600">
                      {table.guests.length} / {table.capacity} guests
                    </div>
                    <div className="text-xs mt-2">
                      <span
                        className={`px-2 py-1 rounded ${
                          table.status === "FULL"
                            ? "bg-green-100 text-green-800"
                            : table.status === "RESERVED"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
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
            <div className="bg-white rounded-lg shadow p-6 mb-4">
              <h3 className="text-xl font-bold mb-4">Unseated Guests</h3>
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
                    className={`border rounded p-2 cursor-pointer ${
                      selectedGuests.includes(guest.id)
                        ? "border-blue-900 bg-blue-50"
                        : "border-gray-200"
                    }`}
                  >
                    <div className="font-semibold">{guest.name}</div>
                    {guest.email && (
                      <div className="text-sm text-gray-600">{guest.email}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {selectedTable && selectedGuests.length > 0 && (
              <Button
                onClick={handleAssign}
                className="w-full bg-blue-900 text-yellow-400 hover:bg-blue-800"
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

