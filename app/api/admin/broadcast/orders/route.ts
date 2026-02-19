import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const bookings = await prisma.booking.findMany({
      where: { status: "PAID" },
      orderBy: { createdAt: "desc" },
      include: {
        buyer: { select: { name: true, email: true } },
      },
    })

    const orders = bookings.map((b) => {
      const raw = b.assignedTableNumbers as string[] | null
      const assignedTableNumbers = Array.isArray(raw) ? raw : []
      return {
        id: b.id,
        type: b.type,
        quantity: b.quantity,
        buyerName: b.buyer.name,
        buyerEmail: b.buyer.email ?? null,
        assignedTableNumbers,
      }
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error("Error fetching broadcast orders:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { bookingId, assignedTableNumbers } = body as {
      bookingId: string
      assignedTableNumbers: string[]
    }
    if (!bookingId || !Array.isArray(assignedTableNumbers)) {
      return NextResponse.json(
        { error: "bookingId and assignedTableNumbers (array) required" },
        { status: 400 }
      )
    }

    await prisma.booking.update({
      where: { id: bookingId },
      data: { assignedTableNumbers },
    })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Error updating table assignments:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
