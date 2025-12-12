"use server"

import { prisma } from "@/lib/prisma"
import { tableAssignmentSchema } from "@/lib/validations"
import { z } from "zod"

export async function assignTableToGuests(data: z.infer<typeof tableAssignmentSchema>) {
  try {
    const validated = tableAssignmentSchema.parse(data)

    const table = await prisma.table.findUnique({
      where: { id: validated.tableId },
      include: { guests: true },
    })

    if (!table) {
      return { error: "Table not found" }
    }

    const currentGuestCount = table.guests.length
    const newGuestCount = validated.guestIds.length

    if (currentGuestCount + newGuestCount > table.capacity) {
      return { error: `Table can only seat ${table.capacity} guests` }
    }

    // Update guests' table assignments
    await prisma.guest.updateMany({
      where: { id: { in: validated.guestIds } },
      data: { tableId: validated.tableId },
    })

    // Update table status
    const updatedTable = await prisma.table.findUnique({
      where: { id: validated.tableId },
      include: { guests: true },
    })

    const newStatus = updatedTable!.guests.length >= updatedTable!.capacity ? 'FULL' : 'RESERVED'

    await prisma.table.update({
      where: { id: validated.tableId },
      data: { status: newStatus },
    })

    return { success: true }
  } catch (error) {
    console.error('Table assignment error:', error)
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message }
    }
    return { error: "Failed to assign table" }
  }
}

export async function updateTablePosition(tableId: string, x: number, y: number) {
  try {
    await prisma.table.update({
      where: { id: tableId },
      data: { x, y },
    })
    return { success: true }
  } catch (error) {
    console.error('Table position update error:', error)
    return { error: "Failed to update table position" }
  }
}

