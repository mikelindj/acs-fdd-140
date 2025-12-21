import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, type, category, quantity } = body

    if (!code) {
      return NextResponse.json({ error: "Code is required" }, { status: 400 })
    }

    const voucher = await prisma.voucher.findUnique({
      where: { code: code.toUpperCase().trim() },
    })

    if (!voucher) {
      return NextResponse.json({ error: "Invalid voucher code" }, { status: 404 })
    }

    if (!voucher.isActive) {
      return NextResponse.json({ error: "Voucher is not active" }, { status: 400 })
    }

    if (voucher.currentRedemptions >= voucher.maxRedemptions) {
      return NextResponse.json(
        { error: "Voucher has reached maximum redemptions" },
        { status: 400 }
      )
    }

    if (voucher.expiresAt && new Date() > voucher.expiresAt) {
      return NextResponse.json({ error: "Voucher has expired" }, { status: 400 })
    }

    // Calculate discount amount (will be calculated properly in booking action)
    return NextResponse.json({
      valid: true,
      voucher: {
        id: voucher.id,
        code: voucher.code,
        type: voucher.type,
        discountPercent: voucher.discountPercent,
        discountAmount: voucher.discountAmount,
        fixedPrice: voucher.fixedPrice,
      },
    })
  } catch (error) {
    console.error("Error validating voucher:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
