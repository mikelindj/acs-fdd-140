import { NextRequest, NextResponse } from "next/server"
import { calculateTotal } from "@/lib/pricing"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { quantity, category, type, voucherCode, membershipValidated } = body

    if (!quantity || !category || !type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const pricing = await calculateTotal(
      parseInt(quantity),
      category,
      type,
      voucherCode || null,
      membershipValidated || false
    )

    return NextResponse.json(pricing)
  } catch (error) {
    console.error("Error calculating pricing:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
