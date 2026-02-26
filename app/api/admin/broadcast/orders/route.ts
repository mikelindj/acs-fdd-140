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
        overrideBuyerName: b.broadcastOverrideName ?? null,
        overrideBuyerEmail: b.broadcastOverrideEmail ?? null,
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
    const {
      bookingId,
      assignedTableNumbers,
      overrideBuyerName,
      overrideBuyerEmail,
    } = body as {
      bookingId: string
      assignedTableNumbers?: string[]
      overrideBuyerName?: string | null
      overrideBuyerEmail?: string | null
    }
    if (!bookingId) {
      return NextResponse.json({ error: "bookingId required" }, { status: 400 })
    }

    const data: { assignedTableNumbers?: string[]; broadcastOverrideName?: string | null; broadcastOverrideEmail?: string | null } = {}
    if (Array.isArray(assignedTableNumbers)) data.assignedTableNumbers = assignedTableNumbers
    if (overrideBuyerName !== undefined) data.broadcastOverrideName = overrideBuyerName || null
    if (overrideBuyerEmail !== undefined) data.broadcastOverrideEmail = overrideBuyerEmail || null
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No updatable fields provided" }, { status: 400 })
    }

    await prisma.booking.update({
      where: { id: bookingId },
      data,
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
