import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

function generateVoucherCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let code = ""
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const vouchers = await prisma.voucher.findMany({
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(vouchers)
  } catch (error) {
    console.error("Error fetching vouchers:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      notes,
      type,
      discountPercent,
      discountAmount,
      fixedPrice,
      maxRedemptions,
      expiresAt,
      code: providedCode,
    } = body

    // Generate unique code
    let code = providedCode || generateVoucherCode()
    let attempts = 0
    while (attempts < 10) {
      const existing = await prisma.voucher.findUnique({
        where: { code },
      })
      if (!existing) break
      code = generateVoucherCode()
      attempts++
    }

    if (attempts >= 10) {
      return NextResponse.json(
        { error: "Failed to generate unique code" },
        { status: 500 }
      )
    }

    const voucher = await prisma.voucher.create({
      data: {
        code,
        name: name || null,
        notes: notes || null,
        type,
        discountPercent: discountPercent ? parseFloat(discountPercent) : null,
        discountAmount: discountAmount ? parseFloat(discountAmount) : null,
        fixedPrice: fixedPrice ? parseFloat(fixedPrice) : null,
        maxRedemptions: parseInt(maxRedemptions) || 1,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    })

    return NextResponse.json(voucher)
  } catch (error) {
    console.error("Error creating voucher:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
