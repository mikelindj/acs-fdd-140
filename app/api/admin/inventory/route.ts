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

    let settings = await prisma.inventorySettings.findUnique({
      where: { id: "inventory" },
    })

    if (!settings) {
      settings = await prisma.inventorySettings.create({
        data: {
          id: "inventory",
          totalTables: 0,
          maxElevenSeaterTables: 0,
          tablePrice: 1000,
          seatPrice: 100,
        },
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error fetching inventory settings:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      totalTables,
      maxElevenSeaterTables,
      tablePrice,
      seatPrice,
      tablePromoPrice,
      seatPromoPrice,
      tableMembersPrice,
      seatMembersPrice,
    } = body

    const settings = await prisma.inventorySettings.upsert({
      where: { id: "inventory" },
      update: {
        totalTables: totalTables ?? undefined,
        maxElevenSeaterTables: maxElevenSeaterTables ?? undefined,
        tablePrice: tablePrice ?? undefined,
        seatPrice: seatPrice ?? undefined,
        tablePromoPrice: tablePromoPrice ?? undefined,
        seatPromoPrice: seatPromoPrice ?? undefined,
        tableMembersPrice: tableMembersPrice ?? undefined,
        seatMembersPrice: seatMembersPrice ?? undefined,
      },
      create: {
        id: "inventory",
        totalTables: totalTables ?? 0,
        maxElevenSeaterTables: maxElevenSeaterTables ?? 0,
        tablePrice: tablePrice ?? 1000,
        seatPrice: seatPrice ?? 100,
        tablePromoPrice: tablePromoPrice ?? null,
        seatPromoPrice: seatPromoPrice ?? null,
        tableMembersPrice: tableMembersPrice ?? null,
        seatMembersPrice: seatMembersPrice ?? null,
      },
    })

    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error updating inventory settings:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
