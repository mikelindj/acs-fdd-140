import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
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

    // Calculate VIP prices (20% markup)
    const tablePrice = Number(settings.tablePrice)
    const seatPrice = Number(settings.seatPrice)
    const tablePromoPrice = settings.tablePromoPrice ? Number(settings.tablePromoPrice) : null
    const seatPromoPrice = settings.seatPromoPrice ? Number(settings.seatPromoPrice) : null
    const tableMembersPrice = settings.tableMembersPrice ? Number(settings.tableMembersPrice) : null
    const seatMembersPrice = settings.seatMembersPrice ? Number(settings.seatMembersPrice) : null

    // VIP gets 20% markup
    const vipTablePrice = tablePrice * 1.2
    const vipSeatPrice = seatPrice * 1.2
    const vipTablePromoPrice = tablePromoPrice ? tablePromoPrice * 1.2 : null
    const vipSeatPromoPrice = seatPromoPrice ? seatPromoPrice * 1.2 : null
    const vipTableMembersPrice = tableMembersPrice ? tableMembersPrice * 1.2 : null
    const vipSeatMembersPrice = seatMembersPrice ? seatMembersPrice * 1.2 : null

    return NextResponse.json({
      table: {
        regular: {
          nonMember: tablePrice,
          member: tableMembersPrice,
        },
        promo: {
          nonMember: tablePromoPrice,
          member: tableMembersPrice, // Promo doesn't apply to members if they have members price
        },
        vip: {
          nonMember: vipTablePrice,
          member: vipTableMembersPrice,
        },
      },
      seat: {
        regular: {
          nonMember: seatPrice,
          member: seatMembersPrice,
        },
        promo: {
          nonMember: seatPromoPrice,
          member: seatMembersPrice, // Promo doesn't apply to members if they have members price
        },
        vip: {
          nonMember: vipSeatPrice,
          member: vipSeatMembersPrice,
        },
      },
    })
  } catch (error) {
    console.error("Error fetching public pricing:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
